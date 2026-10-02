/**
 * Le compte : un coffre chiffré sous mot de passe. Le serveur d'essai exige
 * `baseHash`, applique le CAS, et lit un document absent `{hash:"",data:{}}`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk" }));

import {
  PARAMETRES_ARGON2,
  changerLeMotDePasse,
  creerLeCompte,
  deriverLesCles,
  enregistrerLeCoffre,
  lireLeCoffre,
  motDePasseAcceptable,
  normaliserLIdentifiant,
  seConnecter,
  type Coffre,
  type ParametresArgon2,
} from "@/lib/compte";
import { decoderBase64Url, encoderBase64Url } from "@/lib/invitation-courte";

const BASE = "https://mariage.didot.io/sync";
const RAPIDE: ParametresArgon2 = { memorySize: 8, iterations: 1, parallelism: 1 };
const MDP = "un-mot-de-passe-long";

function unCoffre(identifiant = "Marie", label = "Notre mariage"): Coffre {
  return {
    v: 1,
    identifiant,
    registre: {
      activeWeddingId: "w1",
      weddings: [{ id: "w1", label, dbFileName: "w1.db", createdAt: "2026-01-01T00:00:00Z", seedPhrase: "a b c" }],
    },
    annexes: { w1: { inviteDepotCodes: ["K7M2P9QWX3"] } },
    majLe: "2026-10-01T00:00:00Z",
  };
}

interface Document {
  hash: string;
  data: unknown;
}

let docs: Record<string, Document> = {};
let compteur = 0;
let requetes: { url: string; methode: string; corps?: { data: unknown; baseHash: string | null } }[] = [];
let avantPush: ((locator: string) => void) | null = null;

const locatorDe = (url: string) => url.match(/_compte\/([^/?#]+)/)?.[1] ?? "";

beforeEach(() => {
  docs = {};
  compteur = 0;
  requetes = [];
  avantPush = null;
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const locator = locatorDe(url);
    if (init?.method === "POST") {
      const corps = JSON.parse(String(init.body)) as { data: unknown; baseHash?: string | null };
      requetes.push({ url, methode: "POST", corps: corps as never });
      // Le vrai serveur lit `baseHash` et ignore tout autre nom : un faux plus indulgent masquerait l'échec.
      if (!("baseHash" in corps)) return { ok: false, status: 400, json: async () => ({ error: "baseHash attendu" }) };
      avantPush?.(locator);
      const existant = docs[locator];
      const attendu = existant ? existant.hash : null;
      if ((corps.baseHash || null) !== attendu) {
        return { ok: false, status: 409, json: async () => ({ error: "hash_mismatch", currentHash: existant?.hash ?? "" }) };
      }
      compteur += 1;
      docs[locator] = { hash: `h${compteur}`, data: corps.data };
      return { ok: true, status: 200, json: async () => ({ hash: docs[locator].hash }) };
    }
    requetes.push({ url, methode: "GET" });
    const d = docs[locator];
    return { ok: true, status: 200, json: async () => (d ? { hash: d.hash, data: d.data } : { hash: "", data: {} }) };
  });
});

afterEach(() => vi.unstubAllGlobals());

const pousses = () => requetes.filter((r) => r.methode === "POST");

describe("l'identifiant et le mot de passe", () => {
  it("normalise la casse, les espaces et la forme Unicode", () => {
    expect(normaliserLIdentifiant("  Marie   DUPONT ")).toBe("marie dupont");
    expect(normaliserLIdentifiant("ＭＡＲＩＥ")).toBe("marie");
    expect(normaliserLIdentifiant("é")).toBe(normaliserLIdentifiant("é"));
  });

  it("exige huit caractères", () => {
    expect(motDePasseAcceptable("1234567")).toBe(false);
    expect(motDePasseAcceptable("12345678")).toBe(true);
  });
});

describe("la dérivation", () => {
  it("est déterministe et insensible à la saisie de l'identifiant", async () => {
    const a = await deriverLesCles("Marie", MDP, RAPIDE);
    const b = await deriverLesCles("  MARIE ", MDP, RAPIDE);
    expect(b).toEqual(a);
    expect(a.locator).toMatch(/^[0-9a-f]{64}$/);
    expect(decoderBase64Url(a.cle)).toHaveLength(32);
  });

  it("change dès que l'identifiant ou le mot de passe change", async () => {
    const a = await deriverLesCles("marie", MDP, RAPIDE);
    const autreId = await deriverLesCles("pierre", MDP, RAPIDE);
    const autreMdp = await deriverLesCles("marie", MDP + "!", RAPIDE);
    expect(autreId.locator).not.toBe(a.locator);
    expect(autreId.cle).not.toBe(a.cle);
    expect(autreMdp.locator).not.toBe(a.locator);
    expect(autreMdp.cle).not.toBe(a.cle);
  });

  it("le locator et la clé ne se recoupent pas", async () => {
    const { locator, cle } = await deriverLesCles("marie", MDP, RAPIDE);
    expect(locator).not.toContain(cle);
  });

  it("aux paramètres réels, rend 64 octets scindés en adresse et clé", async () => {
    expect(PARAMETRES_ARGON2).toEqual({ memorySize: 47104, iterations: 3, parallelism: 1 });
    const { locator, cle } = await deriverLesCles("marie", MDP);
    expect(locator).toMatch(/^[0-9a-f]{64}$/);
    expect(decoderBase64Url(cle)).toHaveLength(32);
    expect(locator).not.toBe((await deriverLesCles("marie", MDP, RAPIDE)).locator);
  }, 30_000);
});

describe("créer puis se connecter", () => {
  it("fait l'aller-retour du coffre", async () => {
    const coffre = unCoffre();
    const compte = await creerLeCompte(BASE, " Marie ", MDP, coffre, RAPIDE);
    expect(compte.identifiant).toBe("Marie");

    const { compte: relu, coffre: restitué } = await seConnecter(BASE, "marie", MDP, RAPIDE);
    expect(restitué).toEqual(coffre);
    expect(relu.locator).toBe(compte.locator);
    expect(relu.cle).toBe(compte.cle);
  });

  it("le serveur ne détient que du chiffré, à l'adresse dérivée", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    expect(Object.keys(docs)).toEqual([compte.locator]);
    const détenu = JSON.stringify(requetes);
    expect(détenu).not.toContain("a b c");
    expect(détenu).not.toContain("Notre mariage");
    expect(détenu).not.toContain(compte.cle);
    expect(clesDe(docs[compte.locator].data)).toEqual(["ct", "iv"]);
  });

  it("refuse de créer sur un coffre existant", async () => {
    await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await expect(creerLeCompte(BASE, "Marie", MDP, unCoffre(), RAPIDE)).rejects.toMatchObject({ cas: "existe-deja" });
  });

  it("refuse en « existe-deja » une création qui perd la course", async () => {
    const { locator } = await deriverLesCles("marie", MDP, RAPIDE);
    avantPush = () => {
      docs[locator] = { hash: "h-autre", data: { iv: "x", ct: "y" } };
    };
    await expect(creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE)).rejects.toMatchObject({ cas: "existe-deja" });
  });

  it("deux personnes peuvent porter le même identifiant", async () => {
    await creerLeCompte(BASE, "marie", MDP, unCoffre("marie", "A"), RAPIDE);
    await creerLeCompte(BASE, "marie", MDP + "2", unCoffre("marie", "B"), RAPIDE);
    expect((await seConnecter(BASE, "marie", MDP + "2", RAPIDE)).coffre.registre.weddings[0].label).toBe("B");
    expect((await seConnecter(BASE, "marie", MDP, RAPIDE)).coffre.registre.weddings[0].label).toBe("A");
  });
});

describe("les échecs de connexion", () => {
  it("un mauvais mot de passe et un identifiant inconnu rendent le même cas", async () => {
    await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const mauvais = await seConnecter(BASE, "marie", MDP + "x", RAPIDE).catch((e) => e);
    const inconnu = await seConnecter(BASE, "personne", MDP, RAPIDE).catch((e) => e);
    expect(mauvais.cas).toBe("identifiants");
    expect(inconnu.cas).toBe("identifiants");
    expect(mauvais.message).toBe(inconnu.message);
  });

  it("un coffre substitué est « illisible », pas « identifiants »", async () => {
    const marie = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await creerLeCompte(BASE, "pierre", MDP, unCoffre("pierre"), RAPIDE);
    const { locator: autre } = await deriverLesCles("pierre", MDP, RAPIDE);
    docs[marie.locator].data = docs[autre].data;
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "illisible" });
    await expect(lireLeCoffre(BASE, marie)).rejects.toMatchObject({ cas: "illisible" });
  });

  it("un coffre altéré d'un octet est « illisible »", async () => {
    const marie = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const dépôt = docs[marie.locator].data as { iv: string; ct: string };
    const octets = decoderBase64Url(dépôt.ct);
    octets[0] ^= 0xff;
    docs[marie.locator].data = { iv: dépôt.iv, ct: encoderBase64Url(octets) };
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "illisible" });
  });

  it("une panne du serveur est « reseau », jamais « identifiants »", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new Error("fetch failed");
    });
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "reseau" });
    await expect(creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE)).rejects.toMatchObject({ cas: "reseau" });
    await expect(
      enregistrerLeCoffre(BASE, { identifiant: "marie", locator: "ab", cle: encoderBase64Url(new Uint8Array(32)) }, unCoffre()),
    ).rejects.toMatchObject({ cas: "reseau" });
  });

  it("une réponse HTTP en erreur est « reseau »", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "reseau" });
  });
});

describe("les refus avant tout appel réseau", () => {
  it("un mot de passe trop court", async () => {
    await expect(creerLeCompte(BASE, "marie", "court", unCoffre(), RAPIDE)).rejects.toMatchObject({
      cas: "mot-de-passe-faible",
    });
    expect(requetes).toHaveLength(0);
  });

  it("un identifiant vide ou blanc", async () => {
    for (const vide of ["", "   ", " \t"]) {
      await expect(creerLeCompte(BASE, vide, MDP, unCoffre(), RAPIDE)).rejects.toMatchObject({ cas: "identifiant-vide" });
      await expect(seConnecter(BASE, vide, MDP, RAPIDE)).rejects.toMatchObject({ cas: "identifiant-vide" });
    }
    expect(requetes).toHaveLength(0);
  });

  it("un changement vers un mot de passe trop court", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    requetes.length = 0;
    await expect(changerLeMotDePasse(BASE, compte, "court", unCoffre(), RAPIDE)).rejects.toMatchObject({
      cas: "mot-de-passe-faible",
    });
    expect(requetes).toHaveLength(0);
  });

  it("une connexion avec un mot de passe trop court rend « identifiants »", async () => {
    await expect(seConnecter(BASE, "marie", "court", RAPIDE)).rejects.toMatchObject({ cas: "identifiants" });
    expect(requetes).toHaveLength(0);
  });
});

describe("enregistrer le coffre", () => {
  it("écrase le coffre existant en repartant du hash rendu par le serveur", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await enregistrerLeCoffre(BASE, compte, unCoffre("Marie", "Renommé"));
    expect((await seConnecter(BASE, "marie", MDP, RAPIDE)).coffre.registre.weddings[0].label).toBe("Renommé");
  });

  it("réessaie après un 409 provoqué par un écrivain concurrent", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    let fois = 0;
    avantPush = (locator) => {
      fois += 1;
      if (fois === 1) docs[locator] = { ...docs[locator], hash: "h-concurrent" };
    };
    requetes.length = 0;
    await enregistrerLeCoffre(BASE, compte, unCoffre("Marie", "Après conflit"));
    expect(pousses().length).toBe(2);
    expect(pousses().at(-1)?.corps?.baseHash).toBe("h-concurrent");
    expect((await lireLeCoffre(BASE, compte))?.registre.weddings[0].label).toBe("Après conflit");
  });

  it("signale un conflit sans hash courant, sans boucler", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 409, json: async () => ({ error: "hash_mismatch" }) }));
    const compte = { identifiant: "marie", locator: "ab", cle: encoderBase64Url(new Uint8Array(32)) };
    await expect(enregistrerLeCoffre(BASE, compte, unCoffre())).rejects.toMatchObject({ cas: "reseau" });
  });

  it("renonce après des conflits répétés", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    let n = 0;
    avantPush = (locator) => {
      n += 1;
      docs[locator] = { ...docs[locator], hash: `h-course-${n}` };
    };
    await expect(enregistrerLeCoffre(BASE, compte, unCoffre())).rejects.toMatchObject({ cas: "reseau" });
  });

  it("lit null quand il n'y a pas de coffre", async () => {
    expect(await lireLeCoffre(BASE, { identifiant: "x", locator: "00", cle: encoderBase64Url(new Uint8Array(32)) })).toBeNull();
  });
});

describe("changer le mot de passe", () => {
  it("un appareil resté sur l'ancien mot de passe ne ressuscite pas le coffre vidé", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre(), RAPIDE);

    await expect(enregistrerLeCoffre(BASE, ancien, unCoffre("Marie", "Périmé"))).rejects.toMatchObject({ cas: "deplace" });
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "identifiants" });
  });

  it("l'ancien ne connecte plus, le nouveau oui, l'ancien dépôt est vidé", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const nouveau = await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre("Marie", "Après"), RAPIDE);

    expect(nouveau.locator).not.toBe(ancien.locator);
    expect(nouveau.identifiant).toBe("marie");
    await expect(seConnecter(BASE, "marie", MDP, RAPIDE)).rejects.toMatchObject({ cas: "identifiants" });
    const { coffre } = await seConnecter(BASE, "marie", "tout-autre-mot-de-passe", RAPIDE);
    expect(coffre.registre.weddings[0].label).toBe("Après");
    expect(docs[ancien.locator].data).toEqual({});
  });

  it("écrit le neuf AVANT de vider l'ancien", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    requetes.length = 0;
    const nouveau = await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre(), RAPIDE);
    const adresses = pousses().map((r) => locatorDe(r.url));
    expect(adresses[0]).toBe(nouveau.locator);
    expect(adresses.slice(1).every((a) => a === ancien.locator)).toBe(true);
    expect(adresses.length).toBeGreaterThan(1);
  });

  it("un échec du vidage ne fait pas échouer le changement", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const rép = globalThis.fetch;
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (init?.method === "POST" && locatorDe(url) === ancien.locator) throw new Error("fetch failed");
      return rép(url, init);
    });
    const nouveau = await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre(), RAPIDE);
    expect((await seConnecter(BASE, "marie", "tout-autre-mot-de-passe", RAPIDE)).compte.locator).toBe(nouveau.locator);
  });

  it("un vidage refusé en 409 repart du hash courant", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre(), RAPIDE);
    expect(docs[ancien.locator].data).toEqual({});
    expect(pousses().some((r) => r.corps?.baseHash === null && locatorDe(r.url) === ancien.locator)).toBe(true);
  });

  it("revenir à un ancien mot de passe vidé recrée le compte", async () => {
    const ancien = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const milieu = await changerLeMotDePasse(BASE, ancien, "tout-autre-mot-de-passe", unCoffre(), RAPIDE);
    const retour = await changerLeMotDePasse(BASE, milieu, MDP, unCoffre("Marie", "Retour"), RAPIDE);
    expect(retour.locator).toBe(ancien.locator);
    expect((await seConnecter(BASE, "marie", MDP, RAPIDE)).coffre.registre.weddings[0].label).toBe("Retour");
  });

  it("garder le même mot de passe ne vide rien", async () => {
    const compte = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    const idem = await changerLeMotDePasse(BASE, compte, MDP, unCoffre("Marie", "Mis à jour"), RAPIDE);
    expect(idem).toEqual(compte);
    expect((await seConnecter(BASE, "marie", MDP, RAPIDE)).coffre.registre.weddings[0].label).toBe("Mis à jour");
  });

  it("refuse un mot de passe déjà pris par un autre compte du même identifiant", async () => {
    const a = await creerLeCompte(BASE, "marie", MDP, unCoffre(), RAPIDE);
    await creerLeCompte(BASE, "marie", "tout-autre-mot-de-passe", unCoffre(), RAPIDE);
    await expect(changerLeMotDePasse(BASE, a, "tout-autre-mot-de-passe", unCoffre(), RAPIDE)).rejects.toMatchObject({
      cas: "existe-deja",
    });
    expect(docs[a.locator].data).not.toEqual({});
  });
});

/** Les clés d'un dépôt, triées. */
function clesDe(data: unknown): string[] {
  return Object.keys(data as object).sort();
}
