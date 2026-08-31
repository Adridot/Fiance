/**
 * Tests for sync/rsvp.ts — pure RSVP roster and submission helpers.
 * No store references, no Starfish client, no Expo imports.
 */
import { describe, it, expect } from "vitest";
import type { Guest } from '../domain/schema.js';
import {
  buildRsvpRoster,
  mergeSubmissions,
  buildHouseholdRsvpDoc,
  mergeHouseholdSubmission,
  householdRsvpUpdates,
  type RsvpRoster,
  type RsvpSubmission,
} from './rsvp.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: "g1",
    firstName: "Alice",
    lastName: "Dupont",
    side: null,
    invitationType: "FULL",
    rsvpStatus: "PENDING",
    rsvpDate: null,
    rsvpToken: "token-alice",
    isSleeping: null,
    childrenCount: null,
    diet: "STANDARD",
    dietNotes: null,
    groupId: null,
    tableId: null,
    companionId: null,
    noTableNeeded: null,
    giftDescription: null,
    thankYouSent: null,
    thankYouSentDate: null,
    accommodationId: null,
    roomNumber: null,
    email: null,
    phone: null,
    address: null,
    notes: null,
    shuttleVendorId: null,
    shuttlePickupLocation: null,
    shuttlePickupTime: null,
    parkingNeeded: null,
    parkingNotes: null,
    arrivalNotes: null,
    transportMode: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const guestWithToken = makeGuest({ id: "g1", firstName: "Alice", lastName: "Dupont", rsvpToken: "token-alice", invitationType: "FULL" });
const guestWithoutToken = makeGuest({ id: "g2", firstName: "Bob", lastName: "Martin", rsvpToken: null, invitationType: "COCKTAIL" });

// ─── buildRsvpRoster ─────────────────────────────────────────────────────────

describe("buildRsvpRoster", () => {
  it("only includes guests with a rsvpToken", () => {
    const roster = buildRsvpRoster([guestWithToken, guestWithoutToken]);
    expect(roster.guests).toHaveLength(1);
    expect(roster.guests[0].id).toBe("g1");
  });

  it("preserves existing rsvpToken for guests that have one", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    expect(roster.guests[0].rsvpToken).toBe("token-alice");
  });

  it("sets version to 1 and includes a timestamp", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    expect(roster.version).toBe(1);
    expect(new Date(roster.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("includes required fields per entry", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    for (const entry of roster.guests) {
      expect(entry.id).toBeDefined();
      expect(entry.firstName).toBeDefined();
      expect(entry.lastName).toBeDefined();
      expect(entry.rsvpToken).toBeDefined();
      expect(entry.invitationType).toBeDefined();
    }
  });

  it("returns empty guest list when all guests lack tokens", () => {
    const roster = buildRsvpRoster([guestWithoutToken]);
    expect(roster.guests).toHaveLength(0);
  });

  it("returns empty roster for empty guest array", () => {
    const roster = buildRsvpRoster([]);
    expect(roster.guests).toHaveLength(0);
    expect(roster.version).toBe(1);
  });
});

// ─── mergeSubmissions ─────────────────────────────────────────────────────────

describe("mergeSubmissions", () => {
  it("returns unchanged guests and 0 applied for empty submissions", () => {
    const guests = [guestWithToken];
    const { guests: result, applied } = mergeSubmissions(guests, []);
    expect(applied).toBe(0);
    expect(result).toEqual(guests);
  });

  it("applies a matching submission and returns count", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result, applied } = mergeSubmissions([guestWithToken], subs);
    expect(applied).toBe(1);
    const alice = result.find((g) => g.id === "g1");
    expect(alice?.rsvpStatus).toBe("ACCEPTED");
    expect(alice?.rsvpDate).toBe("2026-04-08T10:00:00.000Z");
  });

  it("applies diet when provided", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      diet: "VEGETARIAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result } = mergeSubmissions([guestWithToken], subs);
    const alice = result.find((g) => g.id === "g1");
    expect(alice?.diet).toBe("VEGETARIAN");
  });

  it("skips unknown rsvpToken", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "unknown-token",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result, applied } = mergeSubmissions([guestWithToken], subs);
    expect(applied).toBe(0);
    expect(result[0].rsvpStatus).toBe("PENDING"); // unchanged
  });

  it("processes multiple submissions independently", () => {
    const bob = makeGuest({ id: "g2", rsvpToken: "token-bob", rsvpStatus: "PENDING" });
    const subs: RsvpSubmission[] = [
      { rsvpToken: "token-alice", rsvpStatus: "ACCEPTED", submittedAt: "2026-04-08T10:00:00.000Z" },
      { rsvpToken: "unknown", rsvpStatus: "DECLINED", submittedAt: "2026-04-08T11:00:00.000Z" },
    ];
    const { applied } = mergeSubmissions([guestWithToken, bob], subs);
    expect(applied).toBe(1);
  });

  it("does not mutate original guests array", () => {
    const original = [guestWithToken];
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result } = mergeSubmissions(original, subs);
    expect(result).not.toBe(original);
    expect(original[0].rsvpStatus).toBe("PENDING"); // original unchanged
  });
});

// ─── Household RSVP document ─────────────────────────────────────────────────

describe("household RSVP document", () => {
  const m = (id: string, over: Partial<Guest> = {}): Guest =>
    ({
      id,
      firstName: id.toUpperCase(),
      lastName: "FONTAINES",
      nameParticle: null,
      invitationType: "FULL",
      rsvpStatus: "PENDING",
      rsvpDate: null,
      diet: "STANDARD",
      dietNotes: null,
      isChild: null,
      ...over,
    }) as Guest;

  const five = ["a", "b", "c", "d", "e"].map((id) => m(id));

  it("a household of five carries FIVE members, none of them privileged", () => {
    const doc = buildHouseholdRsvpDoc("h1", five);
    expect(doc.members).toHaveLength(5);
    expect(doc.members.map((x) => x.guestId)).toEqual(["a", "b", "c", "d", "e"]);
    expect(new Set(doc.members.map((x) => Object.keys(x).sort().join(",")))).toHaveLength(1);
  });

  it("a household of ONE has the SAME shape, with no empty companion slot", () => {
    const alone = buildHouseholdRsvpDoc(null, [m("z")]);
    const household = buildHouseholdRsvpDoc("h1", five);
    expect(alone.members).toHaveLength(1);
    expect(Object.keys(alone).sort()).toEqual(Object.keys(household).sort());
    expect(Object.keys(alone.members[0]).sort()).toEqual(Object.keys(household.members[0]).sort());
  });

  it("carries EACH member's invitation type — they may differ within a household", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("b", { invitationType: "COCKTAIL" })]);
    expect(doc.members.map((x) => x.invitationType)).toEqual(["FULL", "COCKTAIL"]);
  });

  it("a member flagged as a child appears by name, like the others", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("kid", { isChild: true })]);
    const child = doc.members.find((x) => x.guestId === "kid")!;
    expect(child.isChild).toBe(true);
    expect(child.firstName).toBe("KID");
    expect("rsvpStatus" in child && "diet" in child).toBe(true);
    expect(JSON.stringify(doc)).not.toContain("childrenCount");
  });

  it("a household accepts for two and declines for the third", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("b"), m("c")]);
    const next = mergeHouseholdSubmission(doc, {
      submittedAt: "2026-09-01T10:00:00.000Z",
      members: [
        { guestId: "a", rsvpStatus: "ACCEPTED", diet: "VEGETARIAN" },
        { guestId: "b", rsvpStatus: "ACCEPTED" },
        { guestId: "c", rsvpStatus: "DECLINED" },
      ],
    });
    expect(next.members.map((x) => x.rsvpStatus)).toEqual(["ACCEPTED", "ACCEPTED", "DECLINED"]);
    expect(next.members.map((x) => x.diet)).toEqual(["VEGETARIAN", "STANDARD", "STANDARD"]);
  });

  it("a PARTIAL submission leaves untouched the members it does not fill in", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("b"), m("c"), m("d")]);
    const next = mergeHouseholdSubmission(doc, {
      submittedAt: "2026-09-01T10:00:00.000Z",
      members: [
        { guestId: "a", rsvpStatus: "ACCEPTED" },
        { guestId: "b", rsvpStatus: "ACCEPTED" },
      ],
    });
    expect(next.members[2].rsvpStatus).toBe("PENDING");
    expect(next.members[3].rsvpStatus).toBe("PENDING");
    expect(next.members[2].rsvpStatus).not.toBe("DECLINED");
    const updates = householdRsvpUpdates(next);
    expect(updates.map((u) => u.guestId)).toEqual(["a", "b"]);
  });

  it("a NEW submission replaces the answer of the members it fills in, and only those", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("b"), m("c")]);
    const first = mergeHouseholdSubmission(doc, {
      submittedAt: "2026-09-01T10:00:00.000Z",
      members: [
        { guestId: "a", rsvpStatus: "ACCEPTED" },
        { guestId: "b", rsvpStatus: "ACCEPTED" },
        { guestId: "c", rsvpStatus: "ACCEPTED" },
      ],
    });
    const second = mergeHouseholdSubmission(first, {
      submittedAt: "2026-09-05T18:00:00.000Z",
      members: [{ guestId: "b", rsvpStatus: "DECLINED" }],
    });
    expect(second.members.map((x) => x.rsvpStatus)).toEqual(["ACCEPTED", "DECLINED", "ACCEPTED"]);
    expect(second.members[0].respondedAt).toBe("2026-09-01T10:00:00.000Z");
    expect(second.members[1].respondedAt).toBe("2026-09-05T18:00:00.000Z");
  });

  it("reports back only the members who ACTUALLY answered", () => {
    const doc = buildHouseholdRsvpDoc("h1", [m("a"), m("silent", { rsvpStatus: null })]);
    const next = mergeHouseholdSubmission(doc, {
      submittedAt: "2026-09-01T10:00:00.000Z",
      members: [{ guestId: "a", rsvpStatus: "ACCEPTED", diet: "VEGAN" }],
    });
    const updates = householdRsvpUpdates(next);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      guestId: "a",
      updates: { rsvpStatus: "ACCEPTED", rsvpDate: "2026-09-01T10:00:00.000Z", diet: "VEGAN" },
    });
  });
});
