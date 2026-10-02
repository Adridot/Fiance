import { create } from "zustand";

interface ParcoursDAccueilState {
  /** Levé tant qu'un parcours d'invitation tient l'écran d'accueil : `_layout` ne redirige pas vers `/home`. */
  enCours: boolean;
  poser: (enCours: boolean) => void;
}

export const useParcoursDAccueilStore = create<ParcoursDAccueilState>((set) => ({
  enCours: false,
  poser: (enCours) => set({ enCours }),
}));
