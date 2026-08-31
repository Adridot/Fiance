import { create } from "zustand";

interface RevenueCatState {
  /** Whether the wedding owner's RevenueCat customer has the premium entitlement active. */
  isPremium: boolean;
  setPremium: (isPremium: boolean) => void;
}

/**
 * MODIFICATION LOCALE — instance familiale auto-hébergée (mariage.didot.io).
 *
 * En amont, cet état est piloté par le listener RevenueCat et vaut `false`
 * tant qu'aucun abonnement n'est actif. Or la sync multi-appareils est gardée
 * derrière `isPremium()` (lib/premium.ts) : sur un build sans clé RevenueCat,
 * elle ne s'initialise donc jamais, et le serveur de sync auto-hébergé ne sert
 * à rien.
 *
 * Ce build est distribué sous GPLv3 et tourne sur une infra privée pour un
 * usage familial : l'entitlement est forcé à `true` et `setPremium` ignore les
 * remises à zéro (elles viennent d'un RevenueCat non configuré, pas d'une
 * décision de l'utilisateur).
 *
 * Pour revenir au comportement d'origine : `git checkout -- apps/mobile/store/useRevenueCatStore.ts`.
 */
export const useRevenueCatStore = create<RevenueCatState>((set) => ({
  isPremium: true,
  setPremium: () => set({ isPremium: true }),
}));
