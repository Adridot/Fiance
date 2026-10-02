// React récupère seul un écart d'hydratation, mais le signale par un événement
// `error` que la frontière de télémétrie tient pour fatal : l'écran entier
// tombait sur « An unexpected error occurred » pour une simple chaîne traduite.
const ECART_D_HYDRATATION = /Minified React error #(418|423|425)\b|Hydration failed|error while hydrating/i;

export function estUnEcartDHydratation(message: unknown): boolean {
  return typeof message === "string" && ECART_D_HYDRATATION.test(message);
}

let installe = false;

/** À appeler au chargement du module, avant tout autre écouteur d'erreur. */
export function tolererLesEcartsDHydratation(): void {
  const w = globalThis as { addEventListener?: Window["addEventListener"]; document?: unknown };
  if (installe || !w.document || typeof w.addEventListener !== "function") return;
  installe = true;
  w.addEventListener(
    "error",
    (e: ErrorEvent) => {
      if (!estUnEcartDHydratation(e.message) && !estUnEcartDHydratation(e.error?.message)) return;
      console.warn("[hydratation] écart récupéré par React :", e.message);
      e.stopImmediatePropagation();
    },
    true,
  );
}
