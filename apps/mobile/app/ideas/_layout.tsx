import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DesktopShell } from "@/components/DesktopShell";
import { BoutonRetour } from "@/components/BoutonRetour";
export default function IdeesLayout() {
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const tintColor = isDark ? "#FFFFFF" : "#111827";
  return (
    <DesktopShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          headerTintColor: tintColor,
          headerTitleStyle: { fontWeight: "600" },
          headerLeft: () => <BoutonRetour repli="/ideas" couleur={tintColor} />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Idées & Déco",
            headerShown: true,
            headerLeft: () => <BoutonRetour repli="/home" couleur={tintColor} />,
          }}
        />
        <Stack.Screen name="[id]" options={{ title: "Idée" }} />
        <Stack.Screen name="collections" options={{ title: "Collections" }} />
      </Stack>
    </DesktopShell>
  );
}
