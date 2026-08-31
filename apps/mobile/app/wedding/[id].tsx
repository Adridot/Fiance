import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable } from "react-native-css/components";
import { Platform, Linking } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Clock, MapPin, HelpCircle, Calendar, Globe, CheckCircle2, Gift, ExternalLink, Download } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { type PublicWeddingPage } from "@/lib/public-page";
import { printPublicSchedule } from "@/lib/print-schedule";
import { type HouseholdRsvpDoc } from "@/lib/rsvp-sync";
// MODIFICATION LOCALE — la fusion d'une soumission partielle vit dans le SDK.
import { mergeHouseholdSubmission, formatGuestName } from "@fiance/sdk";
import { resolveServerUrl } from "@/lib/server";
import {
  decodeNodeInviteLink,
  readNodeWithLinkCap,
  writeNodeWithLinkCap,
  getSyncNamespace,
  DEFAULT_SYNC_NAMESPACE,
  type NodeInviteLinkToken,
} from "@fiance/sdk";

/**
 * Sync namespace: sourced from configureFiance() at boot; DEFAULT_SYNC_NAMESPACE
 * is the fallback. getSyncNamespace() throws (not returns undefined) before
 * configureFiance() has run, so the fallback needs a try/catch to actually apply.
 */
function syncNamespace(): string {
  try {
    return getSyncNamespace() ?? DEFAULT_SYNC_NAMESPACE;
  } catch {
    return DEFAULT_SYNC_NAMESPACE;
  }
}
import { decodeGuestLink } from "@/lib/guest-link";
import { TimelineItem } from "@/components/TimelineItem";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { ScriptButton } from "@/components/ScriptButton";
import { Seo } from "@/components/Seo";
import { BASE_URL } from "@/lib/seo-urls";
import { theme as GP } from "@/lib/theme";

function weddingSeoTitle(page: PublicWeddingPage, t: (key: string, opts?: Record<string, string>) => string): string {
  const names = [page.about.partner1Name, page.about.partner2Name].filter(Boolean).join(" & ");
  return names ? t("seo:weddingOf", { names }) : "Fiancé";
}

function weddingSeoDescription(page: PublicWeddingPage, t: (key: string) => string): string {
  return page.about.description || t("seo:defaultDescription");
}

function LangSwitch() {
  const currentLang = i18n.language;
  const toggle = () => i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");

  return (
    <Pressable
      onPress={toggle}
      className="flex-row items-center gap-1.5 self-end px-3 py-1.5 rounded-full bg-white/60 mr-4 mt-3"
    >
      <Globe size={13} color="#9CA3AF" />
      <Text className="text-xs font-medium text-mute uppercase tracking-wide">
        {currentLang === "fr" ? "EN" : "FR"}
      </Text>
    </Pressable>
  );
}

export default function WeddingPublicPage() {
  const { t } = useTranslation(["wedding-page", "seo"]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [page, setPage] = useState<PublicWeddingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notPublished, setNotPublished] = useState(false);
  // v3 RSVP state — populated when `id` is a combined guest link.
  const [isGuestLink, setIsGuestLink] = useState(false);
  const [rsvpToken, setRsvpToken] = useState<NodeInviteLinkToken | null>(null);
  // ─── MODIFICATION LOCALE — la réponse se donne par FOYER ──────────────────
  //
  // Le document porte une LISTE de membres, en nombre quelconque, et le
  // formulaire les présente TOUS sur un pied d'égalité : aucun n'est le
  // titulaire de la réponse et les autres ses accompagnants. Un foyer d'une
  // personne y est donc la même chose qu'un foyer de cinq, en plus court — pas
  // un cas particulier, et surtout pas un emplacement d'accompagnant vide.
  //
  // La saisie vit dans une carte par membre : `réponses` ne contient QUE les
  // membres effectivement renseignés, ce qui est précisément ce qu'une
  // soumission partielle doit envoyer. Les autres gardent leur état antérieur.
  const [rsvpSeed, setRsvpSeed] = useState<HouseholdRsvpDoc | null>(null);
  const [réponses, setRéponses] = useState<
    Record<string, { rsvpStatus: "ACCEPTED" | "DECLINED" | "MAYBE"; diet: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const serverUrl = resolveServerUrl();
        if (!serverUrl) { setError(true); return; }
        const baseUrl = serverUrl.replace(/\/v1\/?$/, "");

        // Decode first, separately from the network calls below — a decode failure means the
        // link itself is malformed, the one case that should show "invalid link".
        let combined: ReturnType<typeof decodeGuestLink> = null;
        let pageToken: NodeInviteLinkToken | null = null;
        try {
          combined = decodeGuestLink(id);
          if (!combined) pageToken = decodeNodeInviteLink(id);
        } catch {
          setError(true);
          return;
        }

        try {
          if (combined) {
            setIsGuestLink(true);
            // readNodeWithLinkCap returns the already-unwrapped content (json.data), not {data}.
            const result = await readNodeWithLinkCap(combined.page, { baseUrl, namespace: syncNamespace() }) as PublicWeddingPage | null;
            if (!result) { setNotPublished(true); return; }
            setPage(result);
            // Read rsvp node to get seed data (guest name, companion info) — best-effort, a
            // failure here must not undo the page content that already loaded above.
            try {
              const rsvpResult = await readNodeWithLinkCap(combined.rsvp, { baseUrl, namespace: syncNamespace() }) as HouseholdRsvpDoc | null;
              if (Array.isArray(rsvpResult?.members)) setRsvpSeed(rsvpResult);
            } catch { /* rsvp seed is optional, page still renders */ }
            setRsvpToken(combined.rsvp);
          } else if (pageToken) {
            const result = await readNodeWithLinkCap(pageToken, { baseUrl, namespace: syncNamespace() }) as PublicWeddingPage | null;
            if (result) {
              setPage(result);
            } else {
              setNotPublished(true);
            }
          }
        } catch {
          // The link decoded fine, so the wedding/space likely exists — a fetch/server failure
          // here reads as "details not available yet", not "invalid link" (reserved for decode
          // failures above).
          setNotPublished(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const about = page?.about;
  const timeline = page?.timeline ?? [];
  const faq = page?.faq ?? [];
  const publicGifts = (page?.gifts ?? []).filter((g) => !g.claimed);
  const events = page?.events ?? [];

  const coupleNames = [about?.partner1Name, about?.partner2Name].filter(Boolean).join(" & ");
  const formattedDate = about?.weddingDate
    ? safeFormat(new Date(about.weddingDate), "EEEE d MMMM yyyy", { locale: getDateLocale() })
    : null;

  const groupedTimeline = useMemo(() => {
    const groups: Record<string, typeof timeline> = {};
    timeline.forEach((item) => {
      const dateStr = item.date || about?.weddingDate || "";
      const key = dateStr
        ? safeFormat(new Date(dateStr + "T00:00:00"), "EEEE d MMMM yyyy", { locale: getDateLocale() })
        : "";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [timeline, about?.weddingDate]);
  const isMultiDay = Object.keys(groupedTimeline).length > 1;

  const handlePrintSchedule = useCallback(() =>
    printPublicSchedule(timeline, about ?? {}, {
      scheduleOf: t("scheduleOf"),
      until: (time: string) => t("until", { time }),
    }),
  [timeline, about, t]);

  if (!id) return <Redirect href="/" />;

  if (loading) {
    return (
      <View className="flex-1 bg-accent-cream items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#b96a4a" className="mt-4" />
        <Text className="text-sm text-mute mt-2">{t("loading")}</Text>
      </View>
    );
  }

  if (notPublished) {
    return (
      <View className="flex-1 bg-accent-cream items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.4 }}
          resizeMode="contain"
        />
        <Text className="text-base text-mute text-center mt-4">{t("notPublished")}</Text>
      </View>
    );
  }

  if (error || !page) {
    return (
      <View className="flex-1 bg-accent-cream items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.4 }}
          resizeMode="contain"
        />
        <Text className="text-base text-mute text-center mt-4">{t("error")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <Stack.Screen options={{ headerShown: false }} />
      <Seo
        title={weddingSeoTitle(page, t)}
        description={weddingSeoDescription(page, t)}
        canonical={isGuestLink ? undefined : `${BASE_URL}/wedding/${id}`}
        ogTitle={weddingSeoTitle(page, t)}
        ogDescription={weddingSeoDescription(page, t)}
        noindex={isGuestLink}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View className="w-full" style={{ maxWidth: 600 }}>
        <LangSwitch />
        {/* Hero */}
        <View className="items-center pt-8 pb-10 px-6">
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 72, height: 72, borderRadius: 18 }}
            resizeMode="contain"
          />

          {coupleNames ? (
            <View className="items-center mt-5" style={{ overflow: "visible" }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
                <View style={{ transform: [{ rotate: "-18deg" }], marginRight: 8, marginTop: 4, opacity: 0.7 }}>
                  <Sprig size={16} color="#c9922f" angle={0} />
                </View>
                <Label size={10} color="#c9922f">
                  {t("withJoy")}
                </Label>
                <View style={{ transform: [{ rotate: "18deg" }, { scaleX: -1 }], marginLeft: 8, marginTop: 4, opacity: 0.7 }}>
                  <Sprig size={16} color="#c9922f" angle={0} />
                </View>
              </View>
              <Display as="h1" size={36} italic style={{ textAlign: "center" }}>
                {coupleNames}
              </Display>
            </View>
          ) : null}

          {formattedDate && (
            <View className="flex-row items-center gap-2 mt-4 bg-white/70 px-4 py-2 rounded-full">
              <Calendar size={14} color="#C9956B" />
              <Text className="text-sm font-medium text-accent-gold capitalize">
                {formattedDate}
              </Text>
            </View>
          )}

          {about?.venueName && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <MapPin size={13} color="#9CA3AF" />
              <Text className="text-sm text-mute">{about?.venueName}</Text>
            </View>
          )}

          {about?.description && (
            <View className="mt-5 bg-white/60 rounded-2xl px-5 py-4 max-w-md">
              <Text className="text-sm text-mute text-center leading-5 italic">
                {about?.description}
              </Text>
            </View>
          )}

          {/* Decorative divider */}
          <View className="flex-row items-center gap-3 mt-6">
            <View className="h-px flex-1 bg-accent-rose-light" />
            <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
            <View className="h-px flex-1 bg-accent-rose-light" />
          </View>
        </View>

        {/* Events (v2: multi-venue/day) */}
        {events.length > 0 && (
          <View className="mt-2 pb-4 px-5">
            <View className="flex-row items-center gap-2 mb-4">
              <MapPin size={18} color="#C9956B" />
              <Display size={20} italic>{t("events")}</Display>
            </View>
            {events.map((e) => (
              <View key={e.id} className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Text className="text-base font-semibold text-ink">{e.title}</Text>
                <Text className="text-xs text-mute mt-0.5">
                  {safeFormat(new Date(e.date), "EEEE d MMMM", { locale: getDateLocale() })}
                  {e.time ? ` · ${e.time}` : ""}
                </Text>
                {e.venueName && (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <MapPin size={12} color="#C9956B" />
                    <Text className="text-xs text-accent-gold font-medium">
                      {e.venueName}{e.address ? ` — ${e.address}` : ""}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <View className="mt-2 pb-4">
            <View className="flex-row items-center gap-2 px-5 mb-4">
              <Clock size={18} color="#C9956B" />
              <Display size={20} italic style={{ flex: 1 }}>
                {t("timeline")}
              </Display>
              <Pressable
                onPress={handlePrintSchedule}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 active:opacity-70"
              >
                <Download size={13} color="#C9956B" />
                <Text className="text-xs font-medium text-accent-gold">
                  {t("printSchedule")}
                </Text>
              </Pressable>
            </View>
            <View className="px-4">
              {Object.entries(groupedTimeline).map(([dateLabel, dateItems]) => (
                <View key={dateLabel}>
                  {isMultiDay && dateLabel ? (
                    <View className="mt-3 mb-3 px-1">
                      <Text className="text-sm font-semibold text-accent-gold uppercase tracking-wider capitalize">
                        {dateLabel}
                      </Text>
                    </View>
                  ) : null}
                  {dateItems.map((item, idx) => (
                    <TimelineItem
                      key={item.id}
                      left={
                        <Display size={14} weight="500" color="#c9922f" style={{ marginTop: 14 }}>
                          {item.time}
                        </Display>
                      }
                      showConnector={idx < dateItems.length - 1}
                    >
                      <View className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                        <Text className="text-base font-semibold text-ink">
                          {item.title}
                        </Text>
                        {item.endTime && (
                          <Text className="text-xs text-mute mt-0.5">
                            {t("until", { time: item.endTime })}
                          </Text>
                        )}
                        {item.location && (
                          <View className="flex-row items-center gap-1.5 mt-2">
                            <MapPin size={12} color="#C9956B" />
                            <Text className="text-xs text-accent-gold font-medium">{item.location}</Text>
                          </View>
                        )}
                      </View>
                    </TimelineItem>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {timeline.length === 0 && (
          <View className="items-center justify-center py-16 px-6">
            <Clock size={40} color="#E8D5C0" />
            <Text className="text-sm text-mute text-center mt-3">{t("noTimeline")}</Text>
          </View>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <View className="mt-4 px-4 pb-6">
            {/* Decorative divider */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <HelpCircle size={18} color="#C9956B" />
              <Display size={20} italic>
                {t("faq")}
              </Display>
            </View>

            {faq.map((item, index) => (
              <View
                key={index}
                className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm"
                style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <Text className="text-base font-semibold text-ink">
                  {item.question}
                </Text>
                <Text className="text-sm text-mute mt-1.5 leading-5">
                  {item.answer}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Gift registry */}
        {publicGifts.length > 0 && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <Gift size={18} color="#C9956B" />
              <Display size={20} italic>
                {t("giftRegistry")}
              </Display>
            </View>

            {publicGifts.map((gift) => (
              <Pressable
                key={gift.id}
                onPress={gift.url ? () => Linking.openURL(gift.url!) : undefined}
                className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm"
                style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">{gift.title}</Text>
                    {gift.description && (
                      <Text className="text-sm text-mute mt-1 leading-5">{gift.description}</Text>
                    )}
                    {gift.price != null && (
                      <Text className="text-sm font-medium text-accent-gold mt-1.5">{gift.price} €</Text>
                    )}
                  </View>
                  {gift.url && (
                    <View className="ml-3 mt-0.5">
                      <ExternalLink size={16} color="#C9956B" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* RSVP — only shown for per-guest combined links */}
        {rsvpToken && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <Calendar size={18} color="#C9956B" />
              <Display size={20} italic>{t("rsvp")}</Display>
            </View>

            {submitted ? (
              <View className="bg-accent-card rounded-2xl p-6 items-center shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-3">
                  <CheckCircle2 size={40} color="#10B981" />
                </View>
                <Display size={20} italic style={{ textAlign: "center" }}>{t("rsvpSuccess")}</Display>
                <Text className="text-sm text-mute mt-1 text-center">
                  {(rsvpSeed?.members ?? []).map(formatGuestName).filter(Boolean).join(" · ")}
                </Text>
              </View>
            ) : (
              <View className="bg-accent-card rounded-2xl p-4 shadow-sm" style={{ shadowColor: GP.clay, shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <Text className="text-sm text-mute mb-3">{t("rsvpHouseholdIntro")}</Text>

                {(rsvpSeed?.members ?? []).map((membre, i) => {
                  const choix = réponses[membre.guestId];
                  // MODIFICATION LOCALE — la composition du SDK, particule
                  // comprise : le document du foyer porte désormais
                  // `nameParticle`, ce qui n'était pas le cas des deux
                  // emplacements nommés qu'il remplace. La page publique cesse
                  // donc d'être une exception à « un nom se compose à un seul
                  // endroit » (voir `__tests__/no-raw-guest-name.test.ts`).
                  const nom = formatGuestName(membre);
                  // Le cadre n'est montré que lorsque les membres n'en relèvent
                  // pas tous du même : le dire à un foyer homogène n'apprendrait
                  // rien et alourdirait chaque carte.
                  const cadres = new Set((rsvpSeed?.members ?? []).map((m) => m.invitationType));
                  const montrerCadre = cadres.size > 1 && membre.invitationType;
                  return (
                    <View key={membre.guestId} className={i > 0 ? "mt-5 pt-5 border-t border-accent-paper" : ""}>
                      <Text className="text-base font-semibold text-ink">
                        {nom || t("rsvpMemberUnnamed")}
                      </Text>
                      {montrerCadre && (
                        <Text className="text-xs text-mute mb-2">
                          {membre.invitationLabel ?? membre.invitationType}
                        </Text>
                      )}
                      {membre.respondedAt && !choix && (
                        <Text className="text-xs text-mute mb-2">{t("rsvpAlreadyAnswered")}</Text>
                      )}

                      <Text className="text-sm text-mute mb-2 mt-1">{t("rsvpAttendance")}</Text>
                      <View className="flex-row gap-2 mb-3">
                        {(["ACCEPTED", "DECLINED", "MAYBE"] as const).map((s) => {
                          const labels = { ACCEPTED: t("rsvpYes"), DECLINED: t("rsvpNo"), MAYBE: t("rsvpMaybe") };
                          const colors = { ACCEPTED: "#10B981", DECLINED: "#EF4444", MAYBE: "#3B82F6" };
                          const actif = (choix?.rsvpStatus ?? membre.rsvpStatus) === s;
                          return (
                            <Pressable
                              key={s}
                              onPress={() =>
                                setRéponses((r) => ({
                                  ...r,
                                  [membre.guestId]: {
                                    rsvpStatus: s,
                                    diet: r[membre.guestId]?.diet ?? membre.diet ?? "STANDARD",
                                  },
                                }))
                              }
                              className={`flex-1 py-2.5 rounded-xl items-center border ${actif ? "border-transparent" : "border-hair"}`}
                              style={actif ? { backgroundColor: colors[s] } : undefined}
                            >
                              <Text className={`text-sm font-semibold ${actif ? "text-white" : "text-mute"}`}>
                                {labels[s]}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {(choix?.rsvpStatus ?? membre.rsvpStatus) === "ACCEPTED" && (
                        <>
                          <Text className="text-sm text-mute mb-2">{t("rsvpDiet")}</Text>
                          <View className="flex-row flex-wrap gap-2">
                            {Object.entries((t("rsvpDiets", { returnObjects: true }) as Record<string, string>)).map(([key, label]) => {
                              const actif = (choix?.diet ?? membre.diet ?? "STANDARD") === key;
                              return (
                                <Pressable
                                  key={key}
                                  onPress={() =>
                                    setRéponses((r) => ({
                                      ...r,
                                      [membre.guestId]: {
                                        rsvpStatus:
                                          r[membre.guestId]?.rsvpStatus ??
                                          (membre.rsvpStatus as "ACCEPTED") ??
                                          "ACCEPTED",
                                        diet: key,
                                      },
                                    }))
                                  }
                                  className={`px-3 py-1.5 rounded-full border ${actif ? "bg-primary-500 border-primary-500" : "border-hair bg-white"}`}
                                >
                                  <Text className={`text-sm ${actif ? "text-white font-medium" : "text-mute"}`}>
                                    {label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </>
                      )}
                    </View>
                  );
                })}

                {Object.keys(réponses).length > 0 && (
                  <>
                    <View className="h-4" />
                    <ScriptButton
                      disabled={submitting}
                      onPress={async () => {
                        if (submitting || !rsvpToken || !rsvpSeed) return;
                        setSubmitting(true);
                        // La soumission ne porte QUE les membres renseignés : les
                        // autres gardent leur état antérieur et ne sont pas tenus
                        // pour ayant décliné. `mergeHouseholdSubmission` (SDK) est
                        // ce qui le garantit, et c'est lui qui compose le document.
                        const doc = mergeHouseholdSubmission(rsvpSeed, {
                          submittedAt: new Date().toISOString(),
                          members: Object.entries(réponses).map(([guestId, r]) => ({
                            guestId,
                            rsvpStatus: r.rsvpStatus,
                            diet: r.rsvpStatus === "ACCEPTED" ? r.diet : undefined,
                          })),
                        });
                        let ok = false;
                        const serverUrl = resolveServerUrl();
                        if (serverUrl) {
                          try {
                            const baseUrl = serverUrl.replace(/\/v1\/?$/, "");
                            await writeNodeWithLinkCap(rsvpToken, doc as unknown as Record<string, unknown>, { baseUrl, namespace: syncNamespace() });
                            ok = true;
                          } catch { ok = false; }
                        }
                        setSubmitting(false);
                        if (ok) {
                          // Le lien reste utilisable : le document local est mis à
                          // jour pour qu'une correction reparte de ce qui vient
                          // d'être envoyé, et non de l'état d'avant.
                          setRsvpSeed(doc);
                          setRéponses({});
                          setSubmitted(true);
                          setSubmitError(false);
                        } else {
                          setSubmitError(true);
                        }
                      }}
                      style={{ opacity: submitting ? 0.5 : 1 }}
                    >
                      {submitting ? "..." : t("rsvpSubmit")}
                    </ScriptButton>
                    {submitError && (
                      <Text className="text-sm text-red-500 text-center mt-2">{t("rsvpError")}</Text>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View className="items-center pb-10 pt-4">
          <View className="flex-row items-center gap-3 mb-4 px-8">
            <View className="h-px flex-1 bg-accent-rose-light" />
            <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
            <View className="h-px flex-1 bg-accent-rose-light" />
          </View>
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 28, height: 28, borderRadius: 6, opacity: 0.3 }}
            resizeMode="contain"
          />
          <Text className="text-xs text-mute mt-1">Fiancé</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

export async function generateStaticParams() { return []; }
