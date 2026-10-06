import { beforeEach, describe, expect, it, vi } from "vitest";

async function charger() {
  vi.resetModules();
  return import("@/lib/revenir");
}

function routeur(canGoBack: boolean) {
  return { back: vi.fn(), canGoBack: () => canGoBack, replace: vi.fn() };
}

describe("deciderDuRetour", () => {
  it("ne revient que s'il y a une page précédente ET que l'utilisateur a navigué", async () => {
    const { deciderDuRetour } = await charger();
    expect(deciderDuRetour({ peutRevenir: true, aNavigue: true })).toBe("retour");
    expect(deciderDuRetour({ peutRevenir: true, aNavigue: false })).toBe("repli");
    expect(deciderDuRetour({ peutRevenir: false, aNavigue: true })).toBe("repli");
    expect(deciderDuRetour({ peutRevenir: false, aNavigue: false })).toBe("repli");
  });
});

describe("suivi des routes", () => {
  let m: Awaited<ReturnType<typeof charger>>;
  beforeEach(async () => {
    m = await charger();
  });

  it("aucune navigation tant que rien n'a été vu", () => {
    expect(m.aNavigueDepuisLeChargement()).toBe(false);
  });

  it("la première route est le point de départ, pas une navigation", () => {
    m.noterLaRoute("/guests/abc");
    expect(m.aNavigueDepuisLeChargement()).toBe(false);
  });

  it("la même route notée deux fois ne compte pas", () => {
    m.noterLaRoute("/guests/abc");
    m.noterLaRoute("/guests/abc");
    expect(m.aNavigueDepuisLeChargement()).toBe(false);
  });

  it("une route différente compte, et le reste ensuite", () => {
    m.noterLaRoute("/guests/abc");
    m.noterLaRoute("/guests");
    expect(m.aNavigueDepuisLeChargement()).toBe(true);
    m.noterLaRoute("/guests");
    expect(m.aNavigueDepuisLeChargement()).toBe(true);
  });
});

describe("revenir", () => {
  it("ouvert à froid sur un onglet autre que le premier : le repli, pas l'accueil de l'historique des onglets", async () => {
    const m = await charger();
    m.noterLaRoute("/guests/abc");
    const r = routeur(true);
    m.revenir(r, "/guests");
    expect(r.back).not.toHaveBeenCalled();
    expect(r.replace).toHaveBeenCalledWith("/guests");
  });

  it("ouvert à froid sans aucune page précédente : le repli", async () => {
    const m = await charger();
    m.noterLaRoute("/settings");
    const r = routeur(false);
    m.revenir(r, "/home");
    expect(r.back).not.toHaveBeenCalled();
    expect(r.replace).toHaveBeenCalledWith("/home");
  });

  it("après une navigation et avec une page précédente : retour", async () => {
    const m = await charger();
    m.noterLaRoute("/guests");
    m.noterLaRoute("/guests/abc");
    const r = routeur(true);
    m.revenir(r, "/guests");
    expect(r.back).toHaveBeenCalledTimes(1);
    expect(r.replace).not.toHaveBeenCalled();
  });

  it("après une navigation mais sans page précédente (repli déjà remplacé) : le repli", async () => {
    const m = await charger();
    m.noterLaRoute("/settings/compte");
    m.noterLaRoute("/settings");
    const r = routeur(false);
    m.revenir(r, "/home");
    expect(r.replace).toHaveBeenCalledWith("/home");
    expect(r.back).not.toHaveBeenCalled();
  });
});
