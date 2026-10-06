import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DesktopShell } from "@/components/DesktopShell";
import { BoutonRetour } from "@/components/BoutonRetour";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const isWide = useIsWideScreen();
  const tintColor = isDark ? "#FFFFFF" : "#111827";
  return (
    <DesktopShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          headerTintColor: tintColor,
          headerTitleStyle: { fontWeight: "600" },
          headerLeft: () => <BoutonRetour repli="/settings" couleur={tintColor} />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: t("settingsTitle"),
            headerShown: !isWide,
            headerLeft: () => <BoutonRetour repli="/home" couleur={tintColor} />,
          }}
        />
        <Stack.Screen name="compte" options={{ title: t("compte.titre") }} />
        <Stack.Screen name="public-page" options={{ title: t("publicPageTitle") }} />
        <Stack.Screen name="roles" options={{ title: t("rolesTitle") }} />
        <Stack.Screen name="event-photos" options={{ title: t("eventPhotosTitle") }} />
        <Stack.Screen name="faq" options={{ title: t("configureFaq") }} />
        <Stack.Screen name="gifts" options={{ title: t("giftRegistry") }} />
        <Stack.Screen name="documents" options={{ title: t("documentsTitle") }} />
        <Stack.Screen name="export-import" options={{ title: t("exportImportTitle") }} />
        <Stack.Screen name="import-external" options={{ title: t("importExternalTitle") }} />
        <Stack.Screen name="import-file" options={{ title: t("importFileTitle") }} />
        <Stack.Screen name="premium" options={{ title: t("premiumTitle") }} />
      </Stack>
    </DesktopShell>
  );
}
