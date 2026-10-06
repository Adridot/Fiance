import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Text, TextInput, ActivityIndicator, Linking, Platform, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { shareLink } from "@/lib/share";
import { toast } from "@/lib/toast/sonner";
import { Sheet } from "@fiance/ui/components";
import { AlertCircle, Check, ChevronRight, Copy, Mail, MessageCircle, MessageSquare, QrCode, Share2 } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { theme } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Chip } from "@/components/Chip";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { roleCanWrite, FEATURE_SURFACES, type FeatureSurface, type RoleDefinition } from "@fiance/sdk";
// MODIFICATION LOCALE — réémission depuis la fiche d'un collaborateur.
import { ouvertureDeLaFeuille } from "@/lib/collaborateurs";
import { CIBLE_TACTILE } from "@/lib/cible-tactile";
import {
  LARGEUR_MINIMALE_POUR_LE_QR,
  prenomDe,
  tailleDuQR,
  urlEmail,
  urlSms,
  urlWhatsApp,
} from "@/lib/envoi-d-invitation";

interface InviteQRSheetProps {
  visible: boolean;
  onClose: () => void;
  generate: (roleId?: string, name?: string) => Promise<string>;
  /** MODIFICATION LOCALE — retire le dépôt du lien court avant son terme. */
  retirer?: (lien: string) => Promise<void>;
  /**
   * MODIFICATION LOCALE — réémission depuis la fiche d'un collaborateur.
   *
   * Quand le nom ET un rôle qui existe encore sont fournis, la feuille saute
   * l'étape de sélection et génère directement : le propriétaire ne retape pas
   * ce qu'il a déjà dit. Un rôle qui a été supprimé entre-temps ne se
   * pré-remplit pas — on retombe sur le sélecteur plutôt que d'émettre un lien
   * sans rôle résolu.
   */
  initialName?: string;
  initialRoleId?: string;
}

const DELAI_DE_GARDE_MS = 30_000;

type State = "selecting" | "generating" | "ready" | "error";

export function InviteQRSheet({
  visible,
  onClose,
  generate,
  retirer,
  initialName,
  initialRoleId,
}: InviteQRSheetProps) {
  const { t } = useTranslation("settings");
  const { width } = useWindowDimensions();
  const roles = usePermissionsStore((s) => s.roles);
  const [state, setState] = useState<State>("selecting");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState("");
  // MODIFICATION LOCALE — l'état du retrait de dépôt (bouton, puis confirmation).
  const [retrait, setRetrait] = useState<"idle" | "en-cours" | "fait" | "echec">("idle");

  const roleLabel = (r: RoleDefinition) => (r.isSystem ? t(r.name) : r.name);
  const surfaceLabel = (s: FeatureSurface) =>
    t(`surface${s.charAt(0).toUpperCase()}${s.slice(1)}`);
  const roleSummary = (r: RoleDefinition) => {
    const granted = FEATURE_SURFACES.filter((s) => r.matrix[s]);
    if (granted.length === 0) return t("roleNoAccessSummary");
    if (granted.length === FEATURE_SURFACES.length && granted.every((s) => r.matrix[s] === "edit")) {
      return t("roleFullAccess");
    }
    return granted.map(surfaceLabel).join(" · ");
  };

  const qrSize = tailleDuQR(width);
  const qrReplie = width < LARGEUR_MINIMALE_POUR_LE_QR;
  const [qrOuvert, setQrOuvert] = useState(false);
  const [copie, setCopie] = useState(false);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peutPartager =
    Platform.OS !== "web" || (typeof navigator !== "undefined" && typeof navigator.share === "function");

  // The last-picked role, so the error-state "retry" regenerates the same scope.
  const [roleId, setRoleId] = useState<string | undefined>(undefined);
  const nameValid = name.trim().length > 0;

  // Numéro de la tentative en cours : un résultat tardif d'une tentative abandonnée est ignoré.
  const tentative = useRef(0);

  const run = (selectedRoleId?: string, nomExplicite?: string) => {
    const nom = (nomExplicite ?? name).trim();
    if (!nom) return;
    setRoleId(selectedRoleId);
    setState("generating");
    setDetail("");
    const mienne = ++tentative.current;
    const echouer = (message: string) => {
      if (tentative.current !== mienne) return;
      tentative.current++;
      setDetail(message);
      setState("error");
    };
    const garde = setTimeout(() => echouer(t("inviteDelaiDepasse")), DELAI_DE_GARDE_MS);
    generate(selectedRoleId, nom || undefined)
      .then((link) => {
        clearTimeout(garde);
        if (tentative.current !== mienne) return;
        setUrl(link);
        setState("ready");
      })
      .catch((err: any) => {
        clearTimeout(garde);
        console.error("[invite] link generation failed:", err);
        echouer(err?.message ?? String(err));
      });
  };

  useEffect(() => {
    if (visible) {
      // MODIFICATION LOCALE — réémission : la décision vit dans
      // `ouvertureDeLaFeuille`, testable sans monter le composant.
      const ouverture = ouvertureDeLaFeuille(initialName, initialRoleId, roles);
      if (ouverture.nom) setName(ouverture.nom);
      if (ouverture.etat === "generating") { run(ouverture.roleId, ouverture.nom); return; }
      setState("selecting");
    } else {
      tentative.current++;
      setState("selecting");
      setUrl("");
      setDetail("");
      setRoleId(undefined);
      setName("");
      setRetrait("idle");
      setQrOuvert(false);
      setCopie(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialName, initialRoleId]);

  useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current); }, []);

  const message = t("inviteMessage", { prenom: prenomDe(name), lien: url });

  const copier = async () => {
    try {
      await Clipboard.setStringAsync(url);
    } catch {
      toast.error(t("common:error"));
      return;
    }
    setCopie(true);
    toast.success(t("linkCopied"));
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => setCopie(false), 2000);
  };

  const ouvrir = (adresse: string) => {
    // Sur le web, sms: et mailto: dans l'onglet courant : `_blank` laisserait un onglet vide.
    const ouverture =
      Platform.OS === "web" && !adresse.startsWith("http")
        ? (Linking as any).openURL(adresse, "_self")
        : Linking.openURL(adresse);
    Promise.resolve(ouverture).catch(() => toast.error(t("inviteOuvertureImpossible")));
  };

  const boutons: { cle: string; icone: React.ReactNode; libelle: string; onPress: () => void; plein?: boolean }[] = [
    {
      cle: "copier",
      icone: copie ? <Check size={17} color="#ffffff" /> : <Copy size={17} color="#ffffff" />,
      libelle: copie ? t("inviteCopie") : t("inviteCopier"),
      onPress: () => { void copier(); },
      plein: true,
    },
    {
      cle: "whatsapp",
      icone: <MessageCircle size={17} color={theme.ink} />,
      libelle: t("inviteWhatsApp"),
      onPress: () => ouvrir(urlWhatsApp(message)),
    },
    {
      cle: "sms",
      icone: <MessageSquare size={17} color={theme.ink} />,
      libelle: t("inviteSms"),
      onPress: () => ouvrir(urlSms(message)),
    },
    {
      cle: "email",
      icone: <Mail size={17} color={theme.ink} />,
      libelle: t("inviteEmail"),
      onPress: () => ouvrir(urlEmail(t("inviteSujet"), message)),
    },
    ...(peutPartager
      ? [{
          cle: "partager",
          icone: <Share2 size={17} color={theme.ink} />,
          libelle: t("invitePartager"),
          onPress: () => { void shareLink(url, message, t("linkCopied")); },
        }]
      : []),
  ];

  return (
    <Sheet visible={visible} onDismiss={onClose} backgroundColor={theme.card}>
      {/* paddingHorizontal: BottomSheet already adds 16px iOS insets; 8px adds a bit more breathing room.
          paddingTop: BottomSheet handles drag indicator + 16px top chrome — no extra top padding needed.
          Web fallback: these insets substitute for the BottomSheet chrome that only exists on native. */}
      <View style={{ backgroundColor: theme.card, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 40 }}>

        {state === "selecting" && (
          <>
            <View style={{ marginBottom: 18 }}>
              <Label color={theme.clay} style={{ marginBottom: 4 }}>{t("rolePickerEyebrow")}</Label>
              <Display size={21} weight="500" color={theme.ink}>
                {t("rolePickerTitle")}
              </Display>
              <Display size={13} color={theme.mute} style={{ marginTop: 3, lineHeight: 18 }}>
                {t("rolePickerSubtitle")}
              </Display>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Label color={theme.mute} style={{ marginBottom: 6 }}>{t("inviteNameLabel")}</Label>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t("inviteNamePlaceholder")}
                placeholderTextColor={theme.mute}
                autoCapitalize="words"
                returnKeyType="done"
                style={{
                  backgroundColor: theme.paper,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.hair,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: theme.ink,
                }}
              />
              {!nameValid && (
                <Text style={{ fontSize: 12, color: theme.mute, marginTop: 6 }}>
                  {t("inviteNameRequired")}
                </Text>
              )}
            </View>

            <View style={{ gap: 10 }}>
              {roles.map((r) => {
                const tone = r.isSystem ? theme.olive : theme.clay;
                const editable = roleCanWrite(r);
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => run(r.id)}
                    disabled={!nameValid}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 13,
                      backgroundColor: theme.paper,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: theme.hair,
                      paddingHorizontal: 14,
                      paddingVertical: 13,
                      opacity: !nameValid ? 0.45 : pressed ? 0.7 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: `${tone}1f`,
                        borderWidth: 1.5,
                        borderColor: `${tone}55`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Display size={18} weight="500" color={tone}>
                        {(roleLabel(r).trim()[0] ?? "?").toUpperCase()}
                      </Display>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Display size={16} weight="500" color={theme.ink} numberOfLines={1}>
                        {roleLabel(r)}
                      </Display>
                      <Display size={12} color={theme.mute} numberOfLines={1} style={{ marginTop: 1 }}>
                        {roleSummary(r)}
                      </Display>
                    </View>
                    <Chip color={editable ? theme.clay : theme.olive}>
                      <Label color={editable ? theme.clay : theme.olive}>
                        {editable ? t("roleCanEditLabel") : t("roleCanView")}
                      </Label>
                    </Chip>
                    <ChevronRight size={17} color={theme.mute} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {state === "generating" && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 16 }}>
            <ActivityIndicator size="large" color={theme.clay} />
            <Text style={{ fontSize: 14, color: theme.mute, textAlign: "center" }}>
              {t("inviteGenerating")}
            </Text>
          </View>
        )}

        {state === "ready" && (
          <>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, letterSpacing: -0.3 }}>
                {t("shareInviteLink")}
              </Text>
              <Text style={{ fontSize: 13, color: theme.mute, marginTop: 2, lineHeight: 18 }}>
                {t("inviteLienAide")}
              </Text>
            </View>

            <View style={{
              backgroundColor: theme.paper,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.hair,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 14,
            }}>
              <Text selectable style={{ fontSize: 14, color: theme.ink, lineHeight: 20 }}>
                {url}
              </Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {boutons.map((b) => (
                <Pressable
                  key={b.cle}
                  accessibilityRole="button"
                  onPress={b.onPress}
                  style={({ pressed }) => ({
                    flexGrow: 1,
                    // 120 : deux boutons par ligne dès 360 px, jamais d'icône rognée.
                    flexBasis: 120,
                    minHeight: 44,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    borderRadius: 14,
                    paddingHorizontal: 10,
                    backgroundColor: b.plein ? theme.clay : theme.paper,
                    borderWidth: 1,
                    borderColor: b.plein ? theme.clay : theme.hair,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <View style={{ flexShrink: 0 }}>{b.icone}</View>
                  <Text style={{ color: b.plein ? "#ffffff" : theme.ink, fontWeight: "600", fontSize: 14, flexShrink: 1 }}>
                    {b.libelle}
                  </Text>
                </Pressable>
              ))}
            </View>

            {qrReplie && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setQrOuvert((o) => !o)}
                style={({ pressed }) => ({
                  minHeight: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <QrCode size={17} color={theme.mute} />
                <Text style={{ fontSize: 14, color: theme.mute }}>
                  {qrOuvert ? t("inviteMasquerLeQR") : t("inviteAfficherLeQR")}
                </Text>
              </Pressable>
            )}

            {(!qrReplie || qrOuvert) && (
              <View style={{ alignItems: "center", marginTop: 4 }}>
                <View style={{
                  backgroundColor: "#ffffff",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.hair,
                }}>
                  <QRCode value={url} size={qrSize} ecl="M" />
                </View>
                <Text style={{ fontSize: 12, color: theme.mute, marginTop: 10, textAlign: "center" }}>
                  {t("scanFromOtherDevice")}
                </Text>
              </View>
            )}

            {/* MODIFICATION LOCALE — le dépôt est borné dans le temps, et le
                propriétaire peut le retirer avant son terme. Un lien retiré
                présente le message d'EXPIRATION, distinct de « non reconnue ». */}
            {retirer && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 12, color: theme.mute, textAlign: "center", marginBottom: 10 }}>
                  {t("depotDureeDeVie")}
                </Text>
                {retrait === "fait" ? (
                  <Text style={{ fontSize: 13, color: theme.olive, textAlign: "center" }}>
                    {t("depotRetire")}
                  </Text>
                ) : (
                  <>
                    <Pressable
                      disabled={retrait === "en-cours"}
                      onPress={() => {
                        setRetrait("en-cours");
                        retirer(url)
                          .then(() => setRetrait("fait"))
                          .catch(() => setRetrait("echec"));
                      }}
                      style={({ pressed }) => ({
                        borderRadius: 16,
                        paddingVertical: 14,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: theme.hair,
                        opacity: pressed || retrait === "en-cours" ? 0.6 : 1,
                      })}
                    >
                      <Text style={{ color: theme.strawberryInk, fontWeight: "600", fontSize: 15 }}>
                        {t("retirerLeDepot")}
                      </Text>
                    </Pressable>
                    {retrait === "echec" && (
                      <Text style={{ fontSize: 12, color: theme.mute, textAlign: "center", marginTop: 8 }}>
                        {t("depotRetraitEchoue")}
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}
          </>
        )}

        {state === "error" && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: "#fef2f2",
                alignItems: "center", justifyContent: "center",
              }}>
                <AlertCircle size={20} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink, flex: 1 }}>
                {t("inviteErrorTitle")}
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: theme.mute, lineHeight: 20, marginBottom: 16 }}>
              {t("inviteErrorBody")}
            </Text>

            {detail ? (
              <View style={{
                backgroundColor: theme.paper,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 24,
                overflow: "hidden",
              }}>
                <Text
                  selectable
                  numberOfLines={4}
                  style={{ fontSize: 11, color: theme.mute, lineHeight: 16 }}
                >
                  {detail}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 24 }} />
            )}

            <Pressable
              onPress={() => run(roleId)}
              style={({ pressed }) => ({
                backgroundColor: theme.clay,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
                marginBottom: 12,
              })}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {t("inviteRetry")}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ alignItems: "center", justifyContent: "center", minHeight: CIBLE_TACTILE, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ fontSize: 14, color: theme.mute }}>
                {t("cancel")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Sheet>
  );
}
