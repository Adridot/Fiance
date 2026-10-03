import React from "react";
import { StyleSheet, View } from "react-native";
import type { PressableProps, ViewStyle } from "react-native";
import { Check } from "lucide-react-native";
import { useHostWrap } from "../../primitives/_host/ForgeHost";
import { basculeAEspace } from "../../utils/bascule-clavier";

// Web uniquement. Le dessin de la case et de l'interrupteur d'@expo/ui, sans <label> ni
// <input> : posés dans une cible touchable, ceux-ci rappelaient onToggle une 2e (et 3e) fois.

/** Props web de la cible qui se bascule : rôle, état, Espace au clavier (Entrée passe par onPress). */
export function basculeWeb(
  role: "checkbox" | "switch" | "radio",
  coche: boolean,
  basculer?: () => void,
): Pick<PressableProps, "role" | "aria-checked"> {
  return {
    role,
    "aria-checked": coche,
    ...(basculer ? { onKeyDown: basculeAEspace(basculer) } : null),
  } as Pick<PressableProps, "role" | "aria-checked">;
}

const transition = {
  transitionDuration: "120ms",
  transitionProperty: "background-color, border-color, transform",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
} as unknown as ViewStyle;

const styles = StyleSheet.create({
  case: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: "var(--expo-ui-gray-300)",
    backgroundColor: "var(--expo-ui-background)",
    alignItems: "center",
    justifyContent: "center",
  },
  caseCochee: {
    backgroundColor: "var(--expo-ui-primary-500)",
    borderColor: "var(--expo-ui-primary-500)",
  },
  piste: {
    width: 36,
    height: 22,
    borderRadius: 11,
    backgroundColor: "var(--expo-ui-gray-300)",
  },
  pisteActive: {
    backgroundColor: "var(--expo-ui-primary-500)",
  },
  pouce: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  pouceActif: {
    transform: [{ translateX: 14 }],
  },
  inactif: {
    opacity: 0.5,
  },
});

// Même hôte que les primitives Checkbox/Switch : il fournit les variables --expo-ui-*.
const hote = { matchContents: true, style: { alignSelf: "center" } } as const;

export function CaseVisuelle({ coche, inactif = false }: { coche: boolean; inactif?: boolean }) {
  return useHostWrap(
    <View style={[styles.case, transition, coche && styles.caseCochee, inactif && styles.inactif]}>
      {coche && <Check size={13} color="#fff" strokeWidth={3} />}
    </View>,
    hote,
  );
}

export function InterrupteurVisuel({ actif, inactif = false }: { actif: boolean; inactif?: boolean }) {
  return useHostWrap(
    <View style={[styles.piste, transition, actif && styles.pisteActive, inactif && styles.inactif]}>
      <View style={[styles.pouce, transition, actif && styles.pouceActif]} />
    </View>,
    hote,
  );
}
