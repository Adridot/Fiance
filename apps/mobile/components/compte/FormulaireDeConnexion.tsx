import React, { useState } from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { ouvrirUneSession } from "@/lib/compte-session";
import { messageDeLErreur } from "@/lib/messages-de-compte";
import { theme as GP } from "@/lib/theme";
import { Bouton } from "./Bouton";
import { ChampDeFormulaire } from "./ChampDeFormulaire";
import { useEnvoi } from "./useEnvoi";

interface Props {
  identifiantInitial?: string;
  onConnecte?: () => void;
}

export function FormulaireDeConnexion({ identifiantInitial = "", onConnecte }: Props) {
  const { t } = useTranslation("common");
  const [identifiant, setIdentifiant] = useState(identifiantInitial);
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const { enCours, lancer } = useEnvoi();

  const envoyer = () => {
    if (!identifiant.trim() || !motDePasse) {
      setErreur(t("compte.connexion.champsVides"));
      return;
    }
    setErreur(null);
    void lancer(
      async () => {
        await ouvrirUneSession(identifiant, motDePasse);
        onConnecte?.();
      },
      (err) => setErreur(messageDeLErreur(err, (cle) => t(cle))),
    );
  };

  return (
    <View>
      <ChampDeFormulaire
        libelle={t("compte.champs.identifiant")}
        valeur={identifiant}
        onChangeText={setIdentifiant}
        genre="identifiant"
        placeholder={t("compte.champs.identifiantPlaceholder")}
        editable={!enCours}
        onSubmit={envoyer}
        testID="connexion-identifiant"
      />
      <ChampDeFormulaire
        libelle={t("compte.champs.motDePasse")}
        valeur={motDePasse}
        onChangeText={setMotDePasse}
        genre="mot-de-passe-actuel"
        placeholder={t("compte.champs.motDePassePlaceholder")}
        editable={!enCours}
        onSubmit={envoyer}
        testID="connexion-mot-de-passe"
      />
      <Bouton
        libelle={enCours ? t("compte.connexion.enCours") : t("compte.connexion.bouton")}
        onPress={envoyer}
        enCours={enCours}
        testID="connexion-envoyer"
      />
      {erreur && (
        <Text accessibilityRole="alert" className="text-sm mt-3 text-center" style={{ color: GP.strawberryInk }}>
          {erreur}
        </Text>
      )}
    </View>
  );
}
