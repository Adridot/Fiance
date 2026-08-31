/**
 * Ligne d'aide d'un menu en ligne : la hauteur à lui réserver.
 *
 * Un menu est placé et dimensionné AVANT d'être rendu, donc sans jamais
 * mesurer son texte. Or l'aide (« Flèches pour naviguer · Entrée pour valider ·
 * Échap pour fermer ») ne tient pas sur une ligne dans un menu étroit : trois
 * lignes à 200 px en français, deux en anglais, deux à 300 px. Lui réserver une
 * hauteur fixe d'une seule ligne la faisait déborder sous le cadre.
 *
 * L'estimation MAJORE délibérément le nombre de lignes. La hauteur ne sert
 * qu'à un `maxHeight` et au placement : trop large, elle ne se voit pas — la
 * carte s'ajuste à son contenu réel ; trop courte, elle coupe le texte. Entre
 * les deux erreurs, une seule est visible.
 */

/** Interligne imposé à l'aide, pour que le rendu suive ce calcul. */
export const INLINE_MENU_HINT_LINE_H = 14;

/** Le `pt-0.5` qui sépare l'aide de la dernière option. */
export const INLINE_MENU_HINT_PAD_TOP = 2;

/**
 * Largeur d'un caractère, en fraction de la taille de police. Inter tourne
 * autour de 0,52 em en moyenne : on compte 0,58 pour majorer.
 */
const CHAR_WIDTH_RATIO = 0.58;

/**
 * Nombre de lignes qu'occupe `text` une fois replié dans `availableWidth`.
 * Toujours au moins une ligne dès que le texte n'est pas vide.
 */
export function estimateWrappedLines(
  text: string,
  availableWidth: number,
  fontSize: number,
): number {
  if (!text) return 0;
  if (availableWidth <= 0 || fontSize <= 0) return 1;
  const textWidth = text.length * fontSize * CHAR_WIDTH_RATIO;
  return Math.max(1, Math.ceil(textWidth / availableWidth));
}

/**
 * Hauteur totale à réserver pour l'aide, interligne et marge haute compris.
 * Vaut 0 sans aide — un menu qui n'en affiche pas ne réserve rien.
 */
export function inlineMenuHintHeight(
  text: string | null | undefined,
  availableWidth: number,
  fontSize: number,
): number {
  if (!text) return 0;
  return (
    estimateWrappedLines(text, availableWidth, fontSize) * INLINE_MENU_HINT_LINE_H +
    INLINE_MENU_HINT_PAD_TOP
  );
}
