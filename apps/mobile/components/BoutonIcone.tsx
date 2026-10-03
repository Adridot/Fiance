import React from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { CIBLE_TACTILE, debordement } from "@/lib/cible-tactile";

interface BoutonIconeProps {
  /** Obligatoire : le bouton n'a pas de texte. */
  libelle: string;
  onPress: () => void;
  /** L'icône, à sa taille d'origine. */
  children: React.ReactNode;
  /** Hauteur occupée dans la mise en page ; la cible mesure toujours 44 × 44 et déborde du reste. */
  empreinte?: number;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function BoutonIcone({
  libelle,
  onPress,
  children,
  empreinte = 32,
  disabled,
  testID,
  style,
}: BoutonIconeProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      style={({ pressed }) => [
        {
          width: CIBLE_TACTILE,
          height: CIBLE_TACTILE,
          marginVertical: debordement(empreinte),
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          opacity: pressed ? 0.55 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
