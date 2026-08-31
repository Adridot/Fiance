import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { FolderOpen, Trash2 } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import {
  groupsBySide,
  computeGroupProgress,
  householdsRemaining,
  resolveGroupSides,
  formatGuestGroupName,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestGroupSideLabel } from "@/lib/guest-group-side";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormActions } from "@/components/FormSection";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import type { GuestGroup } from "@fiance/sdk";
import { theme as GP } from "@/lib/theme";

export default function GroupsScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const canEdit = useCanEditHere();
  const sideLabel = useGuestGroupSideLabel();
  const storedGroups = useGuestsStore((s) => s.groups);
  const wedding = useWeddingStore((s) => s.wedding);
  const guests = useGuestsStore((s) => s.guests);
  const addGroup = useGuestsStore((s) => s.addGroup);
  const updateGroup = useGuestsStore((s) => s.updateGroup);
  const removeGroup = useGuestsStore((s) => s.removeGroup);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const progress = useMemo(() => computeGroupProgress(guests), [guests]);
  const householdsToDo = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of storedGroups) map.set(g.id, householdsRemaining(guests, g.id));
    return map;
  }, [guests, storedGroups]);
  const groups = useMemo(
    () => resolveGroupSides(storedGroups, wedding),
    [storedGroups, wedding],
  );
  const sections = useMemo(() => groupsBySide(groups), [groups]);

  // While a group's side is only carried by its label prefix, a rename must put
  // that prefix back: dropping it silently moves the group to "no side".
  const renameKeepingSide = (group: GuestGroup, typed: string) => {
    const trimmed = typed.trim();
    if (group.side) return trimmed;
    const bare = formatGuestGroupName(group.name);
    return (group.name.slice(0, group.name.length - bare.length) + trimmed).trim();
  };
  // Le mode de saisie vit dans la liste : on y renvoie, catégorie dépliée.
  const openQueue = (groupId: string) =>
    router.push({ pathname: "/(tabs)/guests", params: { saisieGroupId: groupId } });
  const openHouseholds = (groupId: string) =>
    router.push({ pathname: "/(tabs)/guests/households", params: { groupId } });

  const handleAdd = () => {
    if (!newGroupName.trim()) {
      Alert.alert(t("common:error"), t("groupNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addGroup({
      id: Crypto.randomUUID(),
      name: newGroupName.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setNewGroupName("");
    setShowAdd(false);
  };

  return (
    <View className="relative flex-1 bg-accent-paper">
      {groups.length === 0 && !showAdd ? (
        <EmptyState
          icon={FolderOpen}
          title={t("noGroups")}
          description={t("createGroupsDesc")}
          actionLabel={t("createGroup2")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Add group form */}
          {showAdd && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-ink mb-3">
                {t("newGroup")}
              </Text>
              <TextInput
                className="text-base text-ink border-b border-hair pb-2 mb-3"
                placeholder={t("groupName")}
                placeholderTextColor="#D0D0D8"
                value={newGroupName}
                onChangeText={setNewGroupName}
                autoFocus
                editable={canEdit}
              />
              <FormActions
                saveLabel={t("createGroup")}
                cancelLabel={t("common:cancel")}
                onSave={handleAdd}
                onCancel={() => setShowAdd(false)}
              />
            </View>
          )}

          {/* Groups list */}
          {sections.map((section) => (
            <View key={section.side ?? "none"}>
              <Text className="text-xs font-semibold text-mute uppercase tracking-wider mt-4 mb-2">
                {sideLabel(section.side)}
              </Text>
              {section.groups.map((group) => {
                const p = progress.get(group.id);
                const guestCount = p?.total ?? 0;
                const missing = p?.missingFirstName ?? 0;
                const openable = canEdit && missing > 0;
                const householdsLeft = householdsToDo.get(group.id) ?? 0;

                return (
                  <View
                    key={group.id}
                    className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair"
                  >
                    {/* Group header */}
                    <View className="flex-row items-center justify-between">
                      <Pressable
                        onPress={
                          canEdit
                            ? () => {
                                setEditingGroupId(group.id);
                                setEditingName(formatGuestGroupName(group.name));
                              }
                            : undefined
                        }
                        disabled={!canEdit}
                        className="flex-row items-center flex-1"
                      >
                        <View className="w-8 h-8 rounded-lg bg-accent-blush dark:bg-primary-900 items-center justify-center mr-2">
                          <FolderOpen size={16} color={GP.clay} />
                        </View>
                        {editingGroupId === group.id ? (
                          <TextInput
                            className="text-base font-semibold text-ink flex-1"
                            value={editingName}
                            onChangeText={setEditingName}
                            onBlur={() => {
                              if (editingName.trim()) {
                                updateGroup(group.id, { name: renameKeepingSide(group, editingName) });
                              }
                              setEditingGroupId(null);
                            }}
                            onSubmitEditing={() => {
                              if (editingName.trim()) {
                                updateGroup(group.id, { name: renameKeepingSide(group, editingName) });
                              }
                              setEditingGroupId(null);
                            }}
                            autoFocus
                            selectTextOnFocus
                            editable={canEdit}
                          />
                        ) : (
                          <Text className="text-base font-semibold text-ink">
                            {formatGuestGroupName(group.name)}
                          </Text>
                        )}
                      </Pressable>
                      <View className="flex-row items-center gap-2">
                        <View className="px-2.5 py-1 rounded-full bg-accent-paper">
                          <Text className="text-xs font-semibold text-mute">
                            {guestCount}
                          </Text>
                        </View>
                        {canEdit && (
                          <Pressable
                            onPress={() => setDeleteId(group.id)}
                            className="w-8 h-8 items-center justify-center"
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </Pressable>
                        )}
                      </View>
                    </View>

                    {missing > 0 && (
                      <Pressable
                        onPress={openable ? () => openQueue(group.id) : undefined}
                        disabled={!openable}
                        accessibilityRole={openable ? "button" : undefined}
                        className={`mt-2 ${openable ? "active:opacity-60" : ""}`}
                      >
                        <Text
                          className={`text-xs ${
                            openable ? "text-primary-500 font-medium" : "text-mute"
                          }`}
                        >
                          {t("namesToComplete", { count: missing })}
                        </Text>
                      </Pressable>
                    )}
                    {householdsLeft > 0 && canEdit && (
                      <Pressable
                        onPress={() => openHouseholds(group.id)}
                        accessibilityRole="button"
                        className="mt-2 active:opacity-60"
                      >
                        <Text className="text-xs text-primary-500 font-medium">
                          {t("household.remaining", { count: householdsLeft })}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => setShowAdd(true)} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteGroup")}
        message={t("deleteGroupMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeGroup(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
