import React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { CIBLE_TACTILE } from "@/lib/cible-tactile";

interface ZoneTactileProps extends Omit<PressableProps, "style" | "children"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Cible d'au moins 44 px autour d'un dessin plus petit (puce, rangée, lien) : le dessin reste tel quel, centré. */
export function ZoneTactile({ children, style, accessibilityRole = "button", ...reste }: ZoneTactileProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      {...reste}
      style={({ pressed }) => [
        { minHeight: CIBLE_TACTILE, minWidth: CIBLE_TACTILE, justifyContent: "center", opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
