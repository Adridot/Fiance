import React, { useState } from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { messageDeLErreur, validerLaCreation, type ErreursDeCreation } from "@/lib/messages-de-compte";
import { theme as GP } from "@/lib/theme";
import { Bouton } from "./Bouton";
import { ChampDeFormulaire } from "./ChampDeFormulaire";
import { useEnvoi } from "./useEnvoi";

interface Props {
  libelleDuBouton: string;
  onCreer: (identifiant: string, mdp: string) => Promise<void>;
  identifiantInitial?: string;
}

export function FormulaireDeCreationDeCompte({ libelleDuBouton, onCreer, identifiantInitial = "" }: Props) {
  const { t } = useTranslation("common");
  const [identifiant, setIdentifiant] = useState(identifiantInitial);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<ErreursDeCreation>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const { enCours, lancer } = useEnvoi();

  const sans = (champ: keyof ErreursDeCreation) => setErreurs((e) => ({ ...e, [champ]: undefined }));

  const envoyer = () => {
    const invalides = validerLaCreation({ identifiant, motDePasse, confirmation });
    setErreurs(invalides);
    setErreur(null);
    if (Object.keys(invalides).length > 0) return;
    void lancer(
      () => onCreer(identifiant, motDePasse),
      (err) => setErreur(messageDeLErreur(err, (cle) => t(cle))),
    );
  };

  const message = (cle?: string) => (cle ? t(cle) : null);

  return (
    <View>
      <ChampDeFormulaire
        libelle={t("compte.champs.identifiant")}
        valeur={identifiant}
        onChangeText={(v) => {
          setIdentifiant(v);
          sans("identifiant");
        }}
        genre="identifiant"
        placeholder={t("compte.champs.identifiantPlaceholder")}
        aide={t("compte.champs.identifiantAide")}
        erreur={message(erreurs.identifiant)}
        editable={!enCours}
        onSubmit={envoyer}
        testID="creation-identifiant"
      />
      <ChampDeFormulaire
        libelle={t("compte.champs.motDePasse")}
        valeur={motDePasse}
        onChangeText={(v) => {
          setMotDePasse(v);
          sans("motDePasse");
        }}
        genre="nouveau-mot-de-passe"
        placeholder={t("compte.champs.motDePassePlaceholder")}
        aide={t("compte.champs.motDePasseAide")}
        erreur={message(erreurs.motDePasse)}
        editable={!enCours}
        onSubmit={envoyer}
        testID="creation-mot-de-passe"
      />
      <ChampDeFormulaire
        libelle={t("compte.champs.confirmation")}
        valeur={confirmation}
        onChangeText={(v) => {
          setConfirmation(v);
          sans("confirmation");
        }}
        genre="nouveau-mot-de-passe"
        placeholder={t("compte.champs.confirmationPlaceholder")}
        erreur={message(erreurs.confirmation)}
        editable={!enCours}
        onSubmit={envoyer}
        testID="creation-confirmation"
      />
      <Bouton libelle={libelleDuBouton} onPress={envoyer} enCours={enCours} testID="creation-envoyer" />
      {erreur && (
        <Text accessibilityRole="alert" className="text-sm mt-3 text-center" style={{ color: GP.strawberryInk }}>
          {erreur}
        </Text>
      )}
    </View>
  );
}
