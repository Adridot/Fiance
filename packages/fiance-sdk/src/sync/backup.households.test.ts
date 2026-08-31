// `Guest.address` and `Guest.childrenCount` stay in the model, inert: dropping
// them would invalidate the restore of an older backup for no gain.
import { describe, it, expect } from 'vitest';
import { createBackupDocument, restoreFromBackup, BACKUP_VERSION, type WeddingSnapshot } from './backup.js';
import type { Guest, Household } from '../domain/schema.js';
import { computeCounts } from '../domain/guests.js';
import { resolveHousehold, householdMembers } from '../domain/households.js';

function emptySnapshot(overrides: Partial<WeddingSnapshot> = {}): WeddingSnapshot {
  return {
    wedding: null,
    guests: [],
    tables: [],
    guestGroups: [],
    households: [],
    vendors: [],
    quotePricings: [],
    tasks: [],
    taskCategories: [],
    agendaEvents: [],
    dayOfItems: [],
    ideas: [],
    ideaCollections: [],
    vendorPayments: [],
    accommodations: [],
    gifts: [],
    contributors: [],
    invitationTypes: [],
    communications: [],
    weddingRoles: [],
    weddingRoleAssignments: [],
    seatingConstraints: [],
    weddingEvents: [],
    guestMealSelections: [],
    communicationTemplates: [],
    documents: [],
    legalMilestones: [],
    honeymoonPlans: [],
    ceremonyItems: [],
    speeches: [],
    playlistTracks: [],
    permissionRoles: [],
    permissionAssignments: [],
    ...overrides,
  };
}

const guest = (over: Partial<Guest> = {}): Guest => ({
  id: 'g1',
  firstName: 'Hubert',
  lastName: 'FONTAINES',
  nameParticle: null,
  side: null,
  invitationType: 'FULL',
  rsvpStatus: 'PENDING',
  rsvpDate: null,
  isSleeping: null,
  childrenCount: 0,
  diet: 'STANDARD',
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
  rsvpToken: null,
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
  ...over,
});

const household: Household = {
  id: 'h1',
  name: null,
  address: '3 allée des Tilleuls',
  createdAt: null,
  updatedAt: null,
};

const roundTrip = (s: WeddingSnapshot) =>
  restoreFromBackup(JSON.parse(JSON.stringify(createBackupDocument(s))));

describe('backup — households and the child flag', () => {
  it('households and memberships survive the JSON round trip', () => {
    const guests = [guest({ id: 'a', householdId: 'h1' }), guest({ id: 'b', householdId: 'h1' })];
    const r = roundTrip(emptySnapshot({ guests, households: [household] }));
    expect(r.households).toEqual([household]);
    expect(householdMembers(r.guests, 'h1').map((g) => g.id)).toEqual(['a', 'b']);
    expect(r.households[0].address).toBe('3 allée des Tilleuls');
  });

  it('the child flag survives the JSON round trip', () => {
    const r = roundTrip(emptySnapshot({ guests: [guest({ isChild: true })] }));
    expect(r.guests[0].isChild).toBe(true);
  });

  it('BACKUP_VERSION was NOT incremented — the fields are additive', () => {
    expect(BACKUP_VERSION).toBe(16);
    expect(createBackupDocument(emptySnapshot()).version).toBe(16);
  });

  it('an OLDER backup restores with no household and no flag', () => {
    const legacy = JSON.parse(JSON.stringify(createBackupDocument(emptySnapshot({
      guests: [guest({ id: 'a' })],
    }))));
    delete legacy.households;
    const r = restoreFromBackup(legacy);
    expect(r.households).toEqual([]);
    expect(r.guests[0].householdId).toBeUndefined();
    expect(r.guests[0].isChild).toBeUndefined();
    const { household: h, members, implicit } = resolveHousehold(r.households, r.guests, 'a');
    expect(h).toBeNull();
    expect(implicit).toBe(true);
    expect(members).toHaveLength(1);
  });

  it('an older backup carrying guest ADDRESSES still restores', () => {
    const r = roundTrip(emptySnapshot({
      guests: [guest({ id: 'a', address: '12 rue du Puits, 44000 Nantes' })],
    }));
    expect(r.guests[0].address).toBe('12 rue du Puits, 44000 Nantes');
    expect(r.households).toEqual([]);
  });

  it('an older record carrying a companion headcount stays valid and out of the counters', () => {
    const r = roundTrip(emptySnapshot({
      guests: [guest({ id: 'a', rsvpStatus: 'ACCEPTED', childrenCount: 3 })],
    }));
    expect(r.guests[0].childrenCount).toBe(3);
    const c = computeCounts(r.guests);
    expect(c.children_count).toBe(0);
    expect(c.children_count_all).toBe(0);
    expect(c.inv_by_type.FULL).toBe(1);
  });
});
