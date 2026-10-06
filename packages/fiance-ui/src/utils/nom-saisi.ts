/** Nom à enregistrer, ou `null` tant que la saisie est vide (espaces compris). */
export function nomSaisi(valeur: string): string | null {
  const nom = valeur.trim();
  return nom ? nom : null;
}
