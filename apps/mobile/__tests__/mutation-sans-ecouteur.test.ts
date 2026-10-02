/**
 * Une saisie faite pendant que la sync n'est pas (ou plus) branchée — entre le montage de
 * `SyncInitializer` et `registerPull("*")`, ou entre `teardownSync` et la ré-activation —
 * ne doit être ni recouverte par l'hydratation qui suit ni oubliée.
 *
 * Fichier à part : même raison que `premiere-hydratation.test.ts`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockHandlePush = vi.fn(async (..._args: unknown[]) => undefined);

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  readObjectTree: async () => ARBRE,
  updateObjectIndex: vi.fn(),
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
// `notifySync` et son crochet restent les vrais : c'est ce qu'on éprouve.
vi.mock("@/lib/starfish", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
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

let invites: Array<{ id: string }> = [];
const magasin = {
  getState: () => ({
    wedding: null, guests: invites, tables: [], groups: [], households: [], vendors: [],
    quotePricings: [], vendorPayments: [], accommodations: [], gifts: [],
    invitationTypes: [], communications: [], weddingRoles: [], weddingRoleAssignments: [],
    seatingConstraints: [], weddingEvents: [], mealSelections: [], communicationTemplates: [],
    documents: [], legalMilestones: [], honeymoonPlans: [], categories: [], tasks: [],
    agendaEvents: [], dayOfItems: [], collections: [], ideas: [], ceremonyItems: [],
    speeches: [], playlistTracks: [], roles: [], assignments: [], contributors: [],
    setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(),
    setGuests: (v: Array<{ id: string }>) => { invites = v; },
    setHouseholds: vi.fn(), setVendors: vi.fn(), setQuotePricings: vi.fn(), setVendorPayments: vi.fn(),
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

let registre: { activeWeddingId: string; weddings: Array<{ id: string; role: string; seedPhrase?: string; syncDisabled?: boolean }> };
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: { getState: () => ({ registry: registre, updateWedding: vi.fn() }) },
}));

const ARBRE = [
  { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
  { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
];

const MARQUEUR = "sync.pousseeEnAttente";
/** Une poussée a écrit la collection des invités, porteuse de l'invité local (le 3e argument est le mutateur de fusion). */
const inviteLocalPoussé = () =>
  mockHandlePush.mock.calls
    .filter((appel) => String(appel[1]).includes("col:guest:w1"))
    .some((appel) => JSON.stringify((appel[2] as (cur: unknown) => unknown)(null)).includes("g-local"));

describe("une saisie faite sans écouteur branché", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    kv.clear();
    invites = [{ id: "g-serveur" }];
    mockHandlePush.mockClear();
    registre = { activeWeddingId: "w1", weddings: [{ id: "w1", role: "member", seedPhrase: "graine" }] };
  });

  /** Ce que `configureOnBoot` fait au démarrage. */
  async function brancherLeCrochet() {
    const { auxModificationsSansEcouteur } = await import("@/lib/starfish");
    const { noterModificationLocale } = await import("@/lib/space-sync");
    auxModificationsSansEcouteur(noterModificationLocale);
  }

  it("notifySync sans écouteur pose le marqueur durable", async () => {
    await brancherLeCrochet();
    const { notifySync } = await import("@/lib/starfish");

    invites = [{ id: "g-serveur" }, { id: "g-local" }];
    notifySync();

    expect(kv.get(MARQUEUR)).toBe(true);
  });

  it("sans synchronisation voulue, aucun marqueur ne reste posé", async () => {
    registre.weddings[0].syncDisabled = true;
    await brancherLeCrochet();
    const { notifySync } = await import("@/lib/starfish");

    notifySync();

    expect(kv.has(MARQUEUR)).toBe(false);
  });

  it("la ré-activation du même mariage ne l'efface pas, et le rattrapage la pousse avant l'hydratation", async () => {
    await brancherLeCrochet();
    const { notifySync, teardownSync } = await import("@/lib/starfish");
    const { resetDirtyPushBaseline, rejouerPousséeEnAttente } = await import("@/lib/space-sync");

    // Début de la ré-activation : ce que fait SyncInitializer avant de dériver la session.
    teardownSync();
    resetDirtyPushBaseline({ garderLArriéré: true });

    // La saisie tombe dans la fenêtre : plus aucun écouteur.
    invites = [{ id: "g-serveur" }, { id: "g-local" }];
    notifySync();
    expect(kv.get(MARQUEUR)).toBe(true);

    // La suite du démarrage : le rattrapage pousse la saisie, avant que l'hydratation puisse la recouvrir.
    await rejouerPousséeEnAttente(SESSION as never, "sp-1", "w1");
    expect(inviteLocalPoussé()).toBe(true);
  });

  it("une saisie déjà en attente de poussée au moment de la ré-activation reste à rejouer", async () => {
    const { teardownSync } = await import("@/lib/starfish");
    const { scheduleSyncPush, resetDirtyPushBaseline, rejouerPousséeEnAttente } = await import("@/lib/space-sync");

    invites = [{ id: "g-serveur" }, { id: "g-local" }];
    scheduleSyncPush(); // débouncée : pas encore partie
    expect(kv.get(MARQUEUR)).toBe(true);

    teardownSync();
    resetDirtyPushBaseline({ garderLArriéré: true });
    expect(kv.get(MARQUEUR)).toBe(true);

    await rejouerPousséeEnAttente(SESSION as never, "sp-1", "w1");
    expect(inviteLocalPoussé()).toBe(true);
  });

  it("sans l'option, la remise à zéro d'un changement de mariage efface bien le marqueur", async () => {
    kv.set(MARQUEUR, true);
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");

    resetDirtyPushBaseline();

    expect(kv.get(MARQUEUR)).toBe(false);
  });
});

describe("une saisie faite pendant le rattrapage du démarrage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    kv.clear();
    invites = [{ id: "g-serveur" }];
    mockHandlePush.mockClear();
    registre = { activeWeddingId: "w1", weddings: [{ id: "w1", role: "owner", seedPhrase: "graine" }] };
  });

  it("n'est pas recouverte par l'hydratation qui suit, puis part", async () => {
    const { scheduleSyncPush, hydrateFromSpace, époqueLocale } = await import("@/lib/space-sync");

    // SyncInitializer relève l'époque avant le rattrapage, qui s'attend sur le réseau.
    const depuis = époqueLocale();
    invites = [{ id: "g-serveur" }, { id: "g-local" }];
    scheduleSyncPush();
    await hydrateFromSpace(SESSION as never, "sp-1", "w1", { depuisÉpoque: depuis });

    expect(invites.map((i) => i.id)).toContain("g-local");

    await vi.advanceTimersByTimeAsync(2500);
    expect(inviteLocalPoussé()).toBe(true);
  });
});
