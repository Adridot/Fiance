/**
 * Reconnaître une invitation, et savoir dire pourquoi quand on n'y arrive pas.
 *
 * Les causes n'appellent pas le même geste : une adresse tronquée se rattrape
 * en saisissant le code, une invitation expirée demande qu'on en réclame une
 * neuve, une invitation déjà utilisée renvoie à la connexion.
 */

import type { SpaceInviteLinkToken } from "@fiance/sdk";

import {
  InvitationCourteError,
  decoderLeJeton,
  lireLeLienCourt,
  normaliserLeCode,
  ouvrirLInvitationCourte,
  type EchecDInvitationCourte,
} from "@/lib/invitation-courte";

export type CauseDEchec = "incomplete" | "expiree" | "invalide" | "utilisee";

const CAUSE_PAR_ECHEC: Record<EchecDInvitationCourte, CauseDEchec> = {
  "depot-absent": "expiree",
  "depot-illisible": "incomplete",
  "depot-utilise": "utilisee",
  reseau: "invalide",
};

export type ResolutionDInvitation =
  | { jeton: SpaceInviteLinkToken; nomDuMariage?: string; nomDeLaPersonne?: string; code?: string }
  | { cause: CauseDEchec };

/** Vrai quand l'adresse désigne bien une invitation courte, fragment perdu ou non. */
export function ressembleAUneInvitationCourte(url: string): boolean {
  return /\/i\/[^/?#]+/.test(url);
}

/**
 * Résout une invitation courte : dépôt, déchiffrement, décodage.
 *
 * `jetonLong` est passé par l'appelant quand le format long a déjà répondu —
 * un lien déjà remis à quelqu'un ne doit jamais cesser de fonctionner.
 */
export async function resoudreLInvitation(
  syncBase: string,
  url: string,
  jetonLong: SpaceInviteLinkToken | null,
): Promise<ResolutionDInvitation> {
  if (jetonLong) return { jeton: jetonLong };

  const court = lireLeLienCourt(url);
  if (!court) {
    // Une adresse `/i/<code>` dont le fragment a été perdu en route : on sait
    // nommer la cause, ce que l'écran muet ne savait pas faire.
    return { cause: ressembleAUneInvitationCourte(url) ? "incomplete" : "invalide" };
  }
  return resoudreLeCode(syncBase, court.code, court.cle);
}

/** Un code et sa clé, saisis ou collés à la main. */
export async function resoudreLeCode(
  syncBase: string,
  code: string,
  cle: string,
): Promise<ResolutionDInvitation> {
  try {
    const ouvert = await ouvrirLInvitationCourte(syncBase, { code, cle });
    const jeton = decoderLeJeton(ouvert.jeton);
    if (!jeton) return { cause: "invalide" };
    return {
      jeton,
      ...(ouvert.nomDuMariage ? { nomDuMariage: ouvert.nomDuMariage } : {}),
      ...(ouvert.nomDeLaPersonne ? { nomDeLaPersonne: ouvert.nomDeLaPersonne } : {}),
      code,
    };
  } catch (err) {
    return { cause: err instanceof InvitationCourteError ? CAUSE_PAR_ECHEC[err.cas] : "invalide" };
  }
}

/**
 * Résout ce qu'une personne a collé ou tapé : lien court, lien long (même
 * noyé dans un message), « CODE#clé » ou « CODE clé ».
 */
export async function resoudreUneSaisie(syncBase: string, saisie: string): Promise<ResolutionDInvitation> {
  const texte = saisie.trim();

  const adresse = texte.match(/[a-z][a-z0-9+.-]*:\/\/\S+/i)?.[0];
  if (adresse) {
    // Le fragment d'un lien court est la clé : on ne le tente comme jeton long qu'à défaut.
    const jetonLong = lireLeLienCourt(adresse) ? null : decoderLeJeton(fragmentDe(adresse));
    return resoudreLInvitation(syncBase, adresse, jetonLong);
  }

  const dièse = texte.indexOf("#");
  let brutDuCode: string;
  let brutDeLaCle: string;
  if (dièse >= 0) {
    brutDuCode = texte.slice(0, dièse);
    brutDeLaCle = texte.slice(dièse + 1);
  } else {
    const morceaux = texte.split(/\s+/).filter(Boolean);
    brutDeLaCle = morceaux.length > 1 ? (morceaux.pop() as string) : "";
    brutDuCode = morceaux.join(" ");
  }

  const code = normaliserLeCode(brutDuCode);
  if (!code) return { cause: "invalide" };
  const cle = brutDeLaCle.trim().match(/^[A-Za-z0-9_-]+/)?.[0];
  // Un code sans sa clé n'ouvre rien : c'est une invitation incomplète, pas inconnue.
  return cle ? resoudreLeCode(syncBase, code, cle) : { cause: "incomplete" };
}

function fragmentDe(url: string): string {
  try {
    return new URL(url).hash.slice(1);
  } catch {
    return "";
  }
}
