/**
 * Tests for lib/rsvp-sync.ts — v3 starfish-spaces implementation.
 *
 * Tests focus on the pure helpers (rsvpNodeId, applyHouseholdRsvpDocs)
 * that don't require a live session.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Guest store mock ────────────────────────────────────────────────────────

const mockUpdateGuest = vi.fn();
const mockGuests = [
  {
    id: "g1",
    firstName: "Alice",
    lastName: "Dupont",
    invitationType: "FULL",
    rsvpStatus: null as string | null,
    rsvpDate: null as string | null,
    diet: "STANDARD",
    companionId: null as string | null,
  },
  {
    id: "g2",
    firstName: "Bob",
    lastName: "Martin",
    invitationType: "COCKTAIL",
    rsvpStatus: null as string | null,
    rsvpDate: null as string | null,
    diet: "STANDARD",
    companionId: null as string | null,
  },
];

vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: {
    getState: () => ({
      guests: mockGuests,
      households: [],
      updateGuest: mockUpdateGuest,
    }),
  },
}));

vi.mock("@/store/useInvitationTypesStore", () => ({
  useInvitationTypesStore: { getState: () => ({ invitationTypes: [] }) },
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

vi.mock("@/lib/public-page", () => ({
  publicPageNodeId: (weddingNodeId: string) => `pub-${weddingNodeId}`,
  getPublicPageInviteLink: vi.fn(),
  ensurePublicPageNode: vi.fn().mockResolvedValue("pub-w1"),
}));

// The pure household-document helpers come from the real SDK: stubbing them out
// would leave these tests asserting nothing.
vi.mock("@fiance/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@fiance/sdk")>();
  return {
    ...actual,
    updateObjectIndex: vi.fn().mockResolvedValue(undefined),
    getNodeAccess: vi.fn(),
    objInvPush: vi.fn().mockReturnValue("/objinv/path"),
    objInvPull: vi.fn().mockReturnValue("/objinv/path"),
    createNodeInviteLink: vi.fn().mockResolvedValue({ token: {}, link: "" }),
    rsvpToNode: vi.fn().mockReturnValue({ id: "rsvp-g1", type: "rsvp", parentId: "pub-w1", title: "", access: "invite", enc: false, contentKind: "merge" }),
  };
});

vi.mock("@/lib/guest-link", () => ({
  encodeGuestLink: vi.fn().mockReturnValue("https://example.com/wedding/combined-token"),
}));

import { rsvpNodeId, applyHouseholdRsvpDocs, type HouseholdRsvpDoc } from "@/lib/rsvp-sync";

const doc = (
  members: Array<{
    guestId: string;
    rsvpStatus: string | null;
    diet?: string | null;
    dietNotes?: string | null;
    respondedAt?: string | null;
  }>,
  householdId: string | null = "h1",
): HouseholdRsvpDoc =>
  ({
    version: 2,
    householdId,
    members: members.map((m) => ({
      firstName: "",
      lastName: "",
      invitationType: null,
      diet: null,
      ...m,
    })),
    submittedAt: members.find((m) => m.respondedAt)?.respondedAt ?? null,
  }) as HouseholdRsvpDoc;

// ─── rsvpNodeId ──────────────────────────────────────────────────────────────

describe("rsvpNodeId", () => {
  it("prefixes the RECIPIENT id — household or guest alike", () => {
    expect(rsvpNodeId("g1")).toBe("rsvp-g1");
    expect(rsvpNodeId("abc-123")).toBe("rsvp-abc-123");
    expect(rsvpNodeId("h-fontaines")).toBe("rsvp-h-fontaines");
  });
});

// ─── applyHouseholdRsvpDocs ──────────────────────────────────────────────────

describe("applyHouseholdRsvpDocs", () => {
  beforeEach(() => {
    mockUpdateGuest.mockClear();
    for (const g of mockGuests) {
      g.rsvpStatus = null;
      g.rsvpDate = null;
      g.diet = "STANDARD";
      g.companionId = null;
    }
  });

  it("applies nothing without a document", () => {
    expect(applyHouseholdRsvpDocs([])).toBe(0);
  });

  it("ignores a member unknown to the guest list", () => {
    const n = applyHouseholdRsvpDocs([
      doc([{ guestId: "unknown", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" }]),
    ]);
    expect(n).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("ignores a member with no answer or no timestamp", () => {
    expect(
      applyHouseholdRsvpDocs([
        doc([
          { guestId: "g1", rsvpStatus: null, respondedAt: "2026-09-01T10:00:00Z" },
          { guestId: "g2", rsvpStatus: "ACCEPTED", respondedAt: null },
        ]),
      ]),
    ).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("applies a member's answer and diet", () => {
    const n = applyHouseholdRsvpDocs([
      doc([
        {
          guestId: "g1",
          rsvpStatus: "ACCEPTED",
          diet: "VEGETARIAN",
          dietNotes: "no nuts",
          respondedAt: "2026-09-01T10:00:00Z",
        },
      ]),
    ]);
    expect(n).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", {
      rsvpStatus: "ACCEPTED",
      rsvpDate: "2026-09-01T10:00:00Z",
      diet: "VEGETARIAN",
      dietNotes: "no nuts",
    });
  });

  it("a household accepts for one and declines for the other, in ONE document", () => {
    const n = applyHouseholdRsvpDocs([
      doc([
        { guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" },
        { guestId: "g2", rsvpStatus: "DECLINED", respondedAt: "2026-09-01T10:00:00Z" },
      ]),
    ]);
    expect(n).toBe(2);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({ rsvpStatus: "ACCEPTED" }));
    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", expect.objectContaining({ rsvpStatus: "DECLINED" }));
  });

  it("a SILENT member is not updated, hence not treated as having declined", () => {
    const n = applyHouseholdRsvpDocs([
      doc([
        { guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" },
        // Seeded from the guest record — pending, never answered.
        { guestId: "g2", rsvpStatus: "PENDING", respondedAt: null },
      ]),
    ]);
    expect(n).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledTimes(1);
    expect(mockUpdateGuest).not.toHaveBeenCalledWith("g2", expect.anything());
  });

  it("applies several household documents in a single pass", () => {
    const n = applyHouseholdRsvpDocs([
      doc([{ guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" }], "h1"),
      doc([{ guestId: "g2", rsvpStatus: "DECLINED", respondedAt: "2026-09-01T11:00:00Z" }], null),
    ]);
    expect(n).toBe(2);
  });
});

// ─── Bug A regression: idempotent re-apply — a manual edit must not be reverted ────
//
// applyHouseholdRsvpDocs runs on EVERY hydrate and EVERY app foreground. Without
// this guard a manual edit made on another device is overwritten by the now-stale
// public-page submission, then re-pushed to the server by updateGuest's
// notifySync() — clobbering the edit for everyone.

describe("applyHouseholdRsvpDocs — idempotent re-apply (Bug A regression)", () => {
  beforeEach(() => {
    mockUpdateGuest.mockClear();
    for (const g of mockGuests) {
      g.rsvpStatus = null;
      g.rsvpDate = null;
      g.diet = "STANDARD";
      g.companionId = null;
    }
  });

  it("applies an answer to a guest record that carries none", () => {
    const n = applyHouseholdRsvpDocs([
      doc([{ guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" }]),
    ]);
    expect(n).toBe(1);
  });

  it("does NOT apply an answer older than what the guest record carries", () => {
    mockGuests[0].rsvpStatus = "DECLINED";
    mockGuests[0].rsvpDate = "2026-09-05T12:00:00Z"; // manual edit, newer
    const n = applyHouseholdRsvpDocs([
      doc([{ guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" }]),
    ]);
    expect(n).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("does NOT apply the same answer twice", () => {
    mockGuests[0].rsvpStatus = "ACCEPTED";
    mockGuests[0].rsvpDate = "2026-09-01T10:00:00Z";
    const d = doc([{ guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" }]);
    applyHouseholdRsvpDocs([d]);
    applyHouseholdRsvpDocs([d]);
    applyHouseholdRsvpDocs([d]);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("applies a STRICTLY newer answer — the household corrected itself", () => {
    mockGuests[0].rsvpStatus = "ACCEPTED";
    mockGuests[0].rsvpDate = "2026-09-01T10:00:00Z";
    const n = applyHouseholdRsvpDocs([
      doc([{ guestId: "g1", rsvpStatus: "DECLINED", respondedAt: "2026-09-05T18:00:00Z" }]),
    ]);
    expect(n).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({ rsvpStatus: "DECLINED" }));
  });

  it("the guard is per MEMBER: one member's edit does not block another", () => {
    mockGuests[0].rsvpStatus = "DECLINED";
    mockGuests[0].rsvpDate = "2026-09-05T12:00:00Z"; // g1 edited by hand
    const n = applyHouseholdRsvpDocs([
      doc([
        { guestId: "g1", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" },
        { guestId: "g2", rsvpStatus: "ACCEPTED", respondedAt: "2026-09-01T10:00:00Z" },
      ]),
    ]);
    expect(n).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledTimes(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", expect.objectContaining({ rsvpStatus: "ACCEPTED" }));
  });
});
