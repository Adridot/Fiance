import { normalizeSyncBase, resolveServerUrl } from "@/lib/server";

/** La base de sync, pour aller chercher un dépôt avant d'avoir la moindre identité. */
export function baseDeSync(): string {
  return normalizeSyncBase(resolveServerUrl() ?? "https://mariage.didot.io/sync");
}
