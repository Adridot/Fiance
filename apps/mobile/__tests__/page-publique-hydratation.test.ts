import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
// @ts-ignore — pas de types pour react-dom/server
import { renderToString } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { useApresHydratation } from "@/lib/useApresHydratation";

/**
 * Le prérendu de `/wedding/<jeton>` est en anglais (pas de navigateur au build) ;
 * le premier rendu client suit la langue du visiteur. Tout texte localisé de ce
 * premier rendu fait diverger l'hydratation (erreur React #418), que le repli
 * d'erreur de `_layout.tsx` affiche ensuite comme un plantage.
 */

const libelles: Record<string, string> = { en: "Loading...", fr: "Chargement..." };

function Chargement({ langue }: { langue: string }) {
  const apres = useApresHydratation();
  return createElement("span", null, apres ? libelles[langue] : null);
}

describe("useApresHydratation", () => {
  it("est faux au prérendu : le premier rendu ne dépend pas de la langue", () => {
    const fr = renderToString(createElement(Chargement, { langue: "fr" }));
    const en = renderToString(createElement(Chargement, { langue: "en" }));
    expect(fr).toBe(en);
    expect(fr).not.toMatch(/Chargement|Loading/);
  });
});

describe("page publique du mariage", () => {
  const source = readFileSync(join(__dirname, "..", "app", "wedding", "[id].tsx"), "utf8");

  it("ne localise pas l'écran de chargement avant l'hydratation", () => {
    expect(source).toMatch(/apresHydratation\s*\?\s*t\("loading"\)\s*:\s*null/);
    expect(source.match(/t\("loading"\)/g)).toHaveLength(1);
  });
});
