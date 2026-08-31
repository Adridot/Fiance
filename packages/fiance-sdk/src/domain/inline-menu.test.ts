import { describe, it, expect } from 'vitest';
import {
  estimateWrappedLines,
  inlineMenuHintHeight,
  INLINE_MENU_HINT_LINE_H,
  INLINE_MENU_HINT_PAD_TOP,
} from './inline-menu.js';

/** Les aides réelles, dont la longueur varie du simple au tiers selon la langue. */
const AIDE_FR = 'Flèches pour naviguer · Entrée pour valider · Échap pour fermer';
const AIDE_EN = 'Arrows to move · Enter to pick · Esc to close';

/** Largeur de texte disponible dans un menu : bordures, `padding` et `px-3` ôtés. */
const largeurUtile = (menu: number) => menu - 38;

const TAILLE = 11;

describe('estimateWrappedLines', () => {
  it('replie l aide française sur trois lignes dans le menu le plus étroit', () => {
    expect(estimateWrappedLines(AIDE_FR, largeurUtile(200), TAILLE)).toBe(3);
  });

  it('en demande moins à mesure que le menu s élargit', () => {
    const etroit = estimateWrappedLines(AIDE_FR, largeurUtile(200), TAILLE);
    const large = estimateWrappedLines(AIDE_FR, largeurUtile(300), TAILLE);
    expect(large).toBeLessThan(etroit);
  });

  it('en demande moins pour une aide plus courte, à largeur égale', () => {
    expect(estimateWrappedLines(AIDE_EN, largeurUtile(200), TAILLE)).toBeLessThan(
      estimateWrappedLines(AIDE_FR, largeurUtile(200), TAILLE),
    );
  });

  it('ne descend jamais sous une ligne pour un texte non vide', () => {
    expect(estimateWrappedLines('ok', 4000, TAILLE)).toBe(1);
  });

  it('ne compte aucune ligne pour un texte vide', () => {
    expect(estimateWrappedLines('', largeurUtile(200), TAILLE)).toBe(0);
  });

  it('retombe sur une ligne plutôt que de diviser par une largeur absente', () => {
    expect(estimateWrappedLines(AIDE_FR, 0, TAILLE)).toBe(1);
    expect(estimateWrappedLines(AIDE_FR, largeurUtile(200), 0)).toBe(1);
  });
});

describe('inlineMenuHintHeight', () => {
  it('réserve les trois lignes et la marge haute de l aide française', () => {
    expect(inlineMenuHintHeight(AIDE_FR, largeurUtile(200), TAILLE)).toBe(
      3 * INLINE_MENU_HINT_LINE_H + INLINE_MENU_HINT_PAD_TOP,
    );
  });

  it('ne réserve rien sans aide', () => {
    expect(inlineMenuHintHeight(null, largeurUtile(200), TAILLE)).toBe(0);
    expect(inlineMenuHintHeight(undefined, largeurUtile(200), TAILLE)).toBe(0);
    expect(inlineMenuHintHeight('', largeurUtile(200), TAILLE)).toBe(0);
  });

  // La régression : le cadre réservait 21 px — une ligne — à une aide qui en
  // occupe trois, et le texte débordait sous la carte.
  it('réserve davantage que la hauteur d une seule ligne', () => {
    const uneLigne = INLINE_MENU_HINT_LINE_H + INLINE_MENU_HINT_PAD_TOP;
    expect(inlineMenuHintHeight(AIDE_FR, largeurUtile(200), TAILLE)).toBeGreaterThan(uneLigne);
    expect(inlineMenuHintHeight(AIDE_FR, largeurUtile(232), TAILLE)).toBeGreaterThan(uneLigne);
    expect(inlineMenuHintHeight(AIDE_FR, largeurUtile(300), TAILLE)).toBeGreaterThan(uneLigne);
  });

  // Majorer est sans conséquence — `maxHeight` laisse la carte à sa taille
  // réelle — alors que sous-estimer coupe. On vérifie le sens de l'erreur.
  it('majore : jamais moins que la largeur réelle du texte ne l exige', () => {
    for (const menu of [200, 232, 280, 300]) {
      const utile = largeurUtile(menu);
      const lignesReelles = Math.ceil((AIDE_FR.length * TAILLE * 0.52) / utile);
      expect(estimateWrappedLines(AIDE_FR, utile, TAILLE)).toBeGreaterThanOrEqual(lignesReelles);
    }
  });
});
