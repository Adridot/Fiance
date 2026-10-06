/**
 * Un refus RÉEL du serveur (401/403 en lecture de l'espace) se dit à l'écran ;
 * un espace vide, une panne réseau ou l'appareil du propriétaire, non.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StarfishHttpError } from "@drakkar.software/starfish-client";

import { refusASignaler, statutDeRefus } from "@/lib/acces-refuse";

describe("statutDeRefus", () => {
  it("401 et 403 sont des refus, le reste non", () => {
    expect(statutDeRefus(new StarfishHttpError(401, '{"error":"Unauthorized"}'))).toBe(401);
    expect(statutDeRefus(new StarfishHttpError(403, '{"error":"Forbidden"}'))).toBe(403);
    expect(statutDeRefus(new StarfishHttpError(404, ""))).toBeNull();
    expect(statutDeRefus(new StarfishHttpError(503, ""))).toBeNull();
    expect(statutDeRefus(new TypeError("Failed to fetch"))).toBeNull();
    expect(statutDeRefus(null)).toBeNull();
  });

  it("seul un membre, et pour l'accès qui a été refusé, le signale", () => {
    const refus = new StarfishHttpError(401, "");
    expect(refusASignaler(refus, { membre: true, accesInchange: true })).toBe(401);
    expect(refusASignaler(refus, { membre: false, accesInchange: true })).toBeNull();
    expect(refusASignaler(refus, { membre: true, accesInchange: false })).toBeNull();
  });
});

describe("useAccesRefuseStore", () => {
  it("se pose par espace et ne se lève que pour le sien", async () => {
    const { useAccesRefuseStore } = await import("@/store/useAccesRefuseStore");
    const s = useAccesRefuseStore.getState();
    s.signaler("sp-1", 401);
    expect(useAccesRefuseStore.getState().refus).toEqual({ spaceId: "sp-1", statut: 401 });
    s.lever("sp-2");
    expect(useAccesRefuseStore.getState().refus).not.toBeNull();
    s.lever("sp-1");
    expect(useAccesRefuseStore.getState().refus).toBeNull();
  });
});

// ─── L'hydratation ──────────────────────────────────────────────────────────

let mockArbre: unknown[] = [];
let mockLireIndex: () => Promise<unknown> = async () => ({ hash: "", data: {} });
let mockEntree: unknown = { kind: "link", cap: { nonce: "n1" } };

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  readObjectTree: async () => mockArbre,
  updateObjectIndex: vi.fn(),
  clearNodeAccessCache: vi.fn(),
  getSpaceAccessEntry: () => mockEntree,
  getSpaceClient: () => ({ pull: () => mockLireIndex() }),
  getSpacesConfig: () => ({ kvAdapter: { getItem: () => null, setItem: () => {}, removeItem: () => {} } }),
  getSyncNamespace: () => "dk",
  getNodeAccess: async () => ({
    isOwnerOpen: false,
    push: vi.fn(),
    encryptor: null,
    client: {
      push: vi.fn(async () => ({ hash: "H" })),
      pull: async () => ({ hash: "", data: null }),
      batchPullMany: async (_c: string, params: unknown[]) => params.map(() => ({ data: null })),
    },
  }),
}));

const SESSION = { userId: "u1", layout: { objIndexPull: (id: string) => `/pull/spaces/${id}/objects/_index` } };
vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => SESSION,
  getActiveSpaceId: () => "sp-1",
  getActiveWeddingNodeId: () => "w1",
}));
vi.mock("@/lib/kv-storage", () => ({ readCollection: () => null, writeCollection: () => {}, getStorage: () => ({}) }));
vi.mock("@/lib/rsvp-sync", () => ({ applyHouseholdRsvpDocs: vi.fn() }));

const magasin = {
  getState: () => ({
    wedding: null, guests: [], tables: [], groups: [], households: [], vendors: [],
    quotePricings: [], vendorPayments: [], accommodations: [], gifts: [],
    invitationTypes: [], communications: [], weddingRoles: [], weddingRoleAssignments: [],
    seatingConstraints: [], weddingEvents: [], mealSelections: [], communicationTemplates: [],
    documents: [], legalMilestones: [], honeymoonPlans: [], categories: [], tasks: [],
    agendaEvents: [], dayOfItems: [], collections: [], ideas: [], ceremonyItems: [],
    speeches: [], playlistTracks: [], roles: [], assignments: [], contributors: [],
    setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(), setGuests: vi.fn(),
    setVendors: vi.fn(), setQuotePricings: vi.fn(), setVendorPayments: vi.fn(),
    setAccommodations: vi.fn(), setGifts: vi.fn(), setInvitationTypes: vi.fn(),
    setCommunications: vi.fn(), setWeddingRoles: vi.fn(), setWeddingRoleAssignments: vi.fn(),
    setSeatingConstraints: vi.fn(), setWeddingEvents: vi.fn(), setMealSelections: vi.fn(),
    setCommunicationTemplates: vi.fn(), setDocuments: vi.fn(), setLegalMilestones: vi.fn(),
    setHoneymoonPlans: vi.fn(), setCategories: vi.fn(), setTasks: vi.fn(),
    setAgendaEvents: vi.fn(), setDayOfItems: vi.fn(), setCollections: vi.fn(),
    setIdeas: vi.fn(), setCeremonyItems: vi.fn(), setSpeeches: vi.fn(),
    setPlaylistTracks: vi.fn(), setRoles: vi.fn(), setAssignments: vi.fn(),
  }),
};
for (const nom of [
  "useWeddingStore", "useGuestsStore", "useVendorsStore", "usePlanningStore", "useIdeasStore",
  "useAccommodationsStore", "useGiftsStore", "useInvitationTypesStore", "useCommunicationsStore",
  "useWeddingPartyStore", "useSeatingConstraintsStore", "useWeddingEventsStore", "useMealSelectionsStore",
  "useCommunicationTemplatesStore", "useDocumentsStore", "useLegalStore", "useHoneymoonStore",
  "useCeremonyStore", "useSpeechesMusicStore", "usePermissionsStore", "useContributorsStore",
]) {
  vi.doMock(`@/store/${nom}`, () => ({ [nom]: magasin }));
}
vi.mock("@/store/useSyncAccessStore", () => ({
  useSyncAccessStore: { getState: () => ({ writeDenied: false, setWriteDenied: vi.fn() }) },
}));
vi.mock("@/store/useSyncPendingStore", () => ({
  useSyncPendingStore: { getState: () => ({ setUnsavedChanges: vi.fn() }) },
}));

let registre: { activeWeddingId: string; weddings: Array<{ id: string; role: string; spaceId: string; premiereHydratationAttendue?: boolean }> };
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({
      registry: registre,
      updateWedding: async (id: string, maj: Record<string, unknown>) => {
        registre = { ...registre, weddings: registre.weddings.map((w) => (w.id === id ? { ...w, ...maj } : w)) };
      },
    }),
  },
}));

const sousGarde = () => registre.weddings[0].premiereHydratationAttendue === true;

describe("hydratation d'un espace dont la lecture est refusée", () => {
  beforeEach(async () => {
    vi.resetModules();
    mockArbre = [];
    mockLireIndex = async () => { throw new StarfishHttpError(401, '{"error":"Unauthorized"}'); };
    mockEntree = { kind: "link", cap: { nonce: "n1" } };
    registre = { activeWeddingId: "w1", weddings: [{ id: "w1", role: "member", spaceId: "sp-1", premiereHydratationAttendue: true }] };
    const { useAccesRefuseStore } = await import("@/store/useAccesRefuseStore");
    useAccesRefuseStore.getState().lever();
  });

  async function hydrater() {
    const { hydrateFromSpace } = await import("@/lib/space-sync");
    const { useAccesRefuseStore } = await import("@/store/useAccesRefuseStore");
    const n = await hydrateFromSpace(SESSION as never, "sp-1", "w1");
    return { n, refus: useAccesRefuseStore.getState().refus };
  }

  it("membre, 401 : le refus est signalé, et la garde de première lecture tient", async () => {
    const { n, refus } = await hydrater();
    expect(n).toBe(0);
    expect(refus).toEqual({ spaceId: "sp-1", statut: 401 });
    expect(sousGarde()).toBe(true);
  });

  it("membre, 403 : même chose", async () => {
    mockLireIndex = async () => { throw new StarfishHttpError(403, '{"error":"Forbidden"}'); };
    expect((await hydrater()).refus).toEqual({ spaceId: "sp-1", statut: 403 });
  });

  it("un index réellement vide n'est pas un refus", async () => {
    mockLireIndex = async () => ({ hash: "", data: {} });
    const { refus } = await hydrater();
    expect(refus).toBeNull();
    expect(sousGarde()).toBe(false);
  });

  it("une panne réseau ne prouve rien", async () => {
    mockLireIndex = async () => { throw new TypeError("Failed to fetch"); };
    expect((await hydrater()).refus).toBeNull();
  });

  it("l'appareil du propriétaire n'est jamais signalé", async () => {
    registre.weddings[0].role = "owner";
    expect((await hydrater()).refus).toBeNull();
  });

  it("un accès remplacé pendant la relecture : le refus visait l'ancien", async () => {
    mockLireIndex = async () => {
      mockEntree = { kind: "link", cap: { nonce: "n2" } };
      throw new StarfishHttpError(401, "");
    };
    expect((await hydrater()).refus).toBeNull();
  });

  it("une lecture qui aboutit lève le refus", async () => {
    await hydrater();
    mockArbre = [{ id: "w1", type: "wedding", parentId: null, updatedAt: 1, contentKind: "merge", access: "space", enc: false }];
    expect((await hydrater()).refus).toBeNull();
  });
});
