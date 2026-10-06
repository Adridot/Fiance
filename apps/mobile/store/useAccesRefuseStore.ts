import { create } from "zustand";

import type { StatutDeRefus } from "@/lib/acces-refuse";

/**
 * L'espace dont le serveur a refusé la lecture à cet appareil. Non persisté :
 * chaque hydratation le repose ou le lève. Distinct de `useSyncAccessStore`
 * (écriture refusée, lecture possible).
 */
interface AccesRefuseState {
  refus: { spaceId: string; statut: StatutDeRefus } | null;
  signaler: (spaceId: string, statut: StatutDeRefus) => void;
  /** Sans argument, lève tout refus ; sinon seulement celui de cet espace. */
  lever: (spaceId?: string) => void;
}

export const useAccesRefuseStore = create<AccesRefuseState>((set) => ({
  refus: null,
  signaler: (spaceId, statut) =>
    set((etat) =>
      etat.refus?.spaceId === spaceId && etat.refus.statut === statut ? etat : { refus: { spaceId, statut } },
    ),
  lever: (spaceId) =>
    set((etat) => (!etat.refus || (spaceId !== undefined && etat.refus.spaceId !== spaceId) ? etat : { refus: null })),
}));
