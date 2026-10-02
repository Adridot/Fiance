import React, { useState } from "react";
import { Seo } from "@/components/Seo";
import { View, Text, TextInput, Image } from "react-native-css/components";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Link, LogIn, ScanLine } from "lucide-react-native";
import { generatePassphrase } from "@/lib/identity";
import { useWeddingRegistryStore, SingleWeddingInstanceError } from "@/store/useWeddingRegistryStore";
import { QRScannerScreen } from "@/components/QRScannerScreen";
import { analytics } from "@/lib/analytics";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { PageHeader } from "@/components/PageHeader";
import { DateRow } from "@/components/FormSection";
import { Bouton } from "@/components/compte/Bouton";
import { CadreDEcran } from "@/components/compte/CadreDEcran";
import { FormulaireDeConnexion } from "@/components/compte/FormulaireDeConnexion";
import { useEnvoi } from "@/components/compte/useEnvoi";
import { ParcoursDInvitation } from "@/components/invitation/ParcoursDInvitation";
import { setPendingWeddingSeed, consumePendingWeddingSeed } from "@/lib/pending-wedding-seed";
import { ecranInitialDeLAccueil } from "@/lib/accueil";
import { baseDeSync } from "@/lib/base-de-sync";
import { cleDuMessageDInvitation } from "@/lib/messages-de-compte";
import { resoudreUneSaisie, type CauseDEchec, type ResolutionDInvitation } from "@/lib/resolution-d-invitation";
import { theme as GP } from "@/lib/theme";

type Ecran = "accueil" | "connexion" | "invitation" | "creation";
type Reussite = Extract<ResolutionDInvitation, { jeton: unknown }>;

export default function OnboardingScreen() {
  const { t: tSettings } = useTranslation("settings");
  const { mode } = useLocalSearchParams<{ mode?: string | string[] }>();
  const [ecran, setEcran] = useState<Ecran>(ecranInitialDeLAccueil(mode));
  const [resolution, setResolution] = useState<Reussite | null>(null);
  const createWedding = useWeddingRegistryStore((s) => s.createWedding);
  const retour = () => setEcran("accueil");

  if (resolution) {
    return (
      <ParcoursDInvitation
        resolution={resolution}
        onRetour={() => {
          setResolution(null);
          retour();
        }}
      />
    );
  }

  if (ecran === "connexion") return <EcranDeConnexion onRetour={retour} />;

  if (ecran === "invitation") {
    return <EcranDInvitation onRetour={retour} onResolue={setResolution} onConnexion={() => setEcran("connexion")} />;
  }

  if (ecran === "creation") {
    return (
      <CreateWeddingForm
        onBack={retour}
        onCreate={async ({ partner1Name, partner2Name, weddingDate }) => {
          const label = [partner1Name, partner2Name].filter(Boolean).join(" & ") || "Mon mariage";
          setPendingWeddingSeed({ partner1Name, partner2Name, weddingDate });
          const passphrase = generatePassphrase();
          try {
            await createWedding(label, passphrase);
          } catch (e) {
            consumePendingWeddingSeed(); // discard the stale seed on failure
            // Cet écran reste atteignable par URL directe : le verrou du store lève un code technique.
            if (e instanceof SingleWeddingInstanceError) {
              throw new Error(tSettings("singleWeddingInstanceHint"));
            }
            throw e;
          }
          analytics.capture("wedding_created", { method: "new" });
          // Navigation to /home is handled by _layout.tsx after DatabaseProvider mounts
        }}
      />
    );
  }

  return <ChooseMode onSelect={setEcran} />;
}

function ChooseMode({ onSelect }: { onSelect: (e: Ecran) => void }) {
  const { t } = useTranslation("common");
  return (
    <View className="flex-1 bg-accent-paper justify-center items-center">
      <Seo title="Fiancé" description="" noindex />
      <View style={{ width: "100%", maxWidth: 480, paddingHorizontal: 24 }}>
        <View className="items-center mb-10">
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Display size={32} italic style={{ textAlign: "center" }}>
            Fiancé
          </Display>
          <Script size={16} color="#9CA3AF" weight="400" style={{ marginTop: 6, textAlign: "center" }}>
            {t("onboarding.tagline")}
          </Script>
        </View>

        <View style={{ gap: 12 }}>
          <Bouton
            libelle={t("onboarding.seConnecter")}
            icone={<LogIn size={20} color="#fff" />}
            onPress={() => onSelect("connexion")}
          />
          <Bouton
            libelle={t("onboarding.jAiUneInvitation")}
            variante="secondaire"
            icone={<Link size={20} color={GP.clay} />}
            onPress={() => onSelect("invitation")}
          />
        </View>
        <View className="mt-4">
          <Bouton libelle={t("onboarding.creerUnNouveauMariage")} variante="lien" onPress={() => onSelect("creation")} />
        </View>
      </View>
    </View>
  );
}

function EcranDeConnexion({ onRetour }: { onRetour: () => void }) {
  const { t } = useTranslation("common");
  return (
    <CadreDEcran onRetour={onRetour}>
      <PageHeader
        eyebrow={t("onboarding.connexionEyebrow")}
        title={t("onboarding.connexionTitre")}
        tagline={t("onboarding.connexionTagline")}
        titleSize={28}
        style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 24 }}
      />
      <FormulaireDeConnexion />
    </CadreDEcran>
  );
}

function EcranDInvitation({
  onRetour,
  onResolue,
  onConnexion,
}: {
  onRetour: () => void;
  onResolue: (r: Reussite) => void;
  onConnexion: () => void;
}) {
  const { t } = useTranslation("common");
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<{ cle: string; cause?: CauseDEchec } | null>(null);
  const [scan, setScan] = useState(false);
  const { enCours, lancer } = useEnvoi();

  const resoudre = (texte: string) => {
    if (!texte.trim()) {
      setErreur({ cle: "onboarding.invitation.vide" });
      return;
    }
    setErreur(null);
    void lancer(
      async () => {
        const r = await resoudreUneSaisie(baseDeSync(), texte);
        if ("jeton" in r) onResolue(r);
        else setErreur({ cle: cleDuMessageDInvitation(r.cause), cause: r.cause });
      },
      () => setErreur({ cle: cleDuMessageDInvitation("invalide"), cause: "invalide" }),
    );
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <CadreDEcran onRetour={onRetour}>
        <PageHeader
          eyebrow={t("onboarding.joinEyebrow")}
          title={t("onboarding.joinTitle")}
          tagline={t("onboarding.joinTagline")}
          titleSize={28}
          style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 24 }}
        />
        <Text className="text-sm font-medium text-mute mb-1.5 ml-1">{t("onboarding.invitation.champ")}</Text>
        <TextInput
          accessibilityLabel={t("onboarding.invitation.champ")}
          className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair"
          style={{ minHeight: 48 }}
          placeholder={t("onboarding.invitation.placeholder")}
          placeholderTextColor="#C0C0C8"
          value={saisie}
          onChangeText={(v) => {
            setSaisie(v);
            setErreur(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!enCours}
          onSubmitEditing={() => resoudre(saisie)}
          returnKeyType="go"
          testID="invitation-saisie"
        />
        {erreur && (
          <View className="mt-1.5">
            <Text accessibilityRole="alert" className="text-sm ml-1" style={{ color: GP.strawberryInk }}>
              {t(erreur.cle)}
            </Text>
            {erreur.cause === "utilisee" && (
              <Bouton libelle={t("onboarding.invitation.allerALaConnexion")} variante="lien" onPress={onConnexion} />
            )}
          </View>
        )}
        <View className="mt-4" style={{ gap: 12 }}>
          <Bouton
            libelle={t("onboarding.invitation.continuer")}
            enCours={enCours}
            onPress={() => resoudre(saisie)}
            testID="invitation-continuer"
          />
          <Bouton
            libelle={t("onboarding.invitation.scanner")}
            variante="secondaire"
            desactive={enCours}
            icone={<ScanLine size={20} color={GP.clay} />}
            onPress={() => setScan(true)}
          />
        </View>
      </CadreDEcran>
      {scan && (
        <QRScannerScreen
          onScanned={(url) => {
            setScan(false);
            setSaisie(url);
            resoudre(url);
          }}
          onClose={() => setScan(false)}
        />
      )}
    </View>
  );
}

function CreateWeddingForm({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (data: {
    partner1Name: string | null;
    partner2Name: string | null;
    weddingDate: string | null;
  }) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [date, setDate] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const { enCours, lancer } = useEnvoi();

  const handleCreate = () => {
    if (!partner1.trim()) {
      setErreur(t("onboarding.partner1Required"));
      return;
    }
    setErreur(null);
    void lancer(
      () =>
        onCreate({
          partner1Name: partner1.trim() || null,
          partner2Name: partner2.trim() || null,
          weddingDate: date || null,
        }),
      (e) => setErreur(e instanceof Error ? e.message : String(e)),
    );
  };

  return (
    <CadreDEcran onRetour={onBack}>
      <PageHeader
        eyebrow={t("onboarding.createEyebrow")}
        title={t("onboarding.newWedding")}
        tagline={t("onboarding.createTagline")}
        titleSize={28}
        style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 8 }}
      />
      <Text className="text-base text-mute mb-8">{t("onboarding.compteApres")}</Text>

      <Text className="text-sm font-medium text-mute mb-1.5 ml-1">{t("onboarding.partner1Label")}</Text>
      <TextInput
        className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair mb-4"
        placeholder={t("onboarding.partnerPlaceholder")}
        placeholderTextColor="#C0C0C8"
        value={partner1}
        onChangeText={setPartner1}
        autoFocus
      />

      <Text className="text-sm font-medium text-mute mb-1.5 ml-1">{t("onboarding.partner2Label")}</Text>
      <TextInput
        className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair mb-4"
        placeholder={t("onboarding.partnerPlaceholder")}
        placeholderTextColor="#C0C0C8"
        value={partner2}
        onChangeText={setPartner2}
      />

      <View className="bg-accent-card rounded-xl px-4 border border-hair mb-1.5">
        <DateRow label={t("onboarding.dateLabel")} value={date} onChange={setDate} />
      </View>
      <Text className="text-xs text-mute mb-8 ml-1">{t("onboarding.dateHint")}</Text>

      <Bouton
        libelle={enCours ? t("onboarding.creating") : t("create")}
        enCours={enCours}
        onPress={handleCreate}
      />
      {erreur && (
        <Text accessibilityRole="alert" className="text-sm mt-3 text-center" style={{ color: GP.strawberryInk }}>
          {erreur}
        </Text>
      )}
    </CadreDEcran>
  );
}
