import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { seDeconnecter } from "@/lib/compte-session";
import { refreshFromSpaceIfIdle } from "@/lib/space-sync";
import { getActiveSession } from "@/lib/starfish";
import { theme as GP } from "@/lib/theme";
import { useCompteStore } from "@/store/useCompteStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useAccesRefuseStore } from "@/store/useAccesRefuseStore";
import { useParcoursDAccueilStore } from "@/store/useParcoursDAccueilStore";

const DELAI_AVANT_ECHEC_MS = 20_000;

/** Voile plein écran tant que le mariage actif attend sa première hydratation. */
export function RecuperationDesDonnees() {
  const { t } = useTranslation("common");
  const sombre = useColorScheme() === "dark";
  const attendue = useWeddingRegistryStore((s) => {
    const r = s.registry;
    return r?.weddings.find((w) => w.id === r.activeWeddingId)?.premiereHydratationAttendue === true;
  });
  const compte = useCompteStore((s) => s.compte);
  // MODIFICATION LOCALE — un refus du serveur ne se résout pas en attendant : le voile
  // cède au bandeau qui le dit. Une invitation présentée doit aussi rester lisible.
  const refus = useAccesRefuseStore((s) => s.refus);
  const espaceActif = useWeddingRegistryStore((s) => {
    const r = s.registry;
    return r?.weddings.find((w) => w.id === r.activeWeddingId)?.spaceId;
  });
  const refuse = !!refus && refus.spaceId === espaceActif;
  const parcoursEnCours = useParcoursDAccueilStore((s) => s.enCours);
  const [tentative, setTentative] = useState(0);
  const [tropLong, setTropLong] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    setTropLong(false);
    if (!attendue) return;
    const minuteur = setTimeout(() => setTropLong(true), DELAI_AVANT_ECHEC_MS);
    return () => clearTimeout(minuteur);
  }, [attendue, tentative]);

  const reessayer = useCallback(async () => {
    setEnCours(true);
    try {
      // Sans session, l'activation a échoué au démarrage : seule une relance de la sync la refait.
      if (getActiveSession()) await refreshFromSpaceIfIdle();
      else useCompteStore.getState().relancer();
    } finally {
      setTentative((n) => n + 1);
      setEnCours(false);
    }
  }, []);

  // Rien n'est encore lu : il n'y a rien à perdre, on ne demande donc pas de confirmation.
  const deconnecter = useCallback(() => { void seDeconnecter({ forcer: true }); }, []);

  if (!attendue || refuse || parcoursEnCours) return null;

  const encre = sombre ? GP.inkDark : GP.ink;
  return (
    <Modal visible transparent={false} animationType="none" statusBarTranslucent onRequestClose={() => {}}>
      <View style={[styles.voile, { backgroundColor: sombre ? GP.paperDark : GP.paper }]} testID="recuperation-des-donnees">
        <ActivityIndicator size="large" color={GP.clay} />
        <Text style={[styles.titre, { color: encre }]}>{t("compte.recuperation.titre")}</Text>
        {tropLong && (
          <>
            <Text style={[styles.echec, { color: encre }]}>{t("compte.recuperation.echec")}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={enCours}
              onPress={reessayer}
              style={[styles.bouton, styles.principal, enCours && styles.inactif]}
            >
              <Text style={styles.libellePrincipal}>{t("compte.recuperation.reessayer")}</Text>
            </Pressable>
            {compte && (
              <Pressable accessibilityRole="button" onPress={deconnecter} style={[styles.bouton, styles.secondaire]}>
                <Text style={[styles.libelleSecondaire, { color: encre }]}>{t("compte.recuperation.deconnecter")}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  voile: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  titre: { fontSize: 18, fontFamily: "Inter_500Medium", textAlign: "center", marginTop: 8 },
  echec: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  bouton: { minWidth: 200, minHeight: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  principal: { backgroundColor: GP.clay },
  secondaire: { borderWidth: 1, borderColor: GP.hairStrong },
  inactif: { opacity: 0.6 },
  libellePrincipal: { color: GP.card, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  libelleSecondaire: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
