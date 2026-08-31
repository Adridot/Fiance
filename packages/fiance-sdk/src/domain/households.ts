// NodeNext .js extension required
import type { Guest, Household } from './schema.js';
import { formatGuestLastName } from './guests.js';

// ─── The household ───────────────────────────────────────────────────────────
//
// Two rules govern this whole file:
//
//   1. MEMBERSHIP IS CARRIED BY THE GUEST. `Guest.householdId` is the only
//      expression of "who is in which household". The household holds no member
//      list: sync merge is last-writer-wins PER ENTITY, and a member list would
//      lose a concurrent add by overwriting the whole list.
//
//   2. NO MEMBERSHIP MEANS A ONE-PERSON HOUSEHOLD. `resolveHousehold` always
//      returns a household, implicit or not, so no caller has to tell the two
//      cases apart.

export type HouseholdMember = Pick<Guest, 'id' | 'firstName' | 'lastName' | 'nameParticle' | 'householdId'>;

// ─── Reads ───────────────────────────────────────────────────────────────────

export function householdMembers<G extends Pick<Guest, 'householdId'>>(
  guests: G[],
  householdId: string,
): G[] {
  return guests.filter((g) => g.householdId === householdId);
}

/** A guest's household, ALWAYS — implicit and one-person when unattached. */
export function resolveHousehold<G extends Pick<Guest, 'id' | 'householdId'>>(
  households: Household[],
  guests: G[],
  guestId: string,
): { household: Household | null; members: G[]; implicit: boolean } {
  const guest = guests.find((g) => g.id === guestId);
  if (!guest) return { household: null, members: [], implicit: true };
  const id = guest.householdId;
  if (!id) return { household: null, members: [guest], implicit: true };
  // Grouping is `Guest.householdId` alone — the entity is optional, it only
  // carries the label and the address. Requiring it here once broke households
  // seeded before any entity existed into one envelope per member, silently.
  const household = households.find((h) => h.id === id) ?? null;
  const members = householdMembers(guests, id);
  return { household, members: members.length > 0 ? members : [guest], implicit: false };
}

/** Label DERIVED from the members — a READ fallback that never writes. */
export function deriveHouseholdName(members: HouseholdMember[]): string {
  const names: string[] = [];
  for (const m of members) {
    const name = formatGuestLastName(m);
    if (name && !names.includes(name)) names.push(name);
  }
  if (names.length === 0) return 'Foyer';
  return names.join(' · ');
}

export function householdName(
  household: Pick<Household, 'name'> | null,
  members: HouseholdMember[],
): string {
  const entered = household?.name?.trim();
  if (entered) return entered;
  return deriveHouseholdName(members);
}

function enumerateFr(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}

/**
 * Label PROPOSED for input — a starting point, never a written value. Distinct
 * from `deriveHouseholdName`, which stays the read fallback.
 *
 * Two deliberate departures: the first name comes first (`formatGuestName` puts
 * the surname first, which exists to make a column sorted on `lastName`
 * readable — an envelope is not a column), and surname case is left untouched,
 * because no automatic casing handles French particles and compound names, and
 * getting someone's name wrong on their invitation costs more than letting them
 * fix an editable field.
 */
export function proposeHouseholdName(members: HouseholdMember[]): string {
  const lastNames: string[] = [];
  for (const m of members) {
    const name = formatGuestLastName(m);
    if (name && !lastNames.includes(name)) lastNames.push(name);
  }
  if (lastNames.length <= 1) return deriveHouseholdName(members);
  const fullNames = members
    .map((m) => [(m.firstName ?? '').trim(), formatGuestLastName(m)].filter(Boolean).join(' '))
    .filter(Boolean);
  if (fullNames.length === 0) return deriveHouseholdName(members);
  return enumerateFr(fullNames);
}

/** A guest's mailing address — the household's, never the one on their record. */
export function householdAddress(
  households: Household[],
  guests: Pick<Guest, 'id' | 'householdId'>[],
  guestId: string,
): string | null {
  const { household } = resolveHousehold(households, guests, guestId);
  return household?.address?.trim() || null;
}

// ─── Reducers ────────────────────────────────────────────────────────────────

/**
 * Creates a household and attaches the named members. A guest belongs to AT
 * MOST one household, so the ones they leave behind empty disappear.
 */
export function createHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  households: Household[],
  guests: G[],
  memberIds: string[],
  id: string,
  fields: Partial<Pick<Household, 'name' | 'address'>> = {},
): { households: Household[]; guests: G[] } {
  const now = new Date().toISOString();
  const household: Household = {
    id,
    name: fields.name ?? null,
    address: fields.address ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const next = attachToHousehold(guests, memberIds, id);
  return {
    households: pruneEmptyHouseholds([...households, household], next),
    guests: next,
  };
}

export function updateHousehold(
  households: Household[],
  id: string,
  updates: Partial<Household>,
): Household[] {
  const now = new Date().toISOString();
  return households.map((h) => (h.id === id ? { ...h, ...updates, id: h.id, updatedAt: now } : h));
}

/**
 * Brings a household's entity into existence on first input, without touching
 * its composition.
 *
 * Keyed off `Guest.householdId`, never off `Recipient.id`: the latter holds a
 * GUEST id for an unattached guest, so an upsert on it would mint entities
 * nobody references — orphaned, dropped by the next `pruneEmptyHouseholds`, and
 * the address entered would vanish without a word.
 *
 * `updateHousehold` stays a pure `map` and creates nothing, so a caller cannot
 * create an entity while believing it updates one.
 */
export function materializeHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  households: Household[],
  guests: G[],
  memberIds: string[],
  fields: Partial<Pick<Household, 'name' | 'address'>>,
  newId: string,
): { households: Household[]; guests: G[]; id: string } {
  const byId = new Map(guests.map((g) => [g.id, g]));
  let carried: string | null = null;
  for (const mid of memberIds) {
    const id = byId.get(mid)?.householdId;
    if (id) {
      carried = id;
      break;
    }
  }

  if (!carried) {
    const r = createHousehold(households, guests, memberIds, newId, fields);
    return { ...r, id: newId };
  }

  const exists = households.some((h) => h.id === carried);
  if (exists) {
    return { households: updateHousehold(households, carried, fields), guests, id: carried };
  }
  const now = new Date().toISOString();
  const household: Household = {
    id: carried,
    name: fields.name ?? null,
    address: fields.address ?? null,
    createdAt: now,
    updatedAt: now,
  };
  return { households: [...households, household], guests, id: carried };
}

export function attachToHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  guests: G[],
  guestIds: string[],
  householdId: string,
): G[] {
  const now = new Date().toISOString();
  const ids = new Set(guestIds);
  return guests.map((g) =>
    ids.has(g.id) && g.householdId !== householdId ? { ...g, householdId, updatedAt: now } : g,
  );
}

/**
 * Removes members from their household. Each one stays a guest — an implicit
 * one-person household. A household the removal empties disappears, address
 * included.
 */
export function detachFromHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  households: Household[],
  guests: G[],
  guestIds: string[],
): { households: Household[]; guests: G[] } {
  const now = new Date().toISOString();
  const ids = new Set(guestIds);
  const next = guests.map((g) =>
    ids.has(g.id) && g.householdId ? { ...g, householdId: null, updatedAt: now } : g,
  );
  return { households: pruneEmptyHouseholds(households, next), guests: next };
}

/**
 * Splits a household: the named members move into a new one, the rest stay.
 * Splitting IS creating with a subset of the members, so the two cannot diverge.
 */
export function splitHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  households: Household[],
  guests: G[],
  memberIds: string[],
  newId: string,
  fields: Partial<Pick<Household, 'name' | 'address'>> = {},
): { households: Household[]; guests: G[] } {
  return createHousehold(households, guests, memberIds, newId, fields);
}

/** Deletes a household. Its members stay guests, without a household. */
export function removeHousehold<G extends Pick<Guest, 'id' | 'householdId' | 'updatedAt'>>(
  households: Household[],
  guests: G[],
  id: string,
): { households: Household[]; guests: G[] } {
  const now = new Date().toISOString();
  const next = guests.map((g) =>
    g.householdId === id ? { ...g, householdId: null, updatedAt: now } : g,
  );
  return { households: households.filter((h) => h.id !== id), guests: next };
}

/**
 * Drops the memberless households. Call after any operation that can empty one,
 * guest DELETION included.
 */
export function pruneEmptyHouseholds(
  households: Household[],
  guests: Pick<Guest, 'householdId'>[],
): Household[] {
  const populated = new Set(guests.map((g) => g.householdId).filter(Boolean) as string[]);
  return households.filter((h) => populated.has(h.id));
}

