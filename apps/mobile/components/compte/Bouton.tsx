import React from "react";
import { ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { theme as GP } from "@/lib/theme";

type Variante = "plein" | "secondaire" | "lien";

interface BoutonProps {
  libelle: string;
  onPress: () => void;
  variante?: Variante;
  enCours?: boolean;
  desactive?: boolean;
  icone?: React.ReactNode;
  testID?: string;
}

/** Cible d'au moins 44 px dans le DOM : `hitSlop` est inerte sur `Pressable` en react-native-web. */
export function Bouton({ libelle, onPress, variante = "plein", enCours, desactive, icone, testID }: BoutonProps) {
  const inactif = !!(enCours || desactive);
  const classes =
    variante === "plein"
      ? "bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
      : variante === "secondaire"
        ? "bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
        : "items-center justify-center active:opacity-70";
  const texte =
    variante === "plein" ? "text-white font-semibold text-base" : variante === "secondaire" ? "text-ink font-semibold text-base" : "text-mute text-sm underline";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif, busy: !!enCours }}
      disabled={inactif}
      onPress={onPress}
      testID={testID}
      className={classes}
      style={{ minHeight: 44, justifyContent: "center", opacity: inactif ? 0.6 : 1 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {enCours ? <ActivityIndicator size="small" color={variante === "plein" ? "#fff" : GP.clay} /> : icone}
        <Text className={texte}>{libelle}</Text>
      </View>
    </Pressable>
  );
}
