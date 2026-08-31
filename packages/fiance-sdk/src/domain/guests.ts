// NodeNext .js extension required
import type { Guest, Table, GuestGroup, GuestGroupSide, Wedding } from './schema.js';

export type NamedGuest = Pick<Guest, 'firstName' | 'lastName' | 'nameParticle'>;

export interface GuestCounts {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
  cocktail_count: number;
  dinner_count: number;
  full_count: number;
  both_days_count: number;
  // Per-invitation-type counts keyed by the actual invitation-type id (the dynamic
  // `useInvitationTypesStore` ids — including custom types — not a hardcoded enum), for
  // per-invitation-type vendor pricing.
  //  - inv_by_type: billable pool. Accepted guests of each type; before any RSVP (nobody
  //    accepted) it falls back to non-declined guests so previews aren't all zero.
  //  - inv_by_type_all: ALL guests of each type regardless of RSVP — matches the guest
  //    screen's invitation-type filter counts exactly.
  inv_by_type: Record<string, number>;
  inv_by_type_all: Record<string, number>;
  children_count: number;
  vegetarian_count: number;
  sleeping_count: number;
  response_rate: number;
  no_table_count: number;
  no_accommodation_count: number;
  thank_you_pending_count: number;
}

export function computeCounts(guests: Guest[]): GuestCounts {
  const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
  const total = guests.length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "DECLINED").length;
  const acceptedCount = accepted.length;

  // For per-invitation-type pricing: bill accepted guests of each exact type. Before any
  // RSVP (no accepted), estimate from non-declined guests so previews aren't all zero.
  const invPool = acceptedCount > 0 ? accepted : guests.filter((g) => g.rsvpStatus !== "DECLINED");
  const groupByType = (pool: Guest[]): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const g of pool) {
      const key = g.invitationType;
      if (key == null) continue;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  };

  return {
    total,
    accepted: acceptedCount,
    declined: declinedCount,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
    maybe: guests.filter((g) => g.rsvpStatus === "MAYBE").length,
    cocktail_count: accepted.filter((g) =>
      ["COCKTAIL", "FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    dinner_count: accepted.filter((g) =>
      ["FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    full_count: accepted.filter((g) => g.invitationType === "FULL").length,
    both_days_count: accepted.filter((g) => g.invitationType === "BOTH_DAYS").length,
    inv_by_type: groupByType(invPool),
    inv_by_type_all: groupByType(guests),
    children_count: accepted.reduce((sum, g) => sum + (g.childrenCount ?? 0), 0),
    vegetarian_count: accepted.filter((g) =>
      ["VEGETARIAN", "VEGAN"].includes(g.diet || "")
    ).length,
    sleeping_count: accepted.filter((g) => g.isSleeping).length,
    response_rate:
      total > 0
        ? Math.round(((acceptedCount + declinedCount) / total) * 100)
        : 0,
    no_table_count: accepted.filter((g) => !g.tableId && !g.noTableNeeded).length,
    no_accommodation_count: accepted.filter((g) => !g.accommodationId).length,
    thank_you_pending_count: accepted.filter((g) => !g.thankYouSent).length,
  };
}

// ─── Pure guest reducers ─────────────────────────────────────────────────────

export function addGuest(guests: Guest[], guest: Guest): Guest[] {
  return [...guests, guest];
}

export function updateGuest(guests: Guest[], id: string, updates: Partial<Guest>): Guest[] {
  return applyGuestUpdates(guests, [id], () => updates);
}

function removeOneGuest(guests: Guest[], id: string): Guest[] {
  const now = new Date().toISOString();
  // cascade unlinks: any guest pointing to the deleted guest as companion gets companionId=null
  const toUnlink = new Set(
    guests.filter(g => g.id !== id && g.companionId === id).map(g => g.id)
  );
  // also unlink the deleted guest's own companion
  const deleted = guests.find(g => g.id === id);
  if (deleted?.companionId) toUnlink.add(deleted.companionId);
  return guests
    .filter(g => g.id !== id)
    .map(g => toUnlink.has(g.id) ? { ...g, companionId: null, updatedAt: now } : g);
}

// ─── Batch removal and update ────────────────────────────────────────────────
//
// A batch is the FOLD of the unit operation, so the two cannot diverge — the
// companion-unlink cascade included. O(N·M) is deliberate: what costs in a bulk
// delete is WRITING N times, and the store is what hoists the writes out of the
// loop.

export function removeGuests(guests: Guest[], ids: string[]): Guest[] {
  return ids.reduce((acc, id) => removeOneGuest(acc, id), guests);
}

export function removeGuest(guests: Guest[], id: string): Guest[] {
  return removeGuests(guests, [id]);
}

export function applyGuestUpdates(
  guests: Guest[],
  ids: string[],
  updatesFor: (guest: Guest) => Partial<Guest>,
): Guest[] {
  const now = new Date().toISOString();
  const targets = new Set(ids);
  return guests.map(g => targets.has(g.id) ? { ...g, ...updatesFor(g), updatedAt: now } : g);
}

/**
 * RSVP status and the date that goes with it — the single place that rule
 * lives, so the guest screen and the batch path cannot read it differently.
 */
export function rsvpStatusUpdate(
  guest: Pick<Guest, 'rsvpStatus' | 'rsvpDate'>,
  status: string,
  now: string,
): Partial<Guest> {
  return {
    rsvpStatus: status,
    rsvpDate:
      status !== "PENDING" && status !== guest.rsvpStatus
        ? now
        : guest.rsvpDate || null,
  };
}

export function linkCompanion(guests: Guest[], guestId: string, companionId: string): Guest[] {
  // mutual link; unlink any prior companions of both
  const now = new Date().toISOString();
  const oldCG = guests.find(g => g.companionId === guestId && g.id !== companionId);
  const oldCT = guests.find(g => g.companionId === companionId && g.id !== guestId);
  return guests.map(g => {
    if (g.id === guestId) return { ...g, companionId, updatedAt: now };
    if (g.id === companionId) return { ...g, companionId: guestId, updatedAt: now };
    if (oldCG && g.id === oldCG.id) return { ...g, companionId: null, updatedAt: now };
    if (oldCT && g.id === oldCT.id) return { ...g, companionId: null, updatedAt: now };
    return g;
  });
}

export function unlinkCompanion(guests: Guest[], guestId: string): Guest[] {
  const now = new Date().toISOString();
  const guest = guests.find(g => g.id === guestId);
  if (!guest?.companionId) return guests;
  const cId = guest.companionId;
  return guests.map(g => (g.id === guestId || g.id === cId) ? { ...g, companionId: null, updatedAt: now } : g);
}

// ─── Pure table reducers ─────────────────────────────────────────────────────

export function addTable(tables: Table[], table: Table): Table[] {
  return [...tables, table];
}

export function updateTable(tables: Table[], id: string, updates: Partial<Table>): Table[] {
  return tables.map(t => t.id === id ? { ...t, ...updates } : t);
}

export function removeTable(tables: Table[], guests: Guest[], id: string): { tables: Table[]; guests: Guest[] } {
  return {
    tables: tables.filter(t => t.id !== id),
    guests: guests.map(g => g.tableId === id ? { ...g, tableId: null } : g),
  };
}

// ─── Pure group reducers ─────────────────────────────────────────────────────

export function addGroup(groups: GuestGroup[], group: GuestGroup): GuestGroup[] {
  return [...groups, group];
}

export function updateGroup(groups: GuestGroup[], id: string, updates: Partial<GuestGroup>): GuestGroup[] {
  const now = new Date().toISOString();
  return groups.map(g => g.id === id ? { ...g, ...updates, updatedAt: now } : g);
}

export function removeGroup(groups: GuestGroup[], guests: Guest[], id: string): { groups: GuestGroup[]; guests: Guest[] } {
  return {
    groups: groups.filter(g => g.id !== id),
    guests: guests.map(g => g.groupId === id ? { ...g, groupId: null } : g),
  };
}

// ─── Pure query helpers ──────────────────────────────────────────────────────

export function getGuestsByTable(guests: Guest[], tableId: string): Guest[] {
  return guests.filter(g => g.tableId === tableId);
}

export function getUnassignedGuests(guests: Guest[]): Guest[] {
  return guests.filter(g => g.rsvpStatus === 'ACCEPTED' && !g.tableId);
}

// Count guests that share the same (trimmed, case-insensitive) first + last name with at
// least one other guest — surfaces likely duplicate entries (e.g. from re-import).
export function countDuplicateGuests(guests: Guest[]): number {
  const seen = new Map<string, number>();
  for (const g of guests) {
    const key = `${g.firstName.trim().toLowerCase()}|${g.lastName.trim().toLowerCase()}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  let dup = 0;
  for (const n of seen.values()) if (n > 1) dup += n;
  return dup;
}

// ─── Displayed name ──────────────────────────────────────────────────────────
//
// The particle is displayed but stays OUT of the sort key — that is the whole
// point of storing it apart: the existing sort code becomes right untouched.

/** Uppercased surname, particle included: « DE LA PRESLE ». */
export function formatGuestLastName(g: NamedGuest): string {
  const particle = (g.nameParticle ?? "").trim().toUpperCase();
  const last = (g.lastName ?? "").trim();
  if (!particle) return last;
  // « D' » sticks to the name, « DE LA » is separated by a space.
  const glue = /['’]$/.test(particle) ? "" : " ";
  return last ? `${particle}${glue}${last}` : particle;
}

export function formatGuestName(g: NamedGuest): string {
  return [formatGuestLastName(g), (g.firstName ?? "").trim()].filter(Boolean).join(" ");
}

// A name read on screen but not found when typed back is a trap: matching
// `firstName` and `lastName` separately misses the particle and any two parts
// in a row. Search therefore matches the COMPOSED name, from one place.
export function guestNameMatches(g: NamedGuest, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    (g.firstName ?? "").toLowerCase().includes(q) ||
    (g.lastName ?? "").toLowerCase().includes(q) ||
    formatGuestName(g).toLowerCase().includes(q)
  );
}

// ─── Category side and order ─────────────────────────────────────────────────
//
// Array order is NOT insertion order once a device hydrates from the Space:
// groups come back out of an `Object.entries()` over an id-keyed document, so
// the order is a serialisation accident that differs from device to device.
// Sorting explicitly is what makes the order a contract.

const SIDE_RANK: Record<GuestGroupSide, number> = {
  PARTNER_1: 0,
  PARTNER_2: 1,
  BOTH: 2,
};

function sideRank(side: GuestGroupSide | null | undefined): number {
  return side ? SIDE_RANK[side] : 3;
}

/** Sorts categories: side, then declared rank, then name. */
export function sortGroups(groups: GuestGroup[]): GuestGroup[] {
  return [...groups].sort((a, b) => {
    const bySide = sideRank(a.side) - sideRank(b.side);
    if (bySide !== 0) return bySide;
    // Compared rather than subtracted: Infinity - Infinity is NaN, which would
    // silently stop two rankless categories from being ordered by name.
    const ra = a.sortOrder ?? Infinity;
    const rb = b.sortOrder ?? Infinity;
    if (ra !== rb) return ra < rb ? -1 : 1;
    // `sensitivity: "base"` so an accent or a capital does not exile a category
    // to the other end of the list — « Émile » must neighbour « Emile ».
    return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
  });
}

// ─── Side deduced from the label prefix ──────────────────────────────────────
//
// Categories predating the `side` field still carry a bracketed prefix —
// « [A] Didot », « [A&E] Amis communs ». Deducing the side from it avoids a
// data migration and WRITES NOTHING: a category that declares `side` never
// reaches this path, so it dies out on its own. Nothing is hardcoded — prefix
// tokens are matched against the WEDDING's partner first names, and a prefix
// that matches nobody deduces nothing rather than guessing.

const SIDE_PREFIX = /^\s*\[([^\]]+)\]\s*/;

/** Display-only: the STORED label keeps its prefix. */
export function formatGuestGroupName(name: string): string {
  return (name ?? "").replace(SIDE_PREFIX, "").trim() || (name ?? "").trim();
}

function sideFromPrefix(
  name: string,
  wedding: Pick<Wedding, "partner1Name" | "partner2Name"> | null | undefined,
): GuestGroupSide | null {
  const m = SIDE_PREFIX.exec(name ?? "");
  if (!m) return null;
  const tokens = m[1]
    .split(/[&+,/]/)
    .map((t) => t.trim().toLocaleLowerCase("fr"))
    .filter(Boolean);
  if (tokens.length === 0) return null;

  const matches = (firstName: string | null | undefined) => {
    const p = (firstName ?? "").trim().toLocaleLowerCase("fr");
    return p !== "" && tokens.some((t) => p.startsWith(t));
  };
  const one = matches(wedding?.partner1Name);
  const two = matches(wedding?.partner2Name);
  if (one && two) return "BOTH";
  if (one) return "PARTNER_1";
  if (two) return "PARTNER_2";
  return null;
}

/**
 * Categories with their side resolved — declared if it is, deduced otherwise.
 *
 * A read PROJECTION: nothing is written, nothing is synced. Everything that
 * orders or groups categories starts here, so one place decides what a
 * category's side is.
 */
export function resolveGroupSides(
  groups: GuestGroup[],
  wedding: Pick<Wedding, "partner1Name" | "partner2Name"> | null | undefined,
): GuestGroup[] {
  return groups.map((g) =>
    g.side ? g : { ...g, side: sideFromPrefix(g.name, wedding) },
  );
}

/** Labels the app supplies to compose a side. */
export interface GuestGroupSideLabels {
  /** Named template, `{name}` replaced by the partner's first name. */
  named: string;
  /** Fallbacks used when the wedding gives no first name for the partner. */
  partner1: string;
  partner2: string;
  both: string;
  none: string;
}

export function formatGuestGroupSide(
  side: GuestGroupSide | null | undefined,
  wedding: Pick<Wedding, "partner1Name" | "partner2Name"> | null | undefined,
  labels: GuestGroupSideLabels,
): string {
  if (side === "BOTH") return labels.both;
  if (side === "PARTNER_1" || side === "PARTNER_2") {
    const name = (side === "PARTNER_1" ? wedding?.partner1Name : wedding?.partner2Name)?.trim();
    if (name) return labels.named.replace("{name}", name);
    return side === "PARTNER_1" ? labels.partner1 : labels.partner2;
  }
  return labels.none;
}

// ─── The first name still to be found ────────────────────────────────────────
//
// An EMPTY first name is a legitimate state — a gap that shows, counts and gets
// corrected — where a fabricated one would pass itself off as data. Everything
// below is COMPUTED on read: a maintained counter would be a second state to
// keep in agreement with the first.

export type IncompleteGuest = Pick<Guest, "firstName" | "lastName" | "groupId">;

// First names fabricated by an import: a name, a space, a number. « Luc 1 » is
// a household contact given a disambiguation suffix, « Luc 2 » is their spouse,
// lent the same name for want of a better one. Neither is a first name.
const SYNTHETIC_FIRST_NAME = /\s\d+$/;

/**
 * A guest whose first name is still to be found.
 *
 * The rule is SELF-CORRECTING, which is what makes it safe: as soon as a first
 * name is entered it stops matching, so nothing has to be written down for the
 * count to be right.
 */
export function isFirstNameToComplete(g: Pick<Guest, "firstName">): boolean {
  const p = (g.firstName ?? "").trim();
  return p === "" || SYNTHETIC_FIRST_NAME.test(p);
}

export interface GuestGroupProgress {
  total: number;
  missingFirstName: number;
  /** Guests who answered — accepted or declined, like the global response rate. */
  answered: number;
}

/**
 * Per-category progress, in one pass. A category with no guest is absent from
 * the map; the display decides what it says about that.
 */
export function computeGroupProgress(
  guests: (IncompleteGuest & Pick<Guest, "rsvpStatus">)[],
): Map<string, GuestGroupProgress> {
  const out = new Map<string, GuestGroupProgress>();
  for (const g of guests) {
    if (!g.groupId) continue;
    let p = out.get(g.groupId);
    if (!p) {
      p = { total: 0, missingFirstName: 0, answered: 0 };
      out.set(g.groupId, p);
    }
    p.total++;
    if (isFirstNameToComplete(g)) p.missingFirstName++;
    if (g.rsvpStatus === "ACCEPTED" || g.rsvpStatus === "DECLINED") p.answered++;
  }
  return out;
}

function byName(a: IncompleteGuest, b: IncompleteGuest): number {
  return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, "fr");
}

export interface FamilyToComplete<T> {
  lastName: string;
  named: T[];
  missing: T[];
}

/**
 * The families of a category with at least one first name to find, with ALL
 * their members — those already named included.
 *
 * That is what makes the correction answerable: « AUGIER D'IVRY, ___ » cannot
 * be answered, « AUGIER D'IVRY: François, and ___ » can — the blank is his
 * spouse. Listing the unnamed on their own asks for a first name without
 * saying whose.
 */
export function groupFamiliesToComplete<T extends IncompleteGuest & Pick<Guest, "nameParticle">>(
  guests: T[],
  groupId: string,
): FamilyToComplete<T>[] {
  const families = new Map<string, T[]>();
  for (const g of guests) {
    if (g.groupId !== groupId) continue;
    const key = formatGuestLastName(g as NamedGuest).toLocaleLowerCase("fr");
    const bucket = families.get(key);
    if (bucket) bucket.push(g);
    else families.set(key, [g]);
  }

  const out: (FamilyToComplete<T> & { sortKey: string })[] = [];
  for (const members of families.values()) {
    const missing = members.filter(isFirstNameToComplete).sort(byName);
    if (missing.length === 0) continue;
    out.push({
      lastName: formatGuestLastName(members[0] as NamedGuest),
      // The particle stays out of the sort key, as in the guest list:
      // « de la Presle » files under P, not D.
      sortKey: (members[0].lastName ?? "").trim(),
      named: members.filter((g) => !isFirstNameToComplete(g)).sort(byName),
      missing,
    });
  }
  return out
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "fr", { sensitivity: "base" }))
    .map(({ sortKey: _sortKey, ...family }) => family);
}

export interface GuestGroupSideSection {
  side: GuestGroupSide | null;
  groups: GuestGroup[];
}

/**
 * Categories grouped under their side. One sort only, `sortGroups`, so the
 * category screen and the guest list show the same order.
 */
export function groupsBySide(groups: GuestGroup[]): GuestGroupSideSection[] {
  const sections: GuestGroupSideSection[] = [];
  for (const g of sortGroups(groups)) {
    const side = g.side ?? null;
    const last = sections[sections.length - 1];
    if (last && last.side === side) last.groups.push(g);
    else sections.push({ side, groups: [g] });
  }
  return sections;
}

// ─── List data and header positions ──────────────────────────────────────────
//
// Sticky headers are declared as a list of INDICES INTO the flattened items, so
// a stale index pins the wrong row. Items and indices therefore come out of one
// computation: producing them apart would be two sources for one truth.

export type GuestListEntry<G, GR> =
  | { kind: "guest"; guest: G }
  | { kind: "side-header"; side: GuestGroupSide | null }
  | { kind: "group-header"; group: GR; count: number; collapsed: boolean };

export interface GuestListData<G, GR> {
  items: GuestListEntry<G, GR>[];
  stickyIndices: number[];
}

export function buildGuestListData<
  G,
  GR extends { id: string; side?: GuestGroupSide | null },
>(
  ungrouped: readonly G[],
  sections: readonly { group: GR; guests: readonly G[] }[],
  expandedGroupIds: ReadonlySet<string>,
): GuestListData<G, GR> {
  const items: GuestListEntry<G, GR>[] = ungrouped.map((guest) => ({ kind: "guest", guest }));
  const stickyIndices: number[] = [];
  // `sections` arrives sorted by side then rank, so a side header is needed
  // only where the side CHANGES — no second ordering to diverge from the first.
  let prevSide: GuestGroupSide | null | undefined;
  for (const { group, guests } of sections) {
    const side = group.side ?? null;
    if (prevSide === undefined || side !== prevSide) {
      items.push({ kind: "side-header", side });
      prevSide = side;
    }
    const collapsed = !expandedGroupIds.has(group.id);
    // Only CATEGORY headers stick: `LegendList` pins one item at a time, and
    // the category is the one to keep in view while scrolling its guests.
    stickyIndices.push(items.length);
    items.push({ kind: "group-header", group, count: guests.length, collapsed });
    if (!collapsed) {
      for (const guest of guests) items.push({ kind: "guest", guest });
    }
  }
  return { items, stickyIndices };
}

