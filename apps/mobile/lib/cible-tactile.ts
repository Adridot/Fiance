/** Côté minimal d'une cible tactile. `hitSlop` est inerte sur `Pressable` en react-native-web : la cible est sa boîte DOM. */
export const CIBLE_TACTILE = 44;

/** Marge négative qui laisse une cible de 44 px n'occuper que `empreinte` px dans la mise en page. */
export function debordement(empreinte: number): number {
  return Math.min(0, (empreinte - CIBLE_TACTILE) / 2);
}
