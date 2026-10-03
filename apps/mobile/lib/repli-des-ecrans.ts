export type PileAvecRetour = "guests" | "planning" | "vendors";

const PILES: Record<
  PileAvecRetour,
  { racine: string; sansRetour: readonly string[]; parents: Record<string, string> }
> = {
  guests: {
    racine: "/(tabs)/guests",
    sansRetour: ["index", "seating"],
    parents: {
      "household/[id]": "/(tabs)/guests/households",
      tables: "/(tabs)/guests/table-management",
      "communication/[id]": "/(tabs)/guests/communications",
      "communications/templates": "/(tabs)/guests/communications",
    },
  },
  planning: {
    racine: "/(tabs)/planning",
    sansRetour: ["index", "agenda", "day-of"],
    parents: {
      "agenda-event": "/(tabs)/planning/agenda",
      "day-of-item": "/(tabs)/planning/day-of",
      "ceremony-item": "/(tabs)/planning/ceremony",
      speech: "/(tabs)/planning/speeches-music",
    },
  },
  vendors: {
    racine: "/(tabs)/vendors",
    sansRetour: ["index"],
    parents: {},
  },
};

export function afficheUnRetour(pile: PileAvecRetour, ecran: string): boolean {
  return !PILES[pile].sansRetour.includes(ecran);
}

export function repliDe(pile: PileAvecRetour, ecran: string): string {
  const p = PILES[pile];
  return p.parents[ecran] ?? p.racine;
}
