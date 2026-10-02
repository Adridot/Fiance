/** Le message d'invitation et les trois adresses d'envoi. */
import { describe, expect, it } from "vitest";

import fr from "@/i18n/locales/fr/settings.json";
import en from "@/i18n/locales/en/settings.json";
import {
  LARGEUR_MINIMALE_POUR_LE_QR,
  prenomDe,
  tailleDuQR,
  urlEmail,
  urlSms,
  urlWhatsApp,
} from "@/lib/envoi-d-invitation";

const LIEN = "https://mariage.didot.io/i/K7M2P9QWX3#aB3-_xY9";

/** Ce que i18next fait de `{{prenom}}` et `{{lien}}`. */
const garnir = (modele: string, prenom: string, lien: string) =>
  modele.replace("{{prenom}}", () => prenom).replace("{{lien}}", () => lien);

describe("prenomDe", () => {
  it("garde le premier mot", () => {
    expect(prenomDe("  Léa   Martin ")).toBe("Léa");
    expect(prenomDe("Léa")).toBe("Léa");
  });
  it("rend une chaîne vide sans nom", () => {
    expect(prenomDe("")).toBe("");
    expect(prenomDe(undefined)).toBe("");
  });
});

describe("le message", () => {
  it("dit ce que la maquette dit, lien compris", () => {
    expect(garnir(fr.inviteMessage, "Léa", LIEN)).toBe(
      `Bonjour Léa, voici ton invitation pour préparer le mariage avec nous : ${LIEN} — elle est valable 7 jours et ne sert qu'une fois.`,
    );
  });

  it("existe dans les deux langues, avec les deux variables", () => {
    for (const modele of [fr.inviteMessage, en.inviteMessage]) {
      expect(modele).toContain("{{prenom}}");
      expect(modele).toContain("{{lien}}");
    }
  });
});

describe("les adresses d'envoi", () => {
  const message = garnir(fr.inviteMessage, "Léa", LIEN);

  it("WhatsApp : wa.me, message encodé", () => {
    const url = urlWhatsApp(message);
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url.slice("https://wa.me/?text=".length))).toBe(message);
  });

  it("SMS : sms:?&body=", () => {
    const url = urlSms(message);
    expect(url.startsWith("sms:?&body=")).toBe(true);
    expect(decodeURIComponent(url.slice("sms:?&body=".length))).toBe(message);
  });

  it("e-mail : sujet et corps encodés séparément", () => {
    const url = urlEmail("Invitation & mariage", message);
    const [, sujet, corps] = url.match(/^mailto:\?subject=([^&]*)&body=(.*)$/) ?? [];
    expect(decodeURIComponent(sujet)).toBe("Invitation & mariage");
    expect(decodeURIComponent(corps)).toBe(message);
  });

  it("le # du lien est encodé : il ne coupe pas le message", () => {
    for (const url of [urlWhatsApp(message), urlSms(message), urlEmail("s", message)]) {
      expect(url).not.toContain("#");
      expect(url).toContain("%23aB3-_xY9");
    }
  });

  it("aucun espace ni retour à la ligne brut", () => {
    for (const url of [urlWhatsApp(message), urlSms(message), urlEmail("a b", message)]) {
      expect(url).not.toMatch(/\s/);
    }
  });
});

describe("le QR", () => {
  it("reste dans ses bornes", () => {
    expect(tailleDuQR(320)).toBe(224);
    expect(tailleDuQR(200)).toBe(180);
    expect(tailleDuQR(1200)).toBe(240);
  });

  it("le seuil de repli est de 400 px", () => {
    expect(LARGEUR_MINIMALE_POUR_LE_QR).toBe(400);
  });
});
