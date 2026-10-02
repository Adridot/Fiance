/** Les adresses d'envoi d'une invitation : fonctions pures. Le message vit dans `settings:inviteMessage`. */

/** Le prénom : le premier mot du nom saisi. */
export function prenomDe(nom: string | null | undefined): string {
  return (nom ?? "").trim().split(/\s+/)[0] ?? "";
}

// `encodeURIComponent` est indispensable : le `#` du lien, non encodé, couperait le message.
export const urlWhatsApp = (message: string) => `https://wa.me/?text=${encodeURIComponent(message)}`;

export const urlSms = (message: string) => `sms:?&body=${encodeURIComponent(message)}`;

export const urlEmail = (sujet: string, message: string) =>
  `mailto:?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(message)}`;

/** Le QR encode ~81 caractères (37 modules en ECL M) : 180 px donnent déjà près de 5 px par module. */
export function tailleDuQR(largeur: number): number {
  return Math.max(180, Math.min(240, Math.round(largeur - 96)));
}

/** Sous cette largeur d'écran, le QR est replié derrière un bouton. */
export const LARGEUR_MINIMALE_POUR_LE_QR = 400;
