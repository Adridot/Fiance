import type { Communication, Guest, Household } from './schema.js';
import { recipients as householdRecipients, type Recipient } from './households.js';

export function addCommunication(communications: Communication[], communication: Communication): Communication[] {
  return [...communications, communication];
}

export function updateCommunication(
  communications: Communication[],
  id: string,
  updates: Partial<Communication>,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c));
}

export function removeCommunication(communications: Communication[], id: string): Communication[] {
  return communications.filter((c) => c.id !== id);
}

export function toggleRecipient(
  communications: Communication[],
  commId: string,
  guestId: string,
  today: string,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    if (c.id !== commId) return c;
    const already = c.recipients.some((r) => r.guestId === guestId);
    const recipients = already
      ? c.recipients.filter((r) => r.guestId !== guestId)
      : [...c.recipients, { guestId, sentAt: today }];
    return { ...c, recipients, updatedAt: now };
  });
}

export function setRecipientDate(
  communications: Communication[],
  commId: string,
  guestId: string,
  sentAt: string | null,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    if (c.id !== commId) return c;
    const recipients = c.recipients.map((r) => (r.guestId === guestId ? { ...r, sentAt } : r));
    return { ...c, recipients, updatedAt: now };
  });
}

export function bulkSetRecipients(
  communications: Communication[],
  commId: string,
  guestIds: string[],
  sentAt: string | null,
): Communication[] {
  const now = new Date().toISOString();
  const idSet = new Set(guestIds);
  return communications.map((c) => {
    if (c.id !== commId) return c;
    if (sentAt === null) {
      return { ...c, recipients: c.recipients.filter((r) => !idSet.has(r.guestId)), updatedAt: now };
    }
    const existingIds = new Set(c.recipients.map((r) => r.guestId));
    const updated = c.recipients.map((r) => (idSet.has(r.guestId) ? { ...r, sentAt } : r));
    const toAdd = guestIds.filter((id) => !existingIds.has(id)).map((guestId) => ({ guestId, sentAt }));
    return { ...c, recipients: [...updated, ...toAdd], updatedAt: now };
  });
}

export function removeGuestFromAll(communications: Communication[], guestId: string): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    const had = c.recipients.some((r) => r.guestId === guestId);
    if (!had) return c;
    return { ...c, recipients: c.recipients.filter((r) => r.guestId !== guestId), updatedAt: now };
  });
}


// ─── The recipient is the HOUSEHOLD ──────────────────────────────────────────
//
// Storage stays PER GUEST: `Communication.recipients` is unchanged, and the two
// functions below FOLD the per-guest operations instead of rewriting them, so a
// send to a household and four sends to its four members cannot diverge.

export interface HouseholdRecipientRow<G> extends Recipient<G> {
  sent: boolean;
  /** Sent for some members only — a household formed after the send. */
  partial: boolean;
  sentAt: string | null;
}

export function communicationRecipientRows<
  G extends Pick<Guest, 'id' | 'firstName' | 'lastName' | 'nameParticle' | 'householdId'>,
>(
  households: Household[],
  guests: G[],
  communication: Pick<Communication, 'recipients'>,
): HouseholdRecipientRow<G>[] {
  const byGuest = new Map(communication.recipients.map((r) => [r.guestId, r.sentAt]));
  return householdRecipients(households, guests).map((dest) => {
    const sentMembers = dest.members.filter((m) => byGuest.has(m.id));
    const dates = new Set(sentMembers.map((m) => byGuest.get(m.id) ?? null));
    return {
      ...dest,
      sent: sentMembers.length === dest.members.length && dest.members.length > 0,
      partial: sentMembers.length > 0 && sentMembers.length < dest.members.length,
      sentAt: dates.size === 1 ? [...dates][0] : null,
    };
  });
}

/**
 * Toggles the send for a WHOLE household.
 *
 * A partially sent household carries `sent: false`, so it completes rather than
 * clears — the expected gesture once the shortfall is noticed.
 */
export function toggleHouseholdRecipients(
  communications: Communication[],
  commId: string,
  memberIds: string[],
  today: string,
  { sent }: { sent: boolean },
): Communication[] {
  return bulkSetRecipients(communications, commId, memberIds, sent ? null : today);
}
