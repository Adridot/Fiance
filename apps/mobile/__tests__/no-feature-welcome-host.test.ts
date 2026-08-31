import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * MODIFICATION LOCALE — les écrans d'accueil de fonctionnalité sont démontés.
 *
 * La garantie porte sur l'ABSENCE D'UN MONTAGE, pas sur l'absence du composant :
 * `lib/feature-welcomes.tsx`, son registre, ses clés et ses traductions restent
 * en place, sans appelant. Les effacer produirait un correctif large qui
 * entrerait en conflit à chaque évolution amont, pour un gain nul — du code non
 * monté ne s'exécute pas. Ce test échoue donc si, et seulement si, la
 * disposition racine remonte l'hôte.
 *
 * Pourquoi une lecture de source plutôt qu'un rendu : `app/_layout.tsx` tire la
 * base de données, la navigation Expo Router, les polices et le magasin de
 * synchronisation. Le monter dans un test de nœud coûterait une dizaine de
 * doublures pour vérifier une seule ligne, et chaque doublure serait une raison
 * de plus pour le test de casser sans que rien ne soit cassé.
 */

const layout = readFileSync(join(__dirname, "..", "app", "_layout.tsx"), "utf8");

/** Retire commentaires de bloc et de ligne : la note qui explique le retrait
 *  nomme forcément le composant, et ne doit pas se faire prendre pour un usage. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("disposition racine — aucun écran d'accueil de fonctionnalité", () => {
  const code = stripComments(layout);

  it("ne monte pas FeatureWelcomeHost", () => {
    expect(code).not.toMatch(/<\s*FeatureWelcomeHost\b/);
  });

  it("n'importe pas FeatureWelcomeHost", () => {
    expect(code).not.toMatch(/import[\s\S]{0,200}?\bFeatureWelcomeHost\b[\s\S]{0,80}?from/);
  });

  it("ne monte aucun hôte d'accueil, quel qu'en soit le nom", () => {
    expect(code).not.toMatch(/<\s*\w*(FeatureWelcome|WelcomeHost)\w*\b/);
  });

  it("le contrôle a des dents — un montage rétabli serait détecté", () => {
    const remounted = stripComments(
      layout.replace("{activeWedding && <OfflineBanner />}",
                     "{activeWedding && <OfflineBanner />}\n{activeWedding && <FeatureWelcomeHost />}"),
    );
    expect(remounted).toMatch(/<\s*FeatureWelcomeHost\b/);
  });

  it("laisse en place les surfaces qui ne s'interposent pas", () => {
    // Bandeau hors-ligne : il signale un état effectif, il n'intercepte rien.
    expect(code).toMatch(/<\s*OfflineBanner\b/);
  });
});
