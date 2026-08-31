/**
 * Un appareil qui ne peut pas lire ne peut pas écrire.
 *
 * Deux barrages, et il faut les deux : le geste d'édition est refusé avant la
 * saisie (`usePermissions`), et la poussée elle-même n'émet aucune requête
 * (`pushSpaceSnapshot`) — le second est ce qui protège réellement les données.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { COLLECTIONS_PAR_SURFACE, surfaceIllisible } from "@/lib/acces-chiffre";

let mockArbre: unknown[] = [];
const mockPoussees: string[] = [];

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  readObjectTree: async () => mockArbre,
  updateObjectIndex: vi.fn(async (_s: unknown, _i: unknown, f: (n: unknown[], t: number) => unknown[]) =>
    f(mockArbre, Date.now()),
  ),
  clearNodeAccessCache: vi.fn(),
  getSpaceAccessEntry: () => null,
  getSpacesConfig: () => ({ kvAdapter: { getItem: () => null, setItem: () => {}, removeItem: () => {} } }),
  getSyncNamespace: () => "dk",
  getNodeAccess: async (_sid: string, nodeId: string) => ({
    isOwnerOpen: false,
    encryptor: null,
    client: { push: vi.fn(), pull: async () => ({ hash: "", data: null }), batchPullMany: async () => [] },
    push: vi.fn(async () => { mockPoussees.push(nodeId); }),
  }),
}));

const SESSION = {
  userId: "u1",
  keys: { kemPub: "emma" },
  layout: { keyringPull: (id: string) => `pull/spaces/${id}/_keyring` },
};

vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => SESSION,
  getActiveSpaceId: () => "sp-1",
  getActiveWeddingNodeId: () => "node-A",
}));
vi.mock("@/lib/kv-storage", () => ({ readCollection: () => null, writeCollection: () => {} }));
vi.mock("@/lib/rsvp-sync", () => ({ applyHouseholdRsvpDocs: vi.fn() }));

const UN_INVITE = { id: "g1", lastName: "Fleith", firstName: "Luc" };

const magasinVide = {
  getState: () => ({
    wedding: null, guests: [], tables: [], groups: [], households: [], vendors: [],
    quotePricings: [], vendorPayments: [], accommodations: [], gifts: [],
    invitationTypes: [], communications: [], weddingRoles: [], weddingRoleAssignments: [],
    seatingConstraints: [], weddingEvents: [], mealSelections: [], communicationTemplates: [],
    documents: [], legalMilestones: [], honeymoonPlans: [], categories: [], tasks: [],
    agendaEvents: [], dayOfItems: [], collections: [], ideas: [], ceremonyItems: [],
    speeches: [], playlistTracks: [], roles: [], assignments: [],
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
vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: { getState: () => ({ ...magasinVide.getState(), wedding: { id: "w1", name: "M" } }) },
}));
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({ registry: { activeWeddingId: "w1", weddings: [{ id: "w1", role: "member" }] } }),
  },
}));
vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: { getState: () => ({ ...magasinVide.getState(), guests: [UN_INVITE] }) },
}));
vi.mock("@/store/useVendorsStore", () => ({ useVendorsStore: magasinVide }));
vi.mock("@/store/usePlanningStore", () => ({ usePlanningStore: magasinVide }));
vi.mock("@/store/useIdeasStore", () => ({ useIdeasStore: magasinVide }));
vi.mock("@/store/useAccommodationsStore", () => ({ useAccommodationsStore: magasinVide }));
vi.mock("@/store/useGiftsStore", () => ({ useGiftsStore: magasinVide }));
vi.mock("@/store/useInvitationTypesStore", () => ({ useInvitationTypesStore: magasinVide }));
vi.mock("@/store/useCommunicationsStore", () => ({ useCommunicationsStore: magasinVide }));
vi.mock("@/store/useWeddingPartyStore", () => ({ useWeddingPartyStore: magasinVide }));
vi.mock("@/store/useSeatingConstraintsStore", () => ({ useSeatingConstraintsStore: magasinVide }));
vi.mock("@/store/useWeddingEventsStore", () => ({ useWeddingEventsStore: magasinVide }));
vi.mock("@/store/useMealSelectionsStore", () => ({ useMealSelectionsStore: magasinVide }));
vi.mock("@/store/useCommunicationTemplatesStore", () => ({ useCommunicationTemplatesStore: magasinVide }));
vi.mock("@/store/useDocumentsStore", () => ({ useDocumentsStore: magasinVide }));
vi.mock("@/store/useLegalStore", () => ({ useLegalStore: magasinVide }));
vi.mock("@/store/useHoneymoonStore", () => ({ useHoneymoonStore: magasinVide }));
vi.mock("@/store/useCeremonyStore", () => ({ useCeremonyStore: magasinVide }));
vi.mock("@/store/useSpeechesMusicStore", () => ({ useSpeechesMusicStore: magasinVide }));
vi.mock("@/store/usePermissionsStore", () => ({ usePermissionsStore: magasinVide }));
vi.mock("@/store/useSyncAccessStore", () => ({
  useSyncAccessStore: { getState: () => ({ writeDenied: false, setWriteDenied: vi.fn() }) },
}));
vi.mock("@/store/useSyncPendingStore", () => ({
  useSyncPendingStore: { getState: () => ({ setPending: vi.fn(), setFailed: vi.fn(), clear: vi.fn() }) },
}));

describe("pushSpaceSnapshot — une collection illisible n'est jamais poussée", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoussees.length = 0;
    mockArbre = [];
  });

  it("une mutation sur une collection marquée n'émet aucune requête pour elle", async () => {
    const { useAccesChiffreStore } = await import("@/store/useAccesChiffreStore");
    useAccesChiffreStore.getState().reinitialiser();
    useAccesChiffreStore.getState().marquerIllisible("guest", "epoque-hors-de-portee", 1);

    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    await pushSpaceSnapshot(SESSION as never, "sp-1", "node-A");

    expect(mockPoussees.filter((id) => id.startsWith("col:guest:"))).toEqual([]);
  });

  it("la même mutation part quand la collection est lisible", async () => {
    const { useAccesChiffreStore } = await import("@/store/useAccesChiffreStore");
    useAccesChiffreStore.getState().reinitialiser();

    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    await pushSpaceSnapshot(SESSION as never, "sp-1", "node-A");

    expect(mockPoussees.filter((id) => id.startsWith("col:guest:")).length).toBeGreaterThan(0);
  });

  it("marquer les invités ne retient pas les autres collections", async () => {
    const { useAccesChiffreStore } = await import("@/store/useAccesChiffreStore");
    useAccesChiffreStore.getState().reinitialiser();
    useAccesChiffreStore.getState().marquerIllisible("guest", "epoque-hors-de-portee", 1);

    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    await pushSpaceSnapshot(SESSION as never, "sp-1", "node-A");

    expect(mockPoussees.some((id) => !id.startsWith("col:guest:"))).toBe(true);
  });
});

describe("surfaceIllisible — le refus est par surface, jamais global", () => {
  it("une collection illisible ferme sa surface", () => {
    expect(surfaceIllisible("guests", { guest: "epoque-hors-de-portee" })).toBe(true);
  });

  it("et n'en ferme aucune autre", () => {
    expect(surfaceIllisible("vendors", { guest: "epoque-hors-de-portee" })).toBe(false);
    expect(surfaceIllisible("ideas", { guest: "epoque-hors-de-portee" })).toBe(false);
  });

  it("un espace sain n'en ferme aucune", () => {
    for (const surface of Object.keys(COLLECTIONS_PAR_SURFACE)) {
      expect(surfaceIllisible(surface, {})).toBe(false);
    }
  });
});
