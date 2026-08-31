import { create } from "zustand";
import * as Crypto from "expo-crypto";
import type { Guest, Table, GuestGroup, Household } from "@fiance/sdk";
import {
  computeCounts,
  addGuest as sdkAddGuest,
  removeGuests as sdkRemoveGuests,
  applyGuestUpdates as sdkApplyGuestUpdates,
  linkCompanion as sdkLinkCompanion,
  unlinkCompanion as sdkUnlinkCompanion,
  addTable as sdkAddTable,
  updateTable as sdkUpdateTable,
  removeTable as sdkRemoveTable,
  addGroup as sdkAddGroup,
  sortGroups,
  updateGroup as sdkUpdateGroup,
  removeGroup as sdkRemoveGroup,
  getGuestsByTable as sdkGetGuestsByTable,
  getUnassignedGuests as sdkGetUnassignedGuests,
  createHousehold as sdkCreateHousehold,
  updateHousehold as sdkUpdateHousehold,
  materializeHousehold as sdkMaterializeHousehold,
  attachToHousehold as sdkAttachToHousehold,
  detachFromHousehold as sdkDetachFromHousehold,
  splitHousehold as sdkSplitHousehold,
  removeHousehold as sdkRemoveHousehold,
  pruneEmptyHouseholds as sdkPruneEmptyHouseholds,
} from "@fiance/sdk";
export type { GuestCounts } from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import {
  persistGuests,
  persistTables,
  persistGroups,
  persistHouseholds,
  persistCommunications,
  persistWeddingRoleAssignments,
  persistSeatingConstraints,
  persistMealSelections,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";
import { maybeRequestReview } from "@/lib/store-review";
import {
  removeGuestFromAll,
  removeRoleAssignmentsForGuest,
  detachGuestFromConstraints,
  removeMealSelectionsForGuest,
} from "@fiance/sdk";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";

// Re-export computeCounts so existing callers of the store module still work
export { computeCounts };

function persistHouseholdsAndGuests(): void {
  const storage = getStorage();
  if (storage) {
    persistHouseholds(storage);
    persistGuests(storage);
  }
  notifySync();
}

interface GuestsState {
  guests: Guest[];
  tables: Table[];
  groups: GuestGroup[];
  // Membership is carried by the guest (`Guest.householdId`); this list only
  // holds household names and addresses.
  households: Household[];
  setGuests: (guests: Guest[]) => void;
  setTables: (tables: Table[]) => void;
  setGroups: (groups: GuestGroup[]) => void;
  setHouseholds: (households: Household[]) => void;
  createHousehold: (memberIds: string[], fields?: { name?: string | null; address?: string | null }) => string;
  updateHousehold: (id: string, updates: Partial<Household>) => void;
  /** Gives a household its entity on first edit, keeping the id its members already carry. */
  materializeHousehold: (
    memberIds: string[],
    fields: { name?: string | null; address?: string | null },
  ) => string;
  attachToHousehold: (guestIds: string[], householdId: string) => void;
  detachFromHousehold: (guestIds: string[]) => void;
  splitHousehold: (memberIds: string[]) => string;
  removeHousehold: (id: string) => void;
  addGuest: (guest: Guest) => void;
  importGuestData: (data: { guests: Guest[]; groups: GuestGroup[]; tables: Table[] }) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  removeGuests: (ids: string[]) => void;
  updateGuests: (ids: string[], updatesFor: (guest: Guest) => Partial<Guest>) => void;
  linkCompanion: (guestId: string, companionId: string) => void;
  unlinkCompanion: (guestId: string) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
  addGroup: (group: GuestGroup) => void;
  updateGroup: (id: string, updates: Partial<GuestGroup>) => void;
  removeGroup: (id: string) => void;
  getCounts: () => ReturnType<typeof computeCounts>;
  getGuestsByTable: (tableId: string) => Guest[];
  getUnassignedGuests: () => Guest[];
}

export const useGuestsStore = create<GuestsState>((set, get) => ({
  guests: [],
  tables: [],
  groups: [],
  households: [],
  setGuests: (guests) => set({ guests }),
  setTables: (tables) => set({ tables }),
  setHouseholds: (households) => set({ households }),
  // Hydration yields groups in serialization order, which differs from device to
  // device, so the order is settled on write. Only the declared side is known here:
  // screens sort again once they have projected the deduced one (`resolveGroupSides`).
  setGroups: (groups) => set({ groups: sortGroups(groups) }),

  createHousehold: (memberIds, fields = {}) => {
    const id = Crypto.randomUUID();
    set((s) => sdkCreateHousehold(s.households, s.guests, memberIds, id, fields));
    persistHouseholdsAndGuests();
    return id;
  },
  // A plain map, never an upsert: creating an entity is `materializeHousehold`.
  updateHousehold: (id, updates) => {
    set((s) => ({ households: sdkUpdateHousehold(s.households, id, updates) }));
    const storage = getStorage();
    if (storage) persistHouseholds(storage);
    notifySync();
  },
  // The fresh id only serves the case where no member carries one yet: reusing the
  // members' `householdId` is what keeps the new entity from being orphaned.
  materializeHousehold: (memberIds, fields) => {
    const fresh = Crypto.randomUUID();
    let id = fresh;
    set((s) => {
      const r = sdkMaterializeHousehold(s.households, s.guests, memberIds, fields, fresh);
      id = r.id;
      return { households: r.households, guests: r.guests };
    });
    persistHouseholdsAndGuests();
    return id;
  },
  attachToHousehold: (guestIds, householdId) => {
    set((s) => ({ guests: sdkAttachToHousehold(s.guests, guestIds, householdId) }));
    // Attaching may have emptied the households the moved members came from.
    set((s) => ({ households: sdkPruneEmptyHouseholds(s.households, s.guests) }));
    persistHouseholdsAndGuests();
  },
  detachFromHousehold: (guestIds) => {
    set((s) => sdkDetachFromHousehold(s.households, s.guests, guestIds));
    persistHouseholdsAndGuests();
  },
  splitHousehold: (memberIds) => {
    const id = Crypto.randomUUID();
    set((s) => sdkSplitHousehold(s.households, s.guests, memberIds, id));
    persistHouseholdsAndGuests();
    return id;
  },
  removeHousehold: (id) => {
    set((s) => sdkRemoveHousehold(s.households, s.guests, id));
    persistHouseholdsAndGuests();
  },
  addGuest: (guest) => {
    set((s) => ({ guests: sdkAddGuest(s.guests, guest) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
    maybeRequestReview("guests", get().guests.length);
  },
  importGuestData: ({ guests, groups, tables }) => {
    set((s) => ({
      guests: [...s.guests, ...guests],
      groups: sortGroups([...s.groups, ...groups]),
      tables: [...s.tables, ...tables],
    }));
    const storage = getStorage();
    if (storage) {
      persistGuests(storage);
      if (groups.length) persistGroups(storage);
      if (tables.length) persistTables(storage);
    }
    notifySync();
  },
  // The single-guest actions go through the batch ones so the two cannot diverge:
  // there is only one body of cascades to keep up to date.
  updateGuest: (id, updates) => get().updateGuests([id], () => updates),
  removeGuest: (id) => get().removeGuests([id]),
  removeGuests: (ids) => {
    if (ids.length === 0) return;
    set((s) => ({ guests: sdkRemoveGuests(s.guests, ids) }));
    // Cascade: strip these guests from all communications recipients
    const commStore = useCommunicationsStore.getState();
    commStore.setCommunications(
      ids.reduce((cs, id) => removeGuestFromAll(cs, id), commStore.communications),
    );
    // Cascade: the guests are gone, so drop their wedding-party role assignments
    const partyStore = useWeddingPartyStore.getState();
    partyStore.setWeddingRoleAssignments(
      ids.reduce(
        (as, id) => removeRoleAssignmentsForGuest(as, id),
        partyStore.weddingRoleAssignments,
      ),
    );
    // Cascade: strip these guests from seating constraints, dropping under-2 ones
    const seatingStore = useSeatingConstraintsStore.getState();
    seatingStore.setSeatingConstraints(
      ids.reduce((cs, id) => detachGuestFromConstraints(cs, id), seatingStore.seatingConstraints),
    );
    // Cascade: remove these guests' meal selections
    const mealStore = useMealSelectionsStore.getState();
    mealStore.setMealSelections(
      ids.reduce((ms, id) => removeMealSelectionsForGuest(ms, id), mealStore.mealSelections),
    );
    // Cascade: a household emptied of its last member disappears, address included
    set((s) => ({ households: sdkPruneEmptyHouseholds(s.households, s.guests) }));
    const storage = getStorage();
    if (storage) {
      persistGuests(storage);
      persistHouseholds(storage);
      persistCommunications(storage);
      persistWeddingRoleAssignments(storage);
      persistSeatingConstraints(storage);
      persistMealSelections(storage);
    }
    notifySync();
  },
  updateGuests: (ids, updatesFor) => {
    if (ids.length === 0) return;
    set((s) => ({ guests: sdkApplyGuestUpdates(s.guests, ids, updatesFor) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  linkCompanion: (guestId, companionId) => {
    set((s) => ({ guests: sdkLinkCompanion(s.guests, guestId, companionId) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  unlinkCompanion: (guestId) => {
    set((s) => ({ guests: sdkUnlinkCompanion(s.guests, guestId) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  addTable: (table) => {
    set((s) => ({ tables: sdkAddTable(s.tables, table) }));
    const storage = getStorage();
    if (storage) persistTables(storage);
    notifySync();
  },
  updateTable: (id, updates) => {
    set((s) => ({ tables: sdkUpdateTable(s.tables, id, updates) }));
    const storage = getStorage();
    if (storage) persistTables(storage);
    notifySync();
  },
  removeTable: (id) => {
    set((s) => sdkRemoveTable(s.tables, s.guests, id));
    const storage = getStorage();
    if (storage) {
      persistTables(storage);
      persistGuests(storage);
    }
    notifySync();
  },
  addGroup: (group) => {
    set((s) => ({ groups: sortGroups(sdkAddGroup(s.groups, group)) }));
    const storage = getStorage();
    if (storage) persistGroups(storage);
    notifySync();
  },
  updateGroup: (id, updates) => {
    set((s) => ({ groups: sortGroups(sdkUpdateGroup(s.groups, id, updates)) }));
    const storage = getStorage();
    if (storage) persistGroups(storage);
    notifySync();
  },
  removeGroup: (id) => {
    set((s) => sdkRemoveGroup(s.groups, s.guests, id));
    const storage = getStorage();
    if (storage) {
      persistGroups(storage);
      persistGuests(storage);
    }
    notifySync();
  },
  getCounts: () => computeCounts(get().guests),
  getGuestsByTable: (tableId) => sdkGetGuestsByTable(get().guests, tableId),
  getUnassignedGuests: () => sdkGetUnassignedGuests(get().guests),
}));

/** Hook to get guest count by key — used by budget calculations */
export function useGuestCount(key: keyof ReturnType<typeof computeCounts> | null): number {
  return useGuestsStore((state) => {
    if (!key) return 0;
    const counts = computeCounts(state.guests);
    const useEstimate = counts.accepted === 0 && counts.total > 0;
    if (useEstimate && key !== "total" && key !== "response_rate") {
      return counts.total;
    }
    const value = counts[key];
    return typeof value === "number" ? value : 0;
  });
}
