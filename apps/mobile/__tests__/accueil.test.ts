import { describe, expect, it } from "vitest";
import { ecranInitialDeLAccueil } from "@/lib/accueil";

describe("?mode= de l'accueil", () => {
  it("connexion ouvre le formulaire de connexion", () => {
    expect(ecranInitialDeLAccueil("connexion")).toBe("connexion");
  });

  it("un paramètre répété lit le premier", () => {
    expect(ecranInitialDeLAccueil(["connexion", "autre"])).toBe("connexion");
    expect(ecranInitialDeLAccueil(["autre", "connexion"])).toBe("accueil");
  });

  it("absent ou inconnu : l'accueil", () => {
    expect(ecranInitialDeLAccueil(undefined)).toBe("accueil");
    expect(ecranInitialDeLAccueil("")).toBe("accueil");
    expect(ecranInitialDeLAccueil("Connexion")).toBe("accueil");
  });
});
