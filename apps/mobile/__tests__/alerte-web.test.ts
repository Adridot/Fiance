import { describe, it, expect, vi } from "vitest";

vi.mock("react-native", () => ({ Platform: { OS: "ios" }, Alert: { alert: vi.fn() } }));
vi.mock("@/lib/toast/sonner", () => ({ toast: vi.fn() }));

import { Alert } from "react-native";
import { deciderLAlerte, installerLesAlertesWeb } from "@/lib/alerte-web";

describe("deciderLAlerte", () => {
  it("sans bouton : un simple message", () => {
    expect(deciderLAlerte()).toEqual({ mode: "toast", accepter: undefined });
  });

  it("un bouton : un message, puis son action", () => {
    const ok = vi.fn();
    const d = deciderLAlerte([{ text: "OK", onPress: ok }]);
    expect(d.mode).toBe("toast");
    expect(d.accepter).toBe(ok);
  });

  it("annuler + confirmer : une confirmation", () => {
    const annuler = vi.fn();
    const supprimer = vi.fn();
    const d = deciderLAlerte([
      { text: "Annuler", style: "cancel", onPress: annuler },
      { text: "Supprimer", style: "destructive", onPress: supprimer },
    ]);
    expect(d).toEqual({ mode: "confirmation", accepter: supprimer, refuser: annuler });
  });

  it("l'ordre des boutons n'importe pas pour trouver l'annulation", () => {
    const annuler = vi.fn();
    const ok = vi.fn();
    const d = deciderLAlerte([{ text: "OK", onPress: ok }, { text: "Annuler", style: "cancel", onPress: annuler }]);
    expect(d.accepter).toBe(ok);
    expect(d.refuser).toBe(annuler);
  });

  it("trois boutons : l'action principale est le dernier bouton non annulant", () => {
    const a = vi.fn();
    const b = vi.fn();
    const d = deciderLAlerte([{ text: "Annuler", style: "cancel" }, { text: "A", onPress: a }, { text: "B", onPress: b }]);
    expect(d.accepter).toBe(b);
    expect(d.refuser).toBeUndefined();
  });

  it("deux boutons sans annulation : refuser ne fait rien", () => {
    const b = vi.fn();
    const d = deciderLAlerte([{ text: "A" }, { text: "B", onPress: b }]);
    expect(d.accepter).toBe(b);
    expect(d.refuser).toBeUndefined();
  });
});

describe("installerLesAlertesWeb", () => {
  it("ne touche à rien hors du web", () => {
    const origine = Alert.alert;
    installerLesAlertesWeb();
    expect(Alert.alert).toBe(origine);
  });
});
