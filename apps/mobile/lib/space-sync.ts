/**
 * B3 space-sync: push store snapshot to ObjectNode server + hydrate stores from server.
 *
 * Push path: notifySync() → dispatchDocChange('*') → registerPull('*') → scheduleSyncPush()
 *            → debounced pushSpaceSnapshot() → updateObjectIndex + parallel objdoc pushes.
 *
 * Hydrate path: providers.tsx calls hydrateFromSpace() after initSync() at boot.
 *               readObjectTree → parallel objdoc pulls → set stores (no notifySync triggered).
 */

import {
  updateObjectIndex,
  readObjectTree,
  getNodeAccess,
  objDocPush,
  objDocPull,
  objInvPull,
  stableStringify,
  collectionNodeId,
  isCollectionNodeId,
  buildCollectionDoc,
  buildSingletonDoc,
  readSingletonEntity,
  mergeSingletonDoc,
  mergeCollectionDoc,
  asCollectionDoc,
  type CollectionDoc,
  type CollectionState,
  type CollectionEntity,
  FIANCE_TYPES,
  weddingToNode, weddingFromDoc,
  guestGroupFromDoc,
  guestFromDoc,
  tableFromDoc,
  vendorFromDoc,
  quotePricingFromDoc,
  vendorPaymentFromDoc,
  accommodationFromDoc,
  giftFromDoc,
  invitationTypeFromDoc,
  communicationFromDoc,
  weddingRoleFromDoc,
  weddingRoleAssignmentFromDoc,
  seatingConstraintFromDoc,
  weddingEventFromDoc,
  guestMealSelectionFromDoc,
  communicationTemplateFromDoc,
  documentFromDoc,
  legalMilestoneFromDoc,
  honeymoonPlanFromDoc,
  ceremonyItemFromDoc,
  speechFromDoc,
  playlistTrackFromDoc,
  permissionRoleFromDoc,
  permissionAssignmentFromDoc,
  taskCategoryFromDoc,
  taskFromDoc,
  agendaEventFromDoc,
  dayOfItemFromDoc,
  ideaCollectionFromDoc,
  ideaFromDoc,
  type Session,
  type ObjectNode,
  type NodeDescriptor,
  // MODIFICATION LOCALE — pour neutraliser les caches avant une poussée (D3).
  clearNodeAccessCache,
  getSpaceAccessEntry,
  getSpacesConfig,
  getSyncNamespace,
} from '@fiance/sdk';
import { StarfishHttpError } from '@drakkar.software/starfish-client';
import { useWeddingStore } from '@/store/useWeddingStore';
import { useWeddingRegistryStore } from '@/store/useWeddingRegistryStore';
import { useSyncAccessStore } from '@/store/useSyncAccessStore';
import { useSyncPendingStore } from '@/store/useSyncPendingStore';
import { useGuestsStore } from '@/store/useGuestsStore';
import { useVendorsStore } from '@/store/useVendorsStore';
import { usePlanningStore } from '@/store/usePlanningStore';
import { useIdeasStore } from '@/store/useIdeasStore';
import { useAccommodationsStore } from '@/store/useAccommodationsStore';
import { useGiftsStore } from '@/store/useGiftsStore';
import { useInvitationTypesStore } from '@/store/useInvitationTypesStore';
import { useCommunicationsStore } from '@/store/useCommunicationsStore';
import { useWeddingPartyStore } from '@/store/useWeddingPartyStore';
import { useSeatingConstraintsStore } from '@/store/useSeatingConstraintsStore';
import { useWeddingEventsStore } from '@/store/useWeddingEventsStore';
import { useMealSelectionsStore } from '@/store/useMealSelectionsStore';
import { useCommunicationTemplatesStore } from '@/store/useCommunicationTemplatesStore';
import { useDocumentsStore } from '@/store/useDocumentsStore';
import { useLegalStore } from '@/store/useLegalStore';
import { useHoneymoonStore } from '@/store/useHoneymoonStore';
import { useCeremonyStore } from '@/store/useCeremonyStore';
import { useSpeechesMusicStore } from '@/store/useSpeechesMusicStore';
import { usePermissionsStore } from '@/store/usePermissionsStore';
import { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from '@/lib/starfish';
// MODIFICATION LOCALE — un document par FOYER, plus une soumission par invité.
import { applyHouseholdRsvpDocs, type HouseholdRsvpDoc } from '@/lib/rsvp-sync';
import { withIndexLock } from '@/lib/index-lock';
// MODIFICATION LOCALE — le KV local, seul état de ce fichier qui survive au
// départ de la page (voir « la demande de poussée survit au départ » plus bas).
import { readCollection, writeCollection } from '@/lib/kv-storage';
// MODIFICATION LOCALE — l'instantané local est réécrit par l'hydratation.
import type { SQLiteStorage } from 'expo-sqlite/kv-store';
import { getStorage } from '@/lib/kv-storage';
import {
  persistWedding,
  persistGroups,
  persistGuests,
  persistTables,
  persistHouseholds,
  persistVendors,
  persistQuotePricings,
  persistVendorPayments,
  persistAccommodations,
  persistGifts,
  persistInvitationTypes,
  persistCommunications,
  persistWeddingRoles,
  persistWeddingRoleAssignments,
  persistSeatingConstraints,
  persistWeddingEvents,
  persistMealSelections,
  persistCommunicationTemplates,
  persistDocuments,
  persistLegalMilestones,
  persistHoneymoonPlans,
  persistTaskCategories,
  persistTasks,
  persistAgendaEvents,
  persistDayOfItems,
  persistIdeaCollections,
  persistIdeas,
  persistCeremonyItems,
  persistSpeeches,
  persistPlaylistTracks,
  persistPermissionRoles,
  persistPermissionAssignments,
} from '@/lib/persistence';

// ---------------------------------------------------------------------------
// Debounced push scheduler
// ---------------------------------------------------------------------------

let _pushTimer: ReturnType<typeof setTimeout> | null = null;
let _isHydrating = false;
/** True for the duration of an in-flight pushSpaceSnapshot network call (from just after
 *  _pushTimer is cleared until the push settles). Without this, refreshFromSpaceIfIdle's
 *  "no push pending" check goes false the instant the debounce timer fires — while the
 *  push is still awaiting the network — letting a concurrent hydrate reseed _collectionState
 *  from the pre-push server doc and drop an entity the in-flight push is about to persist,
 *  which then reads as a delete and gets durably tombstoned on the next push. */
let _pushing = false;
/** True for the duration of an in-flight refreshRsvpInbox pull. refreshFromSpaceIfIdle
 *  must not start a concurrent hydrate while this is set — both write into the guest
 *  store, and now that both the SSE stream (providers.tsx) and the foreground handler
 *  can trigger a hydrate independently (not just the foreground handler's own
 *  await-then-refreshRsvpInbox sequencing), an interleaved hydrate can reseed the guest
 *  store from a pre-submission server doc and drop/tombstone a guest an in-flight RSVP
 *  apply is about to write — mirrors the _pushing guard's rationale above. */
let _rsvpRefreshing = false;

// ─── MODIFICATION LOCALE — durabilité des écritures ──────────────────────────
//
// Deux gardes de ce fichier écartent une demande de poussée quand une hydratation
// est en cours (`scheduleSyncPush`, et la re-vérification dans son minuteur). Leur
// intention est juste — ne pas laisser une poussée écraser ce qu'on vient de lire —
// mais aucune ne REPRENAIT la demande écartée, et `hydrateFromSpace` remplace
// ensuite les magasins. Une modification saisie pendant une hydratation était donc
// d'abord privée de poussée, puis effacée. Sans erreur, sans trace : la poussée
// n'était même pas tentée.
//
// La fenêtre ne demande ni second onglet ni second appareil. Le flux SSE déclenche
// `refreshFromSpaceIfIdle()` sur TOUT changement de l'espace, y compris l'écho de
// notre propre poussée : **une poussée réussie ouvre la fenêtre qui avale la
// suivante.** C'est ainsi qu'un foyer constitué le 21 août 2026 n'est jamais arrivé
// au serveur, quelques minutes après un autre qui, lui, était passé.
//
// Deux pièces le corrigent, et elles ne s'additionnent pas — l'une conditionne
// l'autre :
//
//   1. L'ÉPOQUE. Toute mutation de l'application passe par `scheduleSyncPush`
//      (`notifySync()` → `registerPull('*')`, 121 appelants). L'incrémenter ici
//      suffit donc à dater toute modification locale, sans instrumenter les trente
//      magasins. `hydrateFromSpace` retient l'époque à son début et la relit avant
//      d'appliquer : si elle a bougé, l'état lu est JETÉ. Abandonner plutôt que
//      fusionner, parce qu'une modification locale n'a pas encore de `rev` — il ne
//      lui est attribué qu'à la construction du document de poussée — et qu'un
//      arbitrage inventé à côté de `mergeCollectionDoc` serait une seconde règle
//      pour un cas rare. Le prix d'un abandon est une relecture, rien de plus.
//
//   2. LA REPRISE. La demande écartée est retenue et rejouée à la fin de
//      l'hydratation. Seule, elle ne corrigerait RIEN : les magasins auraient déjà
//      été remplacés, et l'on renverrait au serveur ce qu'il vient d'envoyer. Elle
//      n'est correcte que parce que (1) garantit que le magasin porte encore la
//      modification.
/** Incrémenté par CHAQUE appel à `scheduleSyncPush`, donc par chaque mutation. */
let _localEditEpoch = 0;
/** Une demande de poussée a été écartée pendant une hydratation et reste à rejouer. */
let _pushDeferred = false;
/** Whether the last hydrate actually applied what it read (false when abandoned). */
let _lastHydrateApplied = false;

/**
 * Dirty-push tracking for the wedding singleton node: node id → stableStringify() of the
 * content last successfully pushed (or hydrated). Only the `wedding` node flows through
 * this now — all other content lives in the per-collection docs below.
 */
const _lastPushedJson = new Map<string, string>();

// ── Per-collection ("one doc per collection") sync state ──
// Content is one objdoc per collection (see @fiance/sdk collection-doc): an id-keyed map
// of entities with per-entity rev (LWW) and durable tombstones. Deletes ride inside the
// doc as tombstones, so no separate per-entity index-deletion bookkeeping is needed.

/** sentinel node id (`col:{type}:{weddingNodeId}`) → stableStringify() of the collection
 *  doc last pushed, so an unchanged collection is skipped on the next debounced push. */
const _lastPushedCollectionJson = new Map<string, string>();

/** entity type → per-entity `rev`/`tombstones` carried between pushes/hydrates. Seeded from
 *  the pulled collection doc on hydrate; advanced on each successful collection push. */
const _collectionState = new Map<string, CollectionState>();

/** entity id → stableStringify() of the entity last folded into a collection doc — the
 *  dirty check that decides whether a given entity's `rev` should be bumped. */
const _collectionEntityJson = new Map<string, string>();

/** Set by the last hydrateFromSpace when the space still contained legacy per-entity nodes
 *  (i.e. a pre-collection wedding). providers.tsx reads it on OWNER boot to run the one-shot
 *  migration push (which folds the legacy entities into collection docs and prunes the old
 *  nodes from the index). Owner-only; members never mutate the shared index. */
let _lastHydrateSawLegacy = false;

/** True when the last hydrate saw legacy per-entity nodes needing migration (owner-only). */
export function hydrateSawLegacyNodes(): boolean {
  return _lastHydrateSawLegacy;
}

/** Whether the current device joined this wedding as a member (vs. the owner who created it).
 *  `role` lives on the active `WeddingRegistryEntry` (local device/registry metadata) —
 *  NOT on `useWeddingStore`'s `wedding`, which is the synced domain object (partner names,
 *  date, venue, ...) and has no `role` field. Reading `useWeddingStore().wedding?.role` here
 *  is always `undefined`, silently defeating any owner-only gate — this is what made a prior
 *  fix attempt (gating `pullAndApplyRsvpNodes` below) a no-op in production. */
function isActiveDeviceMember(): boolean {
  const registry = useWeddingRegistryStore.getState().registry;
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  return active?.role === 'member';
}

/** Domain node types managed wholesale by pushSpaceSnapshot — excludes the guest-surface
 *  synthetic nodes (publicPage, rsvp) which are written by other code paths and must
 *  survive a snapshot push untouched. */
const MANAGED_TYPES = new Set<string>(
  Object.values(FIANCE_TYPES).filter((t) => t !== FIANCE_TYPES.publicPage && t !== FIANCE_TYPES.rsvp),
);

// ─── MODIFICATION LOCALE — la demande de poussée survit au départ de la page ──
//
// Tout ce qui protège une saisie dans ce fichier est une variable de MODULE :
// l'époque, la demande différée, le minuteur d'anti-rebond, les références de
// poussée. Un rechargement de page les remet toutes à zéro. La poussée étant
// débouncée à 2 s, une saisie suivie d'un rechargement immédiat n'est donc ni
// partie, ni protégée : l'hydratation du démarrage suivant applique l'état du
// serveur, plus ancien, et la saisie disparaît sans le moindre signal.
// Reproduit en production le 21 août 2026 (« Lilou » → « Liloux »).
//
// Accrocher un vidage à `pagehide` ne suffirait PAS : une poussée est un
// aller-retour réseau, et rien ne garantit qu'il aboutisse pendant que la page
// s'en va. Ce vidage existe (providers.tsx), mais comme raccourci opportuniste.
//
// LA GARANTIE EST ICI : la demande est rendue durable au moment de la MUTATION,
// dans le KV — le seul état qui survive au rechargement. Le démarrage suivant
// la relit et pousse avant de laisser quoi que ce soit recouvrir les données
// locales.
//
// La clé est nue : `writeCollection` la préfixe par le mariage actif, donc le
// marqueur est automatiquement cloisonné par mariage.
const CLÉ_POUSSÉE_EN_ATTENTE = 'sync.pousseeEnAttente';

/** Note qu'une modification locale n'a pas encore atteint le serveur. */
function noterPousséeEnAttente(): void {
  // Entre deux mariages le KV est fermé et l'écriture ne porte que sur son cache
  // mémoire, sans erreur. Rien à rattraper ici : la mutation suivante repose le
  // marqueur dans le bon espace de noms.
  try { writeCollection(CLÉ_POUSSÉE_EN_ATTENTE, true); } catch { /* KV indisponible */ }
}

/** Efface la note : tout ce qui devait partir est arrivé. */
function effacerPousséeEnAttente(): void {
  try { writeCollection(CLÉ_POUSSÉE_EN_ATTENTE, false); } catch { /* KV indisponible */ }
}

/** Vrai si une modification locale attendait d'être poussée quand la page s'est
 *  arrêtée. Lu au démarrage. Un marqueur absent — première exécution après
 *  déploiement, ou version antérieure — rend `false` : l'appareil se comporte
 *  alors exactement comme avant. */
export function pousséeEnAttenteAuDémarrage(): boolean {
  try { return readCollection<boolean>(CLÉ_POUSSÉE_EN_ATTENTE) === true; } catch { return false; }
}

// ─── MODIFICATION LOCALE — les versions que CET appareil a poussées ───────────
//
// À ne pas confondre avec `_collectionState`, qui porte lui aussi des `rev` :
// celui-là est réamorcé DEPUIS LE SERVEUR à chaque hydratation, donc il dit ce
// que le serveur détient. Cette table-ci dit ce que cet appareil a écrit, elle
// n'est alimentée que par une poussée réussie, et elle est DURABLE.
//
// Elle sert deux invariants qui n'en font qu'un :
//   – à la LECTURE, écarter une version antérieure à ce qu'on a poussé (une
//     réponse tardive, un cache, une lecture partie avant notre écriture) ;
//   – à l'ÉCRITURE, réamorcer `_collectionState` au démarrage, sans quoi
//     `buildCollectionDoc` réestampille TOUT et bat les `rev` de tous les pairs.
//
// Le magasin persisté ne peut pas la remplacer : il ne porte que des entités
// nues, sans aucun `rev`.
const CLÉ_VERSIONS_POUSSÉES = 'sync.versionsPoussees';

/** type de collection → { id d'entité → version poussée }. */
const _revPoussées = new Map<string, Record<string, number>>();
let _revPousséesChargées = false;

function chargerRevPoussées(): void {
  if (_revPousséesChargées) return;
  _revPousséesChargées = true;
  try {
    const lu = readCollection<Record<string, Record<string, number>>>(CLÉ_VERSIONS_POUSSÉES);
    if (lu) for (const [type, rev] of Object.entries(lu)) _revPoussées.set(type, rev);
  } catch { /* KV indisponible : on repart d'une table vide, comme avant */ }
}

/** Les versions poussées pour un type, ou un objet vide. */
function revPousséesPour(type: string): Record<string, number> {
  chargerRevPoussées();
  return _revPoussées.get(type) ?? {};
}

/** Note les versions qu'une poussée réussie vient de porter au serveur. */
function noterVersionsPoussées(type: string, rev: Record<string, number>): void {
  chargerRevPoussées();
  _revPoussées.set(type, { ...rev });
  try {
    writeCollection(CLÉ_VERSIONS_POUSSÉES, Object.fromEntries(_revPoussées));
  } catch { /* KV indisponible */ }
}

// ─── MODIFICATION LOCALE — le suivi de ce qui reste à pousser est durable ─────
//
// Amorcer les `rev` poussés ne suffit PAS : `buildCollectionDoc` réestampille
// une entité si son `rev` est inconnu OU si elle figure dans `changedIds`, et
// `changedIds` se calcule contre `_collectionEntityJson`, vide au démarrage.
// Toutes les entités y figurent, et la réestampille a lieu quand même.
//
// Au fond, au démarrage l'appareil ne sait pas ce qui a changé depuis sa
// dernière poussée. « Rien n'a changé » perdrait la modification en attente ;
// « tout a changé » — ce qu'il fait aujourd'hui — bat les `rev` de tous les
// pairs. Il n'y a pas de troisième voie sans persister ce qu'on a poussé.
//
// On persiste donc le document tel qu'il est parti, un par collection, et on en
// reconstruit au démarrage les trois tables. C'est exactement ce que
// `_lastPushedCollectionJson` détient déjà en mémoire : le rendre durable ne
// change pas sa sémantique, il rend le rechargement INVISIBLE au suivi.
const CLÉ_DERNIÈRES_POUSSÉES = 'sync.dernieresPousseesParCollection';

let _référencesAmorcées = false;

// ─── … et cette référence-là est PAR FENÊTRE ─────────────────────────────────
//
// Elle répond à la question « qu'ai-je poussé, MOI ? », et c'est ce point de vue
// qui distingue les deux seules situations que le démarrage ne savait pas
// séparer :
//
//   – une saisie faite ici et jamais poussée  → à pousser ;
//   – la saisie d'un pair, pas encore relue   → à laisser.
//
// Partagée entre fenêtres (stockage local), la référence dit « le document
// contient Liloux » — et une fenêtre restée sur « Lilou » en conclut, de son
// point de vue légitimement, qu'on a modifié g1 ici. Elle réestampille, et
// écrase le travail de l'autre. Par fenêtre, elle dit « MOI j'ai poussé Lilou »,
// l'entité apparaît inchangée, garde son ancienne version, et perd la fusion
// face au pair — ce qui est exactement le résultat voulu.
//
// `sessionStorage` est par onglet ET survit au rechargement : les deux
// propriétés dont on a besoin. Ce qu'il ne survit pas — la fermeture de
// l'onglet — reste couvert par le marqueur durable, lui partagé et en stockage
// local : on ne perd donc jamais une saisie, au pire on la repousse.
//
// Sur natif il n'existe pas, et il n'y a pas non plus de seconde fenêtre : le
// repli en mémoire suffit, et un redémarrage de l'app y vaut fermeture.
const _référencesEnMémoire = new Map<string, string>();

function magasinParFenêtre(): { get(k: string): string | null; set(k: string, v: string): void } {
  try {
    const ss = (globalThis as { sessionStorage?: Storage }).sessionStorage;
    if (ss) return { get: (k) => ss.getItem(k), set: (k, v) => ss.setItem(k, v) };
  } catch { /* accès refusé (navigation privée) : repli en mémoire */ }
  return {
    get: (k) => _référencesEnMémoire.get(k) ?? null,
    set: (k, v) => { _référencesEnMémoire.set(k, v); },
  };
}

function persisterDernièresPoussées(): void {
  try {
    magasinParFenêtre().set(CLÉ_DERNIÈRES_POUSSÉES, JSON.stringify(Object.fromEntries(_lastPushedCollectionJson)));
  } catch { /* quota, ou stockage indisponible */ }
}

/**
 * Reconstruit, au démarrage, le suivi de ce qui reste à pousser.
 *
 * Idempotente, et sans effet si l'état en mémoire est déjà garni : une
 * hydratation qui a réamorcé depuis le serveur fait autorité, elle est plus
 * fraîche que ce qu'on a poussé.
 */
export function amorcerRéférencesDePoussée(): void {
  if (_référencesAmorcées) return;
  _référencesAmorcées = true;
  let lu: Record<string, string> | null = null;
  try {
    const brut = magasinParFenêtre().get(CLÉ_DERNIÈRES_POUSSÉES);
    lu = brut ? (JSON.parse(brut) as Record<string, string>) : null;
  } catch { return; }
  if (!lu) return;

  const itemsParType = new Map(collectionSources().map((src) => [src.type, src.items]));
  for (const [nodeId, json] of Object.entries(lu)) {
    if (_lastPushedCollectionJson.has(nodeId)) continue; // déjà garni, plus frais
    const type = nodeId.split(':')[1];
    if (!type) continue;
    let doc: CollectionDoc;
    try { doc = JSON.parse(json) as CollectionDoc; } catch { continue; }
    if (!doc || typeof doc !== 'object' || !doc.items) continue;

    _lastPushedCollectionJson.set(nodeId, json);
    for (const [id, e] of Object.entries(doc.items)) {
      _collectionEntityJson.set(id, stableStringify(e as Record<string, unknown>));
    }

    // GARDE — un magasin local VIDE alors que le document poussé portait des
    // entités est la signature d'un magasin qui n'a pas fini de charger, pas
    // d'une suppression en masse. Restaurer les `rev` dans ce cas ferait
    // tombstoner toute la collection à la poussée suivante — une perte de
    // données provoquée par le correctif lui-même. On restaure alors les
    // pierres tombales seules : la suppression réelle, si c'en est une, partira
    // après l'hydratation, qui aura confirmé l'état.
    const locaux = itemsParType.get(type) ?? [];
    const magasinSuspect = locaux.length === 0 && Object.keys(doc.items).length > 0;
    _collectionState.set(type, {
      rev: magasinSuspect ? {} : { ...doc.rev },
      tombstones: { ...doc.tombstones },
    });
  }
}

/**
 * Fait partir tout de suite la poussée que le débouncement retenait.
 *
 * RACCOURCI OPPORTUNISTE, jamais une garantie — et c'est important de ne pas
 * s'y tromper : une poussée est un aller-retour réseau, et rien ne garantit
 * qu'il aboutisse pendant que la page s'en va. Ce que ce vidage apporte, c'est
 * de transformer le cas courant (l'utilisateur recharge) en aller-retour
 * réussi, plutôt qu'en rattrapage au démarrage suivant. La GARANTIE, elle, est
 * le marqueur durable et `rejouerPousséeEnAttente`.
 *
 * Ne retient pas la page : ne rend rien à attendre, et ne bloque pas.
 */
export function viderPousséeEnAttente(): void {
  if (!_pushTimer) return;
  clearTimeout(_pushTimer);
  _pushTimer = null;
  void exécuterPoussée();
}

/**
 * Rejoue, au démarrage, la poussée que le départ de la page a interrompue.
 *
 * À appeler AVANT toute hydratation : la modification est toujours dans les
 * magasins persistés, mais l'hydratation applique l'état du serveur — antérieur
 * à elle — et l'effacerait.
 *
 * La logique vit ici, et non dans le composant qui l'appelle, pour deux
 * raisons : c'est de la politique de synchronisation, et c'est le seul endroit
 * où elle est vérifiable sans monter tout l'arbre React.
 *
 * Ne rejette jamais : un rattrapage qui échoue laisse le marqueur en place
 * (il n'est effacé qu'au succès), donc le démarrage suivant réessaiera, et le
 * réessai ordinaire s'en charge d'ici là.
 */
export async function rejouerPousséeEnAttente(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<boolean> {
  if (!pousséeEnAttenteAuDémarrage()) return false;
  try {
    return await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  } catch (err) {
    console.warn('[space-sync] rattrapage de la poussée en attente échoué:', err);
    return false;
  }
}



/** Called from registerPull('*') in providers.tsx after initSync(). Debounced 2s. */
export function scheduleSyncPush(): void {
  // MODIFICATION LOCALE — avant toute garde : c'est le passage obligé de toute
  // mutation de l'application, donc le seul endroit où dater une modification
  // locale une bonne fois. Incrémenter APRÈS le `return` ci-dessous laisserait
  // invisible exactement la modification qu'on cherche à protéger.
  _localEditEpoch++;
  // Avant les gardes, pour la même raison que l'époque : trois chemins de sortie
  // écartent une demande plus bas, et aucun ne doit pouvoir la faire oublier.
  noterPousséeEnAttente();
  if (_isHydrating) { _pushDeferred = true; return; }
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => {
    _pushTimer = null;
    void exécuterPoussée();
  }, 2000);
}

// ─── MODIFICATION LOCALE — le réessai ────────────────────────────────────────
//
// Une poussée échouée n'était jamais retentée : `_lastPushedCollectionJson`
// n'était pas mis à jour, donc la collection restait sale — mais rien ne repartait
// avant la MUTATION SUIVANTE. Une saisie faite juste avant une coupure de réseau
// attendait donc qu'on tape autre chose, indéfiniment.
const PUSH_RETRY_BASE_MS = 5_000;
const PUSH_RETRY_MAX_MS = 5 * 60_000;
/** Nombre d'échecs consécutifs avant de le DIRE. En deçà, un hoquet de réseau
 *  rattrapé au coup suivant ne doit rien afficher : un signalement qui clignote
 *  à chaque hoquet apprend à être ignoré. */
const PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL = 3;

let _pushRetryTimer: ReturnType<typeof setTimeout> | null = null;
let _pushRetryAttempt = 0;
/** Une poussée du dernier instantané a été refusée faute de droit d'écriture. */
let _lastPushWriteDenied = false;

/** Exécute la poussée. Partagée par le minuteur d'anti-rebond et par le réessai. */
async function exécuterPoussée(): Promise<void> {
  // re-check: hydration may have started after this timer was queued
  if (_isHydrating) { _pushDeferred = true; return; }
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return;
  _pushing = true;
  let toutEstPassé = false;
  try {
    toutEstPassé = await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  } catch (err) {
    console.warn('[space-sync] push failed:', err);
  } finally {
    _pushing = false;
  }
  if (toutEstPassé) { pousséeRéussie(); return; }
  // Un mur ne se franchit pas en le heurtant plus souvent.
  if (_lastPushWriteDenied) return;
  planifierRéessaiDePoussée();
}

function pousséeRéussie(): void {
  _pushRetryAttempt = 0;
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  useSyncPendingStore.getState().setUnsavedChanges(false);
}

function planifierRéessaiDePoussée(): void {
  _pushRetryAttempt++;
  if (_pushRetryAttempt >= PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL) {
    useSyncPendingStore.getState().setUnsavedChanges(true);
  }
  const délai = Math.min(
    PUSH_RETRY_BASE_MS * 2 ** (_pushRetryAttempt - 1),
    PUSH_RETRY_MAX_MS,
  );
  if (_pushRetryTimer) clearTimeout(_pushRetryTimer);
  _pushRetryTimer = setTimeout(() => {
    _pushRetryTimer = null;
    void exécuterPoussée();
  }, délai);
}

/**
 * Cancel any pending debounced push and block future scheduling.
 * Call before a legacy import so a stale timer cannot overwrite freshly pushed nodes.
 * Pair with restoreSyncPush() in a finally block.
 */
export function suppressSyncPush(): void {
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
  _isHydrating = true;
  // MODIFICATION LOCALE — la suppression est un abandon DÉLIBÉRÉ : elle ne doit
  // rien laisser à rejouer. L'import qui l'emploie pousse explicitement ensuite.
  _pushDeferred = false;
  // La note durable suit le même sort que la demande en mémoire : un abandon
  // délibéré ne doit rien laisser à rejouer au démarrage suivant.
  effacerPousséeEnAttente();
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  _pushRetryAttempt = 0;
}

/** Re-enable push scheduling after a legacy import. */
export function restoreSyncPush(): void {
  _isHydrating = false;
}

/** Clears the dirty-push baselines and collection state. hydrateFromSpace already reseeds
 *  these correctly in production (cold boot / wedding switch); exported so tests can isolate
 *  consecutive pushSpaceSnapshot calls from each other's state. */
export function resetDirtyPushBaseline(): void {
  _lastPushedJson.clear();
  _lastPushedCollectionJson.clear();
  _collectionState.clear();
  _collectionEntityJson.clear();
  // La table des versions poussées appartient au mariage qu'on quitte. Le KV
  // étant préfixé par mariage, la vider ici suffit : la relecture paresseuse
  // ira chercher celle du mariage entrant.
  _revPoussées.clear();
  _revPousséesChargées = false;
  _référencesAmorcées = false;
  _référencesEnMémoire.clear();
  _lastHydrateSawLegacy = false;
  // MODIFICATION LOCALE — l'arriéré de réessai appartient au mariage qu'on quitte.
  // Le laisser courir ferait retenter la poussée d'un instantané qui n'a plus cours,
  // et laisserait le signalement allumé sur un mariage qui n'a rien en souffrance.
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  _pushRetryAttempt = 0;
  _pushDeferred = false;
  _lastPushWriteDenied = false;
  // L'arriéré appartient au mariage qu'on quitte, la note durable aussi.
  effacerPousséeEnAttente();
  useSyncPendingStore.getState().setUnsavedChanges(false);
}

// ---------------------------------------------------------------------------
// Build the wedding singleton node from current store state
// ---------------------------------------------------------------------------

/** Sync-model marker stamped on the wedding root `meta`: 2 = per-collection docs. */
export const SYNC_SCHEMA_VERSION = 2;

function descriptorToNode(desc: NodeDescriptor, order: number, now: number): ObjectNode {
  return {
    id: desc.id,
    type: desc.type,
    parentId: desc.parentId,
    order,
    title: desc.title,
    updatedAt: now,
    contentKind: desc.contentKind,
    access: desc.access,
    enc: desc.enc,
    meta: desc.meta,
  };
}

/** The `wedding` root stays its own per-node doc (not collapsed) — `discoverOwnerWeddingRoot`
 *  relies on a `wedding`/`parentId:null` node existing. Stamps `syncSchemaVersion` on its meta.
 *  Also builds its 1-item CollectionDoc (see buildSingletonDoc) so it can be pushed through
 *  mergeCollectionDoc's per-entity rev LWW instead of a whole-object clobber — see the
 *  "Close the wedding-singleton lost-update hole" plan. */
function buildWeddingNode(
  weddingNodeId: string,
  now: number,
): { node: ObjectNode; content: Record<string, unknown>; doc: CollectionDoc } | null {
  const { wedding } = useWeddingStore.getState();
  if (!wedding) return null;
  const desc = weddingToNode(wedding, weddingNodeId);
  const node = descriptorToNode(
    { ...desc, meta: { ...desc.meta, syncSchemaVersion: SYNC_SCHEMA_VERSION } },
    0,
    now,
  );
  const content = wedding as unknown as Record<string, unknown>;
  const { doc } = buildSingletonDoc(weddingNodeId, content, now);
  return { node, content, doc };
}


// ---------------------------------------------------------------------------
// Build per-collection docs from current store state (Release 1 dual-write)
// ---------------------------------------------------------------------------

/** The 28 collapsing admin collections (everything except the `wedding` singleton root and
 *  the guest-surface publicPage/rsvp invite nodes). `wedding` stays its own per-node doc. */
function collectionSources(): { type: string; items: CollectionEntity[] }[] {
  const { guests, tables, groups } = useGuestsStore.getState();
  const { vendors, quotePricings, vendorPayments } = useVendorsStore.getState();
  const { accommodations } = useAccommodationsStore.getState();
  const { categories, tasks, agendaEvents, dayOfItems } = usePlanningStore.getState();
  const { collections, ideas } = useIdeasStore.getState();
  const { gifts } = useGiftsStore.getState();
  const { invitationTypes } = useInvitationTypesStore.getState();
  const { communications } = useCommunicationsStore.getState();
  const { weddingRoles, weddingRoleAssignments } = useWeddingPartyStore.getState();
  const { seatingConstraints } = useSeatingConstraintsStore.getState();
  const { weddingEvents } = useWeddingEventsStore.getState();
  const { mealSelections } = useMealSelectionsStore.getState();
  const { communicationTemplates } = useCommunicationTemplatesStore.getState();
  const { documents } = useDocumentsStore.getState();
  const { legalMilestones } = useLegalStore.getState();
  const { honeymoonPlans } = useHoneymoonStore.getState();
  const { ceremonyItems } = useCeremonyStore.getState();
  const { speeches, playlistTracks } = useSpeechesMusicStore.getState();
  const { roles: permissionRoles, assignments: permissionAssignments } = usePermissionsStore.getState();

  const as = (arr: unknown[]) => arr as CollectionEntity[];
  return [
    { type: FIANCE_TYPES.guestGroup, items: as(groups) },
    { type: FIANCE_TYPES.guest, items: as(guests) },
    { type: FIANCE_TYPES.table, items: as(tables) },
    { type: FIANCE_TYPES.vendor, items: as(vendors) },
    { type: FIANCE_TYPES.quotePricing, items: as(quotePricings) },
    { type: FIANCE_TYPES.vendorPayment, items: as(vendorPayments) },
    { type: FIANCE_TYPES.accommodation, items: as(accommodations) },
    { type: FIANCE_TYPES.gift, items: as(gifts) },
    { type: FIANCE_TYPES.invitationType, items: as(invitationTypes) },
    { type: FIANCE_TYPES.communication, items: as(communications) },
    { type: FIANCE_TYPES.weddingRole, items: as(weddingRoles) },
    { type: FIANCE_TYPES.weddingRoleAssignment, items: as(weddingRoleAssignments) },
    { type: FIANCE_TYPES.seatingConstraint, items: as(seatingConstraints) },
    { type: FIANCE_TYPES.weddingEvent, items: as(weddingEvents) },
    { type: FIANCE_TYPES.guestMealSelection, items: as(mealSelections) },
    { type: FIANCE_TYPES.communicationTemplate, items: as(communicationTemplates) },
    { type: FIANCE_TYPES.document, items: as(documents) },
    { type: FIANCE_TYPES.legalMilestone, items: as(legalMilestones) },
    { type: FIANCE_TYPES.honeymoonPlan, items: as(honeymoonPlans) },
    { type: FIANCE_TYPES.taskCategory, items: as(categories) },
    { type: FIANCE_TYPES.task, items: as(tasks) },
    { type: FIANCE_TYPES.agendaEvent, items: as(agendaEvents) },
    { type: FIANCE_TYPES.dayOfItem, items: as(dayOfItems) },
    { type: FIANCE_TYPES.ideaCollection, items: as(collections) },
    { type: FIANCE_TYPES.idea, items: as(ideas) },
    { type: FIANCE_TYPES.ceremonyItem, items: as(ceremonyItems) },
    { type: FIANCE_TYPES.speech, items: as(speeches) },
    { type: FIANCE_TYPES.playlistTrack, items: as(playlistTracks) },
    { type: FIANCE_TYPES.permissionRole, items: as(permissionRoles) },
    { type: FIANCE_TYPES.permissionAssignment, items: as(permissionAssignments) },
  ];
}

/** One sentinel ObjectNode per collection — a lightweight index entry addressing the
 *  collection doc at `col:{type}:{weddingNodeId}` (access:'space', enc:true → same keyring). */
function collectionNode(type: string, weddingNodeId: string, order: number, now: number): ObjectNode {
  return {
    id: collectionNodeId(type, weddingNodeId),
    type,
    parentId: weddingNodeId,
    order,
    title: type,
    updatedAt: now,
    contentKind: 'merge',
    access: 'space',
    enc: true,
    meta: { collection: true },
  };
}

interface BuiltCollection {
  node: ObjectNode;
  type: string;
  doc: CollectionDoc;
  /** commit to _collectionState on a successful push of this collection. */
  nextState: CollectionState;
  /** entity id → stableStringify(entity); commit to _collectionEntityJson on success. */
  entityJson: Map<string, string>;
}

/** Build the sentinel nodes + collection docs to (dual-)write, reusing the per-collection
 *  dirty baseline to decide which entities get a fresh `rev`. Pure w.r.t. module state:
 *  callers commit `nextState`/`entityJson` only after the corresponding push succeeds. */
function buildCollectionDocs(weddingNodeId: string, now: number): { nodes: ObjectNode[]; built: BuiltCollection[] } {
  const nodes: ObjectNode[] = [];
  const built: BuiltCollection[] = [];
  let order = 0;
  for (const { type, items } of collectionSources()) {
    const prev = _collectionState.get(type) ?? { rev: {}, tombstones: {} };
    // Skip a collection that is empty AND has no carried state — no point minting a
    // sentinel node or pushing an empty doc for a collection the wedding never used.
    // Once it holds data (or a pending tombstone/rev), it stays material so deletes propagate.
    if (!items.length && !Object.keys(prev.rev).length && !Object.keys(prev.tombstones).length) continue;
    const changedIds = new Set<string>();
    const entityJson = new Map<string, string>();
    for (const e of items) {
      const j = stableStringify(e);
      entityJson.set(e.id, j);
      if (_collectionEntityJson.get(e.id) !== j) changedIds.add(e.id);
    }
    const { doc, state } = buildCollectionDoc(items, prev, changedIds, now);
    const node = collectionNode(type, weddingNodeId, order++, now);
    nodes.push(node);
    built.push({ node, type, doc, nextState: state, entityJson });
  }
  return { nodes, built };
}

// ---------------------------------------------------------------------------
// Push snapshot to server
// ---------------------------------------------------------------------------

/** Push a single collection doc — CAS-merging via `merge` (default: mergeCollectionDoc, so a
 *  peer's concurrent edit/add/delete to a different entity in the same collection is
 *  reconciled, not clobbered). The wedding singleton passes mergeSingletonDoc instead, which
 *  additionally tolerates a legacy (pre-migration, un-wrapped) remote doc — see its doc comment. */
async function pushCollectionDoc(
  session: Session,
  spaceId: string,
  node: ObjectNode,
  doc: CollectionDoc,
  now: number,
  merge: (cur: unknown, doc: CollectionDoc, now: number) => CollectionDoc = (cur, doc, now) =>
    mergeCollectionDoc(cur, doc, { now }),
): Promise<boolean> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    await handle.push(
      objDocPull(spaceId, node.id),
      objDocPush(spaceId, node.id),
      (cur) => merge(cur, doc, now) as unknown as Record<string, unknown>,
    );
    useSyncAccessStore.getState().setWriteDenied(false);
    return true;
  } catch (err) {
    // A 403 here is the authoritative "this device's cap has no write access" signal —
    // ground truth from the server, unlike the proactive write-flag check in providers.tsx
    // (which can't see older link tokens where `write` was never recorded). See
    // useSyncAccessStore.ts for how this flag is consumed (ReadOnlyBanner + usePermissions).
    if (err instanceof StarfishHttpError && err.status === 403) {
      useSyncAccessStore.getState().setWriteDenied(true);
      // MODIFICATION LOCALE — un refus de droit d'écriture ne se résout pas en
      // réessayant : il est déjà dit par le bandeau de `useSyncAccessStore`.
      // Le noter ici empêche le réessai de tourner en boucle contre un mur.
      _lastPushWriteDenied = true;
    }
    console.warn(`[space-sync] pushCollectionDoc ${node.id}:`, err);
    return false;
  }
}

// ─── MODIFICATION LOCALE — la fusion se décide contre le SERVEUR ─────────────
//
// `handle.push` prend un chemin rapide dès qu'un cache lui rend un hash pour ce
// document : il appelle alors son mutateur avec `null`, et la fusion devient un
// REMPLACEMENT du document entier par l'instantané local. Le serveur accepte
// sans conflit — le hash est bon — et le travail d'un pair disparaît.
//
// Deux caches le lui fournissent, et il faut les deux :
//   – une Map de module dans starfish-spaces, PAR FENÊTRE, alimentée par
//     CHAQUE poussée réussie (rapide comme lente) : dès la deuxième poussée
//     d'une page, le chemin rapide s'impose ;
//   – `starfish.pullcache.*` dans le stockage local, PARTAGÉE entre fenêtres et
//     valable 30 jours, écrite par `client.pull` ET par `client.push`.
//
// C'est la seconde qui explique l'écrasement entre fenêtres : l'onglet B pousse
// et y inscrit le hash réellement courant ; l'onglet A le lit au chargement,
// part du chemin rapide avec un hash valide, et remplace.
//
// `fiance-db` ne vide que la seconde, et cela lui suffit : c'est un CLI, chaque
// invocation est un processus neuf. Recopier son geste ici ne protégerait que la
// première poussée de chaque chargement de page.
//
// UNE FOIS PAR SALVE, et non par collection : `clearNodeAccessCache` vide aussi
// les caches d'accès aux nœuds et d'encrypteurs, donc le `getNodeAccess` suivant
// repaie une lecture du trousseau de l'espace. En tête de `pushSpaceSnapshot`,
// c'est une réouverture par débouncement — au pire toutes les 2 s — au lieu
// d'une par collection.
export function neutraliserCachesDePoussée(spaceId: string, nodeIds: string[]): void {
  try { clearNodeAccessCache(); } catch { /* rien à vider */ }
  try {
    const kv = (getSpacesConfig() as { kvAdapter?: { removeItem?: (k: string) => unknown } }).kvAdapter;
    if (!kv?.removeItem) return;
    const ns = getSyncNamespace();
    for (const nodeId of nodeIds) {
      kv.removeItem(`starfish.pullcache./v1/${ns}${objDocPull(spaceId, nodeId)}`);
    }
  } catch { /* adaptateur absent : le vidage mémoire ci-dessus reste acquis */ }
}

/** Rend `true` si TOUT ce qui devait partir est arrivé au serveur. */
export async function pushSpaceSnapshot(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<boolean> {
  const now = Date.now();
  _lastPushWriteDenied = false;
  // Avant de décider ce qui reste à pousser : sans ce réamorçage, un démarrage
  // considère les 352 invités comme modifiés et bat les `rev` de tous les pairs.
  amorcerRéférencesDePoussée();
  // Content is one doc per collection (+ the wedding singleton). No per-entity content docs.
  const weddingBuilt = buildWeddingNode(weddingNodeId, now);
  const { nodes: collectionNodes, built } = buildCollectionDocs(weddingNodeId, now);
  const weddingNode = weddingBuilt?.node ?? null;
  const allNodes = [...(weddingNode ? [weddingNode] : []), ...collectionNodes];
  if (!allNodes.length) return true; // truly empty state — nothing to sync

  const localById = new Map(allNodes.map((n) => [n.id, n]));

  // Avant toute poussée : que la fusion parte d'une lecture réelle.
  neutraliserCachesDePoussée(spaceId, allNodes.map((n) => n.id));

  // ── Push content FIRST, update the index second ──────────────────────────────
  // Pushing a space+enc content doc is index-independent (access resolves from local caps +
  // the space keyring, not the object index — see starfish-spaces getNodeAccess/handle.push).
  // Doing it before the index update means a failed content push can never leave the index
  // pruned-but-contentless: the legacy-node prune below only fires for collections whose doc is
  // confirmed durable, so a partial failure keeps the legacy nodes reachable until the retry.

  // Push the wedding singleton (per-entity rev LWW via mergeSingletonDoc, same as a
  // 1-item collection — see the "Close the wedding-singleton lost-update hole" plan)
  // if its content changed.
  const weddingDirty =
    weddingBuilt && stableStringify(weddingBuilt.content) !== _lastPushedJson.get(weddingBuilt.node.id);

  // Collection docs whose serialized form changed since last push — a 120-guest import
  // mutates only the guest store, so exactly one collection doc (guest) is dirty here.
  const dirtyCollections = built.filter(
    (b) => stableStringify(b.doc) !== _lastPushedCollectionJson.get(b.node.id),
  );

  const résultatsDePoussée = await Promise.allSettled([
    ...(weddingDirty && weddingBuilt
      ? [pushCollectionDoc(
          session, spaceId, weddingBuilt.node, weddingBuilt.doc, now,
          (cur, doc, now) => mergeSingletonDoc(cur, doc, weddingNodeId, { now }),
        ).then((ok) => {
          if (ok) _lastPushedJson.set(weddingBuilt.node.id, stableStringify(weddingBuilt.content));
          return ok;
        })]
      : []),
    ...dirtyCollections.map((b) =>
      pushCollectionDoc(session, spaceId, b.node, b.doc, now).then((ok) => {
        if (!ok) return false;
        _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
        persisterDernièresPoussées();
        _collectionState.set(b.type, b.nextState);
        // Au succès de CHAQUE collection, pas au succès global : une poussée à
        // moitié réussie doit laisser la table cohérente avec ce qui est
        // réellement arrivé au serveur.
        noterVersionsPoussées(b.type, b.nextState.rev);
        for (const [id, j] of b.entityJson) _collectionEntityJson.set(id, j);
        return true;
      }),
    ),
  ]);

  // MODIFICATION LOCALE — rendre compte de ce qui n'est PAS passé.
  //
  // `pushCollectionDoc` avale son échec en `console.warn` et rend `false`, et
  // `allSettled` absorbait le reste : une poussée à moitié perdue se terminait
  // exactement comme une poussée réussie. L'appelant n'avait donc aucun moyen de
  // réessayer, et rien ne pouvait le signaler. Le booléen ci-dessous est ce qui
  // rend le réessai (et son signalement) possibles.
  //
  // Un tableau vide — rien de sale à pousser — vaut succès : c'est bien le cas où
  // tout ce qui devait partir est arrivé.
  const toutEstPassé = résultatsDePoussée.every(
    (r) => r.status === 'fulfilled' && r.value !== false,
  );

  // MODIFICATION LOCALE — la note s'efface ICI, et pas dans `pousséeRéussie` :
  // cinq chemins poussent en contournant le minuteur d'anti-rebond (l'import,
  // le lien d'invitation, la resynchronisation, la révocation, la migration du
  // démarrage). Effacer plus haut laisserait le marqueur posé après ces
  // poussées-là, et le démarrage suivant repousserait pour rien.
  if (toutEstPassé) effacerPousséeEnAttente();

  // Collections whose current doc is now durably on the server (just pushed, or already clean
  // from a prior push). ONLY these may have their legacy per-entity nodes pruned below.
  const durableSentinels = new Set(
    built
      .filter((b) => _lastPushedCollectionJson.get(b.node.id) === stableStringify(b.doc))
      .map((b) => b.node.id),
  );

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (prev, idxNow) => {
      // The only managed nodes we write are the wedding root and the deterministic collection
      // sentinels (same id on every device), so no "peer added an unknown node" ambiguity
      // remains — deletes now ride inside the collection docs as tombstones. Everything else:
      //  - non-managed (publicPage/rsvp) → keep untouched
      //  - a collection sentinel or the wedding root not built locally (a collection this device
      //    hasn't hydrated / has emptied) → keep, so we never orphan a peer's collection doc
      //  - a LEGACY per-entity node whose collection is durably written → PRUNE (migration cutover)
      //  - a LEGACY per-entity node whose collection is NOT yet durable (its push failed, or its
      //    store was empty so no doc was written) → KEEP, so we never strand data; a later push
      //    prunes it once the collection doc is confirmed on the server
      const merged = allNodes.map((n) => ({ ...n, updatedAt: idxNow }));
      for (const r of prev) {
        if (!MANAGED_TYPES.has(r.type)) { merged.push(r); continue; }
        if (localById.has(r.id)) continue;
        if (isCollectionNodeId(r.id) || r.id === weddingNodeId) { merged.push(r); continue; }
        if (durableSentinels.has(collectionNodeId(r.type, weddingNodeId))) continue; // durable → prune
        merged.push(r); // not yet durable → keep, retry next round
      }
      return merged;
    }),
  );

  return toutEstPassé;
}

// ---------------------------------------------------------------------------
// Hydrate stores from server
// ---------------------------------------------------------------------------

async function pullNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<Record<string, unknown> | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    const result = await handle.client.pull(objDocPull(spaceId, node.id)) as { data: Record<string, unknown> | null };
    if (!result?.data) return null;
    return handle.encryptor ? await handle.encryptor.decrypt(result.data) : result.data;
  } catch (err) {
    // Log once per node so a missing space-access credential is visible in the console
    // rather than presenting as a mysteriously empty wedding (silent return null path).
    console.warn(`[space-sync] pullNodeContent ${node.type}:${node.id} failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Batch-pull the per-collection docs (one /batch/pull over the sentinel ids) and decrypt each,
 *  keyed by entity type. All sentinels are access:'space', so the single batch fast-path applies. */
async function pullCollectionDocs(
  session: Session,
  spaceId: string,
  sentinels: ObjectNode[],
): Promise<Map<string, CollectionDoc>> {
  const out = new Map<string, CollectionDoc>();
  if (!sentinels.length) return out;
  try {
    const handle = await getNodeAccess(spaceId, sentinels[0].id, sentinels[0], session, null);
    const entries = await handle.client.batchPullMany(
      'objdoc',
      sentinels.map((n) => ({ spaceId, objectId: n.id })),
    );
    await Promise.all(entries.map(async (entry: { error?: unknown; data?: unknown }, i: number) => {
      if (entry.error || !entry.data) {
        if (entry.error) console.warn(`[space-sync] pullCollectionDocs ${sentinels[i].type} failed:`, entry.error);
        return;
      }
      const data = entry.data as Record<string, unknown>;
      const decrypted = handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      out.set(sentinels[i].type, asCollectionDoc(decrypted));
    }));
  } catch (err) {
    console.warn('[space-sync] pullCollectionDocs failed:', err);
  }
  return out;
}

/**
 * Discovers the owner's wedding root ObjectNode id from the shared space index.
 * Called once per member device on first boot (before initSync) so the joiner
 * converges on the same root as the owner and the trees don't diverge.
 *
 * Heuristic for polluted spaces (multiple wedding/parentId:null roots):
 *   1. Exclude this device's own freshly-minted root id.
 *   2. Among the remaining candidates, prefer the oldest by updatedAt (= original owner).
 *
 * Returns null when the space is empty, unreachable, or only contains this device's root.
 * In that case the caller should fall back to wedding.id and not persist a weddingNodeId.
 *
 * Mirrors the proven reconciliation in fiance-sdk/src/sync/import-legacy.ts:123-124.
 */
export async function discoverOwnerWeddingRoot(
  session: Session,
  spaceId: string,
  ownId: string,
): Promise<string | null> {
  try {
    const nodes = await readObjectTree(session, spaceId);
    const roots = nodes.filter(
      (n) => n.type === FIANCE_TYPES.wedding && n.parentId === null,
    );
    if (!roots.length) return null;
    // Exclude this device's own minted root so we don't adopt ourselves.
    const others = roots.filter((r) => r.id !== ownId);
    const pool = others.length ? others : roots;
    // Oldest updatedAt = the original owner's root (joiners were created later).
    return pool.reduce((a, b) => (b.updatedAt < a.updatedAt ? b : a)).id;
  } catch {
    return null;
  }
}

// ─── MODIFICATION LOCALE — l'instantané local suit l'hydratation ─────────────
//
// `hydrateAllStores` peint l'écran depuis le KV, mais le KV n'était réécrit
// qu'à la MUTATION LOCALE : les setters de l'hydratation sont muets. Une
// modification venue d'ailleurs restait donc absente de l'instantané, et chaque
// chargement à froid réaffichait le périmé jusqu'à la fin du pull.
//
// On ne persiste que les types RECOUVERTS, pour la raison exacte qui limite le
// réamorçage des références plus bas : une collection que le serveur ignore
// garde ses données locales, qui doivent repartir à la poussée.
const PERSISTANCE_PAR_TYPE: Record<string, (s: SQLiteStorage) => void> = {
  [FIANCE_TYPES.guestGroup]: persistGroups,
  [FIANCE_TYPES.guest]: persistGuests,
  [FIANCE_TYPES.table]: persistTables,
  [FIANCE_TYPES.household]: persistHouseholds,
  [FIANCE_TYPES.vendor]: persistVendors,
  [FIANCE_TYPES.quotePricing]: persistQuotePricings,
  [FIANCE_TYPES.vendorPayment]: persistVendorPayments,
  [FIANCE_TYPES.accommodation]: persistAccommodations,
  [FIANCE_TYPES.gift]: persistGifts,
  [FIANCE_TYPES.invitationType]: persistInvitationTypes,
  [FIANCE_TYPES.communication]: persistCommunications,
  [FIANCE_TYPES.weddingRole]: persistWeddingRoles,
  [FIANCE_TYPES.weddingRoleAssignment]: persistWeddingRoleAssignments,
  [FIANCE_TYPES.seatingConstraint]: persistSeatingConstraints,
  [FIANCE_TYPES.weddingEvent]: persistWeddingEvents,
  [FIANCE_TYPES.guestMealSelection]: persistMealSelections,
  [FIANCE_TYPES.communicationTemplate]: persistCommunicationTemplates,
  [FIANCE_TYPES.document]: persistDocuments,
  [FIANCE_TYPES.legalMilestone]: persistLegalMilestones,
  [FIANCE_TYPES.honeymoonPlan]: persistHoneymoonPlans,
  [FIANCE_TYPES.taskCategory]: persistTaskCategories,
  [FIANCE_TYPES.task]: persistTasks,
  [FIANCE_TYPES.agendaEvent]: persistAgendaEvents,
  [FIANCE_TYPES.dayOfItem]: persistDayOfItems,
  [FIANCE_TYPES.ideaCollection]: persistIdeaCollections,
  [FIANCE_TYPES.idea]: persistIdeas,
  [FIANCE_TYPES.ceremonyItem]: persistCeremonyItems,
  [FIANCE_TYPES.speech]: persistSpeeches,
  [FIANCE_TYPES.playlistTrack]: persistPlaylistTracks,
  [FIANCE_TYPES.permissionRole]: persistPermissionRoles,
  [FIANCE_TYPES.permissionAssignment]: persistPermissionAssignments,
};

/** Réécrit dans le KV les collections que l'hydratation vient d'appliquer.
 *  Appelée au seul point d'application, donc jamais sur le chemin d'abandon. */
function persisterCollectionsRecouvertes(typesRecouverts: Set<string>, mariageAppliqué: boolean): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (mariageAppliqué) persistWedding(storage);
    for (const type of typesRecouverts) PERSISTANCE_PAR_TYPE[type]?.(storage);
  } catch (err) {
    // Quota ou stockage indisponible : l'état en mémoire reste juste, seul
    // l'instantané du prochain démarrage sera en retard.
    console.warn('[space-sync] persistance de l\'hydratation échouée:', err);
  }
}

/** Returns the number of nodes pulled from the server (0 = space was empty). */
export async function hydrateFromSpace(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<number> {
  _isHydrating = true;
  // MODIFICATION LOCALE — l'époque retenue à l'entrée. Toute mutation locale
  // survenue d'ici à l'application la fera diverger, et l'état lu sera jeté.
  const époqueÀLEntrée = _localEditEpoch;
  _lastHydrateApplied = false;
  try {
    const nodes = await readObjectTree(session, spaceId);
    if (!nodes.length) {
      console.warn(
        `[space-sync] hydrateFromSpace: empty object index for ${spaceId} — owner published no content, or space-access credential unrestored`,
      );
      return 0;
    }

    // Sentinel (per-collection) nodes share a `type` with legacy per-entity nodes, so bucket
    // them out first — the legacy pull path must not treat a collection doc as a lone entity.
    const sentinelNodes: ObjectNode[] = [];
    const byType = new Map<string, ObjectNode[]>();
    let sawLegacy = false;
    for (const n of nodes) {
      if (isCollectionNodeId(n.id)) { sentinelNodes.push(n); continue; }
      // A managed, non-wedding node that isn't a sentinel is a legacy per-entity node from the
      // old one-doc-per-entity model → this owner boot should migrate + prune it. (`wedding`
      // stays a per-node doc in the new model, so it never counts as legacy.)
      if (MANAGED_TYPES.has(n.type) && n.type !== FIANCE_TYPES.wedding) sawLegacy = true;
      const arr = byType.get(n.type) ?? [];
      arr.push(n);
      byType.set(n.type, arr);
    }
    _lastHydrateSawLegacy = sawLegacy;

    const pullAll = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      const results = await Promise.all(typeNodes.map((n) => pullNodeContent(session, spaceId, n)));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Batched variant of pullAll: one /batch/pull round-trip per collection type
    // instead of one HTTP request per node, to avoid rate-limiting on hydrate.
    // Only safe for plain space-member content (objdoc) — nodes with a per-node
    // 'invite' access entry can resolve to a different client/cap, so those fall
    // back to the per-node pullAll path.
    const pullAllBatch = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      if (!typeNodes.length) return [];
      if (typeNodes.some((n) => n.access === 'invite')) return pullAll(type);

      const handle = await getNodeAccess(spaceId, typeNodes[0].id, typeNodes[0], session, null);
      const entries = await handle.client.batchPullMany(
        'objdoc',
        typeNodes.map((n) => ({ spaceId, objectId: n.id })),
      );

      const results = await Promise.all(entries.map(async (entry, i) => {
        if (entry.error || !entry.data) {
          if (entry.error) {
            console.warn(`[space-sync] pullAllBatch ${type}:${typeNodes[i].id} failed:`, entry.error);
          }
          return null;
        }
        const data = entry.data as Record<string, unknown>;
        return handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      }));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Release 1 dual-read: pull the per-collection docs (one batch over the sentinel ids) and
    // seed the collection state so the next push carries the correct rev/tombstones. Falls back
    // gracefully to legacy-only when a space has no collection docs yet.
    const collectionDocsByType = await pullCollectionDocs(session, spaceId, sentinelNodes);
    // Reset to fresh remote truth: a type with no pulled doc gets no carried state, so a
    // locally-deleted-but-still-legacy entity re-hydrates rather than sticking.
    //
    // MODIFICATION LOCALE — RETENU, pas encore appliqué.
    //
    // Ce réamorçage avait lieu ICI, donc AVANT le point d'abandon plus bas. Une
    // lecture écartée laissait ainsi l'appareil porteur des `rev` DU SERVEUR
    // pour des valeurs qui, elles, n'avaient pas été appliquées. Sa poussée
    // suivante présentait donc son ancienne valeur sous la version du serveur —
    // et l'égalité de version se tranche en faveur du local. Une fenêtre restée
    // en retard écrasait ainsi le travail d'une autre, sans conflit et sans
    // trace. C'est le mécanisme constaté le 21 août 2026.
    //
    // On retient donc le réamorçage, et on ne l'applique qu'avec le reste, une
    // fois l'abandon écarté : une lecture qui n'est pas appliquée ne doit RIEN
    // laisser derrière elle.
    const réamorçageRetenu = new Map<string, CollectionState>();
    for (const [type, doc] of collectionDocsByType) {
      réamorçageRetenu.set(type, { rev: { ...doc.rev }, tombstones: { ...doc.tombstones } });
    }

    // Union a collection's legacy per-entity docs with its collection doc: collection live items
    // win, tombstoned ids are removed. During the transition an old-build device may write only
    // a per-entity node, so a legacy-only entity (absent from the collection doc) is preserved.
    // MODIFICATION LOCALE — les collections effectivement RECOUVERTES.
    //
    // Chaque setter plus bas est gardé par `if (xxxDocs.length)`, et chaque
    // `xxxDocs` est très exactement le résultat de `pullCollection(type)`. Noter
    // ici les types au résultat non vide donne donc, sans le dupliquer, le même
    // critère que celui des setters — c'est ce qui permet au réamorçage des
    // références de ne couvrir que ce qui a réellement été appliqué (voir plus
    // bas), au lieu de déclarer « déjà poussé » ce que le serveur ignore.
    const typesRecouverts = new Set<string>();
    const pullCollection = async (type: string): Promise<Record<string, unknown>[]> => {
      const legacy = await pullAllBatch(type);
      const cdoc = collectionDocsByType.get(type);
      const résultat = (() => {
        if (!cdoc) return legacy;
        const byId = new Map<string, Record<string, unknown>>();
        for (const e of legacy) {
          const id = (e as { id?: unknown }).id;
          if (typeof id === 'string') byId.set(id, e);
        }
        // MODIFICATION LOCALE — l'invariant anti-régression, par ENTITÉ.
        //
        // Une lecture peut rapporter du PASSÉ : réponse tardive, lecture partie
        // avant notre propre écriture, ou — c'est ce qui est arrivé le 21 août
        // 2026 — servie depuis un cache. Appliquer ce passé efface à l'écran une
        // modification pourtant enregistrée sur le serveur, puis la fait
        // repousser périmée. On refuse donc d'appliquer, pour une entité
        // donnée, une version antérieure à celle que CET appareil a poussée.
        //
        // Par entité, jamais par collection : un filigrane par collection
        // rejetterait la modification légitime d'un pair sur une AUTRE entité,
        // dès que cet appareil aurait poussé quoi que ce soit.
        //
        // On SUBSTITUE l'entité locale, on ne se contente pas de sauter le
        // `set` : les setters plus bas sont de gros remplacements, et une
        // entité absente du tableau se ferait tombstoner à la poussée suivante.
        const versionsPoussées = revPousséesPour(type);
        const localesParId = new Map<string, Record<string, unknown>>();
        if (Object.keys(versionsPoussées).length) {
          for (const src of collectionSources()) {
            if (src.type !== type) continue;
            for (const e of src.items) localesParId.set(e.id, e as unknown as Record<string, unknown>);
          }
        }
        for (const [id, entity] of Object.entries(cdoc.items)) {
          if (cdoc.tombstones[id] !== undefined) continue; // la pierre tombale tranche plus bas
          const poussée = versionsPoussées[id];
          if (poussée !== undefined && (cdoc.rev[id] ?? 0) < poussée) {
            const locale = localesParId.get(id);
            if (locale) { byId.set(id, locale); continue; }
          }
          byId.set(id, entity); // collection live wins
        }
        for (const id of Object.keys(cdoc.tombstones)) byId.delete(id); // tombstone removes
        return [...byId.values()];
      })();
      if (résultat.length) typesRecouverts.add(type);
      return résultat;
    };

    // Select the active wedding node at index level (node ids are available here but
    // lost after pullNodeContent decryption — this is the correct place to filter).
    // Fall back to first node when no match (owner's own boot, only one root present).
    const weddingNodes = byType.get(FIANCE_TYPES.wedding) ?? [];
    const weddingNode = weddingNodes.find((n) => n.id === weddingNodeId) ?? weddingNodes[0] ?? null;

    const [
      weddingDoc,
      guestGroupDocs,
      guestDocs,
      tableDocs,
      vendorDocs,
      quotePricingDocs,
      vendorPaymentDocs,
      accommodationDocs,
      giftDocs,
      invitationTypeDocs,
      communicationDocs,
      weddingRoleDocs,
      weddingRoleAssignmentDocs,
      seatingConstraintDocs,
      weddingEventDocs,
      guestMealSelectionDocs,
      communicationTemplateDocs,
      documentDocs,
      legalMilestoneDocs,
      honeymoonPlanDocs,
      taskCategoryDocs,
      taskDocs,
      agendaEventDocs,
      dayOfItemDocs,
      ideaCollectionDocs,
      ideaDocs,
      ceremonyItemDocs,
      speechDocs,
      playlistTrackDocs,
      permissionRoleDocs,
      permissionAssignmentDocs,
    ] = await Promise.all([
      weddingNode ? pullNodeContent(session, spaceId, weddingNode) : Promise.resolve(null),
      pullCollection(FIANCE_TYPES.guestGroup),
      pullCollection(FIANCE_TYPES.guest),
      pullCollection(FIANCE_TYPES.table),
      pullCollection(FIANCE_TYPES.vendor),
      pullCollection(FIANCE_TYPES.quotePricing),
      pullCollection(FIANCE_TYPES.vendorPayment),
      pullCollection(FIANCE_TYPES.accommodation),
      pullCollection(FIANCE_TYPES.gift),
      pullCollection(FIANCE_TYPES.invitationType),
      pullCollection(FIANCE_TYPES.communication),
      pullCollection(FIANCE_TYPES.weddingRole),
      pullCollection(FIANCE_TYPES.weddingRoleAssignment),
      pullCollection(FIANCE_TYPES.seatingConstraint),
      pullCollection(FIANCE_TYPES.weddingEvent),
      pullCollection(FIANCE_TYPES.guestMealSelection),
      pullCollection(FIANCE_TYPES.communicationTemplate),
      pullCollection(FIANCE_TYPES.document),
      pullCollection(FIANCE_TYPES.legalMilestone),
      pullCollection(FIANCE_TYPES.honeymoonPlan),
      pullCollection(FIANCE_TYPES.taskCategory),
      pullCollection(FIANCE_TYPES.task),
      pullCollection(FIANCE_TYPES.agendaEvent),
      pullCollection(FIANCE_TYPES.dayOfItem),
      pullCollection(FIANCE_TYPES.ideaCollection),
      pullCollection(FIANCE_TYPES.idea),
      pullCollection(FIANCE_TYPES.ceremonyItem),
      pullCollection(FIANCE_TYPES.speech),
      pullCollection(FIANCE_TYPES.playlistTrack),
      pullCollection(FIANCE_TYPES.permissionRole),
      pullCollection(FIANCE_TYPES.permissionAssignment),
    ]);

    // Diagnostic: if the space has content nodes but decryption yielded 0 guests,
    // a credential or space-access failure is the most likely cause.
    const totalGuestNodes = byType.get(FIANCE_TYPES.guest)?.length ?? 0;
    if (totalGuestNodes > 0 && guestDocs.length === 0) {
      console.warn(`[space-sync] decrypted 0/${totalGuestNodes} guest nodes — check space-access credential`);
    }

    // ─── MODIFICATION LOCALE — l'abandon ────────────────────────────────────
    //
    // Dernier instant avant d'écrire dans les magasins. Si une modification
    // locale est survenue depuis l'entrée, l'appliquer l'effacerait : on sort.
    //
    // La vérification tient parce qu'il n'y a AUCUN `await` entre elle et le
    // bloc de setters ci-dessous — rien ne peut s'y glisser. Toute insertion
    // d'un `await` dans ce bloc rouvrirait la fenêtre.
    //
    // Ce qu'on laisse derrière soi est exactement ce qu'il faut, sans rien
    // défaire :
    //   – `_collectionState` n'est PAS réamorcé — le réamorçage est RETENU plus
    //     haut et n'est appliqué que juste après cette garde. Il l'était avant
    //     elle, et c'était le défaut : l'appareil se retrouvait porteur des
    //     `rev` du serveur pour des valeurs qu'il n'avait pas appliquées, et sa
    //     poussée suivante présentait son ancienne valeur sous la version du
    //     serveur. À égalité de version, le local l'emporte — une fenêtre en
    //     retard écrasait donc le travail d'une autre ;
    //   – `_collectionEntityJson` n'est PAS réamorcé, donc la modification
    //     locale reste marquée comme changée, son `rev` sera relevé à la
    //     construction du document, et elle gagnera l'arbitrage ;
    //   – `_lastPushedCollectionJson` n'est PAS réamorcé, donc la collection
    //     reste sale et la poussée partira réellement.
    // L'abandon est un `return` anticipé, pas un défaissage.
    if (_localEditEpoch !== époqueÀLEntrée) {
      return nodes.length;
    }

    // La lecture est appliquée : le réamorçage retenu plus haut l'est aussi.
    _collectionState.clear();
    for (const [type, état] of réamorçageRetenu) _collectionState.set(type, état);

    // Feed into stores — setters do NOT call notifySync, so no circular dispatch.
    // readSingletonEntity unwraps the 1-item CollectionDoc (or tolerates a legacy raw, or
    // rollout-window hybrid, remote — see its doc comment) before it reaches the store.
    const { entity: weddingEntity } = readSingletonEntity(weddingDoc, weddingNodeId);
    if (weddingEntity) useWeddingStore.getState().setWedding(weddingFromDoc(weddingEntity) as Parameters<ReturnType<typeof useWeddingStore.getState>['setWedding']>[0]);
    if (guestGroupDocs.length) useGuestsStore.getState().setGroups(guestGroupDocs.map(guestGroupFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGroups']>[0]);
    if (tableDocs.length) useGuestsStore.getState().setTables(tableDocs.map(tableFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setTables']>[0]);
    if (guestDocs.length) useGuestsStore.getState().setGuests(guestDocs.map(guestFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGuests']>[0]);
    if (vendorDocs.length) useVendorsStore.getState().setVendors(vendorDocs.map(vendorFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendors']>[0]);
    if (quotePricingDocs.length) useVendorsStore.getState().setQuotePricings(quotePricingDocs.map(quotePricingFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setQuotePricings']>[0]);
    if (vendorPaymentDocs.length) useVendorsStore.getState().setVendorPayments(vendorPaymentDocs.map(vendorPaymentFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendorPayments']>[0]);
    if (accommodationDocs.length) useAccommodationsStore.getState().setAccommodations(accommodationDocs.map(accommodationFromDoc) as Parameters<ReturnType<typeof useAccommodationsStore.getState>['setAccommodations']>[0]);
    if (giftDocs.length) useGiftsStore.getState().setGifts(giftDocs.map(giftFromDoc) as Parameters<ReturnType<typeof useGiftsStore.getState>['setGifts']>[0]);
    if (invitationTypeDocs.length) useInvitationTypesStore.getState().setInvitationTypes(invitationTypeDocs.map(invitationTypeFromDoc) as Parameters<ReturnType<typeof useInvitationTypesStore.getState>['setInvitationTypes']>[0]);
    if (communicationDocs.length) useCommunicationsStore.getState().setCommunications(communicationDocs.map(communicationFromDoc) as Parameters<ReturnType<typeof useCommunicationsStore.getState>['setCommunications']>[0]);
    if (weddingRoleDocs.length) useWeddingPartyStore.getState().setWeddingRoles(weddingRoleDocs.map(weddingRoleFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoles']>[0]);
    if (weddingRoleAssignmentDocs.length) useWeddingPartyStore.getState().setWeddingRoleAssignments(weddingRoleAssignmentDocs.map(weddingRoleAssignmentFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoleAssignments']>[0]);
    if (seatingConstraintDocs.length) useSeatingConstraintsStore.getState().setSeatingConstraints(seatingConstraintDocs.map(seatingConstraintFromDoc) as Parameters<ReturnType<typeof useSeatingConstraintsStore.getState>['setSeatingConstraints']>[0]);
    if (weddingEventDocs.length) useWeddingEventsStore.getState().setWeddingEvents(weddingEventDocs.map(weddingEventFromDoc) as Parameters<ReturnType<typeof useWeddingEventsStore.getState>['setWeddingEvents']>[0]);
    if (guestMealSelectionDocs.length) useMealSelectionsStore.getState().setMealSelections(guestMealSelectionDocs.map(guestMealSelectionFromDoc) as Parameters<ReturnType<typeof useMealSelectionsStore.getState>['setMealSelections']>[0]);
    if (communicationTemplateDocs.length) useCommunicationTemplatesStore.getState().setCommunicationTemplates(communicationTemplateDocs.map(communicationTemplateFromDoc) as Parameters<ReturnType<typeof useCommunicationTemplatesStore.getState>['setCommunicationTemplates']>[0]);
    if (documentDocs.length) useDocumentsStore.getState().setDocuments(documentDocs.map(documentFromDoc) as Parameters<ReturnType<typeof useDocumentsStore.getState>['setDocuments']>[0]);
    if (legalMilestoneDocs.length) useLegalStore.getState().setLegalMilestones(legalMilestoneDocs.map(legalMilestoneFromDoc) as Parameters<ReturnType<typeof useLegalStore.getState>['setLegalMilestones']>[0]);
    if (honeymoonPlanDocs.length) useHoneymoonStore.getState().setHoneymoonPlans(honeymoonPlanDocs.map(honeymoonPlanFromDoc) as Parameters<ReturnType<typeof useHoneymoonStore.getState>['setHoneymoonPlans']>[0]);
    if (taskCategoryDocs.length) usePlanningStore.getState().setCategories(taskCategoryDocs.map(taskCategoryFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setCategories']>[0]);
    if (taskDocs.length) usePlanningStore.getState().setTasks(taskDocs.map(taskFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setTasks']>[0]);
    if (agendaEventDocs.length) usePlanningStore.getState().setAgendaEvents(agendaEventDocs.map(agendaEventFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setAgendaEvents']>[0]);
    if (dayOfItemDocs.length) usePlanningStore.getState().setDayOfItems(dayOfItemDocs.map(dayOfItemFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setDayOfItems']>[0]);
    if (ideaCollectionDocs.length) useIdeasStore.getState().setCollections(ideaCollectionDocs.map(ideaCollectionFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setCollections']>[0]);
    if (ideaDocs.length) useIdeasStore.getState().setIdeas(ideaDocs.map(ideaFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setIdeas']>[0]);
    if (ceremonyItemDocs.length) useCeremonyStore.getState().setCeremonyItems(ceremonyItemDocs.map(ceremonyItemFromDoc) as Parameters<ReturnType<typeof useCeremonyStore.getState>['setCeremonyItems']>[0]);
    if (speechDocs.length) useSpeechesMusicStore.getState().setSpeeches(speechDocs.map(speechFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setSpeeches']>[0]);
    if (playlistTrackDocs.length) useSpeechesMusicStore.getState().setPlaylistTracks(playlistTrackDocs.map(playlistTrackFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setPlaylistTracks']>[0]);
    if (permissionRoleDocs.length) usePermissionsStore.getState().setRoles(permissionRoleDocs.map(permissionRoleFromDoc) as Parameters<ReturnType<typeof usePermissionsStore.getState>['setRoles']>[0]);
    if (permissionAssignmentDocs.length) usePermissionsStore.getState().setAssignments(permissionAssignmentDocs.map(permissionAssignmentFromDoc) as Parameters<ReturnType<typeof usePermissionsStore.getState>['setAssignments']>[0]);

    // Pull RSVP submissions — rsvp nodes live in objinv (plaintext, owner has space:member access).
    // Owner-only: a member device has no business independently applying public-page RSVP
    // submissions into its guest store — it receives RSVP state through normal guest-collection
    // sync from the owner. Applying it here too raced a member's guest store against concurrent
    // hydrates/pushes and could drop or tombstone a member's own newly created/edited guest.
    if (!isActiveDeviceMember()) {
      await pullAndApplyRsvpNodes(session, spaceId, byType.get(FIANCE_TYPES.rsvp) ?? []);
    }

    // MODIFICATION LOCALE — après les setters ET le RSVP, pour que l'instantané
    // porte aussi les réponses appliquées côté propriétaire.
    persisterCollectionsRecouvertes(typesRecouverts, weddingEntity !== null);

    // Seed the wedding-node dirty baseline from what we just hydrated, so the next debounced
    // push only sends it if genuinely edited locally after this point.
    _lastPushedJson.clear();
    const seedWedding = buildWeddingNode(weddingNodeId, Date.now());
    if (seedWedding) _lastPushedJson.set(seedWedding.node.id, stableStringify(seedWedding.content));

    // Seed the collection baselines too. _collectionEntityJson is set from the hydrated entities
    // first so the baseline build treats nothing as "changed" (no rev bump); _collectionState was
    // already seeded from the pulled docs above. A collection that gained a legacy-only entity
    // (rev absent) will show as dirty on the next push — that is the intended one-shot migration
    // that folds the straggler into the collection doc.
    //
    // MODIFICATION LOCALE — ne réamorcer que ce qui a été RECOUVERT.
    //
    // Ce réamorçage lisait `collectionSources()`, c'est-à-dire les magasins APRÈS
    // hydratation, et déclarait tout ce qu'il y trouvait « déjà poussé ». Or les
    // setters ci-dessus sont gardés par `if (xxxDocs.length)` : une collection que
    // le serveur ignore n'est pas recouverte, ses données locales survivent — et
    // se trouvaient donc marquées transmises alors qu'elles ne l'étaient pas.
    // Elles ne repartaient PLUS JAMAIS, jusqu'à une prochaine modification.
    //
    // Laisser une collection non recouverte hors des deux références la garde
    // sale : ses entités sont absentes de `_collectionEntityJson` donc réputées
    // changées (leur `rev` sera relevé), et son document est absent de
    // `_lastPushedCollectionJson` donc la poussée partira.
    _collectionEntityJson.clear();
    _lastPushedCollectionJson.clear();
    for (const { type, items } of collectionSources()) {
      if (!typesRecouverts.has(type)) continue;
      for (const e of items) _collectionEntityJson.set(e.id, stableStringify(e));
    }
    const { built: builtCollections } = buildCollectionDocs(weddingNodeId, Date.now());
    for (const b of builtCollections) {
      if (!typesRecouverts.has(b.type)) continue;
      _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
    }
    // MODIFICATION LOCALE — et on le rend DURABLE ici aussi, pas seulement au
    // succès d'une poussée.
    //
    // Sans cette ligne, une session qui n'a fait que LIRE ne laisse rien
    // derrière elle : le démarrage suivant, s'il porte une saisie en attente,
    // trouve les quatorze collections « sales » et REPOUSSE TOUT — en
    // réestampillant les `rev` de toutes les entités, ce que la durabilité de
    // ce suivi existe précisément pour éviter. Constaté en production le 21 août
    // 2026 à 21:47. Le coût n'est pas visible à l'usage (c'est après la
    // peinture), mais la réestampille, elle, bat les `rev` de tous les pairs.
    persisterDernièresPoussées();

    _lastHydrateApplied = true;
    return nodes.length;
  } finally {
    _isHydrating = false;
    // MODIFICATION LOCALE — la reprise. Une demande écartée pendant cette
    // hydratation est rejouée maintenant, jamais abandonnée. Le drapeau est
    // booléen : cinq modifications retenues ne donnent qu'une poussée, ce que
    // le minuteur de 2 s regrouperait de toute façon.
    //
    // L'ordre compte : `_isHydrating` doit être retombé AVANT, sinon
    // `scheduleSyncPush` relèverait simplement le drapeau et l'on tournerait
    // en rond.
    if (_pushDeferred) {
      _pushDeferred = false;
      scheduleSyncPush();
    }
  }
}

/**
 * Re-hydrates from the space if no local push is in flight or pending — called on
 * app/tab foreground so this device picks up peers' changes without a full reload.
 * No-ops while hydrating or while a debounced local push is queued, so it never
 * clobbers an edit this device hasn't flushed yet.
 *
 * Returns whether a hydrate actually ran, so callers that also refresh RSVP nodes
 * (which a hydrate already pulls) can skip that redundant pull when this returns true.
 */
export async function refreshFromSpaceIfIdle(): Promise<boolean> {
  // MODIFICATION LOCALE — un réessai en attente compte pour la même raison
  // exactement que `_pushTimer` : il porte une modification que cet appareil n'a
  // pas encore réussi à écouler, et une hydratation l'effacerait.
  //
  // Mais il ne bloque que TANT QU'ON ESPÈRE ENCORE l'écouler. Passé le seuil de
  // signalement, l'utilisateur a été prévenu que ses modifications ne sont pas
  // enregistrées, et c'est très exactement la seconde branche que le contrat
  // prévoit : « atteindre le serveur, OU BIEN être signalée ». Continuer à
  // bloquer au-delà rendrait l'appareil définitivement aveugle aux modifications
  // des autres sur un échec durable qui n'est pas un 403 (un 409 tenace, que ce
  // serveur ne sait pas résoudre) — on échangerait une perte silencieuse contre
  // une cécité silencieuse.
  const réessaiProtègeEncore =
    _pushRetryTimer !== null && _pushRetryAttempt < PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL;
  if (_isHydrating || _pushTimer || réessaiProtègeEncore || _pushing || _rsvpRefreshing) return false;
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return false;
  return hydrateFromSpace(session, spaceId, weddingNodeId)
    // MODIFICATION LOCALE — rendre compte de ce qui a été APPLIQUÉ, non de ce
    // qui a été lu. Une hydratation abandonnée (modification locale concurrente)
    // n'a rien appliqué, donc rien pulled côté RSVP : l'appelant doit pouvoir
    // retomber sur `refreshRsvpInbox` plutôt que de croire le travail fait.
    .then(() => _lastHydrateApplied)
    .catch((err) => {
      console.warn('[space-sync] refreshFromSpaceIfIdle failed:', err);
      return false;
    });
}

// ---------------------------------------------------------------------------
// RSVP inbox — pull and merge guest submissions
// ---------------------------------------------------------------------------

async function pullRsvpNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<HouseholdRsvpDoc | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, { access: 'invite', enc: false }, session, null);
    const result = await handle.client.pull(objInvPull(spaceId, node.id)) as { data: unknown } | null;
    const data = result?.data as HouseholdRsvpDoc | null;
    // MODIFICATION LOCALE — un document de foyer se reconnaît à ses MEMBRES.
    // Les anciens nœuds, à deux emplacements nommés, n'en ont pas : ils sont
    // ignorés plutôt que migrés, aucun lien n'ayant été envoyé.
    if (!Array.isArray(data?.members)) return null;
    return data;
  } catch {
    return null;
  }
}

async function pullAndApplyRsvpNodes(
  session: Session,
  spaceId: string,
  rsvpNodes: ObjectNode[],
): Promise<void> {
  if (!rsvpNodes.length) return;
  const results = await Promise.all(rsvpNodes.map((n) => pullRsvpNodeContent(session, spaceId, n)));
  const docs = results.filter((r): r is HouseholdRsvpDoc => r !== null);
  if (docs.length) applyHouseholdRsvpDocs(docs);
}

/**
 * Pull only the rsvp nodes and merge guest submissions into the store.
 * Called on foreground to pick up new RSVP responses without a full re-hydrate.
 */
export async function refreshRsvpInbox(session: Session, spaceId: string): Promise<void> {
  // Mirror refreshFromSpaceIfIdle's guard: don't start applying RSVP submissions into the
  // guest store while a hydrate/push is already touching it (see _rsvpRefreshing above).
  if (_isHydrating || _pushTimer || _pushing) return;
  _rsvpRefreshing = true;
  try {
    const nodes = await readObjectTree(session, spaceId);
    const rsvpNodes = nodes.filter((n) => n.type === FIANCE_TYPES.rsvp);
    await pullAndApplyRsvpNodes(session, spaceId, rsvpNodes);
  } catch (err) {
    console.warn('[space-sync] refreshRsvpInbox failed:', err);
  } finally {
    _rsvpRefreshing = false;
  }
}
