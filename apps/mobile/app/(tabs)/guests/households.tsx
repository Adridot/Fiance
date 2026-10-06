import React, { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { revenir } from "@/lib/revenir";
import { repliDe } from "@/lib/repli-des-ecrans";
import { useTranslation } from "react-i18next";
import { Check, CheckCircle2, Home } from "lucide-react-native";
import {
  householdCandidates,
  householdName,
  formatGuestName,
  formatGuestGroupName,
  type HouseholdCandidate,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { EmptyState } from "@/components/EmptyState";
import { theme as GP } from "@/lib/theme";
import { ZoneTactile } from "@/components/ZoneTactile";
import { CIBLE_TACTILE } from "@/lib/cible-tactile";
import type { Guest, Household } from "@/db/schema";

function SelectionBox({ checked }: { checked: boolean }) {
  return (
    <View
      className="w-[22px] h-[22px] rounded-full items-center justify-center"
      style={{
        backgroundColor: checked ? GP.clay : "transparent",
        borderWidth: checked ? 0 : 1.5,
        borderColor: "#D0D0D8",
      }}
    >
      {checked ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : null}
    </View>
  );
}

function CandidateCard({
  candidate,
  households,
  onGroup,
  onDetach,
  canEdit,
}: {
  candidate: HouseholdCandidate<Guest>;
  households: Household[];
  onGroup: (ids: string[]) => void;
  onDetach: (ids: string[]) => void;
  canEdit: boolean;
}) {
  const { t } = useTranslation("guests");
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChosen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groupChosen = () => {
    if (chosen.size === 0) return;
    onGroup([...chosen]);
    setChosen(new Set());
  };

  const alreadyHoused = candidate.members.filter((m) => chosen.has(m.id) && m.householdId).length;

  const householdOf = (g: Guest): string | null => {
    if (!g.householdId) return null;
    const h = households.find((x) => x.id === g.householdId) ?? null;
    const members = candidate.members.filter((m) => m.householdId === g.householdId);
    return householdName(h, members);
  };

  return (
    <View className="bg-accent-card rounded-2xl px-4 py-3 mb-2.5 border border-hair">
      <Text className="text-base font-bold text-ink" numberOfLines={2}>
        {candidate.lastName}
      </Text>

      {candidate.members.map((g) => {
        const attached = householdOf(g);
        return (
          <View key={g.id} className="flex-row items-center" style={{ minHeight: CIBLE_TACTILE }}>
            <Pressable
              onPress={() => toggle(g.id)}
              disabled={!canEdit}
              accessibilityRole={canEdit ? "checkbox" : undefined}
              accessibilityState={{ checked: chosen.has(g.id) }}
              className="flex-1 flex-row items-center gap-2 active:opacity-60"
              style={{ minHeight: CIBLE_TACTILE }}
            >
              {canEdit && <SelectionBox checked={chosen.has(g.id)} />}
              <Text
                className={`flex-1 text-sm ${attached ? "text-mute" : "text-ink"}`}
                numberOfLines={1}
              >
                {formatGuestName(g)}
              </Text>
            </Pressable>
            {attached && (
              <ZoneTactile onPress={() => canEdit && onDetach([g.id])} disabled={!canEdit} style={{ flexShrink: 0 }}>
                <View className="flex-row items-center gap-1">
                  <Home size={12} color={GP.mute} />
                  <Text className="text-[11px] text-mute" numberOfLines={1}>
                    {attached}
                  </Text>
                </View>
              </ZoneTactile>
            )}
          </View>
        );
      })}

      {canEdit && (
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={groupChosen}
            disabled={chosen.size === 0}
            className={`flex-1 rounded-xl items-center justify-center ${
              chosen.size === 0 ? "bg-accent-paper" : "bg-primary-500"
            }`}
            style={{ minHeight: CIBLE_TACTILE }}
          >
            <Text
              className={`text-sm font-semibold ${
                chosen.size === 0 ? "text-mute" : "text-white"
              }`}
            >
              {alreadyHoused > 0 ? t("household.mergeTogether") : t("household.groupTogether")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              for (const g of candidate.members) onGroup([g.id]);
              setChosen(new Set());
            }}
            className="flex-1 rounded-xl items-center justify-center bg-accent-paper border border-hair"
            style={{ minHeight: CIBLE_TACTILE }}
          >
            <Text className="text-sm font-semibold text-ink-soft">
              {t("household.makeEachAlone")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function HouseholdsScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const canEdit = useCanEditHere();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const scope = groupId && groupId !== "" ? groupId : null;

  const guests = useGuestsStore((s) => s.guests);
  const groups = useGuestsStore((s) => s.groups);
  const households = useGuestsStore((s) => s.households);
  const createHousehold = useGuestsStore((s) => s.createHousehold);
  const detachFromHousehold = useGuestsStore((s) => s.detachFromHousehold);

  const group = scope ? groups.find((g) => g.id === scope) ?? null : null;

  // The store hydrates AFTER mount: snapshot only once it holds something, or
  // the frozen list would be empty for good.
  const snapshot = useRef<HouseholdCandidate<Guest>[] | null>(null);
  if (snapshot.current === null && guests.length > 0) {
    snapshot.current = householdCandidates(guests, scope);
  }
  const frozen = snapshot.current ?? [];

  const remaining = useMemo(
    () => householdCandidates(guests, scope).length,
    [guests, scope],
  );

  const toShow = useMemo(() => {
    const live = new Set(householdCandidates(guests, scope).map((c) => c.key));
    const fresh = new Map(householdCandidates(guests, scope).map((c) => [c.key, c]));
    return frozen
      .filter((c) => live.has(c.key))
      .map((c) => fresh.get(c.key) ?? c);
  }, [frozen, guests, scope]);

  if (groups.length === 0) {
    return <View className="flex-1 bg-accent-paper" />;
  }

  if (!canEdit || toShow.length === 0) {
    return (
      <View className="flex-1 bg-accent-paper">
        <Stack.Screen options={{ title: t("household.title") }} />
        <EmptyState
          icon={CheckCircle2}
          title={t("household.empty")}
          actionLabel={t("backToGuests")}
          onAction={() => revenir(router, repliDe("guests", "households"))}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{ title: group ? formatGuestGroupName(group.name) : t("household.title") }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-mute mb-3">{t("household.explain")}</Text>
        <Text className="text-base font-semibold text-ink mb-1">
          {remaining > 0 ? t("household.remaining", { count: remaining }) : t("household.empty")}
        </Text>
        <Text className="text-xs text-mute mb-4">{t("household.selectMembers")}</Text>

        {toShow.map((candidate) => (
          <CandidateCard
            key={candidate.key}
            candidate={candidate}
            households={households}
            canEdit={canEdit}
            onGroup={(ids) => createHousehold(ids)}
            onDetach={detachFromHousehold}
          />
        ))}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
