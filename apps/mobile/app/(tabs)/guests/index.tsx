import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Platform, useWindowDimensions } from "react-native";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Users, ChevronDown, ChevronUp, ChevronRight, AlertTriangle, Check, Pencil, Plus } from "lucide-react-native";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
// MODIFICATION LOCALE — l'état « lecture impossible » (D5 du changement des époques).
import {
  countDuplicateGuests,
  guestNameMatches,
  formatGuestGroupName,
  resolveGroupSides,
  sortGroups,
  computeGroupProgress,
  householdsRemaining,
  householdScope,
  buildGuestListData,
  isFirstNameToComplete,
  nextFirstNameToComplete,
  selectRange,
  adjacentGuestId,
  type GuestListEntry,
  type GuestGroup,
  rsvpStatusUpdate,
} from "@fiance/sdk";
import { HomeBanner } from "@/components/HomeBanner";
import { Display } from "@/components/Display";
import { theme as GP } from "@/lib/theme";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useGuestGroupSideLabel } from "@/lib/guest-group-side";
import { useWeddingStore } from "@/store/useWeddingStore";
import { RSVP_STATUS_LABELS, RSVP_STATUS_COLORS } from "@/db/types";
import type { RsvpStatus } from "@/db/types";
import { FAB } from "@/components/FAB";
import { GuestBulkBar } from "@/components/GuestBulkBar";
import {
  GuestListRow,
  GUEST_ROW_HEIGHT,
  GUEST_ROW_INDENT,
  GUEST_ROW_NARROW,
  guestRowColumns,
} from "@/components/GuestListRow";
import { GuestQuickAddModal, type QuickAddContext } from "@/components/GuestQuickAddModal";
import { InlineSelectMenu, type InlineSelectAnchor } from "@/components/InlineSelectMenu";
import { InlineChoiceSheet } from "@/components/InlineChoiceSheet";
import { usePointerRegime } from "@/lib/usePointerRegime";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { useCan } from "@/lib/permissions/usePermissions";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { QuotaBadge } from "@/components/QuotaBadge";
import { useShowPaywall } from "@/components/PaywallProvider";
import { useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";
import type { Guest } from "@/db/schema";
import { marquer, programmerRapportDémarrage } from "@/lib/demarrage-marques";

type GuestListItem = GuestListEntry<Guest, GuestGroup>;
type CellKind = "invitationType" | "rsvp";

const PAGE_X = 16;
const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];

// No offset: the filter bar scrolls away with the content, so there is nothing
// for a pinned header to tuck under.
const STICKY_HEADER_CONFIG = { offset: 0 };

export default function GuestsListScreen() {
  // During render, not in an effect: this dates the render itself.
  marquer("écran des invités rendu");
  useEffect(() => { programmerRapportDémarrage(); }, []);

  return (
    <View className="flex-1 bg-accent-paper">
      <GuestsView />
    </View>
  );
}

// ─── Rangs de la liste ───────────────────────────────────────────────────────

// Not pinned: LegendList sticks one item at a time, and the group header is the
// one to keep on screen.
function SideHeader({ label, total }: { label: string; total: number }) {
  return (
    <View
      className="bg-accent-paper flex-row items-baseline gap-3 pt-8 pb-0"
      style={{ paddingHorizontal: PAGE_X }}
    >
      <Display size={14} weight="600" color={GP.olive} style={{ letterSpacing: 2.6, lineHeight: 18 }}>
        {label.toLocaleUpperCase("fr")}
      </Display>
      <View
        className="flex-1"
        style={{
          height: 3,
          borderTopWidth: 1,
          borderTopColor: GP.hairStrong,
          borderBottomWidth: 1,
          borderBottomColor: GP.hair,
        }}
      />
      <Text style={{ fontSize: 12, color: GP.mute }}>{total}</Text>
    </View>
  );
}

/** Case à trois états — la barre horizontale dit « une partie », jamais « aucun ». */
function GroupBox({
  state,
  onPress,
  visible,
  survol,
}: {
  state: "none" | "partial" | "all";
  onPress: () => void;
  visible: boolean;
  survol: { onHoverIn: () => void; onHoverOut: () => void };
}) {
  return (
    <Pressable
      onPress={onPress}
      {...survol}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: state === "all" }}
      className="w-5 h-5 rounded-full items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        backgroundColor: state === "none" ? "transparent" : GP.clay,
        borderWidth: state === "none" ? 1.5 : 0,
        borderColor: GP.hairStrong,
      }}
    >
      {state === "all" ? <Check size={11} color={GP.card} strokeWidth={3.4} /> : null}
      {state === "partial" ? (
        <View style={{ width: 9, height: 2.5, borderRadius: 2, backgroundColor: GP.card }} />
      ) : null}
    </Pressable>
  );
}

function GroupHeader({
  group,
  count,
  collapsed,
  missingCount,
  answeredCount,
  householdsToDo,
  selectionState,
  canEdit,
  boxVisible,
  narrow,
  captureRemaining,
  onToggle,
  onToggleGroupSelection,
  onStartCapture,
  onFinishCapture,
  onOpenHouseholds,
  onAddGuest,
}: {
  group: GuestGroup;
  count: number;
  collapsed: boolean;
  missingCount: number;
  answeredCount: number;
  householdsToDo: number;
  selectionState: "none" | "partial" | "all";
  canEdit: boolean;
  boxVisible: boolean;
  narrow: boolean;
  captureRemaining: number | null;
  onToggle: () => void;
  onToggleGroupSelection: () => void;
  onStartCapture: (() => void) | null;
  onFinishCapture: () => void;
  onOpenHouseholds: (() => void) | null;
  onAddGuest: (() => void) | null;
}) {
  const { t } = useTranslation("guests");
  const [hovered, setHovered] = useState(false);
  const Chevron = collapsed ? ChevronDown : ChevronUp;
  const householdsOpenable = onOpenHouseholds !== null && householdsToDo > 0;
  const pct = count > 0 ? Math.round((answeredCount / count) * 100) : 0;
  // Comme sur la ligne : la case entrée sous le curseur ne doit pas s'effacer.
  const survol = { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) };

  return (
    <View className="bg-accent-paper" style={{ paddingHorizontal: PAGE_X }}>
      <Pressable onPress={onToggle} {...survol} className="flex-row items-center gap-2.5 pt-5 pb-1.5">
        {canEdit ? (
          <GroupBox
            state={selectionState}
            onPress={onToggleGroupSelection}
            visible={boxVisible || hovered}
            survol={survol}
          />
        ) : null}
        <Chevron size={13} color={GP.ink} />
        <View style={{ flexShrink: 1 }}>
          <Display size={20} weight="600" style={{ lineHeight: 24 }} numberOfLines={1}>
            {formatGuestGroupName(group.name)}
          </Display>
        </View>
        <Text style={{ fontSize: 13, color: GP.mute }}>{count}</Text>
        {onAddGuest && hovered ? (
          <Pressable
            onPress={onAddGuest}
            accessibilityRole="button"
            accessibilityLabel={t("quickAdd.addToGroup")}
            className="rounded-full items-center justify-center active:opacity-60"
            style={{ width: 24, height: 24, backgroundColor: GP.claySoft }}
            {...survol}
          >
            <Plus size={13} color={GP.olive} />
          </Pressable>
        ) : null}
        <View className="flex-1" style={{ height: 1, backgroundColor: GP.hair }} />

        {missingCount > 0 && onStartCapture ? (
          <Pressable
            onPress={onStartCapture}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-full active:opacity-70"
            style={{ height: 28, paddingHorizontal: 11, backgroundColor: GP.mustardSoft }}
          >
            <Pencil size={12} color={GP.mustard} />
            <Text className="font-semibold" style={{ fontSize: 12, color: GP.mustard }} numberOfLines={1}>
              {t("namesToComplete", { count: missingCount })}
            </Text>
          </Pressable>
        ) : null}

        {/* Sur écran étroit la jauge prendrait au nom la place qu'elle occupe. */}
        {!narrow && (
          <>
            <Text style={{ fontSize: 12.5, color: GP.mute }} numberOfLines={1}>
              {t("rsvpProgress", { answered: answeredCount, total: count })}
            </Text>
            <View style={{ width: 84, height: 4, borderRadius: 2, backgroundColor: GP.claySoft, overflow: "hidden" }}>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: GP.clay, width: `${pct}%` }} />
            </View>
          </>
        )}
      </Pressable>

      {captureRemaining !== null ? (
        <View
          className="flex-row items-center gap-2 rounded-xl mb-1.5"
          style={{
            marginLeft: GUEST_ROW_INDENT,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: GP.mustardSoft,
          }}
        >
          <Text className="flex-1" style={{ fontSize: 12.5, color: GP.mustard }} numberOfLines={1}>
            {captureRemaining > 0
              ? t("nameQueueRemaining", { count: captureRemaining })
              : t("nameQueueAllDone")}
          </Text>
          <Pressable onPress={onFinishCapture} accessibilityRole="button" hitSlop={8}>
            <Text className="font-semibold" style={{ fontSize: 12.5, color: GP.mustard }}>
              {t("nameCaptureFinish")}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {householdsOpenable && (
        <Pressable
          onPress={onOpenHouseholds ?? undefined}
          accessibilityRole="button"
          className="pb-1.5 active:opacity-60"
          style={{ marginLeft: GUEST_ROW_INDENT }}
        >
          <Text className="font-medium" style={{ fontSize: 11.5, color: GP.clay }} numberOfLines={1}>
            {t("household.remaining", { count: householdsToDo })}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Guests View ─────────────────────────────────────────────────────────

function GuestsView() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const params = useLocalSearchParams<{ saisieGroupId?: string }>();
  const isWide = useIsWideScreen();
  const pointer = usePointerRegime();
  const { width: windowWidth } = useWindowDimensions();
  const columns = useMemo(() => guestRowColumns(windowWidth), [windowWidth]);
  const narrow = windowWidth < GUEST_ROW_NARROW;
  const canEditGuests = useCan("guests");
  const guests = useGuestsStore((s) => s.guests);
  const storedGroups = useGuestsStore((s) => s.groups);
  const wedding = useWeddingStore((s) => s.wedding);
  const groups = useMemo(
    () => sortGroups(resolveGroupSides(storedGroups, wedding)),
    [storedGroups, wedding],
  );
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const counts = useMemo(() => computeCounts(guests), [guests]);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [childFilter, setChildFilter] = useState(false);
  const canAddGuest = useCanAddMore("guests", guests.length);
  const { openPaywall } = useShowPaywall();
  const refuserAuQuota = useCallback(() => {
    const msg = t("common:premiumLimits.guests", { limit: FREE_LIMITS.guests });
    toast.error(msg);
    openPaywall(msg);
  }, [t, openPaywall]);

  const groupNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) map.set(g.id, g.name.toLowerCase());
    return map;
  }, [groups]);

  // Map invitationType id → label for display
  const typeLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of invitationTypes) map.set(it.id, it.label);
    return map;
  }, [invitationTypes]);

  // Set of type IDs that require sleeping
  const sleepingTypeIds = useMemo(
    () => new Set(invitationTypes.filter((it) => it.needsSleeping).map((it) => it.id)),
    [invitationTypes]
  );

  // Count accepted guests whose type needsSleeping and have no accommodation
  const noAccomCount = useMemo(
    () => guests.filter(
      (g) => g.rsvpStatus === "ACCEPTED" && sleepingTypeIds.has(g.invitationType) && !g.accommodationId
    ).length,
    [guests, sleepingTypeIds]
  );

  const duplicateCount = useMemo(() => countDuplicateGuests(guests), [guests]);

  const groupProgress = useMemo(() => computeGroupProgress(guests), [guests]);
  const sideLabel = useGuestGroupSideLabel();
  const openHouseholds = useCallback(
    (groupId: string) =>
      router.push({ pathname: "/(tabs)/guests/households", params: { groupId } }),
    [router],
  );
  const householdsToDo = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of storedGroups) map.set(g.id, householdsRemaining(guests, g.id));
    return map;
  }, [guests, storedGroups]);

  const filteredGuests = useMemo(() => {
    return guests
      .filter((g) => {
        if (rsvpFilter === "NO_TABLE") {
          if (g.rsvpStatus !== "ACCEPTED" || g.tableId || g.noTableNeeded) return false;
        } else if (rsvpFilter === "NO_ACCOM") {
          if (g.rsvpStatus !== "ACCEPTED" || !sleepingTypeIds.has(g.invitationType) || g.accommodationId) return false;
        } else if (rsvpFilter !== "ALL" && g.rsvpStatus !== rsvpFilter) {
          return false;
        }
        if (typeFilter !== "ALL" && g.invitationType !== typeFilter) return false;
        if (childFilter && g.isChild !== true) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            guestNameMatches(g, q) ||
            g.email?.toLowerCase().includes(q) ||
            (g.groupId ? (groupNames.get(g.groupId)?.includes(q) ?? false) : false)
          );
        }
        return true;
      })
      .sort((a, b) =>
        `${a.lastName}${a.firstName}`.localeCompare(
          `${b.lastName}${b.firstName}`
        )
      );
  }, [guests, search, rsvpFilter, typeFilter, childFilter, sleepingTypeIds, groupNames]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Dernière case actionnée — l'ancre de la plage au clic-Maj.
  const anchorRef = useRef<string | null>(null);
  const guestIdSet = useMemo(() => new Set(guests.map((g) => g.id)), [guests]);
  const effectiveSelection = useMemo(
    () => [...selectedIds].filter((id) => guestIdSet.has(id)),
    [selectedIds, guestIdSet],
  );
  const selectedCount = effectiveSelection.length;

  // Maj n'arrive pas dans l'événement de presse de react-native-web : on le tient
  // à part, et il n'existe qu'en régime pointeur.
  const shiftRef = useRef(false);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const down = (e: KeyboardEvent) => { if (e.key === "Shift") shiftRef.current = true; };
    const up = (e: KeyboardEvent) => { if (e.key === "Shift") shiftRef.current = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const toggleManySelection = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ids.every((id) => next.has(id))) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    anchorRef.current = null;
    setSelectedIds(new Set());
  }, []);

  const bulkRemoveGuests = useGuestsStore((s) => s.removeGuests);
  const bulkUpdateGuests = useGuestsStore((s) => s.updateGuests);
  const updateGuest = useGuestsStore((s) => s.updateGuest);

  const handleBulkInvitationType = useCallback(
    (typeId: string) => {
      const ids = effectiveSelection;
      if (ids.length === 0) return;
      bulkUpdateGuests(ids, () => ({ invitationType: typeId }));
      toast.success(t("bulkInvitationTypeAssigned", { count: ids.length }));
    },
    [effectiveSelection, bulkUpdateGuests, t],
  );

  const handleBulkRsvp = useCallback(
    (status: string) => {
      const ids = effectiveSelection;
      if (ids.length === 0) return;
      const now = new Date().toISOString();
      bulkUpdateGuests(ids, (g) => rsvpStatusUpdate(g, status, now));
      toast.success(t("bulkRsvpAssigned", { count: ids.length }));
    },
    [effectiveSelection, bulkUpdateGuests, t],
  );

  const handleBulkDelete = useCallback(() => {
    const ids = effectiveSelection;
    if (ids.length === 0) return;
    bulkRemoveGuests(ids);
    clearSelection();
    toast.success(t("bulkDeleted", { count: ids.length }));
  }, [effectiveSelection, bulkRemoveGuests, clearSelection, t]);

  const bulkInvitationTypes = useMemo(
    () => invitationTypes.map((it) => ({ id: it.id, label: it.label })),
    [invitationTypes],
  );

  const groupedGuests = useMemo(() => {
    if (groups.length === 0) return null;
    const ungrouped = filteredGuests.filter((g) => !g.groupId);
    const byGroup = groups
      .map((group) => ({
        group,
        guests: filteredGuests.filter((g) => g.groupId === group.id),
      }))
      .filter((section) => section.guests.length > 0);
    return { ungrouped, byGroup };
  }, [filteredGuests, groups]);

  // The EXPANDED groups are tracked, not the collapsed ones, so that the empty
  // initial set means "all collapsed" — pre-filling it from `groups` would
  // silently yield an empty set, the store hydrating only after mount.
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const visibleGroupIds = useMemo(
    () => (groupedGuests?.byGroup ?? []).map((section) => section.group.id),
    [groupedGuests],
  );
  const allExpanded =
    visibleGroupIds.length > 0 && visibleGroupIds.every((id) => expandedGroups.has(id));
  const toggleAllGroups = useCallback(() => {
    setExpandedGroups(allExpanded ? new Set() : new Set(visibleGroupIds));
  }, [allExpanded, visibleGroupIds]);

  const filteredIds = useMemo(() => filteredGuests.map((g) => g.id), [filteredGuests]);
  const visibleSelectedCount = useMemo(
    () => filteredIds.reduce((n, id) => (selectedIds.has(id) ? n + 1 : n), 0),
    [filteredIds, selectedIds],
  );
  const hiddenSelectedCount = Math.max(0, selectedCount - visibleSelectedCount);
  const allFilteredSelected =
    filteredIds.length > 0 && visibleSelectedCount === filteredIds.length;
  const toggleAllFiltered = useCallback(
    () => toggleManySelection(filteredIds),
    [toggleManySelection, filteredIds],
  );

  // Les invités d'un groupe RETENUS PAR LE FILTRE — la portée d'une case d'en-tête,
  // que le groupe soit déplié ou replié.
  const groupGuestIds = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const section of groupedGuests?.byGroup ?? []) {
      map.set(section.group.id, section.guests.map((g) => g.id));
    }
    return map;
  }, [groupedGuests]);

  // Flatten grouped/ungrouped guests into a single virtualizable list,
  // expanding group headers into the stream and skipping a group's guests
  // while it's collapsed.
  const { items: listData, stickyIndices } = useMemo(
    () =>
      groupedGuests
        ? buildGuestListData<Guest, GuestGroup>(
            groupedGuests.ungrouped,
            groupedGuests.byGroup,
            expandedGroups,
          )
        : buildGuestListData<Guest, GuestGroup>(filteredGuests, [], expandedGroups),
    [groupedGuests, filteredGuests, expandedGroups],
  );

  /** L'ordre que la liste MONTRE — filtres, recherche et replis compris. */
  const visibleGuestIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of listData) if (item.kind === "guest") ids.push(item.guest.id);
    return ids;
  }, [listData]);

  const toggleGuestSelection = useCallback(
    (id: string) => {
      if (shiftRef.current && anchorRef.current) {
        const range = selectRange(visibleGuestIds, anchorRef.current, id);
        if (range.length > 0) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            range.forEach((rid) => next.add(rid));
            return next;
          });
          anchorRef.current = id;
          return;
        }
      }
      anchorRef.current = id;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [visibleGuestIds],
  );

  // ─── Édition en ligne ──────────────────────────────────────────────────────

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [capture, setCapture] = useState<{ groupId: string; guestId: string } | null>(null);
  const [cell, setCell] = useState<
    { kind: CellKind; guestId: string; anchor: InlineSelectAnchor | null } | null
  >(null);
  const listRef = useRef<any>(null);

  // ─── Création rapide ───────────────────────────────────────────────────────
  //
  // Le contexte vit ici, pas dans la modale : le fermer ne doit pas le perdre.
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddContext, setQuickAddContext] = useState<QuickAddContext | null>(null);

  const openQuickAdd = useCallback(
    (groupId?: string) => {
      if (!canAddGuest) {
        refuserAuQuota();
        return;
      }
      setQuickAddContext((prev) => {
        const base: QuickAddContext = prev ?? {
          groupId: visibleGroupIds[0] ?? null,
          invitationType: "FULL",
          rsvpStatus: "PENDING",
          sameHousehold: false,
          lastName: "",
          nameParticle: "",
          lastCreatedId: null,
        };
        // Le « + » d'un en-tête prime sur la catégorie mémorisée.
        return groupId === undefined ? base : { ...base, groupId };
      });
      setQuickAddOpen(true);
    },
    [canAddGuest, refuserAuQuota, visibleGroupIds],
  );

  const handleAddGuest = useCallback(() => {
    if (pointer) {
      openQuickAdd();
      return;
    }
    if (!canAddGuest) {
      refuserAuQuota();
      return;
    }
    router.push({ pathname: "/(tabs)/guests/[id]", params: { id: "new" } });
  }, [pointer, openQuickAdd, canAddGuest, refuserAuQuota, router]);

  // La liste range la ligne d'elle-même ; l'écran ne fait que déplier.
  const handleQuickAddCreated = useCallback((guest: Guest) => {
    const groupId = guest.groupId;
    if (!groupId) return;
    setExpandedGroups((prev) => (prev.has(groupId) ? prev : new Set(prev).add(groupId)));
  }, []);

  const closeCell = useCallback(() => setCell(null), []);

  const openCell = useCallback(
    (kind: CellKind, guestId: string, anchor: InlineSelectAnchor) => {
      setRenamingId(null);
      setCell({ kind, guestId, anchor: pointer ? anchor : null });
    },
    [pointer],
  );

  const cellGuest = useMemo(
    () => (cell ? guests.find((g) => g.id === cell.guestId) ?? null : null),
    [cell, guests],
  );

  const cellOptions = useMemo(() => {
    if (!cell) return [];
    return cell.kind === "invitationType"
      ? invitationTypes.map((it) => ({ id: it.id, label: it.label }))
      : RSVP_STATUSES.map((s) => ({
          id: s,
          label: t(RSVP_STATUS_LABELS[s]),
          color: RSVP_STATUS_COLORS[s],
        }));
  }, [cell, invitationTypes, t]);

  const cellScope = useMemo(
    () => (cell ? householdScope(guests, cell.guestId) : []),
    [cell, guests],
  );

  const applyCellValue = useCallback(
    (valueId: string, ids: string[]) => {
      if (!cell) return;
      if (cell.kind === "invitationType") {
        bulkUpdateGuests(ids, () => ({ invitationType: valueId }));
      } else {
        const now = new Date().toISOString();
        bulkUpdateGuests(ids, (g) => rsvpStatusUpdate(g, valueId, now));
      }
    },
    [cell, bulkUpdateGuests],
  );

  const pickCellValue = useCallback(
    (valueId: string) => {
      if (!cell) return;
      applyCellValue(valueId, [cell.guestId]);
      closeCell();
    },
    [cell, applyCellValue, closeCell],
  );

  // Choisir une valeur ferme le menu : l'action de foyer porte donc la valeur
  // que l'invité montre, propagée à ses co-membres.
  const applyToHousehold = useCallback(() => {
    if (!cell || cellScope.length < 2 || !cellGuest) return;
    const valueId =
      cell.kind === "invitationType" ? cellGuest.invitationType : cellGuest.rsvpStatus;
    if (!valueId) return;
    applyCellValue(valueId, cellScope);
    closeCell();
    toast.success(t("inlineHouseholdApplied", { count: cellScope.length }));
  }, [cell, cellScope, cellGuest, applyCellValue, closeCell, t]);

  const commitRename = useCallback(
    (id: string, firstName: string, particle: string, lastName: string) => {
      updateGuest(id, { firstName, nameParticle: particle.trim() || null, lastName });
      setRenamingId(null);
    },
    [updateGuest],
  );

  // ─── Mode saisie des prénoms ───────────────────────────────────────────────

  const captureRemaining = useMemo(
    () =>
      capture
        ? guests.filter((g) => g.groupId === capture.groupId && isFirstNameToComplete(g)).length
        : 0,
    [capture, guests],
  );

  const startCapture = useCallback(
    (groupId: string) => {
      const first = nextFirstNameToComplete(guests, groupId);
      if (!first) return;
      setExpandedGroups((prev) => new Set(prev).add(groupId));
      setRenamingId(null);
      setCapture({ groupId, guestId: first.id });
    },
    [guests],
  );

  // Le renvoi de l'écran des catégories : groupe déplié, mode engagé, une fois.
  const consumedParam = useRef<string | null>(null);
  useEffect(() => {
    const id = params.saisieGroupId;
    if (!id || consumedParam.current === id || guests.length === 0) return;
    consumedParam.current = id;
    startCapture(id);
  }, [params.saisieGroupId, guests.length, startCapture]);

  const commitFirstName = useCallback(
    (id: string, firstName: string) => {
      if (!capture) return;
      updateGuest(id, { firstName });
      const store = useGuestsStore.getState().guests;
      const next = nextFirstNameToComplete(store, capture.groupId, id);
      if (!next) {
        setCapture({ ...capture, guestId: "" });
        return;
      }
      // Le défilement précède le focus : la ligne suivante peut ne pas être montée.
      const index = listData.findIndex(
        (item) => item.kind === "guest" && item.guest.id === next.id,
      );
      if (index >= 0) listRef.current?.scrollToIndex?.({ index, animated: false });
      setCapture({ ...capture, guestId: next.id });
    },
    [capture, updateGuest, listData],
  );

  // ─── Rendu de la liste ─────────────────────────────────────────────────────

  const sideTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const section of groupedGuests?.byGroup ?? []) {
      const key = section.group.side ?? "none";
      map.set(key, (map.get(key) ?? 0) + section.guests.length);
    }
    return map;
  }, [groupedGuests]);

  const boxPinned = selectedCount > 0;

  const renderItem = useCallback(
    ({ item }: { item: GuestListItem }) => {
      if (item.kind === "side-header") {
        return (
          <SideHeader
            label={sideLabel(item.side)}
            total={sideTotals.get(item.side ?? "none") ?? 0}
          />
        );
      }
      if (item.kind === "group-header") {
        const progress = groupProgress.get(item.group.id);
        const ids = groupGuestIds.get(item.group.id) ?? [];
        const picked = ids.reduce((n, id) => (selectedIds.has(id) ? n + 1 : n), 0);
        return (
          <GroupHeader
            group={item.group}
            count={item.count}
            collapsed={item.collapsed}
            missingCount={progress?.missingFirstName ?? 0}
            answeredCount={progress?.answered ?? 0}
            householdsToDo={householdsToDo.get(item.group.id) ?? 0}
            selectionState={picked === 0 ? "none" : picked === ids.length ? "all" : "partial"}
            canEdit={canEditGuests}
            boxVisible={!pointer || boxPinned}
            narrow={narrow}
            captureRemaining={capture?.groupId === item.group.id ? captureRemaining : null}
            onToggle={() => toggleGroup(item.group.id)}
            onToggleGroupSelection={() => {
              // Un groupe partiellement coché se complète, il ne se vide pas.
              if (picked > 0 && picked < ids.length) {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  ids.forEach((id) => next.add(id));
                  return next;
                });
              } else {
                toggleManySelection(ids);
              }
            }}
            onStartCapture={canEditGuests ? () => startCapture(item.group.id) : null}
            onFinishCapture={() => setCapture(null)}
            onOpenHouseholds={canEditGuests ? () => openHouseholds(item.group.id) : null}
            onAddGuest={
              canEditGuests && pointer ? () => openQuickAdd(item.group.id) : null
            }
          />
        );
      }
      const guest = item.guest;
      return (
        <View
          style={{
            marginLeft: PAGE_X + GUEST_ROW_INDENT,
            marginRight: PAGE_X,
            borderLeftWidth: 1,
            borderLeftColor: GP.hair,
          }}
        >
          <GuestListRow
            guest={guest}
            invitationTypeLabel={typeLabels.get(guest.invitationType) ?? guest.invitationType}
            columns={columns}
            pointer={pointer}
            canEdit={canEditGuests}
            selected={selectedIds.has(guest.id)}
            boxPinned={boxPinned}
            renaming={renamingId === guest.id}
            capturing={capture?.guestId === guest.id}
            onOpen={() => router.push({
              pathname: "/(tabs)/guests/[id]",
              params: { id: guest.id },
            })}
            onToggleSelected={() => toggleGuestSelection(guest.id)}
            onOpenInvitationType={(anchor) => openCell("invitationType", guest.id, anchor)}
            onOpenRsvp={(anchor) => openCell("rsvp", guest.id, anchor)}
            onStartRename={() => { setCell(null); setRenamingId(guest.id); }}
            onCommitRename={(first, particle, last) =>
              commitRename(guest.id, first, particle, last)
            }
            onCancelRename={() => setRenamingId(null)}
            onCommitFirstName={(first) => commitFirstName(guest.id, first)}
            onCancelCapture={() => setCapture(null)}
          />
        </View>
      );
    },
    [
      toggleGroup,
      typeLabels,
      canEditGuests,
      selectedIds,
      groupProgress,
      groupGuestIds,
      householdsToDo,
      narrow,
      sideLabel,
      sideTotals,
      openHouseholds,
      toggleGuestSelection,
      toggleManySelection,
      columns,
      pointer,
      boxPinned,
      renamingId,
      capture,
      captureRemaining,
      startCapture,
      openCell,
      commitRename,
      commitFirstName,
      openQuickAdd,
      router,
    ]
  );

  const keyExtractor = useCallback(
    (item: GuestListItem) =>
      item.kind === "group-header"
        ? `g-${item.group.id}`
        : item.kind === "side-header"
          ? `s-${item.side ?? "none"}`
          : `u-${item.guest.id}`,
    []
  );

  // Toute la mécanique d'interaction vit dans l'écran : sans `extraData`,
  // LegendList mémoïse les lignes par identité d'item et elles restent figées.
  const extraData = useMemo(
    () => ({ selectedIds, renamingId, capture, cellId: cell?.guestId ?? null, pointer, columns }),
    [selectedIds, renamingId, capture, cell?.guestId, pointer, columns],
  );

  const rsvpTabs = [
    { key: "ALL", label: t("all"), count: counts.total },
    { key: "ACCEPTED", label: t("confirmed"), count: counts.accepted },
    { key: "PENDING", label: t("pending"), count: counts.pending },
    { key: "DECLINED", label: t("declined"), count: counts.declined },
    { key: "MAYBE", label: t("maybe"), count: counts.maybe },
    { key: "NO_TABLE", label: t("noTable"), count: counts.no_table_count },
    { key: "NO_ACCOM", label: t("noAccommodation"), count: noAccomCount },
  ].filter((tab) => tab.count > 0 || tab.key === rsvpFilter);

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of guests) {
      map.set(g.invitationType, (map.get(g.invitationType) ?? 0) + 1);
    }
    return map;
  }, [guests]);

  const childCount = useMemo(() => guests.reduce((n, g) => (g.isChild === true ? n + 1 : n), 0), [guests]);

  const typeTabs = invitationTypes
    .map((it) => ({ key: it.id, label: it.label, count: typeCounts.get(it.id) ?? 0 }))
    .filter((tab) => tab.count > 0 || tab.key === typeFilter);

  // Same definition as `recipients()`, in one pass: that function is far too
  // costly to call while rendering the guest list.
  const recipientCount = useMemo(() => {
    const householdIds = new Set<string>();
    let loners = 0;
    for (const g of guests) {
      if (g.householdId) householdIds.add(g.householdId);
      else loners += 1;
    }
    return householdIds.size + loners;
  }, [guests]);

  const listHeader = (
    <>
      {duplicateCount > 0 && (
        <View className="px-4 pt-5">
          <HomeBanner
            icon={<AlertTriangle size={20} color={GP.mustard} />}
            iconBg={GP.mustardSoft}
            title={t("duplicateWarningTitle")}
            description={t("duplicateWarningDesc", { count: duplicateCount })}
          />
        </View>
      )}
      <Pressable
        onPress={() => router.push("/(tabs)/guests/recipients")}
        className="flex-row items-center justify-between px-4 pt-5 active:opacity-60"
      >
        <Text className="text-sm font-semibold text-primary-500">
          {t("household.recipientCount", { count: recipientCount })}
        </Text>
        <ChevronRight size={16} color={GP.clay} />
      </Pressable>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t("searchGuest")}
        className="px-4 pt-5 pb-2"
      />

      {/* Filters — single row: RSVP (filled) + separator + Type (outline, toggle) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-6 mb-4"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: "center" }}
      >
        {rsvpTabs.map((tab) => {
          const isActive = tab.key === rsvpFilter;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setRsvpFilter(tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "bg-primary-500 border-primary-500"
                  : "bg-accent-card border-hair"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-mute"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
        <View className="w-px bg-hair my-1" />
        {typeTabs.map((tab) => {
          const isActive = tab.key === typeFilter;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setTypeFilter(isActive ? "ALL" : tab.key)}
              className={`px-4 py-2 rounded-full border ${
                isActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                  : "bg-accent-card border-hair"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-primary-500"
                    : "text-mute"
                }`}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}

        {(childCount > 0 || childFilter) && (
          <Pressable
            onPress={() => setChildFilter(!childFilter)}
            className={`px-4 py-2 rounded-full border ${
              childFilter
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                : "bg-accent-card border-hair"
            }`}
          >
            <Text className={`text-sm font-medium ${childFilter ? "text-primary-500" : "text-mute"}`}>
              {t("child")} ({childCount})
            </Text>
          </Pressable>
        )}

        {groupedGuests && groupedGuests.byGroup.length > 1 && (
          <>
            <View className="w-px bg-hair my-1" />
            <Pressable
              onPress={toggleAllGroups}
              className="px-4 py-2 rounded-full border border-hair bg-accent-card"
            >
              <Text className="text-sm font-medium text-primary-500">
                {allExpanded
                  ? t("collapseAllGroups")
                  : `${t("expandAllGroups")} (${groupedGuests.byGroup.length})`}
              </Text>
            </Pressable>
          </>
        )}

        {canEditGuests && filteredIds.length > 0 && (
          <>
            <View className="w-px bg-hair my-1" />
            <Pressable
              onPress={toggleAllFiltered}
              className="px-4 py-2 rounded-full border border-hair bg-accent-card"
            >
              <Text className="text-sm font-medium text-primary-500">
                {allFilteredSelected
                  ? t("bulkDeselectAllFiltered")
                  : t("bulkSelectAllFiltered", {
                      count: filteredIds.length - visibleSelectedCount,
                    })}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View className="px-4 mb-3">
        <QuotaBadge entityKey="guests" count={guests.length} />
      </View>

      {/* Intitulés de colonne — le registre annonce ses colonnes une seule fois. */}
      <View
        className="flex-row items-center pb-1.5"
        style={{ paddingLeft: PAGE_X + GUEST_ROW_INDENT, paddingRight: PAGE_X }}
      >
        <ColumnLabel label={t("columnGuest")} style={{ flex: 1 }} />
        <ColumnLabel
          label={narrow ? t("columnInvitationTypeShort") : t("columnInvitationType")}
          style={{ width: columns.invitationType }}
        />
        <ColumnLabel label={t("columnRsvp")} style={{ width: columns.rsvp }} />
        {pointer && <View style={{ width: 22 }} />}
      </View>
      <View
        style={{ height: 1, backgroundColor: GP.hairStrong, marginHorizontal: PAGE_X }}
      />
    </>
  );

  return (
    <View className="relative flex-1">
      {/* Guest list — big CTA only when there are truly no guests; a search/filter that
          matches none keeps the search bar + filters visible with an inline message. */}
      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noGuests")}
          description={t("addFirstGuest")}
          actionLabel={t("addGuest")}
          onAction={handleAddGuest}
          secondaryActionLabel={t("importExternalGuests")}
          onSecondaryAction={() => router.push("/settings/import-external")}
        />
      ) : (
        <LegendList
          ref={listRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          stickyIndices={stickyIndices}
          stickyHeaderConfig={STICKY_HEADER_CONFIG}
          // Lignes d'invité à 40 px, en-têtes plus hauts : l'estimation vise la
          // ligne, qui est ce que la liste contient en masse.
          estimatedItemSize={GUEST_ROW_HEIGHT}
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
          // L'ancre mesurée d'un menu serait fausse au pixel suivant.
          onScroll={cell ? closeCell : undefined}
          extraData={extraData}
        />
      )}

      {isWide && canEditGuests && selectedCount === 0 && (
        <FAB onPress={handleAddGuest} locked={!canAddGuest} />
      )}

      {canEditGuests && (
        <GuestBulkBar
          count={selectedCount}
          hiddenCount={hiddenSelectedCount}
          invitationTypes={bulkInvitationTypes}
          pointer={pointer}
          onClear={clearSelection}
          onAssignInvitationType={handleBulkInvitationType}
          onAssignRsvp={handleBulkRsvp}
          onDelete={handleBulkDelete}
        />
      )}

      {/* Régime pointeur : le menu recouvre la cellule. Au toucher : une feuille. */}
      <InlineSelectMenu
        visible={cell !== null && cell.anchor !== null}
        anchor={cell?.anchor ?? null}
        options={cellOptions}
        valueId={
          cellGuest
            ? cell?.kind === "invitationType"
              ? cellGuest.invitationType
              : cellGuest.rsvpStatus
            : null
        }
        width={cell?.kind === "invitationType" ? 300 : 232}
        footer={
          cellScope.length >= 2
            ? {
                label: t("inlineApplyToHousehold", { count: cellScope.length }),
                onPress: applyToHousehold,
              }
            : null
        }
        hint={t("inlineMenuHint")}
        onPick={pickCellValue}
        onDismiss={closeCell}
      />

      <InlineChoiceSheet
        visible={cell !== null && cell.anchor === null}
        title={cell?.kind === "invitationType" ? t("columnInvitationType") : t("columnRsvp")}
        options={cellOptions}
        valueId={
          cellGuest
            ? cell?.kind === "invitationType"
              ? cellGuest.invitationType
              : cellGuest.rsvpStatus
            : null
        }
        footer={
          cellScope.length >= 2
            ? {
                label: t("inlineApplyToHousehold", { count: cellScope.length }),
                onPress: applyToHousehold,
              }
            : null
        }
        onPick={pickCellValue}
        onDismiss={closeCell}
      />

      {pointer && quickAddOpen && quickAddContext && (
        <GuestQuickAddModal
          context={quickAddContext}
          onContextChange={(patch) =>
            setQuickAddContext((prev) => (prev ? { ...prev, ...patch } : prev))
          }
          onCreated={handleQuickAddCreated}
          onOpenRecord={(guestId) => {
            setQuickAddOpen(false);
            router.push({ pathname: "/(tabs)/guests/[id]", params: { id: guestId } });
          }}
          onClose={() => setQuickAddOpen(false)}
        />
      )}
    </View>
  );
}

function ColumnLabel({ label, style }: { label: string; style: object }) {
  return (
    <Text
      numberOfLines={1}
      style={{
        ...style,
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: GP.mute,
      }}
    >
      {label}
    </Text>
  );
}

// Groups and table-list management moved to dedicated routes
// (groups.tsx, table-management.tsx), reached via the header overflow menu.
