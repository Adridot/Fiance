import { describe, expect, it } from "vitest";

import {
  classerEchecDeLecture,
  epoqueCourante,
  epoqueDeLEnveloppe,
  epoquesDetenues,
  leveLEtatIllisible,
} from "@/lib/acces-chiffre";

const keyring = {
  v: 1,
  currentEpoch: 2,
  epochs: {
    "1": { wrappedKeys: [{ subKem: "proprio" }, { subKem: "ancien-lien" }] },
    "2": { wrappedKeys: [{ subKem: "proprio" }, { subKem: "emma" }] },
  },
};

describe("epoqueDeLEnveloppe", () => {
  it("lit l'_epoch en clair sans aucune clé", () => {
    expect(epoqueDeLEnveloppe({ _encrypted: "…", _epoch: 1 })).toBe(1);
  });

  it("rend null quand l'enveloppe n'en porte pas", () => {
    expect(epoqueDeLEnveloppe({ _encrypted: "…" })).toBeNull();
    expect(epoqueDeLEnveloppe(null)).toBeNull();
    expect(epoqueDeLEnveloppe({ _epoch: "2" })).toBeNull();
  });
});

describe("epoquesDetenues", () => {
  it("rend les deux époques du propriétaire", () => {
    expect([...epoquesDetenues(keyring, "proprio")].sort()).toEqual([1, 2]);
  });

  it("n'accorde à l'arrivant que l'époque de son arrivée", () => {
    expect([...epoquesDetenues(keyring, "emma")]).toEqual([2]);
  });

  it("n'accorde au lien évincé que l'époque antérieure", () => {
    expect([...epoquesDetenues(keyring, "ancien-lien")]).toEqual([1]);
  });

  it("écarte une époque où la clé apparaît deux fois — falsification", () => {
    const truque = { epochs: { "1": { wrappedKeys: [{ subKem: "emma" }, { subKem: "emma" }] } } };
    expect(epoquesDetenues(truque, "emma").size).toBe(0);
  });

  it("rend un ensemble vide sur un keyring illisible", () => {
    expect(epoquesDetenues(null, "emma").size).toBe(0);
    expect(epoquesDetenues(keyring, "").size).toBe(0);
  });

  it("epoqueCourante lit currentEpoch", () => {
    expect(epoqueCourante(keyring)).toBe(2);
    expect(epoqueCourante({})).toBeNull();
  });
});

describe("classerEchecDeLecture — les trois cas", () => {
  const detenues = epoquesDetenues(keyring, "emma"); // { 2 }

  it("document absent : le serveur répond hash vide et data vide", () => {
    expect(classerEchecDeLecture({ hash: "", data: {}, epoquesDetenues: detenues })).toBe("absent");
  });

  it("époque hors de portée : le document est scellé sous l'époque 1", () => {
    expect(
      classerEchecDeLecture({
        hash: "h",
        data: { _encrypted: "…", _epoch: 1 },
        epoquesDetenues: detenues,
      }),
    ).toBe("epoque-hors-de-portee");
  });

  it("erreur réseau : rien n'a pu être lu", () => {
    expect(
      classerEchecDeLecture({ erreur: new Error("fetch failed"), epoquesDetenues: detenues }),
    ).toBe("reseau");
  });

  it("les trois cas sont distincts", () => {
    const cas = new Set([
      classerEchecDeLecture({ hash: "", data: {}, epoquesDetenues: detenues }),
      classerEchecDeLecture({ hash: "h", data: { _epoch: 1 }, epoquesDetenues: detenues }),
      classerEchecDeLecture({ erreur: new Error("réseau"), epoquesDetenues: detenues }),
    ]);
    expect(cas.size).toBe(3);
  });

  it("une époque détenue n'est pas hors de portée", () => {
    expect(
      classerEchecDeLecture({ hash: "h", data: { _epoch: 2 }, epoquesDetenues: detenues }),
    ).toBe("reseau");
  });

  it("un keyring illisible ne rend jamais l'échec avéré", () => {
    expect(
      classerEchecDeLecture({ hash: "h", data: { _epoch: 1 }, epoquesDetenues: null }),
    ).toBe("reseau");
  });
});

describe("leveLEtatIllisible — le garde-fou du propriétaire", () => {
  it("ne lève l'état que sur une époque hors de portée", () => {
    expect(leveLEtatIllisible("epoque-hors-de-portee")).toBe(true);
    expect(leveLEtatIllisible("reseau")).toBe(false);
    expect(leveLEtatIllisible("absent")).toBe(false);
  });
});
