/**
 * Révocation d'un collaborateur (côté propriétaire).
 *
 * MODIFICATION LOCALE — l'en-tête d'amont affirmait que le retrait du registre
 * coupe l'accès serveur, « every object collection requires the roster
 * `space:member` role ». C'est FAUX sur ce déploiement : `spaceDoc` de
 * `fiance-sync/src/collections.mjs` déclare
 * `readRoles: ["space:member", "cap:read:objdoc"]`, donc un porteur de cap lit
 * sans figurer dans `_access` — c'est exactement ainsi que le robot `fiance-db`
 * travaille. Et `createInMemoryRevocationStore` perd sa liste à chaque
 * redémarrage du conteneur, tandis que `submitRevocation` n'écrit que dans le
 * registre local.
 *
 * La rotation du keyring est donc le SEUL levier réel — et une rotation qui ne
 * rescelle rien ne révoque rien : le lien évincé continue d'ouvrir tout le
 * contenu déjà écrit. D'où l'ordre ci-dessous, dont l'étape 4 est nouvelle :
 *
 *   1. retirer l'assignation + pousser  ← le révoqué, encore dans l'époque
 *                                         courante, déchiffre son propre retrait
 *   2. faire tourner le keyring         ← il perd l'époque suivante
 *   3. resceller tout le contenu        ← il perd le contenu déjà écrit
 *   4. rendre la main
 *
 * Le rescellement ferme l'accès FUTUR ; il ne reprend rien de ce qui a déjà été
 * lu et gardé. La `RevocationList` reste persistée pour un futur point de
 * terminaison serveur, mais rien ne s'appuie plus dessus.
 */

import {
  revokeSpaceAccess,
  removeSpaceMember,
  hydrateSpaceInviteStore,
} from "@fiance/sdk";
import { getActiveSession, getActiveSpaceId } from "@/lib/starfish";
import { pushSpaceSnapshot } from "@/lib/space-sync";
import { readCollection } from "@/lib/kv-storage";
import { SPACE_INVITE_STORE_KEY } from "@/lib/invite-link";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
// MODIFICATION LOCALE — l'étape 3 : une rotation qui ne rescelle rien ne révoque rien.
import {
  rescellerEspace,
  rescellementComplet,
  type AvancementDuRescellement,
} from "@/lib/rescellement";

export interface RevokeResult {
  /**
   * True quand l'éviction est ACCOMPLIE : keyring tourné ET contenu rescellé.
   * Une rotation seule ne suffit pas — le révoqué relirait tout l'existant.
   */
  evicted: boolean;
  /**
   * Les collections qui n'ont pas pu être rescellées. Non vide = révocation
   * INCOMPLÈTE : l'espace est en époques mêlées, sûr pour ceux qui étaient déjà
   * là, et réparable par `fiance-db reseal`. `evicted` est alors `false`.
   */
  aResceller?: string[];
}

export interface RevokeOptions {
  /** Appelé pendant le rescellement, pour montrer la progression. */
  onAvancement?: (avancement: AvancementDuRescellement) => void;
}

export async function revokeCollaborator(
  subjectUserId: string,
  assignmentId: string,
  options: RevokeOptions = {},
): Promise<RevokeResult> {
  const permStore = usePermissionsStore.getState();
  const regStore = useWeddingRegistryStore.getState();
  const registry = regStore.registry;
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? null;

  // 1. Drop the assignment + push FIRST, so the member (still in the old keyring epoch) can
  //    decrypt the deletion and clear its cached matrix before we rotate them out.
  permStore.removeAssignment(assignmentId);

  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  if (session && spaceId && active) {
    try {
      await pushSpaceSnapshot(session, spaceId, active.weddingNodeId ?? active.id);
    } catch (err) {
      console.warn("[revoke] pre-rotation snapshot push failed", err);
    }
  }

  if (!session || !spaceId || !active) return { evicted: false };

  // 2. Hydrate the invite store (entries minted in prior sessions) so getSpaceInviteEntry resolves.
  try {
    const raw = readCollection<string>(SPACE_INVITE_STORE_KEY);
    if (raw) hydrateSpaceInviteStore(raw);
  } catch (err) {
    console.warn("[revoke] failed to hydrate invite store", err);
  }

  const generation = (active.revocationGeneration ?? 0) + 1;
  const priorRevoked = (active.revokedEntries ?? []) as unknown[];

  try {
    await revokeSpaceAccess(session, spaceId, subjectUserId, {
      generation,
      priorRevoked: priorRevoked as never,
      submitRevocation: async (list: unknown) => {
        const revoked =
          (list as { revoked?: unknown[]; entries?: unknown[] }).revoked ??
          (list as { revoked?: unknown[]; entries?: unknown[] }).entries ??
          priorRevoked;
        await regStore.updateWedding(active.id, {
          revocationGeneration: generation,
          revokedEntries: revoked,
        });
      },
    });
  } catch (err) {
    // Aucune entrée d'invitation en magasin (lien minté sur un autre appareil).
    // Le retrait du registre est alors tout ce qui reste — et il ne coupe PAS
    // l'accès serveur ici (voir l'en-tête). L'éviction n'est donc pas accomplie.
    console.warn("[revoke] revokeSpaceAccess failed; falling back to removeSpaceMember", err);
    try {
      await removeSpaceMember(session.accountClient, spaceId, subjectUserId, session);
    } catch (e) {
      console.warn("[revoke] removeSpaceMember fallback also failed", e);
    }
    return { evicted: false };
  }

  // 3. RESCELLER — sans quoi les deux étapes précédentes ne retirent rien du
  //    contenu déjà écrit, que le lien évincé continue de déchiffrer.
  const rescellement = await rescellerEspace(session, spaceId, { onAvancement: options.onAvancement });
  if (!rescellementComplet(rescellement)) {
    console.warn("[revoke] rescellement incomplet, reste :", rescellement.restant);
    return {
      evicted: false,
      aResceller: rescellement.restant.length ? rescellement.restant : ["*"],
    };
  }

  return { evicted: true, aResceller: [] };
}
