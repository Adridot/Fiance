import { describe, expect, it } from "vitest";
import { disponibiliteDuLien, etatDuBoutonRsvp } from "@/lib/disponibilite-du-lien-rsvp";

const tout = { aUnInvite: true, aUneGraine: true, synchroDesactivee: false, synchroPrete: true };

describe("disponibiliteDuLien", () => {
  it("prêt quand la sync est active", () => {
    expect(disponibiliteDuLien(tout)).toBe("pret");
  });

  it("page ouverte à froid : on attend la sync, on n'abandonne pas", () => {
    expect(disponibiliteDuLien({ ...tout, synchroPrete: false })).toBe("attente-de-la-sync");
  });

  it("sync coupée par l'utilisateur : aucun lien ne viendra", () => {
    expect(disponibiliteDuLien({ ...tout, synchroDesactivee: true, synchroPrete: false })).toBe("sync-desactivee");
  });

  it("sans invité (nouvelle fiche) ou sans phrase du mariage : indisponible, même sync prête", () => {
    expect(disponibiliteDuLien({ ...tout, aUnInvite: false })).toBe("indisponible");
    expect(disponibiliteDuLien({ ...tout, aUneGraine: false })).toBe("indisponible");
  });
});

describe("etatDuBoutonRsvp", () => {
  it("un lien existant l'emporte sur tout : le bouton partage", () => {
    expect(etatDuBoutonRsvp({ url: "https://x/y", disponibilite: "attente-de-la-sync", echec: true })).toBe("pret");
    expect(etatDuBoutonRsvp({ url: "https://x/y", disponibilite: "sync-desactivee", echec: false })).toBe("pret");
  });

  it("sans lien : préparation tant que rien n'a échoué, y compris pendant l'attente de la sync", () => {
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "attente-de-la-sync", echec: false })).toBe("preparation");
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "pret", echec: false })).toBe("preparation");
  });

  it("sans lien après un échec (ou une attente trop longue) : réessayer", () => {
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "pret", echec: true })).toBe("echec");
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "attente-de-la-sync", echec: true })).toBe("echec");
  });

  it("sync coupée ou fiche sans invité : l'état dit pourquoi, pas de faux chargement", () => {
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "sync-desactivee", echec: false })).toBe("sync-desactivee");
    expect(etatDuBoutonRsvp({ url: null, disponibilite: "indisponible", echec: true })).toBe("indisponible");
  });
});
