import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { useSyncPendingStore } from "@/store/useSyncPendingStore";
import { theme as GP } from "@/lib/theme";

export function UnsavedChangesBanner() {
  const { t } = useTranslation("settings");
  const isWide = useIsWideScreen();
  const show = useSyncPendingStore((s) => s.unsavedChanges);

  if (!isWide || !show) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t("syncStatusUnsaved")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    zIndex: 999,
    backgroundColor: GP.mustard,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  text: {
    color: GP.card,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
