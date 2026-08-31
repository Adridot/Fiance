/**
 * Une personne, et les liens d'invitation qu'elle détient.
 *
 * Chaque lien est un SUJET DIFFÉRENT : `createSpaceInviteLink` tire une paire
 * de clés neuve et enregistre une affectation portant un identifiant frais.
 * Deux liens pour la même personne, c'est donc deux affectations — et c'est
 * délibéré. Réaffecter l'affectation existante au nouveau sujet casserait
 * l'accès de l'appareil déjà appairé : `resolvePermissionForSubject` cherche
 * l'affectation dont `subjectUserId` égale le sujet de l'appareil, et sans elle
 * l'appareil se verrouille sur une matrice vide.
 *
 * Le regroupement vit donc dans la VUE, jamais dans les données : c'est un
 * calcul sur les affectations, clé = libellé normalisé. Aucun champ neuf,
 * aucune migration, aucune poussée supplémentaire.
 */

/** Une affectation, réduite à ce dont le regroupement a besoin. */
export interface AffectationDeLien {
  id: string;
  subjectUserId: string;
  roleId: string;
  label?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Collaborateur {
  /** Clé de regroupement. Une affectation sans libellé garde la sienne, seule. */
  cle: string;
  /** Le libellé tel que le propriétaire l'a saisi, ou `null` s'il n'y en a pas. */
  nom: string | null;
  /** Le rôle du lien le plus récent — c'est celui que la fiche affiche. */
  roleId: string;
  /** Les liens de cette personne, du plus ancien au plus récent. */
  liens: AffectationDeLien[];
}

/** Le libellé, réduit à ce qui permet de reconnaître la même personne. */
export function normaliserLeLibelle(label: string | null | undefined): string {
  return (label ?? "").trim().toLocaleLowerCase("fr-FR").replace(/\s+/g, " ");
}

/** Ordre stable : à défaut de `createdAt`, l'ordre d'arrivée fait foi. */
function parDateDeCreation(a: AffectationDeLien, b: AffectationDeLien): number {
  return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
}

/**
 * Regroupe les affectations par personne.
 *
 * Deux limites assumées, et qu'il vaut mieux lire ici qu'apprendre à l'écran :
 *
 * – Une affectation SANS libellé reste seule sur sa ligne. Ces liens ont été
 *   émis avant que le nom soit obligatoire ; rien ne permet de savoir à qui ils
 *   appartiennent. Visible, pas silencieux.
 * – Deux personnes que le propriétaire aurait nommées pareil seraient fusionnées.
 *   Le libellé est sa propre note ; la fiche affichant la date de chaque lien,
 *   l'erreur se voit.
 */
export function regrouperLesCollaborateurs(
  affectations: readonly AffectationDeLien[],
): Collaborateur[] {
  const groupes = new Map<string, Collaborateur>();

  for (const a of affectations) {
    const normalise = normaliserLeLibelle(a.label);
    // Sans libellé : sa propre clé, donc son propre groupe d'un seul lien.
    const cle = normalise ? `nom:${normalise}` : `sans-libelle:${a.id}`;
    const existant = groupes.get(cle);
    if (existant) existant.liens.push(a);
    else groupes.set(cle, { cle, nom: a.label?.trim() || null, roleId: a.roleId, liens: [a] });
  }

  return [...groupes.values()].map((g) => {
    const liens = [...g.liens].sort(parDateDeCreation);
    const dernier = liens[liens.length - 1];
    // Le rôle et l'orthographe du nom viennent du lien le plus récent : c'est
    // la dernière intention du propriétaire.
    return { ...g, liens, roleId: dernier.roleId, nom: dernier.label?.trim() || g.nom };
  });
}

/**
 * Le nombre de PERSONNES, et non de liens.
 *
 * C'est ce que la limite de l'offre veut dire. La compter en affectations
 * interdirait à un propriétaire au palier gratuit de renvoyer un lien perdu —
 * l'exact contraire du besoin.
 */
export function nombreDeCollaborateursDistincts(
  affectations: readonly AffectationDeLien[],
): number {
  return regrouperLesCollaborateurs(affectations).length;
}

/** Vrai quand ce nom désigne une personne déjà collaboratrice : réémission, pas invitation. */
export function estUnCollaborateurConnu(
  affectations: readonly AffectationDeLien[],
  nom: string | null | undefined,
): boolean {
  const cherche = normaliserLeLibelle(nom);
  if (!cherche) return false;
  return affectations.some((a) => normaliserLeLibelle(a.label) === cherche);
}

// ---------------------------------------------------------------------------
// Réémission : ce que la feuille d'invitation doit faire à l'ouverture
// ---------------------------------------------------------------------------

/** L'état dans lequel la feuille d'invitation s'ouvre. */
export type EtatDOuverture = "generating" | "selecting";

export interface OuvertureDeLaFeuille {
  etat: EtatDOuverture;
  /** Le rôle retenu. `undefined` quand il reste à choisir. */
  roleId?: string;
  /** Le nom pré-rempli, s'il y en a un. */
  nom?: string;
}

/**
 * Décide si la feuille peut générer tout de suite.
 *
 * Elle ne le peut QUE si le nom et un rôle qui existe encore sont fournis. Un
 * rôle supprimé entre-temps n'a rien à pré-remplir : on retombe sur le
 * sélecteur plutôt que d'émettre un lien sans rôle résolu.
 */
export function ouvertureDeLaFeuille(
  initialName: string | null | undefined,
  initialRoleId: string | null | undefined,
  rolesExistants: readonly { id: string }[],
): OuvertureDeLaFeuille {
  const nom = (initialName ?? "").trim();
  const roleEncoreLa = !!initialRoleId && rolesExistants.some((r) => r.id === initialRoleId);
  if (nom && roleEncoreLa) return { etat: "generating", roleId: initialRoleId as string, nom };
  return { etat: "selecting", ...(nom ? { nom } : {}) };
}

// ---------------------------------------------------------------------------
// Le rôle appartient à la personne, pas au lien
// ---------------------------------------------------------------------------

/**
 * Les affectations d'un groupe qu'un changement de rôle doit réécrire.
 *
 * Une personne peut détenir plusieurs liens, donc plusieurs affectations. Ne
 * changer que l'une d'elles ferait diverger ses appareils — l'un gardant
 * l'ancien rôle indéfiniment. Les affectations déjà au bon rôle sont écartées :
 * une écriture sans changement est une poussée pour rien.
 */
export function affectationsARereferencer<T extends AffectationDeLien>(
  groupe: { liens: T[] },
  roleId: string,
  maintenant: string,
): T[] {
  return groupe.liens
    .filter((l) => l.roleId !== roleId)
    .map((l) => ({ ...l, roleId, updatedAt: maintenant }));
}
