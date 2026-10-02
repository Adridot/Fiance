/**
 * Le compte : un coffre chiffré sous mot de passe, déposé sur le serveur.
 *
 * Crypto et réseau seulement — ni React, ni store, ni stockage sécurisé.
 */

import { argon2id } from "hash-wasm";
import { getSyncNamespace } from "@fiance/sdk";
import type { WeddingRegistry } from "@/lib/wedding-registry";
import { decoderBase64Url, encoderBase64Url } from "@/lib/invitation-courte";

export type EchecDeCompte =
  | "identifiants"
  | "existe-deja"
  | "illisible"
  | "reseau"
  | "mot-de-passe-faible"
  | "identifiant-vide"
  /** Le coffre a été vidé : le mot de passe a changé sur un autre appareil. */
  | "deplace";

export class CompteError extends Error {
  constructor(readonly cas: EchecDeCompte, message: string) {
    super(message);
    this.name = "CompteError";
  }
}

export interface Coffre {
  v: 1;
  identifiant: string;
  registre: WeddingRegistry;
  annexes: Record<string, { spaceInviteStore?: string; inviteDepotCodes?: string[] }>;
  majLe: string;
}

export interface CompteLocal {
  identifiant: string;
  /** Hex, 64 caractères : l'adresse du coffre. */
  locator: string;
  /** Base64url, 32 octets : la clé AES-256-GCM. */
  cle: string;
}

export interface ParametresArgon2 {
  memorySize: number;
  iterations: number;
  parallelism: number;
}

/** Mêmes paramètres que `deriveSession`. Les tests en passent de plus légers, jamais le code de production. */
export const PARAMETRES_ARGON2: Readonly<ParametresArgon2> = Object.freeze({
  memorySize: 47104,
  iterations: 3,
  parallelism: 1,
});

const LONGUEUR_MINIMALE_DU_MOT_DE_PASSE = 8;
const ESSAIS_EN_CAS_DE_CONFLIT = 5;

function crypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error("compte : WebCrypto indisponible");
  return c;
}

export function normaliserLIdentifiant(saisie: string): string {
  return saisie.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function motDePasseAcceptable(mdp: string): boolean {
  return [...mdp].length >= LONGUEUR_MINIMALE_DU_MOT_DE_PASSE;
}

function exigerUnIdentifiant(identifiant: string): void {
  if (!normaliserLIdentifiant(identifiant)) throw new CompteError("identifiant-vide", "identifiant vide");
}

function exigerUnMotDePasse(mdp: string): void {
  if (!motDePasseAcceptable(mdp)) {
    throw new CompteError("mot-de-passe-faible", `mot de passe de moins de ${LONGUEUR_MINIMALE_DU_MOT_DE_PASSE} caractères`);
  }
}

export async function deriverLesCles(
  identifiant: string,
  mdp: string,
  parametres: ParametresArgon2 = PARAMETRES_ARGON2,
): Promise<{ locator: string; cle: string }> {
  const sel = new Uint8Array(
    await crypto().subtle.digest("SHA-256", new TextEncoder().encode(`fiance-compte-v1:${normaliserLIdentifiant(identifiant)}`)),
  );
  const k = (await argon2id({
    password: mdp,
    salt: sel,
    parallelism: parametres.parallelism,
    iterations: parametres.iterations,
    memorySize: parametres.memorySize,
    hashLength: 64,
    outputType: "binary",
  })) as Uint8Array;
  const hex = [...k.subarray(0, 32)].map((o) => o.toString(16).padStart(2, "0")).join("");
  return { locator: hex, cle: encoderBase64Url(k.slice(32, 64)) };
}

interface CoffreChiffre {
  iv: string;
  ct: string;
}

async function chiffrer(coffre: Coffre, cle: string): Promise<CoffreChiffre> {
  const c = crypto();
  const iv = c.getRandomValues(new Uint8Array(12));
  const k = await c.subtle.importKey("raw", decoderBase64Url(cle), "AES-GCM", false, ["encrypt"]);
  const ct = await c.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(JSON.stringify(coffre)));
  return { iv: encoderBase64Url(iv), ct: encoderBase64Url(new Uint8Array(ct)) };
}

async function dechiffrer(depot: CoffreChiffre, cle: string): Promise<Coffre> {
  try {
    const k = await crypto().subtle.importKey("raw", decoderBase64Url(cle), "AES-GCM", false, ["decrypt"]);
    const clair = await crypto().subtle.decrypt({ name: "AES-GCM", iv: decoderBase64Url(depot.iv) }, k, decoderBase64Url(depot.ct));
    const coffre = JSON.parse(new TextDecoder().decode(clair)) as Partial<Coffre> | null;
    if (coffre?.v !== 1 || !coffre.registre || typeof coffre.registre !== "object") throw new Error("forme inattendue");
    return coffre as Coffre;
  } catch (err) {
    throw new CompteError("illisible", `le coffre ne se déchiffre pas (${err instanceof Error ? err.message : String(err)})`);
  }
}

function chemin(base: string, locator: string, sens: "pull" | "push"): string {
  return `${base.replace(/\/$/, "")}/v1/${getSyncNamespace()}/${sens}/_compte/${locator}`;
}

/** Un document absent se lit `{hash:"",data:{}}`, un document vidé garde son hash : `depot` est null dans les deux cas. */
async function tirer(base: string, locator: string): Promise<{ hash: string; depot: CoffreChiffre | null }> {
  try {
    const rép = await fetch(chemin(base, locator, "pull"), { cache: "no-store" });
    if (!rép.ok) throw new Error(`HTTP ${rép.status}`);
    const lu = (await rép.json()) as { hash?: string; data?: Partial<CoffreChiffre> } | null;
    const depot = lu?.data?.iv && lu.data.ct ? { iv: lu.data.iv, ct: lu.data.ct } : null;
    return { hash: lu?.hash ?? "", depot };
  } catch (err) {
    throw new CompteError("reseau", `serveur injoignable (${err instanceof Error ? err.message : String(err)})`);
  }
}

/** Le champ s'appelle `baseHash`, jamais `hash` : le serveur ignore un nom inconnu et refuse tout en 409. */
async function pousser(base: string, locator: string, data: unknown, baseHash: string | null): Promise<Response> {
  try {
    return await fetch(chemin(base, locator, "push"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data, baseHash }),
    });
  } catch (err) {
    throw new CompteError("reseau", `serveur injoignable (${err instanceof Error ? err.message : String(err)})`);
  }
}

async function hashCourantDuConflit(rép: Response): Promise<string> {
  const conflit = (await rép.json().catch(() => null)) as { currentHash?: string } | null;
  if (!conflit?.currentHash) throw new CompteError("reseau", "conflit sans hash courant");
  return conflit.currentHash;
}

async function ecrireEnCAS(base: string, locator: string, data: unknown, baseHash: string | null): Promise<void> {
  let hash = baseHash;
  for (let essai = 0; essai < ESSAIS_EN_CAS_DE_CONFLIT; essai += 1) {
    const rép = await pousser(base, locator, data, hash);
    if (rép.ok) return;
    if (rép.status !== 409) throw new CompteError("reseau", `écriture refusée — HTTP ${rép.status}`);
    hash = await hashCourantDuConflit(rép);
  }
  throw new CompteError("reseau", "écriture refusée — conflits répétés");
}

async function poserUnCoffreNeuf(
  base: string,
  identifiant: string,
  { locator, cle }: { locator: string; cle: string },
  coffre: Coffre,
): Promise<CompteLocal> {
  const { hash, depot } = await tirer(base, locator);
  if (depot) throw new CompteError("existe-deja", "un compte porte déjà cet identifiant et ce mot de passe");
  const rép = await pousser(base, locator, await chiffrer(coffre, cle), hash || null);
  if (rép.status === 409) throw new CompteError("existe-deja", "le coffre a été créé entre-temps");
  if (!rép.ok) throw new CompteError("reseau", `écriture refusée — HTTP ${rép.status}`);
  return { identifiant: identifiant.trim(), locator, cle };
}

export async function creerLeCompte(
  syncBase: string,
  identifiant: string,
  mdp: string,
  coffre: Coffre,
  parametres: ParametresArgon2 = PARAMETRES_ARGON2,
): Promise<CompteLocal> {
  exigerUnIdentifiant(identifiant);
  exigerUnMotDePasse(mdp);
  return poserUnCoffreNeuf(syncBase, identifiant, await deriverLesCles(identifiant, mdp, parametres), coffre);
}

export async function seConnecter(
  syncBase: string,
  identifiant: string,
  mdp: string,
  parametres: ParametresArgon2 = PARAMETRES_ARGON2,
): Promise<{ compte: CompteLocal; coffre: Coffre }> {
  exigerUnIdentifiant(identifiant);
  // Aucun compte ne porte un mot de passe aussi court : même réponse qu'un mauvais, sans dérivation ni réseau.
  if (!motDePasseAcceptable(mdp)) throw new CompteError("identifiants", "identifiant ou mot de passe incorrect");
  const { locator, cle } = await deriverLesCles(identifiant, mdp, parametres);
  const { depot } = await tirer(syncBase, locator);
  if (!depot) throw new CompteError("identifiants", "identifiant ou mot de passe incorrect");
  return { compte: { identifiant: identifiant.trim(), locator, cle }, coffre: await dechiffrer(depot, cle) };
}

export async function lireLeCoffre(syncBase: string, compte: CompteLocal): Promise<Coffre | null> {
  const { depot } = await tirer(syncBase, compte.locator);
  return depot ? dechiffrer(depot, compte.cle) : null;
}

export async function enregistrerLeCoffre(syncBase: string, compte: CompteLocal, coffre: Coffre): Promise<void> {
  const { hash, depot } = await tirer(syncBase, compte.locator);
  // Réécrire un coffre vidé ressusciterait l'ancien mot de passe.
  if (hash && !depot) throw new CompteError("deplace", "le coffre a été déplacé par un changement de mot de passe");
  await ecrireEnCAS(syncBase, compte.locator, await chiffrer(coffre, compte.cle), hash || null);
}

export async function changerLeMotDePasse(
  syncBase: string,
  compte: CompteLocal,
  nouveauMdp: string,
  coffre: Coffre,
  parametres: ParametresArgon2 = PARAMETRES_ARGON2,
): Promise<CompteLocal> {
  exigerUnMotDePasse(nouveauMdp);
  const cles = await deriverLesCles(compte.identifiant, nouveauMdp, parametres);
  if (cles.locator === compte.locator) {
    await enregistrerLeCoffre(syncBase, compte, coffre);
    return compte;
  }
  const neuf = await poserUnCoffreNeuf(syncBase, compte.identifiant, cles, coffre);
  // Le neuf est déjà posé : un ancien coffre qui survit est un défaut, pas un échec du changement.
  await ecrireEnCAS(syncBase, compte.locator, {}, null).catch(() => undefined);
  return neuf;
}
