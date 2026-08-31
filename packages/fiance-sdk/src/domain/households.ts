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

