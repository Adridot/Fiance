import { CompteError } from "@/lib/compte";
import type { WeddingRegistry } from "@/lib/wedding-registry";

export type EtapeDuParcours = "deja-acceptee" | "confirmer" | "creer-un-compte";

export function etapeDuParcours(
  registre: Pick<WeddingRegistry, "weddings"> | null | undefined,
  spaceId: string,
): EtapeDuParcours {
  const mariages = registre?.weddings ?? [];
  if (mariages.some((w) => w.spaceId === spaceId)) return "deja-acceptee";
  return mariages.length > 0 ? "confirmer" : "creer-un-compte";
}

export interface ActionsDeLaSequence {
  joindre: () => Promise<void>;
  creerLeCompte: (identifiant: string, mdp: string) => Promise<void>;
  ouvrirUneSession: (identifiant: string, mdp: string) => Promise<void>;
  /** Sans `code` (lien long), ne fait rien. */
  consommer: () => Promise<void>;
}

/** Appareil déjà connecté : jonction, puis dépôt consommé au mieux. */
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
