/**
 * La garde de première hydratation : un appareil qui vient de se connecter a un
 * registre plein et des magasins vides, et ne doit rien écrire dans l'espace
 * avant d'avoir lu ce que l'espace contient.
 *
 * Fichier à part, et non un bloc de `space-sync.test.ts` : même raison que
 * `hydratation-instantane.test.ts`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

let mockLireArbre: () => Promise<unknown[]> = async () => [];

const mockHandlePush = vi.fn(async () => undefined);
const mockUpdateObjectIndex = vi.fn();

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  readObjectTree: () => mockLireArbre(),
  updateObjectIndex: (...args: unknown[]) => mockUpdateObjectIndex(...args),
  clearNodeAccessCache: vi.fn(),
  getSpaceAccessEntry: () => null,
  getSpacesConfig: () => ({ kvAdapter: { getItem: () => null, setItem: () => {}, removeItem: () => {} } }),
  getSyncNamespace: () => "dk",
  getNodeAccess: async () => ({
    isOwnerOpen: false,
    push: mockHandlePush,
    encryptor: null,
    client: {
      push: vi.fn(async () => ({ hash: "H" })),
      pull: async () => ({ hash: "", data: null }),
      batchPullMany: async (_collection: string, params: { objectId: string }[]) =>
        params.map((p) =>
          p.objectId === "col:guest:w1"
            ? { data: { fmt: 2, items: { "g-serveur": { id: "g-serveur" } }, rev: { "g-serveur": 5 }, tombstones: {} } }
            : { data: null },
        ),
    },
  }),
}));

const SESSION = { userId: "u1" };
vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => SESSION,
  getActiveSpaceId: () => "sp-1",
  getActiveWeddingNodeId: () => "w1",
}));

const kv = new Map<string, unknown>();
vi.mock("@/lib/kv-storage", () => ({
  readCollection: (clé: string) => (kv.has(clé) ? kv.get(clé) : null),
  writeCollection: (clé: string, données: unknown) => { kv.set(clé, données); },
  getStorage: () => ({}),
}));
vi.mock("@/lib/rsvp-sync", () => ({ applyHouseholdRsvpDocs: vi.fn() }));

// Les prestataires locaux ne figurent pas dans l'espace : ils restent « sales » après l'hydratation.
let invites: Array<{ id: string }> = [];
let prestataires: Array<{ id: string }> = [];
const magasin = {
  getState: () => ({
    wedding: null, guests: invites, tables: [], groups: [], households: [], vendors: prestataires,
    quotePricings: [], vendorPayments: [], accommodations: [], gifts: [],
    invitationTypes: [], communications: [], weddingRoles: [], weddingRoleAssignments: [],
    seatingConstraints: [], weddingEvents: [], mealSelections: [], communicationTemplates: [],
    documents: [], legalMilestones: [], honeymoonPlans: [], categories: [], tasks: [],
    agendaEvents: [], dayOfItems: [], collections: [], ideas: [], ceremonyItems: [],
    speeches: [], playlistTracks: [], roles: [], assignments: [], contributors: [],
    setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(),
    setGuests: (v: Array<{ id: string }>) => { invites = v; },
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

/** Le registre, avec son marqueur : `updateWedding` le modifie comme le vrai store. */
let registre: { activeWeddingId: string; weddings: Array<{ id: string; role: string; premiereHydratationAttendue?: boolean }> };
const mockUpdateWedding = vi.fn(async (id: string, maj: Record<string, unknown>) => {
  registre = { ...registre, weddings: registre.weddings.map((w) => (w.id === id ? { ...w, ...maj } : w)) };
});
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: { getState: () => ({ registry: registre, updateWedding: mockUpdateWedding }) },
}));

const ARBRE = [
  { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
  { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
];

const sousMarqueur = () => registre.weddings[0].premiereHydratationAttendue === true;
/** Une poussée a écrit la collection des prestataires dans l'espace. */
const prestatairesPoussés = () =>
  mockHandlePush.mock.calls.some((appel) => JSON.stringify(appel).includes("col:vendor:w1"));

describe("la garde de première hydratation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    kv.clear();
    invites = [];
    prestataires = [{ id: "v-local" }];
    mockHandlePush.mockClear();
    mockUpdateObjectIndex.mockClear();
    mockUpdateWedding.mockClear();
    mockLireArbre = async () => ARBRE;
    registre = { activeWeddingId: "w1", weddings: [{ id: "w1", role: "owner", premiereHydratationAttendue: true }] };
  });

  it("aucune poussée ne part tant que le marqueur est posé", async () => {
    const { scheduleSyncPush, viderPousséeEnAttente } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(5000);
    viderPousséeEnAttente();
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockHandlePush).not.toHaveBeenCalled();
    expect(mockUpdateObjectIndex).not.toHaveBeenCalled();
  });

  it("le rattrapage du démarrage est lui aussi retenu", async () => {
    kv.set("sync.pousseeEnAttente", true);
    const { rejouerPousséeEnAttente } = await import("@/lib/space-sync");

    expect(await rejouerPousséeEnAttente(SESSION as never, "sp-1", "w1")).toBe(false);
    expect(mockHandlePush).not.toHaveBeenCalled();
  });

  it("la poussée demandée sous marqueur repart une fois l'hydratation appliquée", async () => {
    const { scheduleSyncPush, hydrateFromSpace } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(3000);
    expect(prestatairesPoussés()).toBe(false);

    await hydrateFromSpace(SESSION as never, "sp-1", "w1");
    expect(sousMarqueur()).toBe(false);

    await vi.advanceTimersByTimeAsync(2500);
    expect(prestatairesPoussés()).toBe(true);
  });

  it("l'hydratation d'un espace vide lève aussi le marqueur", async () => {
    mockLireArbre = async () => [];
    const { hydrateFromSpace } = await import("@/lib/space-sync");

    await hydrateFromSpace(SESSION as never, "sp-1", "w1");

    expect(sousMarqueur()).toBe(false);
  });

  it("une hydratation en échec laisse le marqueur, et rien ne part", async () => {
    mockLireArbre = async () => { throw new Error("réseau coupé"); };
    const { scheduleSyncPush, hydrateFromSpace } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await expect(hydrateFromSpace(SESSION as never, "sp-1", "w1")).rejects.toThrow("réseau coupé");
    await vi.advanceTimersByTimeAsync(5000);

    expect(sousMarqueur()).toBe(true);
    expect(mockHandlePush).not.toHaveBeenCalled();
  });

  it("une hydratation abandonnée laisse le marqueur", async () => {
    let libérer!: () => void;
    mockLireArbre = () => new Promise((res) => { libérer = () => res(ARBRE); });
    const { scheduleSyncPush, hydrateFromSpace } = await import("@/lib/space-sync");

    const hydratation = hydrateFromSpace(SESSION as never, "sp-1", "w1");
    scheduleSyncPush(); // une modification locale date l'époque : la lecture sera jetée
    libérer();
    await hydratation;

    expect(sousMarqueur()).toBe(true);
    expect(mockUpdateWedding).not.toHaveBeenCalled();
  });

  it("sans marqueur, la poussée part comme avant", async () => {
    registre.weddings[0].premiereHydratationAttendue = undefined;
    const { scheduleSyncPush } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    expect(prestatairesPoussés()).toBe(true);
  });
});
