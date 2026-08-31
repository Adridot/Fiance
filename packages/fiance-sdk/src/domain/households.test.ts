import { describe, it, expect } from 'vitest';
import type { Guest, Household } from './schema.js';
import {
  updateHousehold,
  pruneEmptyHouseholds,
  householdMembers,
  householdName,
  deriveHouseholdName,
  materializeHousehold,
  proposeHouseholdName,
} from './households.js';

function guest(id: string, firstName: string, lastName: string, extra: Partial<Guest> = {}): Guest {
  return {
    id,
    firstName,
    lastName,
    nameParticle: null,
    side: null,
    invitationType: 'FULL',
    rsvpStatus: 'PENDING',
    rsvpDate: null,
    isSleeping: null,
    childrenCount: 0,
    diet: 'STANDARD',
    dietNotes: null,
    groupId: 'g1',
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
    ...extra,
  };
}

const household = (id: string, fields: Partial<Household> = {}): Household => ({
  id,
  name: null,
  address: null,
  createdAt: null,
  updatedAt: null,
  ...fields,
});

describe('label — a READ fallback, never a write', () => {
  it('derives a readable label from the members, without writing anything', () => {
    const members = [guest('a', 'Hubert', 'FONTAINES'), guest('b', 'Chantal', 'FONTAINES')];
    const copy = JSON.parse(JSON.stringify(members));
    const h = household('h1');
    expect(householdName(h, members)).toBe('FONTAINES');
    expect(members).toEqual(copy);
    expect(h.name).toBeNull();
  });

  it('lists the last names of a household that mixes several', () => {
    expect(deriveHouseholdName([guest('a', 'A', 'MERY'), guest('b', 'B', 'POIX')])).toBe('MERY · POIX');
  });

  it('carries the particle over to the display', () => {
    expect(
      deriveHouseholdName([guest('a', 'Hubert', 'MESNIL', { nameParticle: 'du' })]),
    ).toBe('DU MESNIL');
  });

  it('a TYPED-IN label is never re-derived, even when the membership changes', () => {
    const h = household('h1', { name: 'M. et Mme Hubert FONTAINES' });
    expect(householdName(h, [guest('a', 'Hubert', 'FONTAINES')])).toBe('M. et Mme Hubert FONTAINES');
    expect(householdName(h, [guest('z', 'Z', 'AUTRE')])).toBe('M. et Mme Hubert FONTAINES');
  });

  it('updating a household changes only what is asked for', () => {
    const next = updateHousehold([household('h1', { address: 'ici' })], 'h1', { name: 'Les X' });
    expect(next[0].name).toBe('Les X');
    expect(next[0].address).toBe('ici');
  });
});

describe('materialisation — the entity is born from the typing, the membership does not move', () => {
  it('creates the entity UNDER THE ID the members already carry', () => {
    const guests = [
      guest('a', 'Henri', 'FLEITH', { householdId: 'h-seeded' }),
      guest('b', 'Pia', 'FLEITH', { householdId: 'h-seeded' }),
    ];
    const r = materializeHousehold([], guests, ['a', 'b'], { address: '3 rue Sainte' }, 'h-new');

    expect(r.id).toBe('h-seeded');
    expect(r.households.map((h) => h.id)).toEqual(['h-seeded']);
    expect(r.households[0].address).toBe('3 rue Sainte');
    expect(r.guests.map((g) => g.householdId)).toEqual(['h-seeded', 'h-seeded']);
    expect(householdMembers(r.guests, 'h-seeded')).toHaveLength(2);
  });

  it('updates the entity when it already exists, without minting a second one', () => {
    const guests = [guest('a', 'Henri', 'FLEITH', { householdId: 'h1' })];
    const r = materializeHousehold([household('h1', { name: 'FLEITH' })], guests, ['a'], { address: '3 rue Sainte' }, 'h-new');
    expect(r.households).toHaveLength(1);
    expect(r.households[0]).toMatchObject({ id: 'h1', name: 'FLEITH', address: '3 rue Sainte' });
  });

  it('forms a brand-new household when NO member is attached', () => {
    const guests = [guest('a', 'Henri', 'FLEITH'), guest('b', 'Pia', 'DURAND')];
    const r = materializeHousehold([], guests, ['a', 'b'], { name: 'Henri FLEITH et Pia DURAND' }, 'h-new');

    expect(r.id).toBe('h-new');
    expect(r.households.map((h) => h.id)).toEqual(['h-new']);
    expect(householdMembers(r.guests, 'h-new').map((g) => g.id)).toEqual(['a', 'b']);
  });

  it('NEVER mints an entity carrying a guest id', () => {
    // For a guest with no household, `recipient.id` IS the guest id: an entity
    // minted on it would be referenced by nobody, pruned on the first sweep,
    // and would take the typed-in address with it, silently.
    const alone = [guest('guest-1', 'Sophie', 'MERY')];
    const r = materializeHousehold([], alone, ['guest-1'], { address: '9 quai Rive-Neuve' }, 'h-new');

    const guestIds = new Set(r.guests.map((g) => g.id));
    expect(r.households.some((h) => guestIds.has(h.id))).toBe(false);
    expect(r.guests[0].householdId).toBe(r.households[0].id);
    expect(pruneEmptyHouseholds(r.households, r.guests)).toHaveLength(1);
  });

  it('nothing is created while nothing is typed — `updateHousehold` alone does not create', () => {
    expect(updateHousehold([], 'h-absent', { address: '3 rue Sainte' })).toEqual([]);
  });
});

describe('the label PROPOSED at typing time — distinct from the read fallback', () => {
  it('a single member is named by its last name', () => {
    expect(proposeHouseholdName([guest('a', 'Henri', 'FLEITH')])).toBe('FLEITH');
  });

  it('two members sharing a last name: the usual derivation is enough', () => {
    const members = [guest('a', 'Henri', 'FLEITH'), guest('b', 'Pia', 'FLEITH')];
    expect(proposeHouseholdName(members)).toBe('FLEITH');
    expect(proposeHouseholdName(members)).toBe(deriveHouseholdName(members));
  });

  it('two last names mixed: both people are named, first name first', () => {
    const members = [guest('a', 'Henri', 'FLEITH'), guest('b', 'Pia', 'DURAND')];
    expect(proposeHouseholdName(members)).toBe('Henri FLEITH et Pia DURAND');
  });

  it('three last names mixed: French enumeration', () => {
    const members = [
      guest('a', 'Henri', 'FLEITH'),
      guest('b', 'Pia', 'DURAND'),
      guest('c', 'Alix', 'PORTIER'),
    ];
    expect(proposeHouseholdName(members)).toBe('Henri FLEITH, Pia DURAND et Alix PORTIER');
  });

  it('the case of the last names is NOT touched, particle included', () => {
    const members = [
      guest('a', 'Henri', 'BOZAS', { nameParticle: 'de' }),
      guest('b', 'Pia', "L'ECLUSE" ),
    ];
    expect(proposeHouseholdName(members)).toBe("Henri DE BOZAS et Pia L'ECLUSE");
  });

  it('a member with no first name is named by its last name alone', () => {
    const members = [guest('a', '', 'FLEITH'), guest('b', 'Pia', 'DURAND')];
    expect(proposeHouseholdName(members)).toBe('FLEITH et Pia DURAND');
  });
});

describe('the READ fallback is unchanged — the proposal sits beside it, not in its place', () => {
  it('`deriveHouseholdName` still lists the last names, and nothing else', () => {
    const members = [guest('a', 'Henri', 'FLEITH'), guest('b', 'Pia', 'DURAND')];
    expect(deriveHouseholdName(members)).toBe('FLEITH · DURAND');
    expect(deriveHouseholdName([guest('a', 'Henri', 'FLEITH')])).toBe('FLEITH');
    expect(deriveHouseholdName([])).toBe('Foyer');
  });

  it('deriving writes nothing: not on the household, not on the members', () => {
    const members = [guest('a', 'Henri', 'FLEITH'), guest('b', 'Pia', 'DURAND')];
    const before = JSON.stringify(members);
    const h = household('h1');
    const beforeHousehold = JSON.stringify(h);
    deriveHouseholdName(members);
    proposeHouseholdName(members);
    householdName(h, members);
    expect(JSON.stringify(members)).toBe(before);
    expect(JSON.stringify(h)).toBe(beforeHousehold);
    expect(h.name).toBeNull();
  });
});

