import React, { useState } from "react";
import type { TextInputProps } from "react-native";
import { View, Text, TextInput, Pressable } from "react-native-css/components";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { theme as GP } from "@/lib/theme";

type Genre = "identifiant" | "nouveau-mot-de-passe" | "mot-de-passe-actuel" | "texte";

interface ChampProps {
  libelle: string;
  valeur: string;
  onChangeText: (texte: string) => void;
  genre?: Genre;
  placeholder?: string;
  aide?: string;
  erreur?: string | null;
  onSubmit?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  testID?: string;
}

const PAR_GENRE: Record<Genre, Partial<TextInputProps>> = {
  identifiant: { autoComplete: "username", textContentType: "username", autoCapitalize: "none", autoCorrect: false },
  "mot-de-passe-actuel": { autoComplete: "current-password", textContentType: "password", autoCapitalize: "none", autoCorrect: false },
  "nouveau-mot-de-passe": { autoComplete: "new-password", textContentType: "newPassword", autoCapitalize: "none", autoCorrect: false },
  texte: { autoCapitalize: "none", autoCorrect: false },
};

export function ChampDeFormulaire({
  libelle,
  valeur,
  onChangeText,
  genre = "texte",
  placeholder,
  aide,
  erreur,
  onSubmit,
  editable = true,
  autoFocus,
  testID,
}: ChampProps) {
  const { t } = useTranslation("common");
  const secret = genre === "mot-de-passe-actuel" || genre === "nouveau-mot-de-passe";
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-mute mb-1.5 ml-1">{libelle}</Text>
      <View>
        <TextInput
          {...PAR_GENRE[genre]}
          accessibilityLabel={libelle}
          value={valeur}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C8"
          secureTextEntry={secret && !visible}
          editable={editable}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmit}
          returnKeyType={onSubmit ? "go" : undefined}
          testID={testID}
          className="bg-accent-card rounded-xl px-4 py-3.5 text-base text-ink border border-hair"
          style={{ minHeight: 48, ...(secret ? { paddingRight: 52 } : null), ...(erreur ? { borderColor: GP.strawberryInk } : null) }}
        />
        {secret && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? t("compte.champs.masquer") : t("compte.champs.afficher")}
            onPress={() => setVisible((v) => !v)}
            className="absolute items-center justify-center"
            style={{ right: 0, top: 0, bottom: 0, width: 48 }}
          >
            {visible ? <EyeOff size={20} color={GP.mute} /> : <Eye size={20} color={GP.mute} />}
          </Pressable>
        )}
      </View>
      {erreur ? (
        <Text accessibilityRole="alert" className="text-sm mt-1.5 ml-1" style={{ color: GP.strawberryInk }}>
          {erreur}
        </Text>
      ) : aide ? (
        <Text className="text-xs text-mute mt-1.5 ml-1">{aide}</Text>
      ) : null}
    </View>
  );
}
