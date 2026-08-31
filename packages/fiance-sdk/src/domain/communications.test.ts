import { describe, it, expect } from 'vitest';
import type { Communication, Household } from './schema.js';
import {
  addCommunication,
  updateCommunication,
  removeCommunication,
  toggleRecipient,
  setRecipientDate,
  communicationRecipientRows,
  toggleHouseholdRecipients,
  bulkSetRecipients,
  removeGuestFromAll,
} from './communications.js';

function makeComm(overrides: Partial<Communication> = {}): Communication {
  return {
    id: 'c1',
    label: 'Faire-part',
    date: null,
    notes: null,
    recipients: [],
    channel: null,
    subject: null,
    body: null,
    templateId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addCommunication', () => {
  it('appends to list', () => {
    const comm = makeComm();
    const result = addCommunication([], comm);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });
});

describe('updateCommunication', () => {
  it('updates matching entry', () => {
    const comms = [makeComm()];
    const result = updateCommunication(comms, 'c1', { label: 'Save the date' });
    expect(result[0].label).toBe('Save the date');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const comms = [makeComm()];
    const result = updateCommunication(comms, 'other', { label: 'X' });
    expect(result[0].label).toBe('Faire-part');
  });
});

describe('removeCommunication', () => {
  it('removes matching entry', () => {
    const comms = [makeComm(), makeComm({ id: 'c2', label: 'Menu' })];
    const result = removeCommunication(comms, 'c1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c2');
  });
});

describe('toggleRecipient', () => {
  it('adds recipient when not present', () => {
    const comms = [makeComm()];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].recipients[0]).toEqual({ guestId: 'g1', sentAt: '2026-06-28' });
  });

  it('removes recipient when already present', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g1', sentAt: '2026-06-28' }] })];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[0].recipients).toHaveLength(0);
  });

  it('does not touch other communications', () => {
    const comms = [makeComm({ id: 'c1' }), makeComm({ id: 'c2', label: 'Menu' })];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[1].recipients).toHaveLength(0);
  });
});

describe('setRecipientDate', () => {
  it('updates sentAt for matching guest', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g1', sentAt: null }] })];
    const result = setRecipientDate(comms, 'c1', 'g1', '2026-06-20');
    expect(result[0].recipients[0].sentAt).toBe('2026-06-20');
  });
});

describe('bulkSetRecipients', () => {
  it('marks all given guests as sent, adding missing ones', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g1', sentAt: '2026-01-01' }] })];
    const result = bulkSetRecipients(comms, 'c1', ['g1', 'g2'], '2026-06-28');
    expect(result[0].recipients).toEqual(
      expect.arrayContaining([
        { guestId: 'g1', sentAt: '2026-06-28' },
        { guestId: 'g2', sentAt: '2026-06-28' },
      ])
    );
  });

  it('clears given guests when sentAt is null', () => {
    const comms = [makeComm({
      recipients: [{ guestId: 'g1', sentAt: '2026-01-01' }, { guestId: 'g2', sentAt: '2026-01-01' }],
    })];
    const result = bulkSetRecipients(comms, 'c1', ['g1'], null);
    expect(result[0].recipients).toEqual([{ guestId: 'g2', sentAt: '2026-01-01' }]);
  });

  it('does not touch other communications', () => {
    const comms = [makeComm({ id: 'c1' }), makeComm({ id: 'c2', label: 'Menu' })];
    const result = bulkSetRecipients(comms, 'c1', ['g1'], '2026-06-28');
    expect(result[1].recipients).toHaveLength(0);
  });
});

describe('removeGuestFromAll', () => {
  it('strips guest from all communications', () => {
    const comms = [
      makeComm({ id: 'c1', recipients: [{ guestId: 'g1', sentAt: null }, { guestId: 'g2', sentAt: null }] }),
      makeComm({ id: 'c2', label: 'Menu', recipients: [{ guestId: 'g1', sentAt: null }] }),
    ];
    const result = removeGuestFromAll(comms, 'g1');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].recipients[0].guestId).toBe('g2');
    expect(result[1].recipients).toHaveLength(0);
  });

  it('does not touch communications without the guest', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g2', sentAt: null }] })];
    const result = removeGuestFromAll(comms, 'g1');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].updatedAt).toBeNull();
  });
});

describe('recipients are counted per household', () => {
  const g = (id: string, lastName: string, householdId: string | null) => ({
    id,
    firstName: id.toUpperCase(),
    lastName,
    nameParticle: null as string | null,
    householdId,
  });
  const household = (id: string, address: string | null = null): Household => ({
    id,
    name: null,
    address,
    createdAt: null,
    updatedAt: null,
  });
  const comm = (recipients: { guestId: string; sentAt: string | null }[]) =>
    ({
      id: "c1",
      title: "Faire-part",
      channel: "MAIL",
      date: null,
      notes: null,
      recipients,
      createdAt: null,
      updatedAt: null,
    }) as unknown as Communication;

  const four = [
    g("a", "FONTAINES", "h1"),
    g("b", "FONTAINES", "h1"),
    g("c", "FONTAINES", "h1"),
    g("d", "FONTAINES", "h1"),
  ];

  it("a household of four yields ONE recipient row", () => {
    const rows = communicationRecipientRows([household("h1")], four, comm([]));
    expect(rows).toHaveLength(1);
    expect(rows[0].members).toHaveLength(4);
    expect(rows[0].sent).toBe(false);
  });

  it("ticking a household of four marks all four as sent", () => {
    const rows = communicationRecipientRows([household("h1")], four, comm([]));
    const next = toggleHouseholdRecipients(
      [comm([])],
      "c1",
      rows[0].members.map((m) => m.id),
      "2026-09-01",
      { sent: rows[0].sent },
    );
    expect(next[0].recipients).toHaveLength(4);
    expect(next[0].recipients.every((r) => r.sentAt === "2026-09-01")).toBe(true);
    const reread = communicationRecipientRows([household("h1")], four, next[0]);
    expect(reread[0].sent).toBe(true);
    expect(reread[0].sentAt).toBe("2026-09-01");
  });

  it("unticking a sent household drops all four rows", () => {
    const ids = ["a", "b", "c", "d"];
    const sent = comm(ids.map((guestId) => ({ guestId, sentAt: "2026-09-01" })));
    const next = toggleHouseholdRecipients(
      [sent],
      "c1",
      ids,
      "2026-09-02",
      { sent: true },
    );
    expect(next[0].recipients).toHaveLength(0);
  });

  it("a guest with no household is a row like any other", () => {
    const rows = communicationRecipientRows([], [g("z", "SEUL", null)], comm([]));
    expect(rows).toHaveLength(1);
    expect(rows[0].members).toHaveLength(1);
  });

  it("a household formed AFTER a send reads as partially sent", () => {
    const partial = comm([{ guestId: "a", sentAt: "2026-09-01" }]);
    const rows = communicationRecipientRows([household("h1")], four, partial);
    expect(rows[0].sent).toBe(false);
    expect(rows[0].partial).toBe(true);
    const next = toggleHouseholdRecipients([partial], "c1", ["a", "b", "c", "d"], "2026-09-02", {
      sent: false,
    });
    expect(next[0].recipients).toHaveLength(4);
  });

  it("the mailing address comes from the HOUSEHOLD, not the guest records", () => {
    const rows = communicationRecipientRows([household("h1", "3 allée des Tilleuls")], four, comm([]));
    expect(rows[0].address).toBe("3 allée des Tilleuls");
  });
});
