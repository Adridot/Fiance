import { usePwaInstall as usePwaInstallBrut } from "@fiance/ui/utils/pwa-install";
import { peutProposerLInstallation, sousReserveDeCompte } from "@/lib/installation-pwa";
import { useCompteStore } from "@/store/useCompteStore";

export { isPwaStandalone } from "@fiance/ui/utils/pwa-install";

export function usePwaInstall() {
  const permise = useCompteStore((s) => peutProposerLInstallation(s.charge, s.compte !== null));
  return sousReserveDeCompte(usePwaInstallBrut(), permise);
}
