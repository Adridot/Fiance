export type DisponibiliteDuLien =
  | "indisponible"
  | "sync-desactivee"
  | "attente-de-la-sync"
  | "pret";

export type EtatDuBoutonRsvp = "pret" | "preparation" | "echec" | "sync-desactivee" | "indisponible";

/** Peut-on fabriquer le lien maintenant ? Sinon, qu'attend-on ? */
export function disponibiliteDuLien(e: {
  aUnInvite: boolean;
  aUneGraine: boolean;
  synchroDesactivee: boolean;
  synchroPrete: boolean;
}): DisponibiliteDuLien {
  if (!e.aUnInvite || !e.aUneGraine) return "indisponible";
  if (e.synchroDesactivee) return "sync-desactivee";
  if (!e.synchroPrete) return "attente-de-la-sync";
  return "pret";
}

/** Ce que montre le bouton « Lien RSVP » : jamais un bouton actif qui ne fait rien. */
export function etatDuBoutonRsvp(e: {
  url: string | null;
  disponibilite: DisponibiliteDuLien;
  echec: boolean;
}): EtatDuBoutonRsvp {
  if (e.url) return "pret";
  if (e.disponibilite === "indisponible" || e.disponibilite === "sync-desactivee") return e.disponibilite;
  return e.echec ? "echec" : "preparation";
}
