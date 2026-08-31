import * as Linking from "expo-linking";
import * as Crypto from "expo-crypto";
import { createSpaceInviteLink, getSyncNamespace, roleCanWrite, serializeSpaceInviteStore, isWithinFreeLimit } from "@fiance/sdk";
import { normalizeSyncBase, resolveServerUrl, resolveSessionConfig } from "@/lib/server";
// MODIFICATION LOCALE — le lien passe de ~1342 à ~81 caractères : jeton chiffré
// déposé derrière un code court, clé dans le fragment. Voir `invitation-courte.ts`.
import {
  chiffrerLeJeton,
  construireLeLienCourt,
  deposer,
  retirer,
  tirerUnCode,
} from "@/lib/invitation-courte";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import { pushSpaceSnapshot } from "@/lib/space-sync";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { readCollection, writeCollection } from "@/lib/kv-storage";
import { isPremium } from "@/lib/premium";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/** KV key holding the serialized space-invite store (edPub/kemPub/cap handles per invite),
 *  persisted so `revokeSpaceAccess` can look up the entry after an app restart. */
export const SPACE_INVITE_STORE_KEY = "spaceInviteStore";

/**
 * Generate a space invite link for the given wedding entry, scoped to a role.
 *
 * The role's `canWrite` drives the invite cap's write flag (Phase 2 — a read-only
 * role mints a read-only member cap). The role assignment is recorded against the
 * invite's ephemeral subject id and pushed so the joining member can resolve its
 * per-feature permissions (Phase 1). Throws a human-readable message on failure.
 */
export async function createInviteLink(entry: WeddingRegistryEntry, roleId?: string, name?: string): Promise<string> {
  // Defensive backstop — the primary gate is the paywall prompt in settings/index.tsx's
  // handleInvite. Free tier allows 1 invited member (the partner); the 2nd+ requires premium.
  if (!isWithinFreeLimit("members", usePermissionsStore.getState().assignments.length, isPremium())) {
    throw new Error("FREE_MEMBER_LIMIT");
  }

  const cfg = await resolveSessionConfig(entry);
  if (!cfg) throw new Error("INVITE_NO_SESSION");
  const spaceId = await ensureSpaceProvisioned(cfg.session, entry);

  // Record the assignment BEFORE snapshotting so it's part of the pushed content
  // the member will hydrate. Keyed by the invite's ephemeral subject id (below).
  const role = roleId ? usePermissionsStore.getState().roles.find((r) => r.id === roleId) : undefined;
  const canWrite = role ? roleCanWrite(role) : true;

  // ensureSpaceProvisioned only creates an empty index + keyring — otherwise content reaches the
  // space via the debounced push on a later mutation, or the nodeCount===0 one-shot in
  // providers.tsx (skipped once any node, e.g. a publicPage node, already exists in the index).
  // Publish now so an invite never points a member at a contentless space.
  const origin = Linking.createURL("").replace(/\/$/, "");
  // Name the invite after the collaborator when provided, so it's identifiable in the
  // invite store / roster; fall back to the wedding label.
  const collaboratorName = name?.trim() || undefined;
  const { token, link, inviteUserId } = await createSpaceInviteLink(cfg.session, spaceId, collaboratorName ?? entry.label, canWrite, origin);

  // Persist the (in-memory) invite store so this link's revocation handle survives an app
  // restart — revokeSpaceAccess needs getSpaceInviteEntry(spaceId, inviteUserId) to resolve.
  try { writeCollection(SPACE_INVITE_STORE_KEY, serializeSpaceInviteStore()); } catch (err) {
    console.warn("[invite] failed to persist space-invite store", err);
  }

  if (role) {
    const subjectUserId = inviteUserId ?? (token.cap as { subUserId?: string }).subUserId;
    if (subjectUserId) {
      const now = new Date().toISOString();
      usePermissionsStore.getState().upsertAssignment({
        id: Crypto.randomUUID(),
        subjectUserId,
        roleId: role.id,
        label: collaboratorName ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Publish the snapshot (incl. the new assignment) so the invite never points a
  // member at a contentless space and their role resolves on first hydrate.
  await pushSpaceSnapshot(cfg.session, spaceId, entry.weddingNodeId ?? entry.id);

  // Diagnostics for the "member joins but sees no data" (objdoc 403) bug: a link invitee
  // only earns space:member if its ephemeral subUserId is in the server _access roster.
  // Re-read the roster from the owner's device to confirm addSpaceMember's write landed
  // (addSpaceMember is a silent no-op when the id is already present — so check, don't assume).
  try {
    const memberUserId = (token.cap as { subUserId?: string }).subUserId;
    const access = await cfg.session.accountClient
      .pull(cfg.session.layout.spaceAccessPull(spaceId))
      .catch(() => null);
    const members: string[] = Array.isArray((access?.data as any)?.members)
      ? (access!.data as any).members
      : [];
    console.log("[invite] link created", {
      namespace: getSyncNamespace(),
      spaceId,
      owner: cfg.session.userId,
      memberUserId,
      rosterMembers: members,
      memberInRoster: memberUserId ? members.includes(memberUserId) : false,
    });
  } catch (err) {
    console.warn("[invite] roster diagnostics failed", err);
  }

  // MODIFICATION LOCALE — la forme courte. Le format long est conservé en repli :
  // un dépôt injoignable ne doit pas empêcher d'inviter quelqu'un.
  const fragment = link.includes("#") ? link.slice(link.indexOf("#") + 1) : link;
  try {
    const { depot, cle } = await chiffrerLeJeton(fragment);
    const code = tirerUnCode();
    await deposer(normalizeSyncBase(cfg.serverUrl), code, depot);
    const court = construireLeLienCourt(origin, code, cle);
    enregistrerLeCodeDuLien(entry.id, code);
    return court;
  } catch (err) {
    console.warn("[invite] dépôt du lien court impossible, repli sur le format long", err);
    return link;
  }
}

/** Les codes de dépôt émis pour ce mariage, pour pouvoir les retirer plus tard. */
export const INVITE_CODES_KEY = "inviteDepotCodes";

function enregistrerLeCodeDuLien(weddingId: string, code: string): void {
  try {
    const connus = (readCollection<Record<string, string[]>>(INVITE_CODES_KEY) ?? {}) as Record<string, string[]>;
    writeCollection(INVITE_CODES_KEY, { ...connus, [weddingId]: [...(connus[weddingId] ?? []), code] });
  } catch (err) {
    console.warn("[invite] code de dépôt non mémorisé", err);
  }
}

/** Les codes de dépôt encore mémorisés pour ce mariage, du plus ancien au plus récent. */
export function codesDeDepot(weddingId: string): string[] {
  try {
    return (readCollection<Record<string, string[]>>(INVITE_CODES_KEY) ?? {})[weddingId] ?? [];
  } catch {
    return [];
  }
}

/**
 * Retire un dépôt avant son terme.
 *
 * Le dépôt vidé se lit ensuite comme un dépôt absent, et l'écran de jonction
 * présente le message d'EXPIRATION — distinct de celui d'une invitation invalide.
 */
export async function retirerLeDepot(entry: WeddingRegistryEntry, code: string): Promise<void> {
  const serverUrl = resolveServerUrl(entry);
  if (!serverUrl) throw new Error("INVITE_NO_SESSION");
  await retirer(normalizeSyncBase(serverUrl), code);
  try {
    const connus = (readCollection<Record<string, string[]>>(INVITE_CODES_KEY) ?? {}) as Record<string, string[]>;
    writeCollection(INVITE_CODES_KEY, {
      ...connus,
      [entry.id]: (connus[entry.id] ?? []).filter((c) => c !== code),
    });
  } catch { /* la mémoire des codes est un confort, pas une garantie */ }
}
