export type EcranDAccueil = "accueil" | "connexion";

/** `?mode=connexion` ouvre directement la connexion ; expo-router rend un tableau si le paramètre est répété. */
export function ecranInitialDeLAccueil(mode: string | string[] | undefined): EcranDAccueil {
  const valeur = Array.isArray(mode) ? mode[0] : mode;
  return valeur === "connexion" ? "connexion" : "accueil";
}
