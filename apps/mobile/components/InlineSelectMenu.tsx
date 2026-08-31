import React, { useEffect, useState } from "react";
import { Modal, Platform, useWindowDimensions } from "react-native";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import { Check, Home } from "lucide-react-native";
import { theme as GP } from "@/lib/theme";
import { inlineMenuHintHeight, INLINE_MENU_HINT_LINE_H } from "@fiance/sdk";

export interface InlineSelectOption {
  id: string;
  label: string;
  /** Pastille de couleur à gauche — les états de réponse en portent une. */
  color?: string | null;
  count?: number | null;
}

/** Cadre du déclencheur, en coordonnées FENÊTRE (`measureInWindow`). */
export interface InlineSelectAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InlineSelectMenuProps {
  visible: boolean;
  anchor: InlineSelectAnchor | null;
  options: InlineSelectOption[];
  valueId: string | null;
  /** `"over"` recouvre la cellule, `"up"` se déploie au-dessus du déclencheur. */
  direction?: "over" | "up";
  width?: number;
  footer?: { label: string; onPress: () => void } | null;
  hint?: string | null;
  onPick: (id: string) => void;
  onDismiss: () => void;
}

const OPTION_H = 40;
const PAD = 6;
const FOOTER_H = 38;
const SEPARATOR_H = 13;
const HINT_FONT = 11;
// Ce que le cadre prend sur la largeur avant d'en arriver au texte de l'aide :
// les deux bordures, le `padding` de la carte, puis le `px-3` de la ligne.
const HINT_INSET = 2 + PAD * 2 + 12 * 2;
const EDGE = 8;
const MIN_WIDTH = 200;

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), Math.max(low, high));
}

export function InlineSelectMenu({
  visible,
  anchor,
  options,
  valueId,
  direction = "over",
  width,
  footer = null,
  hint = null,
  onPick,
  onDismiss,
}: InlineSelectMenuProps) {
  const { width: winW, height: winH } = useWindowDimensions();
  const currentIndex = Math.max(
    0,
    options.findIndex((o) => o.id === valueId),
  );
  // Réglage d'état pendant le rendu : une nouvelle ancre est un nouveau menu,
  // et sa surbrillance repart de la valeur courante.
  const [highlight, setHighlight] = useState<number | null>(null);
  const [seenAnchor, setSeenAnchor] = useState(anchor);
  if (anchor !== seenAnchor) {
    setSeenAnchor(anchor);
    setHighlight(null);
  }
  const active = highlight ?? currentIndex;

  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i) => Math.min(options.length - 1, (i ?? currentIndex) + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i) => Math.max(0, (i ?? currentIndex) - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const picked = options[active];
        if (picked) onPick(picked.id);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [visible, options, active, currentIndex, onPick, onDismiss]);

  if (!visible || !anchor || options.length === 0) return null;

  const menuW = Math.max(width ?? anchor.width + PAD * 2, MIN_WIDTH);
  const bodyH = options.length * OPTION_H;
  const hintH = inlineMenuHintHeight(hint, menuW - HINT_INSET, HINT_FONT);
  const chromeH = PAD * 2 + (footer ? SEPARATOR_H + FOOTER_H : 0) + hintH;
  const menuH = Math.min(bodyH + chromeH, winH - EDGE * 2);
  // L'option de la valeur courante tombe sur la cellule : un `select` natif ne
  // demande aucun déplacement de souris pour retrouver ce qui est déjà en place.
  const rawTop =
    direction === "up"
      ? anchor.y - menuH - EDGE
      : anchor.y + anchor.height / 2 - (PAD + currentIndex * OPTION_H + OPTION_H / 2);

  const top = clamp(rawTop, EDGE, winH - menuH - EDGE);
  const left = clamp(anchor.x - PAD, EDGE, winW - menuW - EDGE);
  const scrolls = bodyH + chromeH > menuH;
  const frame = { top, left, right: left + menuW, bottom: top + menuH };

  const rows = options.map((option, index) => {
    const selected = option.id === valueId;
    return (
      <Pressable
        key={option.id}
        onPress={() => onPick(option.id)}
        onHoverIn={() => setHighlight(index)}
        className="flex-row items-center gap-2.5 px-3 rounded-lg"
        style={{
          height: OPTION_H,
          backgroundColor: selected
            ? GP.claySoft
            : active === index
              ? GP.paper
              : "transparent",
        }}
      >
        {option.color ? (
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: option.color }}
          />
        ) : null}
        <Text
          className="flex-1"
          style={{ fontSize: 13.5, color: GP.ink, fontWeight: selected ? "600" : "400" }}
          numberOfLines={1}
        >
          {option.label}
        </Text>
        {option.count != null ? (
          <Text style={{ fontSize: 11.5, color: GP.mute }}>
            {option.count}
          </Text>
        ) : null}
        {selected ? <Check size={14} color={GP.clay} strokeWidth={3} /> : null}
      </Pressable>
    );
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss}>
      <WheelDismiss frame={frame} enabled={!scrolls} onDismiss={onDismiss} />
      <Pressable
        onPress={onDismiss}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        style={{
          position: "absolute",
          top,
          left,
          width: menuW,
          maxHeight: menuH,
          backgroundColor: GP.card,
          borderWidth: 1,
          borderColor: GP.hair,
          borderRadius: 12,
          padding: PAD,
          shadowColor: GP.ink,
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.22,
          shadowRadius: 44,
          elevation: 12,
        }}
      >
        {scrolls ? (
          <ScrollView showsVerticalScrollIndicator={false}>{rows}</ScrollView>
        ) : (
          rows
        )}

        {footer ? (
          <>
            <View
              className="mx-1 my-1.5"
              style={{ height: 1, backgroundColor: GP.hair }}
            />
            <Pressable
              onPress={footer.onPress}
              className="flex-row items-center gap-2 px-3 rounded-lg active:opacity-60"
              style={{ height: FOOTER_H }}
            >
              <Home size={14} color={GP.clay} />
              <Text
                className="font-medium"
                style={{ fontSize: 13, color: GP.clay }}
                numberOfLines={1}
              >
                {footer.label}
              </Text>
            </Pressable>
          </>
        ) : null}

        {hint ? (
          <Text
            className="px-3 pt-0.5"
            style={{ fontSize: HINT_FONT, lineHeight: INLINE_MENU_HINT_LINE_H, color: GP.mute }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

/** Le calque est ancré sur une mesure : au premier défilement elle serait fausse. */
function WheelDismiss({
  frame,
  enabled,
  onDismiss,
}: {
  frame: { top: number; left: number; right: number; bottom: number };
  enabled: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onWheel = (e: WheelEvent) => {
      // Un menu qui défile lui-même garde la molette pour lui.
      if (
        !enabled &&
        e.clientX >= frame.left && e.clientX <= frame.right &&
        e.clientY >= frame.top && e.clientY <= frame.bottom
      ) return;
      onDismiss();
    };
    document.addEventListener("wheel", onWheel, true);
    return () => document.removeEventListener("wheel", onWheel, true);
  }, [frame.top, frame.left, frame.right, frame.bottom, enabled, onDismiss]);
  return null;
}
