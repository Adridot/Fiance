// `Alert.alert` de react-native-web est une fonction vide : sans ceci, toute
// confirmation et tout message d'erreur de l'app sont muets dans le navigateur.
import { Platform, Alert } from "react-native";
import { toast } from "@/lib/toast/sonner";

type Bouton = {
  text?: string;
  style?: "cancel" | "destructive" | "default";
  onPress?: () => void;
};

export type DecisionDAlerte = {
  mode: "toast" | "confirmation";
  accepter?: () => void;
  refuser?: () => void;
};

export function deciderLAlerte(boutons: Bouton[] = []): DecisionDAlerte {
  if (boutons.length <= 1) return { mode: "toast", accepter: boutons[0]?.onPress };
  // Convention React Native : l'action principale est le DERNIER bouton.
  const principal = [...boutons].reverse().find((b) => b.style !== "cancel");
  return {
    mode: "confirmation",
    accepter: principal?.onPress,
    refuser: boutons.find((b) => b.style === "cancel")?.onPress,
  };
}

let installee = false;

export function installerLesAlertesWeb(): void {
  if (installee || Platform.OS !== "web") return;
  installee = true;

  const notifier = toast as unknown as (titre: string, options?: { description?: string }) => void;

  (Alert as { alert: unknown }).alert = (titre: string, message?: string, boutons?: Bouton[]) => {
    const decision = deciderLAlerte(boutons);
    if (decision.mode === "toast") {
      notifier(titre, message ? { description: message } : undefined);
      decision.accepter?.();
      return;
    }
    const accepte = window.confirm(message ? `${titre}\n\n${message}` : titre);
    (accepte ? decision.accepter : decision.refuser)?.();
  };
}
