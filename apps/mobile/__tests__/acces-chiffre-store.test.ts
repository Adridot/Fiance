import { beforeEach, describe, expect, it } from "vitest";

import {
  collectionIllisible,
  lectureImpossible,
  useAccesChiffreStore,
} from "@/store/useAccesChiffreStore";

describe("useAccesChiffreStore", () => {
  beforeEach(() => {
    useAccesChiffreStore.getState().reinitialiser();
  });

  it("marquer une collection n'en marque aucune autre", () => {
    useAccesChiffreStore.getState().marquerIllisible("guest", "epoque-hors-de-portee", 1);

    expect(collectionIllisible("guest")).toBe(true);
    expect(collectionIllisible("budget")).toBe(false);
    expect(collectionIllisible("household")).toBe(false);
    expect(Object.keys(useAccesChiffreStore.getState().illisibles)).toEqual(["guest"]);
  });

  it("retient l'époque hors de portée pour le message", () => {
    useAccesChiffreStore.getState().marquerIllisible("guest", "epoque-hors-de-portee", 1);
    expect(useAccesChiffreStore.getState().epoqueHorsDePortee).toBe(1);
  });

  it("marquer lisible ne libère que la collection nommée", () => {
    const s = useAccesChiffreStore.getState();
    s.marquerIllisible("guest", "epoque-hors-de-portee", 1);
    s.marquerIllisible("vendor", "epoque-hors-de-portee", 1);
    s.marquerLisible("guest");

    expect(collectionIllisible("guest")).toBe(false);
    expect(collectionIllisible("vendor")).toBe(true);
    expect(lectureImpossible()).toBe(true);
  });

  it("la dernière collection libérée éteint le bandeau et l'époque", () => {
    const s = useAccesChiffreStore.getState();
    s.marquerIllisible("guest", "epoque-hors-de-portee", 1);
    s.marquerLisible("guest");

    expect(lectureImpossible()).toBe(false);
    expect(useAccesChiffreStore.getState().epoqueHorsDePortee).toBeNull();
  });

  it("libérer une collection jamais marquée ne change rien", () => {
    const avant = useAccesChiffreStore.getState().illisibles;
    useAccesChiffreStore.getState().marquerLisible("inconnue");
    expect(useAccesChiffreStore.getState().illisibles).toBe(avant);
  });

  it("un espace sain ne lève pas le bandeau", () => {
    expect(lectureImpossible()).toBe(false);
  });
});
