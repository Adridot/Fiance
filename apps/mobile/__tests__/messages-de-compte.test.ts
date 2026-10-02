import { describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk" }));

import { CompteError, type EchecDeCompte } from "@/lib/compte";
import {
  cleDuMessageDeCompte,
  cleDuMessageDInvitation,
  messageDeLErreur,
  validerLaCreation,
  validerLeMotDePasse,
} from "@/lib/messages-de-compte";
import fr from "@/i18n/locales/fr/common.json";
import en from "@/i18n/locales/en/common.json";

const CAS: EchecDeCompte[] = [
  "identifiants",
  "existe-deja",
  "illisible",
  "reseau",
  "mot-de-passe-faible",
  "identifiant-vide",
  "deplace",
];

function lire(langue: unknown, cle: string): unknown {
  return cle.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], langue);
}

describe("cas d'échec → clé de message", () => {
  it.each(CAS)("%s a une clé traduite en français et en anglais", (cas) => {
    const cle = cleDuMessageDeCompte(cas);
    expect(typeof lire(fr, cle)).toBe("string");
    expect(typeof lire(en, cle)).toBe("string");
  });

  it("deux cas distincts ne partagent jamais la même clé", () => {
    expect(new Set(CAS.map(cleDuMessageDeCompte)).size).toBe(CAS.length);
  });

  it("les messages de la connexion sont ceux demandés", () => {
    expect(lire(fr, cleDuMessageDeCompte("identifiants"))).toBe("Identifiant ou mot de passe incorrect.");
    expect(lire(fr, cleDuMessageDeCompte("reseau"))).toBe("Le serveur ne répond pas. Vérifiez votre connexion et réessayez.");
    expect(lire(fr, cleDuMessageDeCompte("illisible"))).toBe(
      "Ce compte ne peut pas être lu. Demandez une nouvelle invitation aux mariés.",
    );
  });
});

describe("messageDeLErreur", () => {
  const traduire = (cle: string) => `<${cle}>`;

  it("traduit une CompteError selon son cas", () => {
    expect(messageDeLErreur(new CompteError("reseau", "serveur injoignable (HTTP 500)"), traduire)).toBe(
      "<compte.erreurs.reseau>",
    );
  });

  it("garde le message d'une autre erreur", () => {
    expect(messageDeLErreur(new Error("Le lien n'a pas pu être déposé"), traduire)).toBe("Le lien n'a pas pu être déposé");
  });

  it("retombe sur un message générique quand il n'y a rien à dire", () => {
    expect(messageDeLErreur(new Error("  "), traduire)).toBe("<compte.erreurs.inconnue>");
    expect(messageDeLErreur(undefined, traduire)).toBe("<compte.erreurs.inconnue>");
  });
});

describe("cause d'une invitation non reconnue → clé de message", () => {
  it.each(["incomplete", "expiree", "invalide", "utilisee"] as const)("%s est traduite", (cause) => {
    const cle = cleDuMessageDInvitation(cause);
    expect(typeof lire(fr, cle)).toBe("string");
    expect(typeof lire(en, cle)).toBe("string");
  });
});

describe("validation de la création", () => {
  const valide = { identifiant: "Léa", motDePasse: "huit-car", confirmation: "huit-car" };

  it("accepte une saisie complète", () => {
    expect(validerLaCreation(valide)).toEqual({});
  });

  it("refuse un identifiant vide ou fait d'espaces", () => {
    expect(validerLaCreation({ ...valide, identifiant: "   " })).toEqual({ identifiant: "compte.validation.identifiantVide" });
  });

  it("refuse un mot de passe de moins de 8 caractères", () => {
    expect(validerLaCreation({ ...valide, motDePasse: "1234567", confirmation: "1234567" })).toEqual({
      motDePasse: "compte.validation.motDePasseCourt",
    });
  });

  it("refuse une confirmation différente", () => {
    expect(validerLaCreation({ ...valide, confirmation: "huit-cax" })).toEqual({
      confirmation: "compte.validation.confirmationDifferente",
    });
  });

  it("signale tout à la fois, champ par champ", () => {
    expect(validerLaCreation({ identifiant: "", motDePasse: "court", confirmation: "autre" })).toEqual({
      identifiant: "compte.validation.identifiantVide",
      motDePasse: "compte.validation.motDePasseCourt",
    });
  });

  it("ne reproche pas la confirmation tant que le mot de passe est trop court", () => {
    expect(validerLeMotDePasse("court", "")).toEqual({ motDePasse: "compte.validation.motDePasseCourt" });
  });

  it("toutes les clés de validation existent dans les deux langues", () => {
    for (const cle of ["identifiantVide", "motDePasseCourt", "confirmationDifferente"]) {
      expect(typeof lire(fr, `compte.validation.${cle}`)).toBe("string");
      expect(typeof lire(en, `compte.validation.${cle}`)).toBe("string");
    }
  });
});
