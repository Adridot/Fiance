import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { FileSpreadsheet, Users, Lock } from "lucide-react-native";
import { toast } from "@/lib/toast/sonner";
import { useGuestsStore } from "@/store/useGuestsStore";
import { pickSpreadsheetFile } from "@/lib/export-import";
import { parseSpreadsheet, mapRowsToGuests, reconcileGuests, type GuestImportResult } from "@/lib/guest-import";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { analytics } from "@/lib/analytics";
import { SectionTitle, FormCard, FormActions } from "@/components/FormSection";
import { SettingsRow, WebFilePickRow } from "@/components/SettingsRow";
import { useCan } from "@/lib/permissions/usePermissions";
import { useIsPremium } from "@/lib/premium";
import { FREE_LIMITS } from "@/lib/limits";
import { wouldExceedFreeLimit, formatGuestName } from "@fiance/sdk";
import { useShowPaywall } from "@/components/PaywallProvider";
import { theme as GP } from "@/lib/theme";

export default function ImportFileScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const isMariagesNet = source === "mariagesnet";
  // This screen is routed under settings/, outside useCanEditHere's route-aware
  // surface matching — gate explicitly since importing writes guest data.
  const canImport = useCan("guests", "edit");

  const groups = useGuestsStore((s) => s.groups);
  const tables = useGuestsStore((s) => s.tables);
  const existingGuestCount = useGuestsStore((s) => s.guests.length);
  const existingGuests = useGuestsStore((s) => s.guests);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const addInvitationType = useInvitationTypesStore((s) => s.addInvitationType);
  const importGuestData = useGuestsStore((s) => s.importGuestData);
  const premium = useIsPremium();

  const [preview, setPreview] = useState<GuestImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { openPaywall } = useShowPaywall();
  // Known before the user taps Import — surfaced inline near the preview
  // (see below) instead of only after the tap, since reaching this point
  // already required picking + parsing a file.
  const wouldExceedLimit =
    !!preview && wouldExceedFreeLimit("guests", existingGuestCount, preview.guests.length, premium);
  const limitMessage = t("common:premiumLimits.guests", { limit: FREE_LIMITS.guests });

  const handleFile = useCallback(
    (bytes: Uint8Array, name: string) => {
      try {
        const sheet = parseSpreadsheet(bytes);
        const result = mapRowsToGuests(sheet, { groups, tables, invitationTypes }, { makeId: () => Crypto.randomUUID() });
        if (result.guests.length === 0) {
          toast.error(t("importNoGuestsFound"));
          return;
        }
        setPreview(result);
        setFileName(name);
      } catch {
        toast.error(t("importParseError"));
      }
    },
    [groups, tables, invitationTypes, t]
  );

  const handlePickNative = useCallback(() => {
    pickSpreadsheetFile()
      .then((picked) => {
        if (picked) handleFile(picked.bytes, picked.name);
      })
      .catch(() => toast.error(t("importParseError")));
  }, [handleFile, t]);

  const reconciliation = React.useMemo(
    () => (preview ? reconcileGuests(existingGuests, preview.guests) : null),
    [preview, existingGuests],
  );

  const doImport = useCallback(() => {
    if (!preview) return;
    if (wouldExceedLimit) {
      toast.error(limitMessage);
      openPaywall(limitMessage);
      return;
    }
    for (const type of preview.invitationTypes) addInvitationType(type);
    importGuestData(preview);
    analytics.capture("import_data", {
      source: isMariagesNet ? "mariagesnet" : "spreadsheet",
      count: preview.guests.length,
    });
    toast.success(t("importGuestsSuccess", { count: preview.guests.length }));
    router.back();
  }, [preview, importGuestData, addInvitationType, isMariagesNet, t, router, wouldExceedLimit, limitMessage, openPaywall]);

  return (
    <ScrollView className="flex-1 bg-accent-paper" showsVerticalScrollIndicator={false}>
      {isMariagesNet && (
        <View className="px-4 pt-4">
          <SectionTitle>{t("mariagesNetInstructionsTitle")}</SectionTitle>
          <FormCard>
            <Text className="text-sm text-ink leading-6 py-1">{t("mariagesNetStep1")}</Text>
            <Text className="text-sm text-ink leading-6 py-1">{t("mariagesNetStep2")}</Text>
            <Text className="text-sm text-ink leading-6 py-1">{t("mariagesNetStep3")}</Text>
          </FormCard>
        </View>
      )}

      <View className={`px-4 ${isMariagesNet ? "" : "pt-4"}`}>
        <SectionTitle>{t("importPickFile")}</SectionTitle>
        <FormCard>
          {Platform.OS === "web" ? (
            <WebFilePickRow
              icon={<FileSpreadsheet size={18} color="#10B981" />}
              label={fileName ?? t("importPickFile")}
              sublabel={t("importPickFileDesc")}
              accept=".xlsx,.csv"
              last
              onFile={handleFile}
            />
          ) : (
            <SettingsRow
              icon={<FileSpreadsheet size={18} color="#10B981" />}
              label={fileName ?? t("importPickFile")}
              sublabel={t("importPickFileDesc")}
              onPress={handlePickNative}
              last
            />
          )}
        </FormCard>
      </View>

      {preview && (
        <View className="px-4">
          <SectionTitle>{t("importPreviewTitle")}</SectionTitle>
          <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
            {t("importPreviewSummary", {
              guests: preview.guests.length,
              groups: preview.groups.length,
              tables: preview.tables.length,
            })}
            {preview.skippedRows > 0 ? ` · ${t("importPreviewSkipped", { count: preview.skippedRows })}` : ""}
          </Text>
          {/* The summary above counts file rows; this one counts what will be written. */}
          <Text className="text-sm text-mute leading-5 mb-3 -mt-2">
            {[
              reconciliation ? t("importPreviewNew", { count: reconciliation.toAdd.length }) : null,
              reconciliation && reconciliation.matched > 0
                ? t("importPreviewExisting", { count: reconciliation.matched })
                : null,
              preview.invitationTypes.length > 0
                ? t("importPreviewInvitationTypes", { count: preview.invitationTypes.length })
                : null,
              preview.withoutInvitationType > 0
                ? t("importPreviewUndetermined", { count: preview.withoutInvitationType })
                : null,
              preview.duplicateNames.length > 0
                ? t("importPreviewDuplicates", { count: preview.duplicateNames.length })
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <FormCard>
            {preview.guests.slice(0, 50).map((guest, index) => {
              const groupName = guest.groupId
                ? (preview.groups.find((g) => g.id === guest.groupId) ?? groups.find((g) => g.id === guest.groupId))?.name
                : undefined;
              return (
                <View
                  key={guest.id}
                  className={`flex-row items-center py-2.5 ${index < Math.min(preview.guests.length, 50) - 1 ? "border-b border-hair" : ""}`}
                >
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Users size={16} color={GP.olive} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-ink">
                      {formatGuestName(guest)}
                    </Text>
                    {groupName && <Text className="text-xs text-mute mt-0.5">{groupName}</Text>}
                  </View>
                </View>
              );
            })}
            {preview.guests.length > 50 && (
              <Text className="text-xs text-mute py-2.5 text-center">
                +{preview.guests.length - 50}…
              </Text>
            )}
          </FormCard>
          {wouldExceedLimit && (
            <Pressable
              onPress={() => openPaywall(limitMessage)}
              className="flex-row items-start gap-2 mt-3 px-3.5 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 active:opacity-70"
            >
              <Lock size={14} color={GP.clay} style={{ marginTop: 1 }} />
              <Text className="flex-1 text-xs text-primary-600 dark:text-primary-300 leading-4">
                {limitMessage}
              </Text>
            </Pressable>
          )}
          {canImport && (
            <View className="mt-4">
              <FormActions
                saveLabel={t("import")}
                cancelLabel={t("common:cancel")}
                onSave={doImport}
                onCancel={() => {
                  setPreview(null);
                  setFileName(null);
                }}
              />
            </View>
          )}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
