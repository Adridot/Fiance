import { create } from "zustand";
import { secureDelete, secureGet, secureSet } from "@/lib/secure-store";
import type { CompteLocal } from "@/lib/compte";

export const CLE_DU_COMPTE = "fiance_compte";

/** `deplace` : le mot de passe a changé sur un autre appareil, ce coffre-ci est vidé. */
export type EtatDuCoffre = "a-jour" | "en-attente" | "echec" | "deplace";

interface CompteState {
  compte: CompteLocal | null;
  charge: boolean;
  coffre: EtatDuCoffre;
  /** Incrémenté par `relancer` : fait redémarrer `SyncInitializer`. */
  relance: number;

  charger: () => Promise<void>;
  poser: (compte: CompteLocal) => Promise<void>;
  oublier: () => Promise<void>;
  marquerLeCoffre: (etat: EtatDuCoffre) => void;
  relancer: () => void;
}

function compteValide(valeur: unknown): valeur is CompteLocal {
  const c = valeur as Partial<CompteLocal> | null;
  return !!c && typeof c.identifiant === "string" && typeof c.locator === "string" && typeof c.cle === "string";
}

export const useCompteStore = create<CompteState>((set) => ({
  compte: null,
  charge: false,
  coffre: "a-jour",
  relance: 0,

  charger: async () => {
    let compte: CompteLocal | null = null;
    try {
      const brut = await secureGet(CLE_DU_COMPTE);
      const lu = brut ? (JSON.parse(brut) as unknown) : null;
      if (compteValide(lu)) compte = { identifiant: lu.identifiant, locator: lu.locator, cle: lu.cle };
    } catch {
      /* stockage illisible : comme sans compte */
    }
    set({ compte, charge: true });
  },

  poser: async (compte) => {
    await secureSet(CLE_DU_COMPTE, JSON.stringify(compte));
    set({ compte, charge: true, coffre: "a-jour" });
  },

  oublier: async () => {
    await secureDelete(CLE_DU_COMPTE);
    set({ compte: null, coffre: "a-jour" });
  },

  marquerLeCoffre: (coffre) => set({ coffre }),

  relancer: () => set((s) => ({ relance: s.relance + 1 })),
}));
