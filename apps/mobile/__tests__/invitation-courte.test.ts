/**
 * Le lien court : le serveur ne détient que du chiffré, la clé reste dans le
 * fragment, et un dépôt substitué ne se déchiffre pas — il est SIGNALÉ.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk" }));

import {
  InvitationCourteError,
  LONGUEUR_DU_CODE,
  chiffrerLeJeton,
  construireLeLienCourt,
  dechiffrerLeDepot,
  decoderBase64Url,
  deposer,
  encoderBase64Url,
  lireLeLienCourt,
  normaliserLeCode,
  ouvrirLInvitationCourte,
  recuperer,
  retirer,
  tirerUnCode,
  type DepotChiffre,
} from "@/lib/invitation-courte";

/** Un jeton de la taille réelle : 984 octets, la cause de la longueur du lien. */
const JETON = "e".repeat(1312);
const BASE = "https://mariage.didot.io/sync";

/** Le magasin du serveur d'essai, indexé par code. */
let depots: Record<string, unknown> = {};
const requetes: { url: string; corps?: unknown }[] = [];

beforeEach(() => {
  depots = {};
  requetes.length = 0;
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const code = url.match(/_invite\/([^/?#]+)/)?.[1] ?? "";
    if (init?.method === "POST") {
      const corps = JSON.parse(String(init.body)) as { data: unknown; baseHash?: string | null };
      requetes.push({ url, corps: corps.data });
      // Le vrai serveur est en CAS, et il lit `baseHash` — JAMAIS `hash`. Un
      // faux qui accepterait les deux noms masquerait un retrait qui échoue en
      // production : `"baseHash" in corps` est donc une assertion, pas un détail.
      const existant = depots[code] as { ct?: string } | undefined;
      if (!("baseHash" in corps)) {
        return { ok: false, status: 400, json: async () => ({ error: "baseHash attendu" }) };
      }
      if (existant?.ct && corps.baseHash !== "h") {
        return { ok: false, status: 409, json: async () => ({ error: "hash_mismatch", currentHash: "h" }) };
      }
      depots[code] = corps.data;
      return { ok: true, status: 200, json: async () => ({ hash: "h" }) };
    }
    requetes.push({ url });
    const d = depots[code] as DepotChiffre | undefined;
    const vide = !d || !Object.keys(d).length;
    return { ok: true, status: 200, json: async () => (vide ? { hash: "", data: {} } : { hash: "h", data: d }) };
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("le code de dépôt", () => {
  it("fait dix caractères, dans un alphabet recopiable à la main", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = tirerUnCode();
      expect(code).toHaveLength(LONGUEUR_DU_CODE);
      expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]+$/);
    }
  });

  it("ne contient jamais I, L, O ni U — les confusions d'une recopie", () => {
    const tirés = Array.from({ length: 200 }, () => tirerUnCode()).join("");
    expect(tirés).not.toMatch(/[ILOU]/);
  });

  it("tolère la casse, les espaces et les tirets d'une saisie manuelle", () => {
    const code = tirerUnCode();
    expect(normaliserLeCode(code.toLowerCase())).toBe(code);
    expect(normaliserLeCode(` ${code.slice(0, 5)}-${code.slice(5)} `)).toBe(code);
  });

  it("corrige les confusions ordinaires dans le sens de Crockford", () => {
    expect(normaliserLeCode("OI L0123456".replace(/\s/g, ""))).toBe("0110123456");
  });

  it("refuse ce qui n'est pas un code", () => {
    expect(normaliserLeCode("trop court")).toBeNull();
    expect(normaliserLeCode("")).toBeNull();
    expect(normaliserLeCode("K7M2P9QWX3TROPLONG")).toBeNull();
  });
});

describe("base64url", () => {
  it("fait l'aller-retour, sans rembourrage ni caractère hors URL", () => {
    const octets = new Uint8Array([0, 1, 250, 251, 252, 253, 254, 255]);
    const texte = encoderBase64Url(octets);
    expect(texte).not.toMatch(/[+/=]/);
    expect([...decoderBase64Url(texte)]).toEqual([...octets]);
  });
});

describe("chiffrer et déchiffrer", () => {
  it("fait l'aller-retour sur un jeton de taille réelle", async () => {
    const { depot, cle } = await chiffrerLeJeton(JETON);
    expect(await dechiffrerLeDepot(depot, cle)).toBe(JETON);
  });

  it("la clé fait 32 octets, soit 43 caractères en base64url", async () => {
    const { cle } = await chiffrerLeJeton(JETON);
    expect(decoderBase64Url(cle)).toHaveLength(32);
    expect(cle).toHaveLength(43);
  });

  it("deux chiffrements du même jeton ne se ressemblent pas", async () => {
    const a = await chiffrerLeJeton(JETON);
    const b = await chiffrerLeJeton(JETON);
    expect(a.depot.ct).not.toBe(b.depot.ct);
    expect(a.cle).not.toBe(b.cle);
  });

  it("le dépôt ne porte AUCUNE trace du jeton en clair", async () => {
    const { depot } = await chiffrerLeJeton("sp-f88da0e30ce94f4dabcc6d050103e931");
    expect(JSON.stringify(depot)).not.toContain("sp-f88da0e3");
  });

  it("un dépôt SUBSTITUÉ ne se déchiffre pas, et c'est signalé", async () => {
    const { cle } = await chiffrerLeJeton(JETON);
    const autre = await chiffrerLeJeton("un tout autre jeton");
    await expect(dechiffrerLeDepot(autre.depot, cle)).rejects.toThrow(InvitationCourteError);
    await expect(dechiffrerLeDepot(autre.depot, cle)).rejects.toMatchObject({ cas: "depot-illisible" });
  });

  it("un dépôt ALTÉRÉ d'un octet ne se déchiffre pas non plus", async () => {
    const { depot, cle } = await chiffrerLeJeton(JETON);
    const octets = decoderBase64Url(depot.ct);
    octets[0] ^= 0xff;
    const altéré = { iv: depot.iv, ct: encoderBase64Url(octets) };
    await expect(dechiffrerLeDepot(altéré, cle)).rejects.toMatchObject({ cas: "depot-illisible" });
  });

  it("une clé tronquée est refusée, pas devinée", async () => {
    const { depot, cle } = await chiffrerLeJeton(JETON);
    await expect(dechiffrerLeDepot(depot, cle.slice(0, 20))).rejects.toMatchObject({
      cas: "depot-illisible",
    });
  });
});

describe("le dépôt sur le serveur", () => {
  it("dépose puis retrouve, et le serveur ne voit que du chiffré", async () => {
    const code = tirerUnCode();
    const { depot, cle } = await chiffrerLeJeton(JETON);
    await deposer(BASE, code, depot);

    // Ce que le serveur détient, mot pour mot.
    const détenu = JSON.stringify(requetes.find((r) => r.corps)?.corps);
    expect(détenu).not.toContain(cle);
    expect(détenu).not.toContain(JETON.slice(0, 40));

    expect(await ouvrirLInvitationCourte(BASE, { code, cle })).toBe(JETON);
  });

  it("la clé ne part JAMAIS au serveur, ni en adresse ni en corps", async () => {
    const code = tirerUnCode();
    const { depot, cle } = await chiffrerLeJeton(JETON);
    await deposer(BASE, code, depot);
    await recuperer(BASE, code);

    for (const r of requetes) {
      expect(r.url).not.toContain(cle);
      expect(JSON.stringify(r.corps ?? "")).not.toContain(cle);
    }
  });

  it("un code inconnu rend « dépôt absent », pas une erreur réseau", async () => {
    await expect(recuperer(BASE, tirerUnCode())).rejects.toMatchObject({ cas: "depot-absent" });
  });

  it("un dépôt retiré se lit comme absent, malgré le CAS du serveur", async () => {
    const code = tirerUnCode();
    const { depot } = await chiffrerLeJeton(JETON);
    await deposer(BASE, code, depot);
    await retirer(BASE, code);
    await expect(recuperer(BASE, code)).rejects.toMatchObject({ cas: "depot-absent" });
  });

  it("un conflit qui ne porte pas le hash courant est signalé, pas avalé", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      status: 409,
      json: async () => ({ error: "hash_mismatch" }),
    }));
    await expect(retirer(BASE, tirerUnCode())).rejects.toMatchObject({ cas: "reseau" });
  });

  it("une panne du serveur est classée réseau, jamais « absent »", async () => {
    vi.stubGlobal("fetch", async () => { throw new Error("fetch failed"); });
    await expect(recuperer(BASE, tirerUnCode())).rejects.toMatchObject({ cas: "reseau" });
  });
});

describe("le lien court", () => {
  it("tient largement sous cent caractères", async () => {
    const { cle } = await chiffrerLeJeton(JETON);
    const lien = construireLeLienCourt("https://mariage.didot.io", tirerUnCode(), cle);
    expect(lien.length).toBeLessThan(100);
  });

  it("se relit : code dans le chemin, clé dans le fragment", async () => {
    const code = tirerUnCode();
    const { cle } = await chiffrerLeJeton(JETON);
    expect(lireLeLienCourt(construireLeLienCourt("https://mariage.didot.io", code, cle))).toEqual({ code, cle });
  });

  it("survit à un fragment pollué par un partage", async () => {
    const code = tirerUnCode();
    const { cle } = await chiffrerLeJeton(JETON);
    const lien = `https://mariage.didot.io/i/${code}#${cle}%20Rejoins-nous%20!`;
    expect(lireLeLienCourt(lien)?.cle).toBe(cle);
  });

  it("n'est pas confondu avec un lien au format long", () => {
    expect(lireLeLienCourt("https://mariage.didot.io/join#eyJ2IjoxfQ")).toBeNull();
  });

  it("un lien sans fragment n'est pas une invitation courte", () => {
    expect(lireLeLienCourt(`https://mariage.didot.io/i/${tirerUnCode()}`)).toBeNull();
  });
});
