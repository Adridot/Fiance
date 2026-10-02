import { describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk" }));

import { CompteError } from "@/lib/compte";
import {
  etapeDuParcours,
  sequenceDeCreationDeCompte,
  sequenceDeJonction,
  type ActionsDeLaSequence,
} from "@/lib/parcours-d-invitation";

const entree = (spaceId?: string) => ({ id: "w", label: "Mariage", dbFileName: "w.db", createdAt: "", spaceId });

describe("étape du parcours", () => {
  it("espace déjà au registre : déjà acceptée, même avec d'autres mariages", () => {
    expect(etapeDuParcours({ weddings: [entree("sp-a"), entree("sp-b")] }, "sp-b")).toBe("deja-acceptee");
  });

  it("registre non vide, espace inconnu : confirmer", () => {
    expect(etapeDuParcours({ weddings: [entree("sp-a")] }, "sp-b")).toBe("confirmer");
    expect(etapeDuParcours({ weddings: [entree()] }, "sp-b")).toBe("confirmer");
  });

  it("appareil vierge : créer un compte", () => {
    expect(etapeDuParcours({ weddings: [] }, "sp-b")).toBe("creer-un-compte");
    expect(etapeDuParcours(null, "sp-b")).toBe("creer-un-compte");
    expect(etapeDuParcours(undefined, "sp-b")).toBe("creer-un-compte");
  });

  it("après une connexion, le registre rempli oriente vers l'une des deux premières branches", () => {
    expect(etapeDuParcours({ weddings: [entree("sp-b")] }, "sp-b")).toBe("deja-acceptee");
    expect(etapeDuParcours({ weddings: [entree("sp-a")] }, "sp-b")).toBe("confirmer");
  });
});

function actions(surcharge: Partial<ActionsDeLaSequence> = {}) {
  const journal: string[] = [];
  const a: ActionsDeLaSequence = {
    joindre: vi.fn(async () => void journal.push("joindre")),
    creerLeCompte: vi.fn(async () => void journal.push("creer")),
    ouvrirUneSession: vi.fn(async () => void journal.push("ouvrir")),
    consommer: vi.fn(async () => void journal.push("consommer")),
    ...surcharge,
  };
  return { a, journal };
}

describe("séquence d'un appareil vierge", () => {
  it("jonction, puis compte, puis dépôt consommé — dans cet ordre", async () => {
    const { a, journal } = actions();
    expect(await sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).toBe("compte-cree");
    expect(journal).toEqual(["joindre", "creer", "consommer"]);
    expect(a.creerLeCompte).toHaveBeenCalledWith("Léa", "mot-de-passe");
  });

  it("une jonction qui échoue arrête tout et laisse l'erreur remonter", async () => {
    const { a, journal } = actions({ joindre: vi.fn(async () => { throw new Error("jonction"); }) });
    await expect(sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).rejects.toThrow("jonction");
    expect(journal).toEqual([]);
  });

  it("compte déjà existant : on ouvre une session avec les mêmes identifiants, puis on continue", async () => {
    const { a, journal } = actions({
      creerLeCompte: vi.fn(async () => { throw new CompteError("existe-deja", "déjà"); }),
    });
    expect(await sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).toBe("compte-cree");
    expect(a.ouvrirUneSession).toHaveBeenCalledWith("Léa", "mot-de-passe");
    expect(journal).toEqual(["joindre", "ouvrir", "consommer"]);
  });

  it("une autre erreur de compte après la jonction n'échoue pas : l'appareil est dans l'app, sans compte", async () => {
    const { a, journal } = actions({
      creerLeCompte: vi.fn(async () => { throw new CompteError("reseau", "coupé"); }),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).toBe("sans-compte");
    expect(a.ouvrirUneSession).not.toHaveBeenCalled();
    expect(journal).toEqual(["joindre"]);
  });

  it("existe-deja puis session impossible : même issue, lien non consommé", async () => {
    const { a, journal } = actions({
      creerLeCompte: vi.fn(async () => { throw new CompteError("existe-deja", "déjà"); }),
      ouvrirUneSession: vi.fn(async () => { throw new CompteError("reseau", "coupé"); }),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).toBe("sans-compte");
    expect(journal).toEqual(["joindre"]);
  });

  it("un dépôt qu'on ne parvient pas à consommer n'arrête rien", async () => {
    const { a } = actions({ consommer: vi.fn(async () => { throw new Error("réseau"); }) });
    expect(await sequenceDeCreationDeCompte(a, "Léa", "mot-de-passe")).toBe("compte-cree");
  });
});

describe("séquence d'un appareil déjà connecté", () => {
  it("jonction puis consommation", async () => {
    const { a, journal } = actions();
    await sequenceDeJonction(a);
    expect(journal).toEqual(["joindre", "consommer"]);
  });

  it("l'échec de la jonction remonte, sans consommer", async () => {
    const { a, journal } = actions({ joindre: vi.fn(async () => { throw new Error("jonction"); }) });
    await expect(sequenceDeJonction(a)).rejects.toThrow("jonction");
    expect(journal).toEqual([]);
  });

  it("l'échec de la consommation est avalé", async () => {
    const { a } = actions({ consommer: vi.fn(async () => { throw new Error("réseau"); }) });
    await expect(sequenceDeJonction(a)).resolves.toBeUndefined();
  });
});
