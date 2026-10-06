import React from "react";
import { Platform } from "react-native";
import { ScrollView, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { DEPASSEMENT_PUCE, PuceWeb } from "./PuceWeb";
import type { LucideIcon } from "lucide-react-native";

interface FilterTab {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  hidden?: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

// Web : voir FilterTabs.tsx (la ScrollView rognerait une marge négative).
const ciblePuce = { paddingTop: DEPASSEMENT_PUCE, paddingBottom: DEPASSEMENT_PUCE };

export function FilterTabs({ tabs, activeKey, onSelect, className }: FilterTabsProps) {
  const web = Platform.OS === "web";
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className ?? "mb-4"}
      style={web ? { marginTop: -DEPASSEMENT_PUCE } : undefined}
      role={web ? "radiogroup" : undefined}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}
    >
      {tabs.map((tab) => {
        if (tab.hidden) return null;
        const isActive = tab.key === activeKey;
        const dessin = `px-4 py-2 rounded-full border ${
          isActive
            ? "bg-primary-500 border-primary-500"
            : "bg-background-0 border-outline-200"
        }`;
        const libelle = (
          <Text
            className={`text-sm font-medium ${
              isActive ? "text-white" : "text-typography-600"
            }`}
          >
            {tab.label}
            {tab.count != null ? ` (${tab.count})` : ""}
          </Text>
        );
        return web ? (
          <PuceWeb
            key={tab.key}
            active={isActive}
            onPress={() => onSelect(tab.key)}
            className={dessin}
            cible={ciblePuce}
          >
            {libelle}
          </PuceWeb>
        ) : (
          <Pressable key={tab.key} onPress={() => onSelect(tab.key)} className={dessin}>
            {libelle}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
