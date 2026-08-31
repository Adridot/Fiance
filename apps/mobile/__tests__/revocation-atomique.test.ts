/**
 * Une révocation ne rend la main qu'une fois le contenu rescellé.
 *
 * L'ordre est le tout du sujet : retrait d'assignation → poussée → rotation →
 * rescellement. Et un rescellement en échec ne rend JAMAIS `evicted: true` —
 * sinon on annoncerait une éviction que le lien évincé pourrait démentir.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const journal: string[] = [];
let mockRescellement: {
  epoque: number | null;
  rescellees: string[];
  dejaAJour: string[];
  restant: string[];
} = { epoque: 2, rescellees: ["guest"], dejaAJour: [], restant: [] };
let mockRotationLeve = false;

vi.mock("@fiance/sdk", () => ({
  revokeSpaceAccess: vi.fn(async () => {
    journal.push("rotation");
    if (mockRotationLeve) throw new Error("pas d'entrée d'invitation");
  }),
  removeSpaceMember: vi.fn(async () => { journal.push("retrait-registre"); }),
  hydrateSpaceInviteStore: vi.fn(),
}));

vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => ({ userId: "u1", accountClient: {} }),
  getActiveSpaceId: () => "sp-1",
}));

vi.mock("@/lib/space-sync", () => ({
  pushSpaceSnapshot: vi.fn(async () => { journal.push("poussee"); return true; }),
}));

vi.mock("@/lib/kv-storage", () => ({ readCollection: () => null }));
vi.mock("@/lib/invite-link", () => ({ SPACE_INVITE_STORE_KEY: "invites" }));

vi.mock("@/lib/rescellement", async () => {
  const reel = await vi.importActual<typeof import("@/lib/rescellement")>("@/lib/rescellement");
  return {
    rescellementComplet: reel.rescellementComplet,
    rescellerEspace: vi.fn(async () => { journal.push("rescellement"); return mockRescellement; }),
  };
});

const mockRemoveAssignment = vi.fn(() => { journal.push("retrait-assignation"); });
vi.mock("@/store/usePermissionsStore", () => ({
  usePermissionsStore: { getState: () => ({ removeAssignment: mockRemoveAssignment }) },
}));
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({
      registry: { activeWeddingId: "w1", weddings: [{ id: "w1", weddingNodeId: "node-A" }] },
      updateWedding: vi.fn(),
    }),
  },
}));

describe("revokeCollaborator", () => {
  beforeEach(() => {
    journal.length = 0;
    mockRotationLeve = false;
    mockRescellement = { epoque: 2, rescellees: ["guest"], dejaAJour: [], restant: [] };
  });

  it("l'ordre est retrait d'assignation → poussée → rotation → rescellement", async () => {
    const { revokeCollaborator } = await import("@/lib/permissions/revoke");
    await revokeCollaborator("sujet", "a1");

    expect(journal).toEqual(["retrait-assignation", "poussee", "rotation", "rescellement"]);
  });

  it("rend evicted: true quand tout le contenu est rescellé", async () => {
    const { revokeCollaborator } = await import("@/lib/permissions/revoke");
    const r = await revokeCollaborator("sujet", "a1");

    expect(r.evicted).toBe(true);
    expect(r.aResceller).toEqual([]);
  });

  it("un rescellement en échec ne rend JAMAIS evicted: true, et nomme ce qui reste", async () => {
    mockRescellement = { epoque: 2, rescellees: ["guest"], dejaAJour: [], restant: ["vendor", "household"] };
    const { revokeCollaborator } = await import("@/lib/permissions/revoke");
    const r = await revokeCollaborator("sujet", "a1");

    expect(r.evicted).toBe(false);
    expect(r.aResceller).toEqual(["vendor", "household"]);
  });

  it("un keyring illisible laisse la révocation incomplète", async () => {
    mockRescellement = { epoque: null, rescellees: [], dejaAJour: [], restant: [] };
    const { revokeCollaborator } = await import("@/lib/permissions/revoke");
    const r = await revokeCollaborator("sujet", "a1");

    expect(r.evicted).toBe(false);
    expect(r.aResceller).toEqual(["*"]);
  });

  it("une rotation impossible n'atteint jamais le rescellement, et n'évince pas", async () => {
    mockRotationLeve = true;
    const { revokeCollaborator } = await import("@/lib/permissions/revoke");
    const r = await revokeCollaborator("sujet", "a1");

    expect(journal).toEqual(["retrait-assignation", "poussee", "rotation", "retrait-registre"]);
    expect(r.evicted).toBe(false);
  });
});
