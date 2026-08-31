import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform } from "react-native";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus,
  X,
  XCircle,
} from "lucide-react-native";
import {
  formatGuestGroupName,
  householdName,
  resolveGroupSides,
  resolveHousehold,
  rsvpStatusUpdate,
  sortGroups,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { useGuestGroupSideLabel } from "@/lib/guest-group-side";
import { InlineSelectMenu } from "@/components/InlineSelectMenu";
import type { InlineSelectAnchor, InlineSelectOption } from "@/components/InlineSelectMenu";
import { theme as GP } from "@/lib/theme";
import {
  DIET_LABELS,
  RSVP_STATUS_COLORS,
  RSVP_STATUS_LABELS,
  TRANSPORT_MODE_LABELS,
} from "@/db/types";
import type { Diet, RsvpStatus, TransportMode } from "@/db/types";

const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];
const DIETS: Diet[] = ["STANDARD", "VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "ALLERGY"];
const TRANSPORTS: TransportMode[] = ["car", "train", "shuttle", "taxi"];

/** Les champs de choix de la modale, un par déclencheur mesurable. */
type MenuKind =
  | "group"
  | "invitationType"
  | "rsvp"
  | "diet"
  | "table"
  | "accommodation"
  | "transport";

const LABEL_STYLE = {
  fontSize: 10.5,
  fontWeight: "600" as const,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  color: GP.mute,
};

const FIELD_BOX = {
  paddingHorizontal: 11,
  borderRadius: 9,
  borderWidth: 1,
  borderColor: GP.hair,
  backgroundColor: GP.card,
};

/** Titre de bloc : capitales espacées sur filet, le motif de la liste réduit. */
function BlockTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Text
        style={{
          fontSize: 10.5,
          fontWeight: "600",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          color: GP.olive,
        }}
      >
        {title}
      </Text>
      <View className="flex-1" style={{ height: 1, backgroundColor: GP.hair }} />
      {action}
    </View>
  );
}

/**
 * Un champ qui s'enregistre au fil de l'eau : la saisie est commise à la sortie
 * du champ, et la commission en attente est inscrite au registre pour que
 * fermer ou naviguer ne perde rien.
 */
function DirectInput({
  field,
  label,
  value,
  onCommit,
  registry,
  placeholder,
  height = 38,
  fontSize = 13.5,
  multiline,
  keyboardType,
  editable,
}: {
  field: string;
  label: string;
  value: string;
  onCommit: (v: string) => void;
  registry: React.MutableRefObject<Map<string, () => void>>;
  placeholder?: string;
  height?: number;
  fontSize?: number;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  editable?: boolean;
}) {
  // Monté par `key={field}` : changer d'invité remonte le champ, la valeur du
  // magasin redevient donc le brouillon sans effet de synchronisation.
  const [draft, setDraft] = useState(value);

  const commit = () => {
    registry.current.delete(field);
    const next = draft.trim();
    if (next === (value ?? "").trim()) return;
    onCommit(next);
  };

  return (
    <View className="flex-1" style={{ gap: 5, opacity: editable === false ? 0.6 : 1 }}>
      <Text style={LABEL_STYLE}>{label}</Text>
      <TextInput
        value={draft}
        onChangeText={(text: string) => {
          setDraft(text);
          registry.current.set(field, () => {
            const v = text.trim();
            if (v !== (value ?? "").trim()) onCommit(v);
          });
        }}
        onBlur={commit}
        placeholder={placeholder}
        placeholderTextColor={GP.mute}
        multiline={multiline}
        keyboardType={keyboardType}
        editable={editable}
        style={{
          ...FIELD_BOX,
          height,
          paddingTop: multiline ? 9 : 0,
          fontSize,
          color: GP.ink,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

/** Le nom édité DANS le titre : même registre de commissions, rendu Fraunces. */
function TitleInput({
  field,
  value,
  onCommit,
  registry,
  placeholder,
  width,
  fontSize,
  italic,
  color,
  borderColor,
  editable,
}: {
  field: string;
  value: string;
  onCommit: (v: string) => void;
  registry: React.MutableRefObject<Map<string, () => void>>;
  placeholder: string;
  width: number;
  fontSize: number;
  italic?: boolean;
  color: string;
  borderColor: string;
  editable?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  const commit = () => {
    registry.current.delete(field);
    const next = draft.trim();
    if (next === (value ?? "").trim()) return;
    onCommit(next);
  };

  return (
    <TextInput
      value={draft}
      onChangeText={(text: string) => {
        setDraft(text);
        registry.current.set(field, () => {
          const v = text.trim();
          if (v !== (value ?? "").trim()) onCommit(v);
        });
      }}
      onBlur={commit}
      placeholder={placeholder}
      placeholderTextColor={GP.mute}
      editable={editable}
      autoCorrect={false}
      style={{
        width,
        height: 42,
        paddingHorizontal: 12,
        borderRadius: 9,
        borderWidth: 1,
        borderColor,
        backgroundColor: GP.card,
        fontFamily: Platform.OS === "web" ? "Fraunces" : undefined,
        fontSize,
        fontWeight: italic ? "400" : "600",
        fontStyle: italic ? "italic" : "normal",
        letterSpacing: -0.02 * fontSize,
        color,
        opacity: editable === false ? 0.6 : 1,
      }}
    />
  );
}

/** Champ de sélection : étiquette au-dessus, valeur et chevron dedans. */
function SelectField({
  label,
  value,
  color,
  dot,
  height = 38,
  fontSize = 13.5,
  editable,
  onOpen,
}: {
  label: string;
  value: string;
  color?: string;
  dot?: string | null;
  height?: number;
  fontSize?: number;
  editable: boolean;
  onOpen: (anchor: InlineSelectAnchor) => void;
}) {
  const ref = useRef<any>(null);

  const open = () => {
    if (!ref.current?.measureInWindow) {
      onOpen({ x: 0, y: 0, width: 220, height });
      return;
    }
    ref.current.measureInWindow((x: number, y: number, width: number, h: number) =>
      onOpen({ x, y, width, height: h }),
    );
  };

  return (
    <View className="flex-1" style={{ gap: 5, opacity: editable ? 1 : 0.6 }}>
      <Text style={LABEL_STYLE}>{label}</Text>
      <Pressable
        ref={ref}
        disabled={!editable}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="flex-row items-center gap-2"
        style={{ ...FIELD_BOX, height }}
      >
        {dot ? (
          <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: dot }} />
        ) : null}
        <Text
          numberOfLines={1}
          className="flex-1"
          style={{ fontSize, fontWeight: dot ? "500" : "400", color: color ?? GP.inkSoft }}
        >
          {value}
        </Text>
        {editable ? <ChevronDown size={12} color={GP.mute} /> : null}
      </Pressable>
    </View>
  );
}

/** Bascule en pilule, cible de 38 px. */
function Toggle({
  label,
  value,
  onToggle,
  disabled,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="flex-row items-center gap-2.5"
      style={{ height: 38, opacity: disabled ? 0.6 : 1 }}
    >
      <View
        style={{
          width: 36,
          height: 21,
          borderRadius: 999,
          padding: 2,
          backgroundColor: value ? GP.clay : GP.hairStrong,
          alignItems: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            width: 17,
            height: 17,
            borderRadius: 999,
            backgroundColor: GP.card,
            shadowColor: GP.ink,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
          }}
        />
      </View>
      <Text style={{ fontSize: 13.5, color: GP.inkSoft }}>{label}</Text>
    </Pressable>
  );
}

export function GuestRecordModal({
  guestId,
  hasPrev,
  hasNext,
  onNavigate,
  onClose,
}: {
  guestId: string;
  hasPrev: boolean;
  hasNext: boolean;
  onNavigate: (direction: "prev" | "next") => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const canEdit = useCanEditHere();
  const sideLabel = useGuestGroupSideLabel();
  const guests = useGuestsStore((s) => s.guests);
  const storedGroups = useGuestsStore((s) => s.groups);
  const households = useGuestsStore((s) => s.households);
  const tables = useGuestsStore((s) => s.tables);
  const updateGuest = useGuestsStore((s) => s.updateGuest);
  const wedding = useWeddingStore((s) => s.wedding);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const accommodations = useAccommodationsStore((s) => s.accommodations);
  const weddingRoles = useWeddingPartyStore((s) => s.weddingRoles);
  const weddingRoleAssignments = useWeddingPartyStore((s) => s.weddingRoleAssignments);
  const addRoleAssignment = useWeddingPartyStore((s) => s.addRoleAssignment);
  const removeRoleAssignment = useWeddingPartyStore((s) => s.removeRoleAssignment);

  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState<{ kind: MenuKind; anchor: InlineSelectAnchor } | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const registry = useRef<Map<string, () => void>>(new Map());

  const flush = useCallback(() => {
    const pending = [...registry.current.values()];
    registry.current.clear();
    pending.forEach((commit) => commit());
  }, []);

  const close = useCallback(() => { flush(); onClose(); }, [flush, onClose]);
  const navigate = useCallback(
    (direction: "prev" | "next") => { flush(); onNavigate(direction); },
    [flush, onNavigate],
  );

  // Un menu ouvert prend Échap pour lui.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || menu) return;
      e.preventDefault();
      close();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [close, menu]);

  // Sur le web, react-native-web ferme la modale sur le `keyup` d'Échap, hors de
  // toute connaissance du menu ouvert : Échap y est à l'écoute ci-dessus, seule.
  const requestClose = useCallback(() => {
    if (Platform.OS === "web") return;
    close();
  }, [close]);

  // Changer d'invité est une nouvelle fiche : l'indicateur ne peut ni s'allumer
  // sans écriture, ni survivre à la navigation.
  const [seenGuest, setSeenGuest] = useState(guestId);
  if (guestId !== seenGuest) {
    setSeenGuest(guestId);
    setSavedAt(null);
    setMenu(null);
  }

  useEffect(() => {
    if (savedAt === null) return;
    const id = setTimeout(() => setSavedAt(null), 4000);
    return () => clearTimeout(id);
  }, [savedAt]);

  const guest = guests.find((g) => g.id === guestId) ?? null;

  const groups = useMemo(
    () => sortGroups(resolveGroupSides(storedGroups, wedding)),
    [storedGroups, wedding],
  );
  const household = useMemo(
    () => (guest ? resolveHousehold(households, guests, guest.id) : null),
    [households, guests, guest],
  );

  // Ordre canonique NON filtré — le même classement que la liste sans filtre.
  // Sous filtre, précédent/suivant suivent l'ordre visible : la position dit le
  // rang dans le registre entier, pas le nombre de pas faits.
  const canonical = useMemo(() => {
    const bySurname = (a: typeof guests[number], b: typeof guests[number]) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
    const order = guests.filter((g) => !g.groupId).sort(bySurname);
    for (const group of groups) {
      order.push(...guests.filter((g) => g.groupId === group.id).sort(bySurname));
    }
    const placed = new Set(order.map((g) => g.id));
    for (const g of guests) if (!placed.has(g.id)) order.push(g);
    return order.map((g) => g.id);
  }, [guests, groups]);
  const position = canonical.indexOf(guestId) + 1;

  const guestRoles = weddingRoleAssignments.filter((a) => a.guestId === guestId);

  if (!guest) return null;

  const set = (updates: Parameters<typeof updateGuest>[1]) => {
    updateGuest(guest.id, updates);
    setSavedAt(Date.now());
  };

  const group = groups.find((g) => g.id === guest.groupId) ?? null;
  const eyebrow = group
    ? `${formatGuestGroupName(group.name)} · ${sideLabel(group.side)}`
    : t("none");

  const typeLabel = invitationTypes.find((it) => it.id === guest.invitationType)?.label ?? "";
  const rsvpStatus = guest.rsvpStatus as RsvpStatus;
  const rsvpColor = RSVP_STATUS_COLORS[rsvpStatus] ?? GP.mute;
  const diet = (guest.diet as Diet) ?? "STANDARD";
  const transport = (guest.transportMode as TransportMode) ?? "car";
  const tableLabel = tables.find((tb) => tb.id === guest.tableId)?.name ?? t("noTable");
  const accommodationLabel =
    accommodations.find((a) => a.id === guest.accommodationId)?.name ?? t("noAccommodation");

  const menuOptions: InlineSelectOption[] = !menu
    ? []
    : menu.kind === "group"
      ? [
          { id: "", label: t("none") },
          ...groups.map((g) => ({ id: g.id, label: formatGuestGroupName(g.name) })),
        ]
      : menu.kind === "invitationType"
        ? invitationTypes.map((it) => ({ id: it.id, label: it.label }))
        : menu.kind === "rsvp"
          ? RSVP_STATUSES.map((s) => ({
              id: s,
              label: t(RSVP_STATUS_LABELS[s]),
              color: RSVP_STATUS_COLORS[s],
            }))
          : menu.kind === "diet"
            ? DIETS.map((d) => ({ id: d, label: t(DIET_LABELS[d]) }))
            : menu.kind === "table"
              ? [
                  { id: "", label: t("noTable") },
                  ...tables.map((tb) => ({ id: tb.id, label: tb.name })),
                ]
              : menu.kind === "accommodation"
                ? [
                    { id: "", label: t("noAccommodation") },
                    ...accommodations.map((a) => ({ id: a.id, label: a.name })),
                  ]
                : TRANSPORTS.map((m) => ({ id: m, label: t(TRANSPORT_MODE_LABELS[m]) }));

  const menuValue = !menu
    ? null
    : menu.kind === "group"
      ? guest.groupId ?? ""
      : menu.kind === "invitationType"
        ? guest.invitationType
        : menu.kind === "rsvp"
          ? rsvpStatus
          : menu.kind === "diet"
            ? diet
            : menu.kind === "table"
              ? guest.tableId ?? ""
              : menu.kind === "accommodation"
                ? guest.accommodationId ?? ""
                : transport;

  const pickMenuValue = (id: string) => {
    if (!menu) return;
    if (menu.kind === "group") set({ groupId: id || null });
    else if (menu.kind === "invitationType") set({ invitationType: id });
    else if (menu.kind === "rsvp") set(rsvpStatusUpdate(guest, id, new Date().toISOString()));
    else if (menu.kind === "diet") set({ diet: id });
    else if (menu.kind === "table") set({ tableId: id || null });
    else if (menu.kind === "accommodation") set({ accommodationId: id || null });
    else set({ transportMode: id });
    setMenu(null);
  };

  const openMenu = (kind: MenuKind) => (anchor: InlineSelectAnchor) => setMenu({ kind, anchor });

  const householdMembers = household?.members ?? [];
  const householdLabel =
    householdMembers.length > 1
      ? householdName(household?.household ?? null, householdMembers)
      : t("household.alone");
  const householdAddress = household?.household?.address?.trim() || t("recordAddressToCollect");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={requestClose}>
      <Pressable
        onPress={close}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: GP.ink + "66",
        }}
      />
      {/* `box-none` : hors de la carte, le clic atteint le voile. */}
      <View
        pointerEvents="box-none"
        className="flex-1 items-center"
        style={{ paddingTop: 64, paddingBottom: 32 }}
      >
        <View
          className="overflow-hidden"
          style={{
            width: 880,
            maxWidth: "94%",
            maxHeight: "100%",
            borderRadius: 20,
            backgroundColor: GP.card,
            shadowColor: GP.ink,
            shadowOffset: { width: 0, height: 30 },
            shadowOpacity: 0.35,
            shadowRadius: 70,
            elevation: 20,
          }}
        >
          <View
            className="flex-row items-start gap-3"
            style={{
              paddingTop: 20,
              paddingHorizontal: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: GP.hair,
            }}
          >
            <View className="flex-1" style={{ minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: GP.mute,
                  paddingBottom: 8,
                }}
              >
                {eyebrow}
              </Text>
              <View className="flex-row items-center gap-2">
                <TitleInput
                  key={`${guest.id}:firstName`}
                  field={`${guest.id}:firstName`}
                  value={guest.firstName ?? ""}
                  onCommit={(v) => set({ firstName: v })}
                  registry={registry}
                  placeholder={t("firstName")}
                  width={200}
                  fontSize={22}
                  color={GP.ink}
                  borderColor={(guest.firstName ?? "").trim() ? GP.hair : GP.mustard}
                  editable={canEdit}
                />
                <TitleInput
                  key={`${guest.id}:nameParticle`}
                  field={`${guest.id}:nameParticle`}
                  value={guest.nameParticle ?? ""}
                  onCommit={(v) => set({ nameParticle: v || null })}
                  registry={registry}
                  placeholder={t("nameParticle")}
                  width={96}
                  fontSize={17}
                  italic
                  color={GP.mute}
                  borderColor={GP.hair}
                  editable={canEdit}
                />
                <TitleInput
                  key={`${guest.id}:lastName`}
                  field={`${guest.id}:lastName`}
                  value={guest.lastName ?? ""}
                  onCommit={(v) => set({ lastName: v })}
                  registry={registry}
                  placeholder={t("lastName")}
                  width={230}
                  fontSize={22}
                  color={GP.ink}
                  borderColor={GP.hair}
                  editable={canEdit}
                />
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Pressable
                onPress={() => hasPrev && navigate("prev")}
                disabled={!hasPrev}
                accessibilityRole="button"
                accessibilityLabel={t("recordPrev")}
                className="rounded-full items-center justify-center"
                style={{ width: 38, height: 38, opacity: hasPrev ? 1 : 0.3 }}
              >
                <ChevronLeft size={16} color={GP.mute} />
              </Pressable>
              <Text
                style={{ fontSize: 12, color: GP.mute, minWidth: 48, textAlign: "center" }}
                numberOfLines={1}
              >
                {`${position} / ${guests.length}`}
              </Text>
              <Pressable
                onPress={() => hasNext && navigate("next")}
                disabled={!hasNext}
                accessibilityRole="button"
                accessibilityLabel={t("recordNext")}
                className="rounded-full items-center justify-center"
                style={{ width: 38, height: 38, opacity: hasNext ? 1 : 0.3 }}
              >
                <ChevronRight size={16} color={GP.mute} />
              </Pressable>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel={t("recordClose")}
                className="rounded-full items-center justify-center active:opacity-60"
                style={{ width: 38, height: 38, marginLeft: 4 }}
              >
                <X size={17} color={GP.ink} />
              </Pressable>
            </View>
          </View>

          {/* Replié, le contenu tient et ce défilement reste inerte. */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
            <View
              className="flex-row"
              style={{ gap: 28, paddingTop: 4, paddingHorizontal: 24, paddingBottom: 14 }}
            >
              <View className="flex-1" style={{ gap: 12, paddingTop: 16 }}>
                <BlockTitle title={t("sections.rsvpInvitation")} />
                <SelectField
                  label={t("groupLabel")}
                  value={group ? formatGuestGroupName(group.name) : t("none")}
                  editable={canEdit}
                  onOpen={openMenu("group")}
                />
                <View className="flex-row" style={{ gap: 12 }}>
                  <SelectField
                    label={t("columnInvitationType")}
                    value={typeLabel}
                    editable={canEdit}
                    onOpen={openMenu("invitationType")}
                  />
                  <SelectField
                    label={t("columnRsvp")}
                    value={t(RSVP_STATUS_LABELS[rsvpStatus] ?? "")}
                    color={rsvpColor}
                    dot={rsvpColor}
                    editable={canEdit}
                    onOpen={openMenu("rsvp")}
                  />
                </View>
                <Toggle
                  label={t("isChildLabel")}
                  value={guest.isChild === true}
                  onToggle={() => set({ isChild: !(guest.isChild === true) })}
                  disabled={!canEdit}
                />
              </View>

              <View className="flex-1" style={{ gap: 12, paddingTop: 16 }}>
                <BlockTitle title={t("recordBlockContact")} />
                <View className="flex-row" style={{ gap: 12 }}>
                  <DirectInput
                    key={`${guest.id}:email`}
                    field={`${guest.id}:email`}
                    label={t("email")}
                    value={guest.email ?? ""}
                    onCommit={(v) => set({ email: v || null })}
                    registry={registry}
                    keyboardType="email-address"
                    editable={canEdit}
                  />
                  <DirectInput
                    key={`${guest.id}:phone`}
                    field={`${guest.id}:phone`}
                    label={t("phone")}
                    value={guest.phone ?? ""}
                    onCommit={(v) => set({ phone: v || null })}
                    registry={registry}
                    keyboardType="phone-pad"
                    editable={canEdit}
                  />
                </View>
                <DirectInput
                  key={`${guest.id}:notes`}
                  field={`${guest.id}:notes`}
                  label={t("notes")}
                  value={guest.notes ?? ""}
                  onCommit={(v) => set({ notes: v || null })}
                  registry={registry}
                  height={76}
                  multiline
                  editable={canEdit}
                />
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
              {expanded ? (
                <View style={{ gap: 12, padding: 14, borderRadius: 12, backgroundColor: GP.paper }}>
                  <BlockTitle
                    title={t("recordRareTitle")}
                    action={
                      <Pressable
                        onPress={() => setExpanded(false)}
                        accessibilityRole="button"
                        className="justify-center active:opacity-60"
                        style={{ height: 38, marginVertical: -11 }}
                      >
                        <Text style={{ fontSize: 12.5, fontWeight: "500", color: GP.clay }}>
                          {t("recordFewerSections")}
                        </Text>
                      </Pressable>
                    }
                  />

                  <View className="flex-row" style={{ gap: 12 }}>
                    <SelectField
                      label={t("dietLabel")}
                      value={t(DIET_LABELS[diet])}
                      height={36}
                      fontSize={13}
                      editable={canEdit}
                      onOpen={openMenu("diet")}
                    />
                    <View className="flex-row" style={{ flex: 2, gap: 12 }}>
                      <DirectInput
                        key={`${guest.id}:dietNotes`}
                        field={`${guest.id}:dietNotes`}
                        label={t("dietDetails")}
                        value={guest.dietNotes ?? ""}
                        onCommit={(v) => set({ dietNotes: v || null })}
                        registry={registry}
                        height={36}
                        fontSize={13}
                        editable={canEdit}
                      />
                    </View>
                  </View>

                  <View className="flex-row" style={{ gap: 12 }}>
                    <SelectField
                      label={t("table")}
                      value={tableLabel}
                      color={guest.tableId ? GP.inkSoft : GP.mute}
                      height={36}
                      fontSize={13}
                      editable={canEdit}
                      onOpen={openMenu("table")}
                    />
                    <SelectField
                      label={t("accommodationSection")}
                      value={accommodationLabel}
                      color={guest.accommodationId ? GP.inkSoft : GP.mute}
                      height={36}
                      fontSize={13}
                      editable={canEdit}
                      onOpen={openMenu("accommodation")}
                    />
                    <DirectInput
                      key={`${guest.id}:roomNumber`}
                      field={`${guest.id}:roomNumber`}
                      label={t("roomNumber")}
                      value={guest.roomNumber ?? ""}
                      onCommit={(v) => set({ roomNumber: v || null })}
                      registry={registry}
                      height={36}
                      fontSize={13}
                      editable={canEdit}
                    />
                  </View>

                  <View className="flex-row" style={{ gap: 12 }}>
                    <SelectField
                      label={t("logistics.transportModeLabel")}
                      value={t(TRANSPORT_MODE_LABELS[transport])}
                      height={36}
                      fontSize={13}
                      editable={canEdit}
                      onOpen={openMenu("transport")}
                    />
                    <View className="flex-row" style={{ flex: 2, gap: 12 }}>
                      <DirectInput
                        key={`${guest.id}:arrivalNotes`}
                        field={`${guest.id}:arrivalNotes`}
                        label={t("logistics.arrivalNotes")}
                        value={guest.arrivalNotes ?? ""}
                        onCommit={(v) => set({ arrivalNotes: v || null })}
                        registry={registry}
                        height={36}
                        fontSize={13}
                        editable={canEdit}
                      />
                    </View>
                  </View>

                  <View className="flex-row items-center flex-wrap" style={{ gap: 14 }}>
                    <Toggle
                      label={t("logistics.parkingNeeded")}
                      value={guest.parkingNeeded === true}
                      onToggle={() => set({ parkingNeeded: !(guest.parkingNeeded === true) })}
                      disabled={!canEdit}
                    />
                    <View style={{ width: 1, height: 20, backgroundColor: GP.hair }} />
                    {guestRoles.map((assignment) => {
                      const role = weddingRoles.find((r) => r.id === assignment.roleId);
                      return (
                        <View
                          key={assignment.id}
                          className="flex-row items-center gap-1.5"
                          style={{
                            height: 28,
                            paddingLeft: 11,
                            paddingRight: canEdit ? 7 : 11,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: GP.clay,
                            backgroundColor: GP.claySoft,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "600", color: GP.olive }}>
                            {role?.name ?? ""}
                          </Text>
                          {canEdit && (
                            <Pressable
                              onPress={() => removeRoleAssignment(assignment.id)}
                              accessibilityRole="button"
                              className="items-center justify-center"
                              style={{ width: 20, height: 28 }}
                            >
                              <XCircle size={13} color={GP.olive} />
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                    {canEdit &&
                      weddingRoles
                        .filter((role) => !guestRoles.some((a) => a.roleId === role.id))
                        .map((role) => (
                          <Pressable
                            key={role.id}
                            onPress={() => {
                              const now = new Date().toISOString();
                              addRoleAssignment({
                                id: Crypto.randomUUID(),
                                roleId: role.id,
                                guestId: guest.id,
                                notes: null,
                                sortOrder: null,
                                createdAt: now,
                                updatedAt: now,
                              });
                            }}
                            accessibilityRole="button"
                            className="flex-row items-center gap-1.5 active:opacity-60"
                            style={{
                              height: 28,
                              paddingLeft: 10,
                              paddingRight: 11,
                              borderRadius: 999,
                              borderWidth: 1,
                              borderStyle: "dashed",
                              borderColor: GP.hairStrong,
                            }}
                          >
                            <Plus size={11} color={GP.mute} />
                            <Text style={{ fontSize: 12, color: GP.mute }}>{role.name}</Text>
                          </Pressable>
                        ))}
                  </View>

                  <View
                    className="flex-row items-center gap-2.5"
                    style={{
                      height: 44,
                      paddingHorizontal: 13,
                      borderRadius: 11,
                      borderWidth: 1,
                      borderColor: GP.hair,
                      backgroundColor: GP.card,
                    }}
                  >
                    <Home size={15} color={GP.clay} />
                    <Text
                      numberOfLines={1}
                      className="flex-1"
                      style={{ fontSize: 13.5, fontWeight: "500", color: GP.ink }}
                    >
                      {householdLabel}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12.5,
                        color: household?.household?.address?.trim() ? GP.inkSoft : GP.mute,
                      }}
                    >
                      {householdAddress}
                    </Text>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setExpanded(true)}
                  accessibilityRole="button"
                  className="flex-row items-center gap-2 active:opacity-60"
                  style={{ height: 38 }}
                >
                  <Plus size={13} color={GP.clay} />
                  <Text style={{ fontSize: 12.5, fontWeight: "500", color: GP.clay }}>
                    {t("recordMoreSections")}
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          <View
            className="flex-row items-center gap-3"
            style={{
              paddingVertical: 2,
              paddingHorizontal: 24,
              borderTopWidth: 1,
              borderTopColor: GP.hair,
              backgroundColor: GP.paper,
            }}
          >
            {savedAt !== null && (
              <>
                <Check size={14} color={GP.olive} strokeWidth={3} />
                <Text style={{ fontSize: 12.5, fontWeight: "500", color: GP.olive }}>
                  {t("recordSaved")}
                </Text>
              </>
            )}
            <View className="flex-1" />
            <Text style={{ fontSize: 11.5, color: GP.mute }} numberOfLines={1}>
              {t("recordShortcuts")}
            </Text>
            <Pressable
              onPress={() => {
                close();
                router.push({ pathname: "/(tabs)/guests/[id]", params: { id: guest.id } });
              }}
              accessibilityRole="button"
              className="justify-center active:opacity-60"
              style={{ height: 38 }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: "500", color: GP.clay }}>
                {t("recordOpenFull")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <InlineSelectMenu
        visible={menu !== null}
        anchor={menu?.anchor ?? null}
        options={menuOptions}
        valueId={menuValue}
        direction="over"
        hint={t("inlineMenuHint")}
        onPick={pickMenuValue}
        onDismiss={() => setMenu(null)}
      />
    </Modal>
  );
}
