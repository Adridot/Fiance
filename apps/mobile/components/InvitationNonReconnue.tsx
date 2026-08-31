import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft } from "lucide-react-native";

import { Seo } from "@/components/Seo";
import { PageHeader } from "@/components/PageHeader";
import { theme as GP } from "@/lib/theme";
import { normaliserLeCode } from "@/lib/invitation-courte";
import type { CauseDEchec } from "@/lib/resolution-d-invitation";

/**
 * MODIFICATION LOCALE — l'écran `InvalidInvite` muet, remplacé.
 *
 * Il dit désormais LAQUELLE des trois causes s'applique, et offre un second
 * chemin qui ne dépend pas de l'intégrité de l'adresse : saisir ou coller le
 * code. Il ne redirige JAMAIS de lui-même : la personne doit toujours pouvoir
 * lire ce qu'il est advenu de son invitation.
 */
export function InvitationNonReconnue({
  cause,
  onCode,
}: {
  cause: CauseDEchec;
  onCode: (code: string, cle: string) => void;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [cle, setCle] = useState("");
  const [erreurDeSaisie, setErreurDeSaisie] = useState<string | null>(null);

  const titres: Record<CauseDEchec, [string, string]> = {
    incomplete: ["join.invitationIncomplete", "join.invitationIncompleteDetail"],
    expiree: ["join.invitationExpiree", "join.invitationExpireeDetail"],
    invalide: ["join.invitationInvalide", "join.invitationInvalideDetail"],
  };
  const [titre, detail] = titres[cause];

  // Une invitation expirée ne se rattrape pas par un code : il faut en demander
  // une neuve. Le repli n'a de sens que pour une adresse abîmée.
  const offrirLeRepli = cause !== "expiree";

  const valider = () => {
    const codeNormalisé = normaliserLeCode(code);
    const cleNettoyée = cle.trim().replace(/^#/, "").match(/^[A-Za-z0-9_-]+/)?.[0] ?? "";
    if (!codeNormalisé || !cleNettoyée) { setErreurDeSaisie(t("join.codeIncomplet")); return; }
    setErreurDeSaisie(null);
    onCode(codeNormalisé, cleNettoyée);
  };

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <Seo title="Fiancé" description="" noindex />
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900 items-center justify-center mb-5">
          <AlertCircle size={36} color="#EF4444" />
        </View>
        <PageHeader
          eyebrow={t("join.inviteEyebrow")}
          title={t(titre)}
          tagline={t(detail)}
          titleSize={24}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
      </View>

      {offrirLeRepli && (
        <View className="mb-6">
          <Text className="text-ink font-semibold text-base mb-1">{t("join.codeSaisieTitre")}</Text>
          <Text className="text-sm text-mute mb-3">{t("join.codeSaisieAide")}</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder={t("join.codeSaisiePlaceholder")}
            autoCapitalize="characters"
            autoCorrect={false}
            className="bg-accent-card rounded-2xl px-4 py-3 border border-hair text-ink mb-2"
          />
          <TextInput
            value={cle}
            onChangeText={setCle}
            placeholder={t("join.cleSaisiePlaceholder")}
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-accent-card rounded-2xl px-4 py-3 border border-hair text-ink"
          />
          {erreurDeSaisie && <Text className="text-sm mt-2" style={{ color: GP.strawberryInk }}>{erreurDeSaisie}</Text>}
          <Pressable
            onPress={valider}
            className="bg-primary-500 rounded-2xl py-4 items-center mt-3 active:bg-primary-600"
          >
            <Text className="text-white font-semibold text-base">{t("join.codeValider")}</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => router.replace("/" as any)}
        className="bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} color={GP.clay} />
          <Text className="text-ink font-semibold text-base ml-2">
            {t("join.noGoBack")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
