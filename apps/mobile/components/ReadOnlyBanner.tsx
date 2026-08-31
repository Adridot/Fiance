import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { useIsReadOnlyMember } from "@/lib/permissions/useIsReadOnlyMember";
import { theme as GP } from "@/lib/theme";

/**
 * Desktop-web-only top banner for a device that can't edit (see
 * useIsReadOnlyMember). Mounted before <Stack> in app/_layout.tsx so it sits
 * in normal document flow above the DesktopShell sidebar/content instead of
 * floating over it as an absolute overlay (that overlapped/clipped the
 * sidebar on wide web layouts).
 *
 * On native and narrow/mobile web this renders nothing — a persistent fixed
 * top bar is awkward on a small screen, so /home shows a warning banner
 * instead (see app/(tabs)/home/index.tsx), driven by the same hook.
 */
export function ReadOnlyBanner() {
  const { t } = useTranslation("settings");
  const isWide = useIsWideScreen();
  const show = useIsReadOnlyMember();

  if (!isWide || !show) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t("syncStatusReadOnly")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    zIndex: 999,
    backgroundColor: GP.clay, // accent primaire — même convention de bandeau que OfflineBanner
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  text: {
    color: GP.card, // fond de carte sur le primaire
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
});
