import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme as GP } from "@/lib/theme";
import { useAccesChiffreStore } from "@/store/useAccesChiffreStore";

/**
 * Bandeau d'un appareil qui ne peut pas déchiffrer le contenu de l'espace.
 *
 * Distinct de `ReadOnlyBanner` : celui-là dit « vous n'avez pas le droit
 * d'écrire », celui-ci « votre invitation ne donne pas accès à ce contenu ».
 * Et il s'affiche à TOUTES les largeurs — un mariage qui paraît vide alors
 * qu'il ne l'est pas est le défaut que ce changement corrige.
 */
export function BandeauLectureImpossible() {
  const { t } = useTranslation("settings");
  const illisibles = useAccesChiffreStore((s) => s.illisibles);

  if (Object.keys(illisibles).length === 0) return null;

  return (
    <View style={styles.bandeau}>
      <Text style={styles.texte}>{t("chiffrementHorsDePortee")}</Text>
      <Text style={styles.geste}>{t("chiffrementHorsDePorteeGeste")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bandeau: {
    width: "100%",
    zIndex: 999,
    backgroundColor: GP.mustardSoft, // attention — la même convention que le pense-bête
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  texte: {
    color: GP.mustard, // ambre sombre, lisible sur son fond clair
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  geste: {
    color: GP.mustard,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 2,
  },
});
