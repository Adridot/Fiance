import React, { useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Trash2, Mail, CalendarCheck, X } from "lucide-react-native";
import { SheetScaffold } from "@fiance/ui/components";
import { InlineSelectMenu, type InlineSelectAnchor } from "@/components/InlineSelectMenu";
import { theme as GP } from "@/lib/theme";
import { RSVP_STATUS_LABELS, RSVP_STATUS_COLORS } from "@/db/types";
import type { RsvpStatus } from "@/db/types";

export interface BulkChoice {
  id: string;
  label: string;
  color?: string;
}

interface GuestBulkBarProps {
  /** Total selected, including the part the current filter hides. */
  count: number;
  hiddenCount: number;
  invitationTypes: BulkChoice[];
  /** Régime pointeur : les choix se déploient en calque au-dessus de la barre. */
  pointer: boolean;
  onClear: () => void;
  onAssignInvitationType: (typeId: string) => void;
  onAssignRsvp: (status: string) => void;
  onDelete: () => void;
}

const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "ACCEPTED", "DECLINED", "MAYBE"];

// No red token in the palette: the app's red is the DECLINED state, already what
// ConfirmSheet uses.
const DESTRUCTIVE = RSVP_STATUS_COLORS.DECLINED;

function BulkAction({
  icon,
  label,
  onPress,
  innerRef,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  innerRef?: React.MutableRefObject<any>;
  destructive?: boolean;
}) {
  return (
    <Pressable
      ref={innerRef}
      onPress={onPress}
      className="items-center justify-center px-3 py-1.5 rounded-xl active:opacity-60"
      style={{ minWidth: 64, minHeight: 44 }}
    >
      {icon}
      <Text
        className="text-[11px] font-medium mt-0.5"
        style={{ color: destructive ? DESTRUCTIVE : GP.ink }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ChoiceSheet({
  visible,
  title,
  choices,
  onPick,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  choices: BulkChoice[];
  onPick: (id: string) => void;
  onDismiss: () => void;
}) {
  return (
    <SheetScaffold visible={visible} onDismiss={onDismiss} title={title} scrollable>
      <View className="gap-1">
        {choices.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onPick(c.id)}
            className="flex-row items-center gap-3 px-3 rounded-2xl active:opacity-60"
            style={{ minHeight: 48 }}
          >
            {c.color ? (
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
            ) : null}
            <Text className="text-base text-ink flex-1" numberOfLines={1}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SheetScaffold>
  );
}

export function GuestBulkBar({
  count,
  hiddenCount,
  invitationTypes,
  pointer,
  onClear,
  onAssignInvitationType,
  onAssignRsvp,
  onDelete,
}: GuestBulkBarProps) {
  const { t } = useTranslation("guests");
  const [sheet, setSheet] = useState<"invitationType" | "rsvp" | null>(null);
  const [menu, setMenu] = useState<
    { kind: "invitationType" | "rsvp"; anchor: InlineSelectAnchor } | null
  >(null);
  // La suppression ne s'empile pas : c'est la barre elle-même qui devient la
  // confirmation, un état du composant et non une affaire de régime.
  const [confirming, setConfirming] = useState(false);
  const barRef = useRef<any>(null);
  const typeRef = useRef<any>(null);
  const rsvpRef = useRef<any>(null);

  if (count === 0) return null;

  const close = () => setSheet(null);

  const rsvpChoices = RSVP_STATUSES.map((s) => ({
    id: s,
    label: t(RSVP_STATUS_LABELS[s]),
    color: RSVP_STATUS_COLORS[s],
  }));

  // L'ancre est le HAUT DE LA BARRE, pas le bouton : le menu se déploie
  // au-dessus d'elle sans recouvrir le compte de sélection.
  const openChoice = (
    kind: "invitationType" | "rsvp",
    ref: React.MutableRefObject<any>,
  ) => {
    if (!pointer) {
      setSheet(kind);
      return;
    }
    ref.current?.measureInWindow?.((x: number, _y: number, width: number) => {
      barRef.current?.measureInWindow?.((_bx: number, by: number) => {
        setMenu({ kind, anchor: { x, y: by, width, height: 0 } });
      });
    });
  };

  return (
    <>
      <View
        ref={barRef}
        className="absolute left-0 right-0 bottom-0 border-t border-hair px-4 pt-2 pb-4"
        style={{ backgroundColor: GP.card }}
      >
        {confirming ? (
          <>
            <Text className="text-sm font-semibold text-ink" numberOfLines={2}>
              {t("bulkDeleteTitle", { count })}
            </Text>
            <Text className="text-xs text-mute mt-0.5 mb-2" numberOfLines={3}>
              {t("bulkDeleteMessage", { count })}
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setConfirming(false)}
                className="flex-1 items-center justify-center rounded-2xl border border-hair active:opacity-60"
                style={{ minHeight: 44 }}
              >
                <Text className="text-sm font-medium text-ink">{t("common:cancel")}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirming(false);
                  onDelete();
                }}
                className="flex-1 items-center justify-center rounded-2xl active:opacity-60"
                style={{ minHeight: 44, backgroundColor: DESTRUCTIVE }}
              >
                <Text className="text-sm font-semibold" style={{ color: GP.card }}>
                  {t("bulkDelete")}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-2 mb-1.5">
              <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                {t("bulkSelected", { count })}
              </Text>
              {hiddenCount > 0 ? (
                <Text className="text-xs text-mute flex-1" numberOfLines={1}>
                  {t("bulkHiddenByFilter", { count: hiddenCount })}
                </Text>
              ) : (
                <View className="flex-1" />
              )}
              <Pressable
                onPress={onClear}
                className="flex-row items-center gap-1 px-2 py-1 rounded-full active:opacity-60"
                hitSlop={12}
              >
                <X size={14} color={GP.mute} />
                <Text className="text-xs font-medium text-mute">{t("bulkClearSelection")}</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 4, alignItems: "center" }}
            >
              {/* A bulk action assigns an invitation type, it never creates one. */}
              {invitationTypes.length > 0 && (
                <BulkAction
                  innerRef={typeRef}
                  icon={<Mail size={18} color={GP.ink} />}
                  label={t("bulkAssignInvitationType")}
                  onPress={() => openChoice("invitationType", typeRef)}
                />
              )}
              <BulkAction
                innerRef={rsvpRef}
                icon={<CalendarCheck size={18} color={GP.ink} />}
                label={t("bulkAssignRsvp")}
                onPress={() => openChoice("rsvp", rsvpRef)}
              />
              <BulkAction
                icon={<Trash2 size={18} color={DESTRUCTIVE} />}
                label={t("bulkDelete")}
                onPress={() => setConfirming(true)}
                destructive
              />
            </ScrollView>
          </>
        )}
      </View>

      <InlineSelectMenu
        visible={menu !== null}
        anchor={menu?.anchor ?? null}
        direction="up"
        width={menu?.kind === "invitationType" ? 280 : 232}
        options={menu?.kind === "invitationType" ? invitationTypes : rsvpChoices}
        valueId={null}
        onPick={(id) => {
          const kind = menu?.kind;
          setMenu(null);
          if (kind === "invitationType") onAssignInvitationType(id);
          else if (kind === "rsvp") onAssignRsvp(id);
        }}
        onDismiss={() => setMenu(null)}
      />

      <ChoiceSheet
        visible={sheet === "invitationType"}
        title={t("bulkAssignInvitationTypeTitle")}
        choices={invitationTypes}
        onPick={(id) => {
          close();
          onAssignInvitationType(id);
        }}
        onDismiss={close}
      />

      <ChoiceSheet
        visible={sheet === "rsvp"}
        title={t("bulkAssignRsvpTitle")}
        choices={rsvpChoices}
        onPick={(id) => {
          close();
          onAssignRsvp(id);
        }}
        onDismiss={close}
      />
    </>
  );
}
