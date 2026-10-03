import React from "react";
import { View } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2 } from "lucide-react-native";

import { Seo } from "@/components/Seo";
import { PageHeader } from "@/components/PageHeader";
import { Bouton } from "@/components/compte/Bouton";
import { theme as GP } from "@/lib/theme";

/** MODIFICATION LOCALE — l'issue d'un renouvellement d'accès, dite avant de rejoindre le mariage. */
export function AccesRenouvele({ weddingName, onContinuer }: { weddingName?: string; onContinuer: () => void }) {
  const { t } = useTranslation("common");
  return (
    <View className="flex-1 bg-accent-paper justify-center px-6" testID="acces-renouvele">
      <Seo title="Fiancé" description="" noindex />
      <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
            <CheckCircle2 size={36} color={GP.clay} />
          </View>
          <PageHeader
            eyebrow={t("join.inviteEyebrow")}
            title={t("join.accesRenouvele")}
            tagline={weddingName ? t("join.accesRenouveleDetail", { name: weddingName }) : t("join.accesRenouveleDetailSansNom")}
            titleSize={24}
            style={{ paddingHorizontal: 0, paddingTop: 0 }}
          />
        </View>
        <Bouton
          libelle={t("join.allerAuMariage")}
          icone={<ArrowRight size={20} color="#fff" />}
          onPress={onContinuer}
          testID="acces-renouvele-continuer"
        />
      </View>
    </View>
  );
}
