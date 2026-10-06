import React from "react";
import { Platform, StyleSheet } from "react-native";
import { View, TextInput, Pressable } from "react-native-css/components";
import { Search, XCircle } from "lucide-react-native";
import { theme as GP } from "../garden-theme";
import { agrandir, cibleCarree, demiEcart } from "../utils/cible-tactile";

// Local override of seahorse's SearchBar: seahorse hardcodes the inner box to
// bg-background-0/border-outline-100 (pure white + grey hairline), which reads
// as an out-of-place box on the warm Garden Press paper. This version is a
// compact, fixed-height field: a lighter card fill sits inset on the paper
// with a warm hairline border (no floating shadow) for a refined native feel.

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  className?: string;
}

// Web : le champ (une ligne `text-base` de 24 px) couvre toute la pastille, loupe comprise
// (`px-3`, loupe de 18, `ml-2`), et l'effacement fait 44 × 44 ; dessin et mise en page inchangés.
const champ = agrandir(
  { haut: demiEcart(24), bas: demiEcart(24), gauche: 12 + 18 + 8 },
  { marges: { gauche: 8 } },
);
const effacer = cibleCarree(18, { marges: { gauche: 6 } });
const styles = StyleSheet.create({
  traversable: { pointerEvents: "none" },
});

export function SearchBar({ value, onChangeText, placeholder, right, className }: SearchBarProps) {
  const web = Platform.OS === "web";
  const loupe = <Search size={18} color={GP.mute} />;
  return (
    <View className={className}>
      <View className="flex-row items-center h-11 bg-accent-card border border-hair rounded-lg px-3">
        {web ? <View style={styles.traversable}>{loupe}</View> : loupe}
        <TextInput
          className="flex-1 ml-2 text-base text-ink"
          placeholder={placeholder}
          placeholderTextColor={GP.mute}
          value={value}
          onChangeText={onChangeText}
          style={web ? champ : undefined}
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={8}
            className="ml-1.5"
            style={web ? effacer : undefined}
          >
            <XCircle size={18} color={GP.mute} />
          </Pressable>
        )}
        {right}
      </View>
    </View>
  );
}
