import React from "react";
import * as Crypto from "expo-crypto";
import { stockerUnFichierWeb } from "@/lib/documents";
import type { ChoixDeDocumentProps } from "./ChoixDeDocument";

// Un vrai <label> : en app installée, Safari n'ouvre pas un sélecteur de fichier déclenché par script (cf. export-import.tsx).
export function ChoixDeDocument({ onChoisi, onErreur, children }: ChoixDeDocumentProps) {
  return (
    <label style={{ display: "block", position: "relative", cursor: "pointer" }}>
      <input
        type="file"
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
        onChange={(e) => {
          const fichier = e.target.files?.[0];
          e.target.value = "";
          if (!fichier) return;
          const id = Crypto.randomUUID();
          stockerUnFichierWeb(id, fichier).then((document) => onChoisi({ id, ...document }), onErreur);
        }}
      />
      {children}
    </label>
  );
}
