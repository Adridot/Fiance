import { describe, it, expect } from 'vitest';
import { createBackupDocument, restoreFromBackup, type WeddingSnapshot } from './backup.js';
import type { GuestGroup } from '../domain/schema.js';

function emptySnapshot(overrides: Partial<WeddingSnapshot> = {}): WeddingSnapshot {
  return {
    wedding: null,
    guests: [],
    tables: [],
    guestGroups: [],
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

const group: GuestGroup = {
  id: 'grp-didot',
  name: 'Didot',
  side: 'PARTNER_1',
  sortOrder: 1,
  createdAt: null,
  updatedAt: null,
};

describe('backup — category side and rank', () => {
  it('both fields survive the JSON round trip', () => {
    const backup = createBackupDocument(emptySnapshot({ guestGroups: [group] }));
    const reparsed = JSON.parse(JSON.stringify(backup));
    const restored = restoreFromBackup(reparsed);

    expect(restored.guestGroups).toEqual([group]);
  });

  it('a category with neither side nor rank crosses without gaining any', () => {
    const bare: GuestGroup = { id: 'grp-x', name: 'Sans côté', createdAt: null, updatedAt: null };
    const backup = createBackupDocument(emptySnapshot({ guestGroups: [bare] }));
    const restored = restoreFromBackup(JSON.parse(JSON.stringify(backup)));

    expect(restored.guestGroups[0].side).toBeUndefined();
    expect(restored.guestGroups[0].sortOrder).toBeUndefined();
  });

  it('the backup stays readable by a version that ignores both fields', () => {
    // The fields are additive, so BACKUP_VERSION must NOT move: a higher number
    // makes an older device fail the import outright instead of ignoring them.
    const backup = createBackupDocument(emptySnapshot({ guestGroups: [group] }));
    expect(backup.version).toBe(16);
  });
});
