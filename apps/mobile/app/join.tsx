import { useState, useCallback, useEffect, useMemo } from "react";
import { Seo } from "@/components/Seo";
import { View, Text, Pressable, ActivityIndicator, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { Heart, PlusCircle, ArrowLeft, AlertCircle } from "lucide-react-native";
import { Display } from "@/components/Display";
import { PageHeader } from "@/components/PageHeader";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { parseSpaceInviteUrl } from "@/lib/identity";
import { joinWeddingByToken } from "@/lib/join-space";
import type { SpaceInviteLinkToken } from "@fiance/sdk";
import { theme as GP } from "@/lib/theme";
// MODIFICATION LOCALE — la forme courte du lien, et l'état « lecture impossible ».
import { InvitationNonReconnue } from "@/components/InvitationNonReconnue";
import { InvitationDejaAcceptee } from "@/components/InvitationDejaAcceptee";
import {
  resoudreLInvitation,
  resoudreLeCode,
  type CauseDEchec,
} from "@/lib/resolution-d-invitation";
import { normalizeSyncBase, resolveServerUrl } from "@/lib/server";
import { useAccesChiffreStore } from "@/store/useAccesChiffreStore";

// Captured at module-load time — before Expo Router mounts and rewrites web
// history (replaceState strips the fragment). null on native (no window).
const bootHref = typeof window !== "undefined" ? window.location.href : null;

/** La base de sync, pour aller chercher un dépôt avant d'avoir la moindre identité. */
function baseDeSync(): string {
  return normalizeSyncBase(resolveServerUrl() ?? "https://mariage.didot.io/sync");
}

export default function JoinScreen() {
  // undefined = still resolving; null = resolved but no URL; string = resolved URL
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    // On web, bootHref is captured before Expo Router rewrites history (strips #fragment).
    // On native, fall back to getInitialURL() which receives the deep-link URL from the OS.
    if (bootHref) setUrl(bootHref);
    else Linking.getInitialURL().then((u) => setUrl(u ?? null));
    const sub = Linking.addEventListener("url", ({ url: incoming }) => setUrl(incoming));
    return () => sub.remove();
  }, []);

  // Le format LONG porte le jeton en clair dans le fragment : il se lit sans réseau.
  const tokenLong = useMemo<SpaceInviteLinkToken | null>(
    () => (url ? parseSpaceInviteUrl(url) : null),
    [url],
  );

  // La forme COURTE demande un aller-retour : le fragment ne porte que la clé.
  const [tokenCourt, setTokenCourt] = useState<SpaceInviteLinkToken | null>(null);
  const [cause, setCause] = useState<CauseDEchec | null>(null);
  const [resolutionEnCours, setResolutionEnCours] = useState(false);

  const appliquer = useCallback((r: Awaited<ReturnType<typeof resoudreLInvitation>>) => {
    if ("jeton" in r) setTokenCourt(r.jeton);
    else setCause(r.cause);
  }, []);

  const saisirLeCode = useCallback(async (code: string, cle: string) => {
    setResolutionEnCours(true);
    setCause(null);
    appliquer(await resoudreLeCode(baseDeSync(), code, cle));
    setResolutionEnCours(false);
  }, [appliquer]);

  useEffect(() => {
    if (!url || tokenLong) return;
    let vivant = true;
    setResolutionEnCours(true);
    resoudreLInvitation(baseDeSync(), url, null).then((r) => {
      if (!vivant) return;
      appliquer(r);
      setResolutionEnCours(false);
    });
    return () => { vivant = false; };
  }, [url, tokenLong, appliquer]);

  const token = tokenLong ?? tokenCourt;

  const registry = useWeddingRegistryStore((s) => s.registry);
  const switchWedding = useWeddingRegistryStore((s) => s.switchWedding);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  const joinAndNavigate = useCallback(async (t: SpaceInviteLinkToken) => {
    await joinWeddingByToken(t);
    router.replace("/home" as any);
  }, [router]);

  // MODIFICATION LOCALE — bascule vers un espace déjà rejoint, sur demande.
  const rejoindreLEspaceConnu = useCallback(async (sid: string) => {
    const existant = registry?.weddings.find((w) => w.spaceId === sid);
    if (existant) await switchWedding(existant.id);
    router.replace("/home" as any);
  }, [registry, switchWedding, router]);

  // Still resolving the initial URL — avoid flashing the error screen
  if (url === undefined || resolutionEnCours) {
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center">
        <ActivityIndicator size="large" color={GP.clay} />
      </View>
    );
  }

  // Aucune invitation reconnue : on DIT pourquoi, et on offre le second chemin.
  if (!token) {
    return <InvitationNonReconnue cause={cause ?? "invalide"} onCode={saisirLeCode} />;
  }

  const alreadyJoined = registry?.weddings.some((w) => w.spaceId === token.spaceId);
  const hasWeddings = registry != null && registry.weddings.length > 0;

  // MODIFICATION LOCALE — on le DIT, on ne redirige plus en silence.
  if (alreadyJoined) {
    return (
      <InvitationDejaAcceptee
        weddingName={token.spaceName}
        onContinuer={() => { void rejoindreLEspaceConnu(token.spaceId); }}
      />
    );
  }

  // Always show the confirmation screen before joining — lets the user review
  // the wedding name and decide. First-time users see a simpler prompt;
  // users with existing weddings see the conflict warning too.
  if (!confirmed) {
    return (
      <ConfirmJoin
        weddingName={token.spaceName}
        hasOtherWeddings={hasWeddings}
        onConfirm={() => setConfirmed(true)}
      />
    );
  }

  return <AutoJoin token={token} onJoin={joinAndNavigate} />;
}

function AutoJoin({
  token,
  onJoin,
}: {
  token: SpaceInviteLinkToken;
  onJoin: (token: SpaceInviteLinkToken) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const [error, setError] = useState<string | null>(null);
  // MODIFICATION LOCALE — une invitation n'aboutit pas quand elle rattache à un
  // espace dont le contenu reste illisible : on le dit ici plutôt que de
  // conduire la personne vers un mariage qui paraît vide.
  const illisible = useAccesChiffreStore((s) => Object.keys(s.illisibles).length > 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onJoin(token).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err));
    });
  }, []);

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

  if (error) {
    return (
      <View className="flex-1 bg-accent-paper justify-center px-6">
        <View className="items-center mb-10">
          <AlertCircle size={36} color="#EF4444" />
        </View>
        <PageHeader
          eyebrow={t("join.eyebrow")}
          title={t("onboarding.inviteFailed")}
          tagline={error}
          titleSize={24}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-paper items-center justify-center">
      <ActivityIndicator size="large" color={GP.clay} />
    </View>
  );
}

function ConfirmJoin({
  weddingName,
  hasOtherWeddings,
  onConfirm,
}: {
  weddingName?: string;
  hasOtherWeddings: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <View className="flex-1 bg-accent-paper justify-center px-6">
      <Seo title="Fiancé" description="" noindex />
      <View className="items-center mb-10">
        <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-5">
          <Heart size={36} color={GP.clay} />
        </View>
        <PageHeader
          eyebrow={t("join.inviteEyebrow")}
          title={t("join.joinThisWedding")}
          tagline={weddingName}
          titleSize={26}
          style={{ paddingHorizontal: 0, paddingTop: 0 }}
        />
        {hasOtherWeddings && (
          <Text className="text-base text-mute mt-2 text-center">
            {t("join.alreadyHaveWedding")}{"\n"}
            {t("join.confirmJoin", { name: weddingName ? ` (${weddingName})` : "" })}
          </Text>
        )}
        {!hasOtherWeddings && (
          <Text className="text-base text-mute mt-2 text-center">
            {t("join.joinThisWeddingFirst")}
          </Text>
        )}
      </View>

      <Pressable
        onPress={onConfirm}
        className="bg-primary-500 rounded-2xl py-4 items-center mb-3 active:bg-primary-600"
      >
        <View className="flex-row items-center">
          <PlusCircle size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">
            {t("join.yesJoin")}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/" as any)}
        className="bg-accent-card rounded-2xl py-4 items-center border border-hair active:opacity-80"
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} color={GP.clay} />
          <Text className="text-ink font-semibold text-base ml-2">
            {t("join.noGoBack")}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
