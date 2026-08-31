/**
 * Ce qu'un appareil peut déchiffrer, et pourquoi une lecture a échoué.
 *
 * Le keyring est versionné par époques ; le contenu ne l'est pas. Chaque
 * document scellé porte son `_epoch` EN CLAIR dans l'enveloppe, hors
 * chiffrement. Un appareil peut donc comparer l'époque d'un document à celles
 * dont il détient la clé enveloppée, sans posséder aucune de ces clés — et
 * produire un diagnostic exact au lieu de dépendre du message d'erreur d'une
 * dépendance vendorisée.
 */

import { useAccesChiffreStore } from "@/store/useAccesChiffreStore";

/** Enveloppe telle que le serveur la stocke : `{ _encrypted, _epoch }`. */
export interface EnveloppeScellee {
  _encrypted?: unknown;
  _epoch?: unknown;
}

interface EpoqueDuKeyring {
  wrappedKeys?: { subKem?: unknown }[];
}

/** Le document `_keyring` d'un espace, tel que `starfish-keyring` l'écrit. */
export interface DocumentKeyring {
  currentEpoch?: unknown;
  epochs?: Record<string, EpoqueDuKeyring>;
}

/** Les trois façons dont une lecture échoue, et qui n'ont pas le même remède. */
export type EchecDeLecture =
  /** Le serveur n'a pas ce document. Un espace jeune est dans ce cas, sans anomalie. */
  | "absent"
  /** Le document est scellé sous une époque dont cet appareil n'a pas la clé. */
  | "epoque-hors-de-portee"
  /** Réseau, serveur, ou tout échec que l'époque n'explique pas. Jamais avéré. */
  | "reseau";

/** L'`_epoch` en clair d'une enveloppe, ou `null` si elle n'en porte pas. */
export function epoqueDeLEnveloppe(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const brut = (data as EnveloppeScellee)._epoch;
  return typeof brut === "number" && Number.isFinite(brut) ? brut : null;
}

/** L'époque courante déclarée par le keyring, ou `null`. */
export function epoqueCourante(keyring: unknown): number | null {
  if (!keyring || typeof keyring !== "object") return null;
  const brut = (keyring as DocumentKeyring).currentEpoch;
  return typeof brut === "number" && Number.isFinite(brut) ? brut : null;
}

/**
 * Les époques dont ce destinataire détient la clé enveloppée.
 *
 * Une époque où sa clé publique KEM apparaît plusieurs fois est écartée :
 * `createKeyringEncryptor` fait de même, y voyant une falsification.
 */
export function epoquesDetenues(keyring: unknown, kemPubHex: string): Set<number> {
  const out = new Set<number>();
  if (!keyring || typeof keyring !== "object" || !kemPubHex) return out;
  const epochs = (keyring as DocumentKeyring).epochs;
  if (!epochs || typeof epochs !== "object") return out;
  for (const [cle, epoque] of Object.entries(epochs)) {
    const n = Number.parseInt(cle, 10);
    if (!Number.isFinite(n)) continue;
    const clefs = Array.isArray(epoque?.wrappedKeys) ? epoque.wrappedKeys : [];
    if (clefs.filter((k) => k?.subKem === kemPubHex).length === 1) out.add(n);
  }
  return out;
}

export interface LectureAClasser {
  /** Le hash rendu par le serveur, quand l'appelant l'a. Vide = document inexistant. */
  hash?: string | null;
  /** L'enveloppe brute, non déchiffrée. */
  data?: unknown;
  /** Ce que le pull ou le déchiffrement a levé, s'il a levé. */
  erreur?: unknown;
  /** Les époques détenues par cet appareil ; `null` si le keyring est illisible. */
  epoquesDetenues?: Set<number> | null;
}

/**
 * Classe un échec de lecture.
 *
 * L'ordre compte : un document absent n'est pas un échec de clé, et une erreur
 * réseau ne prouve rien. Seule une époque connue ET hors de portée est avérée.
 */
export function classerEchecDeLecture(lecture: LectureAClasser): EchecDeLecture {
  const { hash, data, erreur, epoquesDetenues: detenues } = lecture;

  // Un document absent se lit `{hash:"",data:{}}`, jamais un 404.
  const vide = !data || typeof data !== "object" || Object.keys(data).length === 0;
  const sansHash = hash !== undefined && !hash;
  if (vide || sansHash) return erreur ? "reseau" : "absent";

  const epoque = epoqueDeLEnveloppe(data);
  if (epoque !== null && detenues && !detenues.has(epoque)) return "epoque-hors-de-portee";

  return "reseau";
}

/**
 * Le garde-fou du propriétaire : seul un échec AVÉRÉ bloque les écritures.
 *
 * Une panne réseau ou un document absent ne doivent jamais verrouiller
 * quelqu'un hors de son propre espace.
 */
export function leveLEtatIllisible(cas: EchecDeLecture): boolean {
  return cas === "epoque-hors-de-portee";
}

// ---------------------------------------------------------------------------
// Raccordement — ce que `space-sync.ts` appelle
// ---------------------------------------------------------------------------

interface SessionMinimale {
  layout: { keyringPull: (spaceId: string) => string };
  keys: { kemPub: string };
}

interface ClientDePull {
  pull: (path: string) => Promise<{ data?: unknown } | null>;
}

/**
 * Les époques que cet appareil détient sur cet espace, lues dans le `_keyring`.
 *
 * Rend `null` — et non un ensemble vide — dès que le keyring est illisible ou
 * ne nomme pas ce destinataire : un ensemble vide rendrait TOUT document hors
 * de portée et verrouillerait l'appareil sur une simple panne de lecture.
 */
export async function epoquesDetenuesDeLEspace(
  session: SessionMinimale,
  spaceId: string,
  client: ClientDePull,
  entreeDAcces?: { kind?: string; kemPub?: string } | null,
): Promise<Set<number> | null> {
  try {
    const kemPub =
      entreeDAcces?.kind === "link" && entreeDAcces.kemPub ? entreeDAcces.kemPub : session.keys.kemPub;
    const res = await client.pull(session.layout.keyringPull(spaceId));
    const keyring = res?.data;
    if (!keyring) return null;
    const detenues = epoquesDetenues(keyring, kemPub);
    return detenues.size ? detenues : null;
  } catch {
    return null;
  }
}

/**
 * Classe une lecture et met l'état à jour. Le point d'appel de `space-sync.ts`.
 *
 * Une lecture réussie efface l'état de sa collection : c'est ainsi qu'un
 * rescellement rend la main sans qu'on ait à vider quoi que ce soit.
 */
export function signalerLecture(collection: string, lecture: LectureAClasser | null): EchecDeLecture | null {
  const magasin = useAccesChiffreStore.getState();
  if (lecture === null) {
    magasin.marquerLisible(collection);
    return null;
  }
  const cas = classerEchecDeLecture(lecture);
  if (leveLEtatIllisible(cas)) magasin.marquerIllisible(collection, cas, epoqueDeLEnveloppe(lecture.data));
  else magasin.marquerLisible(collection);
  return cas;
}

/**
 * Les collections que chaque surface d'écran écrit.
 *
 * `permissions.ts` accorde par surface, l'état d'accès se tient par collection :
 * cette table est le seul point où les deux se rencontrent. Une surface dont
 * AUCUNE collection n'est illisible reste éditable — le refus ne punit jamais
 * plus large que le défaut.
 */
export const COLLECTIONS_PAR_SURFACE: Record<string, readonly string[]> = {
  guests: [
    "guest", "guestGroup", "household", "table", "invitationType", "communication",
    "communicationTemplate", "guestMealSelection", "seatingConstraint", "accommodation",
  ],
  vendors: ["vendor", "quotePricing", "vendorPayment"],
  planning: [
    "taskCategory", "task", "agendaEvent", "dayOfItem", "weddingEvent", "legalMilestone",
    "document", "ceremonyItem", "speech", "playlistTrack",
  ],
  budget: ["vendor", "quotePricing", "vendorPayment"],
  ideas: ["ideaCollection", "idea", "honeymoonPlan"],
  gifts: ["gift"],
};

/** Vrai quand au moins une collection de cette surface est illisible. */
export function surfaceIllisible(surface: string, illisibles: Record<string, unknown>): boolean {
  const collections = COLLECTIONS_PAR_SURFACE[surface];
  if (!collections) return false;
  return collections.some((c) => c in illisibles);
}
