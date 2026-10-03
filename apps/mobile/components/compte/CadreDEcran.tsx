import React from "react";
import { Platform } from "react-native";
import { View, ScrollView, Pressable, KeyboardAvoidingView } from "react-native-css/components";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Seo } from "@/components/Seo";

/** Le gabarit des sous-écrans d'accueil : retour en haut, colonne de 480 px. */
export function CadreDEcran({ onRetour, children }: { onRetour: () => void; children: React.ReactNode }) {
  const { t } = useTranslation("common");
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView className="flex-1 bg-accent-paper" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Seo title="Fiancé" description="" noindex />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1,
          alignItems: "center",
          paddingTop: 24 + insets.top,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            onPress={onRetour}
            className="mb-4 -ml-2 items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            <ArrowLeft size={24} color="#9CA3AF" />
          </Pressable>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
