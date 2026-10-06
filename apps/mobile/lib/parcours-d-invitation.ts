import { CompteError } from "@/lib/compte";
import { nonceDuCap, sujetDuCap } from "@/lib/renouvellement-des-acces";
import type { WeddingRegistry, WeddingRegistryEntry } from "@/lib/wedding-registry";

export type EtapeDuParcours = "deja-acceptee" | "renouveler" | "confirmer" | "creer-un-compte";

/** L'accès que porte le jeton présenté, et celui que l'appareil détient pour cet espace. */
export interface AccesPresente {
  capDuJeton: unknown;
  /** Le cap de l'entrée d'accès enregistrée, quand le magasin d'accès est chargé. */
  capEnregistre?: unknown;
}

export function etapeDuParcours(
  registre: Pick<WeddingRegistry, "weddings"> | null | undefined,
  spaceId: string,
  acces?: AccesPresente,
): EtapeDuParcours {
  const mariages = registre?.weddings ?? [];
  const existant = mariages.find((w) => w.spaceId === spaceId);
  if (existant) return acces && accesARenouveler(existant, acces) ? "renouveler" : "deja-acceptee";
  return mariages.length > 0 ? "confirmer" : "creer-un-compte";
}

/**
 * MODIFICATION LOCALE — un lien NEUF pour un mariage déjà présent remplace l'accès.
 *
 * Sans quoi un appareil au cap expiré n'avait aucune voie de rattrapage. Membres
 * seulement : le propriétaire n'échange pas son accès contre un lien. Le nonce
 * départage ; à défaut d'accès chargé, le sujet du dernier lien adopté.
 */
export function accesARenouveler(
  entree: Pick<WeddingRegistryEntry, "role" | "inviteSubjectId">,
  acces: AccesPresente,
): boolean {
  if (entree.role !== "member") return false;
  const nouveau = nonceDuCap(acces.capDuJeton);
  if (!nouveau) return false;
  const actuel = nonceDuCap(acces.capEnregistre);
  if (actuel) return actuel !== nouveau;
  const sujet = sujetDuCap(acces.capDuJeton);
  if (entree.inviteSubjectId && sujet) return entree.inviteSubjectId !== sujet;
  return true;
}

export interface ActionsDeLaSequence {
  joindre: () => Promise<void>;
  creerLeCompte: (identifiant: string, mdp: string) => Promise<void>;
  ouvrirUneSession: (identifiant: string, mdp: string) => Promise<void>;
  /** Sans `code` (lien long), ne fait rien. */
  consommer: () => Promise<void>;
}

/** Appareil déjà connecté : jonction (ou renouvellement), puis dépôt consommé au mieux. */
export async function sequenceDeJonction(actions: Pick<ActionsDeLaSequence, "joindre" | "consommer">): Promise<void> {
  await actions.joindre();
  await actions.consommer().catch(() => {});
}

/**
 * Appareil vierge. Rejoindre d'abord (le coffre doit contenir le mariage), consommer en dernier
 * (un échec en route laisse le lien réutilisable). Seule la jonction peut faire échouer la séquence.
 */
export async function sequenceDeCreationDeCompte(
  actions: ActionsDeLaSequence,
  identifiant: string,
  mdp: string,
): Promise<"compte-cree" | "sans-compte"> {
  await actions.joindre();
  try {
    try {
      await actions.creerLeCompte(identifiant, mdp);
    } catch (err) {
      if (!(err instanceof CompteError && err.cas === "existe-deja")) throw err;
      await actions.ouvrirUneSession(identifiant, mdp);
    }
  } catch (err) {
    console.warn("[invitation] compte non créé après la jonction:", err);
    return "sans-compte";
  }
  await actions.consommer().catch(() => {});
  return "compte-cree";
}
