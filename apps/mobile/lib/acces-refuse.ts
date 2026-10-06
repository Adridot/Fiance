/**
 * Le serveur refuse de laisser lire l'espace.
 *
 * Seul un refus RÉEL du serveur compte : un cap dont l'échéance est passée côté
 * appareil peut encore être accepté, et une panne réseau ne prouve rien.
 */

export type StatutDeRefus = 401 | 403;

/** Le statut d'une erreur HTTP de refus (`StarfishHttpError`), ou `null`. */
export function statutDeRefus(err: unknown): StatutDeRefus | null {
  const statut = (err as { status?: unknown } | null)?.status;
  return statut === 401 || statut === 403 ? statut : null;
}

/**
 * Le refus à signaler, ou `null`.
 *
 * Membres seulement : le propriétaire n'a pas de lien à se faire renvoyer. Et
 * jamais pour un accès remplacé pendant la lecture — le refus visait l'ancien.
 */
export function refusASignaler(
  err: unknown,
  contexte: { membre: boolean; accesInchange: boolean },
): StatutDeRefus | null {
  if (!contexte.membre || !contexte.accesInchange) return null;
  return statutDeRefus(err);
}
