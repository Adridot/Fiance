import { describe, it, expect } from 'vitest';
import type { Guest, Household } from './schema.js';
import {
  householdName,
  deriveHouseholdName,
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

