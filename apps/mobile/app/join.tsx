import { useState, useCallback, useEffect, useMemo } from "react";
import { View, ActivityIndicator } from "react-native-css/components";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { parseSpaceInviteUrl } from "@/lib/identity";
import { theme as GP } from "@/lib/theme";
import { InvitationNonReconnue } from "@/components/InvitationNonReconnue";
import { ParcoursDInvitation } from "@/components/invitation/ParcoursDInvitation";
import {
  resoudreLInvitation,
  resoudreLeCode,
  type CauseDEchec,
  type ResolutionDInvitation,
} from "@/lib/resolution-d-invitation";
import { baseDeSync } from "@/lib/base-de-sync";

type Reussite = Extract<ResolutionDInvitation, { jeton: unknown }>;

// Captured at module-load time — before Expo Router mounts and rewrites web
// history (replaceState strips the fragment). null on native (no window).
const bootHref = typeof window !== "undefined" ? window.location.href : null;

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
  const tokenLong = useMemo(() => (url ? parseSpaceInviteUrl(url) : null), [url]);

  // La forme COURTE demande un aller-retour : le fragment ne porte que la clé.
  const [resolutionCourte, setResolutionCourte] = useState<Reussite | null>(null);
  const [cause, setCause] = useState<CauseDEchec | null>(null);
  const [resolutionEnCours, setResolutionEnCours] = useState(false);
  const router = useRouter();

  const appliquer = useCallback((r: ResolutionDInvitation) => {
    if ("jeton" in r) setResolutionCourte(r);
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

  // Still resolving the initial URL — avoid flashing the error screen
  if (url === undefined || resolutionEnCours) {
    return (
      <View className="flex-1 bg-accent-paper items-center justify-center">
        <ActivityIndicator size="large" color={GP.clay} />
      </View>
    );
  }

  const resolution: Reussite | null = tokenLong ? { jeton: tokenLong } : resolutionCourte;

  // Aucune invitation reconnue : on DIT pourquoi, et on offre le second chemin.
  if (!resolution) {
    return <InvitationNonReconnue cause={cause ?? "invalide"} onCode={saisirLeCode} />;
  }

  return <ParcoursDInvitation resolution={resolution} onRetour={() => router.replace("/" as any)} />;
}
