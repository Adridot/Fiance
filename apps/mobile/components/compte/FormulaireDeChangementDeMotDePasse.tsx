import React, { useState } from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { messageDeLErreur, validerLeMotDePasse } from "@/lib/messages-de-compte";
import { theme as GP } from "@/lib/theme";
import { Bouton } from "./Bouton";
import { ChampDeFormulaire } from "./ChampDeFormulaire";
import { useEnvoi } from "./useEnvoi";

export function FormulaireDeChangementDeMotDePasse({ onChanger }: { onChanger: (mdp: string) => Promise<void> }) {
  const { t } = useTranslation("common");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<{ motDePasse?: string; confirmation?: string }>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [change, setChange] = useState(false);
  const { enCours, lancer } = useEnvoi();

  const envoyer = () => {
    const invalides = validerLeMotDePasse(motDePasse, confirmation);
    setErreurs(invalides);
    setErreur(null);
    setChange(false);
    if (Object.keys(invalides).length > 0) return;
    void lancer(
      async () => {
        await onChanger(motDePasse);
        setMotDePasse("");
        setConfirmation("");
        setChange(true);
      },
      (err) => setErreur(messageDeLErreur(err, (cle) => t(cle))),
    );
  };

  return (
    <View>
      <ChampDeFormulaire
        libelle={t("compte.champs.nouveauMotDePasse")}
        valeur={motDePasse}
        onChangeText={(v) => {
          setMotDePasse(v);
          setErreurs((e) => ({ ...e, motDePasse: undefined }));
        }}
        genre="nouveau-mot-de-passe"
        aide={t("compte.champs.motDePasseAide")}
        erreur={erreurs.motDePasse ? t(erreurs.motDePasse) : null}
        editable={!enCours}
        onSubmit={envoyer}
        testID="changement-mot-de-passe"
      />
      <ChampDeFormulaire
        libelle={t("compte.champs.confirmationDuNouveau")}
        valeur={confirmation}
        onChangeText={(v) => {
          setConfirmation(v);
          setErreurs((e) => ({ ...e, confirmation: undefined }));
        }}
        genre="nouveau-mot-de-passe"
        erreur={erreurs.confirmation ? t(erreurs.confirmation) : null}
        editable={!enCours}
        onSubmit={envoyer}
        testID="changement-confirmation"
      />
      <Bouton
        libelle={enCours ? t("compte.changement.enCours") : t("compte.changement.bouton")}
        onPress={envoyer}
        enCours={enCours}
        variante="secondaire"
        testID="changement-envoyer"
      />
      {erreur && (
        <Text accessibilityRole="alert" className="text-sm mt-3 text-center" style={{ color: GP.strawberryInk }}>
          {erreur}
        </Text>
      )}
      {change && (
        <Text accessibilityRole="alert" className="text-sm mt-3 text-center" style={{ color: GP.olive }}>
          {t("compte.changement.reussi")}
        </Text>
      )}
    </View>
  );
}
