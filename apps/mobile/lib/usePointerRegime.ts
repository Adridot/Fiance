import { useEffect, useState } from "react";
import { Platform } from "react-native";

// La largeur ne dit rien du geste : une tablette large n'a pas de survol, une
// fenêtre étroite peut avoir une souris.
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function mediaQueryList(): MediaQueryList | null {
  if (Platform.OS !== "web") return null;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(POINTER_QUERY);
}

/**
 * Vrai sur un appareil à survol et pointeur fin, toujours faux en natif.
 *
 * Faux au premier rendu même sur desktop : le prérendu web n'a pas de
 * `window`, et partir de vrai ferait diverger l'hydratation.
 */
export function usePointerRegime(): boolean {
  const [pointer, setPointer] = useState(false);

  useEffect(() => {
    const mql = mediaQueryList();
    if (!mql) return;
    const sync = () => setPointer(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return pointer;
}
