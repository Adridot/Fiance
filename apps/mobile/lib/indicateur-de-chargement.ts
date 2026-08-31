/**
 * MODIFICATION LOCALE — l'indicateur de chargement du prérendu cède la place.
 *
 * L'indicateur lui-même est écrit en HTML et CSS dans `app/+html.tsx` : il doit
 * apparaître AVANT le bundle, sinon il arriverait en même temps que ce qu'il
 * annonce. Il ne peut donc pas être un composant React — mais c'est React qui
 * sait quand il n'a plus lieu d'être.
 *
 * D'où cette fonction, seul lien entre les deux : posée sur `<html>`, la
 * marque `data-app-montee` fait disparaître l'indicateur par la seule feuille
 * de style du prérendu. Aucun nœud n'est retiré du document : le laisser en
 * place et le masquer évite de courir après un élément qu'un rendu concurrent
 * pourrait être en train de lire.
 */

/** Fait céder la place à l'application. Sans effet hors du web, et idempotent. */
export function masquerIndicateurDeChargement(): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-app-montee", "");
}
