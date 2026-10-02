import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, Heart, PlusCircle } from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { PageHeader } from "@/components/PageHeader";
import { InvitationDejaAcceptee } from "@/components/InvitationDejaAcceptee";
import { Bouton } from "@/components/compte/Bouton";
import { CadreDEcran } from "@/components/compte/CadreDEcran";
import { FormulaireDeConnexion } from "@/components/compte/FormulaireDeConnexion";
import { FormulaireDeCreationDeCompte } from "@/components/compte/FormulaireDeCreationDeCompte";
import { analytics } from "@/lib/analytics";
import { baseDeSync } from "@/lib/base-de-sync";
import { creerMonCompte, ouvrirUneSession } from "@/lib/compte-session";
import { consommer as consommerLeDepot } from "@/lib/invitation-courte";
import { joinWeddingByToken } from "@/lib/join-space";
import { etapeDuParcours, sequenceDeCreationDeCompte, sequenceDeJonction } from "@/lib/parcours-d-invitation";
import type { ResolutionDInvitation } from "@/lib/resolution-d-invitation";
import { theme as GP } from "@/lib/theme";
import { useAccesChiffreStore } from "@/store/useAccesChiffreStore";
import { useParcoursDAccueilStore } from "@/store/useParcoursDAccueilStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

type Resolution = Extract<ResolutionDInvitation, { jeton: unknown }>;

type Etat = { type: "repos" } | { type: "en-cours"; texte: string } | { type: "erreur"; message: string };

type Onglet = "creer" | "connexion";

interface Props {
  resolution: Resolution;
  onRetour: () => void;
}

export function ParcoursDInvitation({ resolution, onRetour }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { jeton, nomDuMariage, nomDeLaPersonne, code } = resolution;
  const nom = nomDuMariage ?? jeton.spaceName;

  const registre = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const illisible = useAccesChiffreStore((s) => Object.keys(s.illisibles).length > 0);

  const [etat, setEtat] = useState<Etat>({ type: "repos" });
  const [onglet, setOnglet] = useState<Onglet>("creer");
  const [identifiant, setIdentifiant] = useState(nomDeLaPersonne ?? "");
  const derniere = useRef<{ texte: string; tache: () => Promise<void> } | null>(null);

  useEffect(() => {
    useParcoursDAccueilStore.getState().poser(true);
    return () => useParcoursDAccueilStore.getState().poser(false);
  }, []);

  const lancer = useCallback(
    async (texte: string, tache: () => Promise<void>) => {
      derniere.current = { texte, tache };
      setEtat({ type: "en-cours", texte });
      try {
        await tache();
        router.replace("/home" as any);
      } catch (err) {
        setEtat({ type: "erreur", message: err instanceof Error ? err.message : String(err) });
      }
    },
    [router],
  );

  const joindre = async () => {
    await joinWeddingByToken(jeton, { nomDuMariage });
  };
  const consommer = async () => {
    if (code) await consommerLeDepot(baseDeSync(), code);
  };

  if (etat.type !== "repos") {
    if (illisible) {
      return (
        <View className="flex-1 bg-accent-paper justify-center px-6">
          <View className="items-center mb-10">
            <AlertCircle size={36} color={GP.mustard} />
          </View>
          <PageHeader
            eyebrow={t("join.inviteEyebrow")}
            title={t("join.invitationIncomplete")}
            tagline={t("join.espaceRejointIllisible")}
            titleSize={24}
            style={{ paddingHorizontal: 0, paddingTop: 0 }}
          />
        </View>
      );
    }
    if (etat.type === "erreur") {
      return (
        <View className="flex-1 bg-accent-paper justify-center px-6">
          <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
            <View className="items-center mb-8">
              <AlertCircle size={36} color="#EF4444" />
            </View>
            <PageHeader
              eyebrow={t("join.eyebrow")}
              title={t("onboarding.inviteFailed")}
              tagline={etat.message}
              titleSize={24}
              style={{ paddingHorizontal: 0, paddingTop: 0, marginBottom: 24 }}
            />
            <View style={{ gap: 12 }}>
              <Bouton
                libelle={t("join.reessayer")}
                onPress={() => derniere.current && void lancer(derniere.current.texte, derniere.current.tache)}
              />
              <Bouton libelle={t("back")} variante="secondaire" onPress={() => setEtat({ type: "repos" })} />
            </View>
          </View>
        </View>
      );
    }
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center px-6" testID="parcours-en-cours">
        <ActivityIndicator size="large" color={GP.clay} />
        <Text className="text-base text-mute mt-4 text-center">{etat.texte}</Text>
      </View>
    );
  }

  const etape = etapeDuParcours(registre, jeton.spaceId);

  if (etape === "deja-acceptee") {
    return (
      <InvitationDejaAcceptee
        weddingName={nom}
        onContinuer={() => {
          void (async () => {
            const existant = registre?.weddings.find((w) => w.spaceId === jeton.spaceId);
            if (existant) await switchWedding(existant.id);
            router.replace("/home" as any);
          })();
        }}
      />
    );
  }

  if (etape === "confirmer") {
    return (
      <View className="flex-1 bg-accent-paper justify-center px-6">
        <Seo title="Fiancé" description="" noindex />
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
              <Heart size={36} color={GP.clay} />
            </View>
            <PageHeader
              eyebrow={t("join.inviteEyebrow")}
              title={t("join.joinThisWedding")}
              tagline={nom}
              titleSize={26}
              style={{ paddingHorizontal: 0, paddingTop: 0 }}
            />
            <Text className="text-base text-mute mt-2 text-center">
              {t("join.alreadyHaveWedding")}
              {"\n"}
              {t("join.confirmJoin", { name: nom ? ` (${nom})` : "" })}
            </Text>
          </View>
          <View style={{ gap: 12 }}>
            <Bouton
              libelle={t("join.yesJoin")}
              icone={<PlusCircle size={20} color="#fff" />}
              onPress={() => void lancer(t("join.jonctionEnCours"), () => sequenceDeJonction({ joindre, consommer }))}
            />
            <Bouton
              libelle={t("join.noGoBack")}
              variante="secondaire"
              icone={<ArrowLeft size={20} color={GP.clay} />}
              onPress={onRetour}
            />
          </View>
        </View>
      </View>
    );
  }

  const creer = (id: string, mdp: string) =>
    lancer(t("join.creationEnCours"), async () => {
      setIdentifiant(id);
      await sequenceDeCreationDeCompte(
        {
          joindre: async () => {
            await joindre();
            analytics.capture("wedding_created", { method: "invite" });
          },
          creerLeCompte: creerMonCompte,
          ouvrirUneSession,
          consommer,
        },
        id,
        mdp,
      );
    });

  const onglets: { cle: Onglet; libelle: string }[] = [
    { cle: "creer", libelle: t("join.ongletCreer") },
    { cle: "connexion", libelle: t("join.ongletConnexion") },
  ];

  return (
    <CadreDEcran onRetour={onRetour}>
      {/* Sans icône : sur un téléphone de 659 px, le bouton du formulaire doit tenir à l'écran. */}
      <View className="items-center mb-4">
        <PageHeader
          eyebrow={t("join.inviteEyebrow")}
          title={t("join.inviteATitre")}
          tagline={nom}
          titleSize={26}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
      </View>

      <View accessibilityRole="tablist" className="flex-row bg-accent-card border border-hair rounded-xl p-1 mb-4">
        {onglets.map(({ cle, libelle }) => {
          const actif = onglet === cle;
          return (
            <Pressable
              key={cle}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              onPress={() => setOnglet(cle)}
              className="items-center justify-center rounded-lg"
              style={{ flex: 1, minHeight: 44, backgroundColor: actif ? GP.clay : "transparent" }}
            >
              <Text className={actif ? "text-white font-semibold text-sm" : "text-ink font-medium text-sm"}>{libelle}</Text>
            </Pressable>
          );
        })}
      </View>

      {onglet === "creer" ? (
        <FormulaireDeCreationDeCompte
          libelleDuBouton={t("join.boutonRejoindre")}
          identifiantInitial={identifiant}
          onCreer={creer}
        />
      ) : (
        <FormulaireDeConnexion identifiantInitial={identifiant} />
      )}
    </CadreDEcran>
  );
}
