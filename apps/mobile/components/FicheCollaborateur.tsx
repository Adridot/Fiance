import { View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { RefreshCw, Trash2 } from "lucide-react-native";

import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { theme } from "@/lib/theme";
import type { Collaborateur } from "@/lib/collaborateurs";

/**
 * Une personne, et les liens qu'elle détient.
 *
 * Une fiche par PERSONNE, pas par lien : les liens successifs émis pour
 * quelqu'un ne sont pas des collaborateurs différents. La fiche dit combien de
 * liens sont actifs et depuis quand chacun existe — c'est ce qui rend visible,
 * entre autres, la fusion de deux homonymes.
 *
 * Elle dit aussi ce que l'application ne sait PAS faire : un lien déjà émis
 * n'est pas conservé, donc pas recopiable. Un bouton absent se lit comme une
 * panne ; une phrase, non.
 */
export function FicheCollaborateur({
  collaborateur,
  roleLabel,
  roles,
  onRegenerer,
  onChangerDeRole,
  onRevoquerLien,
}: {
  collaborateur: Collaborateur;
  /** L'intitulé du rôle, résolu par l'appelant (les rôles système sont traduits). */
  roleLabel: string;
  /** Les rôles proposables. Changer le rôle vaut pour TOUS les liens de la personne. */
  roles: { id: string; label: string }[];
  onRegenerer: () => void;
  onChangerDeRole: (roleId: string) => void;
  /** Révoque UN lien. L'appareil qui s'en sert perd son accès. */
  onRevoquerLien: (assignmentId: string, subjectUserId: string, dernier: boolean) => void;
}) {
  const { t } = useTranslation("settings");
  const liens = collaborateur.liens;
  const sansNom = collaborateur.nom === null;

  const dateCourte = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("fr-FR");
  };

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.hair,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Monogramme label={collaborateur.nom ?? "?"} />
        <View style={{ flex: 1 }}>
          <Display size={16} weight="500" color={sansNom ? theme.mute : theme.ink} numberOfLines={1}>
            {collaborateur.nom ?? t("collaborateurSansNom")}
          </Display>
          <Display size={12.5} color={theme.mute} numberOfLines={1} style={{ marginTop: 1 }}>
            {roleLabel}
            {" · "}
            {liens.length === 1 ? t("liensActifsUn") : t("liensActifsPlusieurs", { count: liens.length })}
          </Display>
        </View>
      </View>

      {sansNom && (
        <Display size={11.5} color={theme.mute} style={{ lineHeight: 16 }}>
          {t("collaborateurSansNomAide")}
        </Display>
      )}

      {/* Le rôle appartient à la PERSONNE : le changer vaut pour tous ses liens,
          sans quoi ses deux appareils divergeraient. */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {roles.map((r) => {
          const actif = r.id === collaborateur.roleId;
          return (
            <Pressable
              key={r.id}
              onPress={() => { if (!actif) onChangerDeRole(r.id); }}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: actif ? theme.clay : theme.paper,
                borderWidth: 1,
                borderColor: actif ? theme.clay : theme.hair,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Label size={11} color={actif ? "#ffffff" : theme.mute}>{r.label}</Label>
            </Pressable>
          );
        })}
      </View>

      {/* Un lien par ligne, avec sa date : c'est ce qui permet de reconnaître
          lequel révoquer, et de repérer deux homonymes fusionnés par erreur. */}
      <View style={{ gap: 6 }}>
        {liens.map((lien) => {
          const date = dateCourte(lien.createdAt);
          return (
            <View
              key={lien.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: theme.paper,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Display size={12.5} color={theme.mute} style={{ flex: 1 }} numberOfLines={1}>
                {date ? t("lienEmisLe", { date }) : lien.subjectUserId.slice(0, 12)}
              </Display>
              <Pressable
                onPress={() => onRevoquerLien(lien.id, lien.subjectUserId, liens.length === 1)}
                hitSlop={8}
                accessibilityLabel={t("revoquerCeLien")}
              >
                <Trash2 size={15} color={theme.strawberryInk} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onRegenerer}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.hair,
          paddingVertical: 11,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <RefreshCw size={15} color={theme.clay} />
        <Label color={theme.clay}>{t("regenererLeLien")}</Label>
      </Pressable>

      <Display size={11.5} color={theme.mute} style={{ lineHeight: 16 }}>
        {t("lienNonConserve")}
      </Display>
    </View>
  );
}

function Monogramme({ label }: { label: string }) {
  return (
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: theme.mustardSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Display size={19} weight="500" color={theme.mustard}>
        {(label.trim()[0] ?? "?").toUpperCase()}
      </Display>
    </View>
  );
}
