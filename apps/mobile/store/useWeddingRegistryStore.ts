import { create } from "zustand";
import type { WeddingRegistry, WeddingRegistryEntry } from "@/lib/wedding-registry";
import {
  loadRegistry,
  saveRegistry,
  createWeddingEntry,
  deleteWeddingEntry,
  setActiveWeddingEntry,
  updateWeddingEntry,
} from "@/lib/wedding-registry";
import { useRevenueCatStore } from "@/store/useRevenueCatStore";

/**
 * MODIFICATION LOCALE — instance familiale auto-hébergée (mariage.didot.io).
 *
 * Cette instance ne sert qu'un mariage, déjà créé. En créer un second ne
 * pourrait que disperser les données de la famille entre deux espaces sans lien
 * entre eux, chacun avec sa propre phrase de récupération.
 *
 * Le verrou vit ici et non dans les composants : `createWedding` est le seul
 * passage obligé, donc le seul endroit qu'une navigation directe vers l'écran
 * de création ne peut pas contourner.
 *
 * Pour lever la contrainte (reconstruction après perte du mariage) : rebuild
 * avec EXPO_PUBLIC_ALLOW_WEDDING_CREATION=1. Cela exige de reconstruire le
 * bundle, donc ne peut pas se produire par inadvertance depuis l'app.
 */
const ALLOW_WEDDING_CREATION = process.env.EXPO_PUBLIC_ALLOW_WEDDING_CREATION === "1";

/** Levée par `createWedding` quand un mariage existe déjà sur cette instance. */
export class SingleWeddingInstanceError extends Error {
  constructor() {
    super("SINGLE_WEDDING_INSTANCE");
    this.name = "SingleWeddingInstanceError";
  }
}

interface WeddingRegistryState {
  registry: WeddingRegistry | null;
  isLoaded: boolean;

  load: () => Promise<void>;
  createWedding: (label: string, seedPhrase?: string, serverUrl?: string, spaceId?: string, role?: "owner" | "member") => Promise<WeddingRegistryEntry>;
  switchWedding: (id: string) => Promise<void>;
  deleteWedding: (id: string) => Promise<void>;
  updateWedding: (id: string, updates: Partial<Pick<WeddingRegistryEntry, "label" | "seedPhrase" | "serverUrl" | "syncDisabled" | "spaceId" | "role" | "weddingNodeId" | "syncNamespace" | "roleId" | "permissions" | "inviteSubjectId" | "revocationGeneration" | "revokedEntries" | "ownerId">>) => Promise<void>;
}

export const useWeddingRegistryStore = create<WeddingRegistryState>((set, get) => ({
  registry: null,
  isLoaded: false,

  load: async () => {
    const registry = await loadRegistry();
    set({ registry, isLoaded: true });
  },

  createWedding: async (label, seedPhrase, serverUrl, spaceId, role) => {
    if (!ALLOW_WEDDING_CREATION) {
      // Relu depuis le stockage plutôt que depuis get().registry : au tout
      // premier rendu le store n'est pas encore chargé, et un registre null
      // laisserait passer la création qu'on veut justement bloquer.
      const current = await loadRegistry();
      if (current.weddings.length > 0) throw new SingleWeddingInstanceError();
    }
    const entry = await createWeddingEntry(label, seedPhrase, serverUrl, spaceId, role);
    const registry = await loadRegistry();
    // Reset BEFORE the registry update below triggers React's re-render, so
    // RevenueCatInitializer/SyncInitializer never observe the previous active
    // wedding's stale premium flag on the very first render of the new one —
    // relying on RevenueCatInitializer's own effect to reset it is too late,
    // since effects run after render and can race a sibling's render-time read.
    useRevenueCatStore.getState().setPremium(false);
    set({ registry });
    return entry;
  },

  switchWedding: async (id) => {
    await setActiveWeddingEntry(id);
    const registry = await loadRegistry();
    useRevenueCatStore.getState().setPremium(false); // see createWedding
    set({ registry });
  },

  deleteWedding: async (id) => {
    await deleteWeddingEntry(id);
    const registry = await loadRegistry();
    useRevenueCatStore.getState().setPremium(false); // see createWedding
    set({ registry });
  },

  updateWedding: async (id, updates) => {
    await updateWeddingEntry(id, updates);
    const registry = await loadRegistry();
    set({ registry });
  },
}));
