import { describe, expect, it } from "vitest";
import { nomSaisi } from "./nom-saisi";

describe("nomSaisi", () => {
  it("refuse une saisie vide ou faite d'espaces : le bouton reste désactivé", () => {
    for (const valeur of ["", " ", "   ", "\n\t "]) expect(nomSaisi(valeur)).toBeNull();
  });

  it("rend le nom sans les espaces qui l'entourent", () => {
    expect(nomSaisi("  Témoin ")).toBe("Témoin");
    expect(nomSaisi("Camille & Alex")).toBe("Camille & Alex");
  });
});
