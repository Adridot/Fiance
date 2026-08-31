/**
 * Le regroupement d'une personne et de ses liens.
 *
 * Deux liens pour la même personne = deux affectations, et c'est délibéré :
 * réaffecter l'existante casserait l'accès de l'appareil déjà appairé. Le
 * regroupement est donc un calcul de vue, et il doit rester honnête sur ses
 * deux limites — un lien sans libellé reste seul, deux homonymes fusionnent.
 */
import { describe, expect, it } from "vitest";

import {
  affectationsARereferencer,
  estUnCollaborateurConnu,
  nombreDeCollaborateursDistincts,
  normaliserLeLibelle,
  ouvertureDeLaFeuille,
  regrouperLesCollaborateurs,
  type AffectationDeLien,
} from "@/lib/collaborateurs";

const lien = (
  id: string,
  label: string | null,
  createdAt: string,
  roleId = "role-editor",
): AffectationDeLien => ({ id, subjectUserId: `sujet-${id}`, roleId, label, createdAt });

describe("normaliserLeLibelle", () => {
  it("ignore la casse, les bords et les espaces multiples", () => {
    expect(normaliserLeLibelle("  Emma   Didot ")).toBe("emma didot");
    expect(normaliserLeLibelle("EMMA")).toBe(normaliserLeLibelle("emma"));
  });

  it("rend une chaîne vide pour un libellé absent", () => {
    expect(normaliserLeLibelle(null)).toBe("");
    expect(normaliserLeLibelle(undefined)).toBe("");
    expect(normaliserLeLibelle("   ")).toBe("");
  });
});

describe("regrouperLesCollaborateurs", () => {
  it("fusionne deux affectations de même libellé en une seule fiche", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:28:27Z"),
      lien("b", "emma", "2026-08-24T16:29:15Z"),
    ]);

    expect(groupes).toHaveLength(1);
    expect(groupes[0].nom).toBe("emma");
    expect(groupes[0].liens.map((l) => l.id)).toEqual(["a", "b"]);
  });

  it("sépare deux libellés différents", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z"),
      lien("b", "Parents DIDOT", "2026-08-24T11:14:17Z"),
    ]);

    expect(groupes).toHaveLength(2);
    expect(groupes.every((g) => g.liens.length === 1)).toBe(true);
  });

  it("laisse SEULE chaque affectation sans libellé — jamais fusionnées entre elles", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", null, "2026-08-21T17:24:25Z"),
      lien("b", "", "2026-08-21T17:25:00Z"),
      lien("c", "   ", "2026-08-21T17:26:00Z"),
    ]);

    expect(groupes).toHaveLength(3);
    expect(groupes.every((g) => g.nom === null && g.liens.length === 1)).toBe(true);
  });

  it("un lien sans libellé ne rejoint pas une personne nommée", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z"),
      lien("b", null, "2026-08-24T15:00:00Z"),
    ]);
    expect(groupes).toHaveLength(2);
  });

  it("range les liens du plus ancien au plus récent", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("récent", "Emma", "2026-08-24T16:29:15Z"),
      lien("ancien", "Emma", "2026-08-24T14:28:27Z"),
    ]);
    expect(groupes[0].liens.map((l) => l.id)).toEqual(["ancien", "récent"]);
  });

  it("le rôle de la fiche est celui du lien le PLUS RÉCENT", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z", "role-viewer"),
      lien("b", "Emma", "2026-08-24T16:00:00Z", "role-editor"),
    ]);
    expect(groupes[0].roleId).toBe("role-editor");
  });

  it("chaque lien garde sa date d'émission, distincte", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:28:27Z"),
      lien("b", "Emma", "2026-08-24T16:29:15Z"),
    ]);
    const dates = groupes[0].liens.map((l) => l.createdAt);
    expect(new Set(dates).size).toBe(2);
  });

  it("une liste vide ne produit aucune fiche", () => {
    expect(regrouperLesCollaborateurs([])).toEqual([]);
  });

  it("deux homonymes fusionnent — limite assumée, visible par les dates", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Marie", "2026-08-01T10:00:00Z"),
      lien("b", "Marie", "2026-08-20T10:00:00Z"),
    ]);
    expect(groupes).toHaveLength(1);
    expect(groupes[0].liens).toHaveLength(2);
  });
});

describe("nombreDeCollaborateursDistincts", () => {
  it("compte les PERSONNES, pas les liens", () => {
    const affectations = [
      lien("a", "Emma", "2026-08-24T14:00:00Z"),
      lien("b", "Emma", "2026-08-24T16:00:00Z"),
      lien("c", "Parents DIDOT", "2026-08-24T11:00:00Z"),
    ];
    expect(affectations).toHaveLength(3);
    expect(nombreDeCollaborateursDistincts(affectations)).toBe(2);
  });

  it("compte chaque lien sans libellé comme une personne — on n'en sait pas plus", () => {
    expect(nombreDeCollaborateursDistincts([lien("a", null, "x"), lien("b", null, "y")])).toBe(2);
  });
});

describe("estUnCollaborateurConnu", () => {
  const affectations = [lien("a", "Emma", "2026-08-24T14:00:00Z")];

  it("reconnaît une personne déjà collaboratrice, quelle que soit la casse", () => {
    expect(estUnCollaborateurConnu(affectations, "emma")).toBe(true);
    expect(estUnCollaborateurConnu(affectations, "  EMMA  ")).toBe(true);
  });

  it("ne reconnaît pas quelqu'un de nouveau", () => {
    expect(estUnCollaborateurConnu(affectations, "Mathieu")).toBe(false);
  });

  it("un nom vide n'est jamais une réémission", () => {
    expect(estUnCollaborateurConnu(affectations, "")).toBe(false);
    expect(estUnCollaborateurConnu(affectations, null)).toBe(false);
  });
});

describe("ouvertureDeLaFeuille — réémission sans rien redemander", () => {
  const roles = [{ id: "role-editor" }, { id: "role-viewer" }];

  it("nom et rôle connus : la feuille GÉNÈRE, elle ne demande rien", () => {
    expect(ouvertureDeLaFeuille("Emma", "role-editor", roles)).toEqual({
      etat: "generating",
      roleId: "role-editor",
      nom: "Emma",
    });
  });

  it("un rôle SUPPRIMÉ entre-temps fait retomber sur le sélecteur", () => {
    const r = ouvertureDeLaFeuille("Emma", "role-disparu", roles);
    expect(r.etat).toBe("selecting");
    expect(r.roleId).toBeUndefined();
  });

  it("elle n'émet JAMAIS de lien sans rôle résolu", () => {
    for (const cas of [
      ouvertureDeLaFeuille("Emma", null, roles),
      ouvertureDeLaFeuille("Emma", undefined, roles),
      ouvertureDeLaFeuille("Emma", "role-disparu", roles),
      ouvertureDeLaFeuille("Emma", "role-editor", []),
    ]) {
      expect(cas.etat).toBe("selecting");
      expect(cas.roleId).toBeUndefined();
    }
  });

  it("sans nom, la feuille demande — même si le rôle est connu", () => {
    expect(ouvertureDeLaFeuille("", "role-editor", roles).etat).toBe("selecting");
    expect(ouvertureDeLaFeuille("   ", "role-editor", roles).etat).toBe("selecting");
    expect(ouvertureDeLaFeuille(null, "role-editor", roles).etat).toBe("selecting");
  });

  it("une ouverture ordinaire, sans rien de pré-rempli, demande", () => {
    expect(ouvertureDeLaFeuille(undefined, undefined, roles)).toEqual({ etat: "selecting" });
  });

  it("le nom est pré-rempli même quand le rôle manque — la saisie n'est pas perdue", () => {
    expect(ouvertureDeLaFeuille("  Emma  ", "role-disparu", roles).nom).toBe("Emma");
  });
});

describe("affectationsARereferencer — le rôle vaut pour tous les liens", () => {
  const MAINTENANT = "2026-08-24T17:00:00.000Z";

  it("réécrit les N affectations d'une personne, pas seulement une", () => {
    const groupe = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z", "role-viewer"),
      lien("b", "Emma", "2026-08-24T16:00:00Z", "role-viewer"),
    ])[0];

    const aEcrire = affectationsARereferencer(groupe, "role-editor", MAINTENANT);
    expect(aEcrire).toHaveLength(2);
    expect(aEcrire.every((a) => a.roleId === "role-editor")).toBe(true);
    expect(aEcrire.map((a) => a.id).sort()).toEqual(["a", "b"]);
  });

  it("écarte les affectations déjà au bon rôle — pas d'écriture pour rien", () => {
    const groupe = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z", "role-editor"),
      lien("b", "Emma", "2026-08-24T16:00:00Z", "role-viewer"),
    ])[0];

    const aEcrire = affectationsARereferencer(groupe, "role-editor", MAINTENANT);
    expect(aEcrire.map((a) => a.id)).toEqual(["b"]);
  });

  it("un groupe déjà au bon rôle ne produit aucune écriture", () => {
    const groupe = regrouperLesCollaborateurs([lien("a", "Emma", "x", "role-editor")])[0];
    expect(affectationsARereferencer(groupe, "role-editor", MAINTENANT)).toEqual([]);
  });

  it("horodate chaque affectation réécrite", () => {
    const groupe = regrouperLesCollaborateurs([lien("a", "Emma", "x", "role-viewer")])[0];
    expect(affectationsARereferencer(groupe, "role-editor", MAINTENANT)[0].updatedAt).toBe(MAINTENANT);
  });

  it("ne touche jamais aux liens d'une AUTRE personne", () => {
    const groupes = regrouperLesCollaborateurs([
      lien("a", "Emma", "2026-08-24T14:00:00Z", "role-viewer"),
      lien("b", "Mathieu", "2026-08-24T15:00:00Z", "role-viewer"),
    ]);
    const emma = groupes.find((g) => g.nom === "Emma")!;
    const aEcrire = affectationsARereferencer(emma, "role-editor", MAINTENANT);
    expect(aEcrire.map((a) => a.id)).toEqual(["a"]);
  });
});

describe("révoquer UN lien, pas la personne", () => {
  const emmaA = lien("a", "Emma", "2026-08-24T14:00:00Z");
  const emmaB = lien("b", "Emma", "2026-08-24T16:00:00Z");
  const mathieu = lien("c", "Mathieu", "2026-08-24T11:00:00Z");
  const toutes = [emmaA, emmaB, mathieu];

  /** Ce que fait `removeAssignment(id)` : l'affectation disparaît, elle seule. */
  const apresRevocation = (id: string) => toutes.filter((a) => a.id !== id);

  it("la personne reste dans la liste tant qu'il lui reste un lien", () => {
    const groupes = regrouperLesCollaborateurs(apresRevocation("a"));
    const emma = groupes.find((g) => g.nom === "Emma");
    expect(emma).toBeDefined();
    expect(emma!.liens.map((l) => l.id)).toEqual(["b"]);
  });

  it("les autres collaborateurs ne bougent pas", () => {
    const groupes = regrouperLesCollaborateurs(apresRevocation("a"));
    expect(groupes.find((g) => g.nom === "Mathieu")?.liens).toHaveLength(1);
  });

  it("révoquer le DERNIER lien retire la personne de la liste", () => {
    const restantes = toutes.filter((a) => a.id !== "a" && a.id !== "b");
    const groupes = regrouperLesCollaborateurs(restantes);
    expect(groupes.map((g) => g.nom)).toEqual(["Mathieu"]);
  });

  it("le drapeau « dernier lien » distingue les deux avertissements", () => {
    const emma = regrouperLesCollaborateurs(toutes).find((g) => g.nom === "Emma")!;
    const mathieuSeul = regrouperLesCollaborateurs(toutes).find((g) => g.nom === "Mathieu")!;
    expect(emma.liens.length === 1).toBe(false);
    expect(mathieuSeul.liens.length === 1).toBe(true);
  });
});
