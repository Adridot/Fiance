import { describe, expect, it } from "vitest";
import { theme as GP } from "./garden-theme";

/**
 * MODIFICATION LOCALE — plancher de lisibilité de la palette du mariage.
 *
 * Ce test existe parce qu'un contraste ne se relit pas : il se mesure. L'ancienne
 * identité laissait quatre jetons porteurs de texte sous 4,0 sans que rien ne le
 * signale, et une capture d'écran ne montre que l'état d'un écran à un instant.
 * La règle défendue ici est qu'AUCUN jeton ne descend sous la valeur qu'il
 * portait avant le changement de palette — au premier hexadécimal qu'une session
 * suivante voudra « juste ajuster un peu », ce fichier échoue en nommant le
 * jeton, sa mesure et son plancher.
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
// Plancher historique — les mesures de l'ancienne identité, sur son papier
// ---------------------------------------------------------------------------

/**
 * Chaque jeton porteur de texte, mesuré contre le fond sur lequel il s'affiche
 * effectivement — le papier, jamais le blanc. Les valeurs sont celles de
 * l'ancienne palette Garden Press (`clay` #b96a4a sur papier #f2ece0) : elles
 * sont ici une référence historique en dur, pas une cible à recalculer.
 *
 * Ce plancher-ci dit « aucune régression contre l'ancienne identité ». Il est
 * volontairement lâche, et à lui seul il ne défend pas grand-chose : le nouveau
 * papier étant PLUS CLAIR que l'ancien, toute mesure monte mécaniquement, et
 * rétablir une ancienne valeur de jeton ne suffirait même pas à le franchir
 * (l'ancien `mustard` #c9922f contraste à 2,54 sur #fdf4ef, au-dessus de son
 * plancher de 2,34). C'est le rôle de la seconde table ci-dessous.
 */
const HISTORICAL_FLOORS: Record<string, number> = {
  ink: 13.09,
  inkSoft: 8.42,
  olive: 3.93,
  clay: 3.42,
  mute: 3.20,
  blue: 3.08,
  mustard: 2.34,
};

/**
 * Les mesures de la palette LIVRÉE, sur son propre papier. C'est le garde qui
 * mord : il ne laisse aucune latitude à une retouche, et c'est lui qui échoue
 * au premier hexadécimal qu'une session suivante voudra « juste ajuster un
 * peu ». Un jeton volontairement éclairci doit donc arriver avec sa nouvelle
 * mesure inscrite ici — c'est-à-dire avec une décision assumée, pas un
 * glissement.
 *
 * Les valeurs sont TRONQUÉES au centième inférieur, pas arrondies : la mesure
 * doit rester ≥ au plancher, et un arrondi au supérieur ferait échouer la
 * palette contre elle-même (inkSoft mesure 9,4455 et mustard 5,2164). La
 * documentation du changement les arrondit, elle, à 9,45 et 5,22.
 */
const DELIVERED_FLOORS: Record<string, number> = {
  ink: 14.94,
  inkSoft: 9.44,
  olive: 5.97,
  clay: 3.67,
  mute: 4.85,
  blue: 5.76,
  mustard: 5.21,
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
  it.each(Object.entries(HISTORICAL_FLOORS))(
    "%s tient son plancher historique de %s",
    (token, floor) => {
      const hex = GP[token as keyof typeof GP];
      const measured = contrast(hex, GP.paper);
      expect(
        measured,
        `${token} = ${hex} contraste à ${measured.toFixed(2)} sur le papier ${GP.paper}, sous son plancher historique de ${floor}`,
      ).toBeGreaterThanOrEqual(floor);
    },
  );

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

  it("le plancher a des dents — rétablir une seule ancienne valeur le fait échouer", () => {
    const regressed = { ...GP, mustard: "#c9922f" } as unknown as Record<string, string>;
    const violations = floorViolations(regressed, GP.paper, DELIVERED_FLOORS);
    expect(violations.map((v) => v.token)).toContain("mustard");
  });

  it("ne signale rien sur la palette livrée", () => {
    const tokens = GP as unknown as Record<string, string>;
    expect(floorViolations(tokens, GP.paper, HISTORICAL_FLOORS)).toEqual([]);
    expect(floorViolations(tokens, GP.paper, DELIVERED_FLOORS)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Les quatre accents porteurs de texte passent au-dessus de 4,0
// ---------------------------------------------------------------------------

describe("accents porteurs de texte", () => {
  /**
   * Les quatre jetons qui étaient sous le seuil dans l'ancienne identité — et
   * qui portent des libellés, pas seulement des remplissages.
   */
  it.each(["olive", "mustard", "blue", "mute"] as const)(
    "%s dépasse 4,0 sur le papier",
    (token) => {
      expect(contrast(GP[token], GP.paper)).toBeGreaterThan(4.0);
    },
  );

  /**
   * EXEMPTION NOMMÉE — `clay`, l'accent primaire.
   *
   * Sa valeur est imposée : Sea Green #00916e est la couleur du mariage, elle
   * ne se négocie pas contre une mesure. Il n'est employé comme texte que sur
   * des libellés courts adossés à une icône, jamais sur du texte courant ; sur
   * un aplat plein, c'est du blanc qui s'y écrit, à 3,98 — la mesure qui compte
   * pour le bandeau d'accueil. Il est donc seulement tenu de NE PAS RÉGRESSER,
   * ce que le plancher historique ci-dessus vérifie déjà (3,42 → 3,67).
   */
  it("l'accent primaire est exempté du seuil de 4,0 mais ne régresse pas", () => {
    const onPaper = contrast(GP.clay, GP.paper);
    expect(onPaper).toBeGreaterThanOrEqual(HISTORICAL_FLOORS.clay);
    expect(contrast(WHITE, GP.clay)).toBeGreaterThanOrEqual(3.9);
  });
});

// ---------------------------------------------------------------------------
// Une couleur claire ne porte jamais de texte
// ---------------------------------------------------------------------------

/**
 * Jasmine, Icy Aqua et Powder Petal contrastent à 1,38, 1,18 et 1,22 contre le
 * blanc : ce sont des remplissages, pas des encres. Elles doivent donc rester
 * cantonnées aux jetons `*Soft`, `postit` et aux fonds — jamais affectées à un
 * jeton d'encre par un futur remaniement qui ne verrait que « la couleur de la
 * palette ».
 */
const LIGHT_PALETTE_COLOURS = {
  Jasmine: "#fbd87f",
  "Icy Aqua": "#b5f8fe",
  "Powder Petal": "#fce4d8",
} as const;

/** Tout jeton dont la valeur peut se retrouver en texte ou en icône. */
const INK_BEARING_TOKENS = [
  "ink",
  "inkSoft",
  "mute",
  "clay",
  "olive",
  "mustard",
  "blue",
  "strawberryInk",
] as const;

describe("aucune couleur claire ne tient un rôle d'encre", () => {
  it("les trois couleurs claires de la palette sont bien sous 3,0 contre le blanc", () => {
    for (const [name, hex] of Object.entries(LIGHT_PALETTE_COLOURS)) {
      expect(contrast(hex, WHITE), `${name} ${hex}`).toBeLessThan(3.0);
    }
  });

  it.each(INK_BEARING_TOKENS)("%s dépasse 3,0 contre le blanc", (token) => {
    expect(contrast(GP[token], WHITE)).toBeGreaterThanOrEqual(3.0);
  });

  it("aucun jeton d'encre ne reprend une couleur claire de la palette", () => {
    const light = new Set(Object.values(LIGHT_PALETTE_COLOURS).map((c) => c.toLowerCase()));
    for (const token of INK_BEARING_TOKENS) {
      expect(light.has(GP[token].toLowerCase()), `${token} = ${GP[token]}`).toBe(false);
    }
  });
});
