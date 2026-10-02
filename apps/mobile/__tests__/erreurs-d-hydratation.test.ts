import { describe, it, expect } from "vitest";
import { estUnEcartDHydratation } from "@/lib/erreurs-d-hydratation";

describe("estUnEcartDHydratation", () => {
  it("reconnaît les erreurs React minifiées d'hydratation", () => {
    expect(estUnEcartDHydratation("Uncaught Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text")).toBe(true);
    expect(estUnEcartDHydratation("Minified React error #423")).toBe(true);
    expect(estUnEcartDHydratation("Minified React error #425")).toBe(true);
  });

  it("reconnaît la forme non minifiée", () => {
    expect(estUnEcartDHydratation("Hydration failed because the server rendered text didn't match the client.")).toBe(true);
  });

  it("laisse passer toute autre erreur", () => {
    expect(estUnEcartDHydratation("Minified React error #4180")).toBe(false);
    expect(estUnEcartDHydratation("Minified React error #310")).toBe(false);
    expect(estUnEcartDHydratation("TypeError: x is not a function")).toBe(false);
    expect(estUnEcartDHydratation(undefined)).toBe(false);
  });
});
