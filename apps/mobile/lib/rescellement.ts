/**
 * Resceller le contenu d'un espace sous l'époque courante du keyring.
 *
 * Une rotation de clé ne touche à aucun document : tout ce qui a été scellé
 * avant elle reste illisible pour qui a rejoint le keyring après. Resceller est
 * donc ce qui donne son sens à une rotation — sans quoi une révocation ne
 * révoque rien, et un invité n'obtient qu'un mariage vide.
 *
 * L'opération se fait au niveau DOCUMENT, jamais entité par entité : `deepMerge`
 * restitue une clé absente du gagnant depuis le perdant, et un aller-retour par
 * entités réinjecterait des champs supprimés en recalculant des `rev`. Le
 * mutateur rend `cur` tel quel — le contenu déchiffré repart octet pour octet.
 */

import {
  getNodeAccess,
  objDocPull,
  objDocPush,
  readObjectTree,
  type ObjectNode,
  type Session,
} from "@fiance/sdk";

import { epoqueCourante, epoqueDeLEnveloppe } from "@/lib/acces-chiffre";
import { neutraliserCachesDePoussée } from "@/lib/space-sync";

export interface AvancementDuRescellement {
  /** Le type d'entité en cours, pour l'afficher. */
  collection: string;
  /** Combien ont été traitées, sur combien à resceller. */
  fait: number;
  total: number;
}

export interface ResultatDuRescellement {
  /** L'époque sous laquelle tout devrait être scellé. `null` = keyring illisible. */
  epoque: number | null;
  /** Les collections effectivement rescellées. */
  rescellees: string[];
  /** Celles déjà à jour, qu'on a sautées sans rien écrire. */
  dejaAJour: string[];
  /**
   * Ce qui reste à resceller. Non vide = l'espace est en époques mêlées : sûr
   * pour qui était déjà là, réparable par `fiance-db reseal`, et jamais à
   * rapporter comme une révocation réussie.
   */
  restant: string[];
}

/** Vrai quand tout ce qui devait être rescellé l'a été. */
export function rescellementComplet(resultat: ResultatDuRescellement): boolean {
  return resultat.epoque !== null && resultat.restant.length === 0;
}

interface OptionsDeRescellement {
  onAvancement?: (avancement: AvancementDuRescellement) => void;
}

/** L'époque courante du keyring de l'espace, lue en clair. */
async function lireEpoqueCourante(
  session: Session,
  spaceId: string,
  noeud: ObjectNode,
): Promise<number | null> {
  try {
    const handle = await getNodeAccess(spaceId, noeud.id, noeud, session, null);
    const res = (await handle.client.pull(
      (session as unknown as { layout: { keyringPull: (id: string) => string } }).layout.keyringPull(spaceId),
    )) as { data?: unknown } | null;
    return epoqueCourante(res?.data);
  } catch {
    return null;
  }
}

/**
 * Rescelle tout le contenu chiffré de l'espace sous l'époque courante.
 *
 * Ce qui est déjà à l'époque courante est sauté sans aucune écriture :
 * l'opération est rejouable, et la relancer sur un espace à jour est sans effet.
 */
export async function rescellerEspace(
  session: Session,
  spaceId: string,
  options: OptionsDeRescellement = {},
): Promise<ResultatDuRescellement> {
  const resultat: ResultatDuRescellement = { epoque: null, rescellees: [], dejaAJour: [], restant: [] };

  const arbre = (await readObjectTree(session, spaceId)) as ObjectNode[];
  const chiffres = arbre.filter((n) => n.enc !== false);
  if (!chiffres.length) return resultat;

  const epoque = await lireEpoqueCourante(session, spaceId, chiffres[0]);
  resultat.epoque = epoque;
  if (epoque === null) {
    resultat.restant = chiffres.map((n) => n.type);
    return resultat;
  }

  // Relevé d'abord, écritures ensuite : on ne pousse rien tant qu'on ne sait pas
  // ce qu'il y a à pousser, et l'avancement affiché porte sur un total connu.
  const enRetard: ObjectNode[] = [];
  for (const noeud of chiffres) {
    try {
      const handle = await getNodeAccess(spaceId, noeud.id, noeud, session, null);
      const res = (await handle.client.pull(objDocPull(spaceId, noeud.id))) as
        | { hash?: string; data?: Record<string, unknown> | null }
        | null;
      // Un document absent se lit `{hash:"",data:{}}`, jamais un 404.
      const vide = !res?.hash || !res.data || Object.keys(res.data).length === 0;
      if (vide) continue;
      if (epoqueDeLEnveloppe(res.data) === epoque) { resultat.dejaAJour.push(noeud.type); continue; }
      enRetard.push(noeud);
    } catch {
      resultat.restant.push(noeud.type);
    }
  }

  if (!enRetard.length) return resultat;

  // Sans ce vidage, `handle.push` prend son chemin cache-chaud, appelle le
  // mutateur avec `cur = null`, qui rend `null` — et le rescellement devient un
  // non-événement silencieux.
  neutraliserCachesDePoussée(spaceId, enRetard.map((n) => n.id));

  let fait = 0;
  for (const noeud of enRetard) {
    options.onAvancement?.({ collection: noeud.type, fait, total: enRetard.length });
    try {
      const handle = await getNodeAccess(spaceId, noeud.id, noeud, session, null);
      let ecrit = false;
      await handle.push(
        objDocPull(spaceId, noeud.id),
        objDocPush(spaceId, noeud.id),
        // Le contenu repart tel quel ; seule l'enveloppe change d'époque. En cas
        // de conflit, `runCas` relit avant de rappeler ce mutateur — sans quoi
        // on réémettrait une version périmée sous une époque neuve.
        (cur) => { ecrit = cur !== null; return cur; },
      );
      if (ecrit) resultat.rescellees.push(noeud.type);
      else resultat.dejaAJour.push(noeud.type);
    } catch (err) {
      console.warn(`[rescellement] ${noeud.type} :`, err instanceof Error ? err.message : String(err));
      resultat.restant.push(noeud.type);
    }
    fait += 1;
    options.onAvancement?.({ collection: noeud.type, fait, total: enRetard.length });
  }

  return resultat;
}
