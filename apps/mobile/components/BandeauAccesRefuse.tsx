import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react-native";

import { theme as GP } from "@/lib/theme";
import { useAccesRefuseStore } from "@/store/useAccesRefuseStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

/**
 * MODIFICATION LOCALE — le serveur refuse de laisser lire ce mariage à cet appareil.
 *
 * Sans lui, un accès expiré se présentait comme un mariage vide. Distinct de la
 * lecture seule (écriture refusée) et du contenu illisible (époque hors de portée).
 */
export function BandeauAccesRefuse({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const refus = useAccesRefuseStore((s) => s.refus);
  const actif = useWeddingRegistryStore((s) => {
    const r = s.registry;
    return r?.weddings.find((w) => w.id === r.activeWeddingId) ?? null;
  });

  if (!refus || actif?.role !== "member" || actif.spaceId !== refus.spaceId) return null;

  return (
    <View
      testID="bandeau-acces-expire"
      accessibilityRole="alert"
      className={`rounded-2xl px-4 py-3 border flex-row items-center ${className ?? ""}`}
      style={{ backgroundColor: GP.mustardSoft, borderColor: `${GP.mustard}33` }}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${GP.mustard}1f` }}>
        <AlertTriangle size={20} color={GP.mustard} />
      </View>
      {/* 401 : cap expiré, renouvelable. 403 : retiré du registre, rien ne sera réémis. */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">
          {t(refus.statut === 403 ? "accesRefuse.titreInvalide" : "accesRefuse.titre")}
        </Text>
        <Text className="text-xs text-mute mt-0.5">
          {t(refus.statut === 403 ? "accesRefuse.detailInvalide" : "accesRefuse.detail")}
        </Text>
      </View>
    </View>
  );
}
