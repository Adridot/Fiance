/**
 * MODIFICATION LOCALE — instance familiale auto-hébergée (mariage.didot.io).
 *
 * Cette instance ne sert qu'un mariage. Le verrou vit dans `createWedding`
 * (store/useWeddingRegistryStore.ts) parce que c'est le seul passage obligé :
 * masquer les boutons ne suffirait pas, une navigation directe vers l'écran de
 * création les contournerait.
 *
 * Ces tests couvrent surtout ce que le verrou doit **laisser passer**. Bloquer
 * est facile ; bloquer sans casser l'accès de la famille l'est moins, et deux
 * parcours passent par la même fonction que la création :
 *  - rejoindre par lien d'invitation (`role: "member"`, lib/join-space.ts) ;
 *  - le premier démarrage sur un appareil vierge, sans quoi l'application
 *    deviendrait inaccessible après une réinstallation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Registre en mémoire, piloté par les tests via `registryState`.
let registryState: { activeWeddingId: string | null; weddings: unknown[] } = {
  activeWeddingId: null,
  weddings: [],
};
const createWeddingEntry = vi.fn(async (label: string) => ({ id: "new-id", label }));

vi.mock("@/lib/wedding-registry", () => ({
  loadRegistry: vi.fn(async () => registryState),
  saveRegistry: vi.fn(async () => {}),
  createWeddingEntry: (...args: unknown[]) => createWeddingEntry(...(args as [string])),
  deleteWeddingEntry: vi.fn(async () => {}),
  setActiveWeddingEntry: vi.fn(async () => {}),
  updateWeddingEntry: vi.fn(async () => {}),
}));
vi.mock("@/store/useRevenueCatStore", () => ({
  useRevenueCatStore: { getState: () => ({ setPremium: vi.fn() }) },
}));

import {
  useWeddingRegistryStore,
  SingleWeddingInstanceError,
} from "@/store/useWeddingRegistryStore";

const anExistingWedding = { id: "w1", label: "Notre mariage" };

beforeEach(() => {
  createWeddingEntry.mockClear();
  registryState = { activeWeddingId: null, weddings: [] };
  useWeddingRegistryStore.setState({ registry: null, isLoaded: false });
});

describe("verrou du mariage unique", () => {
  it("refuse la création quand un mariage existe déjà", async () => {
    registryState = { activeWeddingId: "w1", weddings: [anExistingWedding] };

    await expect(
      useWeddingRegistryStore.getState().createWedding("Un second mariage", "seed"),
    ).rejects.toBeInstanceOf(SingleWeddingInstanceError);

    expect(createWeddingEntry).not.toHaveBeenCalled();
  });

  it("autorise la création sur un registre vide (appareil vierge)", async () => {
    const entry = await useWeddingRegistryStore
      .getState()
      .createWedding("Notre mariage", "seed");

    expect(entry.label).toBe("Notre mariage");
    expect(createWeddingEntry).toHaveBeenCalledOnce();
  });

  it("laisse passer l'entrée par lien d'invitation malgré un mariage existant", async () => {
    registryState = { activeWeddingId: "w1", weddings: [anExistingWedding] };

    // La signature exacte de lib/join-space.ts : le 5e argument vaut "member".
    await useWeddingRegistryStore
      .getState()
      .createWedding("Mariage partagé", "seed", "https://sync.example", "sp-abc", "member");

    expect(createWeddingEntry).toHaveBeenCalledOnce();
  });

  it("bloque même si le store n'a pas encore chargé son registre", async () => {
    // Le registre en mémoire est null au tout premier rendu ; le verrou doit
    // relire le stockage plutôt que conclure « aucun mariage » et laisser passer.
    registryState = { activeWeddingId: "w1", weddings: [anExistingWedding] };
    useWeddingRegistryStore.setState({ registry: null, isLoaded: false });

    await expect(
      useWeddingRegistryStore.getState().createWedding("Contournement", "seed"),
    ).rejects.toBeInstanceOf(SingleWeddingInstanceError);
  });
});

describe("échappatoire de reconstruction", () => {
  it("rétablit la création quand EXPO_PUBLIC_ALLOW_WEDDING_CREATION vaut 1", async () => {
    // Le drapeau est lu au chargement du module : il faut le poser AVANT
    // d'importer, d'où resetModules + import dynamique. C'est aussi ce qui rend
    // l'échappatoire inatteignable depuis l'app — elle exige un rebuild.
    vi.resetModules();
    const previous = process.env.EXPO_PUBLIC_ALLOW_WEDDING_CREATION;
    process.env.EXPO_PUBLIC_ALLOW_WEDDING_CREATION = "1";
    try {
      registryState = { activeWeddingId: "w1", weddings: [anExistingWedding] };
      const mod = await import("@/store/useWeddingRegistryStore");
      mod.useWeddingRegistryStore.setState({ registry: null, isLoaded: false });

      await mod.useWeddingRegistryStore
        .getState()
        .createWedding("Mariage reconstruit", "seed");

      expect(createWeddingEntry).toHaveBeenCalledOnce();
    } finally {
      if (previous === undefined) delete process.env.EXPO_PUBLIC_ALLOW_WEDDING_CREATION;
      else process.env.EXPO_PUBLIC_ALLOW_WEDDING_CREATION = previous;
      vi.resetModules();
    }
  });
});
