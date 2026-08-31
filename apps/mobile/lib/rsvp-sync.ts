/**
 * RSVP sync — v3 starfish-spaces implementation.
 *
 * Each recipient gets a per-node `rsvp` ObjectNode (access:'invite', enc:false)
 * under the publicPage node. The owner mints a combined guest link that bundles:
 *  - page-read cap (publicPage node, read-only)
 *  - rsvp-write cap (rsvp node, write-capable)
 *
 * Guest submits via `writeNodeWithLinkCap`. Owner reads submissions via
 * `objInvPull` (space:member privilege) on boot and foreground.
 *
 * The recipient is the HOUSEHOLD when the guest has one, the guest otherwise —
 * one link, one page, one answer per envelope.
 */

import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import type { Guest } from "@/db/schema";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import {
  updateObjectIndex,
  getNodeAccess,
  objInvPush,
  objInvPull,
  createNodeInviteLink,
  rsvpToNode,
  buildHouseholdRsvpDoc,
  householdRsvpUpdates,
  rsvpMemberFromGuest,
  resolveHousehold,
  householdName,
  type HouseholdRsvpDoc,
  type Session,
  type ObjectNode,
} from "@fiance/sdk";
import { publicPageNodeId, getPublicPageInviteLink, ensurePublicPageNode } from "@/lib/public-page";
import { withIndexLock } from "@/lib/index-lock";
import { encodeGuestLink } from "@/lib/guest-link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type { HouseholdRsvpDoc, RsvpMember, HouseholdRsvpSubmission } from "@fiance/sdk";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the combined guest invite link URL for a guest.
 * Bundles page-read cap + rsvp-write cap into one URL.
 * Returns null until the link is minted (requires active sync session).
 */
export function useGuestRsvpUrl(
  guestId: string | undefined,
  activeEntry: WeddingRegistryEntry | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!guestId || !activeEntry?.seedPhrase) return;
    let cancelled = false;

    import("@/lib/starfish").then(({ getActiveSession, getActiveSpaceId, getActiveWeddingNodeId }) => {
      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();

      if (!session || !spaceId || !weddingNodeId) return;

      const { guests, households } = useGuestsStore.getState();
      // Invitation labels are seeded with the members: the public form cannot
      // resolve an invitation-type id (see RsvpMember.invitationLabel).
      const invitationLabels = Object.fromEntries(
        useInvitationTypesStore.getState().invitationTypes.map((it) => [it.id, it.label]),
      );
      const { household, members } = resolveHousehold(households, guests, guestId);
      if (members.length === 0) return;
      const recipientId = household?.id ?? guestId;
      const label = householdName(household, members);

      (async () => {
        try {
          const link = await getHouseholdInviteLink(
            session, spaceId, weddingNodeId, recipientId, label,
            household?.id ?? null, members, invitationLabels,
          );
          if (!cancelled) setUrl(link);
        } catch {
          // Session not ready — link minting deferred
        }
      })();
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [guestId, activeEntry?.seedPhrase]);

  return url;
}

// ---------------------------------------------------------------------------
// RSVP ObjectNode management (owner-side)
// ---------------------------------------------------------------------------

/** Derive the `rsvp` ObjectNode ID from the RECIPIENT id — household or guest. */
export function rsvpNodeId(recipientId: string): string {
  return `rsvp-${recipientId}`;
}

/**
 * Ensure the RSVP ObjectNode for a recipient exists in the space index.
 * Idempotent. Returns the rsvp nodeId.
 */
export async function ensureRsvpNode(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
  recipientId: string,
): Promise<string> {
  const nodeId = rsvpNodeId(recipientId);
  const pageNodeId = publicPageNodeId(weddingNodeId);
  const desc = rsvpToNode(nodeId, pageNodeId, recipientId);

  await withIndexLock(spaceId, () => updateObjectIndex(session, spaceId, (nodes, now) => {
    const exists = nodes.some((n) => n.id === nodeId);
    if (exists) return null;
    const node: ObjectNode = {
      id: desc.id,
      type: desc.type,
      parentId: desc.parentId,
      order: nodes.length,
      title: desc.title,
      updatedAt: now,
      contentKind: desc.contentKind,
      access: desc.access,
      enc: desc.enc,
      meta: desc.meta,
    };
    return [...nodes, node];
  }));

  return nodeId;
}

/**
 * Seed the household document with its members, so the family recognises itself
 * when it opens the link.
 *
 * NOT a seed-if-absent: a household's composition keeps moving, and a document
 * frozen at first seed would show the family a stale roster with no signal. The
 * roster comes from the guest records; each member's already-given answer is
 * carried over from the existing document and never overwritten.
 */
export async function seedRsvpNodeContent(
  session: Session,
  spaceId: string,
  nodeId: string,
  householdId: string | null,
  members: Guest[],
  invitationLabels: Record<string, string>,
): Promise<void> {
  const handle = await getNodeAccess(
    spaceId,
    nodeId,
    { access: "invite", enc: false },
    session,
    null,
  );
  const existing = await handle.client
    .pull(objInvPull(spaceId, nodeId))
    .catch(() => null) as { hash?: string; data?: HouseholdRsvpDoc } | null;

  const alreadyAnswered = new Map(
    (existing?.data?.members ?? []).map((m) => [m.guestId, m]),
  );
  const doc: HouseholdRsvpDoc = {
    ...buildHouseholdRsvpDoc(householdId, members, invitationLabels),
    members: members.map((g) => {
      const fresh = rsvpMemberFromGuest(g, invitationLabels);
      const previous = alreadyAnswered.get(g.id);
      if (!previous?.respondedAt) return fresh;
      return {
        ...fresh,
        rsvpStatus: previous.rsvpStatus,
        diet: previous.diet,
        dietNotes: previous.dietNotes,
        respondedAt: previous.respondedAt,
      };
    }),
    submittedAt: existing?.data?.submittedAt ?? null,
  };

  await handle.client.push(
    objInvPush(spaceId, nodeId),
    doc as unknown as Record<string, unknown>,
    existing?.hash ?? "",  // "" not null: creates when absent; heals a degraded stored hash
  );
}

/**
 * Mint a combined page-read + rsvp-write link for a recipient.
 * Ensures the publicPage node and rsvp node both exist, seeds the rsvp node
 * with the household document, and returns a single URL with both caps bundled.
 */
export async function getHouseholdInviteLink(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
  recipientId: string,
  recipientName: string,
  householdId: string | null,
  members: Guest[],
  invitationLabels: Record<string, string>,
): Promise<string> {
  const origin = getAppOrigin();

  // Ensure both nodes exist.
  const pageNodeId = await ensurePublicPageNode(session, spaceId, weddingNodeId);
  const nodeId = await ensureRsvpNode(session, spaceId, weddingNodeId, recipientId);

  await seedRsvpNodeContent(session, spaceId, nodeId, householdId, members, invitationLabels);

  // Mint page-read token (read-only).
  const { token: pageToken } = await createNodeInviteLink(
    session,
    spaceId,
    pageNodeId,
    "Page mariage",
    { enc: false },
    false, // read-only
    origin,
  );

  // Mint rsvp-write token (write-capable).
  const { token: rsvpToken } = await createNodeInviteLink(
    session,
    spaceId,
    nodeId,
    recipientName,
    { enc: false },
    true, // write-capable
    origin,
  );

  return encodeGuestLink(origin, pageToken, rsvpToken);
}

// ---------------------------------------------------------------------------
// Owner inbox — apply household RSVP documents
// ---------------------------------------------------------------------------

/**
 * Apply household RSVP documents to the guests store — one update per member who
 * answered. Returns the count of applied updates.
 *
 * Idempotent w.r.t. local edits: a submission is only applied when it is strictly newer
 * than the guest's current `rsvpDate`. Without this guard, this function re-runs on every
 * hydrate and every app foreground (see space-sync.ts's pullAndApplyRsvpNodes / providers.tsx's
 * refreshRsvpInbox) and would unconditionally overwrite a manual edit made on another device
 * with the (now stale) public-page submission — then re-push the reverted value via
 * updateGuest's notifySync(), clobbering the edit on the server too.
 */
export function applyHouseholdRsvpDocs(docs: HouseholdRsvpDoc[]): number {
  const { guests } = useGuestsStore.getState();
  const updateGuest = useGuestsStore.getState().updateGuest;
  let applied = 0;

  for (const doc of docs) {
    for (const { guestId, updates, respondedAt } of householdRsvpUpdates(doc)) {
      const guest = guests.find((g) => g.id === guestId);
      if (!guest) continue;
      // Skip a submission that isn't newer than what's already stored — protects a manual
      // edit (which stamps a fresh rsvpDate) from being reverted by a stale re-apply.
      if (guest.rsvpDate && respondedAt <= guest.rsvpDate) continue;
      updateGuest(guestId, updates as Record<string, unknown>);
      applied++;
    }
  }

  return applied;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "exp://";
}

// ---------------------------------------------------------------------------
// Re-export for the public-page share link (page-only, no guest)
// ---------------------------------------------------------------------------

export { getPublicPageInviteLink } from "@/lib/public-page";
