import { useEffect } from "react";
import { usePathname } from "expo-router";
import { noterLaRoute } from "@/lib/revenir";

/** Seul abonné aux changements de route : n'affiche rien et ne fait pas re-rendre l'application. */
export function SuiviDeNavigation() {
  const chemin = usePathname();
  useEffect(() => {
    noterLaRoute(chemin);
  }, [chemin]);
  return null;
}
