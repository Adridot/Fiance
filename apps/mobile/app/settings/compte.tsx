import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/compte/Bouton";
import { FormulaireDeChangementDeMotDePasse } from "@/components/compte/FormulaireDeChangementDeMotDePasse";
import { FormulaireDeConnexion } from "@/components/compte/FormulaireDeConnexion";
import { FormulaireDeCreationDeCompte } from "@/components/compte/FormulaireDeCreationDeCompte";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { changerMonMotDePasse, creerMonCompte, planifierLeCoffre, seDeconnecter, verifierLeCoffre } from "@/lib/compte-session";
import { theme as GP } from "@/lib/theme";
import { useCompteStore } from "@/store/useCompteStore";

type Confirmation = "deconnexion" | "forcer" | null;

export default function CompteScreen() {
  const { t } = useTranslation("settings");
  const { t: tCommun } = useTranslation("common");
  const compte = useCompteStore((s) => s.compte);
  const charge = useCompteStore((s) => s.charge);
  const etatDuCoffre = useCompteStore((s) => s.coffre);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  const deconnecter = async (forcer: boolean) => {
    setConfirmation(null);
    setDeconnexionEnCours(true);
    try {
      const issue = await seDeconnecter({ forcer });
      if (issue === "poussee-en-echec") setConfirmation("forcer");
    } finally {
      setDeconnexionEnCours(false);
    }
  };

  useEffect(() => {
    if (charge) void verifierLeCoffre();
  }, [charge]);

  if (!charge) return <View className="flex-1 bg-accent-paper" />;

  return (
    <>
      <ScrollView className="flex-1 bg-accent-paper" contentContainerStyle={{ alignItems: "center", paddingVertical: 16 }}>
        <View style={{ width: "100%", maxWidth: 560, paddingHorizontal: 16 }}>
          {!compte ? (
            <>
              <Text className="text-base text-mute leading-6 mb-6">{t("compte.sansCompte")}</Text>
              <FormulaireDeCreationDeCompte
                libelleDuBouton={t("compte.creer")}
                onCreer={creerMonCompte}
              />
            </>
          ) : (
            <>
              <View className="bg-accent-card rounded-2xl p-4 border border-hair mb-4">
                <Text className="text-xs text-mute mb-1">{t("compte.identifiant")}</Text>
                <Text selectable className="text-base text-ink font-semibold" testID="compte-identifiant">
                  {compte.identifiant}
                </Text>
                <EtatDuCoffre etat={etatDuCoffre} />
              </View>

              {etatDuCoffre === "echec" && (
                <View className="mb-6">
                  <Bouton libelle={t("compte.coffre.reessayer")} variante="secondaire" onPress={planifierLeCoffre} />
                </View>
              )}

              {etatDuCoffre === "deplace" ? (
                <View className="mb-6">
                  <FormulaireDeConnexion identifiantInitial={compte.identifiant} />
                </View>
              ) : (
                <View className="mb-6">
                  <Text className="text-lg text-ink font-semibold mb-3">{t("compte.changerLeMotDePasse")}</Text>
                  <FormulaireDeChangementDeMotDePasse onChanger={changerMonMotDePasse} />
                </View>
              )}

              <Bouton
                libelle={t("compte.deconnexion.bouton")}
                variante="secondaire"
                enCours={deconnexionEnCours}
                onPress={() => setConfirmation("deconnexion")}
                testID="compte-deconnecter"
              />
            </>
          )}
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={confirmation === "deconnexion"}
        title={t("compte.deconnexion.titre")}
        message={t("compte.deconnexion.message")}
        confirmLabel={t("compte.deconnexion.bouton")}
        cancelLabel={tCommun("cancel")}
        destructive
        onConfirm={() => void deconnecter(false)}
        onCancel={() => setConfirmation(null)}
      />
      <ConfirmSheet
        visible={confirmation === "forcer"}
        title={t("compte.deconnexion.titre")}
        message={t("compte.deconnexion.poussee")}
        confirmLabel={t("compte.deconnexion.quandMeme")}
        cancelLabel={tCommun("cancel")}
        destructive
        onConfirm={() => void deconnecter(true)}
        onCancel={() => setConfirmation(null)}
      />
    </>
  );
}

function EtatDuCoffre({ etat }: { etat: "a-jour" | "en-attente" | "echec" | "deplace" }) {
  const { t } = useTranslation("settings");
  const cle = { "a-jour": "aJour", "en-attente": "enAttente", echec: "echec", deplace: "deplace" }[etat];
  const couleur = etat === "a-jour" ? GP.olive : etat === "en-attente" ? GP.mute : GP.strawberryInk;
  return (
    <Text className="text-sm mt-2" style={{ color: couleur }} testID="compte-coffre">
      {t(`compte.coffre.${cle}`)}
    </Text>
  );
}
