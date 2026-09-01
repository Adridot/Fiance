/**
 * B3 space-sync: push store snapshot to ObjectNode server + hydrate stores from server.
 *
 * Push path: notifySync() → dispatchDocChange('*') → registerPull('*') → scheduleSyncPush()
 *            → debounced pushSpaceSnapshot() → updateObjectIndex + parallel objdoc pushes.
 *
 * Hydrate path: providers.tsx calls hydrateFromSpace() after initSync() at boot.
 *               readObjectTree → parallel objdoc pulls → set stores (no notifySync triggered).
 */

import {
  updateObjectIndex,
  readObjectTree,
  getNodeAccess,
  objDocPush,
  objDocPull,
  objInvPull,
  stableStringify,
  collectionNodeId,
  isCollectionNodeId,
  buildCollectionDoc,
  buildSingletonDoc,
  readSingletonEntity,
  mergeSingletonDoc,
  mergeCollectionDoc,
  asCollectionDoc,
  type CollectionDoc,
  type CollectionState,
  type CollectionEntity,
  FIANCE_TYPES,
  weddingToNode, weddingFromDoc,
  guestGroupFromDoc,
  guestFromDoc,
  tableFromDoc,
  vendorFromDoc,
  quotePricingFromDoc,
  vendorPaymentFromDoc,
  accommodationFromDoc,
  giftFromDoc,
  invitationTypeFromDoc,
  communicationFromDoc,
  weddingRoleFromDoc,
  weddingRoleAssignmentFromDoc,
  seatingConstraintFromDoc,
  weddingEventFromDoc,
  guestMealSelectionFromDoc,
  communicationTemplateFromDoc,
  documentFromDoc,
  legalMilestoneFromDoc,
  honeymoonPlanFromDoc,
  ceremonyItemFromDoc,
  speechFromDoc,
  playlistTrackFromDoc,
  permissionRoleFromDoc,
  permissionAssignmentFromDoc,
  taskCategoryFromDoc,
  taskFromDoc,
  agendaEventFromDoc,
  dayOfItemFromDoc,
  ideaCollectionFromDoc,
  ideaFromDoc,
  type Session,
  type ObjectNode,
  type NodeDescriptor,
} from '@fiance/sdk';
import { StarfishHttpError } from '@drakkar.software/starfish-client';
import { useWeddingStore } from '@/store/useWeddingStore';
import { useWeddingRegistryStore } from '@/store/useWeddingRegistryStore';
import { useSyncAccessStore } from '@/store/useSyncAccessStore';
import { useSyncPendingStore } from '@/store/useSyncPendingStore';
import { useGuestsStore } from '@/store/useGuestsStore';
import { useVendorsStore } from '@/store/useVendorsStore';
import { usePlanningStore } from '@/store/usePlanningStore';
import { useIdeasStore } from '@/store/useIdeasStore';
import { useAccommodationsStore } from '@/store/useAccommodationsStore';
import { useGiftsStore } from '@/store/useGiftsStore';
import { useInvitationTypesStore } from '@/store/useInvitationTypesStore';
import { useCommunicationsStore } from '@/store/useCommunicationsStore';
import { useWeddingPartyStore } from '@/store/useWeddingPartyStore';
import { useSeatingConstraintsStore } from '@/store/useSeatingConstraintsStore';
import { useWeddingEventsStore } from '@/store/useWeddingEventsStore';
import { useMealSelectionsStore } from '@/store/useMealSelectionsStore';
import { useCommunicationTemplatesStore } from '@/store/useCommunicationTemplatesStore';
import { useDocumentsStore } from '@/store/useDocumentsStore';
import { useLegalStore } from '@/store/useLegalStore';
import { useHoneymoonStore } from '@/store/useHoneymoonStore';
import { useCeremonyStore } from '@/store/useCeremonyStore';
import { useSpeechesMusicStore } from '@/store/useSpeechesMusicStore';
import { usePermissionsStore } from '@/store/usePermissionsStore';
import { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from '@/lib/starfish';
import { applyRsvpSubmissionsByGuestId, type RsvpSubmission } from '@/lib/rsvp-sync';
import { withIndexLock } from '@/lib/index-lock';
// The local KV is the only state in this file that survives a page unload
// (see "the push request survives the unload" below).
import { readCollection, writeCollection } from '@/lib/kv-storage';

// ---------------------------------------------------------------------------
// Debounced push scheduler
// ---------------------------------------------------------------------------

let _pushTimer: ReturnType<typeof setTimeout> | null = null;
let _isHydrating = false;
/** True for the duration of an in-flight pushSpaceSnapshot network call (from just after
 *  _pushTimer is cleared until the push settles). Without this, refreshFromSpaceIfIdle's
 *  "no push pending" check goes false the instant the debounce timer fires — while the
 *  push is still awaiting the network — letting a concurrent hydrate reseed _collectionState
 *  from the pre-push server doc and drop an entity the in-flight push is about to persist,
 *  which then reads as a delete and gets durably tombstoned on the next push. */
let _pushing = false;
/** True for the duration of an in-flight refreshRsvpInbox pull. refreshFromSpaceIfIdle
 *  must not start a concurrent hydrate while this is set — both write into the guest
 *  store, and now that both the SSE stream (providers.tsx) and the foreground handler
 *  can trigger a hydrate independently (not just the foreground handler's own
 *  await-then-refreshRsvpInbox sequencing), an interleaved hydrate can reseed the guest
 *  store from a pre-submission server doc and drop/tombstone a guest an in-flight RSVP
 *  apply is about to write — mirrors the _pushing guard's rationale above. */
let _rsvpRefreshing = false;

// ─── Write durability ────────────────────────────────────────────────────────
//
// Two guards in this file discard a push request while a hydration is running
// (scheduleSyncPush, and the re-check in its timer). The intent is right — do
// not let a push overwrite what was just read — but neither RESUMED the
// discarded request, and hydrateFromSpace then replaces the stores. A change
// made during a hydration was first denied its push, then erased. No error, no
// trace: the push was never even attempted.
//
// The window needs no second tab and no second device. The SSE stream triggers
// refreshFromSpaceIfIdle() on ANY space change, including the echo of our own
// push: a successful push opens the window that swallows the next one.
//
// Two pieces fix it, and they do not add up — one conditions the other:
//
//   1. THE EPOCH. Every mutation goes through scheduleSyncPush (notifySync() →
//      registerPull('*'), 121 callers), so incrementing it here dates every
//      local change without instrumenting thirty stores. hydrateFromSpace
//      captures the epoch at its start and re-reads it before applying: if it
//      moved, the read state is DISCARDED. Discard rather than merge, because a
//      local change has no rev until the push document is built, and an
//      arbitration invented next to mergeCollectionDoc would be a second rule
//      for a rare case. The price of a discard is one re-read.
//   2. THE RESUME. The discarded request is retained and replayed at the end of
//      the hydration. On its own it would fix NOTHING: the stores would already
//      have been replaced.

/** Incremented by EVERY scheduleSyncPush call, i.e. by every mutation. */
let _localEditEpoch = 0;
/** A push request was discarded during a hydration and is awaiting replay. */
let _pushDeferred = false;
/** Whether the last hydrate actually applied what it read (false when abandoned). */
let _lastHydrateApplied = false;

/**
 * Dirty-push tracking for the wedding singleton node: node id → stableStringify() of the
 * content last successfully pushed (or hydrated). Only the `wedding` node flows through
 * this now — all other content lives in the per-collection docs below.
 */
const _lastPushedJson = new Map<string, string>();

// ── Per-collection ("one doc per collection") sync state ──
// Content is one objdoc per collection (see @fiance/sdk collection-doc): an id-keyed map
// of entities with per-entity rev (LWW) and durable tombstones. Deletes ride inside the
// doc as tombstones, so no separate per-entity index-deletion bookkeeping is needed.

/** sentinel node id (`col:{type}:{weddingNodeId}`) → stableStringify() of the collection
 *  doc last pushed, so an unchanged collection is skipped on the next debounced push. */
const _lastPushedCollectionJson = new Map<string, string>();

/** entity type → per-entity `rev`/`tombstones` carried between pushes/hydrates. Seeded from
 *  the pulled collection doc on hydrate; advanced on each successful collection push. */
const _collectionState = new Map<string, CollectionState>();

/** entity id → stableStringify() of the entity last folded into a collection doc — the
 *  dirty check that decides whether a given entity's `rev` should be bumped. */
const _collectionEntityJson = new Map<string, string>();

/** Set by the last hydrateFromSpace when the space still contained legacy per-entity nodes
 *  (i.e. a pre-collection wedding). providers.tsx reads it on OWNER boot to run the one-shot
 *  migration push (which folds the legacy entities into collection docs and prunes the old
 *  nodes from the index). Owner-only; members never mutate the shared index. */
let _lastHydrateSawLegacy = false;

/** True when the last hydrate saw legacy per-entity nodes needing migration (owner-only). */
export function hydrateSawLegacyNodes(): boolean {
  return _lastHydrateSawLegacy;
}

/** Whether the current device joined this wedding as a member (vs. the owner who created it).
 *  `role` lives on the active `WeddingRegistryEntry` (local device/registry metadata) —
 *  NOT on `useWeddingStore`'s `wedding`, which is the synced domain object (partner names,
 *  date, venue, ...) and has no `role` field. Reading `useWeddingStore().wedding?.role` here
 *  is always `undefined`, silently defeating any owner-only gate — this is what made a prior
 *  fix attempt (gating `pullAndApplyRsvpNodes` below) a no-op in production. */
function isActiveDeviceMember(): boolean {
  const registry = useWeddingRegistryStore.getState().registry;
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  return active?.role === 'member';
}

/** Domain node types managed wholesale by pushSpaceSnapshot — excludes the guest-surface
 *  synthetic nodes (publicPage, rsvp) which are written by other code paths and must
 *  survive a snapshot push untouched. */
const MANAGED_TYPES = new Set<string>(
  Object.values(FIANCE_TYPES).filter((t) => t !== FIANCE_TYPES.publicPage && t !== FIANCE_TYPES.rsvp),
);

// ─── The push request survives a page unload ─────────────────────────────────
//
// Everything protecting an edit in this file is MODULE state: the epoch, the
// deferred request, the debounce timer, the push references. A page reload
// resets all of it. The push being debounced at 2 s, an edit followed by an
// immediate reload is neither sent nor protected: the next startup's hydration
// applies the older server state and the edit disappears with no signal.
//
// Hooking a flush to pagehide is NOT enough: a push is a network round trip and
// nothing guarantees it completes while the page is going away. So the pending
// request is recorded in the KV — the only state that survives a reload. The
// next startup reads it and pushes before letting anything overwrite the data.
//
// The key is bare: writeCollection prefixes it with the active wedding, so the
// marker is partitioned per wedding automatically.

const PENDING_PUSH_KEY = 'sync.pendingPush';

/** Records that a local change has not reached the server yet. */
function markPendingPush(): void {
  // Between weddings the KV is closed and the write only lands in its memory
  // cache, without error. Nothing to recover: the next mutation sets the marker
  // in the right namespace.
  try { writeCollection(PENDING_PUSH_KEY, true); } catch { /* KV unavailable */ }
}

/** Clears the marker: everything that had to go out has arrived. */
function clearPendingPush(): void {
  try { writeCollection(PENDING_PUSH_KEY, false); } catch { /* KV indisponible */ }
}

/** True if a local change was waiting to be pushed when the page stopped. Read
 *  at startup. A missing marker — first run after deploy, or an older version —
 *  returns false: the device behaves
 *  alors exactement comme avant. */
export function hadPendingPushAtStartup(): boolean {
  try { return readCollection<boolean>(PENDING_PUSH_KEY) === true; } catch { return false; }
}

/**
 * Sends immediately the push the debounce was holding back.
 *
 * An OPPORTUNISTIC SHORTCUT, never a guarantee, and worth being clear about: a
 * push is a network round trip, and nothing ensures it completes while the page
 * is going away. What this flush buys is turning the common case (the user
 * reloads) into a round trip that succeeded, rather than one recovered at the
 * next startup. The GUARANTEE is the durable marker and replayPendingPush.
 *
 * Does not hold the page: returns nothing to await, and does not block.
 */
export function flushPendingPush(): void {
  if (!_pushTimer) return;
  clearTimeout(_pushTimer);
  _pushTimer = null;
  void runPush();
}

/**
 * Replays, at startup, the push the page unload interrupted.
 *
 * Call BEFORE any hydration: the change is still in the persisted stores, but
 * the hydration applies the older server state and would erase it.
 *
 * The logic lives here rather than in the component that calls it, for two
 * reasons: it is sync policy, and this is the only place where it is testable
 * without mounting the whole React tree.
 *
 * Never rejects: a failed recovery leaves the marker in place (it is only
 * cleared on success), so the next startup retries, and the ordinary retry
 * covers the interval.
 */
export async function replayPendingPush(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<boolean> {
  if (!hadPendingPushAtStartup()) return false;
  try {
    return await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  } catch (err) {
    console.warn('[space-sync] pending push replay failed:', err);
    return false;
  }
}



/** Called from registerPull('*') in providers.tsx after initSync(). Debounced 2s. */
export function scheduleSyncPush(): void {
  // Before any guard: this is the choke point every mutation goes through, so
  // the one place to date a local change once. Incrementing AFTER the return
  // below would leave invisible exactly the change we are protecting.
  _localEditEpoch++;
  // Before the guards, for the same reason as the epoch: three exit paths
  // discard a request below, and none may make it forgotten.
  markPendingPush();
  if (_isHydrating) { _pushDeferred = true; return; }
  if (_pushTimer) clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => {
    _pushTimer = null;
    void runPush();
  }, 2000);
}

// ─── Retry ───────────────────────────────────────────────────────────────────
//
// A failed push was never retried: _lastPushedCollectionJson was not updated so
// the collection stayed dirty, but nothing left again before the NEXT MUTATION.
// An edit made just before the network dropped waited, indefinitely, for
// something else to be typed.
const PUSH_RETRY_BASE_MS = 5_000;
const PUSH_RETRY_MAX_MS = 5 * 60_000;
/** Consecutive failures before SAYING so. Below this, a network hiccup caught
 *  on the next attempt shows nothing: a banner that blinks on every hiccup
 *  teaches people to ignore it. */
const PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL = 3;

let _pushRetryTimer: ReturnType<typeof setTimeout> | null = null;
let _pushRetryAttempt = 0;
/** A push of the last snapshot was refused for lack of write permission. */
let _lastPushWriteDenied = false;

/** Runs the push. Shared by the debounce timer and the retry. */
async function runPush(): Promise<void> {
  // re-check: hydration may have started after this timer was queued
  if (_isHydrating) { _pushDeferred = true; return; }
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return;
  _pushing = true;
  let allPushed = false;
  try {
    allPushed = await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  } catch (err) {
    console.warn('[space-sync] push failed:', err);
  } finally {
    _pushing = false;
  }
  if (allPushed) { pushSucceeded(); return; }
  // Hitting a wall more often does not get you through it.
  if (_lastPushWriteDenied) return;
  schedulePushRetry();
}

function pushSucceeded(): void {
  _pushRetryAttempt = 0;
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  useSyncPendingStore.getState().setUnsavedChanges(false);
}

function schedulePushRetry(): void {
  _pushRetryAttempt++;
  if (_pushRetryAttempt >= PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL) {
    useSyncPendingStore.getState().setUnsavedChanges(true);
  }
  const delay = Math.min(
    PUSH_RETRY_BASE_MS * 2 ** (_pushRetryAttempt - 1),
    PUSH_RETRY_MAX_MS,
  );
  if (_pushRetryTimer) clearTimeout(_pushRetryTimer);
  _pushRetryTimer = setTimeout(() => {
    _pushRetryTimer = null;
    void runPush();
  }, delay);
}

/**
 * Cancel any pending debounced push and block future scheduling.
 * Call before a legacy import so a stale timer cannot overwrite freshly pushed nodes.
 * Pair with restoreSyncPush() in a finally block.
 */
export function suppressSyncPush(): void {
  if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
  _isHydrating = true;
  // Suppression is a DELIBERATE discard: it must leave nothing to replay. The
  // import that uses it pushes explicitly afterwards.
  _pushDeferred = false;
  // The durable marker follows the in-memory request: a deliberate discard must
  // leave nothing to replay at the next startup.
  clearPendingPush();
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  _pushRetryAttempt = 0;
}

/** Re-enable push scheduling after a legacy import. */
export function restoreSyncPush(): void {
  _isHydrating = false;
}

/** Clears the dirty-push baselines and collection state. hydrateFromSpace already reseeds
 *  these correctly in production (cold boot / wedding switch); exported so tests can isolate
 *  consecutive pushSpaceSnapshot calls from each other's state. */
export function resetDirtyPushBaseline(): void {
  _lastPushedJson.clear();
  _lastPushedCollectionJson.clear();
  _collectionState.clear();
  _collectionEntityJson.clear();
  _lastHydrateSawLegacy = false;
  // The retry backlog belongs to the wedding being left. Letting it run would
  // retry a snapshot that no longer applies, and leave the banner lit on a
  // wedding with nothing outstanding.
  if (_pushRetryTimer) { clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
  _pushRetryAttempt = 0;
  _pushDeferred = false;
  _lastPushWriteDenied = false;
  // The backlog belongs to the wedding being left, and so does the marker.
  clearPendingPush();
  useSyncPendingStore.getState().setUnsavedChanges(false);
}

// ---------------------------------------------------------------------------
// Build the wedding singleton node from current store state
// ---------------------------------------------------------------------------

/** Sync-model marker stamped on the wedding root `meta`: 2 = per-collection docs. */
export const SYNC_SCHEMA_VERSION = 2;

function descriptorToNode(desc: NodeDescriptor, order: number, now: number): ObjectNode {
  return {
    id: desc.id,
    type: desc.type,
    parentId: desc.parentId,
    order,
    title: desc.title,
    updatedAt: now,
    contentKind: desc.contentKind,
    access: desc.access,
    enc: desc.enc,
    meta: desc.meta,
  };
}

/** The `wedding` root stays its own per-node doc (not collapsed) — `discoverOwnerWeddingRoot`
 *  relies on a `wedding`/`parentId:null` node existing. Stamps `syncSchemaVersion` on its meta.
 *  Also builds its 1-item CollectionDoc (see buildSingletonDoc) so it can be pushed through
 *  mergeCollectionDoc's per-entity rev LWW instead of a whole-object clobber — see the
 *  "Close the wedding-singleton lost-update hole" plan. */
function buildWeddingNode(
  weddingNodeId: string,
  now: number,
): { node: ObjectNode; content: Record<string, unknown>; doc: CollectionDoc } | null {
  const { wedding } = useWeddingStore.getState();
  if (!wedding) return null;
  const desc = weddingToNode(wedding, weddingNodeId);
  const node = descriptorToNode(
    { ...desc, meta: { ...desc.meta, syncSchemaVersion: SYNC_SCHEMA_VERSION } },
    0,
    now,
  );
  const content = wedding as unknown as Record<string, unknown>;
  const { doc } = buildSingletonDoc(weddingNodeId, content, now);
  return { node, content, doc };
}


// ---------------------------------------------------------------------------
// Build per-collection docs from current store state (Release 1 dual-write)
// ---------------------------------------------------------------------------

/** The 28 collapsing admin collections (everything except the `wedding` singleton root and
 *  the guest-surface publicPage/rsvp invite nodes). `wedding` stays its own per-node doc. */
function collectionSources(): { type: string; items: CollectionEntity[] }[] {
  const { guests, tables, groups } = useGuestsStore.getState();
  const { vendors, quotePricings, vendorPayments } = useVendorsStore.getState();
  const { accommodations } = useAccommodationsStore.getState();
  const { categories, tasks, agendaEvents, dayOfItems } = usePlanningStore.getState();
  const { collections, ideas } = useIdeasStore.getState();
  const { gifts } = useGiftsStore.getState();
  const { invitationTypes } = useInvitationTypesStore.getState();
  const { communications } = useCommunicationsStore.getState();
  const { weddingRoles, weddingRoleAssignments } = useWeddingPartyStore.getState();
  const { seatingConstraints } = useSeatingConstraintsStore.getState();
  const { weddingEvents } = useWeddingEventsStore.getState();
  const { mealSelections } = useMealSelectionsStore.getState();
  const { communicationTemplates } = useCommunicationTemplatesStore.getState();
  const { documents } = useDocumentsStore.getState();
  const { legalMilestones } = useLegalStore.getState();
  const { honeymoonPlans } = useHoneymoonStore.getState();
  const { ceremonyItems } = useCeremonyStore.getState();
  const { speeches, playlistTracks } = useSpeechesMusicStore.getState();
  const { roles: permissionRoles, assignments: permissionAssignments } = usePermissionsStore.getState();

  const as = (arr: unknown[]) => arr as CollectionEntity[];
  return [
    { type: FIANCE_TYPES.guestGroup, items: as(groups) },
    { type: FIANCE_TYPES.guest, items: as(guests) },
    { type: FIANCE_TYPES.table, items: as(tables) },
    { type: FIANCE_TYPES.vendor, items: as(vendors) },
    { type: FIANCE_TYPES.quotePricing, items: as(quotePricings) },
    { type: FIANCE_TYPES.vendorPayment, items: as(vendorPayments) },
    { type: FIANCE_TYPES.accommodation, items: as(accommodations) },
    { type: FIANCE_TYPES.gift, items: as(gifts) },
    { type: FIANCE_TYPES.invitationType, items: as(invitationTypes) },
    { type: FIANCE_TYPES.communication, items: as(communications) },
    { type: FIANCE_TYPES.weddingRole, items: as(weddingRoles) },
    { type: FIANCE_TYPES.weddingRoleAssignment, items: as(weddingRoleAssignments) },
    { type: FIANCE_TYPES.seatingConstraint, items: as(seatingConstraints) },
    { type: FIANCE_TYPES.weddingEvent, items: as(weddingEvents) },
    { type: FIANCE_TYPES.guestMealSelection, items: as(mealSelections) },
    { type: FIANCE_TYPES.communicationTemplate, items: as(communicationTemplates) },
    { type: FIANCE_TYPES.document, items: as(documents) },
    { type: FIANCE_TYPES.legalMilestone, items: as(legalMilestones) },
    { type: FIANCE_TYPES.honeymoonPlan, items: as(honeymoonPlans) },
    { type: FIANCE_TYPES.taskCategory, items: as(categories) },
    { type: FIANCE_TYPES.task, items: as(tasks) },
    { type: FIANCE_TYPES.agendaEvent, items: as(agendaEvents) },
    { type: FIANCE_TYPES.dayOfItem, items: as(dayOfItems) },
    { type: FIANCE_TYPES.ideaCollection, items: as(collections) },
    { type: FIANCE_TYPES.idea, items: as(ideas) },
    { type: FIANCE_TYPES.ceremonyItem, items: as(ceremonyItems) },
    { type: FIANCE_TYPES.speech, items: as(speeches) },
    { type: FIANCE_TYPES.playlistTrack, items: as(playlistTracks) },
    { type: FIANCE_TYPES.permissionRole, items: as(permissionRoles) },
    { type: FIANCE_TYPES.permissionAssignment, items: as(permissionAssignments) },
  ];
}

/** One sentinel ObjectNode per collection — a lightweight index entry addressing the
 *  collection doc at `col:{type}:{weddingNodeId}` (access:'space', enc:true → same keyring). */
function collectionNode(type: string, weddingNodeId: string, order: number, now: number): ObjectNode {
  return {
    id: collectionNodeId(type, weddingNodeId),
    type,
    parentId: weddingNodeId,
    order,
    title: type,
    updatedAt: now,
    contentKind: 'merge',
    access: 'space',
    enc: true,
    meta: { collection: true },
  };
}

interface BuiltCollection {
  node: ObjectNode;
  type: string;
  doc: CollectionDoc;
  /** commit to _collectionState on a successful push of this collection. */
  nextState: CollectionState;
  /** entity id → stableStringify(entity); commit to _collectionEntityJson on success. */
  entityJson: Map<string, string>;
}

/** Build the sentinel nodes + collection docs to (dual-)write, reusing the per-collection
 *  dirty baseline to decide which entities get a fresh `rev`. Pure w.r.t. module state:
 *  callers commit `nextState`/`entityJson` only after the corresponding push succeeds. */
function buildCollectionDocs(weddingNodeId: string, now: number): { nodes: ObjectNode[]; built: BuiltCollection[] } {
  const nodes: ObjectNode[] = [];
  const built: BuiltCollection[] = [];
  let order = 0;
  for (const { type, items } of collectionSources()) {
    const prev = _collectionState.get(type) ?? { rev: {}, tombstones: {} };
    // Skip a collection that is empty AND has no carried state — no point minting a
    // sentinel node or pushing an empty doc for a collection the wedding never used.
    // Once it holds data (or a pending tombstone/rev), it stays material so deletes propagate.
    if (!items.length && !Object.keys(prev.rev).length && !Object.keys(prev.tombstones).length) continue;
    const changedIds = new Set<string>();
    const entityJson = new Map<string, string>();
    for (const e of items) {
      const j = stableStringify(e);
      entityJson.set(e.id, j);
      if (_collectionEntityJson.get(e.id) !== j) changedIds.add(e.id);
    }
    const { doc, state } = buildCollectionDoc(items, prev, changedIds, now);
    const node = collectionNode(type, weddingNodeId, order++, now);
    nodes.push(node);
    built.push({ node, type, doc, nextState: state, entityJson });
  }
  return { nodes, built };
}

// ---------------------------------------------------------------------------
// Push snapshot to server
// ---------------------------------------------------------------------------

/** Push a single collection doc — CAS-merging via `merge` (default: mergeCollectionDoc, so a
 *  peer's concurrent edit/add/delete to a different entity in the same collection is
 *  reconciled, not clobbered). The wedding singleton passes mergeSingletonDoc instead, which
 *  additionally tolerates a legacy (pre-migration, un-wrapped) remote doc — see its doc comment. */
async function pushCollectionDoc(
  session: Session,
  spaceId: string,
  node: ObjectNode,
  doc: CollectionDoc,
  now: number,
  merge: (cur: unknown, doc: CollectionDoc, now: number) => CollectionDoc = (cur, doc, now) =>
    mergeCollectionDoc(cur, doc, { now }),
): Promise<boolean> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    await handle.push(
      objDocPull(spaceId, node.id),
      objDocPush(spaceId, node.id),
      (cur) => merge(cur, doc, now) as unknown as Record<string, unknown>,
    );
    useSyncAccessStore.getState().setWriteDenied(false);
    return true;
  } catch (err) {
    // A 403 here is the authoritative "this device's cap has no write access" signal —
    // ground truth from the server, unlike the proactive write-flag check in providers.tsx
    // (which can't see older link tokens where `write` was never recorded). See
    // useSyncAccessStore.ts for how this flag is consumed (ReadOnlyBanner + usePermissions).
    if (err instanceof StarfishHttpError && err.status === 403) {
      useSyncAccessStore.getState().setWriteDenied(true);
      // A write-permission refusal is not solved by retrying, and is already
      // surfaced by useSyncAccessStore's banner. Recording it here stops the
      // retry looping against a wall.
      _lastPushWriteDenied = true;
    }
    console.warn(`[space-sync] pushCollectionDoc ${node.id}:`, err);
    return false;
  }
}

export async function pushSpaceSnapshot(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<boolean> {
  const now = Date.now();
  // Content is one doc per collection (+ the wedding singleton). No per-entity content docs.
  const weddingBuilt = buildWeddingNode(weddingNodeId, now);
  const { nodes: collectionNodes, built } = buildCollectionDocs(weddingNodeId, now);
  const weddingNode = weddingBuilt?.node ?? null;
  const allNodes = [...(weddingNode ? [weddingNode] : []), ...collectionNodes];
  if (!allNodes.length) return true; // truly empty state — nothing to sync

  const localById = new Map(allNodes.map((n) => [n.id, n]));

  // ── Push content FIRST, update the index second ──────────────────────────────
  // Pushing a space+enc content doc is index-independent (access resolves from local caps +
  // the space keyring, not the object index — see starfish-spaces getNodeAccess/handle.push).
  // Doing it before the index update means a failed content push can never leave the index
  // pruned-but-contentless: the legacy-node prune below only fires for collections whose doc is
  // confirmed durable, so a partial failure keeps the legacy nodes reachable until the retry.

  // Push the wedding singleton (per-entity rev LWW via mergeSingletonDoc, same as a
  // 1-item collection — see the "Close the wedding-singleton lost-update hole" plan)
  // if its content changed.
  const weddingDirty =
    weddingBuilt && stableStringify(weddingBuilt.content) !== _lastPushedJson.get(weddingBuilt.node.id);

  // Collection docs whose serialized form changed since last push — a 120-guest import
  // mutates only the guest store, so exactly one collection doc (guest) is dirty here.
  const dirtyCollections = built.filter(
    (b) => stableStringify(b.doc) !== _lastPushedCollectionJson.get(b.node.id),
  );

  const pushResults = await Promise.allSettled([
    ...(weddingDirty && weddingBuilt
      ? [pushCollectionDoc(
          session, spaceId, weddingBuilt.node, weddingBuilt.doc, now,
          (cur, doc, now) => mergeSingletonDoc(cur, doc, weddingNodeId, { now }),
        ).then((ok) => {
          if (ok) _lastPushedJson.set(weddingBuilt.node.id, stableStringify(weddingBuilt.content));
          return ok;
        })]
      : []),
    ...dirtyCollections.map((b) =>
      pushCollectionDoc(session, spaceId, b.node, b.doc, now).then((ok) => {
        if (!ok) return false;
        _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
        _collectionState.set(b.type, b.nextState);
        for (const [id, j] of b.entityJson) _collectionEntityJson.set(id, j);
        return true;
      }),
    ),
  ]);

  // Report what did NOT go through.
  //
  // pushCollectionDoc swallows its failure into a console.warn and returns
  // false, and allSettled absorbed the rest: a half-lost push ended exactly like
  // a successful one. The caller had no way to retry and nothing could report
  // it. The boolean below is what makes the retry, and its banner, possible.
  //
  // An empty array — nothing dirty to push — counts as success: that is exactly
  // the case where everything due has arrived.
  const allPushed = pushResults.every(
    (r) => r.status === 'fulfilled' && r.value !== false,
  );

  // The marker is cleared HERE and not in pushSucceeded: five paths push while
  // bypassing the debounce timer (the import, the invite link, resync,
  // revocation, startup migration). Clearing higher up
  // would leave the marker set after those pushes, and the next startup would
  // push again for nothing.
  if (allPushed) clearPendingPush();

  // Collections whose current doc is now durably on the server (just pushed, or already clean
  // from a prior push). ONLY these may have their legacy per-entity nodes pruned below.
  const durableSentinels = new Set(
    built
      .filter((b) => _lastPushedCollectionJson.get(b.node.id) === stableStringify(b.doc))
      .map((b) => b.node.id),
  );

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (prev, idxNow) => {
      // The only managed nodes we write are the wedding root and the deterministic collection
      // sentinels (same id on every device), so no "peer added an unknown node" ambiguity
      // remains — deletes now ride inside the collection docs as tombstones. Everything else:
      //  - non-managed (publicPage/rsvp) → keep untouched
      //  - a collection sentinel or the wedding root not built locally (a collection this device
      //    hasn't hydrated / has emptied) → keep, so we never orphan a peer's collection doc
      //  - a LEGACY per-entity node whose collection is durably written → PRUNE (migration cutover)
      //  - a LEGACY per-entity node whose collection is NOT yet durable (its push failed, or its
      //    store was empty so no doc was written) → KEEP, so we never strand data; a later push
      //    prunes it once the collection doc is confirmed on the server
      const merged = allNodes.map((n) => ({ ...n, updatedAt: idxNow }));
      for (const r of prev) {
        if (!MANAGED_TYPES.has(r.type)) { merged.push(r); continue; }
        if (localById.has(r.id)) continue;
        if (isCollectionNodeId(r.id) || r.id === weddingNodeId) { merged.push(r); continue; }
        if (durableSentinels.has(collectionNodeId(r.type, weddingNodeId))) continue; // durable → prune
        merged.push(r); // not yet durable → keep, retry next round
      }
      return merged;
    }),
  );

  return allPushed;
}

// ---------------------------------------------------------------------------
// Hydrate stores from server
// ---------------------------------------------------------------------------

async function pullNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<Record<string, unknown> | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, node, session, null);
    const result = await handle.client.pull(objDocPull(spaceId, node.id)) as { data: Record<string, unknown> | null };
    if (!result?.data) return null;
    return handle.encryptor ? await handle.encryptor.decrypt(result.data) : result.data;
  } catch (err) {
    // Log once per node so a missing space-access credential is visible in the console
    // rather than presenting as a mysteriously empty wedding (silent return null path).
    console.warn(`[space-sync] pullNodeContent ${node.type}:${node.id} failed:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Batch-pull the per-collection docs (one /batch/pull over the sentinel ids) and decrypt each,
 *  keyed by entity type. All sentinels are access:'space', so the single batch fast-path applies. */
async function pullCollectionDocs(
  session: Session,
  spaceId: string,
  sentinels: ObjectNode[],
): Promise<Map<string, CollectionDoc>> {
  const out = new Map<string, CollectionDoc>();
  if (!sentinels.length) return out;
  try {
    const handle = await getNodeAccess(spaceId, sentinels[0].id, sentinels[0], session, null);
    const entries = await handle.client.batchPullMany(
      'objdoc',
      sentinels.map((n) => ({ spaceId, objectId: n.id })),
    );
    await Promise.all(entries.map(async (entry: { error?: unknown; data?: unknown }, i: number) => {
      if (entry.error || !entry.data) {
        if (entry.error) console.warn(`[space-sync] pullCollectionDocs ${sentinels[i].type} failed:`, entry.error);
        return;
      }
      const data = entry.data as Record<string, unknown>;
      const decrypted = handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      out.set(sentinels[i].type, asCollectionDoc(decrypted));
    }));
  } catch (err) {
    console.warn('[space-sync] pullCollectionDocs failed:', err);
  }
  return out;
}

/**
 * Discovers the owner's wedding root ObjectNode id from the shared space index.
 * Called once per member device on first boot (before initSync) so the joiner
 * converges on the same root as the owner and the trees don't diverge.
 *
 * Heuristic for polluted spaces (multiple wedding/parentId:null roots):
 *   1. Exclude this device's own freshly-minted root id.
 *   2. Among the remaining candidates, prefer the oldest by updatedAt (= original owner).
 *
 * Returns null when the space is empty, unreachable, or only contains this device's root.
 * In that case the caller should fall back to wedding.id and not persist a weddingNodeId.
 *
 * Mirrors the proven reconciliation in fiance-sdk/src/sync/import-legacy.ts:123-124.
 */
export async function discoverOwnerWeddingRoot(
  session: Session,
  spaceId: string,
  ownId: string,
): Promise<string | null> {
  try {
    const nodes = await readObjectTree(session, spaceId);
    const roots = nodes.filter(
      (n) => n.type === FIANCE_TYPES.wedding && n.parentId === null,
    );
    if (!roots.length) return null;
    // Exclude this device's own minted root so we don't adopt ourselves.
    const others = roots.filter((r) => r.id !== ownId);
    const pool = others.length ? others : roots;
    // Oldest updatedAt = the original owner's root (joiners were created later).
    return pool.reduce((a, b) => (b.updatedAt < a.updatedAt ? b : a)).id;
  } catch {
    return null;
  }
}

/** Returns the number of nodes pulled from the server (0 = space was empty). */
export async function hydrateFromSpace(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<number> {
  _isHydrating = true;
  // Epoch captured on entry. Any local mutation between here and the apply will
  // make it diverge, and the read state will be discarded.
  const epochAtEntry = _localEditEpoch;
  _lastHydrateApplied = false;
  try {
    const nodes = await readObjectTree(session, spaceId);
    if (!nodes.length) {
      console.warn(
        `[space-sync] hydrateFromSpace: empty object index for ${spaceId} — owner published no content, or space-access credential unrestored`,
      );
      return 0;
    }

    // Sentinel (per-collection) nodes share a `type` with legacy per-entity nodes, so bucket
    // them out first — the legacy pull path must not treat a collection doc as a lone entity.
    const sentinelNodes: ObjectNode[] = [];
    const byType = new Map<string, ObjectNode[]>();
    let sawLegacy = false;
    for (const n of nodes) {
      if (isCollectionNodeId(n.id)) { sentinelNodes.push(n); continue; }
      // A managed, non-wedding node that isn't a sentinel is a legacy per-entity node from the
      // old one-doc-per-entity model → this owner boot should migrate + prune it. (`wedding`
      // stays a per-node doc in the new model, so it never counts as legacy.)
      if (MANAGED_TYPES.has(n.type) && n.type !== FIANCE_TYPES.wedding) sawLegacy = true;
      const arr = byType.get(n.type) ?? [];
      arr.push(n);
      byType.set(n.type, arr);
    }
    _lastHydrateSawLegacy = sawLegacy;

    const pullAll = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      const results = await Promise.all(typeNodes.map((n) => pullNodeContent(session, spaceId, n)));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Batched variant of pullAll: one /batch/pull round-trip per collection type
    // instead of one HTTP request per node, to avoid rate-limiting on hydrate.
    // Only safe for plain space-member content (objdoc) — nodes with a per-node
    // 'invite' access entry can resolve to a different client/cap, so those fall
    // back to the per-node pullAll path.
    const pullAllBatch = async (type: string): Promise<Record<string, unknown>[]> => {
      const typeNodes = byType.get(type) ?? [];
      if (!typeNodes.length) return [];
      if (typeNodes.some((n) => n.access === 'invite')) return pullAll(type);

      const handle = await getNodeAccess(spaceId, typeNodes[0].id, typeNodes[0], session, null);
      const entries = await handle.client.batchPullMany(
        'objdoc',
        typeNodes.map((n) => ({ spaceId, objectId: n.id })),
      );

      const results = await Promise.all(entries.map(async (entry, i) => {
        if (entry.error || !entry.data) {
          if (entry.error) {
            console.warn(`[space-sync] pullAllBatch ${type}:${typeNodes[i].id} failed:`, entry.error);
          }
          return null;
        }
        const data = entry.data as Record<string, unknown>;
        return handle.encryptor ? await handle.encryptor.decrypt(data) : data;
      }));
      return results.filter((r): r is Record<string, unknown> => r !== null);
    };

    // Release 1 dual-read: pull the per-collection docs (one batch over the sentinel ids) and
    // seed the collection state so the next push carries the correct rev/tombstones. Falls back
    // gracefully to legacy-only when a space has no collection docs yet.
    const collectionDocsByType = await pullCollectionDocs(session, spaceId, sentinelNodes);
    // Reset to fresh remote truth: a type with no pulled doc gets no carried state, so a
    // locally-deleted-but-still-legacy entity re-hydrates rather than sticking.
    _collectionState.clear();
    for (const [type, doc] of collectionDocsByType) {
      _collectionState.set(type, { rev: { ...doc.rev }, tombstones: { ...doc.tombstones } });
    }

    // Union a collection's legacy per-entity docs with its collection doc: collection live items
    // win, tombstoned ids are removed. During the transition an old-build device may write only
    // a per-entity node, so a legacy-only entity (absent from the collection doc) is preserved.
    const pullCollection = async (type: string): Promise<Record<string, unknown>[]> => {
      const legacy = await pullAllBatch(type);
      const cdoc = collectionDocsByType.get(type);
      if (!cdoc) return legacy;
      const byId = new Map<string, Record<string, unknown>>();
      for (const e of legacy) {
        const id = (e as { id?: unknown }).id;
        if (typeof id === 'string') byId.set(id, e);
      }
      for (const [id, entity] of Object.entries(cdoc.items)) {
        if (cdoc.tombstones[id] === undefined) byId.set(id, entity); // collection live wins
      }
      for (const id of Object.keys(cdoc.tombstones)) byId.delete(id); // tombstone removes
      return [...byId.values()];
    };

    // Select the active wedding node at index level (node ids are available here but
    // lost after pullNodeContent decryption — this is the correct place to filter).
    // Fall back to first node when no match (owner's own boot, only one root present).
    const weddingNodes = byType.get(FIANCE_TYPES.wedding) ?? [];
    const weddingNode = weddingNodes.find((n) => n.id === weddingNodeId) ?? weddingNodes[0] ?? null;

    const [
      weddingDoc,
      guestGroupDocs,
      guestDocs,
      tableDocs,
      vendorDocs,
      quotePricingDocs,
      vendorPaymentDocs,
      accommodationDocs,
      giftDocs,
      invitationTypeDocs,
      communicationDocs,
      weddingRoleDocs,
      weddingRoleAssignmentDocs,
      seatingConstraintDocs,
      weddingEventDocs,
      guestMealSelectionDocs,
      communicationTemplateDocs,
      documentDocs,
      legalMilestoneDocs,
      honeymoonPlanDocs,
      taskCategoryDocs,
      taskDocs,
      agendaEventDocs,
      dayOfItemDocs,
      ideaCollectionDocs,
      ideaDocs,
      ceremonyItemDocs,
      speechDocs,
      playlistTrackDocs,
      permissionRoleDocs,
      permissionAssignmentDocs,
    ] = await Promise.all([
      weddingNode ? pullNodeContent(session, spaceId, weddingNode) : Promise.resolve(null),
      pullCollection(FIANCE_TYPES.guestGroup),
      pullCollection(FIANCE_TYPES.guest),
      pullCollection(FIANCE_TYPES.table),
      pullCollection(FIANCE_TYPES.vendor),
      pullCollection(FIANCE_TYPES.quotePricing),
      pullCollection(FIANCE_TYPES.vendorPayment),
      pullCollection(FIANCE_TYPES.accommodation),
      pullCollection(FIANCE_TYPES.gift),
      pullCollection(FIANCE_TYPES.invitationType),
      pullCollection(FIANCE_TYPES.communication),
      pullCollection(FIANCE_TYPES.weddingRole),
      pullCollection(FIANCE_TYPES.weddingRoleAssignment),
      pullCollection(FIANCE_TYPES.seatingConstraint),
      pullCollection(FIANCE_TYPES.weddingEvent),
      pullCollection(FIANCE_TYPES.guestMealSelection),
      pullCollection(FIANCE_TYPES.communicationTemplate),
      pullCollection(FIANCE_TYPES.document),
      pullCollection(FIANCE_TYPES.legalMilestone),
      pullCollection(FIANCE_TYPES.honeymoonPlan),
      pullCollection(FIANCE_TYPES.taskCategory),
      pullCollection(FIANCE_TYPES.task),
      pullCollection(FIANCE_TYPES.agendaEvent),
      pullCollection(FIANCE_TYPES.dayOfItem),
      pullCollection(FIANCE_TYPES.ideaCollection),
      pullCollection(FIANCE_TYPES.idea),
      pullCollection(FIANCE_TYPES.ceremonyItem),
      pullCollection(FIANCE_TYPES.speech),
      pullCollection(FIANCE_TYPES.playlistTrack),
      pullCollection(FIANCE_TYPES.permissionRole),
      pullCollection(FIANCE_TYPES.permissionAssignment),
    ]);

    // Diagnostic: if the space has content nodes but decryption yielded 0 guests,
    // a credential or space-access failure is the most likely cause.
    const totalGuestNodes = byType.get(FIANCE_TYPES.guest)?.length ?? 0;
    if (totalGuestNodes > 0 && guestDocs.length === 0) {
      console.warn(`[space-sync] decrypted 0/${totalGuestNodes} guest nodes — check space-access credential`);
    }

    // Feed into stores — setters do NOT call notifySync, so no circular dispatch.
    // readSingletonEntity unwraps the 1-item CollectionDoc (or tolerates a legacy raw, or
    // rollout-window hybrid, remote — see its doc comment) before it reaches the store.
    const { entity: weddingEntity } = readSingletonEntity(weddingDoc, weddingNodeId);
    if (weddingEntity) useWeddingStore.getState().setWedding(weddingFromDoc(weddingEntity) as Parameters<ReturnType<typeof useWeddingStore.getState>['setWedding']>[0]);
    if (guestGroupDocs.length) useGuestsStore.getState().setGroups(guestGroupDocs.map(guestGroupFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGroups']>[0]);
    if (tableDocs.length) useGuestsStore.getState().setTables(tableDocs.map(tableFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setTables']>[0]);
    if (guestDocs.length) useGuestsStore.getState().setGuests(guestDocs.map(guestFromDoc) as Parameters<ReturnType<typeof useGuestsStore.getState>['setGuests']>[0]);
    if (vendorDocs.length) useVendorsStore.getState().setVendors(vendorDocs.map(vendorFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendors']>[0]);
    if (quotePricingDocs.length) useVendorsStore.getState().setQuotePricings(quotePricingDocs.map(quotePricingFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setQuotePricings']>[0]);
    if (vendorPaymentDocs.length) useVendorsStore.getState().setVendorPayments(vendorPaymentDocs.map(vendorPaymentFromDoc) as Parameters<ReturnType<typeof useVendorsStore.getState>['setVendorPayments']>[0]);
    if (accommodationDocs.length) useAccommodationsStore.getState().setAccommodations(accommodationDocs.map(accommodationFromDoc) as Parameters<ReturnType<typeof useAccommodationsStore.getState>['setAccommodations']>[0]);
    if (giftDocs.length) useGiftsStore.getState().setGifts(giftDocs.map(giftFromDoc) as Parameters<ReturnType<typeof useGiftsStore.getState>['setGifts']>[0]);
    if (invitationTypeDocs.length) useInvitationTypesStore.getState().setInvitationTypes(invitationTypeDocs.map(invitationTypeFromDoc) as Parameters<ReturnType<typeof useInvitationTypesStore.getState>['setInvitationTypes']>[0]);
    if (communicationDocs.length) useCommunicationsStore.getState().setCommunications(communicationDocs.map(communicationFromDoc) as Parameters<ReturnType<typeof useCommunicationsStore.getState>['setCommunications']>[0]);
    if (weddingRoleDocs.length) useWeddingPartyStore.getState().setWeddingRoles(weddingRoleDocs.map(weddingRoleFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoles']>[0]);
    if (weddingRoleAssignmentDocs.length) useWeddingPartyStore.getState().setWeddingRoleAssignments(weddingRoleAssignmentDocs.map(weddingRoleAssignmentFromDoc) as Parameters<ReturnType<typeof useWeddingPartyStore.getState>['setWeddingRoleAssignments']>[0]);
    if (seatingConstraintDocs.length) useSeatingConstraintsStore.getState().setSeatingConstraints(seatingConstraintDocs.map(seatingConstraintFromDoc) as Parameters<ReturnType<typeof useSeatingConstraintsStore.getState>['setSeatingConstraints']>[0]);
    if (weddingEventDocs.length) useWeddingEventsStore.getState().setWeddingEvents(weddingEventDocs.map(weddingEventFromDoc) as Parameters<ReturnType<typeof useWeddingEventsStore.getState>['setWeddingEvents']>[0]);
    if (guestMealSelectionDocs.length) useMealSelectionsStore.getState().setMealSelections(guestMealSelectionDocs.map(guestMealSelectionFromDoc) as Parameters<ReturnType<typeof useMealSelectionsStore.getState>['setMealSelections']>[0]);
    if (communicationTemplateDocs.length) useCommunicationTemplatesStore.getState().setCommunicationTemplates(communicationTemplateDocs.map(communicationTemplateFromDoc) as Parameters<ReturnType<typeof useCommunicationTemplatesStore.getState>['setCommunicationTemplates']>[0]);
    if (documentDocs.length) useDocumentsStore.getState().setDocuments(documentDocs.map(documentFromDoc) as Parameters<ReturnType<typeof useDocumentsStore.getState>['setDocuments']>[0]);
    if (legalMilestoneDocs.length) useLegalStore.getState().setLegalMilestones(legalMilestoneDocs.map(legalMilestoneFromDoc) as Parameters<ReturnType<typeof useLegalStore.getState>['setLegalMilestones']>[0]);
    if (honeymoonPlanDocs.length) useHoneymoonStore.getState().setHoneymoonPlans(honeymoonPlanDocs.map(honeymoonPlanFromDoc) as Parameters<ReturnType<typeof useHoneymoonStore.getState>['setHoneymoonPlans']>[0]);
    if (taskCategoryDocs.length) usePlanningStore.getState().setCategories(taskCategoryDocs.map(taskCategoryFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setCategories']>[0]);
    if (taskDocs.length) usePlanningStore.getState().setTasks(taskDocs.map(taskFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setTasks']>[0]);
    if (agendaEventDocs.length) usePlanningStore.getState().setAgendaEvents(agendaEventDocs.map(agendaEventFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setAgendaEvents']>[0]);
    if (dayOfItemDocs.length) usePlanningStore.getState().setDayOfItems(dayOfItemDocs.map(dayOfItemFromDoc) as Parameters<ReturnType<typeof usePlanningStore.getState>['setDayOfItems']>[0]);
    if (ideaCollectionDocs.length) useIdeasStore.getState().setCollections(ideaCollectionDocs.map(ideaCollectionFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setCollections']>[0]);
    if (ideaDocs.length) useIdeasStore.getState().setIdeas(ideaDocs.map(ideaFromDoc) as Parameters<ReturnType<typeof useIdeasStore.getState>['setIdeas']>[0]);
    if (ceremonyItemDocs.length) useCeremonyStore.getState().setCeremonyItems(ceremonyItemDocs.map(ceremonyItemFromDoc) as Parameters<ReturnType<typeof useCeremonyStore.getState>['setCeremonyItems']>[0]);
    if (speechDocs.length) useSpeechesMusicStore.getState().setSpeeches(speechDocs.map(speechFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setSpeeches']>[0]);
    if (playlistTrackDocs.length) useSpeechesMusicStore.getState().setPlaylistTracks(playlistTrackDocs.map(playlistTrackFromDoc) as Parameters<ReturnType<typeof useSpeechesMusicStore.getState>['setPlaylistTracks']>[0]);
    if (permissionRoleDocs.length) usePermissionsStore.getState().setRoles(permissionRoleDocs.map(permissionRoleFromDoc) as Parameters<ReturnType<typeof usePermissionsStore.getState>['setRoles']>[0]);
    if (permissionAssignmentDocs.length) usePermissionsStore.getState().setAssignments(permissionAssignmentDocs.map(permissionAssignmentFromDoc) as Parameters<ReturnType<typeof usePermissionsStore.getState>['setAssignments']>[0]);

    // Pull RSVP submissions — rsvp nodes live in objinv (plaintext, owner has space:member access).
    // Owner-only: a member device has no business independently applying public-page RSVP
    // submissions into its guest store — it receives RSVP state through normal guest-collection
    // sync from the owner. Applying it here too raced a member's guest store against concurrent
    // hydrates/pushes and could drop or tombstone a member's own newly created/edited guest.
    if (!isActiveDeviceMember()) {
      await pullAndApplyRsvpNodes(session, spaceId, byType.get(FIANCE_TYPES.rsvp) ?? []);
    }

    // Seed the wedding-node dirty baseline from what we just hydrated, so the next debounced
    // push only sends it if genuinely edited locally after this point.
    _lastPushedJson.clear();
    const seedWedding = buildWeddingNode(weddingNodeId, Date.now());
    if (seedWedding) _lastPushedJson.set(seedWedding.node.id, stableStringify(seedWedding.content));

    // Seed the collection baselines too. _collectionEntityJson is set from the hydrated entities
    // first so the baseline build treats nothing as "changed" (no rev bump); _collectionState was
    // already seeded from the pulled docs above. A collection that gained a legacy-only entity
    // (rev absent) will show as dirty on the next push — that is the intended one-shot migration
    // that folds the straggler into the collection doc.
    _collectionEntityJson.clear();
    _lastPushedCollectionJson.clear();
    for (const { items } of collectionSources()) {
      for (const e of items) _collectionEntityJson.set(e.id, stableStringify(e));
    }
    const { built: builtCollections } = buildCollectionDocs(weddingNodeId, Date.now());
    for (const b of builtCollections) {
      _lastPushedCollectionJson.set(b.node.id, stableStringify(b.doc));
    }

    _lastHydrateApplied = true;
    return nodes.length;
  } finally {
    _isHydrating = false;
    // The resume. A request discarded during this hydration is replayed now,
    // never dropped. The flag is a boolean: five held changes give one push,
    // which the 2 s timer would have coalesced anyway.
    //
    // Order matters: _isHydrating must already be false, or scheduleSyncPush
    // would simply raise the flag again and we would go in circles.
    if (_pushDeferred) {
      _pushDeferred = false;
      scheduleSyncPush();
    }
  }
}

/**
 * Re-hydrates from the space if no local push is in flight or pending — called on
 * app/tab foreground so this device picks up peers' changes without a full reload.
 * No-ops while hydrating or while a debounced local push is queued, so it never
 * clobbers an edit this device hasn't flushed yet.
 *
 * Returns whether a hydrate actually ran, so callers that also refresh RSVP nodes
 * (which a hydrate already pulls) can skip that redundant pull when this returns true.
 */
export async function refreshFromSpaceIfIdle(): Promise<boolean> {
  // A pending retry counts for exactly the same reason as _pushTimer: it carries
  // a change this device has not managed to flush, and a hydration would erase
  // it.
  //
  // But it only blocks while there is still hope of flushing it. Past the signal
  // threshold the user has been told their changes are not saved, which is the
  // contract's second branch: reach the server, OR be reported. Blocking beyond
  // that would leave the device permanently blind to other people's changes on a
  // durable non-403 failure — trading a silent loss for a silent blindness.
  const retryStillProtects =
    _pushRetryTimer !== null && _pushRetryAttempt < PUSH_RETRY_ATTEMPTS_BEFORE_SIGNAL;
  if (_isHydrating || _pushTimer || retryStillProtects || _pushing || _rsvpRefreshing) return false;
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return false;
  return hydrateFromSpace(session, spaceId, weddingNodeId)
    // Report what was APPLIED, not what was read. A discarded hydration (a
    // concurrent local change) applied nothing, so pulled nothing RSVP-side: the
    // caller must be able to fall back to refreshRsvpInbox.
    .then(() => _lastHydrateApplied)
    .catch((err) => {
      console.warn('[space-sync] refreshFromSpaceIfIdle failed:', err);
      return false;
    });
}

// ---------------------------------------------------------------------------
// RSVP inbox — pull and merge guest submissions
// ---------------------------------------------------------------------------

async function pullRsvpNodeContent(
  session: Session,
  spaceId: string,
  node: ObjectNode,
): Promise<RsvpSubmission | null> {
  try {
    const handle = await getNodeAccess(spaceId, node.id, { access: 'invite', enc: false }, session, null);
    const result = await handle.client.pull(objInvPull(spaceId, node.id)) as { data: unknown } | null;
    const data = result?.data as RsvpSubmission | null;
    if (!data?.guestId) return null;
    return data;
  } catch {
    return null;
  }
}

async function pullAndApplyRsvpNodes(
  session: Session,
  spaceId: string,
  rsvpNodes: ObjectNode[],
): Promise<void> {
  if (!rsvpNodes.length) return;
  const results = await Promise.all(rsvpNodes.map((n) => pullRsvpNodeContent(session, spaceId, n)));
  const submissions = results.filter((r): r is RsvpSubmission => r !== null);
  if (submissions.length) applyRsvpSubmissionsByGuestId(submissions);
}

/**
 * Pull only the rsvp nodes and merge guest submissions into the store.
 * Called on foreground to pick up new RSVP responses without a full re-hydrate.
 */
export async function refreshRsvpInbox(session: Session, spaceId: string): Promise<void> {
  // Mirror refreshFromSpaceIfIdle's guard: don't start applying RSVP submissions into the
  // guest store while a hydrate/push is already touching it (see _rsvpRefreshing above).
  if (_isHydrating || _pushTimer || _pushing) return;
  _rsvpRefreshing = true;
  try {
    const nodes = await readObjectTree(session, spaceId);
    const rsvpNodes = nodes.filter((n) => n.type === FIANCE_TYPES.rsvp);
    await pullAndApplyRsvpNodes(session, spaceId, rsvpNodes);
  } catch (err) {
    console.warn('[space-sync] refreshRsvpInbox failed:', err);
  } finally {
    _rsvpRefreshing = false;
  }
}
