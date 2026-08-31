/**
 * Reconnaître une invitation, et savoir dire pourquoi quand on n'y arrive pas.
 *
 * L'écran de jonction se bornait à déclarer une invitation « invalide », quelle
 * que soit la cause. Or les trois causes n'appellent pas le même geste : une
 * adresse tronquée se rattrape en saisissant le code, une invitation expirée
 * demande qu'on en réclame une neuve, et un lien qui ne veut rien dire n'est
 * pas la même chose qu'un dépôt qu'on a retiré.
 */

import type { SpaceInviteLinkToken } from "@fiance/sdk";

import {
  InvitationCourteError,
  decoderLeJeton,
  lireLeLienCourt,
  ouvrirLInvitationCourte,
  type EchecDInvitationCourte,
} from "@/lib/invitation-courte";

export type CauseDEchec = "incomplete" | "expiree" | "invalide";

const CAUSE_PAR_ECHEC: Record<EchecDInvitationCourte, CauseDEchec> = {
  "depot-absent": "expiree",
  "depot-illisible": "incomplete",
  reseau: "invalide",
};

export type ResolutionDInvitation =
  | { jeton: SpaceInviteLinkToken }
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

/** Le repli : un code et sa clé, saisis ou collés à la main. */
export async function resoudreLeCode(
  syncBase: string,
  code: string,
  cle: string,
): Promise<ResolutionDInvitation> {
  try {
    const jeton = decoderLeJeton(await ouvrirLInvitationCourte(syncBase, { code, cle }));
    return jeton ? { jeton } : { cause: "invalide" };
  } catch (err) {
    return { cause: err instanceof InvitationCourteError ? CAUSE_PAR_ECHEC[err.cas] : "invalide" };
  }
}
