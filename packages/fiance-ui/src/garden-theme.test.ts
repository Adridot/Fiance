import { describe, expect, it } from "vitest";
import { theme as GP } from "./garden-theme";

/**
 * Contrast MEASUREMENT and RATCHET for the palette tokens.
 *
 * This file does NOT assert accessibility compliance, and a green run must not
 * be read as "the palette is AA". It is not: four text-bearing tokens sit below
 * the AA body-text threshold today, and this file records that fact rather than
 * fixing it.
 *
 * A contrast ratio cannot be read off a screenshot, only measured. The rule
 * defended here is not "everything must be compliant" — that would fail on the
 * first run — but "no token drops below the value it carries today".
 */

// ── WCAG 2.x contrast — sRGB relative luminance ──────────────────────────────

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

describe("WCAG contrast", () => {
  it("measures known pairs", () => {
    expect(contrast(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(contrast(WHITE, WHITE)).toBeCloseTo(1, 5);
    expect(contrast(BLACK, BLACK)).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrast(GP.clay, GP.paper)).toBeCloseTo(contrast(GP.paper, GP.clay), 10);
  });
});

// ── Floor — the shipped measurements, against the palette's own paper ────────

/**
 * Every text-bearing token, measured against the background it actually sits
 * on — paper, never white. Values are TRUNCATED to the lower hundredth: the
 * measurement must stay >= the floor, and rounding up would make the palette
 * fail against itself (ink measures 13.0866, mustard 2.3376).
 *
 * A token deliberately lightened must arrive with its new measurement written
 * in here, i.e. as a stated decision rather than a drift.
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

/** Applies a floor to a token table — extracted so it can be tested. */
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

describe("ratchet — no token regresses below its shipped measurement", () => {
  it.each(Object.entries(DELIVERED_FLOORS))(
    "%s holds its shipped measurement of %s",
    (token, floor) => {
      const hex = GP[token as keyof typeof GP];
      const measured = contrast(hex, GP.paper);
      expect(
        measured,
        `${token} = ${hex} contrasts at ${measured.toFixed(2)} on paper ${GP.paper}, below its shipped measurement of ${floor}. If the lightening is intended, record the new measurement in DELIVERED_FLOORS rather than only changing the colour.`,
      ).toBeGreaterThanOrEqual(floor);
    },
  );

  it("has teeth — lightening a single token fails it", () => {
    const regressed = { ...GP, mustard: "#d9a94f" } as unknown as Record<string, string>;
    expect(floorViolations(regressed, GP.paper, DELIVERED_FLOORS).map((v) => v.token)).toContain(
      "mustard",
    );
  });

  it("reports nothing on the shipped palette", () => {
    const tokens = GP as unknown as Record<string, string>;
    expect(floorViolations(tokens, GP.paper, DELIVERED_FLOORS)).toEqual([]);
  });
});

// ── What the measurement reveals — four text tokens below AA ─────────────────

/**
 * This harness fixes nothing: changing these four values is a design decision,
 * not a test fix. What it does is make the gap measurable and stop it widening.
 * The values are hardcoded — a test that recomputes its own expectation checks
 * nothing.
 */
const AA_BODY_TEXT = 4.5;

const BELOW_AA: Record<string, number> = {
  mustard: 2.34,
  blue: 3.08,
  mute: 3.20,
  olive: 3.93,
};

describe("recorded gap — text-bearing tokens BELOW AA (not fixed by this file)", () => {
  it.each(Object.entries(BELOW_AA))(
    "%s measures %s on paper, below the body-text threshold",
    (token, expected) => {
      const measured = contrast(GP[token as keyof typeof GP], GP.paper);
      expect(measured).toBeCloseTo(expected, 2);
      expect(measured).toBeLessThan(AA_BODY_TEXT);
    },
  );

  /**
   * Named exemption: clay, the primary accent, measures 3.42 on paper. It is
   * only used as text on short icon-adjacent labels, never body copy; where it
   * is a solid fill, white sits on it, and that is the measurement that counts.
   */
  it("exempts the primary accent, but not the white written on it", () => {
    expect(contrast(GP.clay, GP.paper)).toBeLessThan(AA_BODY_TEXT);
    expect(contrast(WHITE, GP.clay)).toBeGreaterThanOrEqual(3.9);
  });

  it("no other text-bearing token is below the threshold without being listed", () => {
    const listed = new Set([...Object.keys(BELOW_AA), "clay"]);
    const unlisted = Object.keys(DELIVERED_FLOORS).filter(
      (token) =>
        !listed.has(token) &&
        contrast(GP[token as keyof typeof GP], GP.paper) < AA_BODY_TEXT,
    );
    expect(unlisted).toEqual([]);
  });
});
