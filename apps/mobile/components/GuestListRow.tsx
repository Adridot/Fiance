import React, { useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, ChevronRight, Pencil } from "lucide-react-native";
import { formatGuestLastName, formatGuestName, isFirstNameToComplete } from "@fiance/sdk";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { DIET_LABELS, RSVP_STATUS_COLORS, RSVP_STATUS_LABELS } from "@/db/types";
import type { RsvpStatus } from "@/db/types";
import { theme as GP } from "@/lib/theme";
import type { InlineSelectAnchor } from "@/components/InlineSelectMenu";
import type { Guest } from "@/db/schema";

/** Hauteur de ligne CONSTANTE : c'est elle qui fait tenir 352 lignes en registre. */
export const GUEST_ROW_HEIGHT = 40;
/** Décrochement des invités sous leur groupe, filet vertical compris. */
export const GUEST_ROW_INDENT = 21;
const BOX_COLUMN = 34;
const CHEVRON_COLUMN = 22;

export interface GuestRowColumns {
  invitationType: number;
  rsvp: number;
}

export const GUEST_ROW_NARROW = 700;

export function guestRowColumns(windowWidth: number): GuestRowColumns {
  return windowWidth >= GUEST_ROW_NARROW
    ? { invitationType: 200, rsvp: 124 }
    : { invitationType: 92, rsvp: 90 };
}

interface GuestListRowProps {
  guest: Guest;
  invitationTypeLabel: string;
  columns: GuestRowColumns;
  /** Régime pointeur : survol, crayon, chevron, menus ancrés. */
  pointer: boolean;
  canEdit: boolean;
  selected: boolean;
  /** Cases rendues persistantes dès qu'un invité est coché. */
  boxPinned: boolean;
  renaming: boolean;
  /** Mode saisie des prénoms : la cellule Invité devient un champ de prénom. */
  capturing: boolean;
  onOpen: () => void;
  onToggleSelected: () => void;
  onOpenInvitationType: (anchor: InlineSelectAnchor) => void;
  onOpenRsvp: (anchor: InlineSelectAnchor) => void;
  onStartRename: () => void;
  onCommitRename: (firstName: string, particle: string, lastName: string) => void;
  onCancelRename: () => void;
  onCommitFirstName: (firstName: string) => void;
  onCancelCapture: () => void;
}

export function GuestListRow({
  guest,
  invitationTypeLabel,
  columns,
  pointer,
  canEdit,
  selected,
  boxPinned,
  renaming,
  capturing,
  onOpen,
  onToggleSelected,
  onOpenInvitationType,
  onOpenRsvp,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onCommitFirstName,
  onCancelCapture,
}: GuestListRowProps) {
  const { t } = useTranslation("guests");
  const [hovered, setHovered] = useState(false);
  const typeRef = useRef<any>(null);
  const rsvpRef = useRef<any>(null);

  const companionName = useGuestsStore((s) => {
    if (!guest.companionId) return null;
    const c = s.guests.find((g) => g.id === guest.companionId);
    return c ? formatGuestName(c) : null;
  });
  const roleLabel = useWeddingPartyStore((s) => {
    const names = s.weddingRoleAssignments
      .filter((a) => a.guestId === guest.id)
      .map((a) => s.weddingRoles.find((r) => r.id === a.roleId)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  });

  const complements = [
    roleLabel,
    guest.isChild === true ? t("child") : null,
    guest.diet && guest.diet !== "STANDARD"
      ? t(DIET_LABELS[guest.diet as keyof typeof DIET_LABELS])
      : null,
    companionName ? t("withCompanion", { name: companionName }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const incomplete = isFirstNameToComplete(guest);
  const rsvpColor = RSVP_STATUS_COLORS[guest.rsvpStatus as RsvpStatus] ?? GP.mute;
  const rsvpLabel = t(RSVP_STATUS_LABELS[guest.rsvpStatus as RsvpStatus] ?? "");
  const boxVisible = !pointer || boxPinned || hovered || selected;

  const measure = (
    ref: React.MutableRefObject<any>,
    then: (anchor: InlineSelectAnchor) => void,
  ) => {
    if (!ref.current?.measureInWindow) {
      then({ x: 0, y: 0, width: columns.invitationType, height: GUEST_ROW_HEIGHT });
      return;
    }
    ref.current.measureInWindow((x: number, y: number, width: number, height: number) =>
      then({ x, y, width, height }),
    );
  };

  // Entrer dans une commande de la ligne fait SORTIR du survol de la ligne :
  // chaque commande doit donc le retenir, faute de quoi elle s'efface sous le
  // curseur au moment même où on la vise.
  const survol = {
    onHoverIn: () => setHovered(true),
    onHoverOut: () => setHovered(false),
  };

  return (
    <Pressable
      onPress={onOpen}
      {...survol}
      className="flex-row items-center"
      style={{
        height: GUEST_ROW_HEIGHT,
        backgroundColor: pointer && hovered ? GP.card : "transparent",
      }}
    >
      <View style={{ width: BOX_COLUMN, alignItems: "center" }}>
        {canEdit && (
          <Pressable
            onPress={onToggleSelected}
            {...survol}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            className="w-5 h-5 rounded-full items-center justify-center"
            style={{
              opacity: boxVisible ? 1 : 0,
              backgroundColor: selected ? GP.clay : "transparent",
              borderWidth: selected ? 0 : 1.5,
              borderColor: GP.hairStrong,
            }}
          >
            {selected ? <Check size={11} color={GP.card} strokeWidth={3.4} /> : null}
          </Pressable>
        )}
      </View>

      <View className="flex-1 flex-row items-center gap-1" style={{ minWidth: 0 }}>
        {capturing ? (
          <CaptureField
            guest={guest}
            onCommit={onCommitFirstName}
            onCancel={onCancelCapture}
          />
        ) : renaming ? (
          <RenameFields guest={guest} onCommit={onCommitRename} onCancel={onCancelRename} />
        ) : (
          <>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14.5,
                fontWeight: incomplete ? "400" : "500",
                color: incomplete ? GP.mute : GP.ink,
              }}
            >
              {formatGuestName(guest)}
            </Text>
            {pointer && canEdit && (
              <Pressable
                onPress={onStartRename}
                {...survol}
                accessibilityRole="button"
                accessibilityLabel={t("inlineRename")}
                hitSlop={6}
                className="rounded-full items-center justify-center"
                style={{ width: 30, height: 30, opacity: hovered ? 1 : 0 }}
              >
                <Pencil size={13} color={GP.mute} />
              </Pressable>
            )}
            {complements !== "" && (
              <Text
                numberOfLines={1}
                className="flex-1"
                style={{ fontSize: 12.5, color: GP.mute }}
              >
                {complements}
              </Text>
            )}
          </>
        )}
      </View>

      <View style={{ width: columns.invitationType }}>
        <Pressable
          ref={typeRef}
          disabled={!canEdit}
          {...survol}
          onPress={() => measure(typeRef, onOpenInvitationType)}
          className="flex-row items-center gap-1.5 rounded-lg"
          style={{
            height: 30,
            paddingLeft: 10,
            paddingRight: 6,
            borderWidth: canEdit ? 1 : 0,
            borderColor: GP.hair,
            width: columns.invitationType - 12,
          }}
        >
          <Text numberOfLines={1} className="flex-1" style={{ fontSize: 13, color: GP.inkSoft }}>
            {invitationTypeLabel}
          </Text>
          {canEdit && <ChevronDown size={12} color={GP.mute} />}
        </Pressable>
      </View>

      <View style={{ width: columns.rsvp }}>
        <Pressable
          ref={rsvpRef}
          disabled={!canEdit}
          {...survol}
          onPress={() => measure(rsvpRef, onOpenRsvp)}
          className="flex-row items-center gap-1.5 rounded-full self-start"
          style={{
            height: 26,
            paddingLeft: 10,
            paddingRight: canEdit ? 6 : 10,
            backgroundColor: rsvpColor + "18",
            maxWidth: columns.rsvp - 8,
          }}
        >
          <Text
            numberOfLines={1}
            className="font-semibold"
            style={{ fontSize: 12.5, color: rsvpColor }}
          >
            {rsvpLabel}
          </Text>
          {canEdit && <ChevronDown size={11} color={rsvpColor} />}
        </Pressable>
      </View>

      {pointer && (
        <View style={{ width: CHEVRON_COLUMN, alignItems: "flex-end" }}>
          {hovered && <ChevronRight size={15} color={GP.mute} />}
        </View>
      )}
    </Pressable>
  );
}

/** Trois champs, jamais un nom recomposé. */
function RenameFields({
  guest,
  onCommit,
  onCancel,
}: {
  guest: Guest;
  onCommit: (firstName: string, particle: string, lastName: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("guests");
  const [firstName, setFirstName] = useState(guest.firstName ?? "");
  const [particle, setParticle] = useState(guest.nameParticle ?? "");
  const [lastName, setLastName] = useState(guest.lastName ?? "");

  const commit = () => onCommit(firstName.trim(), particle.trim(), lastName.trim());

  return (
    <FieldsBox>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        onSubmitEditing={commit}
        onKeyPress={(e: any) => {
          if (e?.nativeEvent?.key === "Escape") onCancel();
        }}
        placeholder={t("firstName")}
        placeholderTextColor={GP.mute}
        autoFocus
        autoCorrect={false}
        blurOnSubmit={false}
        style={{
          width: 130,
          height: 28,
          paddingHorizontal: 9,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: GP.clay,
          backgroundColor: GP.card,
          fontSize: 14,
          color: GP.ink,
        }}
      />
      <TextInput
        value={particle}
        onChangeText={setParticle}
        onSubmitEditing={commit}
        onKeyPress={(e: any) => {
          if (e?.nativeEvent?.key === "Escape") onCancel();
        }}
        placeholder={t("nameParticle")}
        placeholderTextColor={GP.mute}
        autoCorrect={false}
        blurOnSubmit={false}
        style={{
          width: 70,
          height: 28,
          paddingHorizontal: 9,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: GP.clay,
          backgroundColor: GP.card,
          fontSize: 13,
          fontStyle: "italic",
          color: GP.mute,
        }}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        onSubmitEditing={commit}
        onKeyPress={(e: any) => {
          if (e?.nativeEvent?.key === "Escape") onCancel();
        }}
        placeholder={t("lastName")}
        placeholderTextColor={GP.mute}
        autoCorrect={false}
        blurOnSubmit={false}
        style={{
          width: 150,
          height: 28,
          paddingHorizontal: 9,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: GP.clay,
          backgroundColor: GP.card,
          fontSize: 14,
          color: GP.ink,
        }}
      />
      <Text style={{ fontSize: 11, color: GP.mute }} numberOfLines={1}>
        {t("inlineEditHint")}
      </Text>
    </FieldsBox>
  );
}

/** Mode saisie : le prénom seul, pré-rempli de la valeur fabriquée le cas échéant. */
function CaptureField({
  guest,
  onCommit,
  onCancel,
}: {
  guest: Guest;
  onCommit: (firstName: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("guests");
  const [value, setValue] = useState(guest.firstName ?? "");

  return (
    <FieldsBox gap="gap-2">
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onCommit(value.trim())}
        onKeyPress={(e: any) => {
          if (e?.nativeEvent?.key === "Escape") onCancel();
        }}
        placeholder={t("nameQueueFirstName")}
        placeholderTextColor={GP.mute}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        blurOnSubmit={false}
        style={{
          width: 200,
          height: 28,
          paddingHorizontal: 9,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: GP.clay,
          backgroundColor: GP.card,
          fontSize: 14,
          fontWeight: "600",
          color: GP.ink,
        }}
      />
      <Text style={{ fontSize: 12.5, color: GP.mute }} numberOfLines={1}>
        {formatGuestLastName(guest)}
      </Text>
    </FieldsBox>
  );
}

/**
 * Un `TextInput` nu ne revendique pas l'appui : le clic remonterait à la ligne,
 * qui ouvre la fiche. Le conteneur le revendique, sans rien faire — l'idiome du
 * fichier, où l'arrêt de propagation EST la revendication.
 */
function FieldsBox({
  children,
  gap = "gap-1.5",
}: {
  children: React.ReactNode;
  gap?: string;
}) {
  return (
    <Pressable onPress={() => {}} className={`flex-row items-center ${gap}`}>
      {children}
    </Pressable>
  );
}
