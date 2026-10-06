import { describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk" }));

import { CompteError } from "@/lib/compte";
import {
  accesARenouveler,
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

describe("un lien neuf pour un mariage déjà présent", () => {
  const membre = (inviteSubjectId?: string) => ({ ...entree("sp-b"), role: "member" as const, inviteSubjectId });
  const cap = (nonce: string, subUserId = "sujet-1") => ({ kind: "member", nonce, subUserId, exp: 1 });

  it("cap au nonce différent de l'accès enregistré : renouveler", () => {
    expect(
      etapeDuParcours({ weddings: [membre("sujet-1")] }, "sp-b", { capDuJeton: cap("N2", "sujet-2"), capEnregistre: cap("N1") }),
    ).toBe("renouveler");
  });

  it("même cap : déjà membre, rien ne change", () => {
    expect(
      etapeDuParcours({ weddings: [membre("sujet-1")] }, "sp-b", { capDuJeton: cap("N1"), capEnregistre: cap("N1") }),
    ).toBe("deja-acceptee");
  });

  it("le nonce départage même quand le sujet coïncide", () => {
    expect(accesARenouveler(membre("sujet-1"), { capDuJeton: cap("N2"), capEnregistre: cap("N1") })).toBe(true);
  });

  it("une entrée d'accès `member` stocke son cap en JSON : il se lit aussi", () => {
    const enregistre = JSON.stringify(cap("N1"));
    expect(accesARenouveler(membre(), { capDuJeton: cap("N1"), capEnregistre: enregistre })).toBe(false);
    expect(accesARenouveler(membre(), { capDuJeton: cap("N2"), capEnregistre: enregistre })).toBe(true);
  });

  it("accès non chargé : le sujet du dernier lien adopté départage", () => {
    expect(accesARenouveler(membre("sujet-1"), { capDuJeton: cap("N2", "sujet-2") })).toBe(true);
    expect(accesARenouveler(membre("sujet-1"), { capDuJeton: cap("N1", "sujet-1") })).toBe(false);
  });

  it("rien de connu sur l'accès de l'appareil : on adopte le lien", () => {
    expect(accesARenouveler(membre(), { capDuJeton: cap("N2") })).toBe(true);
  });

  it("le propriétaire n'échange jamais son accès contre un lien", () => {
    const proprietaire = { ...entree("sp-b"), role: "owner" as const };
    expect(etapeDuParcours({ weddings: [proprietaire] }, "sp-b", { capDuJeton: cap("N2"), capEnregistre: cap("N1") })).toBe(
      "deja-acceptee",
    );
    expect(accesARenouveler({ role: undefined }, { capDuJeton: cap("N2") })).toBe(false);
  });

  it("un jeton sans nonce ne remplace rien", () => {
    expect(accesARenouveler(membre("sujet-1"), { capDuJeton: { kind: "member" }, capEnregistre: cap("N1") })).toBe(false);
  });

  it("les autres branches ne bougent pas", () => {
    expect(etapeDuParcours({ weddings: [membre()] }, "sp-z", { capDuJeton: cap("N2") })).toBe("confirmer");
    expect(etapeDuParcours({ weddings: [] }, "sp-z", { capDuJeton: cap("N2") })).toBe("creer-un-compte");
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
