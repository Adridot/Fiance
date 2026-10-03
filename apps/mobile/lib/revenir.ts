import type { Href } from "expo-router";

export type RouteurDeRetour = {
  back: () => void;
  canGoBack: () => boolean;
  replace: (href: Href) => void;
};

let navigations = 0;
let derniereRoute: string | null = null;

export function noterLaRoute(chemin: string): void {
  if (derniereRoute !== null && chemin !== derniereRoute) navigations++;
  derniereRoute = chemin;
}

export function aNavigueDepuisLeChargement(): boolean {
  return navigations > 0;
}

// `canGoBack()` reste vrai sur tout onglet autre que le premier (historique « firstRoute »
// de la barre d'onglets) : sans navigation observée, `back()` renverrait à l'accueil.
export function deciderDuRetour(e: { peutRevenir: boolean; aNavigue: boolean }): "retour" | "repli" {
  return e.peutRevenir && e.aNavigue ? "retour" : "repli";
}

export function revenir(router: RouteurDeRetour, repli: Href): void {
  const decision = deciderDuRetour({
    peutRevenir: router.canGoBack(),
    aNavigue: aNavigueDepuisLeChargement(),
  });
  if (decision === "retour") router.back();
  else router.replace(repli);
}
