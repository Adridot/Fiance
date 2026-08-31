import { describe, expect, it } from "vitest";
import { theme as GP } from "./garden-theme";

/**
 * Plancher de lisibilité des jetons de couleur.
 *
 * Ce test existe parce qu'un contraste ne se relit pas : il se mesure. Une
 * capture d'écran ne montre que l'état d'un écran à un instant, et l'œil
 * s'habitue à ce qu'il voit tous les jours — quatre jetons porteurs de texte
 * sont aujourd'hui sous le seuil AA sans que rien ne le signale.
 *
 * La règle défendue ici n'est pas « tout doit être conforme » : ce serait
 * refuser la palette actuelle en bloc, donc rendre le test inutilisable dès sa
 * première exécution. C'est « AUCUN jeton ne descend sous la valeur qu'il porte
 * aujourd'hui ». Au premier hexadécimal qu'une session voudra « juste ajuster un
 * peu », ce fichier échoue en nommant le jeton, sa mesure et son plancher.
 */

// ---------------------------------------------------------------------------
// Contraste WCAG 2.x — luminance relative sRGB
// ---------------------------------------------------------------------------

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = "#ffffff";
const BLACK = "#000000";

describe("contraste WCAG", () => {
  it("mesure les paires connues", () => {
    expect(contrast(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(contrast(WHITE, WHITE)).toBeCloseTo(1, 5);
    expect(contrast(BLACK, BLACK)).toBeCloseTo(1, 5);
  });

  it("est symétrique", () => {
    expect(contrast(GP.clay, GP.paper)).toBeCloseTo(contrast(GP.paper, GP.clay), 10);
  });
});

// ---------------------------------------------------------------------------
// Plancher — les mesures de la palette livrée, sur son propre papier
// ---------------------------------------------------------------------------

/**
 * Chaque jeton porteur de texte, mesuré contre le fond sur lequel il s'affiche
 * effectivement — le papier, jamais le blanc. Un jeton mesuré contre du blanc
 * qu'il ne touche jamais donne une valeur rassurante et fausse.
 *
 * Les valeurs sont TRONQUÉES au centième inférieur, pas arrondies : la mesure
 * doit rester ≥ au plancher, et un arrondi au supérieur ferait échouer la
 * palette contre elle-même (`ink` mesure 13,0866 et `mustard` 2,3376).
 *
 * Un jeton volontairement éclairci doit arriver avec sa nouvelle mesure
 * inscrite ici — c'est-à-dire avec une décision assumée, pas un glissement.
 */
const DELIVERED_FLOORS: Record<string, number> = {
  ink: 13.08,
  inkSoft: 8.41,
  olive: 3.92,
  clay: 3.41,
  mute: 3.20,
  blue: 3.08,
  mustard: 2.33,
};

/** Applique un plancher à une table de jetons — extrait pour être testable. */
function floorViolations(
  tokens: Record<string, string>,
  paper: string,
  floors: Record<string, number>,
): Array<{ token: string; measured: number; floor: number }> {
  const out: Array<{ token: string; measured: number; floor: number }> = [];
  for (const [token, floor] of Object.entries(floors)) {
    const measured = contrast(tokens[token], paper);
    if (measured < floor) out.push({ token, measured, floor });
  }
  return out;
}

describe("plancher de contraste — aucun jeton ne régresse", () => {
  it.each(Object.entries(DELIVERED_FLOORS))(
    "%s tient sa mesure livrée de %s",
    (token, floor) => {
      const hex = GP[token as keyof typeof GP];
      const measured = contrast(hex, GP.paper);
      expect(
        measured,
        `${token} = ${hex} contraste à ${measured.toFixed(2)} sur le papier ${GP.paper}, sous sa mesure livrée de ${floor}. Si l'éclaircissement est voulu, inscrire la nouvelle mesure dans DELIVERED_FLOORS — et pas seulement changer la couleur.`,
      ).toBeGreaterThanOrEqual(floor);
    },
  );

  it("le plancher a des dents — éclaircir un seul jeton le fait échouer", () => {
    const regressed = { ...GP, mustard: "#d9a94f" } as unknown as Record<string, string>;
    const violations = floorViolations(regressed, GP.paper, DELIVERED_FLOORS);
    expect(violations.map((v) => v.token)).toContain("mustard");
  });

  it("ne signale rien sur la palette livrée", () => {
    const tokens = GP as unknown as Record<string, string>;
    expect(floorViolations(tokens, GP.paper, DELIVERED_FLOORS)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Ce que la mesure révèle — quatre jetons porteurs de texte sous le seuil AA
// ---------------------------------------------------------------------------

/**
 * Le harnais ne corrige rien : changer ces quatre valeurs est une décision de
 * conception, pas un correctif de test. Ce qu'il fait, c'est rendre l'écart
 * MESURABLE et empêcher qu'il s'aggrave — un écart chiffré et nommé se discute,
 * un écart qu'on ne mesure pas se creuse.
 *
 * Les valeurs sont celles mesurées sur le papier courant. Elles sont inscrites
 * en dur : si l'une d'elles bouge, c'est que la palette a bougé, et le test doit
 * le dire plutôt que de recalculer la cible depuis la mesure — un test qui
 * recalcule son attendu ne vérifie rien.
 */
const AA_BODY_TEXT = 4.5;

const BELOW_AA: Record<string, number> = {
  mustard: 2.34,
  blue: 3.08,
  mute: 3.20,
  olive: 3.93,
};

describe("jetons porteurs de texte sous le seuil AA", () => {
  it.each(Object.entries(BELOW_AA))(
    "%s mesure %s sur le papier, sous le seuil de texte courant",
    (token, expected) => {
      const measured = contrast(GP[token as keyof typeof GP], GP.paper);
      expect(measured).toBeCloseTo(expected, 2);
      expect(measured).toBeLessThan(AA_BODY_TEXT);
    },
  );

  /**
   * EXEMPTION NOMMÉE — `clay`, l'accent primaire, mesure 3,42 sur le papier.
   *
   * Il n'est employé comme texte que sur des libellés courts adossés à une
   * icône, jamais sur du texte courant ; là où il fait un aplat plein, c'est du
   * blanc qui s'y écrit, et c'est cette mesure-là qui compte. Il est donc tenu
   * de ne pas régresser — ce que le plancher ci-dessus vérifie — et non
   * d'atteindre le seuil.
   */
  it("l'accent primaire est exempté du seuil, mais le blanc qui s'y écrit ne l'est pas", () => {
    expect(contrast(GP.clay, GP.paper)).toBeLessThan(AA_BODY_TEXT);
    expect(contrast(WHITE, GP.clay)).toBeGreaterThanOrEqual(3.9);
  });

  it("aucun autre jeton porteur de texte n'est sous le seuil sans figurer ici", () => {
    const listed = new Set([...Object.keys(BELOW_AA), "clay"]);
    const unlisted = Object.keys(DELIVERED_FLOORS).filter(
      (token) =>
        !listed.has(token) &&
        contrast(GP[token as keyof typeof GP], GP.paper) < AA_BODY_TEXT,
    );
    expect(unlisted).toEqual([]);
  });
});
