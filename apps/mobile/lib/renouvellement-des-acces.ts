/**
 * Renouvellement des accès de membre : la partie sans effet de bord.
 *
 * Un accès de membre est un cap signé par le propriétaire pour la clé éphémère
 * d'un lien. Le propriétaire en réémet un plus long pour le MÊME sujet et le
 * dépose, chiffré, à une adresse que le membre sait recalculer. Le cap déposé
 * ne sert à rien sans la clé privée du sujet, qui ne quitte jamais le lien.
 *
 * Un membre que le propriétaire ne connaît plus se fait connaître : il dépose
 * une DEMANDE, à une adresse distincte, qui ne porte que son cap actuel.
 */

import { userIdFromPubHex, verifyCapCertSignature, type CapCert } from "@drakkar.software/starfish-protocol";
import { resolvePermissionForSubject, roleCanWrite, type PermissionAssignment, type RoleDefinition } from "@fiance/sdk";

import {
  chiffrerSousLaCle,
  dechiffrerLeDepot,
  encoderBase64Url,
  type DepotChiffre,
} from "@/lib/invitation-courte";

const JOUR_SEC = 24 * 3600;

/** Validité d'un accès émis par l'app, lien d'invitation comme réémission. */
export const DUREE_D_UN_ACCES_SEC = 3 * 365 * JOUR_SEC;
/** Le propriétaire réémet quand l'accès connu expire avant ce délai. */
export const REEMETTRE_AVANT_SEC = 60 * JOUR_SEC;
/** Le membre cherche un renouvellement quand son accès expire avant ce délai. */
export const CHERCHER_AVANT_SEC = 30 * JOUR_SEC;
/** Le dépôt expire au bout de 7 jours côté serveur : on le refait avant. */
export const REDEPOSER_APRES_MS = 3 * JOUR_SEC * 1000;

const DERIVE_D_HORLOGE_SEC = 300;

// ---------------------------------------------------------------------------
// Le cap
// ---------------------------------------------------------------------------

export interface CapDeMembre {
  kind?: unknown;
  iss?: unknown;
  sub?: unknown;
  subKem?: unknown;
  subUserId?: unknown;
  scope?: { ops?: unknown; paths?: unknown; collections?: unknown };
  nbf?: unknown;
  exp?: unknown;
}

/** Un cap lu tel quel, objet ou JSON (les entrées `member` le stockent en texte). */
export function lireLeCap(cap: unknown): CapDeMembre | null {
  let valeur = cap;
  if (typeof valeur === "string") {
    try { valeur = JSON.parse(valeur); } catch { return null; }
  }
  return valeur && typeof valeur === "object" ? (valeur as CapDeMembre) : null;
}

/** Le nonce d'un cap, ou `null`. */
export function nonceDuCap(cap: unknown): string | null {
  const nonce = (lireLeCap(cap) as { nonce?: unknown } | null)?.nonce;
  return typeof nonce === "string" && nonce ? nonce : null;
}

/** Le sujet d'un cap de lien, ou `null`. */
export function sujetDuCap(cap: unknown): string | null {
  const sujet = lireLeCap(cap)?.subUserId;
  return typeof sujet === "string" && sujet ? sujet : null;
}

export function capPermetLEcriture(cap: unknown): boolean {
  const ops = lireLeCap(cap)?.scope?.ops;
  return Array.isArray(ops) && ops.includes("write");
}

/** Vrai quand le cap expire dans moins de `avantSec` (ou a déjà expiré). Sans `exp`, jamais. */
export function expireBientot(cap: unknown, maintenantSec: number, avantSec: number): boolean {
  const exp = lireLeCap(cap)?.exp;
  return typeof exp === "number" && exp - maintenantSec < avantSec;
}

/**
 * Le cap déposé peut-il remplacer l'ancien ?
 *
 * Même émetteur, même sujet (clé de signature, clé KEM, identifiant), portée
 * limitée au même espace et aux mêmes collections, échéance plus lointaine, et
 * signature valide. Tout le reste est écarté : le dépôt est public en écriture.
 */
export function capDeRenouvellementValide(
  ancien: unknown,
  nouveau: unknown,
  spaceId: string,
  maintenantSec: number,
): boolean {
  const a = lireLeCap(ancien);
  const n = lireLeCap(nouveau);
  if (!a || !n || n.kind !== "member") return false;
  for (const champ of ["iss", "sub", "subKem", "subUserId"] as const) {
    if (typeof n[champ] !== "string" || n[champ] !== a[champ]) return false;
  }
  const chemins = n.scope?.paths;
  if (
    !Array.isArray(chemins) ||
    chemins.length === 0 ||
    !chemins.every((c) => typeof c === "string" && c.startsWith(`spaces/${spaceId}/`))
  ) {
    return false;
  }
  if (JSON.stringify(n.scope?.collections) !== JSON.stringify(a.scope?.collections)) return false;
  if (typeof n.exp !== "number" || typeof n.nbf !== "number") return false;
  if (n.exp <= maintenantSec || (typeof a.exp === "number" && n.exp <= a.exp)) return false;
  if (n.nbf > maintenantSec + DERIVE_D_HORLOGE_SEC) return false;
  return verifyCapCertSignature(n as unknown as CapCert);
}

/** Portée d'un cap de membre d'espace : collection `content`, chemins sous cet espace seulement. */
function porteeDeMembreDeLEspace(cap: CapDeMembre, spaceId: string): boolean {
  const chemins = cap.scope?.paths;
  return (
    JSON.stringify(cap.scope?.collections) === JSON.stringify(["content"]) &&
    Array.isArray(chemins) &&
    chemins.length > 0 &&
    chemins.every((c) => typeof c === "string" && c.startsWith(`spaces/${spaceId}/`))
  );
}

/**
 * Le sujet qu'une demande fait connaître, ou `null`.
 *
 * N'en est cru que ce que le propriétaire a lui-même signé : la clé ed et la
 * clé KEM d'un sujet, pour ce sujet et cet espace.
 */
export function sujetDeLaDemande(
  cap: unknown,
  attendu: { spaceId: string; subUserId: string; issEdPub: string },
): SujetDeLien | null {
  const c = lireLeCap(cap) as (CapDeMembre & { issUserId?: unknown; nonce?: unknown }) | null;
  if (!c || c.kind !== "member" || c.iss !== attendu.issEdPub) return null;
  if (c.issUserId !== userIdFromPubHex(attendu.issEdPub)) return null;
  if (c.subUserId !== attendu.subUserId || typeof c.sub !== "string" || typeof c.subKem !== "string") return null;
  if (userIdFromPubHex(c.sub) !== c.subUserId) return null;
  if (!porteeDeMembreDeLEspace(c, attendu.spaceId)) return null;
  if (typeof c.nonce !== "string" || typeof c.exp !== "number") return null;
  if (!verifyCapCertSignature(c as unknown as CapCert)) return null;
  return { subUserId: c.subUserId, edPub: c.sub, kemPub: c.subKem, exp: c.exp };
}

// ---------------------------------------------------------------------------
// Le dépôt
// ---------------------------------------------------------------------------

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
type NatureDuDepot = "renouvellement" | "demande-de-renouvellement";
/** Préfixes qui séparent ces dépôts entre eux et des codes à 10 caractères des liens courts. */
export const PREFIXES_DU_CODE: Record<NatureDuDepot, string> = { renouvellement: "RN", "demande-de-renouvellement": "RQ" };
const LONGUEUR_DU_CODE = 24;

function crypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error("renouvellement : WebCrypto indisponible");
  return c;
}

async function empreinte(nature: NatureDuDepot, etiquette: string, spaceId: string, subUserId: string): Promise<Uint8Array> {
  const entree = new TextEncoder().encode(`fiance/${nature}/${etiquette}/v1\u0000${spaceId}\u0000${subUserId}`);
  return new Uint8Array(await crypto().subtle.digest("SHA-256", entree));
}

function enBase32(octets: Uint8Array): string {
  let valeur = 0;
  let bits = 0;
  let out = "";
  for (const o of octets) {
    valeur = ((valeur << 8) | o) & 0xfff;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(valeur >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out;
}

async function deriver(nature: NatureDuDepot, spaceId: string, subUserId: string): Promise<{ code: string; cle: string }> {
  const [code, cle] = await Promise.all([
    empreinte(nature, "code", spaceId, subUserId),
    empreinte(nature, "cle", spaceId, subUserId),
  ]);
  return { code: PREFIXES_DU_CODE[nature] + enBase32(code).slice(0, LONGUEUR_DU_CODE), cle: encoderBase64Url(cle) };
}

function emballer(nature: NatureDuDepot, cap: unknown): string {
  return JSON.stringify({ v: 1, type: nature, cap });
}

function deballer(nature: NatureDuDepot, clair: string): unknown | null {
  try {
    const v = JSON.parse(clair) as { v?: unknown; type?: unknown; cap?: unknown } | null;
    return v?.v === 1 && v.type === nature && v.cap && typeof v.cap === "object" ? v.cap : null;
  } catch {
    return null;
  }
}

/** `null` pour tout dépôt illisible : substitué, tronqué, ou d'une autre nature. */
async function dechiffrer(nature: NatureDuDepot, depot: DepotChiffre, cle: string): Promise<unknown | null> {
  try {
    return deballer(nature, await dechiffrerLeDepot(depot, cle));
  } catch {
    return null;
  }
}

/** Code et clé du dépôt de réémission d'un sujet, dérivés séparément de l'espace et du sujet. */
export const deriverLeDepot = (spaceId: string, subUserId: string) => deriver("renouvellement", spaceId, subUserId);
export const emballerLeRenouvellement = (cap: unknown) => emballer("renouvellement", cap);
export const deballerLeRenouvellement = (clair: string) => deballer("renouvellement", clair);
export const chiffrerLeRenouvellement = (cap: unknown, cle: string): Promise<DepotChiffre> =>
  chiffrerSousLaCle(emballerLeRenouvellement(cap), cle);
export const dechiffrerLeRenouvellement = (depot: DepotChiffre, cle: string) => dechiffrer("renouvellement", depot, cle);

/** Code et clé de la demande d'un sujet : étiquettes distinctes de celles de la réémission. */
export const deriverLaDemande = (spaceId: string, subUserId: string) => deriver("demande-de-renouvellement", spaceId, subUserId);
/** Le clair d'une demande : le cap actuel, certificat public, jamais `key` ni `kemPriv`. */
export const emballerLaDemande = (cap: unknown) => emballer("demande-de-renouvellement", cap);
export const deballerLaDemande = (clair: string) => deballer("demande-de-renouvellement", clair);
export const chiffrerLaDemande = (cap: unknown, cle: string): Promise<DepotChiffre> =>
  chiffrerSousLaCle(emballerLaDemande(cap), cle);
export const dechiffrerLaDemande = (depot: DepotChiffre, cle: string) => dechiffrer("demande-de-renouvellement", depot, cle);

/** Le membre redépose sa demande si elle n'a jamais été déposée, ou l'a été il y a plus de trois jours. */
export function demandeARedeposer(deposeeLe: number | undefined, maintenantMs: number): boolean {
  return deposeeLe === undefined || maintenantMs - deposeeLe >= REDEPOSER_APRES_MS;
}

// ---------------------------------------------------------------------------
// Côté propriétaire : qui réémettre
// ---------------------------------------------------------------------------

/** Un sujet de lien tel que le magasin d'invitations le retient. */
export interface SujetDeLien {
  subUserId: string;
  edPub: string;
  kemPub: string;
  /** L'échéance du cap du lien, si le magasin la porte. */
  exp: number | null;
}

/** Le dernier cap réémis pour un sujet, et la date de son dernier dépôt. */
export interface ReemissionConnue {
  cap: unknown;
  exp: number;
  deposeLe: number;
}

export interface DecisionDeReemission {
  sujet: SujetDeLien;
  peutEcrire: boolean;
  /** Minter un cap neuf. Sinon, redéposer le dernier connu. */
  reemettre: boolean;
}

/** Les sujets de cet espace dans le magasin d'invitations sérialisé (`spaceId:userId` → entrée). */
export function sujetsDuMagasin(brut: unknown, spaceId: string): SujetDeLien[] {
  let entrees: unknown = brut;
  if (typeof brut === "string") {
    try { entrees = JSON.parse(brut); } catch { return []; }
  }
  if (!entrees || typeof entrees !== "object") return [];
  const prefixe = `${spaceId}:`;
  const out: SujetDeLien[] = [];
  for (const [cle, valeur] of Object.entries(entrees as Record<string, unknown>)) {
    if (!cle.startsWith(prefixe)) continue;
    const v = valeur as { edPub?: unknown; kemPub?: unknown; cap?: { exp?: unknown } } | null;
    const subUserId = cle.slice(prefixe.length);
    if (!subUserId || typeof v?.edPub !== "string" || typeof v.kemPub !== "string") continue;
    out.push({
      subUserId,
      edPub: v.edPub,
      kemPub: v.kemPub,
      exp: typeof v.cap?.exp === "number" ? v.cap.exp : null,
    });
  }
  return out;
}

/** Les sujets à interroger : membres de `_access`, affectés à un rôle qui existe, absents du magasin local. */
export function sujetsADemander(args: {
  membres: readonly string[];
  affectations: PermissionAssignment[];
  roles: RoleDefinition[];
  connus: readonly string[];
}): string[] {
  return [...new Set(args.membres)].filter(
    (m) => !args.connus.includes(m) && resolvePermissionForSubject(args.roles, args.affectations, m) !== null,
  );
}

/**
 * Ce qu'il faut réémettre ou redéposer.
 *
 * Jamais pour un sujet retiré de `_access` ni pour un sujet sans affectation
 * résolue : c'est ce qu'une révocation lui retire.
 */
export function planDeReemission(args: {
  sujets: readonly SujetDeLien[];
  membres: readonly string[];
  affectations: PermissionAssignment[];
  roles: RoleDefinition[];
  connues: Readonly<Record<string, ReemissionConnue>>;
  maintenantMs: number;
}): DecisionDeReemission[] {
  const maintenantSec = Math.floor(args.maintenantMs / 1000);
  const out: DecisionDeReemission[] = [];
  for (const sujet of args.sujets) {
    if (!args.membres.includes(sujet.subUserId)) continue;
    const resolu = resolvePermissionForSubject(args.roles, args.affectations, sujet.subUserId);
    if (!resolu) continue;
    const connue = args.connues[sujet.subUserId];
    const exp = connue?.exp ?? sujet.exp;
    const reemettre = exp === null || exp - maintenantSec < REEMETTRE_AVANT_SEC;
    const redeposer = !!connue && args.maintenantMs - connue.deposeLe >= REDEPOSER_APRES_MS;
    if (reemettre || redeposer) out.push({ sujet, peutEcrire: roleCanWrite(resolu.role), reemettre });
  }
  return out;
}
