import { useEffect, useState } from "react";

/** Faux au prérendu et au premier rendu client, vrai ensuite : ce qui dépend de la langue du navigateur ne se montre qu'après. */
export function useApresHydratation(): boolean {
  const [pret, setPret] = useState(false);
  useEffect(() => setPret(true), []);
  return pret;
}
