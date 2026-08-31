/**
 * L'adresse courte d'une invitation : `/i/<code>#<clé>`.
 *
 * MODIFICATION LOCALE — le code vit dans le CHEMIN, la clé dans le fragment.
 * C'est ce qui fait qu'une adresse abîmée en route reste diagnosticable :
 * `/i/<code>` sans fragment dit « invitation incomplète » au lieu de renvoyer
 * la personne à l'accueil.
 *
 * L'écran est celui de `/join` — les deux formes de lien y aboutissent. Sans
 * cette route, nginx sert bien la coquille mais le routeur ne reconnaît pas le
 * chemin et affiche « Unmatched Route ».
 */
export { default } from "@/app/join";
