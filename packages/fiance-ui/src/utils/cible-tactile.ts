/** Plus petite cible tactile retenue : 44 pt (recommandation d'Apple). */
export const CIBLE_MIN = 44;

/** Ce qu'il faut ajouter de chaque côté pour qu'une cible de `taille` px atteigne `min` px. */
export function demiEcart(taille: number, min = CIBLE_MIN): number {
  return Math.max(0, Math.ceil((min - taille) / 2));
}

export interface Cotes {
  haut?: number;
  bas?: number;
  gauche?: number;
  droite?: number;
}

/** Marges et rembourrages que l'élément porte déjà par ses classes : un style en ligne les remplace. */
export interface Existant {
  marges?: Cotes;
  rembourrages?: Cotes;
}

export interface StyleAgrandi {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

const COTES = [
  ["haut", "paddingTop", "marginTop"],
  ["bas", "paddingBottom", "marginBottom"],
  ["gauche", "paddingLeft", "marginLeft"],
  ["droite", "paddingRight", "marginRight"],
] as const;

/**
 * Agrandit la boîte d'un élément de `ajout` px sans déplacer ni son contenu ni ses voisins :
 * le rembourrage ajouté est repris par une marge négative. Seuls les côtés nommés sont touchés.
 */
export function agrandir(ajout: Cotes, { marges = {}, rembourrages = {} }: Existant = {}): StyleAgrandi {
  const style: StyleAgrandi = {};
  for (const [cote, padding, margin] of COTES) {
    const n = ajout[cote];
    if (n == null) continue;
    style[padding] = (rembourrages[cote] ?? 0) + n;
    style[margin] = (marges[cote] ?? 0) - n;
  }
  return style;
}

/** Porte à `CIBLE_MIN` la hauteur d'une cible de `hauteur` px, dessin et mise en page inchangés. */
export function cibleAgrandie(hauteur: number, existant: Existant = {}): StyleAgrandi {
  const e = demiEcart(hauteur);
  return agrandir({ haut: e, bas: e }, existant);
}

/** Même chose sur les deux axes, pour une cible carrée de `taille` px. */
export function cibleCarree(taille: number, existant: Existant = {}): StyleAgrandi {
  const e = demiEcart(taille);
  return agrandir({ haut: e, bas: e, gauche: e, droite: e }, existant);
}
