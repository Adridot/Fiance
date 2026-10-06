import { CIBLE_MIN, demiEcart } from "@fiance/ui/utils/cible-tactile";

export * from "@fiance/ui/utils/cible-tactile";

/** Côté minimal d'une cible tactile. `hitSlop` est inerte sur `Pressable` en react-native-web : la cible est sa boîte DOM. */
export const CIBLE_TACTILE = CIBLE_MIN;

/** Marge négative qui laisse une cible de 44 px n'occuper que `empreinte` px dans la mise en page. */
export function debordement(empreinte: number): number {
  return 0 - demiEcart(empreinte);
}
