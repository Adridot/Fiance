import React, { useState } from "react";
import { Platform } from "react-native";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { cibleAgrandie } from "../../utils/cible-tactile";

// Web : l'en-tête (une ligne `text-xs` de 16 px, `mt-3 mb-2`) porté à 44 px de cible.
const enTete = cibleAgrandie(16, { marges: { haut: 12, bas: 8 } });

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultExpanded = true,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between mt-3 mb-2"
        style={Platform.OS === "web" ? enTete : undefined}
      >
        <Text className="text-xs font-semibold text-typography-400 uppercase tracking-wider">
          {title}
          {count != null && (
            <Text className="text-xs text-typography-300"> ({count})</Text>
          )}
        </Text>
        {expanded ? (
          <ChevronUp size={14} className="text-typography-400" />
        ) : (
          <ChevronDown size={14} className="text-typography-400" />
        )}
      </Pressable>
      {expanded && children}
    </View>
  );
}
