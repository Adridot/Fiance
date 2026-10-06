const MARGE = 8;
const ECART = 4;

export interface PlacementDuMenu {
  top: number;
  right: number;
  maxWidth: number;
  maxHeight: number;
}

/** Sous le déclencheur, bord droit aligné, jamais hors de la fenêtre ; au-delà de `maxHeight` le menu défile. */
export function placerLeMenu(
  declencheur: { right: number; bottom: number },
  fenetre: { largeur: number; hauteur: number },
): PlacementDuMenu {
  const top = declencheur.bottom + ECART;
  const right = Math.max(MARGE, fenetre.largeur - declencheur.right);
  return {
    top,
    right,
    maxWidth: Math.max(0, fenetre.largeur - right - MARGE),
    maxHeight: Math.max(0, fenetre.hauteur - top - MARGE),
  };
}

/** Item à focaliser après une touche de navigation, ou `null` si la touche n'en est pas une. `courant` vaut -1 sans focus. */
export function indexApresTouche(touche: string, courant: number, total: number): number | null {
  if (total <= 0) return null;
  switch (touche) {
    case "ArrowDown":
      return (courant + 1) % total;
    case "ArrowUp":
      return courant <= 0 ? total - 1 : courant - 1;
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}
