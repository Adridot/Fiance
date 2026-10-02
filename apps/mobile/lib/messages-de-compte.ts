import { CompteError, motDePasseAcceptable, normaliserLIdentifiant, type EchecDeCompte } from "@/lib/compte";
import type { CauseDEchec } from "@/lib/resolution-d-invitation";

const CLE_PAR_CAS: Record<EchecDeCompte, string> = {
  identifiants: "compte.erreurs.identifiants",
  reseau: "compte.erreurs.reseau",
  illisible: "compte.erreurs.illisible",
  "existe-deja": "compte.erreurs.existeDeja",
  "mot-de-passe-faible": "compte.validation.motDePasseCourt",
  "identifiant-vide": "compte.validation.identifiantVide",
  deplace: "compte.erreurs.deplace",
};

export function cleDuMessageDeCompte(cas: EchecDeCompte): string {
  return CLE_PAR_CAS[cas];
}

/** Une `CompteError` se traduit selon son cas ; toute autre erreur garde son propre message. */
export function messageDeLErreur(err: unknown, traduire: (cle: string) => string): string {
  if (err instanceof CompteError) return traduire(cleDuMessageDeCompte(err.cas));
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return message.trim() || traduire("compte.erreurs.inconnue");
}

const CLE_PAR_CAUSE: Record<CauseDEchec, string> = {
  incomplete: "onboarding.invitation.incomplete",
  expiree: "onboarding.invitation.expiree",
  invalide: "onboarding.invitation.invalide",
  utilisee: "onboarding.invitation.utilisee",
};

export function cleDuMessageDInvitation(cause: CauseDEchec): string {
  return CLE_PAR_CAUSE[cause];
}

export interface ErreursDeCreation {
  identifiant?: string;
  motDePasse?: string;
  confirmation?: string;
}

/** Clés de message par champ en défaut ; objet vide = formulaire valide. */
export function validerLaCreation(saisie: {
  identifiant: string;
  motDePasse: string;
  confirmation: string;
}): ErreursDeCreation {
  const erreurs: ErreursDeCreation = {};
  if (!normaliserLIdentifiant(saisie.identifiant)) erreurs.identifiant = "compte.validation.identifiantVide";
  Object.assign(erreurs, validerLeMotDePasse(saisie.motDePasse, saisie.confirmation));
  return erreurs;
}

export function validerLeMotDePasse(
  motDePasse: string,
  confirmation: string,
): Pick<ErreursDeCreation, "motDePasse" | "confirmation"> {
  const erreurs: Pick<ErreursDeCreation, "motDePasse" | "confirmation"> = {};
  if (!motDePasseAcceptable(motDePasse)) erreurs.motDePasse = "compte.validation.motDePasseCourt";
  else if (confirmation !== motDePasse) erreurs.confirmation = "compte.validation.confirmationDifferente";
  return erreurs;
}
