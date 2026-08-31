import { describe, it, expect } from 'vitest';
import {
  computeCounts,
  countDuplicateGuests,
  sortGroups,
  formatGuestGroupSide,
  groupsBySide,
  resolveGroupSides,
  formatGuestGroupName,
  buildGuestListData,
  isFirstNameToComplete,
  computeGroupProgress,
  groupFamiliesToComplete,
  formatGuestName,
  removeGuest,
  removeGuests,
  applyGuestUpdates,
  rsvpStatusUpdate,
  guestNameMatches,
  nextFirstNameToComplete,
  selectRange,
  adjacentGuestId,
  newGuestDraft,
  resolveChainedHousehold,
} from './guests.js';
import type { GuestGroup, GuestGroupSide } from './schema.js';

// Minimal guest factory — computeCounts only reads rsvpStatus + invitationType here.
const g = (rsvpStatus: string, invitationType: string) =>
  ({ rsvpStatus, invitationType }) as any;

// Minimal guest factory for name-based duplicate detection.
const named = (firstName: string, lastName: string) => ({ firstName, lastName }) as any;

// A custom (user-created) invitation type carries a UUID id, NOT a hardcoded enum string.
const TWO_DAYS = "b1f2c3d4-2days";

describe('computeCounts — per-invitation-type pricing counts', () => {
  it('groups accepted guests by exact invitation-type id (inv_by_type)', () => {
    const guests = [
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'COCKTAIL'),
      g('ACCEPTED', 'FULL'),
      g('ACCEPTED', TWO_DAYS),
      g('DECLINED', 'FULL'), // ignored (some accepted)
      g('PENDING', 'FULL'),  // ignored (some accepted)
    ];
    const c = computeCounts(guests);
    expect(c.inv_by_type).toEqual({ CEREMONY: 2, COCKTAIL: 1, FULL: 1, [TWO_DAYS]: 1 });
  });

  it('inv_by_type_all counts ALL guests regardless of RSVP (guest-screen parity)', () => {
    const guests = [
      g('ACCEPTED', 'FULL'),
      g('PENDING', 'FULL'),
      g('DECLINED', 'FULL'),
      g('MAYBE', TWO_DAYS),
      g('PENDING', TWO_DAYS),
    ];
    const c = computeCounts(guests);
    // Mirrors the guest screen's typeCounts: group ALL guests by invitationType id, no RSVP filter.
    const guestScreenCount = (id: string) => guests.filter((x) => x.invitationType === id).length;
    expect(c.inv_by_type_all).toEqual({ FULL: 3, [TWO_DAYS]: 2 });
    expect(c.inv_by_type_all.FULL).toBe(guestScreenCount('FULL'));
    expect(c.inv_by_type_all[TWO_DAYS]).toBe(guestScreenCount(TWO_DAYS));
  });

  it('a custom UUID "2 days" type is counted (BOTH_DAYS regression guard)', () => {
    const guests = [
      g('PENDING', TWO_DAYS),
      g('ACCEPTED', TWO_DAYS),
      g('MAYBE', TWO_DAYS),
    ];
    const c = computeCounts(guests);
    // Was 0 with the old hardcoded "BOTH_DAYS" enum key; now tracks the real id.
    expect(c.inv_by_type_all[TWO_DAYS]).toBe(3);
    expect(c.inv_by_type[TWO_DAYS]).toBe(1); // only the accepted one
  });

  it('inv_by_type estimates from non-declined guests when nobody has accepted yet', () => {
    const guests = [
      g('PENDING', 'FULL'),
      g('PENDING', 'FULL'),
      g('MAYBE', 'COCKTAIL'),
      g('DECLINED', 'FULL'), // excluded from the estimate
    ];
    const c = computeCounts(guests);
    expect(c.accepted).toBe(0);
    expect(c.inv_by_type).toEqual({ FULL: 2, COCKTAIL: 1 }); // declined excluded
    expect(c.inv_by_type_all).toEqual({ FULL: 3, COCKTAIL: 1 }); // declined included
  });

  it('is empty with no guests', () => {
    const c = computeCounts([]);
    expect(c.inv_by_type).toEqual({});
    expect(c.inv_by_type_all).toEqual({});
  });
});

describe('countDuplicateGuests', () => {
  it('returns 0 when no names repeat', () => {
    const guests = [named('Jean', 'Dupont'), named('Marie', 'Curie')];
    expect(countDuplicateGuests(guests)).toBe(0);
  });

  it('counts every guest sharing a duplicated first+last name', () => {
    const guests = [
      named('Jean', 'Dupont'),
      named('Jean', 'Dupont'),
      named('Marie', 'Curie'),
    ];
    expect(countDuplicateGuests(guests)).toBe(2);
  });

  it('matches names case-insensitively and ignores surrounding whitespace', () => {
    const guests = [named('jean', ' Dupont '), named('JEAN', 'dupont')];
    expect(countDuplicateGuests(guests)).toBe(2);
  });

  it('sums multiple distinct duplicate groups', () => {
    const guests = [
      named('Jean', 'Dupont'),
      named('Jean', 'Dupont'),
      named('Marie', 'Curie'),
      named('Marie', 'Curie'),
      named('Marie', 'Curie'),
      named('Paul', 'Martin'),
    ];
    // Dupont pair (2) + Curie trio (3) = 5; Martin is unique and excluded.
    expect(countDuplicateGuests(guests)).toBe(5);
  });

  it('a shared first name alone (different last name) is not a duplicate', () => {
    const guests = [named('Jean', 'Dupont'), named('Jean', 'Martin')];
    expect(countDuplicateGuests(guests)).toBe(0);
  });

  it('is 0 with no guests', () => {
    expect(countDuplicateGuests([])).toBe(0);
  });
});

describe('sortGroups', () => {
  const g = (
    name: string,
    side?: GuestGroupSide,
    sortOrder?: number,
  ): GuestGroup => ({ id: name, name, side, sortOrder, createdAt: null, updatedAt: null });

  it('orders sides: partner 1, partner 2, both', () => {
    expect(
      sortGroups([g('COMMUNS', 'BOTH', 1), g('SIMON', 'PARTNER_2', 1), g('DIDOT', 'PARTNER_1', 1)])
        .map((x) => x.name),
    ).toEqual(['DIDOT', 'SIMON', 'COMMUNS']);
  });

  it('follows the declared rank within a side, not alphabetical order', () => {
    expect(
      sortGroups([g('Amis parents Didot', 'PARTNER_1', 3), g('Didot', 'PARTNER_1', 1), g('Fontaines', 'PARTNER_1', 2)])
        .map((x) => x.name),
    ).toEqual(['Didot', 'Fontaines', 'Amis parents Didot']);
  });

  it('puts a rankless category at the end of its side', () => {
    expect(
      sortGroups([g('AUBREE', 'PARTNER_1'), g('SIMON', 'PARTNER_1', 2), g('MEVEL', 'PARTNER_1', 1)])
        .map((x) => x.name),
    ).toEqual(['MEVEL', 'SIMON', 'AUBREE']);
  });

  it('puts a sideless category after all the others', () => {
    expect(
      sortGroups([g('AUBREE'), g('COMMUNS', 'BOTH', 1), g('DIDOT', 'PARTNER_1', 1)])
        .map((x) => x.name),
    ).toEqual(['DIDOT', 'COMMUNS', 'AUBREE']);
  });

  it('breaks a same-side same-rank tie on the name', () => {
    expect(sortGroups([g('SIMON'), g('AUBREE'), g('MEVEL')]).map((x) => x.name))
      .toEqual(['AUBREE', 'MEVEL', 'SIMON']);
  });

  it('ignores accents and case — « Émile » sits next to « Emile »', () => {
    expect(sortGroups([g('Émile'), g('Duval'), g('emile')]).map((x) => x.name))
      .toEqual(['Duval', 'Émile', 'emile']);
  });

  it('does not mutate the array it is given', () => {
    const input = [g('SIMON'), g('AUBREE')];
    sortGroups(input);
    expect(input.map((x) => x.name)).toEqual(['SIMON', 'AUBREE']);
  });
});

describe('formatGuestGroupSide', () => {
  const labels = {
    named: 'Côté {name}',
    partner1: 'Premier côté',
    partner2: 'Second côté',
    both: 'Les deux côtés',
    none: 'Sans côté',
  };
  const wedding = { partner1Name: 'Adrien', partner2Name: 'Emma' };

  it('borrows its label from the partner first name', () => {
    expect(formatGuestGroupSide('PARTNER_1', wedding, labels)).toBe('Côté Adrien');
    expect(formatGuestGroupSide('PARTNER_2', wedding, labels)).toBe('Côté Emma');
  });

  it('renders a clean label for both sides', () => {
    expect(formatGuestGroupSide('BOTH', wedding, labels)).toBe('Les deux côtés');
  });

  it('falls back to a neutral label when the first name is missing, never a hollow template', () => {
    expect(formatGuestGroupSide('PARTNER_1', { partner1Name: null, partner2Name: 'Emma' }, labels))
      .toBe('Premier côté');
    expect(formatGuestGroupSide('PARTNER_2', { partner1Name: 'Adrien', partner2Name: '  ' }, labels))
      .toBe('Second côté');
    expect(formatGuestGroupSide('PARTNER_1', null, labels)).toBe('Premier côté');
  });

  it('renders a label for a sideless category', () => {
    expect(formatGuestGroupSide(null, wedding, labels)).toBe('Sans côté');
    expect(formatGuestGroupSide(undefined, wedding, labels)).toBe('Sans côté');
  });
});

describe('formatGuestName', () => {
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle }) as never;

  it('adds no stray space when there is no particle', () => {
    expect(formatGuestName(n('Adrien', 'DIDOT'))).toBe('DIDOT Adrien');
    expect(formatGuestName(n('Adrien', 'DIDOT', ''))).toBe('DIDOT Adrien');
    expect(formatGuestName(n('Adrien', 'DIDOT', '   '))).toBe('DIDOT Adrien');
  });

  it('puts the particle before the last name, in upper case', () => {
    expect(formatGuestName(n('Nicole', 'FONTAINES', 'de'))).toBe('DE FONTAINES Nicole');
    expect(formatGuestName(n('Marie', 'PRESLE', 'de la'))).toBe('DE LA PRESLE Marie');
  });

  it('keeps an elided particle glued to the last name', () => {
    expect(formatGuestName(n('Jean', 'ORMESSON', "d'"))).toBe("D'ORMESSON Jean");
  });

  it('composes a placeholder first name like any other', () => {
    expect(formatGuestName(n('Invité 2', 'GRUAU'))).toBe('GRUAU Invité 2');
  });

  it('stays readable when a part is missing', () => {
    expect(formatGuestName(n('Adrien', ''))).toBe('Adrien');
    expect(formatGuestName(n('', 'DIDOT'))).toBe('DIDOT');
  });
});

describe('guestNameMatches — searching what you read', () => {
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle }) as never;
  const mayeul = n('Mayeul', 'FONTAINE DE FONTENAY', 'de la');

  it('matches on the particle, which used to be unsearchable', () => {
    expect(guestNameMatches(mayeul, 'de la')).toBe(true);
    expect(guestNameMatches(mayeul, 'DE LA FONTAINE')).toBe(true);
  });

  it('matches the whole name copied exactly as displayed', () => {
    expect(guestNameMatches(mayeul, 'DE LA FONTAINE DE FONTENAY Mayeul')).toBe(true);
    expect(guestNameMatches(mayeul, 'fontenay mayeul')).toBe(true);
  });

  it('still matches on first name alone or last name alone', () => {
    expect(guestNameMatches(mayeul, 'mayeul')).toBe(true);
    expect(guestNameMatches(mayeul, 'fontaine')).toBe(true);
  });

  it('a guest without a particle is searched as before', () => {
    const adrien = n('Adrien', 'DIDOT');
    expect(guestNameMatches(adrien, 'didot')).toBe(true);
    expect(guestNameMatches(adrien, 'DIDOT Adrien')).toBe(true);
    expect(guestNameMatches(adrien, 'fontaine')).toBe(false);
  });

  it('an empty term filters nothing', () => {
    expect(guestNameMatches(mayeul, '')).toBe(true);
    expect(guestNameMatches(mayeul, '   ')).toBe(true);
  });

  it('does not match two unrelated guests', () => {
    expect(guestNameMatches(n('Adrien', 'DIDOT'), 'presle')).toBe(false);
  });
});

describe('sorting — the particle is excluded from it', () => {
  // Mirrors the guest list's own sort key verbatim: the contract is that the
  // particle must NOT change it. Nothing in the sort reads it.
  const key = (g: { lastName: string; firstName: string }) => `${g.lastName}${g.firstName}`;
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle });

  it('a guest with a particle sorts on the last name, between its alphabetical neighbours', () => {
    const guests = [
      n('Jean', 'PONCHON'),
      n('Marie', 'PRESLE', 'de la'),
      n('Luc', 'PORTIER'),
      n('Anne', 'PRUNELE'),
    ];
    const sorted = [...guests].sort((a, b) => key(a).localeCompare(key(b)));
    expect(sorted.map((g) => g.lastName)).toEqual(['PONCHON', 'PORTIER', 'PRESLE', 'PRUNELE']);
    expect(formatGuestName(sorted[2] as never)).toBe('DE LA PRESLE Marie');
  });
});

const guestOf = (
  id: string,
  extra: Partial<{ companionId: string | null; rsvpStatus: string; rsvpDate: string | null }> = {},
) =>
  ({
    id,
    firstName: id,
    lastName: id.toUpperCase(),
    companionId: null,
    rsvpStatus: 'PENDING',
    rsvpDate: null,
    ...extra,
  }) as any;

describe('removeGuests — the batch IS the sequence of single removals', () => {
  const roster = () => [
    guestOf('a', { companionId: 'b' }),
    guestOf('b', { companionId: 'a' }),
    guestOf('c', { companionId: 'd' }),
    guestOf('d', { companionId: 'c' }),
    guestOf('e'),
    guestOf('f'),
  ];
  const targets = ['a', 'c', 'd', 'e'];

  // `updatedAt` carries the removal instant: it differs from one run to the
  // next, and is not what the equivalence claims.
  const withoutTimestamps = (guests: any[]) =>
    guests.map(({ updatedAt, ...rest }) => rest);

  it('yields the same state as the sequence of removeGuest calls', () => {
    const batched = removeGuests(roster(), targets);
    const oneByOne = targets.reduce((gs, id) => removeGuest(gs, id), roster());
    expect(withoutTimestamps(batched)).toEqual(withoutTimestamps(oneByOne));
  });

  it('a companion left alone loses its companion link', () => {
    const remaining = removeGuests(roster(), targets);
    expect(remaining.map((g) => g.id)).toEqual(['b', 'f']);
    expect(remaining.find((g) => g.id === 'b')?.companionId).toBeNull();
  });

  it('a couple removed whole leaves no dangling link', () => {
    const remaining = removeGuests(roster(), ['c', 'd']);
    expect(remaining.some((g) => g.companionId === 'c' || g.companionId === 'd')).toBe(false);
  });

  it('a batch of one is the single removal', () => {
    expect(withoutTimestamps(removeGuests(roster(), ['a']))).toEqual(
      withoutTimestamps(removeGuest(roster(), 'a')),
    );
  });

  it('an empty batch touches nothing', () => {
    const start = roster();
    expect(removeGuests(start, [])).toBe(start);
  });
});

describe('applyGuestUpdates', () => {
  it('two guests in one batch can receive different fragments', () => {
    const guests = [guestOf('a'), guestOf('b'), guestOf('c')];
    const after = applyGuestUpdates(guests, ['a', 'b'], (g) => ({
      rsvpStatus: g.id === 'a' ? 'ACCEPTED' : 'DECLINED',
    }));
    expect(after.map((g) => g.rsvpStatus)).toEqual(['ACCEPTED', 'DECLINED', 'PENDING']);
  });

  it('stamps `updatedAt` on the batched guests only', () => {
    const guests = [guestOf('a'), guestOf('b')];
    const after = applyGuestUpdates(guests, ['a'], () => ({ rsvpStatus: 'ACCEPTED' }));
    expect(after[0].updatedAt).toEqual(expect.any(String));
    expect(after[1].updatedAt).toBeUndefined();
  });

  it('an id absent from the list creates nothing', () => {
    const guests = [guestOf('a')];
    expect(applyGuestUpdates(guests, ['zzz'], () => ({ rsvpStatus: 'ACCEPTED' }))).toHaveLength(1);
  });
});

describe('rsvpStatusUpdate — the guest-record rule, applied per guest', () => {
  const NOW = '2026-08-20T12:00:00.000Z';
  const EARLIER = '2026-01-02T09:00:00.000Z';

  it('already in the target state: the existing date is kept', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'ACCEPTED', NOW)).toEqual({
      rsvpStatus: 'ACCEPTED',
      rsvpDate: EARLIER,
    });
  });

  it('pending to accepted: stamped', () => {
    const g = guestOf('a', { rsvpStatus: 'PENDING', rsvpDate: null });
    expect(rsvpStatusUpdate(g, 'ACCEPTED', NOW)).toEqual({
      rsvpStatus: 'ACCEPTED',
      rsvpDate: NOW,
    });
  });

  it('accepted to declined: re-stamped', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'DECLINED', NOW)).toEqual({
      rsvpStatus: 'DECLINED',
      rsvpDate: NOW,
    });
  });

  it('going back to pending never stamps', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'PENDING', NOW)).toEqual({
      rsvpStatus: 'PENDING',
      rsvpDate: EARLIER,
    });
  });
});

describe('first name still to be filled in', () => {
  const i = (firstName: string, lastName: string, groupId: string | null = 'g1') =>
    ({ firstName, lastName, groupId });

  describe('isFirstNameToComplete', () => {
    it('recognises an empty first name, whitespace included', () => {
      expect(isFirstNameToComplete({ firstName: '' })).toBe(true);
      expect(isFirstNameToComplete({ firstName: '   ' })).toBe(true);
    });

    it('recognises a first name manufactured by the import', () => {
      expect(isFirstNameToComplete({ firstName: 'Luc 1' })).toBe(true);
      expect(isFirstNameToComplete({ firstName: 'Luc 2' })).toBe(true);
      expect(isFirstNameToComplete({ firstName: 'Marie Helene 12' })).toBe(true);
    });

    it('a filled-in first name is not missing', () => {
      expect(isFirstNameToComplete({ firstName: 'Luc' })).toBe(false);
      expect(isFirstNameToComplete({ firstName: 'Marie Helene' })).toBe(false);
    });

    it('the rule is self-correcting: a fix already made stays made', () => {
      expect(isFirstNameToComplete({ firstName: 'Luc 2' })).toBe(true);
      expect(isFirstNameToComplete({ firstName: 'Sophie' })).toBe(false);
    });

    it('a number anywhere but glued at the end does not make a manufactured first name', () => {
      expect(isFirstNameToComplete({ firstName: '2 Luc' })).toBe(false);
      expect(isFirstNameToComplete({ firstName: 'Luc2' })).toBe(false);
    });
  });

  describe('computeGroupProgress', () => {
    const r = (firstName: string, lastName: string, groupId: string | null, rsvpStatus: string | null) =>
      ({ firstName, lastName, groupId, rsvpStatus });

    it('counts headcount, names left to fill in and answers per category', () => {
      const m = computeGroupProgress([
        r('', 'ARDOUIN', 'g1', 'PENDING'),
        r('', 'MERY', 'g1', 'ACCEPTED'),
        r('Luc', 'ARDOUIN', 'g1', 'DECLINED'),
        r('', 'SIMON', 'g2', 'MAYBE'),
      ]);
      expect(m.get('g1')).toEqual({ total: 3, missingFirstName: 2, answered: 2 });
      expect(m.get('g2')).toEqual({ total: 1, missingFirstName: 1, answered: 0 });
    });

    it('a completed category carries a zero remainder, and says so', () => {
      const m = computeGroupProgress([r('Luc', 'ARDOUIN', 'g1', 'ACCEPTED')]);
      expect(m.get('g1')).toEqual({ total: 1, missingFirstName: 0, answered: 1 });
    });

    it('ignores guests with no category', () => {
      expect(computeGroupProgress([r('', 'ARDOUIN', null, 'PENDING')]).size).toBe(0);
    });
  });

  describe('groupFamiliesToComplete', () => {
    const f = (firstName: string, lastName: string, groupId: string | null = 'g1', nameParticle: string | null = null) =>
      ({ firstName, lastName, groupId, nameParticle });

    it('returns the whole family — the named ones with the anonymous ones', () => {
      const [fam] = groupFamiliesToComplete(
        [f('Francois', 'AUGIER D\'IVRY'), f('', 'AUGIER D\'IVRY')],
        'g1',
      );
      expect(fam.lastName).toBe('AUGIER D\'IVRY');
      expect(fam.named.map((g) => g.firstName)).toEqual(['Francois']);
      expect(fam.missing).toHaveLength(1);
    });

    it('drops families where nothing is missing any more', () => {
      const out = groupFamiliesToComplete([f('Luc', 'ARDOUIN'), f('', 'MERY')], 'g1');
      expect(out.map((x) => x.lastName)).toEqual(['MERY']);
    });

    it('a family where nobody is named still shows up, without a landmark', () => {
      const [fam] = groupFamiliesToComplete([f('', 'MERY'), f('', 'MERY')], 'g1');
      expect(fam.named).toEqual([]);
      expect(fam.missing).toHaveLength(2);
    });

    it('does not cross the category boundary', () => {
      const out = groupFamiliesToComplete(
        [f('', 'ARDOUIN', 'g1'), f('Luc', 'ARDOUIN', 'g2')],
        'g1',
      );
      expect(out[0].named).toEqual([]);
    });

    it('the particle is part of the family identity', () => {
      const out = groupFamiliesToComplete(
        [f('', 'PRESLE', 'g1', 'de la'), f('Jean', 'PRESLE', 'g1', null)],
        'g1',
      );
      expect(out).toHaveLength(1);
      expect(out[0].lastName).toBe('DE LA PRESLE');
      expect(out[0].named).toEqual([]);
    });

    it('sorts families by last name, particle excluded from the ordering', () => {
      const out = groupFamiliesToComplete(
        [f('', 'SIMON'), f('', 'AUBREE'), f('', 'PRESLE', 'g1', 'de la')],
        'g1',
      );
      expect(out.map((x) => x.lastName)).toEqual(['AUBREE', 'DE LA PRESLE', 'SIMON']);
    });

    it('returns an empty array for a completed category', () => {
      expect(groupFamiliesToComplete([f('Luc', 'ARDOUIN')], 'g1')).toEqual([]);
    });
  });
});

describe('groupsBySide', () => {
  const g = (name: string, side?: GuestGroupSide, sortOrder?: number): GuestGroup =>
    ({ id: name, name, side, sortOrder, createdAt: null, updatedAt: null });

  it('returns one section per side, in display order', () => {
    const sections = groupsBySide([
      g('Amis communs', 'BOTH', 1),
      g('Amis Emma', 'PARTNER_2', 3),
      g('Fontaines', 'PARTNER_1', 2),
      g('Didot', 'PARTNER_1', 1),
      g('Mathieu', 'PARTNER_2', 1),
    ]);
    expect(sections.map((s) => s.side)).toEqual(['PARTNER_1', 'PARTNER_2', 'BOTH']);
    expect(sections[0].groups.map((x) => x.name)).toEqual(['Didot', 'Fontaines']);
    expect(sections[1].groups.map((x) => x.name)).toEqual(['Mathieu', 'Amis Emma']);
  });

  it('a sideless category forms a last section rather than disappearing', () => {
    const sections = groupsBySide([g('Orpheline'), g('Didot', 'PARTNER_1', 1)]);
    expect(sections.map((s) => s.side)).toEqual(['PARTNER_1', null]);
    expect(sections[1].groups.map((x) => x.name)).toEqual(['Orpheline']);
  });

  it('returns an empty array with no category', () => {
    expect(groupsBySide([])).toEqual([]);
  });
});

describe('buildGuestListData', () => {
  const u = (id: string) => ({ id });
  const sec = (id: string, n: number, side: GuestGroupSide | null = 'PARTNER_1') => ({
    group: { id, side },
    guests: Array.from({ length: n }, (_, i) => u(`${id}-${i}`)),
  });

  it('marks exactly the category headers as sticky, and nothing else', () => {
    const { items, stickyIndices } = buildGuestListData(
      [], [sec('a', 2), sec('b', 3)], new Set(['a', 'b']),
    );
    for (const i of stickyIndices) expect(items[i].kind).toBe('group-header');
    expect(items.filter((x) => x.kind === 'group-header')).toHaveLength(stickyIndices.length);
    // The list sticks only ONE header at a time, and the category is the one
    // worth keeping in sight — so the side header is deliberately not sticky.
    for (const i of stickyIndices) expect(items[i].kind).not.toBe('side-header');
  });

  it('inserts one side header at each side change, and only one', () => {
    const { items } = buildGuestListData(
      [],
      [sec('a', 1, 'PARTNER_1'), sec('b', 1, 'PARTNER_1'), sec('c', 1, 'PARTNER_2'), sec('d', 1, 'BOTH')],
      new Set(),
    );
    expect(items.filter((x) => x.kind === 'side-header')).toEqual([
      { kind: 'side-header', side: 'PARTNER_1' },
      { kind: 'side-header', side: 'PARTNER_2' },
      { kind: 'side-header', side: 'BOTH' },
    ]);
  });

  it('the side header precedes the first category of its side', () => {
    const { items } = buildGuestListData([], [sec('a', 1, 'PARTNER_2')], new Set());
    expect(items[0]).toEqual({ kind: 'side-header', side: 'PARTNER_2' });
    expect(items[1].kind).toBe('group-header');
  });

  it('a sideless category gets its own side header', () => {
    const { items } = buildGuestListData(
      [], [sec('a', 1, 'PARTNER_1'), sec('z', 1, null)], new Set(),
    );
    expect(items.filter((x) => x.kind === 'side-header').map((x: any) => x.side))
      .toEqual(['PARTNER_1', null]);
  });

  it('the sticky indices account for the side headers', () => {
    const { items, stickyIndices } = buildGuestListData(
      [], [sec('a', 2, 'PARTNER_1'), sec('b', 3, 'PARTNER_2')], new Set(['a', 'b']),
    );
    expect(stickyIndices).toEqual([1, 5]);
    expect(items).toHaveLength(9);
  });

  it('guests of a collapsed category are omitted, and the indices follow', () => {
    const { items, stickyIndices } = buildGuestListData(
      [], [sec('a', 2), sec('b', 3)], new Set(['b']),
    );
    expect(stickyIndices).toEqual([1, 2]);
    expect(items).toHaveLength(6);
    expect((items[1] as any).collapsed).toBe(true);
  });

  it('guests with no category open the list and shift everything', () => {
    const { items, stickyIndices } = buildGuestListData(
      [u('x'), u('y')], [sec('a', 1)], new Set(['a']),
    );
    expect(items[2]).toEqual({ kind: 'side-header', side: 'PARTNER_1' });
    expect(stickyIndices).toEqual([3]);
  });

  it('with no category, no side header and no sticky index', () => {
    const { items, stickyIndices } = buildGuestListData([u('x')], [], new Set());
    expect(stickyIndices).toEqual([]);
    expect(items.filter((x) => x.kind === 'side-header')).toEqual([]);
  });
});

describe('formatGuestGroupName', () => {
  it('strips the side prefix', () => {
    expect(formatGuestGroupName('[A] Didot')).toBe('Didot');
    expect(formatGuestGroupName('[A&E] Amis communs')).toBe('Amis communs');
  });

  it('leaves a prefix-less label untouched', () => {
    expect(formatGuestGroupName('Didot')).toBe('Didot');
  });

  it('does not empty a label that is ONLY its prefix', () => {
    // An odd label beats a nameless row.
    expect(formatGuestGroupName('[A]')).toBe('[A]');
  });
});

describe('resolveGroupSides', () => {
  const wedding = { partner1Name: 'Adrien', partner2Name: 'Emma' };
  const g = (name: string, side?: GuestGroupSide): GuestGroup =>
    ({ id: name, name, side, createdAt: null, updatedAt: null });

  it('infers the side by matching the prefix against the wedding first names', () => {
    const out = resolveGroupSides(
      [g('[A] Didot'), g('[E] Mathieu'), g('[A&E] Amis communs')],
      wedding,
    );
    expect(out.map((x) => x.side)).toEqual(['PARTNER_1', 'PARTNER_2', 'BOTH']);
  });

  it('hardcodes no first name — another couple is inferred the same way', () => {
    const out = resolveGroupSides(
      [g('[C] Famille Claire'), g('[B] Famille Basile'), g('[B&C] Communs')],
      { partner1Name: 'Claire', partner2Name: 'Basile' },
    );
    expect(out.map((x) => x.side)).toEqual(['PARTNER_1', 'PARTNER_2', 'BOTH']);
  });

  it('a DECLARED side passes through, without being re-inferred', () => {
    const [out] = resolveGroupSides([g('[A] Didot', 'PARTNER_2')], wedding);
    expect(out.side).toBe('PARTNER_2');
  });

  it('a prefix matching nobody infers nothing, rather than guessing', () => {
    expect(resolveGroupSides([g('[Z] Mystère')], wedding)[0].side).toBeNull();
    expect(resolveGroupSides([g('Sans préfixe')], wedding)[0].side).toBeNull();
  });

  it('with no wedding on file, nothing is inferred', () => {
    expect(resolveGroupSides([g('[A] Didot')], null)[0].side).toBeNull();
    expect(resolveGroupSides([g('[A] Didot')], { partner1Name: null, partner2Name: null })[0].side)
      .toBeNull();
  });

  it('does not mutate the categories it is given', () => {
    const input = [g('[A] Didot')];
    resolveGroupSides(input, wedding);
    expect(input[0].side).toBeUndefined();
  });

  it('the projection makes the categories sortable and groupable as they are', () => {
    const out = sortGroups(resolveGroupSides(
      [g('[A&E] Amis communs'), g('[E] Mathieu'), g('[A] Didot')],
      wedding,
    ));
    expect(out.map((x) => formatGuestGroupName(x.name)))
      .toEqual(['Didot', 'Mathieu', 'Amis communs']);
  });
});

describe('nextFirstNameToComplete', () => {
  const g = (id: string, lastName: string, firstName: string, groupId = 'gr1') =>
    ({ id, lastName, firstName, groupId });

  // Ordre d'affichage : ALBERT, BOYER (blanc), CARON (fabriqué), DUPONT (blanc).
  const guests = [
    g('d', 'Dupont', ''),
    g('a', 'Albert', 'Anne'),
    g('c', 'Caron', 'Luc 2'),
    g('b', 'Boyer', ''),
  ];

  it('rend le premier blanc de la catégorie', () => {
    expect(nextFirstNameToComplete(guests, 'gr1')?.id).toBe('b');
  });

  it('enchaîne depuis celui qu’on vient de nommer, même s’il n’est plus à compléter', () => {
    expect(nextFirstNameToComplete(guests, 'gr1', 'b')?.id).toBe('c');
    expect(nextFirstNameToComplete(guests, 'gr1', 'c')?.id).toBe('d');
  });

  it('rend null après le dernier blanc', () => {
    expect(nextFirstNameToComplete(guests, 'gr1', 'd')).toBeNull();
  });

  it('rend null sur une catégorie entièrement nommée', () => {
    const nommés = [g('x', 'Albert', 'Anne'), g('y', 'Boyer', 'Bruno')];
    expect(nextFirstNameToComplete(nommés, 'gr1')).toBeNull();
  });

  it('ignore les autres catégories', () => {
    expect(nextFirstNameToComplete(guests, 'gr2')).toBeNull();
  });

  it('une ancre absente reprend au début', () => {
    expect(nextFirstNameToComplete(guests, 'gr1', 'inconnu')?.id).toBe('b');
  });
});

describe('selectRange', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];

  it('coche la plage descendante, bornes incluses', () => {
    expect(selectRange(ids, 'b', 'd')).toEqual(['b', 'c', 'd']);
  });

  it('coche la plage montante, bornes incluses', () => {
    expect(selectRange(ids, 'd', 'b')).toEqual(['b', 'c', 'd']);
  });

  it('une ancre égale à la cible rend la seule cible', () => {
    expect(selectRange(ids, 'c', 'c')).toEqual(['c']);
  });

  it('une ancre disparue de la liste rend la seule cible', () => {
    expect(selectRange(ids, 'zz', 'c')).toEqual(['c']);
    expect(selectRange(ids, null, 'c')).toEqual(['c']);
  });

  it('une cible absente ne coche rien', () => {
    expect(selectRange(ids, 'a', 'zz')).toEqual([]);
  });
});

describe('adjacentGuestId', () => {
  const items = buildGuestListData<{ id: string }, { id: string; side: null }>(
    [],
    [
      { group: { id: 'g1', side: null }, guests: [{ id: 'a' }, { id: 'b' }] },
      { group: { id: 'g2', side: null }, guests: [{ id: 'c' }] },
    ],
    new Set(['g1', 'g2']),
  ).items;

  it('traverse les en-têtes intercalés', () => {
    expect(adjacentGuestId(items, 'b', 'next')).toBe('c');
    expect(adjacentGuestId(items, 'c', 'prev')).toBe('b');
  });

  it('rend null aux deux bornes', () => {
    expect(adjacentGuestId(items, 'a', 'prev')).toBeNull();
    expect(adjacentGuestId(items, 'c', 'next')).toBeNull();
  });

  it('rend null pour un invité absent de la liste visible', () => {
    expect(adjacentGuestId(items, 'zz', 'next')).toBeNull();
  });
});

describe('newGuestDraft — le gabarit de création', () => {
  const base = {
    id: 'g1',
    now: '2026-06-01T10:00:00.000Z',
    firstName: 'Léa',
    lastName: 'fleith',
    groupId: 'grp-1',
    invitationType: 'FULL',
    rsvpStatus: 'PENDING',
    isChild: false,
  };

  it('pose les défauts de création, horodatage compris', () => {
    const draft = newGuestDraft(base);
    expect(draft).toMatchObject({
      id: 'g1',
      diet: 'STANDARD',
      transportMode: 'car',
      noTableNeeded: false,
      thankYouSent: false,
      parkingNeeded: false,
      isChild: false,
      groupId: 'grp-1',
      invitationType: 'FULL',
      householdId: null,
      createdAt: base.now,
      updatedAt: base.now,
    });
  });

  it('ne laisse aucun champ du schéma indéfini', () => {
    const draft = newGuestDraft(base);
    const undefinedFields = Object.entries(draft)
      .filter(([, v]) => v === undefined)
      .map(([k]) => k);
    expect(undefinedFields).toEqual([]);
    // Les champs que la fiche n'écrit pas à la création existent tout de même.
    expect(draft).toHaveProperty('rsvpToken', null);
    expect(draft).toHaveProperty('side', null);
    expect(draft).toHaveProperty('childrenCount', null);
  });

  it('normalise le patronyme en capitales et garde la particule telle que tapée', () => {
    const draft = newGuestDraft({ ...base, lastName: '  fleith ', nameParticle: ' de la ' });
    expect(draft.lastName).toBe('FLEITH');
    expect(draft.nameParticle).toBe('de la');
  });

  it('une particule vide est nulle, pas une chaîne vide', () => {
    expect(newGuestDraft({ ...base, nameParticle: '   ' }).nameParticle).toBeNull();
    expect(newGuestDraft(base).nameParticle).toBeNull();
  });

  it('horodate la réponse pour un état non-PENDING, et la laisse nulle sinon', () => {
    expect(newGuestDraft({ ...base, rsvpStatus: 'ACCEPTED' })).toMatchObject({
      rsvpStatus: 'ACCEPTED',
      rsvpDate: base.now,
    });
    expect(newGuestDraft(base)).toMatchObject({ rsvpStatus: 'PENDING', rsvpDate: null });
  });

  it('reprend le foyer fourni', () => {
    expect(newGuestDraft({ ...base, householdId: 'foyer-1' }).householdId).toBe('foyer-1');
  });

  it('sans prénom, l\'invité créé est « à compléter » et compte pour sa catégorie', () => {
    const draft = newGuestDraft({ ...base, firstName: '' });
    expect(isFirstNameToComplete(draft)).toBe(true);
    const témoin = [
      { firstName: 'Anne', lastName: 'FLEITH', groupId: 'grp-1', rsvpStatus: 'PENDING' },
      { firstName: '', lastName: 'ROUX', groupId: 'grp-2', rsvpStatus: 'PENDING' },
    ];
    const avant = computeGroupProgress(témoin);
    const après = computeGroupProgress([...témoin, draft]);
    expect(avant.get('grp-1')).toMatchObject({ total: 1, missingFirstName: 0 });
    expect(après.get('grp-1')).toMatchObject({ total: 2, missingFirstName: 1 });
    // La catégorie voisine ne bouge pas.
    expect(après.get('grp-2')).toEqual(avant.get('grp-2'));
  });
});

describe('resolveChainedHousehold — le foyer que reprend une création enchaînée', () => {
  const guests = [
    { id: 'a', householdId: 'foyer-1' },
    { id: 'b', householdId: null },
  ];

  it('reprend le foyer du précédent quand il en a un', () => {
    expect(resolveChainedHousehold(guests, 'a', 'frais')).toEqual({
      householdId: 'foyer-1',
      attachPrevious: false,
    });
  });

  it('bat un foyer frais et y fait entrer le précédent quand il n\'en a pas', () => {
    expect(resolveChainedHousehold(guests, 'b', 'frais')).toEqual({
      householdId: 'frais',
      attachPrevious: true,
    });
  });

  it('rend « pas de foyer » quand le précédent a disparu ou n\'existe pas', () => {
    const aucun = { householdId: null, attachPrevious: false };
    expect(resolveChainedHousehold(guests, 'envolé', 'frais')).toEqual(aucun);
    expect(resolveChainedHousehold(guests, null, 'frais')).toEqual(aucun);
    expect(resolveChainedHousehold([], 'a', 'frais')).toEqual(aucun);
  });

  it('ne rend qu\'un identifiant et un booléen — aucune entité de foyer', () => {
    const r = resolveChainedHousehold(guests, 'b', 'frais');
    expect(Object.keys(r).sort()).toEqual(['attachPrevious', 'householdId']);
  });
});
