import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react-native";

import { Seo } from "@/components/Seo";
import { PageHeader } from "@/components/PageHeader";
import { theme as GP } from "@/lib/theme";

/**
 * MODIFICATION LOCALE — l'écran remplace une redirection SILENCIEUSE.
 *
 * Une invitation vers un espace déjà rejoint renvoyait vers l'accueil sans un
 * mot. Vu de la personne, c'est indiscernable d'un lien qui ne marche pas —
 * c'est d'ailleurs ainsi que le propriétaire l'a lu en testant son propre lien.
 * L'écran de jonction ne doit JAMAIS rediriger de lui-même quand une invitation
 * lui a été présentée : elle doit toujours pouvoir lire ce qu'il en est advenu.
 */
export function InvitationDejaAcceptee({
  weddingName,
  onContinuer,
}: {
  weddingName?: string;
  onContinuer: () => void;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  void router;

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <Seo title="Fiancé" description="" noindex />
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color={GP.clay} />
        </View>
        <PageHeader
          eyebrow={t("join.inviteEyebrow")}
          title={t("join.dejaMembre")}
          tagline={weddingName ? t("join.dejaMembreDetail", { name: weddingName }) : t("join.dejaMembreDetailSansNom")}
          titleSize={24}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
      </View>

      <Pressable
        onPress={onContinuer}
        className="bg-primary-500 rounded-2xl py-4 items-center active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <Text className="text-white font-semibold text-base mr-2">{t("join.allerAuMariage")}</Text>
          <ArrowRight size={20} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}
