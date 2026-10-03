import { describe, expect, it } from "vitest";
import { indexApresTouche, placerLeMenu } from "@/lib/menu-deroulant";

const TELEPHONE = { largeur: 390, hauteur: 844 };

describe("placement du menu sous son déclencheur", () => {
  it("s'ouvre sous le déclencheur, bord droit aligné", () => {
    const p = placerLeMenu({ right: 374, bottom: 100 }, TELEPHONE);
    expect(p.top).toBe(104);
    expect(p.right).toBe(16);
  });

  it("ne déborde jamais de la fenêtre sur le côté", () => {
    expect(placerLeMenu({ right: 390, bottom: 100 }, TELEPHONE).right).toBe(8);
    expect(placerLeMenu({ right: 400, bottom: 100 }, TELEPHONE).right).toBe(8);
  });

  it("défile au lieu de sortir par le bas", () => {
    expect(placerLeMenu({ right: 374, bottom: 100 }, TELEPHONE).maxHeight).toBe(844 - 104 - 8);
    expect(placerLeMenu({ right: 374, bottom: 60 }, { largeur: 667, hauteur: 375 }).maxHeight).toBe(375 - 64 - 8);
  });

  it("ne déborde jamais de la fenêtre à gauche", () => {
    expect(placerLeMenu({ right: 374, bottom: 100 }, TELEPHONE).maxWidth).toBe(390 - 16 - 8);
    expect(placerLeMenu({ right: 390, bottom: 100 }, TELEPHONE).maxWidth).toBe(390 - 8 - 8);
  });

  it("une hauteur disponible négative devient nulle", () => {
    expect(placerLeMenu({ right: 100, bottom: 900 }, TELEPHONE).maxHeight).toBe(0);
  });
});

describe("navigation au clavier dans le menu", () => {
  it("flèche bas : premier item sans focus, puis suivant, puis retour au début", () => {
    expect(indexApresTouche("ArrowDown", -1, 4)).toBe(0);
    expect(indexApresTouche("ArrowDown", 1, 4)).toBe(2);
    expect(indexApresTouche("ArrowDown", 3, 4)).toBe(0);
  });

  it("flèche haut : dernier item sans focus ou au premier, sinon précédent", () => {
    expect(indexApresTouche("ArrowUp", -1, 4)).toBe(3);
    expect(indexApresTouche("ArrowUp", 0, 4)).toBe(3);
    expect(indexApresTouche("ArrowUp", 2, 4)).toBe(1);
  });

  it("Début et Fin", () => {
    expect(indexApresTouche("Home", 2, 4)).toBe(0);
    expect(indexApresTouche("End", 0, 4)).toBe(3);
  });

  it("toute autre touche, ou un menu vide : rien", () => {
    expect(indexApresTouche("a", 1, 4)).toBeNull();
    expect(indexApresTouche("Enter", 1, 4)).toBeNull();
    expect(indexApresTouche("ArrowDown", -1, 0)).toBeNull();
  });
});
