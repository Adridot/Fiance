import { describe, it, expect, beforeEach, vi } from "vitest";

// The shared `expo-crypto` mock has no `randomUUID`, and households mint ids.
// A predictable series is what lets a test assert an id is FRESH, not a guest's.
let counter = 0;
vi.mock("expo-crypto", () => ({
  randomUUID: () => `uuid-${++counter}`,
  getRandomBytes: (size: number) => new Uint8Array(size),
}));

vi.mock("@/lib/kv-storage", () => ({ getStorage: () => ({}) }));
vi.mock("@/lib/persistence", () => ({
  persistGuests: vi.fn(),
  persistTables: vi.fn(),
  persistGroups: vi.fn(),
  persistHouseholds: vi.fn(),
  persistCommunications: vi.fn(),
  persistWeddingRoleAssignments: vi.fn(),
  persistSeatingConstraints: vi.fn(),
  persistMealSelections: vi.fn(),
}));
vi.mock("@/lib/starfish", () => ({ notifySync: vi.fn() }));
vi.mock("@/lib/store-review", () => ({ maybeRequestReview: vi.fn() }));

import { useGuestsStore } from "@/store/useGuestsStore";
import { recipients, householdCategory } from "@fiance/sdk";

const mkGuest = (id: string, lastName: string, householdId: string | null = null) =>
  ({
    id,
    firstName: id,
    lastName,
    nameParticle: null,
    householdId,
    rsvpStatus: "PENDING",
    invitationType: "FULL",
    groupId: "g1",
  }) as never;

beforeEach(() => {
  useGuestsStore.setState({ guests: [], tables: [], groups: [], households: [] });
});

describe("materializing a household", () => {
  it("keeps the id its members already carry, and detaches nobody", () => {
    useGuestsStore.setState({
      guests: [mkGuest("a", "FLEITH", "h-seeded"), mkGuest("b", "FLEITH", "h-seeded")],
      households: [],
    });

    const id = useGuestsStore.getState().materializeHousehold(["a", "b"], { address: "3 rue Sainte" });

    expect(id).toBe("h-seeded");
    const { households, guests } = useGuestsStore.getState();
    expect(households.map((h) => h.id)).toEqual(["h-seeded"]);
    expect(households[0].address).toBe("3 rue Sainte");
    expect(guests.map((g) => g.householdId)).toEqual(["h-seeded", "h-seeded"]);
  });

  it("creates a fresh household when no member is attached — never under a guest id", () => {
    useGuestsStore.setState({ guests: [mkGuest("guest-1", "MERY")], households: [] });

    const id = useGuestsStore.getState().materializeHousehold(["guest-1"], { address: "9 quai Rive-Neuve" });

    const { households, guests } = useGuestsStore.getState();
    expect(id).not.toBe("guest-1");
    expect(households).toHaveLength(1);
    expect(households[0].id).toBe(id);
    expect(guests[0].householdId).toBe(id);
  });

  it("updates the existing entity rather than making a second one", () => {
    useGuestsStore.setState({
      guests: [mkGuest("a", "FLEITH", "h1")],
      households: [{ id: "h1", name: "FLEITH", address: null, createdAt: null, updatedAt: null }] as never,
    });

    useGuestsStore.getState().materializeHousehold(["a"], { address: "3 rue Sainte" });

    const { households } = useGuestsStore.getState();
    expect(households).toHaveLength(1);
    expect(households[0]).toMatchObject({ id: "h1", name: "FLEITH", address: "3 rue Sainte" });
  });
});

describe("`updateHousehold` NEVER creates anything", () => {
  it("leaves the household list untouched when the entity does not exist", () => {
    useGuestsStore.setState({ guests: [mkGuest("a", "FLEITH", "h-seeded")], households: [] });

    useGuestsStore.getState().updateHousehold("h-seeded", { address: "3 rue Sainte" });

    expect(useGuestsStore.getState().households).toEqual([]);
  });
});

describe("the reducers already written are exposed as they are", () => {
  it("merges, splits and removes without any entity being required", () => {
    useGuestsStore.setState({
      guests: [mkGuest("a", "FLEITH"), mkGuest("b", "DURAND"), mkGuest("c", "MERY")],
      households: [],
    });
    const store = () => useGuestsStore.getState();

    const h = store().createHousehold(["a", "b"]);
    store().attachToHousehold(["c"], h);
    expect(store().guests.map((g) => g.householdId)).toEqual([h, h, h]);

    const fresh = store().splitHousehold(["c"]);
    expect(fresh).not.toBe(h);
    expect(store().guests.find((g) => g.id === "c")!.householdId).toBe(fresh);
    expect(store().guests.find((g) => g.id === "a")!.householdId).toBe(h);

    store().removeHousehold(h);
    expect(store().guests).toHaveLength(3);
    expect(store().guests.filter((g) => g.householdId === h)).toHaveLength(0);
    expect(store().households.some((x) => x.id === h)).toBe(false);
  });
});

describe("a recipient is counted per household, never per person", () => {
  it("one row per referenced household, plus one per guest without a household", () => {
    useGuestsStore.setState({
      guests: [
        mkGuest("a", "FLEITH", "h1"),
        mkGuest("b", "FLEITH", "h1"),
        mkGuest("c", "MERY", "h2"),
        mkGuest("d", "MERY", "h2"),
        mkGuest("e", "MERY", "h2"),
        mkGuest("f", "PORTIER"),
      ],
      households: [],
    });
    const { guests, households } = useGuestsStore.getState();

    const householdIds = new Set(guests.map((g) => g.householdId).filter(Boolean));
    const loners = guests.filter((g) => !g.householdId).length;
    const rows = recipients(households, guests);

    expect(rows).toHaveLength(householdIds.size + loners);
    expect(rows.filter((d) => d.id === "h2")).toHaveLength(1);
    expect(rows.find((d) => d.id === "h2")!.members).toHaveLength(3);
    expect(rows.every((d) => d.address === null)).toBe(true);
  });

  it("a household spanning two categories has none, and is counted once", () => {
    useGuestsStore.setState({
      guests: [
        { ...(mkGuest("a", "FLEITH", "h1") as Record<string, unknown>), groupId: "fontaines" },
        { ...(mkGuest("b", "DURAND", "h1") as Record<string, unknown>), groupId: "amis" },
        { ...(mkGuest("c", "MERY", "h2") as Record<string, unknown>), groupId: "amis" },
      ] as never,
      households: [],
    });
    const { guests, households } = useGuestsStore.getState();
    const rows = recipients(households, guests);

    const mixed = rows.find((d) => d.id === "h1")!;
    expect(householdCategory(mixed.members)).toBeNull();
    expect(rows.filter((d) => d.id === "h1")).toHaveLength(1);
    expect(householdCategory(rows.find((d) => d.id === "h2")!.members)).toBe("amis");
  });
});

describe("splitting and removing from a household screen", () => {
  it("six members split by three make two households of three, each its own recipient", () => {
    useGuestsStore.setState({
      guests: Array.from({ length: 6 }, (_, i) => mkGuest(`g${i}`, "LA GASTINES", "h1")),
      households: [],
    });

    const fresh = useGuestsStore.getState().splitHousehold(["g0", "g1", "g2"]);

    const { guests, households } = useGuestsStore.getState();
    expect(guests.filter((g) => g.householdId === fresh)).toHaveLength(3);
    expect(guests.filter((g) => g.householdId === "h1")).toHaveLength(3);
    const rows = recipients(households, guests);
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((d) => d.id))).toEqual(new Set([fresh, "h1"]));
  });

  it("removing a household of four leaves the four guests household-less, and takes the address with it", () => {
    useGuestsStore.setState({
      guests: ["a", "b", "c", "d"].map((i) => mkGuest(i, "MERY", "h1")),
      households: [
        { id: "h1", name: "MERY", address: "3 rue Sainte", createdAt: null, updatedAt: null },
      ] as never,
    });

    useGuestsStore.getState().removeHousehold("h1");

    const { guests, households } = useGuestsStore.getState();
    expect(guests).toHaveLength(4);
    expect(guests.every((g) => g.householdId === null)).toBe(true);
    expect(households).toHaveLength(0);
    const rows = recipients(households, guests);
    expect(rows).toHaveLength(4);
    expect(rows.every((d) => d.address === null)).toBe(true);
  });
});
