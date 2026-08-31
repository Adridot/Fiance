import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { Check, Home } from "lucide-react-native";
import { SheetScaffold } from "@fiance/ui/components";
import { theme as GP } from "@/lib/theme";
import type { InlineSelectOption } from "@/components/InlineSelectMenu";

/** Le pendant tactile du calque de menu : le motif de feuille déjà établi. */
export function InlineChoiceSheet({
  visible,
  title,
  options,
  valueId,
  footer,
  onPick,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  options: InlineSelectOption[];
  valueId: string | null;
  footer?: { label: string; onPress: () => void } | null;
  onPick: (id: string) => void;
  onDismiss: () => void;
}) {
  return (
    <SheetScaffold visible={visible} onDismiss={onDismiss} title={title} scrollable>
      <View className="gap-1">
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => onPick(option.id)}
            className="flex-row items-center gap-3 px-3 rounded-2xl active:opacity-60"
            style={{ minHeight: 48 }}
          >
            {option.color ? (
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }} />
            ) : null}
            <Text className="text-base text-ink flex-1" numberOfLines={1}>
              {option.label}
            </Text>
            {option.id === valueId ? <Check size={16} color={GP.clay} strokeWidth={3} /> : null}
          </Pressable>
        ))}

        {footer ? (
          <>
            <View className="mx-3 my-1.5" style={{ height: 1, backgroundColor: GP.hair }} />
            <Pressable
              onPress={footer.onPress}
              className="flex-row items-center gap-3 px-3 rounded-2xl active:opacity-60"
              style={{ minHeight: 48 }}
            >
              <Home size={16} color={GP.clay} />
              <Text className="text-base font-medium flex-1" style={{ color: GP.clay }} numberOfLines={1}>
                {footer.label}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </SheetScaffold>
  );
}
