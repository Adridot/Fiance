/**
 * Public wedding page — ObjectNode-based (v3).
 *
 * The `publicPage` node (access:'invite', enc:false) lives under the wedding node
 * in the fiance space. Its content is pushed to `objinv` by the owner and read
 * by guests via a node invite link (readNodeWithLinkCap).
 *
 * The node ID is derived deterministically: `pub-${weddingNodeId}`.
 *
 * Guest-facing URL: `encodeNodeInviteLink(origin, token)` puts the token in the
 * URL fragment. The wedding page screen reads `id` as the base64url token and
 * calls `decodeNodeInviteLink(id)` + `readNodeWithLinkCap(token)`.
 */

import { Platform } from "react-native";
import {
  getNodeAccess,
  objInvPush,
  objInvPull,
  updateObjectIndex,
  createNodeInviteLink,
  encodeNodeInviteLink,
  publicPageToNode,
  type Session,
  type ObjectNode,
  type PublicWeddingEvent,
} from "@fiance/sdk";
import { withIndexLock } from "@/lib/index-lock";
import { BASE_URL } from "@/lib/seo-urls";
import { isPremium } from "@/lib/premium";

function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  // On native, share real HTTPS links that open in a browser.
  return BASE_URL;
}
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGiftsStore } from "@/store/useGiftsStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";

// ---------------------------------------------------------------------------
// Types — unchanged
// ---------------------------------------------------------------------------

export interface PublicDayOfItem {
  id: string;
  title: string;
  date?: string | null;
  time: string;
  endTime?: string | null;
  location?: string | null;
  sortOrder?: number | null;
}

export interface PublicGift {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  claimed?: boolean;
}

export interface PublicWeddingPage {
  version: 1 | 2;
  timestamp: string;
  about: {
    partner1Name?: string | null;
    partner2Name?: string | null;
    weddingDate?: string | null;
    venueName?: string | null;
    description?: string | null;
  };
  timeline: PublicDayOfItem[];
  faq: FaqItem[];
  gifts?: PublicGift[];
  /** v2: public sub-events (multi-day/venue). Absent on v1 documents. */
  events?: PublicWeddingEvent[];
  /** Whether the owner's wedding is premium — gates gifts (and future premium sections) client-side too. */
  premium?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Deterministic node ID helpers
// ---------------------------------------------------------------------------

/** Derive the `publicPage` ObjectNode ID from the wedding node ID. */
export function publicPageNodeId(weddingNodeId: string): string {
  return `pub-${weddingNodeId}`;
}

// ---------------------------------------------------------------------------
// Owner-side: ensure the publicPage node exists in the space index
// ---------------------------------------------------------------------------

/**
 * Create or verify the `publicPage` ObjectNode in the space index.
 * Idempotent — safe to call on every sync init.
 * Returns the pageNodeId.
 */
export async function ensurePublicPageNode(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<string> {
  const pageNodeId = publicPageNodeId(weddingNodeId);
  const desc = publicPageToNode(pageNodeId, weddingNodeId);

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (nodes, now) => {
      const exists = nodes.some((n) => n.id === pageNodeId);
      if (exists) return null; // nothing to change
      const node: ObjectNode = {
        id: desc.id,
        type: desc.type,
        parentId: desc.parentId,
        order: nodes.length,
        title: desc.title,
        updatedAt: now,
        contentKind: desc.contentKind,
        access: desc.access,
        enc: desc.enc,
      };
      return [...nodes, node];
    }),
  );

  return pageNodeId;
}

// ---------------------------------------------------------------------------
// Owner-side: push page content to objinv
// ---------------------------------------------------------------------------

// ─── MODIFICATION LOCALE — une poussée qui n'a rien à écrire n'écrit pas ─────
//
// Ce nœud-ci était repoussé à CHAQUE hydratation, identique ou non. Seul, le
// défaut ne coûtait qu'une écriture inutile par retour au premier plan. Avec le
// flux d'événements (`fiance-sync`), il s'est refermé en BOUCLE : la poussée
// émet un événement → l'onglet auteur reçoit son propre écho → il hydrate →
// l'hydratation repousse. 120 requêtes/minute mesurées le 22 août 2026, sans
// personne devant l'écran.
//
// Quatre faits anodins séparément le composaient : l'abonnement de
// `providers.tsx` compare des RÉFÉRENCES de magasin ; une hydratation les
// remplace toujours par des objets neufs, identiques ou non ; le mutateur
// ci-dessous ignorait `cur` ; et `buildPublicPageDocument` réestampille
// `timestamp` à chaque construction.
//
// D'où les deux gardes ci-dessous. Il en faut DEUX, et c'est le point à ne pas
// défaire par simplification :
//
//   1. L'EMPREINTE EN MÉMOIRE, consultée avant même d'ouvrir le nœud. Elle est
//      seule à tenir dans le cas qui boucle, parce que `handle.push` a un
//      chemin rapide : quand son cache de documents connaît déjà le hash du
//      chemin de poussée — c'est-à-dire dès la DEUXIÈME poussée de la session —
//      il appelle le mutateur avec `cur = null` SANS relire le serveur
//      (`starfish-spaces`, `makeHandle`). Une garde qui ne regarderait que
//      `cur` ne verrait donc jamais rien à comparer, et n'éteindrait rien.
//      C'est le même piège que celui qui oblige `fiance-db` à vider ce cache
//      avant chaque écriture.
//   2. LA RELECTURE EXPLICITE, pour le premier appel d'un chargement de page —
//      là où l'empreinte en mémoire ne sait encore rien. Elle ne peut PAS être
//      déléguée au mutateur : `makeHandle` interroge d'abord `client.peekCache`,
//      qui relit un cache PERSISTÉ survivant au rechargement, si bien que le
//      chemin rapide est pris dès la première poussée d'une page et que `cur`
//      n'est jamais vu. Mesuré en production le 24 août 2026 : chaque
//      chargement de page réécrivait le nœud à l'identique.
//      On relit donc soi-même — `client.pull` ne sert du cache que si on le lui
//      demande (`staleWhileRevalidate`), ce qu'on ne fait pas. Une LECTURE
//      remplace ainsi une ÉCRITURE, et une lecture n'émet aucun événement,
//      donc ne réamorce rien. Pas de `dropPullCache` global à la `fiance-db` :
//      il jetterait le cache des 352 invités pour vérifier un document.
//   3. LA COMPARAISON À `cur`, en dernier recours — si la relecture ci-dessus a
//      échoué (réseau), `handle.push` refait sa propre lecture et le mutateur
//      voit alors un `cur` réel.
//
// `timestamp` est écarté de la comparaison des deux côtés : il change à chaque
// construction, donc l'inclure ferait conclure « différent » à tous les coups
// et ramènerait exactement le défaut corrigé ici.

/** Empreinte comparable d'un document de page publique : `timestamp` retiré,
 *  clés triées à toute profondeur, `undefined` écarté (le passage par JSON les
 *  perd de toute façon, donc les garder ferait diverger le construit du relu). */
export function empreintePagePublique(doc: unknown): string {
  const normaliser = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(normaliser);
    if (v && typeof v === "object") {
      const src = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(src).sort()) {
        if (src[k] === undefined) continue;
        out[k] = normaliser(src[k]);
      }
      return out;
    }
    return v;
  };
  const sansHorodatage =
    doc && typeof doc === "object" && !Array.isArray(doc)
      ? (() => {
          const { timestamp: _ignoré, ...reste } = doc as Record<string, unknown>;
          return reste;
        })()
      : doc;
  return JSON.stringify(normaliser(sansHorodatage));
}

/** Dernière empreinte réellement poussée, par nœud. Volontairement en mémoire :
 *  la persister ferait taire la poussée d'amorçage après un rechargement, alors
 *  que c'est elle qui rend le lien public vivant dès la création du mariage. */
const _dernièreEmpreintePoussée = new Map<string, string>();

/** @internal Pour les tests — l'empreinte retenue est un état de module. */
export function oublierEmpreintesPagePublique(): void {
  _dernièreEmpreintePoussée.clear();
}

/** Push the current public page content to the `publicPage` ObjectNode's objinv. */
export async function pushPublicPageContent(
  session: Session,
  spaceId: string,
  pageNodeId: string,
): Promise<void> {
  const content = buildPublicPageDocument();
  const empreinte = empreintePagePublique(content);
  const clé = `${spaceId}/${pageNodeId}`;

  // Garde 1 — rien n'a changé depuis notre dernière poussée : ni écriture, ni
  // lecture, ni ouverture du nœud. C'est celle qui éteint la boucle.
  if (_dernièreEmpreintePoussée.get(clé) === empreinte) return;

  const handle = await getNodeAccess(
    spaceId,
    pageNodeId,
    { access: "invite", enc: false },
    session,
    null,
  );

  // Garde 2 — relire nous-mêmes ce que le serveur détient. Voir plus haut :
  // déléguer cette comparaison au mutateur ne marche pas, le chemin rapide de
  // `handle.push` l'empêchant de jamais voir l'état du serveur.
  try {
    const actuel = await handle.client.pull(objInvPull(spaceId, pageNodeId));
    if (actuel?.hash) {
      const données = handle.encryptor
        ? await handle.encryptor.decrypt(actuel.data)
        : actuel.data;
      if (empreintePagePublique(données) === empreinte) {
        _dernièreEmpreintePoussée.set(clé, empreinte);
        return;
      }
    }
  } catch {
    // Réseau indisponible ou document absent : on continue, la garde 3 prendra
    // le relais si `handle.push` parvient, lui, à relire.
  }

  // Vrai dès que le serveur est établi porteur de ce document — qu'on vienne de
  // l'écrire, ou qu'on ait constaté qu'il l'avait déjà.
  let serveurÀJour = false;
  await handle.push(
    objInvPull(spaceId, pageNodeId),
    objInvPush(spaceId, pageNodeId),
    (cur) => {
      // Garde 3 — le serveur détient déjà l'équivalent. `null` demande à
      // `handle.push` de ne rien écrire (« or null to skip the push »), comme
      // le fait `ensurePublicPageNode` ci-dessus.
      if (cur && empreintePagePublique(cur) === empreinte) {
        serveurÀJour = true;
        return null;
      }
      serveurÀJour = true;
      return content as unknown as Record<string, unknown>;
    },
  );
  // Retenue APRÈS coup, et seulement si l'appel est allé à son terme : mémoriser
  // avant ferait taire la ré-poussée qui doit suivre un échec réseau (une
  // exception ici saute cette ligne, et la tentative suivante repartira).
  //
  // La garde 3 compte AUTANT que la poussée elle-même, et c'est nécessaire :
  // elle a relu le serveur, donc réchauffé le cache de documents (`docKey`
  // ramène chemins de lecture et d'écriture à la même clé). Sans retenir ici,
  // l'appel suivant prendrait le chemin rapide, recevrait `cur = null`, et
  // écrirait — le trou par lequel la boucle serait revenue.
  if (serveurÀJour) _dernièreEmpreintePoussée.set(clé, empreinte);
}

// ---------------------------------------------------------------------------
// Owner-side: generate a guest-readable invite link for the page
// ---------------------------------------------------------------------------

/**
 * Mint a read-only invite link for the `publicPage` node.
 * Returns the full URL (origin/wedding/${fragment}) where fragment is the
 * base64url NodeInviteLinkToken that the guest page screen decodes.
 */
export async function getPublicPageInviteLink(
  session: Session,
  spaceId: string,
  pageNodeId: string,
): Promise<string> {
  const origin = getAppOrigin();
  const nbf = Math.floor(Date.now() / 1000) - 3600; // backdate 1h: absorb owner clock skew
  const ttlSec = 5 * 365 * 24 * 3600; // 5 years — links don't rot
  const { token } = await createNodeInviteLink(
    session,
    spaceId,
    pageNodeId,
    "Page mariage",
    { enc: false },
    false, // read-only
    origin,
    { ttlSec, nbf },
  );
  const encoded = encodeNodeInviteLink(origin, token);
  // Extract the fragment (everything after '#') and use it as the path segment.
  const fragment = encoded.includes("#") ? encoded.split("#")[1] : encoded;
  return `${origin}/wedding/${fragment}`;
}

// ---------------------------------------------------------------------------
// Shared helper — used by the settings/public-page screen
// ---------------------------------------------------------------------------

/**
 * Resolve the active sync session and mint a public-page invite link.
 * Returns the URL string on success, or null if sync is not active.
 * Throws if the link cannot be minted (caller should surface the error).
 */
export async function resolvePublicPageUrl(): Promise<string | null> {
  const { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } = await import("@/lib/starfish");
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return null;
  const pageNodeId = publicPageNodeId(weddingNodeId);
  return getPublicPageInviteLink(session, spaceId, pageNodeId);
}

// ---------------------------------------------------------------------------
// Legacy stubs (called from old providers.tsx paths — now no-ops)
// ---------------------------------------------------------------------------

/** @deprecated No-op in v3 — use ensurePublicPageNode + pushPublicPageContent. */
export function initPublicPageSync(_config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): void {}

/** @deprecated No-op in v3. */
export async function pullPublicPageSync(): Promise<void> {}

/** @deprecated No-op in v3. */
export function teardownPublicPageSync(): void {}

/** @deprecated No-op in v3 — use pushPublicPageContent. */
export function notifyPublicPageSync(): void {}

/**
 * Guest-side: fetch the public wedding page doc via a link-cap token.
 *
 * The `fragment` parameter is the base64url-encoded NodeInviteLinkToken from the
 * URL path (e.g. `wedding/${fragment}`). Returns null on error or if the page
 * hasn't been pushed yet.
 *
 * @deprecated Legacy (userId-based) path. Prefer the fragment-based path using
 * decodeNodeInviteLink + readNodeWithLinkCap in the screen component.
 */
export async function fetchPublicPage(
  _serverUrl: string,
  _userId: string,
): Promise<PublicWeddingPage | null> {
  return null;
}

// ---------------------------------------------------------------------------
// Pure helpers — unchanged
// ---------------------------------------------------------------------------

/** Collect public data from stores and build the page document. */
export function buildPublicPageDocument(): PublicWeddingPage {
  const wedding = useWeddingStore.getState().wedding;
  const dayOfItems = usePlanningStore.getState().dayOfItems;

  const weddingDate = wedding?.weddingDate || "";
  const publicItems = dayOfItems
    .filter((item) => item.isPublic)
    .sort((a, b) => {
      const da = (a.date || weddingDate).localeCompare(b.date || weddingDate);
      if (da !== 0) return da;
      return (a.time || "").localeCompare(b.time || "");
    })
    .map(({ id, title, date, time, endTime, location, sortOrder }) => ({
      id, title, date, time, endTime, location, sortOrder,
    }));

  const premium = isPremium();
  const gifts = useGiftsStore.getState().gifts;
  const publicGifts: PublicGift[] = gifts.map(
    ({ id, title, description, price, url, imageUrl, category, claimed }) => ({
      id, title, description, price, url, imageUrl, category, claimed: !!claimed,
    }),
  );

  const weddingEvents = useWeddingEventsStore.getState().weddingEvents;
  const publicEvents: PublicWeddingEvent[] = weddingEvents
    .filter((e) => e.isPublic)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
    .map(({ id, type, title, date, startTime, venueName, address }) => ({
      id, type, title, date, time: startTime, venueName, address,
    }));

  // Free tier's public page only publishes the earliest day — multi-day
  // programs are a premium feature. A single-day wedding is unaffected.
  const earliestDate = [
    ...publicItems.map((i) => i.date || weddingDate),
    ...publicEvents.map((e) => e.date),
  ].filter(Boolean).sort()[0];
  const timelineForPage = premium || !earliestDate
    ? publicItems
    : publicItems.filter((i) => (i.date || weddingDate) === earliestDate);
  const eventsForPage = premium || !earliestDate
    ? publicEvents
    : publicEvents.filter((e) => e.date === earliestDate);

  return {
    version: 2,
    timestamp: new Date().toISOString(),
    about: {
      partner1Name: wedding?.partner1Name,
      partner2Name: wedding?.partner2Name,
      weddingDate: wedding?.weddingDate,
      venueName: wedding?.venueName,
      description: wedding?.description,
    },
    timeline: timelineForPage,
    faq: premium && wedding?.faq
      ? (() => { try { return JSON.parse(wedding.faq); } catch { return []; } })()
      : [],
    gifts: premium && publicGifts.length > 0 ? publicGifts : undefined,
    events: eventsForPage.length > 0 ? eventsForPage : undefined,
    premium,
  };
}
