/** Sur iOS l'app installée repart d'un stockage vierge : sans compte, la personne y perdrait son accès. */
export function peutProposerLInstallation(compteCharge: boolean, aUnCompte: boolean): boolean {
  return compteCharge && aUnCompte;
}

/** Le bandeau d'installation se tait tant que l'installation n'est pas permise. */
export function sousReserveDeCompte<T extends { canInstall: boolean; isIosSafari: boolean }>(
  installation: T,
  permise: boolean,
): T {
  return permise ? installation : { ...installation, canInstall: false, isIosSafari: false };
}
