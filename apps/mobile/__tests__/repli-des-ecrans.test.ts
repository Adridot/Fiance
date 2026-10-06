import { describe, expect, it } from "vitest";
import { afficheUnRetour, repliDe } from "@/lib/repli-des-ecrans";

describe("repliDe", () => {
  it("renvoie à la liste de l'onglet par défaut", () => {
    expect(repliDe("guests", "[id]")).toBe("/(tabs)/guests");
    expect(repliDe("planning", "[id]")).toBe("/(tabs)/planning");
    expect(repliDe("vendors", "[type]/[id]")).toBe("/(tabs)/vendors");
    expect(repliDe("vendors", "new")).toBe("/(tabs)/vendors");
    expect(repliDe("vendors", "compare")).toBe("/(tabs)/vendors");
  });

  it("renvoie à l'écran parent quand il y en a un", () => {
    expect(repliDe("planning", "agenda-event")).toBe("/(tabs)/planning/agenda");
    expect(repliDe("planning", "day-of-item")).toBe("/(tabs)/planning/day-of");
    expect(repliDe("planning", "ceremony-item")).toBe("/(tabs)/planning/ceremony");
    expect(repliDe("planning", "speech")).toBe("/(tabs)/planning/speeches-music");
    expect(repliDe("guests", "household/[id]")).toBe("/(tabs)/guests/households");
    expect(repliDe("guests", "tables")).toBe("/(tabs)/guests/table-management");
  });
});

describe("afficheUnRetour", () => {
  it("pas de retour sur les écrans racines des onglets", () => {
    expect(afficheUnRetour("guests", "index")).toBe(false);
    expect(afficheUnRetour("vendors", "index")).toBe(false);
    expect(afficheUnRetour("planning", "index")).toBe(false);
    expect(afficheUnRetour("planning", "agenda")).toBe(false);
    expect(afficheUnRetour("planning", "day-of")).toBe(false);
  });

  it("un retour sur tous les sous-écrans", () => {
    expect(afficheUnRetour("guests", "groups")).toBe(true);
    expect(afficheUnRetour("planning", "events")).toBe(true);
    expect(afficheUnRetour("vendors", "[type]/index")).toBe(true);
  });
});
