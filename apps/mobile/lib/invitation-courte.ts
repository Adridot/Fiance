/**
 * Le lien d'invitation court : dépôt chiffré, clé dans le fragment.
 *
 * Le jeton d'invitation pèse ~984 octets, soit 1342 caractères d'URL une fois
 * encodé — une longueur qui ne survit ni au repli d'un message, ni à un aperçu
 * de lien, ni à un copier-coller partiel, ni à un QR code lisible.
 *
 * On ne touche pas au format du jeton : `encodeSpaceInviteLink` appartient à
 * `starfish-spaces`, dépendance vendorisée qu'aucun patch n'atteint. Le
 * raccourcissement est une enveloppe posée par-dessus :
 *
 *     jeton ──chiffré AES-GCM sous K (32 o)──▶ dépôt public `_invite/<code>`
 *     K reste dans le fragment `#`, la seule part de l'URL qu'un navigateur
 *     n'envoie jamais — donc la seule qui ne peut pas finir dans un journal.
 *
 * Le serveur ne détient que du chiffré, et la clé ne lui parvient jamais.
 * Obtenir tout ce qu'il détient ne donne ni l'identifiant de l'espace, ni le
 * droit d'y accéder.
 */

import { decodeSpaceInviteLink, getSyncNamespace, type SpaceInviteLinkToken } from "@fiance/sdk";

/** Base32 de Crockford, sans I/L/O/U : recopiable à la main, dictable de vive voix. */
const ALPHABET_CODE = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Dix caractères, ~50 bits. À lui seul le code ne donne que du chiffré : il n'a
 * donc à résister qu'à l'énumération, pas à la recherche exhaustive.
 */
export const LONGUEUR_DU_CODE = 10;

const OCTETS_DE_CLE = 32;
const OCTETS_D_IV = 12;

export type EchecDInvitationCourte =
  /** Aucun dépôt à ce code : jamais émis, ou expiré. */
  | "depot-absent"
  /** Le dépôt ne se déchiffre pas sous cette clé : substitué, ou clé tronquée. */
  | "depot-illisible"
  /** Le serveur n'a pas répondu. */
  | "reseau";

export class InvitationCourteError extends Error {
  constructor(readonly cas: EchecDInvitationCourte, message: string) {
    super(message);
    this.name = "InvitationCourteError";
  }
}

function crypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error("invitation-courte : WebCrypto indisponible");
  return c;
}

/** Un code de dépôt tiré au hasard. */
export function tirerUnCode(): string {
  const octets = crypto().getRandomValues(new Uint8Array(LONGUEUR_DU_CODE));
  let out = "";
  for (const o of octets) out += ALPHABET_CODE[o % ALPHABET_CODE.length];
  return out;
}

/** Un code recopié à la main : casse et séparateurs sont tolérés. */
export function normaliserLeCode(saisie: string): string | null {
  const brut = saisie.trim().toUpperCase().replace(/[\s-]/g, "");
  // Les confusions ordinaires d'une recopie manuscrite, dans le sens de Crockford.
  const corrigé = brut.replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
  if (corrigé.length !== LONGUEUR_DU_CODE) return null;
  return [...corrigé].every((c) => ALPHABET_CODE.includes(c)) ? corrigé : null;
}

export function encoderBase64Url(octets: Uint8Array): string {
  let binaire = "";
  for (const o of octets) binaire += String.fromCharCode(o);
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decoderBase64Url(texte: string): Uint8Array<ArrayBuffer> {
  const rembourré = texte.replace(/-/g, "+").replace(/_/g, "/");
  const binaire = atob(rembourré + "=".repeat((4 - (rembourré.length % 4)) % 4));
  const out = new Uint8Array(new ArrayBuffer(binaire.length));
  for (let i = 0; i < binaire.length; i += 1) out[i] = binaire.charCodeAt(i);
  return out;
}

export interface DepotChiffre {
  /** Le vecteur d'initialisation, en base64url. */
  iv: string;
  /** Le jeton chiffré, en base64url. */
  ct: string;
}

/** Chiffre un jeton sous une clé neuve. Rend le dépôt ET la clé, séparément. */
export async function chiffrerLeJeton(
  jeton: string,
): Promise<{ depot: DepotChiffre; cle: string }> {
  const c = crypto();
  const brute = c.getRandomValues(new Uint8Array(OCTETS_DE_CLE));
  const iv = c.getRandomValues(new Uint8Array(OCTETS_D_IV));
  const cle = await c.subtle.importKey("raw", brute, "AES-GCM", false, ["encrypt"]);
  const chiffré = await c.subtle.encrypt({ name: "AES-GCM", iv }, cle, new TextEncoder().encode(jeton));
  return {
    depot: { iv: encoderBase64Url(iv), ct: encoderBase64Url(new Uint8Array(chiffré)) },
    cle: encoderBase64Url(brute),
  };
}

/**
 * Déchiffre un dépôt sous la clé du fragment.
 *
 * Le chiffrement étant authentifié, un dépôt substitué ne se déchiffre pas :
 * l'échec est SIGNALÉ, jamais avalé — sinon on remplacerait un défaut par un
 * autre, plus difficile à diagnostiquer.
 */
export async function dechiffrerLeDepot(depot: DepotChiffre, cleBase64Url: string): Promise<string> {
  const c = crypto();
  try {
    const brute = decoderBase64Url(cleBase64Url);
    if (brute.length !== OCTETS_DE_CLE) throw new Error("clé de longueur inattendue");
    const cle = await c.subtle.importKey("raw", brute, "AES-GCM", false, ["decrypt"]);
    const clair = await c.subtle.decrypt(
      { name: "AES-GCM", iv: decoderBase64Url(depot.iv) },
      cle,
      decoderBase64Url(depot.ct),
    );
    return new TextDecoder().decode(clair);
  } catch (err) {
    throw new InvitationCourteError(
      "depot-illisible",
      `le dépôt ne se déchiffre pas sous cette clé — substitué, ou lien tronqué (${
        err instanceof Error ? err.message : String(err)
      })`,
    );
  }
}

/** L'adresse d'API du dépôt. Distincte de la route `/i/<code>` que sert l'app. */
function cheminDuDepot(base: string, code: string, sens: "pull" | "push"): string {
  return `${base.replace(/\/$/, "")}/v1/${getSyncNamespace()}/${sens}/_invite/${code}`;
}

/**
 * Pousse un document sur le dépôt.
 *
 * Le champ du hash de base s'appelle `baseHash`, JAMAIS `hash` : le serveur
 * ignore silencieusement un nom inconnu, le lit alors `undefined`, et refuse
 * en 409 toute écriture sur un document qui existe. L'erreur ne se voit que
 * contre le vrai serveur — un faux qui accepte n'importe quel nom la masque.
 */
async function pousser(syncBase: string, code: string, data: unknown, baseHash: string | null) {
  return fetch(cheminDuDepot(syncBase, code, "push"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data, baseHash }),
  });
}

/** Dépose le chiffré. Aucune identité requise : le futur invité n'en a pas encore. */
export async function deposer(syncBase: string, code: string, depot: DepotChiffre): Promise<void> {
  const rép = await pousser(syncBase, code, depot, null);
  if (!rép.ok) throw new InvitationCourteError("reseau", `dépôt refusé — HTTP ${rép.status}`);
}

/**
 * Récupère un dépôt.
 *
 * Un document absent — jamais écrit, ou expiré — se lit `{hash:"",data:{}}`,
 * jamais un 404 : c'est l'absence de hash qui est le signal fiable.
 */
export async function recuperer(syncBase: string, code: string): Promise<DepotChiffre> {
  let lu: { hash?: string; data?: Partial<DepotChiffre> } | null = null;
  try {
    const rép = await fetch(cheminDuDepot(syncBase, code, "pull"), { cache: "no-store" });
    if (!rép.ok) throw new Error(`HTTP ${rép.status}`);
    lu = (await rép.json()) as { hash?: string; data?: Partial<DepotChiffre> };
  } catch (err) {
    throw new InvitationCourteError("reseau", `dépôt injoignable (${err instanceof Error ? err.message : String(err)})`);
  }
  if (!lu?.hash || !lu.data?.iv || !lu.data?.ct) {
    throw new InvitationCourteError("depot-absent", "aucun dépôt à ce code — jamais émis, expiré, ou retiré");
  }
  return { iv: lu.data.iv, ct: lu.data.ct };
}

/**
 * Retire un dépôt avant son terme. Un dépôt vidé se lit comme un dépôt absent.
 *
 * L'écriture est en CAS : pousser avec `hash: null` sur un document qui existe
 * rend un 409 `hash_mismatch`, et le dépôt survivrait au retrait. On repart
 * donc du `currentHash` que le serveur rend dans le corps du conflit.
 */
export async function retirer(syncBase: string, code: string): Promise<void> {
  let rép = await pousser(syncBase, code, {}, null);
  if (rép.status === 409) {
    const conflit = (await rép.json().catch(() => null)) as { currentHash?: string } | null;
    if (!conflit?.currentHash) {
      throw new InvitationCourteError("reseau", "retrait refusé — le conflit ne porte pas le hash courant");
    }
    rép = await pousser(syncBase, code, {}, conflit.currentHash);
  }
  if (!rép.ok) throw new InvitationCourteError("reseau", `retrait refusé — HTTP ${rép.status}`);
}

/** `https://origine/i/<code>#<clé>` — environ 81 caractères. */
export function construireLeLienCourt(origine: string, code: string, cle: string): string {
  return `${origine.replace(/\/$/, "")}/i/${code}#${cle}`;
}

export interface LienCourt {
  code: string;
  cle: string;
}

/** Reconnaît la forme courte dans une URL. Rend `null` si ce n'en est pas une. */
export function lireLeLienCourt(url: string): LienCourt | null {
  try {
    const u = new URL(url);
    const code = normaliserLeCode(u.pathname.match(/\/i\/([^/?#]+)/)?.[1] ?? "");
    if (!code) return null;
    // Un fragment partagé peut traîner du texte derrière la clé : on ne garde
    // que la suite base64url de tête.
    const cle = u.hash.slice(1).match(/^[A-Za-z0-9_-]+/)?.[0];
    return cle ? { code, cle } : null;
  } catch {
    return null;
  }
}

/** Récupère puis déchiffre : le jeton, tel qu'`encodeSpaceInviteLink` l'avait rendu. */
export async function ouvrirLInvitationCourte(syncBase: string, lien: LienCourt): Promise<string> {
  return dechiffrerLeDepot(await recuperer(syncBase, lien.code), lien.cle);
}

/**
 * Décode un jeton d'invitation, quel que soit son emballage.
 *
 * Les deux formes aboutissent au même jeton : le format long le porte en clair
 * dans le fragment, la forme courte le fait passer par un dépôt chiffré.
 * Tolérant d'un fragment pollué par un partage — seule la suite base64url de
 * tête est décodée.
 */
export function decoderLeJeton(fragment: string): SpaceInviteLinkToken | null {
  try {
    const jeton = fragment.match(/^[A-Za-z0-9_-]+/)?.[0];
    return jeton ? decodeSpaceInviteLink(jeton) : null;
  } catch {
    return null;
  }
}
