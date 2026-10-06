import { describe, it, expect } from "vitest";
import { CIBLE_TACTILE, debordement } from "@/lib/cible-tactile";

describe("débordement d'une cible tactile", () => {
  it("une cible de 44 px garde 44 px, ou rend l'excédent à la mise en page", () => {
    expect(CIBLE_TACTILE).toBe(44);
    expect(debordement(32)).toBe(-6);
    expect(debordement(24)).toBe(-10);
    expect(debordement(0)).toBe(-22);
  });

  it("jamais de marge positive : une rangée plus haute que la cible n'est pas agrandie", () => {
    expect(debordement(44)).toBe(0);
    expect(debordement(60)).toBe(0);
  });

  it("l'empreinte plus le double du débordement redonne 44 px de cible", () => {
    for (const empreinte of [16, 22, 30, 32, 40]) {
      expect(empreinte - 2 * debordement(empreinte)).toBe(CIBLE_TACTILE);
    }
  });
});
