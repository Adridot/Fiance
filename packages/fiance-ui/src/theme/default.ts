import type { ForgeTheme } from "./types";

// MODIFICATION LOCALE — le défaut porte la palette du mariage plutôt que le
// bleu neutre de la bibliothèque. L'app surcharge déjà ce thème depuis
// `app/_layout.tsx` (GP.clay / GP.card) ; aligner le défaut évite qu'un
// consommateur qui ne surcharge pas — une story, un test de rendu — affiche du
// bleu au milieu d'une interface verte.
export const defaultTheme: ForgeTheme = {
  colors: {
    primary: "#00916e",     // GP.clay — accent primaire (Sea Green)
    destructive: "#EF4444", // red-500 — le refus reste rouge
    onPrimary: "#FFFFFF",
    // GP.card. Ne correspond plus à `--color-background-0` de
    // `tailwind/theme.css`, resté au défaut neutre de la bibliothèque, hors
    // périmètre de la palette du mariage.
    surface: "#FFFBF8",
  },
};
