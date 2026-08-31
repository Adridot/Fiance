/**
 * MODIFICATION LOCALE — marques de temps du démarrage.
 *
 * On ne sait pas ce qui, des 5 à 10 s avant l'apparition de la liste, revient
 * au transfert du bundle, à son évaluation, au montage de React ou aux
 * `Argon2id` de `deriveSession`. Le journal nginx ne descend pas sous la
 * seconde et ne dit rien de ce que fait le fil principal entre deux requêtes ;
 * aucun navigateur n'est joignable depuis la VM. Ces marques sont donc le seul
 * endroit où le temps est réel : elles se relèvent dans la console du
 * navigateur de l'utilisateur.
 *
 * Toutes les valeurs sont des `performance.now()`, c'est-à-dire des
 * millisecondes depuis le début de la navigation — aucune arithmétique de t0
 * n'est nécessaire, et une marque posée par le prérendu se compare directement
 * à une marque posée par l'application.
 *
 * Le registre vit sur `globalThis` et non dans l'état de ce module : la
 * première marque est posée par un script en clair du prérendu
 * (`app/+html.tsx`), donc AVANT que le bundle n'existe. Le module la rejoint,
 * il ne la remplace pas.
 *
 * Coût à l'exécution : un `push` par marque. Rien n'est envoyé nulle part.
 */

export type MarqueDémarrage = {
  /** Nom de l'étape. */
  nom: string;
  /** Millisecondes depuis le début de la navigation. */
  t: number;
  /** Durée de l'étape, pour les marques chronométrées (`chronométrer`). */
  durée?: number;
};

type Registre = {
  entrées: MarqueDémarrage[];
  rapport?: () => void;
};

const CLÉ = "__fianceMarques";

function maintenant(): number {
  const p = (globalThis as any).performance;
  return typeof p?.now === "function" ? p.now() : Date.now();
}

function registre(): Registre {
  const g = globalThis as any;
  if (!g[CLÉ]) g[CLÉ] = { entrées: [] } satisfies Registre;
  // Le script du prérendu crée le registre sans `rapport` — on l'y branche au
  // premier passage par ce module, pour que `__fianceMarques.rapport()` soit
  // appelable à la main depuis la console.
  if (!g[CLÉ].rapport) g[CLÉ].rapport = rapportDémarrage;
  return g[CLÉ] as Registre;
}

/** Pose une marque de temps nommée. Idempotent par nom : la PREMIÈRE gagne. */
export function marquer(nom: string): void {
  const r = registre();
  if (r.entrées.some((e) => e.nom === nom)) return;
  r.entrées.push({ nom, t: maintenant() });
}

/**
 * Pose une marque à CHAQUE appel, avec sa durée — pour ce qui se produit
 * plusieurs fois par démarrage. `deriveSession` est appelée au moins deux
 * fois ; savoir laquelle coûte, et combien, est précisément la question
 * ouverte de ce changement.
 */
export async function chronométrer<T>(nom: string, faire: () => Promise<T>): Promise<T> {
  const r = registre();
  const début = maintenant();
  try {
    return await faire();
  } finally {
    r.entrées.push({ nom, t: maintenant(), durée: maintenant() - début });
  }
}

/**
 * Imprime les marques dans la console, dans l'ordre où elles sont survenues,
 * avec l'écart à la marque précédente — c'est cet écart qui désigne le coupable.
 * Ajoute la chronologie de transfert du bundle, que le navigateur détient déjà.
 */
export function rapportDémarrage(): void {
  const r = registre();
  const triées = [...r.entrées].sort((a, b) => a.t - b.t);

  const lignes = triées.map((e, i) => ({
    étape: e.nom,
    "t (ms)": Math.round(e.t),
    "depuis la précédente (ms)": i === 0 ? 0 : Math.round(e.t - triées[i - 1].t),
    "durée (ms)": e.durée === undefined ? "" : Math.round(e.durée),
  }));

  console.log("[démarrage] marques (ms depuis le début de la navigation)");
  (console.table ?? console.log)(lignes);

  const p = (globalThis as any).performance;
  const scripts: any[] = typeof p?.getEntriesByType === "function"
    ? p.getEntriesByType("resource").filter((e: any) => e.initiatorType === "script")
    : [];
  if (scripts.length) {
    console.log("[démarrage] scripts");
    (console.table ?? console.log)(
      scripts.map((e) => ({
        script: String(e.name).replace(/^.*\//, ""),
        "début (ms)": Math.round(e.startTime),
        "fin (ms)": Math.round(e.responseEnd),
        "transfert (ms)": Math.round(e.responseEnd - e.startTime),
        "octets transmis": e.transferSize,
        "octets décodés": e.decodedBodySize,
      })),
    );
  }
}

/**
 * Programme UN rapport, une fois la peinture suivante passée — appelé par
 * l'écran des invités quand il a rendu. Deux `requestAnimationFrame` : le
 * premier rend la main avant la peinture, le second après elle, de sorte que
 * le rapport ne s'intercale pas dans le temps qu'il mesure.
 */
let rapportProgrammé = false;
export function programmerRapportDémarrage(): void {
  if (rapportProgrammé) return;
  rapportProgrammé = true;
  const raf = (globalThis as any).requestAnimationFrame;
  const plusTard = (f: () => void) => (typeof raf === "function" ? raf(f) : setTimeout(f, 0));
  plusTard(() => plusTard(() => rapportDémarrage()));
}

// Première marque du bundle : ce module est le PREMIER import de
// `app/_layout.tsx`, donc son évaluation date le moment où le premier module
// applicatif s'exécute — après le téléchargement du bundle ET après la phase
// où Metro déclare ses 4 856 modules.
marquer("premier module applicatif");
