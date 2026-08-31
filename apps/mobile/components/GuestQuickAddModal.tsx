import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform } from "react-native";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Plus, Undo2, X } from "lucide-react-native";
import {
  formatGuestGroupName,
  formatGuestName,
  newGuestDraft,
  resolveChainedHousehold,
  resolveGroupSides,
  sortGroups,
} from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { useGuestGroupSideLabel } from "@/lib/guest-group-side";
import { useShowPaywall } from "@/components/PaywallProvider";
import { useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";
import { analytics } from "@/lib/analytics";
import { InlineSelectMenu } from "@/components/InlineSelectMenu";
import type { InlineSelectAnchor, InlineSelectOption } from "@/components/InlineSelectMenu";
import { Display } from "@/components/Display";
import { theme as GP } from "@/lib/theme";
import { RSVP_STATUS_COLORS, RSVP_STATUS_LABELS } from "@/db/types";
import type { RsvpStatus } from "@/db/types";
import type { Guest } from "@/db/schema";

const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];

type MenuKind = "group" | "invitationType" | "rsvp";

/**
 * Ce qui colle d'une création à l'autre — et survit à la fermeture de la
 * modale. L'état vit dans l'écran ; la modale n'a en propre que le volatil.
 */
export interface QuickAddContext {
  groupId: string | null;
  invitationType: string;
  rsvpStatus: string;
  sameHousehold: boolean;
  lastName: string;
  nameParticle: string;
  /** La tête de chaîne : le foyer de la création suivante se lit sur elle. */
  lastCreatedId: string | null;
}

const LABEL_STYLE = {
  fontSize: 10.5,
  fontWeight: "600" as const,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  color: GP.mute,
};

/** Pilule du bandeau : la valeur courante, ouvrant son menu sous elle. */
function Pill({
  label,
  value,
  dot,
  editable,
  onOpen,
}: {
  label: string;
  value: string;
  dot?: string | null;
  editable: boolean;
  onOpen: (anchor: InlineSelectAnchor) => void;
}) {
  const ref = useRef<any>(null);

  const open = () => {
    if (!ref.current?.measureInWindow) {
      onOpen({ x: 0, y: 0, width: 220, height: 32 });
      return;
    }
    ref.current.measureInWindow((x: number, y: number, width: number, height: number) =>
      onOpen({ x, y, width, height }),
    );
  };

  return (
    <Pressable
      ref={ref}
      disabled={!editable}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-2 rounded-full active:opacity-70"
      style={{
        height: 32,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: GP.hair,
        backgroundColor: GP.paper,
        opacity: editable ? 1 : 0.6,
      }}
    >
      {dot ? (
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: dot }} />
      ) : null}
      <Text numberOfLines={1} style={{ fontSize: 12.5, color: GP.inkSoft }}>
        {value}
      </Text>
    </Pressable>
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

/** Champ de nom : Entrée y crée et enchaîne. */
function NameInput({
  inputRef,
  label,
  value,
  onChange,
  onSubmit,
  width,
  flex,
  borderColor,
  italic,
  autoFocus,
  editable,
}: {
  inputRef?: React.RefObject<any>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  width?: number;
  flex?: number;
  borderColor: string;
  italic?: boolean;
  autoFocus?: boolean;
  editable: boolean;
}) {
  return (
    <View style={{ gap: 5, width, flex }}>
      <Text style={LABEL_STYLE}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder={label}
        placeholderTextColor={GP.mute}
        autoFocus={autoFocus}
        autoCorrect={false}
        blurOnSubmit={false}
        editable={editable}
        accessibilityLabel={label}
        style={{
          height: 40,
          paddingHorizontal: 11,
          borderRadius: 9,
          borderWidth: 1,
          borderColor,
          backgroundColor: GP.card,
          fontSize: 15,
          fontStyle: italic ? "italic" : "normal",
          color: GP.ink,
        }}
      />
    </View>
  );
}

export function GuestQuickAddModal({
  context,
  onContextChange,
  onCreated,
  onOpenRecord,
  onClose,
}: {
  context: QuickAddContext;
  onContextChange: (patch: Partial<QuickAddContext>) => void;
  onCreated: (guest: Guest) => void;
  onOpenRecord: (guestId: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("guests");
  const canEdit = useCanEditHere();
  const sideLabel = useGuestGroupSideLabel();
  const guests = useGuestsStore((s) => s.guests);
  const storedGroups = useGuestsStore((s) => s.groups);
  const addGuest = useGuestsStore((s) => s.addGuest);
  const removeGuests = useGuestsStore((s) => s.removeGuests);
  const attachToHousehold = useGuestsStore((s) => s.attachToHousehold);
  const wedding = useWeddingStore((s) => s.wedding);
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const canAddGuest = useCanAddMore("guests", guests.length);
  const { openPaywall } = useShowPaywall();

  // Le volatil : la fermeture l'emporte, le contexte de l'écran survit.
  const [firstName, setFirstName] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [lastName, setLastName] = useState(context.sameHousehold ? context.lastName : "");
  const [particle, setParticle] = useState(context.sameHousehold ? context.nameParticle : "");
  const [batch, setBatch] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ kind: MenuKind; anchor: InlineSelectAnchor } | null>(null);
  const firstNameRef = useRef<any>(null);

  // Un menu ouvert prend Échap pour lui.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || menu) return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose, menu]);

  // Sur le web, react-native-web ferme la modale sur le `keyup` d'Échap, hors
  // de toute connaissance du menu ouvert : Échap est à l'écoute ci-dessus, seul.
  const requestClose = useCallback(() => {
    if (Platform.OS === "web") return;
    onClose();
  }, [onClose]);

  const groups = useMemo(
    () => sortGroups(resolveGroupSides(storedGroups, wedding)),
    [storedGroups, wedding],
  );

  const groupLabel = (id: string | null): string => {
    const group = groups.find((g) => g.id === id);
    return group ? `${formatGuestGroupName(group.name)} · ${sideLabel(group.side)}` : t("none");
  };
  const typeLabel =
    invitationTypes.find((it) => it.id === context.invitationType)?.label ?? t("none");
  const rsvpStatus = context.rsvpStatus as RsvpStatus;

  const canCreate = canEdit && lastName.trim().length > 0;
  const added = batch
    .map((id) => guests.find((g) => g.id === id))
    .filter((g): g is Guest => g !== undefined);

  const create = useCallback(
    (thenClose: boolean) => {
      if (!canEdit || !lastName.trim()) return;
      // La modale n'est pas une porte dérobée autour de la limite.
      if (!canAddGuest) {
        const msg = t("common:premiumLimits.guests", { limit: FREE_LIMITS.guests });
        toast.error(msg);
        openPaywall(msg);
        return;
      }

      const chained = context.sameHousehold
        ? resolveChainedHousehold(guests, context.lastCreatedId, Crypto.randomUUID())
        : { householdId: null, attachPrevious: false };
      if (chained.attachPrevious && context.lastCreatedId && chained.householdId) {
        attachToHousehold([context.lastCreatedId], chained.householdId);
      }

      const draft = newGuestDraft({
        id: Crypto.randomUUID(),
        now: new Date().toISOString(),
        firstName,
        nameParticle: particle,
        lastName,
        groupId: context.groupId,
        invitationType: context.invitationType,
        rsvpStatus: context.rsvpStatus,
        isChild,
        householdId: chained.householdId,
      });
      addGuest(draft);
      analytics.capture("guest_added");
      onCreated(draft);

      setBatch((prev) => [...prev, draft.id]);
      onContextChange({
        lastCreatedId: draft.id,
        lastName,
        nameParticle: particle,
      });

      if (thenClose) {
        onClose();
        return;
      }
      setFirstName("");
      setIsChild(false);
      if (!context.sameHousehold) {
        setLastName("");
        setParticle("");
      }
      firstNameRef.current?.focus();
    },
    [
      canEdit,
      canAddGuest,
      lastName,
      particle,
      firstName,
      isChild,
      guests,
      context,
      addGuest,
      attachToHousehold,
      onContextChange,
      onCreated,
      onClose,
      openPaywall,
      t,
    ],
  );

  const toggleSameHousehold = useCallback(() => {
    const engagee = !context.sameHousehold;
    onContextChange({ sameHousehold: engagee });
    if (engagee) {
      // Engagée après une création, elle reprend le nom de celle-ci.
      if (!lastName.trim() && context.lastName) {
        setLastName(context.lastName);
        setParticle(context.nameParticle);
      }
      return;
    }
    // Décochée, elle cesse de conserver — sans effacer une frappe en cours.
    if (lastName === context.lastName) {
      setLastName("");
      setParticle("");
    }
  }, [context.sameHousehold, context.lastName, context.nameParticle, lastName, onContextChange]);

  /** Le dernier ajout cesse d'exister, et la chaîne recule d'un cran. */
  const undoLast = useCallback(() => {
    const last = batch[batch.length - 1];
    if (!last) return;
    removeGuests([last]);
    const rest = batch.slice(0, -1);
    setBatch(rest);
    onContextChange({ lastCreatedId: rest[rest.length - 1] ?? null });
  }, [batch, removeGuests, onContextChange]);

  const menuOptions: InlineSelectOption[] = !menu
    ? []
    : menu.kind === "group"
      ? [
          { id: "", label: t("none") },
          ...groups.map((g) => ({
            id: g.id,
            label: `${formatGuestGroupName(g.name)} · ${sideLabel(g.side)}`,
          })),
        ]
      : menu.kind === "invitationType"
        ? invitationTypes.map((it) => ({ id: it.id, label: it.label }))
        : RSVP_STATUSES.map((s) => ({
            id: s,
            label: t(RSVP_STATUS_LABELS[s]),
            color: RSVP_STATUS_COLORS[s],
          }));

  const menuValue = !menu
    ? null
    : menu.kind === "group"
      ? context.groupId ?? ""
      : menu.kind === "invitationType"
        ? context.invitationType
        : context.rsvpStatus;

  const pickMenuValue = (id: string) => {
    if (!menu) return;
    if (menu.kind === "group") onContextChange({ groupId: id || null });
    else if (menu.kind === "invitationType") onContextChange({ invitationType: id });
    else onContextChange({ rsvpStatus: id });
    setMenu(null);
  };

  const openMenu = (kind: MenuKind) => (anchor: InlineSelectAnchor) => setMenu({ kind, anchor });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={requestClose}>
      <Pressable
        onPress={onClose}
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
        style={{ paddingTop: 84, paddingBottom: 32 }}
      >
        <View
          className="overflow-hidden rounded-3xl"
          style={{
            width: 560,
            maxWidth: "94%",
            maxHeight: "100%",
            backgroundColor: GP.card,
            shadowColor: GP.ink,
            shadowOffset: { width: 0, height: 30 },
            shadowOpacity: 0.35,
            shadowRadius: 70,
            elevation: 20,
          }}
        >
          <View
            className="flex-row items-center gap-3"
            style={{
              paddingTop: 18,
              paddingHorizontal: 22,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: GP.hair,
            }}
          >
            <View className="flex-1" style={{ minWidth: 0 }}>
              <Display size={20} weight="600" style={{ lineHeight: 24 }} numberOfLines={1}>
                {t("quickAdd.title")}
              </Display>
            </View>
            {added.length > 0 ? (
              <Text style={{ fontSize: 12.5, color: GP.mute }} numberOfLines={1}>
                {t("quickAdd.added", { count: added.length })}
              </Text>
            ) : null}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("quickAdd.close")}
              className="rounded-full items-center justify-center active:opacity-60"
              style={{ width: 38, height: 38 }}
            >
              <X size={17} color={GP.ink} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
            <View style={{ paddingHorizontal: 22, paddingTop: 16, gap: 14 }}>
              {/* Le bandeau : ce qui ne se redemande pas d'une création à l'autre. */}
              <View style={{ gap: 7 }}>
                <Text style={LABEL_STYLE}>{t("quickAdd.context")}</Text>
                <View className="flex-row flex-wrap items-center gap-2">
                  <Pill
                    label={t("groupLabel")}
                    value={groupLabel(context.groupId)}
                    editable={canEdit}
                    onOpen={openMenu("group")}
                  />
                  <Pill
                    label={t("columnInvitationType")}
                    value={typeLabel}
                    editable={canEdit}
                    onOpen={openMenu("invitationType")}
                  />
                  <Pill
                    label={t("columnRsvp")}
                    value={t(RSVP_STATUS_LABELS[rsvpStatus] ?? "")}
                    dot={RSVP_STATUS_COLORS[rsvpStatus] ?? GP.mute}
                    editable={canEdit}
                    onOpen={openMenu("rsvp")}
                  />
                </View>
              </View>

              <View className="flex-row items-end gap-2.5">
                <NameInput
                  inputRef={firstNameRef}
                  label={t("quickAdd.firstName")}
                  value={firstName}
                  onChange={setFirstName}
                  onSubmit={() => create(false)}
                  flex={1}
                  borderColor={GP.hair}
                  autoFocus
                  editable={canEdit}
                />
                <NameInput
                  label={t("nameParticle")}
                  value={particle}
                  onChange={setParticle}
                  onSubmit={() => create(false)}
                  width={92}
                  borderColor={GP.hair}
                  italic
                  editable={canEdit}
                />
                <NameInput
                  label={t("lastName")}
                  value={lastName}
                  onChange={setLastName}
                  onSubmit={() => create(false)}
                  flex={1.2}
                  // Le signal « nom attendu » est passif : la rafale ne se
                  // laisse pas interrompre par un message.
                  borderColor={lastName.trim() ? GP.hair : GP.mustard}
                  editable={canEdit}
                />
              </View>

              <View className="flex-row items-center gap-5">
                <Toggle
                  label={t("quickAdd.sameHousehold")}
                  value={context.sameHousehold}
                  onToggle={toggleSameHousehold}
                  disabled={!canEdit}
                />
                <Toggle
                  label={t("quickAdd.child")}
                  value={isChild}
                  onToggle={() => setIsChild((v) => !v)}
                  disabled={!canEdit}
                />
              </View>

              <Text style={{ fontSize: 11.5, color: GP.mute }}>{t("quickAdd.nameIsEnough")}</Text>
            </View>

            {/* La fournée sous les yeux : le journal de la séance de saisie. */}
            {added.length > 0 ? (
              <View
                className="flex-row flex-wrap items-center gap-2"
                style={{ paddingHorizontal: 22, paddingTop: 14 }}
              >
                {added.map((guest) => (
                  <Pressable
                    key={guest.id}
                    onPress={() => onOpenRecord(guest.id)}
                    accessibilityRole="button"
                    className="rounded-full active:opacity-70"
                    style={{
                      height: 28,
                      paddingHorizontal: 11,
                      justifyContent: "center",
                      backgroundColor: GP.claySoft,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: GP.olive }} numberOfLines={1}>
                      {formatGuestName(guest)}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={undoLast}
                  accessibilityRole="button"
                  className="flex-row items-center gap-1.5 active:opacity-60"
                  style={{ height: 28, paddingHorizontal: 4 }}
                >
                  <Undo2 size={12} color={GP.mute} />
                  <Text style={{ fontSize: 12, color: GP.mute }}>{t("quickAdd.undoLast")}</Text>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>

          <View
            className="flex-row items-center gap-3"
            style={{
              paddingHorizontal: 22,
              paddingVertical: 14,
              marginTop: 14,
              borderTopWidth: 1,
              borderTopColor: GP.hair,
            }}
          >
            <Pressable
              onPress={() => create(false)}
              disabled={!canCreate}
              accessibilityRole="button"
              className="flex-row items-center gap-2 rounded-full active:opacity-80"
              style={{
                height: 38,
                paddingHorizontal: 16,
                backgroundColor: GP.clay,
                opacity: canCreate ? 1 : 0.45,
              }}
            >
              <Plus size={14} color={GP.card} />
              <Text className="font-semibold" style={{ fontSize: 13, color: GP.card }}>
                {t("quickAdd.addAndChain")}
              </Text>
              <Text style={{ fontSize: 11, color: GP.card, opacity: 0.75 }}>
                {t("quickAdd.enterHint")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => create(true)}
              disabled={!canCreate}
              accessibilityRole="button"
              className="justify-center active:opacity-60"
              style={{ height: 38, opacity: canCreate ? 1 : 0.45 }}
            >
              <Text className="font-medium" style={{ fontSize: 12.5, color: GP.clay }}>
                {t("quickAdd.addAndClose")}
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
