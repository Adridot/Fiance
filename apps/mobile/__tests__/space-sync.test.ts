/**
 * Tests for lib/space-sync.ts — timer race guards and import-lock helpers.
 *
 * G1: _isHydrating is re-checked inside the 2-second timer callback so a push
 *     that was queued before hydration started does not fire mid-hydrate.
 * C2: suppressSyncPush() cancels any pending timer and blocks new scheduling;
 *     restoreSyncPush() re-enables it.
 * H1/H2: pushCollectionDoc(wedding) delegates to handle.push(), which owns CAS + hash
 *     tracking — client.push never receives a null baseHash after the first write.
 * H3 (Bug B regression): handle.push with an encrypted node and a missing doc
 *     (pull returns { data: {}, hash: "" }) must call client.push successfully
 *     — not throw "Encrypted payload is too short" and swallow the node silently.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mutable: allows individual tests to inject a wedding entity so buildAllNodes
// produces at least one node (enabling pushCollectionDoc(wedding) to be exercised).
let mockWeddingData: Record<string, unknown> | null = null;

// Mutable: lets index-merge tests give buildAllNodes a second, independently
// addable/removable node (the wedding node alone can't model "this device added
// guest GA while a peer added guest GB" — there'd be only one local node).
let mockGuestsData: Array<{ id: string; name?: string }> = [];

// Mutable client spies — reset per regression test.
let mockClientPull: Mock = vi.fn(async () => ({ data: null, hash: null }));
let mockClientPush: Mock = vi.fn(async () => ({ hash: "H_new" }));

// handle.push mirrors the fixed NodeAccessHandle.push: pull → hash-gated decrypt → mutate → push.
// baseHash uses `?? ""` (alpha.49 fix): preserves "" so the server's heal path is reachable.
// "" is falsy so cur is still null for a missing/hash-less doc (Bug B: no decrypt({}) call).
function makeHandlePush(
  pull: Mock,
  push: Mock,
  encryptor: { decrypt: Mock; encrypt: Mock } | null = null,
  cache?: Map<string, string>,
  /** Le cache de pull PARTAGÉ entre fenêtres, consulté quand celui de la
   *  fenêtre est vide — c'est `peekCache` du vrai `handle.push`. */
  peek?: (cléDeDoc: string) => string | null,
) {
  return vi.fn(async (
    pullPath: string,
    pushPath: string,
    mutator: (cur: Record<string, unknown> | null) => Record<string, unknown> | null,
  ) => {
    // CHEMIN RAPIDE — la moitié du vrai `handle.push` que ce faux ne modélisait pas.
    //
    // Le vrai prend ce chemin dès que son cache lui rend un hash pour ce document
    // (`cached && !currentHash`), et il appelle alors le mutateur avec `null` :
    // la fusion devient un REMPLACEMENT. Sans cette branche ici, la suite est
    // structurellement incapable de voir ce défaut — elle ne modélisait que le
    // chemin lent, qui fusionne correctement.
    //
    // Le cache n'est passé QUE par les tests qui l'exercent : sans lui, ce faux
    // se comporte exactement comme avant.
    const cléDeDoc = docKey(pushPath);
    const hashConnu = cache?.get(cléDeDoc) ?? peek?.(cléDeDoc) ?? null;
    if (hashConnu) {
      const remplacement = mutator(null);
      if (remplacement === null) return;
      const charge = encryptor ? await encryptor.encrypt(remplacement) : remplacement;
      const rép = await push(pushPath, charge, hashConnu) as { hash?: string } | undefined;
      // Le vrai ré-inscrit le hash rendu : le chemin rapide s'auto-entretient.
      if (rép?.hash) cache?.set(cléDeDoc, rép.hash);
      return;
    }

    const res = await pull(pullPath).catch(() => null) as
      | { data: Record<string, unknown>; hash: string }
      | null;
    const baseHash = res?.hash ?? "";
    const cur = baseHash
      ? (encryptor ? await encryptor.decrypt(res!.data) : res!.data)
      : null;
    const next = mutator(cur);
    if (next !== null) {
      const payload = encryptor ? await encryptor.encrypt(next) : next;
      const rép = await push(pushPath, payload, baseHash) as { hash?: string } | undefined;
      // Le vrai inscrit AUSSI le hash après une poussée par le chemin lent —
      // c'est pourquoi, dès la deuxième poussée d'une même page, le chemin
      // rapide s'impose.
      if (cache && rép?.hash) cache.set(cléDeDoc, rép.hash);
    }
  });
}

/** Clé de document : le vrai cache efface le préfixe `/pull/` ou `/push/`, de
 *  sorte que les deux chemins désignent la même entrée. La barre de tête est
 *  optionnelle — les vrais `objDocPull`/`objDocPush` la portent, les faux de ce
 *  fichier non. */
function docKey(path: string): string {
  return path.replace(/^\/?(pull|push)\//, "");
}

/**
 * Faux serveur AVEC ÉTAT — un magasin par clé de document.
 *
 * `makeHandlePush` ci-dessus modélise la FORME d'une CAS, pas un serveur : son
 * `pull` et son `push` sont deux espions sans mémoire commune. Deux fenêtres
 * branchées dessus n'écriraient donc pas au même endroit, et une reproduction
 * multi-fenêtres n'y voudrait rien dire.
 *
 * Le `baseHash` n'est PAS vérifié : ces reproductions portent sur l'arbitrage
 * des versions, pas sur la gestion des conflits. Un serveur qui refuserait sur
 * hash périmé ferait échouer les tests pour une raison étrangère au défaut visé
 * — et le défaut observé en production passait justement SANS conflit.
 */
function makeStatefulServer() {
  const docs = new Map<string, { data: Record<string, unknown>; hash: string }>();
  let n = 0;
  const pull = vi.fn(async (path: string) => docs.get(docKey(path)) ?? { data: null, hash: null });
  const push = vi.fn(async (path: string, payload: Record<string, unknown>, _baseHash: string) => {
    const hash = `H${++n}`;
    docs.set(docKey(path), { data: payload, hash });
    return { hash };
  });
  /** Ce que le serveur détient pour un nœud, tel que le verrait un pair.
   *  Recherché par suffixe : la clé porte le chemin de stockage complet
   *  (`spaces/{spaceId}/objects/docs/{nodeId}`), que le test n'a pas à connaître. */
  const collection = (_spaceId: string, nodeId: string) => {
    for (const [clé, doc] of docs) {
      if (clé.endsWith(`/${nodeId}`)) {
        return doc.data as {
          items: Record<string, { id: string; name?: string }>;
          rev: Record<string, number>;
          tombstones: Record<string, number>;
        };
      }
    }
    return undefined;
  };
  /** Pose l'état initial d'un document, tel que le serveur le détiendrait. */
  const seed = (spaceId: string, nodeId: string, data: Record<string, unknown>) => {
    docs.set(`spaces/${spaceId}/objects/docs/${nodeId}`, { data, hash: "H0" });
  };
  return { pull, push, docs, collection, seed };
}

let mockHandlePush: Mock = makeHandlePush(mockClientPull, mockClientPush);

let mockGetNodeAccessImpl: () => Promise<{
  encryptor: null;
  client: { push: Mock; pull: Mock };
  isOwnerOpen: boolean;
  push: Mock;
}> = async () => ({
  encryptor: null,
  client: { push: mockClientPush, pull: mockClientPull },
  isOwnerOpen: false,
  push: mockHandlePush,
});

const mockUpdateObjectIndex = vi.fn();
/** Vidage du cache de documents en mémoire (par fenêtre) de starfish-spaces. */
/** Le cache de documents en mémoire, PAR FENÊTRE — vidé par clearNodeAccessCache. */
const mockCacheDeDocs = new Map<string, string>();
const mockClearNodeAccessCache = vi.fn(() => { mockCacheDeDocs.clear(); });
/** Cache de pull en stockage local, PARTAGÉ entre fenêtres. */
const mockPullCacheKv = new Map<string, string>();
const mockKvAdapter = {
  getItem: (k: string) => mockPullCacheKv.get(k) ?? null,
  setItem: (k: string, v: string) => { mockPullCacheKv.set(k, v); },
  removeItem: (k: string) => { mockPullCacheKv.delete(k); },
};
let mockReadObjectTreeImpl: () => Promise<unknown[]> = async () => [];

vi.mock("@drakkar.software/starfish-spaces", () => ({
  updateObjectIndex: (...args: unknown[]) => mockUpdateObjectIndex(...args),
  readObjectTree: (..._args: unknown[]) => mockReadObjectTreeImpl(),
  getNodeAccess: vi.fn(async (..._args: unknown[]) => mockGetNodeAccessImpl()),
  getSpaceAccessEntry: vi.fn(() => null),
  objDocPush: vi.fn((s: string, n: string) => `push/${s}/${n}`),
  objDocPull: vi.fn((s: string, n: string) => `pull/${s}/${n}`),
  objInvPull: vi.fn((s: string, n: string) => `invpull/${s}/${n}`),
  FIANCE_TYPES: {
    wedding: "wedding", guestGroup: "guestGroup", guest: "guest", table: "table",
    vendor: "vendor", quotePricing: "quotePricing", vendorPayment: "vendorPayment",
    accommodation: "accommodation", gift: "gift", invitationType: "invitationType",
    communication: "communication",
    weddingRole: "weddingRole",
    weddingRoleAssignment: "weddingRoleAssignment", seatingConstraint: "seatingConstraint",
    weddingEvent: "weddingEvent",
    guestMealSelection: "guestMealSelection",
    communicationTemplate: "communicationTemplate",
    document: "document",
    legalMilestone: "legalMilestone",
    honeymoonPlan: "honeymoonPlan",
    taskCategory: "taskCategory", task: "task", agendaEvent: "agendaEvent",
    dayOfItem: "dayOfItem", ideaCollection: "ideaCollection", idea: "idea",
    rsvp: "rsvp",
  },
  weddingToNode: vi.fn(() => ({ id: "w1", type: "wedding", access: "space", enc: true, contentKind: "merge" })),
  guestGroupToNode: vi.fn(), tableToNode: vi.fn(),
  // Real (not bare) impl: index-merge tests need buildAllNodes to actually emit a
  // node per mockGuestsData entry, not `undefined` (descriptorToNode would throw).
  guestToNode: vi.fn((g: { id: string; name?: string }, id: string, parentId: string) => ({
    id, type: "guest", parentId, title: g?.name ?? id, access: "space", enc: true, contentKind: "merge",
  })),
  vendorToNode: vi.fn(), quotePricingToNode: vi.fn(), vendorPaymentToNode: vi.fn(),
  accommodationToNode: vi.fn(), giftToNode: vi.fn(), invitationTypeToNode: vi.fn(),
  communicationToNode: vi.fn(),
  weddingRoleToNode: vi.fn(),
  weddingRoleAssignmentToNode: vi.fn(), seatingConstraintToNode: vi.fn(),
  weddingEventToNode: vi.fn(),
  guestMealSelectionToNode: vi.fn(),
  communicationTemplateToNode: vi.fn(),
  documentToNode: vi.fn(),
  legalMilestoneToNode: vi.fn(),
  honeymoonPlanToNode: vi.fn(),
  taskCategoryToNode: vi.fn(), taskToNode: vi.fn(), agendaEventToNode: vi.fn(),
  dayOfItemToNode: vi.fn(), ideaCollectionToNode: vi.fn(), ideaToNode: vi.fn(),
  weddingFromDoc: vi.fn(), guestGroupFromDoc: vi.fn(), guestFromDoc: vi.fn(),
  tableFromDoc: vi.fn(), vendorFromDoc: vi.fn(), quotePricingFromDoc: vi.fn(),
  vendorPaymentFromDoc: vi.fn(), accommodationFromDoc: vi.fn(), giftFromDoc: vi.fn(),
  invitationTypeFromDoc: vi.fn(), communicationFromDoc: vi.fn(),
  weddingRoleFromDoc: vi.fn(),
  weddingRoleAssignmentFromDoc: vi.fn(), seatingConstraintFromDoc: vi.fn(),
  weddingEventFromDoc: vi.fn(),
  guestMealSelectionFromDoc: vi.fn(),
  communicationTemplateFromDoc: vi.fn(),
  documentFromDoc: vi.fn(),
  legalMilestoneFromDoc: vi.fn(),
  honeymoonPlanFromDoc: vi.fn(),
  taskCategoryFromDoc: vi.fn(), taskFromDoc: vi.fn(),
  agendaEventFromDoc: vi.fn(), dayOfItemFromDoc: vi.fn(), ideaCollectionFromDoc: vi.fn(),
  ideaFromDoc: vi.fn(),
  NodeDescriptor: {},
  ObjectNode: {},
  Session: {},
}));

const mockGetActiveSession = vi.fn(() => ({ userId: "u1" }));
const mockGetActiveSpaceId = vi.fn(() => "space-1");
const mockGetActiveWeddingNodeId = vi.fn(() => "wedding-node-1");

// emptyStore.getState() mints a fresh vi.fn() for every setter on every call, so a
// setWedding spy declared inside it can't be observed across the getState() call
// production code makes. Pulled out to a stable reference the useWeddingStore mock
// below always installs, so tests can assert what hydrateFromSpace fed setWedding.
let mockSetWedding: Mock = vi.fn();

// Same reason as mockSetWedding above, for the guest store: the durability tests need to
// assert whether hydrateFromSpace applied the pulled guests to the store at all, which a
// fresh-per-getState() spy cannot answer.
let mockSetGuests: Mock = vi.fn();

vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => mockGetActiveSession(),
  getActiveSpaceId: () => mockGetActiveSpaceId(),
  getActiveWeddingNodeId: () => mockGetActiveWeddingNodeId(),
}));

// Stub all stores to return empty state.
const emptyStore = { getState: () => ({
  wedding: null, guests: [], tables: [], groups: [],
  vendors: [], quotePricings: [], vendorPayments: [],
  accommodations: [], gifts: [], invitationTypes: [], communications: [],
  weddingRoles: [], weddingRoleAssignments: [], seatingConstraints: [], weddingEvents: [], mealSelections: [],
  communicationTemplates: [], documents: [], legalMilestones: [], honeymoonPlans: [],
  categories: [], tasks: [], agendaEvents: [], dayOfItems: [],
  collections: [], ideas: [],
  ceremonyItems: [], speeches: [], playlistTracks: [],
  roles: [], assignments: [],
  setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(), setGuests: vi.fn(),
  setVendors: vi.fn(), setQuotePricings: vi.fn(), setVendorPayments: vi.fn(),
  setAccommodations: vi.fn(), setGifts: vi.fn(), setInvitationTypes: vi.fn(),
  setCommunications: vi.fn(),
  setWeddingRoles: vi.fn(),
  setWeddingRoleAssignments: vi.fn(), setSeatingConstraints: vi.fn(), setWeddingEvents: vi.fn(),
  setMealSelections: vi.fn(),
  setCommunicationTemplates: vi.fn(),
  setDocuments: vi.fn(),
  setLegalMilestones: vi.fn(),
  setHoneymoonPlans: vi.fn(),
  setCategories: vi.fn(), setTasks: vi.fn(), setAgendaEvents: vi.fn(),
  setDayOfItems: vi.fn(), setCollections: vi.fn(), setIdeas: vi.fn(),
  setCeremonyItems: vi.fn(), setSpeeches: vi.fn(), setPlaylistTracks: vi.fn(),
  setRoles: vi.fn(), setAssignments: vi.fn(),
}) };

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: {
    getState: () => ({ ...emptyStore.getState(), wedding: mockWeddingData, setWedding: mockSetWedding }),
  },
}));
// `role` lives on the WeddingRegistryEntry (local device/registry metadata), NOT on the
// domain `wedding` above — mocked separately so tests exercise the real gating path
// (see the "hydrateFromSpace — RSVP inbox apply is owner-only" regression tests below).
let mockRegistryRole: "owner" | "member" | undefined;
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({
      registry: { activeWeddingId: "w1", weddings: [{ id: "w1", role: mockRegistryRole }] },
    }),
  },
}));
vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: {
    getState: () => ({ ...emptyStore.getState(), guests: mockGuestsData, setGuests: mockSetGuests }),
  },
}));
vi.mock("@/store/useVendorsStore", () => ({ useVendorsStore: emptyStore }));
vi.mock("@/store/usePlanningStore", () => ({ usePlanningStore: emptyStore }));
vi.mock("@/store/useIdeasStore", () => ({ useIdeasStore: emptyStore }));
vi.mock("@/store/useAccommodationsStore", () => ({ useAccommodationsStore: emptyStore }));
vi.mock("@/store/useGiftsStore", () => ({ useGiftsStore: emptyStore }));
vi.mock("@/store/useInvitationTypesStore", () => ({ useInvitationTypesStore: emptyStore }));
vi.mock("@/store/useCommunicationsStore", () => ({ useCommunicationsStore: emptyStore }));
vi.mock("@/store/useWeddingPartyStore", () => ({ useWeddingPartyStore: emptyStore }));
vi.mock("@/store/useSeatingConstraintsStore", () => ({ useSeatingConstraintsStore: emptyStore }));
vi.mock("@/store/useWeddingEventsStore", () => ({ useWeddingEventsStore: emptyStore }));
vi.mock("@/store/useMealSelectionsStore", () => ({ useMealSelectionsStore: emptyStore }));
vi.mock("@/store/useCommunicationTemplatesStore", () => ({ useCommunicationTemplatesStore: emptyStore }));
vi.mock("@/store/useDocumentsStore", () => ({ useDocumentsStore: emptyStore }));
vi.mock("@/store/useLegalStore", () => ({ useLegalStore: emptyStore }));
vi.mock("@/store/useHoneymoonStore", () => ({ useHoneymoonStore: emptyStore }));
vi.mock("@/store/useCeremonyStore", () => ({ useCeremonyStore: emptyStore }));
vi.mock("@/store/useSpeechesMusicStore", () => ({ useSpeechesMusicStore: emptyStore }));
vi.mock("@/store/usePermissionsStore", () => ({ usePermissionsStore: emptyStore }));

vi.mock("@/lib/rsvp-sync", () => ({
  applyHouseholdRsvpDocs: vi.fn(),
}));

// `space-sync.ts` importe ses primitives de sync depuis `@fiance/sdk`, PAS depuis
// `@drakkar.software/starfish-spaces` : c'est là qu'il faut intercepter le
// vidage des caches. Mock partiel — le reste du SDK (fusion, construction des
// documents, chemins) doit rester le vrai, sans quoi les tests ne prouveraient
// plus rien sur l'arbitrage.
vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  clearNodeAccessCache: () => mockClearNodeAccessCache(),
  getSpacesConfig: () => ({ kvAdapter: mockKvAdapter }),
  getSyncNamespace: () => "dk",
}));

// Le KV local, où se rangent le marqueur de poussée en attente et la table des
// versions poussées. Le vrai module tire `react-native` et `expo-sqlite`, qui
// n'existent pas sous l'environnement `node` de vitest — d'où ce faux, sur une
// Map que les tests peuvent inspecter.
//
// Il SURVIT volontairement à `vi.resetModules()` : c'est une variable de ce
// fichier de test, pas du module. C'est exactement ce qu'on veut modéliser —
// le KV survit au rechargement d'une page, l'état de module non.
const mockKvStore = new Map<string, unknown>();

// `sessionStorage` n'existe pas sous l'environnement `node` de vitest. Il porte
// la référence de dernière poussée PAR FENÊTRE : une Map par fenêtre, et
// `nouvelleFenêtre()` modélise l'ouverture d'un onglet distinct. Comme le vrai,
// elle survit à `vi.resetModules()` — un rechargement conserve sa session.
let sessionActive = new Map<string, string>();
const nouvelleFenêtre = () => { sessionActive = new Map<string, string>(); };
vi.stubGlobal("sessionStorage", {
  getItem: (k: string) => sessionActive.get(k) ?? null,
  setItem: (k: string, v: string) => { sessionActive.set(k, v); },
  removeItem: (k: string) => { sessionActive.delete(k); },
  clear: () => { sessionActive.clear(); },
});
vi.mock("@/lib/kv-storage", () => ({
  readCollection: (clé: string) => (mockKvStore.has(clé) ? mockKvStore.get(clé) : null),
  writeCollection: (clé: string, données: unknown) => { mockKvStore.set(clé, données); },
  // KV fermé : la persistance de l'hydratation ne s'exerce pas ici, elle a son
  // propre fichier (`hydratation-instantane.test.ts`).
  getStorage: () => null,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

// Le KV est une variable de CE FICHIER : il survit volontairement à
// `vi.resetModules()`, puisqu'il modélise un stockage qui survit au
// rechargement d'une page. Il doit donc être remis à zéro entre deux TESTS,
// sans quoi le suivi durable de ce qui reste à pousser fuit de l'un à l'autre.
beforeEach(() => {
  mockKvStore.clear();
  nouvelleFenêtre();
});

describe("scheduleSyncPush / _isHydrating timer guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockReadObjectTreeImpl = async () => [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("G1: does not push if hydration starts after the timer is already queued", async () => {
    let resolveHydrate!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { resolveHydrate = () => res([]); });

    const { scheduleSyncPush, hydrateFromSpace } = await import("@/lib/space-sync");

    scheduleSyncPush();

    const hydratePromise = hydrateFromSpace(
      { userId: "u1" } as never,
      "space-1",
      "wedding-node-1",
    );

    await vi.advanceTimersByTimeAsync(2500);

    expect(mockUpdateObjectIndex).not.toHaveBeenCalled();

    resolveHydrate();
    await hydratePromise;
  });

  it("C2: suppressSyncPush cancels a pending timer and blocks new scheduling", async () => {
    const { scheduleSyncPush, suppressSyncPush, restoreSyncPush } = await import("@/lib/space-sync");

    scheduleSyncPush();
    suppressSyncPush();
    scheduleSyncPush();

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockUpdateObjectIndex).not.toHaveBeenCalled();

    restoreSyncPush();
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
  });

  it("C2: restoreSyncPush re-enables scheduling after suppress", async () => {
    const { scheduleSyncPush, suppressSyncPush, restoreSyncPush } = await import("@/lib/space-sync");

    suppressSyncPush();
    restoreSyncPush();
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
  });
});

// ─── Bug B regression: created-guest deletion race ────────────────────────────
//
// Repro (member device, joined via invite link):
//  1. Member creates guest G. notifySync() → scheduleSyncPush() debounces 2s.
//  2. Timer fires: _pushTimer is cleared to null BEFORE pushSpaceSnapshot's network
//     call resolves (space-sync.ts's scheduleSyncPush callback).
//  3. Before the fix, refreshFromSpaceIfIdle()'s guard (`_isHydrating || _pushTimer`)
//     was already open during this window, so a foreground refresh (guests get an
//     extra foreground trigger via refreshRsvpInbox + refreshFromSpaceIfIdle in
//     providers.tsx) could run hydrateFromSpace concurrently. That reseeds
//     _collectionState from the pre-G server doc and setGuests() replaces the store
//     WITHOUT G, while the in-flight push's success handler then commits
//     _collectionState WITH G — so the next buildCollectionDoc() sees an id in
//     `prev.rev` that's absent from the (reseeded) store and tombstones it: G is
//     durably deleted on every device.
//  4. Fix: a `_pushing` flag is held for the full duration of the awaited
//     pushSpaceSnapshot call (not just the debounce), and refreshFromSpaceIfIdle's
//     guard now also checks it — closing the window entirely.

describe("_pushing guard — no concurrent hydrate while a push awaits the network (Bug B)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = null;
    mockGuestsData = [];
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
    mockGuestsData = [];
    mockReadObjectTreeImpl = async () => [];
  });

  it("refreshFromSpaceIfIdle does not hydrate during the post-timer-clear, pre-network-settle window, and resumes once the push settles", async () => {
    // Establish a baseline: guest g1 already durably pushed (so the next push only
    // carries g2 as new — mirrors a member device that already synced once).
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    mockClientPush = vi.fn(async () => ({ hash: "H1" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot, scheduleSyncPush, refreshFromSpaceIfIdle } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Member creates guest g2 — this is the mutation whose notifySync() schedules the push.
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];

    // Make the network push hang so the post-timer-clear, pre-settle window is observable.
    let resolvePush!: (v: { hash: string }) => void;
    mockClientPush = vi.fn(() => new Promise<{ hash: string }>((res) => { resolvePush = res; }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });

    scheduleSyncPush();
    // Fire the 2s debounce timer: _pushTimer is cleared to null here, then
    // pushSpaceSnapshot starts and blocks awaiting mockClientPush.
    await vi.advanceTimersByTimeAsync(2000);

    let readTreeCalls = 0;
    mockReadObjectTreeImpl = async () => { readTreeCalls++; return []; };

    // Old bug: _pushTimer is null at this point, so this call would proceed straight
    // into hydrateFromSpace and reseed the store from the stale (pre-g2) server doc.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(0); // guarded by _pushing — must not hydrate mid-push

    // Let the in-flight push settle.
    resolvePush({ hash: "H2" });
    await vi.advanceTimersByTimeAsync(0);

    // Guard releases once the push is durably committed — sync isn't permanently stuck.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(1);
  });

  it("a second concurrent scheduleSyncPush push still resolves _pushing to false even if the network push fails", async () => {
    // MODIFICATION LOCALE — l'intention de ce test est inchangée : un échec ne doit
    // pas COINCER la synchronisation pour toujours. Ce qui a changé est le moment
    // où elle repart. Un échec programme désormais un réessai, et ce réessai
    // protège la modification non écoulée d'une hydratation qui l'effacerait —
    // exactement ce que `_pushTimer` fait déjà quelques lignes plus haut. Cette
    // protection s'arrête au seuil de signalement : une fois l'utilisateur prévenu
    // que ses modifications ne sont pas enregistrées, l'appareil se remet à lire,
    // faute de quoi un échec durable le rendrait aveugle pour toujours.
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    let rejectPush!: (err: Error) => void;
    let premièrePoussée = true;
    mockClientPush = vi.fn(() => {
      if (premièrePoussée) {
        premièrePoussée = false;
        return new Promise<{ hash: string }>((_res, rej) => { rejectPush = rej; });
      }
      // Les réessais échouent aussitôt : la panne dure.
      return Promise.reject(new Error("network down"));
    });
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { scheduleSyncPush, refreshFromSpaceIfIdle } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2000);

    let readTreeCalls = 0;
    mockReadObjectTreeImpl = async () => { readTreeCalls++; return []; };

    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(0); // guarded while the (failing) push is still in flight

    rejectPush(new Error("network down"));
    await vi.advanceTimersByTimeAsync(0);

    // _pushing EST relâché — mais le réessai protège encore la modification.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(0);

    // La panne dure : les tentatives s'épuisent, le défaut est signalé…
    await vi.advanceTimersByTimeAsync(60_000);
    const { useSyncPendingStore } = await import("@/store/useSyncPendingStore");
    expect(useSyncPendingStore.getState().unsavedChanges).toBe(true);

    // …et la lecture repart : rien n'est coincé pour toujours.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(1);
  });
});

// ─── Regression: pushCollectionDoc(wedding) must not send null baseHash ───────
//
// pushCollectionDoc delegates to handle.push() which owns pull-for-hash → CAS.
// Verified by checking that handle.push is called with the correct paths, and
// that its internal client.push receives the server hash (not null) as baseHash.

describe("pushCollectionDoc(wedding) delegates to handle.push() for CAS-safe writes", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    // Dirty-tracking is shared module state — reset so this describe block's pushes
    // aren't skipped as "unchanged" by a previous describe block's identical content.
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    mockClientPull = vi.fn(async () => ({ data: { existing: true }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("H1: handle.push is called with the node's pull and push paths", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockHandlePush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),  // pullPath
      expect.stringContaining("w1"),  // pushPath
      expect.any(Function),           // mutator
    );
  });

  it("H2: client.push receives the server hash from client.pull as baseHash (not null)", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),  // pushPath
      expect.anything(),              // payload
      "H1",                           // ← hash from pull, never null
    );
  });
});

// ─── Regression: a 403 push sets writeDenied; a successful push clears it ────
//
// Root cause of the guest/vendor/budget data-loss bug on member devices: a stale
// read-only cap makes every write 403 server-side. The error was previously only
// console.warn'd, so the edit vanished on the next hydrate with zero feedback.
// pushCollectionDoc must set useSyncAccessStore's writeDenied on a StarfishHttpError(403)
// and clear it again once a push actually succeeds.

describe("push 403 handling sets/clears useSyncAccessStore.writeDenied", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    useSyncAccessStore.getState().setWriteDenied(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("sets writeDenied when handle.push rejects with a 403 StarfishHttpError", async () => {
    const { StarfishHttpError } = await import("@drakkar.software/starfish-client");
    mockHandlePush = vi.fn(async () => { throw new StarfishHttpError(403, "forbidden"); });
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(true);
  });

  it("clears writeDenied once a push actually succeeds", async () => {
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    useSyncAccessStore.getState().setWriteDenied(true);
    mockClientPull = vi.fn(async () => ({ data: { existing: true }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(false);
  });

  it("does NOT set writeDenied for a non-403 error (e.g. transient network failure)", async () => {
    mockHandlePush = vi.fn(async () => { throw new Error("network timeout"); });
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(false);
  });
});

// ─── discoverOwnerWeddingRoot ─────────────────────────────────────────────────
//
// Finds the pre-existing wedding root in a shared space so a joiner can adopt the
// owner's node id instead of pushing a second, divergent root.
// Mirrors the reconciliation in fiance-sdk/src/sync/import-legacy.ts:123-124.

describe("discoverOwnerWeddingRoot", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
  });

  it("returns the single root when there is exactly one wedding node", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "owner-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("excludes this device's own root and returns the other (common 2-root case)", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "joiner-own", type: "wedding", parentId: null, updatedAt: 2000 },
      { id: "owner-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("with 3 roots (polluted space), picks oldest updatedAt after excluding own id", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "joiner-own",   type: "wedding", parentId: null, updatedAt: 3000 },
      { id: "joiner2",      type: "wedding", parentId: null, updatedAt: 2000 },
      { id: "owner-root",   type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("returns null when space has no wedding nodes", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "some-root", updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("returns null for an empty space", async () => {
    mockReadObjectTreeImpl = async () => [];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("swallows readObjectTree errors and returns null (network-safe)", async () => {
    mockReadObjectTreeImpl = async () => { throw new Error("network error"); };
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    await expect(discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).resolves.toBeNull();
  });

  it("does NOT treat wedding nodes with non-null parentId as roots", async () => {
    // A wedding node that is a child of another node must not be picked as the root.
    mockReadObjectTreeImpl = async () => [
      { id: "non-root-wedding", type: "wedding", parentId: "some-parent", updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("when only own root present (owner's first boot), returns own root as fallback", async () => {
    // No other roots → pool falls back to roots (including ownId) → returns it.
    // This is the owner boot path: no adoption needed, but discovery doesn't break.
    mockReadObjectTreeImpl = async () => [
      { id: "my-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    // Returns my-root (the only candidate); providers.tsx guards adopted !== wedding.id,
    // so this is a no-op — the owner never persists a redundant weddingNodeId.
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "my-root")).toBe("my-root");
  });
});

// ─── hydrateFromSpace: wedding doc selected by weddingNodeId, not index [0] ──
//
// Before the fix, `hydrateFromSpace` called `pullAll("wedding")` and used
// `weddingDocs[0]`, ignoring the active wedding node id entirely. With two wedding
// roots in a shared space this could hydrate the wrong wedding header doc.
// The fix: select the matching node at the index level (where id is known), then
// pull only that one node's content.

describe("hydrateFromSpace — wedding doc selected by weddingNodeId, not index [0]", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("pulls the content doc for the node matching weddingNodeId, not the first node", async () => {
    // Space has two wedding roots: node-A (older, index[0]) and node-B (active).
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "node-B", type: "wedding", parentId: null, updatedAt: 2000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => {
          pulledPaths.push(path);
          return { data: { marker: path }, hash: "h" };
        }),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-B");

    // Exactly one wedding content pull, and it's for node-B (not node-A).
    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A") || p.includes("node-B"));
    expect(weddingPulls).toHaveLength(1);
    expect(weddingPulls[0]).toContain("node-B");
  });

  it("falls back to the first node when no node matches weddingNodeId", async () => {
    // Only one wedding root in the space; active weddingNodeId is unknown (e.g. first boot).
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => {
          pulledPaths.push(path);
          return { data: { marker: path }, hash: "h" };
        }),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    // Active id not in the space → falls back to node-A (the only candidate).
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-UNKNOWN");

    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A"));
    expect(weddingPulls).toHaveLength(1);
  });

  it("does not pull any wedding doc when the space has no wedding nodes", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "node-A", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    const batchedObjectIds: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => { pulledPaths.push(path); return { data: null, hash: null }; }),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_collection: string, paramsList: { objectId: string }[]) => {
          batchedObjectIds.push(...paramsList.map((p) => p.objectId));
          return paramsList.map(() => ({ data: null }));
        }),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    // No wedding node exists, so the only content pull is the guest, and it goes
    // through the batched path (batchPullMany), not a per-node client.pull().
    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A"));
    expect(weddingPulls).toHaveLength(0);
    expect(batchedObjectIds).toContain("guest-1");
  });
});

// ─── hydrateFromSpace: wedding singleton unwrap (rev-LWW) ─────────────────────
//
// The wedding root now pushes as a 1-item CollectionDoc (readSingletonEntity/
// buildSingletonDoc/mergeSingletonDoc in @fiance/sdk — see the "Close the
// wedding-singleton lost-update hole" plan) instead of a raw object. hydrateFromSpace
// must unwrap that shape before feeding the store, AND still tolerate an old build's
// legacy raw doc during a rollout window (see mergeSingletonDoc's doc comment).

describe("hydrateFromSpace — wedding singleton unwrap", () => {
  beforeEach(() => {
    mockSetWedding.mockClear();
  });

  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("unwraps a new-shape (1-item CollectionDoc) wedding pull before calling setWedding", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({
          data: {
            fmt: 2,
            items: { "node-A": { id: "node-A", name: "Wrapped Wedding" } },
            rev: { "node-A": 777 },
            tombstones: {},
          },
          hash: "h",
        })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).toHaveBeenCalledTimes(1);
    const [passed] = mockSetWedding.mock.calls[0] as [Record<string, unknown>];
    expect(passed).toMatchObject({ id: "node-A", name: "Wrapped Wedding" });
    // Not the wrapper — a bug here would leak the {fmt,items,rev,tombstones} envelope
    // into the wedding store instead of the actual entity.
    expect(passed.items).toBeUndefined();
    expect(passed.fmt).toBeUndefined();
  });

  it("still adopts a legacy raw (pre-migration, un-wrapped) wedding pull", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: { id: "node-A", name: "Legacy Wedding" }, hash: "h" })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).toHaveBeenCalledTimes(1);
    expect(mockSetWedding.mock.calls[0]?.[0]).toMatchObject({ id: "node-A", name: "Legacy Wedding" });
  });

  it("does not call setWedding when no wedding doc is pulled", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "node-A", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_c: string, paramsList: { objectId: string }[]) =>
          paramsList.map(() => ({ data: null }))),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).not.toHaveBeenCalled();
  });

  // Regression: an old-build peer still runs the pre-migration deepMerge(cur, content)
  // push, which splices its own raw fields onto an already-wrapped remote while leaving
  // items/rev/tombstones untouched-but-stale. Without readSingletonEntity's hybrid
  // detection, this device would keep reading the stale `items` entry and silently drop
  // the old-build peer's edit on every hydrate.
  it("prefers a hybrid doc's fresh raw fields over its stale `items` map", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({
          data: {
            fmt: 2,
            items: { "node-A": { id: "node-A", name: "StaleFromItems" } },
            rev: { "node-A": 999 },
            tombstones: {},
            id: "node-A",
            name: "FreshFromOldBuildPush",
          },
          hash: "h",
        })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).toHaveBeenCalledTimes(1);
    expect(mockSetWedding.mock.calls[0]?.[0]).toMatchObject({ name: "FreshFromOldBuildPush" });
  });
});

// ─── Regression: RSVP inbox apply must be owner-only (guest data-loss on member devices) ──
//
// refreshRsvpInbox/pullAndApplyRsvpNodes write the guest store (via applyHouseholdRsvpDocs)
// and, outside the hydrateFromSpace interlock, that write schedules a real push. A member device
// has no business independently applying public-page RSVP submissions — it receives RSVP state
// through normal guest-collection sync from the owner. Letting a member run this raced its guest
// store against foreground hydrates and dropped/tombstoned its own newly created/edited guests.

describe("hydrateFromSpace — RSVP inbox apply is owner-only", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    // Production-shaped domain wedding — it never carries a `role` field. Role-gating must
    // come from the registry mock below, not from injecting `role` onto this object (that
    // was the bug: the real code read `wedding?.role`, which is always undefined in prod).
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = undefined;
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  function seedRsvpNode() {
    mockReadObjectTreeImpl = async () => [
      { id: "rsvp-1", type: "rsvp", parentId: null, updatedAt: 1000, contentKind: "merge", access: "invite", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        // MODIFICATION LOCALE — un document de FOYER : une liste de membres.
        pull: vi.fn(async () => ({
          data: {
            version: 2,
            householdId: "h1",
            members: [{ guestId: "g1", rsvpStatus: "confirmed", respondedAt: 1000 }],
            submittedAt: 1000,
          },
          hash: "h",
        })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  }

  it("does NOT apply RSVP submissions into the guest store on a member device", async () => {
    // Production-shaped: domain wedding has no `role`; the registry entry does.
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = "member";
    seedRsvpNode();

    const { applyHouseholdRsvpDocs } = await import("@/lib/rsvp-sync");
    vi.mocked(applyHouseholdRsvpDocs).mockClear();

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(applyHouseholdRsvpDocs).not.toHaveBeenCalled();
  });

  it("DOES apply RSVP submissions into the guest store on the owner device", async () => {
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = "owner";
    seedRsvpNode();

    const { applyHouseholdRsvpDocs } = await import("@/lib/rsvp-sync");
    vi.mocked(applyHouseholdRsvpDocs).mockClear();

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(applyHouseholdRsvpDocs).toHaveBeenCalledWith([
      expect.objectContaining({
        members: [expect.objectContaining({ guestId: "g1" })],
      }),
    ]);
  });
});

// ─── Regression: encrypted nodes must not be silently dropped (Bug B) ─────────
//
// When a doc does not exist the server returns { data: {}, hash: "" }. The fixed
// handle.push gates decrypt on a non-empty hash, so cur = null and the mutator
// still runs. The node is created with baseHash = null (not swallowed with a throw).

describe("pushCollectionDoc(wedding) succeeds for a missing encrypted node (Bug B regression)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    // Pull returns the "missing doc" response: truthy {} data with empty hash.
    mockClientPull = vi.fn(async () => ({ data: {}, hash: "" }));
    mockClientPush = vi.fn(async () => ({ hash: "H_created" }));
    const mockEncryptor = {
      decrypt: vi.fn(async () => { throw new Error("Encrypted payload is too short") }),
      encrypt: vi.fn(async (d: unknown) => ({ _encrypted: JSON.stringify(d) })),
    };
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush, mockEncryptor);
    mockGetNodeAccessImpl = async () => ({
      encryptor: mockEncryptor as never,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("H3: client.push is called (node created) and decrypt is NOT called for a missing doc", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // handle.push must have been invoked for the wedding node.
    expect(mockHandlePush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.stringContaining("w1"),
      expect.any(Function),
    );
    // client.push must succeed (node created with baseHash = "" per alpha.49 fix, not null).
    // "" is the correct create/heal baseHash — null would deadlock against a hash-less existing doc.
    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.any(Object),
      "",
    );
  });
});

// ─── Regression: dirty-tracking skips unchanged nodes ─────────────────────────
//
// Before the fix, pushSpaceSnapshot re-pushed every node on every call (no content
// diff). Combined with node-level last-writer-wins, a push triggered by editing one
// guest could clobber a peer's newer edit to a node this device never touched. The
// fix tracks each node's last-pushed content and only re-pushes when it changed.

describe("pushSpaceSnapshot — dirty-tracking skips unchanged nodes", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    mockClientPull = vi.fn(async () => ({ data: { existing: true }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("a second push with unchanged content does not re-push the node", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1);

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1); // still 1 — unchanged node skipped
  });

  it("a push after the node's content changes re-pushes it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1);

    mockWeddingData = { id: "w1", name: "Renamed Wedding" };
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(2);
  });
});


// ─── Regression: conflict-retry mutator merges instead of clobbering ──────────
//
// Before the H1/H2 fix, pushNodeContent's mutator was `() => content` — it ignored
// `cur`, the remote doc the SDK's CAS retry pulls and decrypts on a 409 conflict, and
// just re-pushed the local snapshot. A field a peer wrote and this device never touched
// was silently overwritten.
//
// The wedding singleton now pushes through pushCollectionDoc + mergeSingletonDoc (the
// same per-entity rev-LWW machinery a real collection uses — see the "Close the
// wedding-singleton lost-update hole" plan), so the pushed payload is the wrapped
// { items: { [weddingNodeId]: <merged entity> } } shape, not a flat object. This also
// covers mergeSingletonDoc's legacy tolerance: `cur` here is an un-wrapped raw object
// (no `items` map), exactly the pre-migration remote shape.

describe("pushCollectionDoc(wedding) conflict mutator — merges remote content instead of clobbering", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Local Name" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    // Simulates a conflict-retry pull: the server has a field this device never touched,
    // in the legacy (pre-migration) un-wrapped shape.
    mockClientPull = vi.fn(async () => ({ data: { existing: true, untouchedField: "fromRemote" }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("merges the remote doc's untouched field into the pushed payload instead of dropping it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.objectContaining({
        items: expect.objectContaining({
          w1: expect.objectContaining({ untouchedField: "fromRemote", name: "Local Name" }),
        }),
      }),
      "H1",
    );
  });
});

// ─── Regression: wedding push wire shape — 1-item CollectionDoc, not a raw object ──
//
// Locks down the wire format itself (independent of the merge-conflict tests above):
// a clean, no-conflict wedding push must produce {fmt, items:{[weddingNodeId]: entity},
// rev:{[weddingNodeId]: number}, tombstones:{}} — the same shape mergeCollectionDoc/
// mergeSingletonDoc expect on the read side.

describe("pushSpaceSnapshot — wedding push wire shape", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    mockClientPull = vi.fn(async () => ({ data: null, hash: null })); // first-ever push, no remote yet
    mockClientPush = vi.fn(async () => ({ hash: "H_new" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("pushes the wedding wrapped as a 1-item CollectionDoc keyed by weddingNodeId", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      {
        fmt: 2,
        items: { w1: { id: "w1", name: "Test Wedding" } },
        rev: { w1: expect.any(Number) },
        tombstones: {},
      },
      "",
    );
  });
});

// ─── Per-collection push (collection-only, direct migration) ──────────────────
//
// Content is one doc per collection (col:{type}:{weddingNodeId}) — NO per-entity
// content docs. A bulk import of N guests mutates only the guest store → exactly ONE
// collection doc (col:guest) is pushed, regardless of N (the headline metric); the
// only other content push is the wedding singleton. Delete-safety rides on in-doc
// tombstones, and the index prunes legacy per-entity nodes.

/** All (pushPath, payload) pairs sent to client.push whose path targets a collection doc. */
function collectionPushes(pushMock: Mock, type: string): Array<{ path: string; payload: Record<string, unknown> }> {
  return pushMock.mock.calls
    .filter((c) => typeof c[0] === "string" && (c[0] as string).includes(`col:${type}:`))
    .map((c) => ({ path: c[0] as string, payload: c[1] as Record<string, unknown> }));
}

describe("pushSpaceSnapshot — per-collection push (collection-only)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockGuestsData = [];
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    // Missing-doc pull response so the collection doc is created (baseHash "").
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
    mockGuestsData = [];
  });

  it("bulk import of 120 guests pushes the guest collection doc exactly ONCE", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = Array.from({ length: 120 }, (_, i) => ({ id: `g${i}` }));

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const pushes = collectionPushes(mockClientPush, "guest");
    expect(pushes).toHaveLength(1); // one doc for all 120 guests
    expect(Object.keys((pushes[0].payload.items as Record<string, unknown>))).toHaveLength(120);
  });

  it("writes NO per-entity content — only the wedding node + the guest collection doc", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = Array.from({ length: 120 }, (_, i) => ({ id: `g${i}` }));

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Exactly two content pushes: the wedding singleton and one guest collection doc.
    const paths = mockClientPush.mock.calls.map((c) => c[0] as string);
    expect(paths).toHaveLength(2);
    // No push targets a bare guest id (e.g. .../g0) — the per-entity path is gone.
    expect(paths.some((p) => /\/g\d+$/.test(p))).toBe(false);
    expect(paths.some((p) => p.includes("col:guest:"))).toBe(true);
    expect(paths.some((p) => p.endsWith("/w1"))).toBe(true);
  });

  it("index merge prunes legacy per-entity nodes but keeps the wedding root, sentinels, and rsvp", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }]; // makes the guest collection material → col:guest sentinel is local

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockUpdateObjectIndex).toHaveBeenCalled();
    const updater = mockUpdateObjectIndex.mock.calls.at(-1)![2] as (
      prev: { id: string; type: string }[],
      now: number,
    ) => { id: string }[];
    const prev = [
      { id: "w1", type: "wedding" },
      { id: "g-legacy", type: "guest" },      // legacy per-entity node → must be pruned
      { id: "col:guest:w1", type: "guest" },  // collection sentinel → must survive
      { id: "rsvp-1", type: "rsvp" },         // non-managed invite node → must survive
    ];
    const ids = updater(prev, Date.now()).map((n) => n.id);
    expect(ids).not.toContain("g-legacy");
    expect(ids).toContain("w1");
    expect(ids).toContain("col:guest:w1");
    expect(ids).toContain("rsvp-1");
  });

  it("does NOT prune legacy nodes when the collection content push fails (crash-safe)", async () => {
    // Fail only the guest collection doc push; the wedding push still succeeds. A failed content
    // push must leave the legacy per-entity nodes in the index so their data stays reachable.
    mockClientPush = vi.fn(async (path: string) => {
      if (typeof path === "string" && path.includes("col:guest:")) throw new Error("network down");
      return { hash: "H2" };
    });
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });

    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const updater = mockUpdateObjectIndex.mock.calls.at(-1)![2] as (
      prev: { id: string; type: string }[],
      now: number,
    ) => { id: string }[];
    const prev = [
      { id: "w1", type: "wedding" },
      { id: "g-legacy", type: "guest" }, // col:guest push failed → NOT durable → must be KEPT
    ];
    const ids = updater(prev, Date.now()).map((n) => n.id);
    expect(ids).toContain("g-legacy"); // retained — not stranded
    expect(ids).toContain("w1");
  });

  it("does not push a collection doc for a collection that stays empty", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);
    expect(collectionPushes(mockClientPush, "vendor")).toHaveLength(0); // empty → no sentinel/doc
  });

  it("a second push with unchanged guests does not re-push the guest collection", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1); // unchanged → skipped
  });

  it("deleting a guest tombstones it in the collection doc instead of resurrecting it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Remove g2 locally; the remote still holds it (peer hasn't hydrated the delete).
    mockClientPull = vi.fn(async () => ({
      data: { fmt: 2, items: { g1: { id: "g1" }, g2: { id: "g2" } }, rev: { g1: 1, g2: 1 }, tombstones: {} },
      hash: "H1",
    }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    mockClientPush.mockClear();
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const pushes = collectionPushes(mockClientPush, "guest");
    expect(pushes).toHaveLength(1);
    const payload = pushes[0].payload;
    expect((payload.items as Record<string, unknown>).g2).toBeUndefined(); // not resurrected
    expect((payload.tombstones as Record<string, unknown>).g2).toBeDefined(); // durable delete
    expect((payload.items as Record<string, unknown>).g1).toBeDefined();
  });
});

// ─── Per-collection read + legacy migration detection ─────────────────────────
//
// hydrateFromSpace batch-pulls the collection docs (via the sentinel nodes) AND any
// legacy per-entity nodes, unioning them — this is the one-time migration read that
// folds legacy data into the collection docs. Sentinel nodes must NOT be pulled as
// lone entities. hydrateSawLegacyNodes() flags an owner boot that still has legacy
// nodes so providers.tsx runs the migration/prune push.

describe("hydrateFromSpace — per-collection read + migration detection", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("batch-pulls the collection sentinel AND the legacy per-entity node, unioning both", async () => {
    // Space has a wedding root, a legacy per-entity guest, and a guest collection sentinel.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "g-legacy", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const batchedIds: string[] = [];
    const setGuests = vi.fn();
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_collection: string, params: { objectId: string }[]) => {
          batchedIds.push(...params.map((p) => p.objectId));
          return params.map((p) => {
            if (p.objectId === "col:guest:w1") {
              return { data: { fmt: 2, items: { "g-coll": { id: "g-coll" } }, rev: { "g-coll": 5 }, tombstones: {} } };
            }
            if (p.objectId === "g-legacy") return { data: { id: "g-legacy" } };
            return { data: null };
          });
        }),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    // Capture the guest store's setGuests via a per-call spy is impractical (fresh spy per
    // getState). Instead assert on what was batch-pulled — the dual-read wiring.
    void setGuests;
    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    // The sentinel doc was pulled (collection path) AND the legacy node was pulled (union path).
    expect(batchedIds).toContain("col:guest:w1");
    expect(batchedIds).toContain("g-legacy");
  });

  it("hydrateSawLegacyNodes() is true when legacy per-entity nodes remain, false when clean", async () => {
    const { hydrateFromSpace, hydrateSawLegacyNodes } = await import("@/lib/space-sync");
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) => params.map(() => ({ data: null }))),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    // Legacy space: a per-entity guest node is present → migration needed.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "g-legacy", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    expect(hydrateSawLegacyNodes()).toBe(true);

    // Clean space: only the wedding root + a collection sentinel → nothing to migrate.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    expect(hydrateSawLegacyNodes()).toBe(false);
  });
});

// ─── MODIFICATION LOCALE — durabilité des écritures ──────────────────────────
//
// Ces trois tests reproduisent trois façons dont une modification acceptée par
// l'interface disparaît sans le moindre signal. Ils sont écrits AVANT la
// correction et doivent échouer sur l'arbre non corrigé : sur un défaut
// d'entrelacement, sans échec constaté, rien ne distingue « corrigé » de « la
// fenêtre ne s'est pas présentée ».
//
// La séquence reproduite est celle qui a réellement perdu un foyer le 21 août
// 2026 : une poussée réussie fait émettre au serveur un frame de changement, le
// flux SSE déclenche une hydratation, et la modification suivante tombe dans sa
// fenêtre.

/** Espace minimal contenant une collection d'invités côté serveur. */
function treeWithGuestCollection() {
  return [
    { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
  ];
}

describe("durabilité des écritures — une modification acceptée ne disparaît pas", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockSetGuests = vi.fn();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockGuestsData = [];
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: mockClientPull,
        push: mockClientPush,
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) =>
          params.map((p) =>
            p.objectId === "col:guest:w1"
              ? { data: { fmt: 2, items: { "g-serveur": { id: "g-serveur" } }, rev: { "g-serveur": 5 }, tombstones: {} } }
              : { data: null },
          ),
        ),
      } as never,
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockReadObjectTreeImpl = async () => [];
    mockWeddingData = null;
    mockGuestsData = [];
  });

  it("1.1 — une modification faite pendant une hydratation n'est pas écrasée par l'état lu", async () => {
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    const { hydrateFromSpace, scheduleSyncPush } = await import("@/lib/space-sync");
    const hydratation = hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    // La modification locale survient pendant que la lecture est en vol : le
    // magasin change, et notifySync() aboutit à scheduleSyncPush().
    mockGuestsData = [{ id: "g-local" }];
    scheduleSyncPush();

    libérerLecture();
    await hydratation;

    // L'état lu ne doit PAS avoir été appliqué : l'appliquer effacerait g-local.
    expect(mockSetGuests).not.toHaveBeenCalled();
  });

  it("1.2 — une collection que le serveur ignore reste à pousser après une hydratation", async () => {
    // Le serveur ne connaît aucun invité ; le magasin local en détient un.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGuestsData = [{ id: "g-local" }];

    const { hydrateFromSpace, pushSpaceSnapshot } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    // L'hydratation n'a rien recouvert (aucun invité distant) : g-local est
    // toujours là, et reste donc à pousser.
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);
  });

  it("1.3 — une demande de poussée écartée pendant une hydratation part après elle", async () => {
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    const { hydrateFromSpace, scheduleSyncPush } = await import("@/lib/space-sync");
    const hydratation = hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    mockGuestsData = [{ id: "g-local" }];
    scheduleSyncPush();

    libérerLecture();
    await hydratation;

    // La demande a été retenue, pas abandonnée : elle part une fois la lecture finie.
    await vi.advanceTimersByTimeAsync(2500);

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);
  });

  it("2.4 — sans modification concurrente, l'hydratation applique normalement", async () => {
    // Le cas courant ne doit rien perdre à la correction : sans mutation dans la
    // fenêtre, l'état lu s'applique comme avant.
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    expect(mockSetGuests).toHaveBeenCalledTimes(1);
    expect(mockSetGuests.mock.calls[0][0]).toEqual([{ id: "g-serveur" }]);
  });

  it("2.5 — après un abandon, une hydratation ultérieure aboutit", async () => {
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    const { hydrateFromSpace, scheduleSyncPush } = await import("@/lib/space-sync");
    const abandonnée = hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    mockGuestsData = [{ id: "g-local" }];
    scheduleSyncPush();
    libérerLecture();
    await abandonnée;
    expect(mockSetGuests).not.toHaveBeenCalled();

    // La saisie s'interrompt : la lecture suivante n'est plus écartée.
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    expect(mockSetGuests).toHaveBeenCalledTimes(1);
  });

  it("3.1 — une demande dont le MINUTEUR échoit pendant une hydratation part aussi après elle", async () => {
    // Second point d'abandon : la demande est formulée AVANT l'hydratation, et
    // c'est son minuteur qui échoit pendant. C'est le scénario du garde G1, dont
    // la moitié manquante était la reprise.
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    const { hydrateFromSpace, scheduleSyncPush } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g-local" }];
    scheduleSyncPush();

    const hydratation = hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    // Le minuteur échoit pendant l'hydratation : la demande est retenue (G1).
    await vi.advanceTimersByTimeAsync(2500);
    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(0);

    libérerLecture();
    await hydratation;
    await vi.advanceTimersByTimeAsync(2500);

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);
  });

  it("3.3 — cinq modifications pendant une hydratation ne donnent qu'une poussée", async () => {
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    const { hydrateFromSpace, scheduleSyncPush } = await import("@/lib/space-sync");
    const hydratation = hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    for (let i = 0; i < 5; i++) {
      mockGuestsData = [...mockGuestsData, { id: `g-local-${i}` }];
      scheduleSyncPush();
    }

    libérerLecture();
    await hydratation;
    await vi.advanceTimersByTimeAsync(2500);

    const pushes = collectionPushes(mockClientPush, "guest");
    expect(pushes).toHaveLength(1);
    // Et elle porte bien les cinq.
    expect(Object.keys(pushes[0].payload.items as Record<string, unknown>)).toHaveLength(5);
  });

  it("4.2 — une collection réellement recouverte cesse d'être à pousser", async () => {
    // Le pendant du test 1.2 : la correction ne doit pas rendre TOUT sale. Ici le
    // serveur connaît l'invité, l'hydratation le recouvre, donc plus rien à pousser.
    mockGuestsData = [{ id: "g-serveur" }];
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    const { hydrateFromSpace, pushSpaceSnapshot } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(0);
  });
});

// ─── MODIFICATION LOCALE — réessai et signalement ────────────────────────────

describe("réessai d'une poussée échouée, et son signalement", () => {
  /** Chemins effectivement poussés SANS erreur. */
  let réussites: string[];

  /** Installe un client dont les `n` premières poussées de la collection guest échouent. */
  function clientQuiÉchoue(n: number) {
    let restant = n;
    mockClientPush = vi.fn(async (path: string) => {
      if (typeof path === "string" && path.includes("col:guest:") && restant > 0) {
        restant--;
        throw new Error("réseau coupé");
      }
      réussites.push(path as string);
      return { hash: "H2" };
    });
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  }

  const pousséesGuest = () => réussites.filter((p) => p.includes("col:guest:"));

  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    réussites = [];
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockGuestsData = [{ id: "g1" }];
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    useSyncAccessStore.getState().setWriteDenied(false);
  });

  afterEach(async () => {
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    vi.useRealTimers();
    mockWeddingData = null;
    mockGuestsData = [];
  });

  it("5.1 — une poussée qui échoue puis réussit ne demande AUCUN geste", async () => {
    clientQuiÉchoue(1);
    const { scheduleSyncPush } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
    expect(pousséesGuest()).toHaveLength(0); // première tentative : échec

    // Personne ne retouche quoi que ce soit — le réessai part tout seul.
    await vi.advanceTimersByTimeAsync(6000);

    expect(pousséesGuest()).toHaveLength(1);
  });

  it("5.2 — un refus de droit d'écriture (403) n'est PAS réessayé en boucle", async () => {
    const { StarfishHttpError } = await import("@drakkar.software/starfish-client");
    let tentatives = 0;
    mockHandlePush = vi.fn(async () => {
      tentatives++;
      throw new StarfishHttpError(403, "forbidden");
    });
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });

    const { scheduleSyncPush } = await import("@/lib/space-sync");
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
    const aprèsPremière = tentatives;
    expect(aprèsPremière).toBeGreaterThan(0);

    // Longue attente : rien ne doit être retenté contre un mur.
    await vi.advanceTimersByTimeAsync(120_000);

    expect(tentatives).toBe(aprèsPremière);
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    expect(useSyncAccessStore.getState().writeDenied).toBe(true);
  });

  it("5.3 — les tentatives cessent dès la première réussite", async () => {
    clientQuiÉchoue(2);
    const { scheduleSyncPush } = await import("@/lib/space-sync");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);   // échec 1
    await vi.advanceTimersByTimeAsync(6000);   // échec 2 (réessai à 5 s)
    await vi.advanceTimersByTimeAsync(11_000); // réussite (réessai à 10 s)
    expect(pousséesGuest()).toHaveLength(1);

    // Plus rien ne repart : la collection est propre et le réessai est éteint.
    await vi.advanceTimersByTimeAsync(600_000);
    expect(pousséesGuest()).toHaveLength(1);
  });

  it("6.1 — le drapeau se lève après épuisement des tentatives et retombe à la réussite", async () => {
    clientQuiÉchoue(3);
    const { scheduleSyncPush } = await import("@/lib/space-sync");
    const { useSyncPendingStore } = await import("@/store/useSyncPendingStore");

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);   // échec 1
    await vi.advanceTimersByTimeAsync(6000);   // échec 2
    expect(useSyncPendingStore.getState().unsavedChanges).toBe(false);

    await vi.advanceTimersByTimeAsync(11_000); // échec 3 → on le dit
    expect(useSyncPendingStore.getState().unsavedChanges).toBe(true);

    await vi.advanceTimersByTimeAsync(21_000); // réussite
    expect(useSyncPendingStore.getState().unsavedChanges).toBe(false);
  });

  it("6.3 — un échec rattrapé à la tentative suivante ne signale RIEN", async () => {
    clientQuiÉchoue(1);
    const { scheduleSyncPush } = await import("@/lib/space-sync");
    const { useSyncPendingStore } = await import("@/store/useSyncPendingStore");

    const vues: boolean[] = [];
    const désabonner = useSyncPendingStore.subscribe((s) => vues.push(s.unsavedChanges));

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
    await vi.advanceTimersByTimeAsync(6000);
    désabonner();

    expect(pousséesGuest()).toHaveLength(1);
    // Le drapeau n'a jamais été levé, pas même le temps d'un clignotement.
    expect(vues).not.toContain(true);
    expect(useSyncPendingStore.getState().unsavedChanges).toBe(false);
  });
});

// ─── Perte au départ de la page — reproduction du 21 août 2026 ────────────────
//
// Constaté en production : l'utilisateur renomme un invité, recharge dans la
// seconde, et retrouve l'ancienne valeur. La saisie n'était pas écrasée — elle
// n'avait JAMAIS quitté le navigateur. La poussée est débouncée à 2 s, et rien
// ne la vide quand la page s'en va ; l'hydratation du démarrage suivant applique
// alors l'état du serveur, plus ancien, par-dessus.
//
// Ce que ce bloc modélise et que la suite ne savait pas modéliser : un onglet
// MEURT. Ses minuteurs meurent avec lui (`vi.clearAllTimers()` — sans quoi le
// minuteur de l'instance morte tire quand même et pousse, ce qui ferait passer
// le test en modélisant un rechargement qui n'existe pas), son état de module
// repart de zéro (`vi.resetModules()`), mais le KV et les magasins persistés,
// eux, survivent.
describe("perte au départ de la page", () => {
  let serveur: ReturnType<typeof makeStatefulServer>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockSetGuests = vi.fn();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockGuestsData = [];
    mockKvStore.clear();
    // Le chemin débouncé lit `getActiveWeddingNodeId()`, les appels directs
    // reçoivent l'identifiant en paramètre : sans cette ligne, les deux visent
    // des nœuds DIFFÉRENTS et les assertions portent sur deux documents.
    mockGetActiveWeddingNodeId.mockReturnValue("w1");
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    serveur = makeStatefulServer();
    // L'état d'avant la saisie : le serveur ne connaît que « g-serveur ».
    serveur.seed("space-1", "col:guest:w1", {
      fmt: 2, items: { "g-serveur": { id: "g-serveur" } }, rev: { "g-serveur": 5 }, tombstones: {},
    });
    mockClientPull = serveur.pull;
    mockClientPush = serveur.push;
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: mockClientPull,
        push: mockClientPush,
        // Lit le SERVEUR, pas une fixture figée : ce que l'hydratation rapporte
        // doit refléter ce qui vient d'y être poussé, sinon la reproduction
        // testerait un serveur qui n'écoute pas ses propres écritures.
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) =>
          params.map((p) => ({ data: serveur.collection("space-1", p.objectId) ?? null })),
        ),
      } as never,
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    mockGetActiveWeddingNodeId.mockReturnValue("wedding-node-1");
    mockReadObjectTreeImpl = async () => [];
    mockWeddingData = null;
    mockGuestsData = [];
  });

  it("2.1 — la demande de poussée est notée dans le KV à la mutation, et effacée à la poussée", async () => {
    const sync = await import("@/lib/space-sync");
    expect(sync.pousséeEnAttenteAuDémarrage()).toBe(false);

    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    sync.scheduleSyncPush();
    expect(
      sync.pousséeEnAttenteAuDémarrage(),
      "la mutation n'a laissé aucune trace durable : un rechargement l'oublierait",
    ).toBe(true);

    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(
      sync.pousséeEnAttenteAuDémarrage(),
      "la note a survécu à une poussée réussie : le démarrage suivant repousserait pour rien",
    ).toBe(false);
  });

  it("2.1b — la note survit au rechargement, contrairement à l'état de module", async () => {
    const avant = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    avant.scheduleSyncPush();

    vi.clearAllTimers();
    vi.resetModules();
    const après = await import("@/lib/space-sync");

    expect(après, "resetModules n'a pas rendu une instance neuve").not.toBe(avant);
    expect(
      après.pousséeEnAttenteAuDémarrage(),
      "la note ne survit pas au rechargement — c'est tout ce qu'on lui demande",
    ).toBe(true);
  });

  it("2.3 — un marqueur absent (version antérieure, première exécution) ne fait rien d'anormal", async () => {
    mockKvStore.clear(); // aucun marqueur : l'appareil vient de recevoir la mise à jour
    const sync = await import("@/lib/space-sync");

    const rejoué = await sync.rejouerPousséeEnAttente({ userId: "u1" } as never, "space-1", "w1");

    expect(rejoué).toBe(false);
    expect(collectionPushes(serveur.push, "guest")).toHaveLength(0);
    // et le démarrage se poursuit normalement
    await expect(
      sync.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1"),
    ).resolves.not.toThrow();
  });

  it("2.4 — un départ sans rien en attente ne produit aucune poussée", async () => {
    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    const avantLeDépart = await import("@/lib/space-sync");
    avantLeDépart.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500); // la poussée part et aboutit
    expect(collectionPushes(serveur.push, "guest")).not.toHaveLength(0);
    const pousséesAvant = collectionPushes(serveur.push, "guest").length;

    vi.clearAllTimers();
    vi.resetModules();
    const aprèsLeRetour = await import("@/lib/space-sync");

    await aprèsLeRetour.rejouerPousséeEnAttente({ userId: "u1" } as never, "space-1", "w1");

    expect(
      collectionPushes(serveur.push, "guest"),
      "le démarrage a repoussé alors que tout était déjà arrivé",
    ).toHaveLength(pousséesAvant);
  });

  it("3.1 — le vidage fait partir la poussée sans attendre le débouncement", async () => {
    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    const sync = await import("@/lib/space-sync");
    sync.scheduleSyncPush();
    expect(collectionPushes(serveur.push, "guest")).toHaveLength(0);

    sync.viderPousséeEnAttente();
    await vi.advanceTimersByTimeAsync(0); // laisser la poussée s'exécuter, sans avancer de 2 s

    expect(
      collectionPushes(serveur.push, "guest"),
      "le vidage n'a pas fait partir la poussée retenue",
    ).not.toHaveLength(0);
  });

  it("3.3 — le vidage ne retient pas la page : il ne rend rien à attendre", async () => {
    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    const sync = await import("@/lib/space-sync");
    sync.scheduleSyncPush();

    // Rend la main AVANT que la poussée soit partie : c'est ce qui garantit
    // qu'un onglet qui se ferme n'est pas retenu par le réseau.
    const rendu = sync.viderPousséeEnAttente();
    expect(rendu).toBeUndefined();
    expect(collectionPushes(serveur.push, "guest")).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(0);
    expect(collectionPushes(serveur.push, "guest")).not.toHaveLength(0);
  });

  // 3.2 — RIEN NE REPOSE SUR LE VIDAGE. La reproduction 1.1 ci-dessous ne
  // l'appelle jamais : elle modélise un onglet qui meurt sans que l'événement
  // parte (coupure brutale, `pagehide` non émis, poussée coupée en vol). Elle
  // doit passer quand même — la garantie est le marqueur durable, pas le vidage.
  it("1.1 — une saisie suivie d'un rechargement immédiat est poussée, et survit à l'hydratation", async () => {
    // ── L'onglet vit : la saisie arme le débouncement ───────────────────────
    mockGuestsData = [{ id: "g-local", name: "Liloux" }];
    const avantLeDépart = await import("@/lib/space-sync");
    avantLeDépart.scheduleSyncPush();

    await vi.advanceTimersByTimeAsync(1000); // moins de 2 s : rien n'est encore parti
    expect(collectionPushes(serveur.push, "guest")).toHaveLength(0);

    // ── L'onglet s'en va, et emporte ses minuteurs ──────────────────────────
    vi.clearAllTimers();
    vi.resetModules();

    // ── L'onglet revient : état de module neuf, KV et magasins intacts ──────
    const aprèsLeRetour = await import("@/lib/space-sync");
    await vi.advanceTimersByTimeAsync(10_000);

    // Le démarrage : rejouer ce qui attendait, PUIS hydrater. C'est l'ordre que
    // `providers.tsx` applique.
    await aprèsLeRetour.rejouerPousséeEnAttente({ userId: "u1" } as never, "space-1", "w1");

    expect(
      collectionPushes(serveur.push, "guest"),
      "la poussée en attente n'a jamais été rejouée après le rechargement",
    ).not.toHaveLength(0);

    // ── Et l'hydratation ne doit pas recouvrir la saisie ────────────────────
    await aprèsLeRetour.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    const appliqué = mockSetGuests.mock.calls.at(-1)?.[0] as Array<{ id: string }> | undefined;
    expect(appliqué, "l'hydratation n'a rien appliqué au magasin").toBeDefined();
    expect(
      appliqué?.map((g) => g.id),
      "la saisie « g-local » a disparu de l'écran : l'hydratation a appliqué l'état du serveur, antérieur à elle",
    ).toContain("g-local");
  });
});

// ─── Écrasement entre deux fenêtres — reproduction du 21 août 2026 ────────────
//
// Deux fenêtres ouvertes sur le même espace. L'une renomme un invité et sa
// poussée aboutit ; l'autre, restée en retard, pousse ensuite et REMET son
// ancienne valeur — le serveur régresse, sans le moindre conflit.
//
// Le mécanisme n'est pas la fusion, qui arbitre correctement par `rev`. Il est
// en amont : quand l'hydratation d'une fenêtre est ABANDONNÉE (une modification
// locale est survenue pendant qu'elle lisait), la fonction sort avant de
// réamorcer ses références de poussée. Celles-ci restent vides, et
// `buildCollectionDoc` réestampille alors TOUTES les entités avec son `now` —
// qui bat le `rev` de la fenêtre à jour. La fenêtre en retard gagne parce
// qu'elle est en retard.
//
// Deux instances réellement indépendantes du module : `vi.resetModules()` +
// import dynamique. Les fabriques `vi.mock` ferment sur les variables de ce
// fichier, donc les deux fenêtres partagent bien UN seul serveur.
describe("écrasement entre deux fenêtres", () => {
  let serveur: ReturnType<typeof makeStatefulServer>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockSetGuests = vi.fn();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockKvStore.clear();
    // Le chemin débouncé lit `getActiveWeddingNodeId()`, les appels directs
    // reçoivent l'identifiant en paramètre : sans cette ligne, les deux visent
    // des nœuds DIFFÉRENTS et les assertions portent sur deux documents.
    mockGetActiveWeddingNodeId.mockReturnValue("w1");
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    serveur = makeStatefulServer();
    // Les deux fenêtres partent du même état : g1 s'appelle « Lilou ».
    serveur.seed("space-1", "col:guest:w1", {
      fmt: 2, items: { g1: { id: "g1", name: "Lilou" } }, rev: { g1: 1000 }, tombstones: {},
    });
    mockClientPull = serveur.pull;
    mockClientPush = serveur.push;
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: mockClientPull,
        push: mockClientPush,
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) =>
          params.map((p) => ({ data: serveur.collection("space-1", p.objectId) ?? null })),
        ),
      } as never,
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    mockGetActiveWeddingNodeId.mockReturnValue("wedding-node-1");
    mockReadObjectTreeImpl = async () => [];
    mockWeddingData = null;
    mockGuestsData = [];
  });

  /** Ce que le serveur détient pour l'invité g1, vu comme le verrait un pair. */
  const nomAuServeur = () => {
    const doc = serveur.collection("space-1", "col:guest:w1");
    return doc?.items?.g1?.name;
  };

  it("1.2 — la fenêtre en retard ne remet pas son ancienne valeur par-dessus celle de l'autre", async () => {
    // ── La fenêtre B ouvre d'abord, et pousse l'état initial ────────────────
    //    Sa référence de dernière poussée à elle dit donc « g1 = Lilou ».
    nouvelleFenêtre();
    const sessionB = sessionActive;
    const fenêtreB = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Lilou" }];
    await fenêtreB.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    await vi.advanceTimersByTimeAsync(1000);

    // ── La fenêtre A renomme, et pousse ─────────────────────────────────────
    nouvelleFenêtre();
    vi.resetModules();
    const fenêtreA = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await fenêtreA.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(nomAuServeur(), "la fenêtre A n'a pas réussi sa poussée").toBe("Liloux");

    // ── Retour à la fenêtre B : son état de module et sa session à elle ─────
    //    Elle est restée sur « Lilou » et n'a pas relu.
    sessionActive = sessionB;
    await vi.advanceTimersByTimeAsync(1000);

    // Son hydratation est abandonnée par une saisie survenue pendant la lecture
    // — c'est ce qui laissait ses références vides, et la faisait tout
    // réestampiller.
    let libérerLecture!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { libérerLecture = () => res(treeWithGuestCollection()); });

    mockGuestsData = [{ id: "g1", name: "Lilou" }];
    const hydratation = fenêtreB.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    fenêtreB.scheduleSyncPush();
    libérerLecture();
    await hydratation;

    await vi.advanceTimersByTimeAsync(2500);

    expect(
      nomAuServeur(),
      "la fenêtre en retard a remis « Lilou » par-dessus le « Liloux » de l'autre : le serveur a reculé",
    ).toBe("Liloux");
  });
});

// ─── L'invariant anti-régression à la lecture ────────────────────────────────
//
// Une lecture peut rapporter du passé — réponse tardive, lecture partie avant
// notre écriture, ou servie depuis un cache (c'est ce qui est arrivé le 21 août
// 2026, cinq minutes durant). L'appliquer efface à l'écran une modification
// pourtant enregistrée, puis la fait repousser périmée. L'appareil retient donc
// ce qu'il a poussé, et refuse d'appliquer plus ancien.
describe("l'hydratation n'applique pas une version antérieure à ce que cet appareil a poussé", () => {
  let serveur: ReturnType<typeof makeStatefulServer>;

  const docServeur = (nom: string, rev: number, autres: Record<string, unknown> = {}) => ({
    fmt: 2,
    items: { g1: { id: "g1", name: nom }, ...autres },
    rev: { g1: rev, ...Object.fromEntries(Object.keys(autres).map((k) => [k, rev])) },
    tombstones: {},
  });

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockSetGuests = vi.fn();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockKvStore.clear();
    // Le chemin débouncé lit `getActiveWeddingNodeId()`, les appels directs
    // reçoivent l'identifiant en paramètre : sans cette ligne, les deux visent
    // des nœuds DIFFÉRENTS et les assertions portent sur deux documents.
    mockGetActiveWeddingNodeId.mockReturnValue("w1");
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    serveur = makeStatefulServer();
    serveur.seed("space-1", "col:guest:w1", docServeur("Lilou", 1000));
    mockClientPull = serveur.pull;
    mockClientPush = serveur.push;
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: mockClientPull,
        push: mockClientPush,
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) =>
          params.map((p) => ({ data: serveur.collection("space-1", p.objectId) ?? null })),
        ),
      } as never,
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    mockGetActiveWeddingNodeId.mockReturnValue("wedding-node-1");
    mockReadObjectTreeImpl = async () => [];
    mockWeddingData = null;
    mockGuestsData = [];
  });

  const nomAppliqué = () => {
    const appliqué = mockSetGuests.mock.calls.at(-1)?.[0] as Array<{ id: string; name?: string }> | undefined;
    return appliqué?.find((g) => g.id === "g1")?.name;
  };

  it("4.2 — une lecture ANTÉRIEURE à notre poussée n'est pas appliquée", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Le serveur rapporte du passé (cache, réponse tardive, lecture antérieure).
    serveur.seed("space-1", "col:guest:w1", docServeur("Lilou", 1000));
    await sync.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    expect(
      nomAppliqué(),
      "l'hydratation a appliqué une version antérieure à ce que cet appareil avait poussé",
    ).toBe("Liloux");
  });

  it("4.2b — une lecture POSTÉRIEURE, elle, est appliquée normalement", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Un pair a écrit après nous.
    serveur.seed("space-1", "col:guest:w1", docServeur("Lilouxxx", Date.now() + 10_000));
    await sync.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    expect(nomAppliqué(), "l'invariant bloque aussi ce qui vient légitimement d'un pair").toBe("Lilouxxx");
  });

  it("4.3 — l'invariant survit au rechargement de la page", async () => {
    const avant = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await avant.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    vi.clearAllTimers();
    vi.resetModules();
    const après = await import("@/lib/space-sync");

    serveur.seed("space-1", "col:guest:w1", docServeur("Lilou", 1000));
    await après.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    expect(
      nomAppliqué(),
      "ce que l'appareil avait poussé avant de s'arrêter n'est plus connu de lui après",
    ).toBe("Liloux");
  });

  // 4.5 / 4.6 — LE RISQUE CRÉÉ PAR LE CORRECTIF LUI-MÊME.
  //
  // `buildCollectionDoc` tombstone tout identifiant présent dans les `rev`
  // précédents et absent du magasin : la table des `rev` est donc à la fois le
  // registre des versions ET celui de ce qui est réputé vivre. Réamorcer
  // `_collectionState` depuis la table durable (tâche 6.1) réveille donc le
  // tombstoneur — et ferait SUPPRIMER des entités que cet appareil ne détient
  // plus localement mais qui vivent chez ses pairs.
  //
  // Un correctif contre la perte de données qui en provoque serait pire que le
  // défaut. Ces deux tests posent le contrat AVANT que la ligne qui amorce soit
  // écrite, et doivent tenir après elle.
  it("4.5 — un magasin local VIDE ne fait pas tombstoner toute la collection", async () => {
    const avant = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }, { id: "g2", name: "Pia" }];
    await avant.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // La page repart, et le magasin n'a pas fini de charger. Le rattrapage de
    // poussée du démarrage a lieu AVANT l'hydratation : sans garde, le suivi
    // restauré ferait tombstoner les 352 invités d'un coup.
    vi.clearAllTimers();
    vi.resetModules();
    const après = await import("@/lib/space-sync");
    mockGuestsData = [];

    après.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const doc = serveur.collection("space-1", "col:guest:w1");
    expect(
      doc?.tombstones ?? {},
      "un magasin non chargé a été pris pour une suppression en masse",
    ).toEqual({});
    expect(Object.keys(doc?.items ?? {}).sort()).toEqual(["g1", "g2"]);
  });

  it("4.5b — après un rechargement, une poussée ne porte que ce qui a RÉELLEMENT changé", async () => {
    const avant = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }, { id: "g2", name: "Pia" }];
    await avant.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    const revAprèsPremièrePoussée = { ...(serveur.collection("space-1", "col:guest:w1")?.rev ?? {}) };

    vi.clearAllTimers();
    vi.resetModules();
    const après = await import("@/lib/space-sync");

    // Une seule modification : g1. g2 n'a pas bougé.
    mockGuestsData = [{ id: "g1", name: "Lilouxxx" }, { id: "g2", name: "Pia" }];
    après.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const rev = serveur.collection("space-1", "col:guest:w1")?.rev ?? {};
    expect(rev.g1, "g1 a changé : sa version doit avancer").toBeGreaterThan(revAprèsPremièrePoussée.g1);
    expect(
      rev.g2,
      "g2 n'a pas changé, et sa version a pourtant été réestampillée : la poussée bat les `rev` de tous les pairs",
    ).toBe(revAprèsPremièrePoussée.g2);
  });

  it("4.6 — une entité réellement supprimée continue d'être tombstonée", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }, { id: "g2", name: "Pia" }];
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Suppression VRAIE, dans la même session : l'appareil sait que g2 vivait.
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    sync.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const doc = serveur.collection("space-1", "col:guest:w1");
    expect(
      doc?.tombstones?.g2,
      "une suppression réelle n'est plus propagée : 4.5 a éteint le mécanisme au lieu de l'empêcher de se déclencher à faux",
    ).toBeDefined();
  });

  it("9.1 — une session qui n'a fait que LIRE laisse un suivi utilisable au démarrage suivant", async () => {
    serveur.seed("space-1", "col:guest:w1", docServeur("Liloux", 1000, { g2: { id: "g2", name: "Pia" } }));

    // Session de lecture seule : on hydrate, on ne pousse rien.
    const lectureSeule = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }, { id: "g2", name: "Pia" }];
    await lectureSeule.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    expect(collectionPushes(serveur.push, "guest")).toHaveLength(0);

    // La page repart, et une seule entité est modifiée.
    vi.clearAllTimers();
    vi.resetModules();
    const après = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Lilouxxx" }, { id: "g2", name: "Pia" }];
    après.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const rev = serveur.collection("space-1", "col:guest:w1")?.rev ?? {};
    expect(rev.g1, "g1 a changé : sa version doit avancer").toBeGreaterThan(1000);
    expect(
      rev.g2,
      "une session de lecture seule n'a rien laissé derrière elle : le démarrage suivant a tout repoussé et réestampillé les `rev` de tous les pairs",
    ).toBe(1000);
  });

  it("4.4 — l'invariant est par ENTITÉ : la modification d'un pair sur une autre entité passe", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Le pair ajoute g2, et laisse g1 dans un état antérieur au nôtre.
    serveur.seed("space-1", "col:guest:w1", docServeur("Lilou", 1000, { g2: { id: "g2", name: "Pia" } }));
    await sync.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    const appliqué = mockSetGuests.mock.calls.at(-1)?.[0] as Array<{ id: string; name?: string }> | undefined;
    expect(appliqué?.find((g) => g.id === "g1")?.name, "notre version de g1 a été recouverte").toBe("Liloux");
    expect(
      appliqué?.find((g) => g.id === "g2")?.name,
      "l'invariant a rejeté la modification légitime d'un pair sur une AUTRE entité",
    ).toBe("Pia");
  });
});

// ─── La fusion se décide contre le serveur, pas contre un souvenir ───────────
//
// `handle.push` remplace au lieu de fusionner dès qu'un cache lui rend un hash.
// Deux caches peuvent le lui rendre — celui de la fenêtre, et celui du stockage
// local, partagé entre fenêtres et écrit par toute poussée. C'est le second qui
// explique l'écrasement sans conflit : l'onglet B pousse et y inscrit le hash
// courant, l'onglet A le lit et remplace avec un hash pourtant valide.
describe("la fusion se décide contre l'état réel du serveur", () => {
  let serveur: ReturnType<typeof makeStatefulServer>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockClearNodeAccessCache.mockClear();
    mockSetGuests = vi.fn();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockKvStore.clear();
    mockPullCacheKv.clear();
    mockCacheDeDocs.clear();
    mockGetActiveWeddingNodeId.mockReturnValue("w1");
    mockReadObjectTreeImpl = async () => treeWithGuestCollection();

    serveur = makeStatefulServer();
    // g1 est à nous, g2 vient d'un pair que cette fenêtre n'a jamais lu.
    serveur.seed("space-1", "col:guest:w1", {
      fmt: 2,
      items: { g1: { id: "g1", name: "Liloux" }, g2: { id: "g2", name: "Pia" } },
      rev: { g1: 1000, g2: 2000 },
      tombstones: {},
    });
    mockClientPull = serveur.pull;
    mockClientPush = serveur.push;
    mockHandlePush = makeHandlePush(
      mockClientPull,
      mockClientPush,
      null,
      mockCacheDeDocs,
      (clé) => mockPullCacheKv.get(`starfish.pullcache./v1/dk/pull/${clé}`) ?? null,
    );
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: mockClientPull,
        push: mockClientPush,
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) =>
          params.map((p) => ({ data: serveur.collection("space-1", p.objectId) ?? null })),
        ),
      } as never,
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    mockGetActiveWeddingNodeId.mockReturnValue("wedding-node-1");
    mockReadObjectTreeImpl = async () => [];
    mockWeddingData = null;
    mockGuestsData = [];
  });

  it("5.1 — un cache chaud ne fait plus partir la poussée du chemin qui remplace", async () => {
    // Une autre fenêtre vient de pousser : elle a inscrit dans le cache PARTAGÉ
    // le hash réellement courant du serveur.
    mockPullCacheKv.set(
      "starfish.pullcache./v1/dk/pull/spaces/space-1/objects/docs/col:guest:w1",
      "H0",
    );

    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }]; // g2 nous est inconnu
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const doc = serveur.collection("space-1", "col:guest:w1");
    expect(
      Object.keys(doc?.items ?? {}).sort(),
      "la poussée est partie du chemin qui remplace : l'invité d'un pair a disparu du serveur, sans conflit",
    ).toEqual(["g1", "g2"]);
  });

  it("5.2 — une écriture après une écriture réussie ne remplace pas le travail d'un pair", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }];
    await sync.pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Un pair écrit entre nos deux poussées.
    const actuel = serveur.collection("space-1", "col:guest:w1");
    serveur.seed("space-1", "col:guest:w1", {
      ...actuel,
      items: { ...(actuel?.items ?? {}), g3: { id: "g3", name: "Mathieu" } },
      rev: { ...(actuel?.rev ?? {}), g3: Date.now() + 5000 },
    } as never);

    mockGuestsData = [{ id: "g1", name: "Liloux !" }];
    sync.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const doc = serveur.collection("space-1", "col:guest:w1");
    expect(
      Object.keys(doc?.items ?? {}),
      "notre seconde poussée a remplacé l'espace par l'état que nous avions retenu",
    ).toContain("g3");
  });

  it("5.3 — une entité supprimée par un pair ne réapparaît pas du fait d'une poussée", async () => {
    const sync = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1", name: "Liloux" }, { id: "g2", name: "Pia" }];
    await sync.hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    // Le pair supprime g2 : le serveur porte une pierre tombale postérieure.
    serveur.seed("space-1", "col:guest:w1", {
      fmt: 2,
      items: { g1: { id: "g1", name: "Liloux" } },
      rev: { g1: 1000 },
      tombstones: { g2: Date.now() + 5000 },
    });

    mockGuestsData = [{ id: "g1", name: "Liloux !" }, { id: "g2", name: "Pia" }];
    sync.scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);

    const doc = serveur.collection("space-1", "col:guest:w1");
    expect(
      Object.keys(doc?.items ?? {}),
      "une entité supprimée par un pair a été ressuscitée par notre poussée",
    ).not.toContain("g2");
  });
});
