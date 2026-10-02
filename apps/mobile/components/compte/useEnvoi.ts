import { useCallback, useEffect, useRef, useState } from "react";

/** Un envoi à la fois ; l'état n'est touché que tant que le formulaire est monté (un succès peut le démonter). */
export function useEnvoi() {
  const [enCours, setEnCours] = useState(false);
  const vivant = useRef(true);
  const verrou = useRef(false);

  useEffect(() => {
    vivant.current = true;
    return () => {
      vivant.current = false;
    };
  }, []);

  const lancer = useCallback(async (tache: () => Promise<void>, surEchec: (err: unknown) => void) => {
    if (verrou.current) return;
    verrou.current = true;
    setEnCours(true);
    try {
      await tache();
    } catch (err) {
      if (vivant.current) surEchec(err);
    } finally {
      verrou.current = false;
      if (vivant.current) setEnCours(false);
    }
  }, []);

  return { enCours, lancer };
}
