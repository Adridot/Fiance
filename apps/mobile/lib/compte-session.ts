/**
 * Le compte, côté appli : le registre local devient le coffre, et inversement.
 */

import { clearSpaceAccessStore } from "@fiance/sdk";
import {
  CompteError,
  changerLeMotDePasse,
  creerLeCompte,
  enregistrerLeCoffre,
  lireLeCoffre,
  seConnecter,
  type Coffre,
  type CompteLocal,
} from "@/lib/compte";
import { readCollection, writeCollection } from "@/lib/kv-storage";
import { normalizeSyncBase, resolveServerUrl } from "@/lib/server";
import { resetDirtyPushBaseline, pousserAvantDeQuitter, attendreLaFinDeLHydratation } from "@/lib/space-sync";
import { teardownSync } from "@/lib/starfish";
import {
  deleteWeddingEntry,
  loadRegistry,
  saveRegistry,
  type WeddingRegistry,
  type WeddingRegistryEntry,
} from "@/lib/wedding-registry";
import { useCompteStore, type EtatDuCoffre } from "@/store/useCompteStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

// Clés de `invite-link.ts`, recopiées : ce module est appelé par lui.
const CLE_REVOCATION = "spaceInviteStore";
const CLE_CODES_DE_DEPOT = "inviteDepotCodes";
const PREFIXE_DES_ACCES = "dk.spaceaccess.";
/** Cache de lecture de `createKvPullCache` (starfish-client), écrit tel quel dans le KV de l'app. */
const PREFIXE_DU_CACHE_DE_LECTURE = "starfish.pullcache.";
const DELAI_DU_COFFRE_MS = 1500;

type Annexes = Coffre["annexes"];

/** Les annexes du dernier coffre lu ou écrit, en mémoire seulement. */
let _annexesConnues: Annexes = {};

function baseDeSynchro(): string {
  const url = resolveServerUrl();
  if (!url) throw new CompteError("reseau", "aucun serveur configuré");
  return normalizeSyncBase(url);
}

function sansMarqueur(entree: WeddingRegistryEntry): WeddingRegistryEntry {
  const { premiereHydratationAttendue: _, ...reste } = entree;
  return reste;
}

function annexesLocales(weddingId: string): Annexes[string] {
  const annexes: Annexes[string] = {};
  try {
    const revocation = readCollection<string>(CLE_REVOCATION);
    if (typeof revocation === "string") annexes.spaceInviteStore = revocation;
    const codes = readCollection<Record<string, string[]>>(CLE_CODES_DE_DEPOT)?.[weddingId];
    if (Array.isArray(codes)) annexes.inviteDepotCodes = codes;
  } catch {
    /* KV fermé : les annexes déjà connues suffisent */
  }
  return annexes;
}

export async function construireLeCoffre(identifiant: string): Promise<Coffre> {
  const registre = await loadRegistry();
  const weddings = registre.weddings.map(sansMarqueur);
  const annexes: Annexes = {};
  for (const { id } of weddings) if (_annexesConnues[id]) annexes[id] = { ..._annexesConnues[id] };
  const actif = registre.activeWeddingId;
  if (actif && weddings.some((w) => w.id === actif)) {
    const locales = annexesLocales(actif);
    if (Object.keys(locales).length) annexes[actif] = { ...annexes[actif], ...locales };
  }
  return {
    v: 1,
    identifiant,
    registre: { activeWeddingId: registre.activeWeddingId, weddings },
    annexes,
    majLe: new Date().toISOString(),
  };
}

function memeMariage(a: WeddingRegistryEntry, b: WeddingRegistryEntry): boolean {
  return (!!a.spaceId && a.spaceId === b.spaceId) || a.id === b.id;
}

/** Sans synchronisation, rien ne sera poussé : un marqueur ne lèverait jamais. */
function aRestaurer(entree: WeddingRegistryEntry): WeddingRegistryEntry {
  return entree.seedPhrase && !entree.syncDisabled ? { ...entree, premiereHydratationAttendue: true } : entree;
}

function fusionnerLesRegistres(local: WeddingRegistry, distant: WeddingRegistry): WeddingRegistry {
  const restaurees = distant.weddings.map(aRestaurer);
  if (!local.weddings.length) {
    const actif = restaurees.some((w) => w.id === distant.activeWeddingId)
      ? distant.activeWeddingId
      : (restaurees[0]?.id ?? null);
    return { activeWeddingId: actif, weddings: restaurees };
  }
  const ajoutees = restaurees.filter((r) => !local.weddings.some((l) => memeMariage(l, r)));
  return { activeWeddingId: local.activeWeddingId, weddings: [...local.weddings, ...ajoutees] };
}

export async function ouvrirUneSession(identifiant: string, mdp: string): Promise<void> {
  const { compte, coffre } = await seConnecter(baseDeSynchro(), identifiant, mdp);
  await saveRegistry(fusionnerLesRegistres(await loadRegistry(), coffre.registre));
  _annexesConnues = coffre.annexes ?? {};
  await useCompteStore.getState().poser(compte);
  await useWeddingRegistryStore.getState().load();
}

export async function creerMonCompte(identifiant: string, mdp: string): Promise<void> {
  const coffre = await construireLeCoffre(identifiant);
  const compte = await creerLeCompte(baseDeSynchro(), identifiant, mdp, coffre);
  _annexesConnues = coffre.annexes;
  await useCompteStore.getState().poser(compte);
}

export async function changerMonMotDePasse(nouveauMdp: string): Promise<void> {
  const compte = useCompteStore.getState().compte;
  if (!compte) throw new Error("changerMonMotDePasse : aucun compte sur cet appareil");
  // Une écriture planifiée sur l'ancien coffre le verrait vidé et se croirait déplacée.
  annulerLeMinuteur();
  const coffre = await construireLeCoffre(compte.identifiant);
  await useCompteStore.getState().poser(await changerLeMotDePasse(baseDeSynchro(), compte, nouveauMdp, coffre));
}

// ─── Enregistrement du coffre ────────────────────────────────────────────────

let _minuteur: ReturnType<typeof setTimeout> | null = null;
let _generation = 0;

function annulerLeMinuteur(): void {
  if (_minuteur) clearTimeout(_minuteur);
  _minuteur = null;
  _generation++;
}

async function enregistrerMaintenant(compte: CompteLocal): Promise<Exclude<EtatDuCoffre, "en-attente">> {
  try {
    const coffre = await construireLeCoffre(compte.identifiant);
    // Les annexes ne vivent qu'en mémoire avant leur restauration : ne jamais écraser celles du serveur par du vide.
    const distant = await lireLeCoffre(baseDeSynchro(), compte).catch(() => null);
    for (const [id, annexes] of Object.entries(distant?.annexes ?? {})) {
      if (coffre.registre.weddings.some((w) => w.id === id)) coffre.annexes[id] = { ...annexes, ...coffre.annexes[id] };
    }
    await enregistrerLeCoffre(baseDeSynchro(), compte, coffre);
    _annexesConnues = coffre.annexes;
    return "a-jour";
  } catch (err) {
    return err instanceof CompteError && err.cas === "deplace" ? "deplace" : "echec";
  }
}

export function planifierLeCoffre(): void {
  const compte = useCompteStore.getState().compte;
  if (!compte) return;
  if (_minuteur) clearTimeout(_minuteur);
  const generation = ++_generation;
  useCompteStore.getState().marquerLeCoffre("en-attente");
  _minuteur = setTimeout(() => {
    _minuteur = null;
    void enregistrerMaintenant(compte).then((etat) => {
      const { compte: courant, marquerLeCoffre } = useCompteStore.getState();
      if (generation === _generation && courant === compte) marquerLeCoffre(etat);
    });
  }, DELAI_DU_COFFRE_MS);
}

/** Un coffre vidé n'est découvert qu'en écrivant : on le lit pour savoir si le mot de passe a changé ailleurs. Ne lève jamais. */
export async function verifierLeCoffre(): Promise<void> {
  const compte = useCompteStore.getState().compte;
  if (!compte) return;
  try {
    const coffre = await lireLeCoffre(baseDeSynchro(), compte);
    const { compte: courant, marquerLeCoffre } = useCompteStore.getState();
    if (coffre === null && courant === compte) marquerLeCoffre("deplace");
  } catch {
    /* hors ligne ou illisible : on ne conclut rien */
  }
}

function empreinteDuRegistre(registre: WeddingRegistry): string {
  return JSON.stringify([registre.activeWeddingId, registre.weddings.map(sansMarqueur)]);
}

let _suiviInstalle = false;

/** Un changement du registre (hors marqueur) replanifie le coffre. À appeler une fois au démarrage. */
export function installerLeSuiviDuCoffre(): void {
  if (_suiviInstalle) return;
  _suiviInstalle = true;
  useWeddingRegistryStore.subscribe((etat, avant) => {
    if (!avant.registry || !etat.registry || etat.registry === avant.registry) return;
    if (empreinteDuRegistre(etat.registry) !== empreinteDuRegistre(avant.registry)) planifierLeCoffre();
  });
}

export function restaurerLesAnnexes(weddingId: string): void {
  const annexes = _annexesConnues[weddingId];
  if (!annexes) return;
  try {
    if (annexes.spaceInviteStore && readCollection(CLE_REVOCATION) == null) {
      writeCollection(CLE_REVOCATION, annexes.spaceInviteStore);
    }
    if (annexes.inviteDepotCodes) {
      const connus = readCollection<Record<string, string[]>>(CLE_CODES_DE_DEPOT) ?? {};
      if (connus[weddingId] === undefined) {
        writeCollection(CLE_CODES_DE_DEPOT, { ...connus, [weddingId]: annexes.inviteDepotCodes });
      }
    }
  } catch {
    /* KV indisponible : les annexes restent en mémoire pour la prochaine ouverture */
  }
}

// ─── Déconnexion ─────────────────────────────────────────────────────────────

export type ResultatDeDeconnexion = "ok" | "sans-compte" | "poussee-en-echec";

async function effacerLesAccesDEspace(): Promise<void> {
  try {
    clearSpaceAccessStore();
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    if (ls) {
      const cles: string[] = [];
      for (let i = 0; i < ls.length; i++) {
        const cle = ls.key(i);
        if (cle?.startsWith(PREFIXE_DES_ACCES)) cles.push(cle);
      }
      for (const cle of cles) ls.removeItem(cle);
      return;
    }
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    const cles = (await AsyncStorage.getAllKeys()).filter(
      (c) => c.startsWith(PREFIXE_DES_ACCES) || c.startsWith(PREFIXE_DU_CACHE_DE_LECTURE),
    );
    if (cles.length) await AsyncStorage.multiRemove(cles);
  } catch (err) {
    console.warn("[compte] accès aux espaces non effacés:", err);
  }
}

/** Des magasins réécrivent leurs clés après la purge : on balaie en dernier, juste avant le rechargement. */
function balayerLeStockageWeb(ls: Storage): void {
  const cles: string[] = [];
  for (let i = 0; i < ls.length; i++) {
    const cle = ls.key(i);
    if (!cle) continue;
    const base = cle.startsWith("wedding_") && cle.includes(".db::");
    if (base || cle.startsWith(PREFIXE_DU_CACHE_DE_LECTURE) || cle.startsWith(PREFIXE_DES_ACCES)) cles.push(cle);
  }
  for (const cle of cles) ls.removeItem(cle);
}

/** L'état de module de la sync ne se réinitialise pas autrement que par un rechargement. */
function rechargerVersLAccueil(): void {
  const g = globalThis as { localStorage?: Storage; sessionStorage?: Storage; location?: Location };
  if (!g.localStorage || typeof g.location?.replace !== "function") return;
  try { g.sessionStorage?.clear(); } catch { /* accès refusé */ }
  try { balayerLeStockageWeb(g.localStorage); } catch { /* accès refusé */ }
  g.location.replace("/onboarding");
}

/**
 * Sans `forcer`, une poussée ou un coffre qui n'arrive pas au serveur arrête la
 * déconnexion (`"poussee-en-echec"`) ; l'écran confirme, puis rappelle avec `forcer`.
 */
export async function seDeconnecter(options: { forcer?: boolean } = {}): Promise<ResultatDeDeconnexion> {
  const forcer = options.forcer === true;
  if (!useCompteStore.getState().charge) await useCompteStore.getState().charger();
  const compte = useCompteStore.getState().compte;
  if (!compte) return "sans-compte";

  annulerLeMinuteur();
  const pousseeOk = await pousserAvantDeQuitter().catch(() => false);
  // Un coffre « déplacé » ne bloque pas : le coffre à jour existe sous le nouveau mot de passe.
  const coffre = pousseeOk || forcer ? await enregistrerMaintenant(compte) : "echec";
  if (!forcer && (!pousseeOk || coffre === "echec")) {
    planifierLeCoffre();
    return "poussee-en-echec";
  }

  teardownSync();
  await attendreLaFinDeLHydratation();
  resetDirtyPushBaseline();

  for (const entree of (await loadRegistry()).weddings) {
    await deleteWeddingEntry(entree.id).catch((err) => console.warn("[compte] base locale non effacée:", err));
  }
  await saveRegistry({ activeWeddingId: null, weddings: [] });
  await useCompteStore.getState().oublier();
  await effacerLesAccesDEspace();
  _annexesConnues = {};
  await useWeddingRegistryStore.getState().load();
  rechargerVersLAccueil();
  return "ok";
}
