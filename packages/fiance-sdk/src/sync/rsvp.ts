/**
 * RSVP sync — pure types and transforms.
 * No React hooks, no store references, no Expo imports.
 * The app-side lib/rsvp-sync.ts handles store reads, Crypto, and Starfish calls.
 */

// NodeNext .js extension required
import type { Guest } from '../domain/schema.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RsvpRosterEntry {
  id: string;
  firstName: string;
  lastName: string;
  rsvpToken: string;
  invitationType: string;
  companionId?: string | null;
}

export interface RsvpRoster {
  version: 1;
  timestamp: string;
  guests: RsvpRosterEntry[];
}

export interface RsvpSubmission {
  rsvpToken: string;
  rsvpStatus: string;
  diet?: string;
  dietNotes?: string;
  plusOneRsvpStatus?: string;
  plusOneDiet?: string;
  childrenCount?: number;
  submittedAt: string;
}

// ─── Pure builders ───────────────────────────────────────────────────────────

/**
 * Build the public roster document from a guest array.
 * Guests without an rsvpToken are mapped with their existing token (null/undefined).
 * Token assignment (if needed) must be done app-side before calling this.
 */
export function buildRsvpRoster(guests: Guest[]): RsvpRoster {
  const rosterGuests: RsvpRosterEntry[] = guests
    .filter((g): g is Guest & { rsvpToken: string } => typeof g.rsvpToken === "string" && g.rsvpToken.length > 0)
    .map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      rsvpToken: g.rsvpToken,
      invitationType: g.invitationType,
      companionId: g.companionId ?? null,
    }));

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    guests: rosterGuests,
  };
}

/**
 * Apply RSVP submissions to a guest array (pure transform).
 * Returns updated guests array + count of applied submissions.
 */
export function mergeSubmissions(
  guests: Guest[],
  submissions: RsvpSubmission[]
): { guests: Guest[]; applied: number } {
  let applied = 0;
  const updatedGuests = [...guests];

  for (const sub of submissions) {
    const idx = updatedGuests.findIndex((g) => g.rsvpToken === sub.rsvpToken);
    if (idx < 0) continue;

    const guest = updatedGuests[idx];
    const updates: Partial<Guest> = {
      rsvpStatus: sub.rsvpStatus,
      rsvpDate: sub.submittedAt,
    };
    if (sub.diet) updates.diet = sub.diet;
    if (sub.dietNotes) updates.dietNotes = sub.dietNotes;
    if (sub.childrenCount != null) updates.childrenCount = sub.childrenCount;

    updatedGuests[idx] = { ...guest, ...updates };
    applied++;

    // Apply +1 companion RSVP if provided
    if (sub.plusOneRsvpStatus && guest.companionId) {
      const cIdx = updatedGuests.findIndex((g) => g.id === guest.companionId);
      if (cIdx >= 0) {
        const companionUpdates: Partial<Guest> = {
          rsvpStatus: sub.plusOneRsvpStatus,
          rsvpDate: sub.submittedAt,
        };
        if (sub.plusOneDiet) companionUpdates.diet = sub.plusOneDiet;
        updatedGuests[cIdx] = { ...updatedGuests[cIdx], ...companionUpdates };
      }
    }
  }

  return { guests: updatedGuests, applied };
}

// ─── Household RSVP document ─────────────────────────────────────────────────

export interface RsvpMember {
  guestId: string;
  // Empty STRING, never `null`, for a missing part — that is what lets
  // `formatGuestName` compose a member's name exactly as it composes a guest's,
  // particle included, instead of the form recomposing one by hand.
  firstName: string;
  lastName: string;
  nameParticle?: string | null;
  invitationType: string | null;
  /**
   * The invitation label, seeded alongside the rest: the public form has no way
   * to resolve an invitation-type id — invitation types live in a sealed space
   * collection an invite-link holder cannot read.
   */
  invitationLabel?: string | null;
  isChild?: boolean | null;
  rsvpStatus: string | null;
  diet: string | null;
  dietNotes?: string | null;
  respondedAt?: string | null;
}

/**
 * `householdId` is null for a guest with no household: the node is then keyed on
 * the guest id, and the document keeps the exact same shape with a single member.
 */
export interface HouseholdRsvpDoc {
  version: 2;
  householdId: string | null;
  members: RsvpMember[];
  submittedAt: string | null;
}

/** A submission may carry any subset of the members. */
export interface HouseholdRsvpSubmission {
  members: Array<Pick<RsvpMember, 'guestId' | 'rsvpStatus'> & Partial<Pick<RsvpMember, 'diet' | 'dietNotes'>>>;
  submittedAt: string;
}

export function rsvpMemberFromGuest(g: Guest, labels?: Record<string, string>): RsvpMember {
  return {
    guestId: g.id,
    firstName: g.firstName ?? '',
    lastName: g.lastName ?? '',
    nameParticle: g.nameParticle ?? null,
    invitationType: g.invitationType ?? null,
    invitationLabel: (g.invitationType && labels?.[g.invitationType]) || null,
    isChild: g.isChild ?? null,
    rsvpStatus: g.rsvpStatus ?? null,
    diet: g.diet ?? null,
    dietNotes: g.dietNotes ?? null,
    respondedAt: g.rsvpDate ?? null,
  };
}

export function buildHouseholdRsvpDoc(
  householdId: string | null,
  members: Guest[],
  labels?: Record<string, string>,
): HouseholdRsvpDoc {
  return {
    version: 2,
    householdId,
    members: members.map((g) => rsvpMemberFromGuest(g, labels)),
    submittedAt: null,
  };
}

export function mergeHouseholdSubmission(
  doc: HouseholdRsvpDoc,
  submission: HouseholdRsvpSubmission,
): HouseholdRsvpDoc {
  const byGuest = new Map(submission.members.map((m) => [m.guestId, m]));
  return {
    ...doc,
    members: doc.members.map((m) => {
      const answer = byGuest.get(m.guestId);
      if (!answer) return m;
      return {
        ...m,
        rsvpStatus: answer.rsvpStatus,
        diet: answer.diet !== undefined ? answer.diet : m.diet,
        dietNotes: answer.dietNotes !== undefined ? answer.dietNotes : m.dietNotes,
        respondedAt: submission.submittedAt,
      };
    }),
    submittedAt: submission.submittedAt,
  };
}

export function householdRsvpUpdates(
  doc: HouseholdRsvpDoc,
): Array<{ guestId: string; updates: Partial<Guest>; respondedAt: string }> {
  const out: Array<{ guestId: string; updates: Partial<Guest>; respondedAt: string }> = [];
  for (const m of doc.members) {
    // The MEMBER's timestamp, never the document's. Falling back on
    // `doc.submittedAt` would report the silent members of a partial submission
    // as having answered at the others' submission time.
    const when = m.respondedAt;
    if (!m.rsvpStatus || !when) continue;
    const updates: Partial<Guest> = { rsvpStatus: m.rsvpStatus, rsvpDate: when };
    if (m.diet) updates.diet = m.diet;
    if (m.dietNotes) updates.dietNotes = m.dietNotes;
    out.push({ guestId: m.guestId, updates, respondedAt: when });
  }
  return out;
}
