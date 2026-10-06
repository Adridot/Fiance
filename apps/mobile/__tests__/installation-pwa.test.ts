import { describe, expect, it } from "vitest";
import { peutProposerLInstallation, sousReserveDeCompte } from "@/lib/installation-pwa";

describe("quand proposer d'installer l'application", () => {
  it("jamais avant que le compte existe", () => {
    expect(peutProposerLInstallation(true, false)).toBe(false);
  });

  it("pas tant que le compte n'est pas lu : on ne l'affiche pas pour le retirer ensuite", () => {
    expect(peutProposerLInstallation(false, false)).toBe(false);
    expect(peutProposerLInstallation(false, true)).toBe(false);
  });

  it("dès que le compte est chargé et présent", () => {
    expect(peutProposerLInstallation(true, true)).toBe(true);
  });
});

describe("le bandeau d'installation sous réserve de compte", () => {
  const installation = { canInstall: true, isIosSafari: true, install: () => {}, dismissIosBanner: () => {} };

  it("laisse tout passer quand l'installation est permise", () => {
    expect(sousReserveDeCompte(installation, true)).toBe(installation);
  });

  it("éteint les deux bandeaux, Chromium et iOS, sans toucher au reste", () => {
    const sous = sousReserveDeCompte(installation, false);
    expect(sous.canInstall).toBe(false);
    expect(sous.isIosSafari).toBe(false);
    expect(sous.install).toBe(installation.install);
    expect(sous.dismissIosBanner).toBe(installation.dismissIosBanner);
    expect(installation.canInstall).toBe(true);
  });
});
