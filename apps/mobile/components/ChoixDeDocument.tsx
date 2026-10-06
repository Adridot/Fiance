import React from "react";
import { Pressable } from "react-native";
import * as Crypto from "expo-crypto";
import { pickAndStoreDocument, type PickedDocumentFile } from "@/lib/documents";

export interface ChoixDeDocumentProps {
  onChoisi: (document: PickedDocumentFile & { id: string }) => void;
  onErreur: () => void;
  children: React.ReactNode;
}

/** Choisit un fichier et le stocke sous un nouvel identifiant ; la version web est un vrai `<label>`. */
export function ChoixDeDocument({ onChoisi, onErreur, children }: ChoixDeDocumentProps) {
  return (
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      onPress={() => {
        const id = Crypto.randomUUID();
        pickAndStoreDocument(id).then((document) => {
          if (document) onChoisi({ id, ...document });
        }, onErreur);
      }}
    >
      {children}
    </Pressable>
  );
}
