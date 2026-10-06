import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, useColorScheme, type View } from "react-native";
// @ts-ignore — react-dom n'a pas de types ici
import { createPortal } from "react-dom";
import { EllipsisVertical } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { indexApresTouche, placerLeMenu, type PlacementDuMenu } from "@/lib/menu-deroulant";
import { theme as GP } from "@/lib/theme";
import type { StackMenuItem, StackMenuProps } from "./StackMenu";

export type { StackMenuItem, StackMenuProps };

const HAUTEUR_ITEM = 48;
const Z_FOND = 2147483001;

function focusVisible(el: HTMLElement | null): boolean {
  try {
    return !!el?.matches(":focus-visible");
  } catch {
    return false;
  }
}

// Le keyup d'Échap qui suit ne doit pas fermer une Modal parente.
function avalerLeKeyupDEchap() {
  const avaler = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.stopImmediatePropagation();
    document.removeEventListener("keyup", avaler, true);
  };
  document.addEventListener("keyup", avaler, true);
  setTimeout(() => document.removeEventListener("keyup", avaler, true), 1000);
}

// MenuView d'@expo/ui n'ouvre rien sur le web. Couche portée par `document.body` : pas
// de `Modal` RN, dont le keyup d'Échap fermerait aussi une Modal parente.
export function StackMenu({ items }: StackMenuProps) {
  const { t } = useTranslation("settings");
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const [placement, setPlacement] = useState<PlacementDuMenu | null>(null);
  const [actif, setActif] = useState<number | null>(null);
  const declencheur = useRef<View>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const ouvert = placement !== null;

  const fermer = useCallback((rendreLeFocus = true) => {
    setPlacement(null);
    setActif(null);
    if (rendreLeFocus) (declencheur.current as unknown as HTMLElement | null)?.focus();
  }, []);

  const basculer = () => {
    if (ouvert) return fermer();
    const el = declencheur.current as unknown as HTMLElement | null;
    if (!el || items.length === 0) return;
    setPlacement(
      placerLeMenu(el.getBoundingClientRect(), { largeur: window.innerWidth, hauteur: window.innerHeight }),
    );
  };

  const choisir = (item: StackMenuItem) => {
    fermer(false);
    item.onPress();
  };

  useEffect(() => {
    if (!ouvert) return;
    const entrees = () => Array.from(panneau.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (focusVisible(declencheur.current as unknown as HTMLElement | null)) entrees()[0]?.focus();

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        avalerLeKeyupDEchap();
        fermer();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        fermer();
        return;
      }
      const liste = entrees();
      const suivant = indexApresTouche(e.key, liste.indexOf(document.activeElement as HTMLElement), liste.length);
      if (suivant === null) return;
      e.preventDefault();
      liste[suivant].focus();
    };
    const sansFocus = () => fermer(false);
    document.addEventListener("keydown", surTouche, true);
    window.addEventListener("resize", sansFocus);
    window.addEventListener("popstate", sansFocus);
    return () => {
      document.removeEventListener("keydown", surTouche, true);
      window.removeEventListener("resize", sansFocus);
      window.removeEventListener("popstate", sansFocus);
    };
  }, [ouvert, fermer]);

  const libelle = t("plusDOptions");
  const surbrillance = isDark ? "rgba(0,145,110,0.22)" : GP.claySoft;

  return (
    <>
      <Pressable
        ref={declencheur}
        onPress={basculer}
        testID="stack-menu-bouton"
        accessibilityRole="button"
        accessibilityLabel={libelle}
        aria-expanded={ouvert}
        {...{ "aria-haspopup": "menu" }}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          marginRight: 4,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          opacity: pressed ? 0.6 : 1,
          backgroundColor: ouvert ? surbrillance : "transparent",
        })}
      >
        <EllipsisVertical size={20} color={isDark ? GP.muteDark : GP.mute} />
      </Pressable>
      {placement &&
        createPortal(
          <>
            <div
              data-testid="stack-menu-fond"
              aria-hidden="true"
              onClick={() => fermer()}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: Z_FOND, cursor: "pointer", touchAction: "none" }}
            />
            <div
              ref={panneau}
              role="menu"
              aria-label={libelle}
              data-testid="stack-menu"
              style={{
                position: "fixed",
                top: placement.top,
                right: placement.right,
                zIndex: Z_FOND + 1,
                boxSizing: "border-box",
                minWidth: Math.min(220, placement.maxWidth),
                maxWidth: placement.maxWidth,
                maxHeight: placement.maxHeight,
                overflowY: "auto",
                overscrollBehavior: "contain",
                padding: 6,
                background: isDark ? GP.cardDark : GP.card,
                border: `1px solid ${isDark ? GP.hairStrong : GP.hair}`,
                borderRadius: 14,
                boxShadow: "0 12px 32px rgba(17,36,31,0.22)",
              }}
            >
              {items.map((item, index) => {
                const Icone = item.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    role="menuitem"
                    data-testid={`stack-menu-item-${index}`}
                    onClick={() => choisir(item)}
                    onPointerEnter={() => setActif(index)}
                    onPointerLeave={() => setActif(null)}
                    onFocus={(e) => setActif(focusVisible(e.currentTarget) ? index : null)}
                    onBlur={() => setActif(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      minHeight: HAUTEUR_ITEM,
                      margin: 0,
                      padding: "0 14px",
                      border: 0,
                      appearance: "none",
                      borderRadius: 10,
                      background: actif === index ? surbrillance : "transparent",
                      color: isDark ? GP.inkDark : GP.ink,
                      fontFamily: "Inter_500Medium, Inter, -apple-system, system-ui, sans-serif",
                      fontSize: 16,
                      textAlign: "left",
                      cursor: "pointer",
                      outline: "none",
                      touchAction: "manipulation",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {Icone ? (
                      <span style={{ display: "flex", flex: "none", width: 20, height: 20 }}>
                        <Icone size={20} color={GP.clay} />
                      </span>
                    ) : null}
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
