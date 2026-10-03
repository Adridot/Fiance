import { useEffect } from "react";
import { usePathname } from "expo-router";
import { noterLaRoute } from "@/lib/revenir";

export function useSuiviDeNavigation(): void {
  const chemin = usePathname();
  useEffect(() => {
    noterLaRoute(chemin);
  }, [chemin]);
}
