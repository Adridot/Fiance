/**
 * L'échec de déchiffrement remonte depuis `hydrateFromSpace` au lieu d'être avalé.
 *
 * Les trois cas doivent produire trois issues distinctes, et le garde-fou du
 * propriétaire tient : seule une époque avérée hors de portée lève l'état.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

let mockArbre: unknown[] = [];
let mockEntrees: { data?: unknown; error?: unknown; hash?: string }[] = [];
let mockKeyring: unknown = null;
let mockDechiffrerLeve: (data: Record<string, unknown>) => boolean = () => false;

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  readObjectTree: async () => mockArbre,
  updateObjectIndex: vi.fn(),
  clearNodeAccessCache: vi.fn(),
  getSpaceAccessEntry: () => null,
  getSpacesConfig: () => ({ kvAdapter: { getItem: () => null, setItem: () => {}, removeItem: () => {} } }),
  getSyncNamespace: () => "dk",
  getNodeAccess: async () => ({
    isOwnerOpen: false,
    push: vi.fn(),
    encryptor: {
      encrypt: async (d: unknown) => d,
      decrypt: async (data: Record<string, unknown>) => {
        if (mockDechiffrerLeve(data)) throw new Error("epoch CEK is wrong");
        return data;
      },
    },
    client: {
      push: vi.fn(),
      pull: async (chemin: string) =>
        chemin.includes("_keyring") ? { hash: "k", data: mockKeyring } : { hash: "", data: null },
      batchPullMany: async () => mockEntrees,
    },
  }),
}));

/** Une session minimale : `layout.keyringPull` est ce qui donne les époques détenues. */
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
// `getStorage` rend `null` : la persistance de l'hydratation est hors sujet ici,
// et un KV fermé la fait passer son tour.
vi.mock("@/lib/kv-storage", () => ({ readCollection: () => null, writeCollection: () => {}, getStorage: () => null }));
vi.mock("@/lib/rsvp-sync", () => ({ applyHouseholdRsvpDocs: vi.fn() }));

// Les magasins de domaine tirent `react-native` (KV, secure-store) : hors sujet ici.
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
vi.mock("@/store/useWeddingStore", () => ({ useWeddingStore: magasinVide }));
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({ registry: { activeWeddingId: "w1", weddings: [{ id: "w1", role: "member" }] } }),
  },
}));
vi.mock("@/store/useGuestsStore", () => ({ useGuestsStore: magasinVide }));
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

const KEYRING_EMMA = {
  currentEpoch: 2,
  epochs: {
    "1": { wrappedKeys: [{ subKem: "proprio" }] },
    "2": { wrappedKeys: [{ subKem: "proprio" }, { subKem: "emma" }] },
  },
};

/** Trois sentinelles de collection, une par cas à distinguer. */
const SENTINELLES = ["guest", "vendor", "household"].map((type) => ({
  id: `col:${type}:node-A`,
  type,
  parentId: "node-A",
  updatedAt: 1000,
  contentKind: "merge",
  access: "space",
  enc: true,
  meta: { collection: true },
}));

async function hydrater() {
  const { hydrateFromSpace } = await import("@/lib/space-sync");
  const { useAccesChiffreStore } = await import("@/store/useAccesChiffreStore");
  useAccesChiffreStore.getState().reinitialiser();
  await hydrateFromSpace(SESSION as never, "sp-1", "node-A");
  return useAccesChiffreStore.getState();
}

describe("hydrateFromSpace — les trois issues d'une lecture ratée", () => {
  beforeEach(() => {
    vi.resetModules();
    mockArbre = SENTINELLES;
    mockKeyring = KEYRING_EMMA;
    mockDechiffrerLeve = () => false;
  });

  it("époque hors de portée : l'état est levé, et seulement pour cette collection", async () => {
    mockEntrees = [
      { hash: "h", data: { _encrypted: "…", _epoch: 1 } },
      { hash: "h", data: { _encrypted: "…", _epoch: 2, items: {}, rev: {}, tombstones: {} } },
      { hash: "h", data: { _encrypted: "…", _epoch: 2, items: {}, rev: {}, tombstones: {} } },
    ];
    mockDechiffrerLeve = (d) => d._epoch === 1;

    const etat = await hydrater();
    expect(etat.illisibles).toEqual({ guest: "epoque-hors-de-portee" });
    expect(etat.epoqueHorsDePortee).toBe(1);
  });

  it("document absent : l'état n'est PAS levé", async () => {
    mockEntrees = [{ hash: "", data: null }, { hash: "", data: null }, { hash: "", data: null }];

    const etat = await hydrater();
    expect(etat.illisibles).toEqual({});
  });

  it("erreur réseau : l'état n'est PAS levé", async () => {
    mockEntrees = [
      { error: new Error("fetch failed") },
      { error: new Error("fetch failed") },
      { error: new Error("fetch failed") },
    ];

    const etat = await hydrater();
    expect(etat.illisibles).toEqual({});
  });

  it("keyring illisible : rien n'est avéré, l'état n'est pas levé", async () => {
    mockKeyring = null;
    mockEntrees = [
      { hash: "h", data: { _encrypted: "…", _epoch: 1 } },
      { hash: "h", data: { _encrypted: "…", _epoch: 1 } },
      { hash: "h", data: { _encrypted: "…", _epoch: 1 } },
    ];
    mockDechiffrerLeve = () => true;

    const etat = await hydrater();
    expect(etat.illisibles).toEqual({});
  });

  it("une lecture redevenue possible efface l'état — c'est l'effet d'un rescellement", async () => {
    mockEntrees = [
      { hash: "h", data: { _encrypted: "…", _epoch: 1 } },
      { hash: "h", data: { _encrypted: "…", _epoch: 2, items: {}, rev: {}, tombstones: {} } },
      { hash: "h", data: { _encrypted: "…", _epoch: 2, items: {}, rev: {}, tombstones: {} } },
    ];
    mockDechiffrerLeve = (d) => d._epoch === 1;
    expect((await hydrater()).illisibles).toEqual({ guest: "epoque-hors-de-portee" });

    const { useAccesChiffreStore } = await import("@/store/useAccesChiffreStore");
    mockEntrees = mockEntrees.map(() => ({
      hash: "h",
      data: { _encrypted: "…", _epoch: 2, items: {}, rev: {}, tombstones: {} },
    }));
    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace(SESSION as never, "sp-1", "node-A");

    expect(useAccesChiffreStore.getState().illisibles).toEqual({});
  });
});
