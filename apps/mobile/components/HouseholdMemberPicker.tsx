import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native-css/components";
import { Platform, useWindowDimensions } from "react-native";
import { Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Sheet } from "@fiance/ui/components";
import { formatGuestName, guestNameMatches } from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";

export function HouseholdMemberPicker({
  visible,
  excludeIds,
  onSelect,
  onClose,
}: {
  visible: boolean;
  excludeIds: string[];
  onSelect: (guestId: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("guests");
  const guests = useGuestsStore((s) => s.guests);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) setSearch("");
  }, [visible]);

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const results = useMemo(
    () =>
      guests
        .filter((g) => !excluded.has(g.id) && guestNameMatches(g, search))
        .sort((a, b) => a.lastName.localeCompare(b.lastName, "fr")),
    [guests, excluded, search],
  );

  const { height: windowHeight } = useWindowDimensions();

  return (
    <Sheet visible={visible} onDismiss={onClose} snapPoints={Platform.OS === "ios" ? ["55%", "85%"] : undefined}>
      <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-lg font-bold text-ink mb-1">{t("household.addMember")}</Text>
        <Text className="text-sm text-mute mb-3">{t("household.addMemberExplain")}</Text>

        <View className="flex-row items-center bg-accent-paper rounded-xl px-3 py-2 mb-3">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-ink"
            placeholder={t("household.searchGuest")}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        <ScrollView style={{ maxHeight: windowHeight * 0.5 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          {results.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => {
                onSelect(g.id);
                onClose();
              }}
              className="flex-row items-center px-3 py-3 rounded-xl mb-1 active:bg-accent-paper"
            >
              <Text className="flex-1 text-base text-ink" numberOfLines={1}>
                {formatGuestName(g)}
              </Text>
            </Pressable>
          ))}
          {results.length === 0 && (
            <Text className="text-center text-mute py-6">{t("noGuests")}</Text>
          )}
        </ScrollView>

        <Pressable
          onPress={onClose}
          className="mt-4 py-3.5 rounded-2xl items-center bg-accent-paper active:opacity-80"
        >
          <Text className="text-ink-soft font-medium text-base">{t("common:cancel")}</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}
