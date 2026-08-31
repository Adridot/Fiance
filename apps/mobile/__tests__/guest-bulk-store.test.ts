import { describe, it, expect, vi, beforeEach } from "vitest";

const persistGuests = vi.fn();
const persistCommunications = vi.fn();
const persistWeddingRoleAssignments = vi.fn();
const persistSeatingConstraints = vi.fn();
const persistMealSelections = vi.fn();
const notifySync = vi.fn();

// Non-null on purpose: a null storage would short-circuit every `persist*`, and
// the "writes only once" tests would stop proving anything.
vi.mock("@/lib/kv-storage", () => ({ getStorage: () => ({}) }));
vi.mock("@/lib/persistence", () => ({
  persistGuests: (...a: unknown[]) => persistGuests(...a),
  persistTables: vi.fn(),
  persistGroups: vi.fn(),
  persistHouseholds: vi.fn(),
  persistCommunications: (...a: unknown[]) => persistCommunications(...a),
  persistWeddingRoleAssignments: (...a: unknown[]) => persistWeddingRoleAssignments(...a),
  persistSeatingConstraints: (...a: unknown[]) => persistSeatingConstraints(...a),
  persistMealSelections: (...a: unknown[]) => persistMealSelections(...a),
}));
vi.mock("@/lib/starfish", () => ({ notifySync: () => notifySync() }));
vi.mock("@/lib/store-review", () => ({ maybeRequestReview: vi.fn() }));

import { useGuestsStore } from "@/store/useGuestsStore";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";

// ─── Fixture ─────────────────────────────────────────────────────────────────
// "a" leaves its companion "b" behind; "c" and "d" leave as a whole couple.

const guest = (id: string, companionId: string | null = null) =>
  ({
    id,
    firstName: id,
    lastName: id.toUpperCase(),
    companionId,
    rsvpStatus: "PENDING",
    rsvpDate: null,
    invitationType: "FULL",
  }) as never;

const TARGETS = ["a", "c", "d", "e"];

function seed() {
  useGuestsStore.setState({
    guests: [guest("a", "b"), guest("b", "a"), guest("c", "d"), guest("d", "c"), guest("e"), guest("f")],
    tables: [],
    groups: [],
    households: [],
  });
  useCommunicationsStore.setState({
    communications: [
      {
        id: "comm-1",
        recipients: [{ guestId: "a" }, { guestId: "e" }, { guestId: "f" }],
      },
    ] as never,
  });
  useWeddingPartyStore.setState({
    weddingRoleAssignments: [
      { id: "ra-1", guestId: "c", roleId: "r" },
      { id: "ra-2", guestId: "f", roleId: "r" },
    ] as never,
  });
  useSeatingConstraintsStore.setState({
    seatingConstraints: [
      { id: "sc-1", guestIds: ["a", "b", "f"], type: "TOGETHER" },
      { id: "sc-2", guestIds: ["c", "f"], type: "APART" },
    ] as never,
  });
  useMealSelectionsStore.setState({
    mealSelections: [
      { id: "ms-1", guestId: "d" },
      { id: "ms-2", guestId: "b" },
    ] as never,
  });
}

/** The five collections, timestamps stripped — they differ between the two runs. */
function snapshot() {
  const withoutTimestamp = (xs: unknown[]) =>
    xs.map((x) => {
      const { updatedAt, ...rest } = x as Record<string, unknown>;
      return rest;
    });
  return {
    guests: withoutTimestamp(useGuestsStore.getState().guests),
    communications: withoutTimestamp(useCommunicationsStore.getState().communications),
    roleAssignments: withoutTimestamp(useWeddingPartyStore.getState().weddingRoleAssignments),
    seatingConstraints: withoutTimestamp(useSeatingConstraintsStore.getState().seatingConstraints),
    mealSelections: withoutTimestamp(useMealSelectionsStore.getState().mealSelections),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  seed();
});

describe("removeGuests — equivalence with the matching single deletions", () => {
  it("leaves the same complete state, all four cascades included", () => {
    useGuestsStore.getState().removeGuests(TARGETS);
    const inBatch = snapshot();

    seed();
    for (const id of TARGETS) useGuestsStore.getState().removeGuest(id);
    const oneByOne = snapshot();

    expect(inBatch).toEqual(oneByOne);
  });

  // Both sides run the same body, so the state comparison above is blind to a
  // cascade nobody plays any more. These assertions are not: they name the one
  // that went missing.
  describe("every cascade is played by the batch", () => {
    beforeEach(() => useGuestsStore.getState().removeGuests(TARGETS));

    it("the guests go, and the companion left behind loses its link", () => {
      const remaining = useGuestsStore.getState().guests;
      expect(remaining.map((g) => g.id)).toEqual(["b", "f"]);
      expect(remaining.find((g) => g.id === "b")?.companionId).toBeNull();
    });

    it("communication recipients", () => {
      const recipients = useCommunicationsStore.getState().communications[0].recipients;
      expect(recipients.map((r) => r.guestId)).toEqual(["f"]);
    });

    it("wedding-party roles", () => {
      expect(
        useWeddingPartyStore.getState().weddingRoleAssignments.map((a) => a.id),
      ).toEqual(["ra-2"]);
    });

    it("seating constraints, including those falling under two guests", () => {
      const constraints = useSeatingConstraintsStore.getState().seatingConstraints;
      expect(constraints.map((c) => c.id)).toEqual(["sc-1"]);
      expect(constraints[0].guestIds).toEqual(["b", "f"]);
    });

    it("meal selections", () => {
      expect(useMealSelectionsStore.getState().mealSelections.map((s) => s.id)).toEqual([
        "ms-2",
      ]);
    });
  });
});

describe("a batch action writes only once", () => {
  it("removeGuests: one persist per touched collection, one sync notification", () => {
    useGuestsStore.getState().removeGuests(TARGETS);
    expect(persistGuests).toHaveBeenCalledTimes(1);
    expect(persistCommunications).toHaveBeenCalledTimes(1);
    expect(persistWeddingRoleAssignments).toHaveBeenCalledTimes(1);
    expect(persistSeatingConstraints).toHaveBeenCalledTimes(1);
    expect(persistMealSelections).toHaveBeenCalledTimes(1);
    expect(notifySync).toHaveBeenCalledTimes(1);
  });

  it("updateGuests: a single persistGuests, a single notification", () => {
    useGuestsStore.getState().updateGuests(["a", "b", "f"], () => ({ rsvpStatus: "ACCEPTED" }));
    expect(persistGuests).toHaveBeenCalledTimes(1);
    expect(notifySync).toHaveBeenCalledTimes(1);
  });

  it("an empty batch neither writes nor notifies", () => {
    useGuestsStore.getState().removeGuests([]);
    useGuestsStore.getState().updateGuests([], () => ({}));
    expect(persistGuests).not.toHaveBeenCalled();
    expect(notifySync).not.toHaveBeenCalled();
  });
});

describe("updateGuests — each guest gets its own patch", () => {
  it("two guests of the batch can receive different values", () => {
    useGuestsStore
      .getState()
      .updateGuests(["a", "b"], (g) => ({ rsvpStatus: g.id === "a" ? "ACCEPTED" : "DECLINED" }));
    const byId = new Map(useGuestsStore.getState().guests.map((g) => [g.id, g]));
    expect(byId.get("a")?.rsvpStatus).toBe("ACCEPTED");
    expect(byId.get("b")?.rsvpStatus).toBe("DECLINED");
    expect(byId.get("f")?.rsvpStatus).toBe("PENDING");
  });
});

describe("the single-guest actions go through the batch and cannot diverge from it", () => {
  it("removing an accompanied guest from its own screen leaves the companion, without the link", () => {
    useGuestsStore.getState().removeGuest("a");
    const remaining = useGuestsStore.getState().guests;
    expect(remaining.map((g) => g.id)).toEqual(["b", "c", "d", "e", "f"]);
    expect(remaining.find((g) => g.id === "b")?.companionId).toBeNull();
    expect(
      useCommunicationsStore.getState().communications[0].recipients.map((r) => r.guestId),
    ).toEqual(["e", "f"]);
  });

  it("updateGuest applies its patch", () => {
    useGuestsStore.getState().updateGuest("f", { rsvpStatus: "DECLINED" });
    expect(useGuestsStore.getState().guests.find((g) => g.id === "f")?.rsvpStatus).toBe(
      "DECLINED",
    );
  });
});
