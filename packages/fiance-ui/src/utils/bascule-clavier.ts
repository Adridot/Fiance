export interface EvenementClavier {
  key: string;
  repeat?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

/** Entrée n'est pas ici : react-native-web la change déjà en `onPress` sur toute cible `Pressable`. */
export function estEspace(touche: string): boolean {
  return touche === " " || touche === "Spacebar";
}

/**
 * `onKeyDown` web d'une cible `role` checkbox, switch ou radio : Espace bascule une
 * seule fois (touche maintenue ignorée) et ne fait pas défiler la page.
 */
export function basculeAEspace(basculer: () => void) {
  return (e: EvenementClavier) => {
    if (!estEspace(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) basculer();
  };
}
