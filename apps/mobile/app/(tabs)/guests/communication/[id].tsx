import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import {
  formatGuestName,
  guestNameMatches,
  communicationRecipientRows,
  toggleHouseholdRecipients,
  type HouseholdRecipientRow,
} from "@fiance/sdk";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useCan } from "@/lib/permissions/usePermissions";
import { EmptyState } from "@/components/EmptyState";
import { DateRow } from "@/components/FormSection";
import { Avatar } from "@/components/Avatar";
import { SearchBar } from "@/components/SearchBar";
import { theme as GP } from "@/lib/theme";
import { Users } from "lucide-react-native";
import type { Guest } from "@/db/schema";

export default function CommunicationRosterScreen() {
  const { t } = useTranslation("guests");
  const canEdit = useCan("guests", "edit");
  const { id } = useLocalSearchParams<{ id: string }>();
  const comm = useCommunicationsStore((s) => s.communications.find((c) => c.id === id));
  const toggleRecipient = useCommunicationsStore((s) => s.toggleRecipient);
  const setRecipientDate = useCommunicationsStore((s) => s.setRecipientDate);
  const bulkSetRecipients = useCommunicationsStore((s) => s.bulkSetRecipients);
  const guests = useGuestsStore((s) => s.guests);
  const households = useGuestsStore((s) => s.households);
  const setCommunications = useCommunicationsStore((s) => s.setCommunications);
  const communications = useCommunicationsStore((s) => s.communications);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SENT" | "NOT_SENT">("ALL");

  const today = new Date().toISOString().slice(0, 10);
  const recipientIds = useMemo(
    () => new Set((comm?.recipients ?? []).map((r) => r.guestId)),
    [comm?.recipients]
  );

  const rows = useMemo(
    () => (comm ? communicationRecipientRows(households, guests, comm) : []),
    [households, guests, comm],
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter === "SENT" && !row.sent) return false;
      if (statusFilter === "NOT_SENT" && row.sent) return false;
      if (search) {
        const q = search.toLowerCase();
        return row.members.some((m) => guestNameMatches(m, q));
      }
      return true;
    });
  }, [rows, search, statusFilter]);

  if (!comm) {
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center">
        <Text className="text-mute">{t("communicationNotFound")}</Text>
      </View>
    );
  }

  const sentCount = rows.filter((r) => r.sent).length;
  const notSentCount = rows.length - sentCount;

  const statusTabs: { key: "ALL" | "SENT" | "NOT_SENT"; label: string; count: number }[] = [
    { key: "ALL", label: t("all"), count: rows.length },
    { key: "SENT", label: t("sent"), count: sentCount },
    { key: "NOT_SENT", label: t("notSent"), count: notSentCount },
  ];

  const toggleRow = (row: HouseholdRecipientRow<Guest>) => {
    if (!canEdit) return;
    setCommunications(
      toggleHouseholdRecipients(
        communications,
        comm.id,
        row.members.map((m) => m.id),
        today,
        { sent: row.sent },
      ),
    );
  };

  return (
    <View className="flex-1 bg-accent-paper">
      {comm.date || comm.notes ? (
        <View className="px-4 pt-4 pb-3 border-b border-hair bg-accent-card">
          {comm.date ? (
            <Text className="text-xs text-mute">{comm.date}</Text>
          ) : null}
          {comm.notes ? (
            <Text className="text-sm text-ink-soft mt-0.5">{comm.notes}</Text>
          ) : null}
        </View>
      ) : null}

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noGuests")}
          description={t("addFirstGuest")}
          actionLabel=""
          onAction={() => {}}
        />
      ) : (
        <LegendList
          data={filteredRows}
          extraData={recipientIds}
          renderItem={({ item: row }: { item: HouseholdRecipientRow<Guest> }) => {
            const received = row.sent;
            const initials = row.name.slice(0, 2).toUpperCase();

            return (
              <View className="px-4">
                <View className="bg-accent-card rounded-2xl mb-2 border border-hair overflow-hidden">
                  <Pressable
                    onPress={() => toggleRow(row)}
                    className="flex-row items-center p-3 active:opacity-70"
                  >
                    <Avatar ini={initials} size={36} />
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-medium text-ink" numberOfLines={1}>
                        {row.name}
                      </Text>
                      <Text className="text-xs text-mute mt-0.5" numberOfLines={1}>
                        {row.members.map(formatGuestName).join(" · ")}
                      </Text>
                      {row.partial && (
                        <Text className="text-[11px] text-mute mt-0.5">
                          {t("communicationPartialHousehold")}
                        </Text>
                      )}
                    </View>
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: received ? GP.clay : "transparent", borderWidth: received ? 0 : 1.5, borderColor: "#D0D0D8" }}
                    >
                      {received ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                    </View>
                  </Pressable>
                  {received ? (
                    <View className="px-3 pb-3 border-t border-hair">
                      <DateRow
                        label={t("communicationSentAt")}
                        value={row.sentAt ?? ""}
                        onChange={(v) => {
                          for (const m of row.members) setRecipientDate(comm.id, m.id, v || null);
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }}
          keyExtractor={(row: HouseholdRecipientRow<Guest>) => row.id}
          estimatedItemSize={80}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder={t("searchGuest")}
                className="px-4 pt-4 pb-1"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4 mb-2"
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              >
                {statusTabs.map((tab) => {
                  const isActive = tab.key === statusFilter;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setStatusFilter(tab.key)}
                      className={`px-4 py-2 rounded-full border ${
                        isActive ? "bg-primary-500 border-primary-500" : "bg-accent-card border-hair"
                      }`}
                    >
                      <Text className={`text-sm font-medium ${isActive ? "text-white" : "text-mute"}`}>
                        {tab.label} ({tab.count})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {canEdit && filteredRows.length > 0 && (
                <View className="flex-row gap-2 px-4 mt-2">
                  <Pressable
                    onPress={() => bulkSetRecipients(comm.id, filteredRows.flatMap((r) => r.members.map((m) => m.id)), today)}
                    className="flex-1 bg-accent-card py-2 rounded-xl items-center border border-hair active:opacity-70"
                  >
                    <Text className="text-xs font-semibold text-ink-soft">{t("markAllSent")}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => bulkSetRecipients(comm.id, filteredRows.flatMap((r) => r.members.map((m) => m.id)), null)}
                    className="flex-1 bg-accent-card py-2 rounded-xl items-center border border-hair active:opacity-70"
                  >
                    <Text className="text-xs font-semibold text-ink-soft">{t("markAllNotSent")}</Text>
                  </Pressable>
                </View>
              )}

              <Text className="text-xs font-semibold text-mute uppercase tracking-wider mt-5 mb-1 px-4">
                {t("communicationRecipients")} — {sentCount}/{rows.length}
              </Text>
            </>
          }
          ListFooterComponent={<View className="h-24" />}
        />
      )}
    </View>
  );
}

export async function generateStaticParams() { return []; }
