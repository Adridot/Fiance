import { create } from "zustand";

/**
 * Session flag, raised once the automatic push retries are exhausted: a write
 * that never reached the server must not disappear silently.
 *
 * MUST NOT call notifySync() — domain stores call it after every mutation, and
 * here it would loop: push failure → flag → notifySync → push → failure.
 */
interface SyncPendingState {
  unsavedChanges: boolean;
  setUnsavedChanges: (pending: boolean) => void;
}

export const useSyncPendingStore = create<SyncPendingState>((set) => ({
  unsavedChanges: false,
  setUnsavedChanges: (pending) => set({ unsavedChanges: pending }),
}));
