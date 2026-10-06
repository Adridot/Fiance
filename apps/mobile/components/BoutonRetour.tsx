import React from "react";
import { Platform, Pressable, type ColorValue } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { revenir } from "@/lib/revenir";
import { afficheUnRetour, repliDe, type PileAvecRetour } from "@/lib/repli-des-ecrans";

interface BoutonRetourProps {
  repli: Href;
  couleur?: string;
}

/** Retour d'en-tête : visible même sans historique, cible de 44×44 (hitSlop est inerte sur le web). */
export function BoutonRetour({ repli, couleur = "#111827" }: BoutonRetourProps) {
  const router = useRouter();
  const { t } = useTranslation("common");
  return (
    <Pressable
      onPress={() => revenir(router, repli)}
      accessibilityRole="button"
      accessibilityLabel={t("back")}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <ChevronLeft size={26} color={couleur} />
    </Pressable>
  );
}

/** Sur le web seulement : le bouton natif des piles garde son rendu sur iOS/Android. */
export function optionsDeRetour(pile: PileAvecRetour, ecran: string) {
  if (Platform.OS !== "web" || !afficheUnRetour(pile, ecran)) return {};
  return {
    headerLeft: ({ tintColor }: { tintColor?: ColorValue }) => (
      <BoutonRetour
        repli={repliDe(pile, ecran)}
        couleur={typeof tintColor === "string" ? tintColor : undefined}
      />
    ),
  };
}
