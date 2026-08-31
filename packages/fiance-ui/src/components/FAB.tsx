import React from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { theme as GP } from "../garden-theme";

interface FABProps {
  onPress: () => void;
  icon?: LucideIcon;
}

export function FAB({ onPress, icon: Icon = Plus }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        // GP.olive est le primaire assombri : c'est l'état enfoncé du bouton,
        // pas le vert de confirmation. Il remplace un littéral brun dérivé de
        // l'ancien primaire, qui serait resté brun sous un bouton devenu vert
        // sans lever la moindre erreur.
        backgroundColor: pressed ? GP.olive : GP.clay,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: GP.clay,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      })}
    >
      <Icon size={26} color="white" />
    </Pressable>
  );
}
