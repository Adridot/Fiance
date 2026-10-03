import { describe, expect, it } from "vitest";
import { CIBLE_MIN, agrandir, cibleAgrandie, cibleCarree, demiEcart, type StyleAgrandi } from "./cible-tactile";

/** Hauteur de la boîte (la cible) d'un contenu de `contenu` px, rembourrage compris. */
const boite = (contenu: number, s: StyleAgrandi) => contenu + (s.paddingTop ?? 0) + (s.paddingBottom ?? 0);
/** Place occupée dans la mise en page : la boîte et ses marges. */
const encombrement = (contenu: number, s: StyleAgrandi) =>
  boite(contenu, s) + (s.marginTop ?? 0) + (s.marginBottom ?? 0);

describe("demiEcart", () => {
  it("mesure ce qui manque de chaque côté, arrondi au pixel supérieur", () => {
    expect(demiEcart(38)).toBe(3);
    expect(demiEcart(36)).toBe(4);
    expect(demiEcart(18)).toBe(13);
    expect(demiEcart(17)).toBe(14);
  });

  it("n'agrandit pas une cible qui fait déjà la taille", () => {
    expect(demiEcart(44)).toBe(0);
    expect(demiEcart(60)).toBe(0);
  });
});

describe("agrandir", () => {
  it("ne touche qu'aux côtés nommés, pour ne pas écraser les classes des autres", () => {
    expect(agrandir({ haut: 3, bas: 3 })).toEqual({
      paddingTop: 3,
      paddingBottom: 3,
      marginTop: -3,
      marginBottom: -3,
    });
    expect(agrandir({ gauche: 38 }, { marges: { gauche: 8 } })).toEqual({ paddingLeft: 38, marginLeft: -30 });
  });

  it("reprend les marges et les rembourrages que l'élément portait déjà", () => {
    expect(agrandir({ haut: 14, bas: 14 }, { marges: { haut: 12, bas: 8 } })).toEqual({
      paddingTop: 14,
      paddingBottom: 14,
      marginTop: -2,
      marginBottom: -6,
    });
    expect(agrandir({ haut: 4 }, { rembourrages: { haut: 8 } })).toEqual({ paddingTop: 12, marginTop: -4 });
  });
});

describe("cibleAgrandie", () => {
  it("donne au moins 44 px de cible sans changer l'encombrement, quelle que soit la hauteur", () => {
    for (let hauteur = 1; hauteur <= 60; hauteur++) {
      const s = cibleAgrandie(hauteur);
      expect(boite(hauteur, s)).toBeGreaterThanOrEqual(Math.max(hauteur, CIBLE_MIN));
      expect(boite(hauteur, s)).toBeLessThanOrEqual(Math.max(hauteur, CIBLE_MIN + 1));
      expect(encombrement(hauteur, s)).toBe(hauteur);
    }
  });

  it("puce de 38 px : 44 px de cible", () => {
    expect(boite(38, cibleAgrandie(38))).toBe(44);
  });

  it("en-tête de section repliable (16 px, marges de 12 et 8) : 44 px, même encombrement", () => {
    const s = cibleAgrandie(16, { marges: { haut: 12, bas: 8 } });
    expect(boite(16, s)).toBe(44);
    expect(encombrement(16, s)).toBe(16 + 12 + 8);
  });
});

describe("cibleCarree", () => {
  it("chevron de 36 px (icône de 20 et p-2) : 44 × 44, même encombrement", () => {
    const s = cibleCarree(36, { rembourrages: { haut: 8, bas: 8, gauche: 8, droite: 8 } });
    expect(boite(20, s)).toBe(44);
    expect(20 + (s.paddingLeft ?? 0) + (s.paddingRight ?? 0)).toBe(44);
    expect(encombrement(20, s)).toBe(36);
  });
});
