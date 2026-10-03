/**
 * Renouvellement automatique des accès de membre : ce que chaque appareil en fait.
 *
 * Le propriétaire, à l'activation, réémet un cap long pour chaque sujet de lien
 * encore membre de l'espace et encore affecté à un rôle, puis le dépose ; le
 * membre, à l'activation, adopte le cap déposé pour son sujet quand le sien
 * expire — et, faute de dépôt, demande à être renouvelé. Le serveur n'en sait
 * rien et continue d'exiger un cap non expiré.
 */

import {
  clearNodeAccessCache,
  getSpaceAccessEntry,
  hydrateSpaceAccessStore,
  joinSpaceByLink,
  mintCap,
  readSpaceAccess,
  saveSpaceInviteEntry,
  serializeSpaceInviteStore,
  type Session,
  type SpaceInviteLinkToken,
} from "@fiance/sdk";

import { planifierLeCoffre } from "@/lib/compte-session";
import { deposerEnCAS, recuperer } from "@/lib/invitation-courte";
import { hydraterLeMagasinDInvitations, persisterLeMagasinDInvitations } from "@/lib/invite-link";
import { readCollection, writeCollection } from "@/lib/kv-storage";
import {
  CHERCHER_AVANT_SEC,
  DUREE_D_UN_ACCES_SEC,
  capDeRenouvellementValide,
  capPermetLEcriture,
  chiffrerLaDemande,
  chiffrerLeRenouvellement,
  dechiffrerLaDemande,
  dechiffrerLeRenouvellement,
  demandeARedeposer,
  deriverLaDemande,
  deriverLeDepot,
  expireBientot,
  planDeReemission,
  sujetDeLaDemande,
  sujetDuCap,
  sujetsADemander,
  sujetsDuMagasin,
  type ReemissionConnue,
  type SujetDeLien,
} from "@/lib/renouvellement-des-acces";
import { usePermissionsStore } from "@/store/usePermissionsStore";

/** Les caps réémis par cet appareil, par sujet : on ne remint pas à chaque démarrage. */
export const REEMISSIONS_KEY = "reemissionsDAcces";
/** Côté membre : la date du dernier dépôt de demande, par `spaceId:subUserId`. */
export const DEMANDES_KEY = "demandesDeRenouvellement";

/** Adopte l'accès d'un jeton pour un espace que cette identité connaît déjà. */
export async function adopterLeJeton(session: Session, token: SpaceInviteLinkToken): Promise<void> {
  // Même épinglage que la jonction : l'entrée s'enregistre sous CETTE identité.
  await hydrateSpaceAccessStore(session.userId, {}, {});
  await joinSpaceByLink(session, token);
  // Poignées et chiffreurs en cache portent encore l'ancien cap.
  clearNodeAccessCache();
}

function reemissionsConnues(): Record<string, ReemissionConnue> {
  try {
    return readCollection<Record<string, ReemissionConnue>>(REEMISSIONS_KEY) ?? {};
  } catch {
    return {};
  }
}

function noterLaReemission(subUserId: string, connue: ReemissionConnue): void {
  try {
    writeCollection(REEMISSIONS_KEY, { ...reemissionsConnues(), [subUserId]: connue });
  } catch { /* KV fermé : on réémettra au prochain démarrage */ }
}

/**
 * Propriétaire : réémet et dépose les accès qui en ont besoin.
 *
 * Ne lève jamais, et ne retient rien : appelée sans attente après la lecture de démarrage.
 * Rend le nombre de dépôts faits.
 */
export async function reemettreLesAcces(
  session: Session,
  spaceId: string,
  syncBase: string,
  maintenantMs: number = Date.now(),
): Promise<number> {
  try {
    hydraterLeMagasinDInvitations();
    const sujets = sujetsDuMagasin(serializeSpaceInviteStore(), spaceId);
    const { members } = await readSpaceAccess(session.accountClient, spaceId, session);
    const { roles, assignments } = usePermissionsStore.getState();
    sujets.push(
      ...(await sujetsQuiSeFontConnaitre(session, spaceId, syncBase, {
        membres: members,
        affectations: assignments,
        roles,
        connus: sujets.map((s) => s.subUserId),
      })),
    );
    const plan = planDeReemission({
      sujets,
      membres: members,
      affectations: assignments,
      roles,
      connues: reemissionsConnues(),
      maintenantMs,
    });
    let deposes = 0;
    for (const { sujet, peutEcrire, reemettre } of plan) {
      try {
        let connue = reemissionsConnues()[sujet.subUserId];
        if (reemettre || !connue) {
          const cap = await mintCap(
            session,
            { edPubHex: sujet.edPub, kemPubHex: sujet.kemPub, userIdHex: sujet.subUserId },
            "content",
            session.layout.spaceMemberScope(spaceId, peutEcrire),
            { ttlSec: DUREE_D_UN_ACCES_SEC },
          );
          connue = { cap, exp: (cap as { exp: number }).exp, deposeLe: 0 };
          noterLaReemission(sujet.subUserId, connue);
        }
        const { code, cle } = await deriverLeDepot(spaceId, sujet.subUserId);
        await deposerEnCAS(syncBase, code, await chiffrerLeRenouvellement(connue.cap, cle));
        noterLaReemission(sujet.subUserId, { ...connue, deposeLe: maintenantMs });
        deposes += 1;
      } catch (err) {
        console.warn(`[renouvellement] accès de ${sujet.subUserId.slice(0, 8)} non redéposé`, err);
      }
    }
    return deposes;
  } catch (err) {
    console.warn("[renouvellement] réémission des accès impossible", err);
    return 0;
  }
}

/** Propriétaire : les sujets inconnus du magasin local qui ont déposé une demande valide, enregistrés au passage. */
async function sujetsQuiSeFontConnaitre(
  session: Session,
  spaceId: string,
  syncBase: string,
  args: Parameters<typeof sujetsADemander>[0],
): Promise<SujetDeLien[]> {
  const lus = await Promise.all(
    sujetsADemander(args).map(async (subUserId) => {
      try {
        const { code, cle } = await deriverLaDemande(spaceId, subUserId);
        const cap = await dechiffrerLaDemande(await recuperer(syncBase, code), cle);
        // Ne fait réémettre que pour une clé déjà certifiée par le propriétaire, pour ce sujet encore membre et affecté : rejouée par un tiers, elle ne lui vaut qu'un cap inutilisable sans la clé privée du sujet.
        const sujet = cap ? sujetDeLaDemande(cap, { spaceId, subUserId, issEdPub: session.keys.edPub }) : null;
        if (sujet) {
          const { nonce, exp } = cap as { nonce: string; exp: number };
          saveSpaceInviteEntry(spaceId, subUserId, { edPub: sujet.edPub, kemPub: sujet.kemPub, cap: { nonce, exp } });
        }
        return sujet;
      } catch {
        return null;
      }
    }),
  );
  const connus = lus.filter((s): s is SujetDeLien => s !== null);
  if (connus.length) {
    persisterLeMagasinDInvitations();
    planifierLeCoffre();
  }
  return connus;
}

/** Membre : dépose sa demande de renouvellement, au plus une fois tous les trois jours. Ne lève jamais. */
async function demanderUnRenouvellement(
  spaceId: string,
  subUserId: string,
  cap: unknown,
  syncBase: string,
  maintenantMs: number,
): Promise<void> {
  try {
    const deposees = readCollection<Record<string, number>>(DEMANDES_KEY) ?? {};
    const cle = `${spaceId}:${subUserId}`;
    if (!demandeARedeposer(deposees[cle], maintenantMs)) return;
    const depot = await deriverLaDemande(spaceId, subUserId);
    await deposerEnCAS(syncBase, depot.code, await chiffrerLaDemande(cap, depot.cle));
    writeCollection(DEMANDES_KEY, { ...deposees, [cle]: maintenantMs });
  } catch (err) {
    console.warn("[renouvellement] demande non déposée", err);
  }
}

/**
 * Membre : adopte le cap réémis pour son sujet quand le sien expire bientôt.
 *
 * Tout échec — dépôt absent, illisible, cap invalide — est silencieux et laisse
 * l'accès tel quel ; le membre dépose alors une demande. Rend vrai si un nouvel
 * accès a été adopté.
 */
export async function adopterUnAccesReemis(
  session: Session,
  spaceId: string,
  syncBase: string,
  nomDuMariage: string,
  maintenantMs: number = Date.now(),
): Promise<boolean> {
  const entree = getSpaceAccessEntry(spaceId);
  if (entree?.kind !== "link") return false;
  const maintenantSec = Math.floor(maintenantMs / 1000);
  if (!expireBientot(entree.cap, maintenantSec, CHERCHER_AVANT_SEC)) return false;
  const sujet = sujetDuCap(entree.cap);
  if (!sujet) return false;
  try {
    const { code, cle } = await deriverLeDepot(spaceId, sujet);
    const cap = await dechiffrerLeRenouvellement(await recuperer(syncBase, code), cle);
    if (cap && capDeRenouvellementValide(entree.cap, cap, spaceId, maintenantSec)) {
      await adopterLeJeton(session, {
        v: 1,
        spaceId,
        spaceName: nomDuMariage,
        cap,
        key: entree.key,
        kemPriv: entree.kemPriv,
        kemPub: entree.kemPub,
        write: capPermetLEcriture(cap),
      });
      return true;
    }
  } catch { /* dépôt absent ou illisible : on se fait connaître */ }
  await demanderUnRenouvellement(spaceId, sujet, entree.cap, syncBase, maintenantMs);
  return false;
}
