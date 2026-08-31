import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { UserPlus, XCircle, ChevronRight, Scissors, Check } from "lucide-react-native";
import {
  householdMembers,
  householdName,
  formatGuestName,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { HouseholdFields } from "@/components/HouseholdFields";
import { HouseholdMemberPicker } from "@/components/HouseholdMemberPicker";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { DeleteButton } from "@/components/DeleteButton";
import { SectionTitle } from "@/components/FormSection";
import { theme as GP } from "@/lib/theme";

export default function HouseholdScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const canEdit = useCanEditHere();
  const { id } = useLocalSearchParams<{ id: string }>();

  const guests = useGuestsStore((s) => s.guests);
  const households = useGuestsStore((s) => s.households);
  const attachToHousehold = useGuestsStore((s) => s.attachToHousehold);
  const detachFromHousehold = useGuestsStore((s) => s.detachFromHousehold);
  const splitHousehold = useGuestsStore((s) => s.splitHousehold);
  const removeHousehold = useGuestsStore((s) => s.removeHousehold);

  const [showPicker, setShowPicker] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [toSplit, setToSplit] = useState<Set<string>>(new Set());
  const [splitting, setSplitting] = useState(false);

  const members = useMemo(() => householdMembers(guests, id!), [guests, id]);
  const household = households.find((h) => h.id === id) ?? null;
  const householdTitle = householdName(household, members);

  if (members.length === 0) {
    return (
      <View className="flex-1 bg-accent-paper">
        <Stack.Screen options={{ title: t("household.section") }} />
        <View className="items-center justify-center py-16 px-8">
          <Text className="text-sm text-mute text-center">{t("household.gone")}</Text>
        </View>
      </View>
    );
  }

  const toggle = (guestId: string) =>
    setToSplit((s) => {
      const next = new Set(s);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });

  const split = () => {
    if (toSplit.size === 0) return;
    splitHousehold([...toSplit]);
    setToSplit(new Set());
    setSplitting(false);
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen options={{ title: householdTitle }} />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-mute mb-3">{t("household.explain")}</Text>

        <HouseholdFields household={household} members={members} />

        <View className="mt-6">
          <SectionTitle>{t("household.members", { count: members.length })}</SectionTitle>
        </View>

        {members.map((m) => (
          <View key={m.id} className="flex-row items-center gap-2 py-3 border-b border-hair">
            {splitting && canEdit && (
              <Pressable
                onPress={() => toggle(m.id)}
                hitSlop={11}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: toSplit.has(m.id) }}
                className="w-[22px] h-[22px] rounded-full items-center justify-center active:opacity-60"
                style={{
                  backgroundColor: toSplit.has(m.id) ? GP.clay : "transparent",
                  borderWidth: toSplit.has(m.id) ? 0 : 1.5,
                  borderColor: "#D0D0D8",
                }}
              >
                {toSplit.has(m.id) ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : null}
              </Pressable>
            )}
            <Pressable
              className="flex-1 flex-row items-center justify-between active:opacity-60"
              onPress={() => router.push({ pathname: "/(tabs)/guests/[id]", params: { id: m.id } })}
            >
              <Text className="text-sm text-ink" numberOfLines={1}>
                {formatGuestName(m)}
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </Pressable>
            {canEdit && !splitting && (
              <Pressable onPress={() => detachFromHousehold([m.id])} hitSlop={11}>
                <XCircle size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        ))}

        {canEdit && (
          <>
            <Pressable
              onPress={() => setShowPicker(true)}
              className="flex-row items-center gap-2 py-3 mt-1"
            >
              <UserPlus size={16} color={GP.clay} />
              <Text className="text-sm font-semibold text-primary-500">{t("household.addMember")}</Text>
            </Pressable>

            {members.length > 1 && (
              <Pressable
                onPress={() => {
                  setSplitting(!splitting);
                  setToSplit(new Set());
                }}
                className="flex-row items-center gap-2 py-3"
              >
                <Scissors size={16} color={GP.clay} />
                <Text className="text-sm font-semibold text-primary-500">
                  {splitting ? t("common:cancel") : t("household.split")}
                </Text>
              </Pressable>
            )}

            {splitting && (
              <Pressable
                onPress={split}
                disabled={toSplit.size === 0}
                className={`py-2.5 rounded-xl items-center mb-2 ${
                  toSplit.size === 0 ? "bg-accent-paper border border-hair" : "bg-primary-500"
                }`}
              >
                <Text className={`text-sm font-semibold ${toSplit.size === 0 ? "text-mute" : "text-white"}`}>
                  {t("household.splitSelected", { count: toSplit.size })}
                </Text>
              </Pressable>
            )}

            <View className="mt-4">
              <DeleteButton label={t("household.remove")} onPress={() => setShowRemoveConfirm(true)} />
            </View>
          </>
        )}

        <View className="h-24" />
      </ScrollView>

      <HouseholdMemberPicker
        visible={showPicker}
        excludeIds={members.map((m) => m.id)}
        onClose={() => setShowPicker(false)}
        onSelect={(guestId) => attachToHousehold([guestId], id!)}
      />

      <ConfirmSheet
        visible={showRemoveConfirm}
        title={t("household.remove")}
        message={t("household.removeExplain")}
        destructive
        onConfirm={() => {
          setShowRemoveConfirm(false);
          removeHousehold(id!);
          router.back();
        }}
        onCancel={() => setShowRemoveConfirm(false)}
      />
    </View>
  );
}
