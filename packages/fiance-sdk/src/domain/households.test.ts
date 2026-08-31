import { describe, it, expect } from 'vitest';
import type { Guest, Household } from './schema.js';
import {
  createHousehold,
  updateHousehold,
  attachToHousehold,
  detachFromHousehold,
  splitHousehold,
  removeHousehold,
  pruneEmptyHouseholds,
  resolveHousehold,
  householdMembers,
  householdName,
  deriveHouseholdName,
  householdAddress,
  householdCandidates,
  householdsRemaining,
  recipients,
  recipientOf,
  materializeHousehold,
  proposeHouseholdName,
  householdCategory,
  householdScope,
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

describe('forming and splitting', () => {
  it('forms a household and attaches its members', () => {
    const guests = [guest('a', 'Christian', 'DIDOT'), guest('b', 'Anne-Sophie', 'DIDOT')];
    const r = createHousehold([], guests, ['a', 'b'], 'h1');
    expect(r.households).toHaveLength(1);
    expect(householdMembers(r.guests, 'h1').map((g) => g.id)).toEqual(['a', 'b']);
  });

  it('a guest belongs to AT MOST one household — attaching pulls it out of the previous one', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' }), guest('b', 'B', 'X', { householdId: 'h1' })];
    const next = attachToHousehold(guests, ['b'], 'h2');
    expect(next.find((g) => g.id === 'b')!.householdId).toBe('h2');
    expect(householdMembers(next, 'h1').map((g) => g.id)).toEqual(['a']);
  });

  it('removing a member leaves it WITHOUT a household, it does not delete it', () => {
    const guests = [
      guest('a', 'A', 'X', { householdId: 'h1' }),
      guest('b', 'B', 'X', { householdId: 'h1' }),
      guest('c', 'C', 'X', { householdId: 'h1' }),
    ];
    const r = detachFromHousehold([household('h1')], guests, ['c']);
    expect(householdMembers(r.guests, 'h1')).toHaveLength(2);
    const removed = r.guests.find((g) => g.id === 'c')!;
    expect(removed.householdId).toBeNull();
    expect(r.guests).toHaveLength(3);
    const { household: h, members, implicit } = resolveHousehold(r.households, r.guests, 'c');
    expect(h).toBeNull();
    expect(implicit).toBe(true);
    expect(members.map((g) => g.id)).toEqual(['c']);
  });

  it('the last member leaving makes the household disappear', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' })];
    const r = detachFromHousehold([household('h1', { address: '12 rue du Puits' })], guests, ['a']);
    expect(r.households).toHaveLength(0);
  });

  it('deleting a guest leaves the household intact for the other members', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' }), guest('b', 'B', 'X', { householdId: 'h1' })];
    const remaining = guests.filter((g) => g.id !== 'b');
    expect(pruneEmptyHouseholds([household('h1')], remaining)).toHaveLength(1);
    expect(pruneEmptyHouseholds([household('h1')], [])).toHaveLength(0);
  });

  it('splits a household of six into two households of three', () => {
    const guests = Array.from({ length: 6 }, (_, i) =>
      guest(`g${i}`, `P${i}`, 'MERY', { householdId: 'h1' }),
    );
    const r = splitHousehold([household('h1')], guests, ['g3', 'g4', 'g5'], 'h2');
    expect(r.households).toHaveLength(2);
    expect(householdMembers(r.guests, 'h1').map((g) => g.id)).toEqual(['g0', 'g1', 'g2']);
    expect(householdMembers(r.guests, 'h2').map((g) => g.id)).toEqual(['g3', 'g4', 'g5']);
    expect(householdMembers(r.guests, 'h1').some((g) => g.id === 'g3')).toBe(false);
  });

  it('deleting a household leaves its members invited, without a household', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' })];
    const r = removeHousehold([household('h1')], guests, 'h1');
    expect(r.households).toHaveLength(0);
    expect(r.guests).toHaveLength(1);
    expect(r.guests[0].householdId).toBeNull();
  });

  it('joins two guests from different categories into one household, without touching their category', () => {
    const guests = [guest('a', 'A', 'X', { groupId: 'g1' }), guest('b', 'B', 'X', { groupId: 'g2' })];
    const r = createHousehold([], guests, ['a', 'b'], 'h1');
    expect(householdMembers(r.guests, 'h1')).toHaveLength(2);
    expect(r.guests.map((g) => g.groupId)).toEqual(['g1', 'g2']);
  });

  it('keeps the mixed invitation types of a household', () => {
    const guests = [
      guest('a', 'A', 'X', { invitationType: 'FULL' }),
      guest('b', 'B', 'X', { invitationType: 'COCKTAIL' }),
    ];
    const r = createHousehold([], guests, ['a', 'b'], 'h1');
    expect(r.guests.map((g) => g.invitationType)).toEqual(['FULL', 'COCKTAIL']);
    expect(recipients(r.households, r.guests)).toHaveLength(1);
  });
});

describe('resolving a household — no household means a household of one', () => {
  it('no caller has to tell the two cases apart', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' }), guest('b', 'B', 'Y')];
    const households = [household('h1')];
    for (const id of ['a', 'b']) {
      const r = resolveHousehold(households, guests, id);
      expect(r.members.length).toBeGreaterThan(0);
      expect(r.members.some((g) => g.id === id)).toBe(true);
    }
    expect(resolveHousehold(households, guests, 'b').members).toHaveLength(1);
  });

  it('a membership pointing at a vanished household is also a household of one', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'gone' })];
    const r = resolveHousehold([], guests, 'a');
    expect(r.household).toBeNull();
    expect(r.members.map((g) => g.id)).toEqual(['a']);
  });

  it('a guest with no household raises neither error nor warning, and counts as a recipient', () => {
    const guests = [guest('a', 'A', 'X'), guest('b', 'B', 'Y')];
    expect(recipients([], guests)).toHaveLength(2);
  });
});

describe('a membership SEEDED with no entity still groups — regression', () => {
  const five = ['a', 'b', 'c', 'd', 'e'].map((id) => guest(id, id.toUpperCase(), 'DIDOT', { householdId: 'seeded' }));

  it('resolves the five members while NO household entity exists', () => {
    const r = resolveHousehold([], five, 'a');
    expect(r.members).toHaveLength(5);
    expect(r.household).toBeNull();
    expect(r.implicit).toBe(false);
  });

  it('yields ONE envelope, not five', () => {
    const dests = recipients([], five);
    expect(dests).toHaveLength(1);
    expect(dests[0].members).toHaveLength(5);
    expect(dests[0].id).toBe('seeded');
    expect(dests[0].name).toBe('DIDOT');
    expect(dests[0].address).toBeNull();
  });

  it('the entity, once it arrives, only adds the label and the address', () => {
    const withEntity = recipients([household('seeded', { name: 'Les DIDOT', address: 'ici' })], five);
    expect(withEntity).toHaveLength(1);
    expect(withEntity[0].members).toHaveLength(5);
    expect(withEntity[0].name).toBe('Les DIDOT');
    expect(withEntity[0].address).toBe('ici');
  });

  it('mixes seeded memberships and formed households without flinching', () => {
    const roster = [...five, guest('z', 'Z', 'SEUL')];
    expect(recipients([], roster)).toHaveLength(2);
  });
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

describe('the address is carried by the household', () => {
  it('an address typed once holds for all four members, without writing on their records', () => {
    const guests = Array.from({ length: 4 }, (_, i) => guest(`g${i}`, `P${i}`, 'FONTAINES'));
    const r = createHousehold([], guests, ['g0', 'g1', 'g2', 'g3'], 'h1', {
      address: '3 allée des Tilleuls',
    });
    for (const g of r.guests) {
      expect(householdAddress(r.households, r.guests, g.id)).toBe('3 allée des Tilleuls');
      expect(g.address).toBeNull();
    }
  });

  it('a correction holds for every member, with no other write', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' }), guest('b', 'B', 'X', { householdId: 'h1' })];
    const households = updateHousehold([household('h1', { address: 'avant' })], 'h1', { address: 'après' });
    expect(guests.map((g) => householdAddress(households, guests, g.id))).toEqual(['après', 'après']);
  });

  it('a household with no address stays usable', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' })];
    const [dest] = recipients([household('h1')], guests);
    expect(dest.address).toBeNull();
    expect(dest.members).toHaveLength(1);
  });
});

describe('recipients are counted per household', () => {
  it('a household of four yields ONE recipient row', () => {
    const guests = Array.from({ length: 4 }, (_, i) => guest(`g${i}`, `P${i}`, 'X', { householdId: 'h1' }));
    const dests = recipients([household('h1')], guests);
    expect(dests).toHaveLength(1);
    expect(dests[0].members).toHaveLength(4);
    expect(dests[0].members.map((g) => g.id)).toEqual(['g0', 'g1', 'g2', 'g3']);
  });

  it('mixes formed households and household-less guests without telling them apart', () => {
    const guests = [
      guest('a', 'A', 'X', { householdId: 'h1' }),
      guest('b', 'B', 'X', { householdId: 'h1' }),
      guest('c', 'C', 'Y'),
    ];
    expect(recipients([household('h1')], guests).map((d) => d.members.length)).toEqual([2, 1]);
  });

  it('a guest\'s recipient is its household, or itself', () => {
    const guests = [guest('a', 'A', 'X', { householdId: 'h1' }), guest('b', 'B', 'X', { householdId: 'h1' })];
    expect(recipientOf([household('h1')], guests, 'a')!.members).toHaveLength(2);
    expect(recipientOf([], [guest('z', 'Z', 'W')], 'z')!.members).toHaveLength(1);
  });
});

describe('assisted forming — the likely matches', () => {
  const roster = [
    guest('a', 'Arthur', 'MERY', { groupId: 'fontaines' }),
    guest('b', 'Charlotte', 'MERY', { groupId: 'fontaines' }),
    guest('c', 'Dedette', 'MERY', { groupId: 'fontaines' }),
    guest('d', 'Alix', 'PORTIER', { groupId: 'fontaines' }),
    guest('e', 'Sophie', 'MERY', { groupId: 'amis' }),
  ];

  it('matches on last name WITHIN a category', () => {
    const candidates = householdCandidates(roster);
    const mery = candidates.filter((c) => c.lastName === 'MERY');
    expect(mery).toHaveLength(2);
    expect(mery.map((c) => c.groupId).sort()).toEqual(['amis', 'fontaines']);
  });

  it('shows the already-attached people next to those who are not', () => {
    const withOne = [...roster.slice(0, 1).map((g) => ({ ...g, householdId: 'h1' })), ...roster.slice(1)];
    const mery = householdCandidates(withOne, 'fontaines').find((c) => c.lastName === 'MERY')!;
    expect(mery.members).toHaveLength(3);
    expect(mery.unassigned.map((g) => g.id)).toEqual(['b', 'c']);
  });

  it('a match whose members ALL have a household stops showing up', () => {
    const all = roster.map((g) => (g.lastName === 'MERY' ? { ...g, householdId: 'h1' } : g));
    expect(householdCandidates(all).some((c) => c.lastName === 'MERY')).toBe(false);
    const assigned = roster.map((g) => ({ ...g, householdId: 'h1' }));
    expect(householdCandidates(assigned)).toHaveLength(0);
    expect(householdsRemaining(assigned, 'fontaines')).toBe(0);
  });

  it('the scope follows the gesture: opened from a category, it shows only that one', () => {
    const candidates = householdCandidates(roster, 'amis');
    expect(candidates.every((c) => c.groupId === 'amis')).toBe(true);
    expect(candidates.flatMap((c) => c.members).map((g) => g.id)).toEqual(['e']);
  });

  it('splits a cluster of six into two households from the matches alone', () => {
    const six = Array.from({ length: 6 }, (_, i) => guest(`g${i}`, `P${i}`, 'LA GASTINES'));
    const cluster = householdCandidates(six)[0];
    expect(cluster.unassigned).toHaveLength(6);
    const first = createHousehold([], six, ['g0', 'g1', 'g2'], 'h1');
    const second = createHousehold(first.households, first.guests, ['g3', 'g4', 'g5'], 'h2');
    expect(second.households).toHaveLength(2);
    expect(householdCandidates(second.guests)).toHaveLength(0);
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

describe('a household category is derived, and refused when mixed', () => {
  it('all in the same category: that is the one', () => {
    const members = [
      guest('a', 'Henri', 'FLEITH', { groupId: 'fontaines' }),
      guest('b', 'Pia', 'FLEITH', { groupId: 'fontaines' }),
    ];
    expect(householdCategory(members)).toBe('fontaines');
  });

  it('two categories mixed: no category, and not either of the two', () => {
    const members = [
      guest('a', 'Henri', 'FLEITH', { groupId: 'fontaines' }),
      guest('b', 'Pia', 'DURAND', { groupId: 'amis' }),
    ];
    expect(householdCategory(members)).toBeNull();
  });

  it('one member with no category is enough to put the household out of category', () => {
    const members = [
      guest('a', 'Henri', 'FLEITH', { groupId: 'fontaines' }),
      guest('b', 'Pia', 'FLEITH', { groupId: null }),
    ];
    expect(householdCategory(members)).toBeNull();
    expect(householdCategory([guest('a', 'Henri', 'FLEITH', { groupId: null })])).toBeNull();
    expect(householdCategory([])).toBeNull();
  });
});

describe('householdScope — la portée d’une action « tout le foyer »', () => {
  it('un foyer de quatre rend ses quatre membres', () => {
    const guests = [
      guest('a', 'Henri', 'FLEITH', { householdId: 'h1' }),
      guest('b', 'Pia', 'FLEITH', { householdId: 'h1' }),
      guest('c', 'Jean', 'FLEITH', { householdId: 'h1' }),
      guest('d', 'Léa', 'FLEITH', { householdId: 'h1' }),
      guest('e', 'Marc', 'DURAND', { householdId: 'h2' }),
    ];
    expect(householdScope(guests, 'a').sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('seul dans son foyer : aucune portée', () => {
    const guests = [guest('a', 'Henri', 'FLEITH', { householdId: 'h1' })];
    expect(householdScope(guests, 'a')).toEqual([]);
  });

  it('sans foyer : aucune portée', () => {
    const guests = [guest('a', 'Henri', 'FLEITH', { householdId: null })];
    expect(householdScope(guests, 'a')).toEqual([]);
  });

  it('des homonymes non rapprochés ne forment pas un foyer', () => {
    const guests = [
      guest('a', 'Henri', 'FLEITH', { householdId: null }),
      guest('b', 'Pia', 'FLEITH', { householdId: null }),
    ];
    expect(householdScope(guests, 'a')).toEqual([]);
  });

  it('un invité inconnu n’a aucune portée', () => {
    expect(householdScope([], 'zz')).toEqual([]);
  });
});
