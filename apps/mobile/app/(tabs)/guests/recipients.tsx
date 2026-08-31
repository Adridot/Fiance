import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LegendList } from "@legendapp/list";
import { Home, MapPinOff } from "lucide-react-native";
import {
  recipients as computeRecipients,
  householdCategory,
  formatGuestName,
  formatGuestGroupName,
  guestNameMatches,
  type Recipient,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { SearchBar } from "@/components/SearchBar";
import type { Guest } from "@/db/schema";

const NO_CATEGORY = "__none__";

function RecipientRow({
  recipient,
  onPress,
}: {
  recipient: Recipient<Guest>;
  onPress: () => void;
}) {
  const { t } = useTranslation("guests");
  const members = recipient.members.map(formatGuestName).join(" · ");
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-hair active:opacity-60"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {recipient.name}
        </Text>
        <Text className="text-xs text-mute" numberOfLines={1}>
          {members}
        </Text>
      </View>
      {recipient.address ? (
        <Home size={14} color="#9CA3AF" />
      ) : (
        <View className="flex-row items-center gap-1 shrink-0">
          <MapPinOff size={12} color="#9CA3AF" />
          <Text className="text-[11px] text-mute">{t("household.addressEmpty")}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function RecipientsScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const guests = useGuestsStore((s) => s.guests);
  const groups = useGuestsStore((s) => s.groups);
  const households = useGuestsStore((s) => s.households);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  // recipients() scans every guest once per household — search must filter this
  // memoised result, never re-run it on each keystroke.
  const all = useMemo(
    () => computeRecipients(households, guests) as Recipient<Guest>[],
    [households, guests],
  );

  const categoryOf = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const d of all) m.set(d.id, householdCategory(d.members));
    return m;
  }, [all]);

  const filters = useMemo(() => {
    const counts = new Map<string | null, number>();
    for (const d of all) {
      const c = categoryOf.get(d.id) ?? null;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const out = groups
      .map((g) => ({ key: g.id, label: formatGuestGroupName(g.name), count: counts.get(g.id) ?? 0 }))
      .filter((f) => f.count > 0);
    const noCategoryCount = counts.get(null) ?? 0;
    if (noCategoryCount > 0) out.push({ key: NO_CATEGORY, label: t("household.noCategory"), count: noCategoryCount });
    return out;
  }, [all, categoryOf, groups, t]);

  const visible = useMemo(() => {
    const q = search.trim();
    return all.filter((d) => {
      if (category !== null) {
        const c = categoryOf.get(d.id) ?? null;
        if (category === NO_CATEGORY ? c !== null : c !== category) return false;
      }
      if (!q) return true;
      if (d.name.toLowerCase().includes(q.toLowerCase())) return true;
      if (d.address?.toLowerCase().includes(q.toLowerCase())) return true;
      return d.members.some((m) => guestNameMatches(m, q));
    });
  }, [all, categoryOf, search, category]);

  // A recipient is not always a household: with no membership its id is the
  // guest's own, so the guest sheet opens instead.
  const openRecipient = useCallback(
    (d: Recipient<Guest>) => {
      const householdId = d.members[0]?.householdId ?? null;
      if (householdId) router.push(`/(tabs)/guests/household/${householdId}`);
      else router.push({ pathname: "/(tabs)/guests/[id]", params: { id: d.id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipient<Guest> }) => (
      <RecipientRow recipient={item} onPress={() => openRecipient(item)} />
    ),
    [openRecipient],
  );

  const listHeader = (
    <>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t("household.searchRecipient")}
        className="px-4 pt-5 pb-2"
      />
      <Text className="px-4 pb-2 text-xs text-mute">
        {t("household.recipientCount", { count: visible.length })}
      </Text>
      {filters.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8, alignItems: "center" }}
        >
          {filters.map((f) => {
            const active = f.key === category;
            return (
              <Pressable
                key={f.key}
                onPress={() => setCategory(active ? null : f.key)}
                className={`px-4 py-2 rounded-full border ${
                  active ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30" : "bg-accent-card border-hair"
                }`}
              >
                <Text className={`text-sm font-medium ${active ? "text-primary-500" : "text-mute"}`}>
                  {f.label} ({f.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </>
  );

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen options={{ title: t("household.recipientsTitle") }} />
      <LegendList
        data={visible}
        renderItem={renderItem}
        keyExtractor={(d: Recipient<Guest>) => d.id}
        estimatedItemSize={56}
        maintainVisibleContentPosition={false}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-8">
            <Text className="text-sm text-mute text-center">{t("noGuestsFound")}</Text>
          </View>
        }
        ListFooterComponent={<View className="h-24" />}
      />
    </View>
  );
}
