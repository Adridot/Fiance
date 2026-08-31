import { create } from "zustand";

import type { EchecDeLecture } from "@/lib/acces-chiffre";

/**
 * L'état « lecture impossible », par collection et jamais global.
 *
 * Un appareil qui déchiffre les invités mais pas le budget doit pouvoir éditer
 * les invités : un refus global punirait plus large que le défaut. Non persisté
 * — l'état se reconstruit à chaque hydratation, et un rescellement doit pouvoir
 * l'effacer sans qu'on ait à vider quoi que ce soit.
 */
interface AccesChiffreState {
  /** Collections dont le contenu n'a pas pu être déchiffré, par type d'entité. */
  illisibles: Record<string, EchecDeLecture>;
  /** L'époque sous laquelle le contenu illisible est scellé, pour le message. */
  epoqueHorsDePortee: number | null;
  marquerIllisible: (collection: string, cas: EchecDeLecture, epoque?: number | null) => void;
  marquerLisible: (collection: string) => void;
  reinitialiser: () => void;
}

export const useAccesChiffreStore = create<AccesChiffreState>((set) => ({
  illisibles: {},
  epoqueHorsDePortee: null,

  marquerIllisible: (collection, cas, epoque = null) =>
    set((etat) =>
      etat.illisibles[collection] === cas && etat.epoqueHorsDePortee === (epoque ?? etat.epoqueHorsDePortee)
        ? etat
        : {
            illisibles: { ...etat.illisibles, [collection]: cas },
            epoqueHorsDePortee: epoque ?? etat.epoqueHorsDePortee,
          },
    ),

  marquerLisible: (collection) =>
    set((etat) => {
      if (!(collection in etat.illisibles)) return etat;
      const { [collection]: _retire, ...reste } = etat.illisibles;
      return {
        illisibles: reste,
        epoqueHorsDePortee: Object.keys(reste).length ? etat.epoqueHorsDePortee : null,
      };
    }),

  reinitialiser: () => set({ illisibles: {}, epoqueHorsDePortee: null }),
}));

/** Vrai quand cette collection est illisible — la seule question que pose une écriture. */
export function collectionIllisible(collection: string): boolean {
  return collection in useAccesChiffreStore.getState().illisibles;
}

/** Vrai dès qu'une collection est illisible : ce qui porte le bandeau. */
export function lectureImpossible(): boolean {
  return Object.keys(useAccesChiffreStore.getState().illisibles).length > 0;
}
