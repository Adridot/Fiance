import React from "react";
import type { ViewStyle } from "react-native";
import { View } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { demiEcart } from "../../utils/cible-tactile";
import { basculeWeb } from "./BasculeVisuelle";

/** Hauteur dessinée d'une puce : `py-2`, une ligne `text-sm` (20 px) et la bordure. */
const HAUTEUR_PUCE = 38;

/** Ce que la cible d'une puce dépasse de son dessin, en haut comme en bas. */
export const DEPASSEMENT_PUCE = demiEcart(HAUTEUR_PUCE);

/**
 * Web uniquement : puce d'un choix unique, dont la cible (`role` radio) dépasse le dessin
 * pour atteindre 44 px. `cible` : style de ce dépassement, que le conteneur doit pouvoir
 * afficher (une ScrollView horizontale rognerait une marge négative).
 */
export function PuceWeb({
  active,
  onPress,
  disabled = false,
  className,
  cible,
  children,
}: {
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Classes du dessin (fond, bordure, rembourrage). */
  className: string;
  cible: ViewStyle;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      {...basculeWeb("radio", active, disabled ? undefined : onPress)}
      onPress={onPress}
      disabled={disabled}
      style={cible}
    >
      <View className={className}>{children}</View>
    </Pressable>
  );
}
