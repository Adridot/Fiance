import { describe, it, expect } from "vitest";
import QRCode from "qrcode";

import { tailleDuQR } from "@/lib/envoi-d-invitation";

/**
 * Le QR de la feuille d'invitation doit rester scannable.
 *
 * Il encode le lien court (~81 caractères). Les lecteurs de caméra demandent
 * environ 2 px par module : on épingle ce rapport avec le VRAI encodeur
 * (react-native-qrcode-svg appelle `QRCode.create` et divise `size` par la
 * taille de la grille, sans marge ajoutée).
 */

const MIN_SCANNABLE_PX_PER_MODULE = 2.0;

const lienCourt = (origine: string) => `${origine}/i/K7M2P9QWX3#${"A".repeat(43)}`;

describe("invite QR scannability", () => {
  it("encode un lien de l'ordre de 81 caractères", () => {
    expect(lienCourt("https://mariage.didot.io")).toHaveLength(81);
  });

  it.each([
    ["small phone (320)", 320],
    ["standard phone (375)", 375],
    ["tablet/web (768)", 768],
  ])("reste au-dessus du seuil de px par module sur %s", (_label, width) => {
    const matrix = QRCode.create(lienCourt("https://mariage.didot.io"), { errorCorrectionLevel: "M" });
    expect(tailleDuQR(width) / matrix.modules.size).toBeGreaterThanOrEqual(MIN_SCANNABLE_PX_PER_MODULE);
  });

  it("tient encore avec une origine bien plus longue", () => {
    const origine = `https://un-sous-domaine-de-mariage.exemple-de-famille.example.org/${"x".repeat(30)}`;
    const matrix = QRCode.create(lienCourt(origine), { errorCorrectionLevel: "M" });
    expect(tailleDuQR(320) / matrix.modules.size).toBeGreaterThanOrEqual(MIN_SCANNABLE_PX_PER_MODULE);
  });
});
