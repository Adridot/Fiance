/**
 * L'écran de jonction accepte les DEUX formes de lien, et sait dire laquelle
 * des trois causes explique un échec.
 *
 * Un lien au format long déjà remis à quelqu'un ne doit jamais cesser de
 * fonctionner : le changement de format ne réécrit pas le passé.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("expo-linking", () => ({ createURL: (p: string) => `fiance:///${p}` }));

// `getSyncNamespace` lève tant que `configureDKSpaces` n'a pas tourné : hors sujet ici.
vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSyncNamespace: () => "dk",
}));

import { parseSpaceInviteUrl } from "@/lib/identity";
import { encodeSpaceInviteLink, type SpaceInviteLinkToken } from "@fiance/sdk";
import { resoudreLInvitation } from "@/lib/resolution-d-invitation";
import {
  chiffrerLeJeton,
  decoderLeJeton,
  construireLeLienCourt,
  deposer,
  lireLeLienCourt,
  ouvrirLInvitationCourte,
  tirerUnCode,
  type DepotChiffre,
} from "@/lib/invitation-courte";

const JETON: SpaceInviteLinkToken = {
  v: 1,
  spaceId: "sp-f88da0e30ce94f4dabcc6d050103e931",
  spaceName: "Adrien & Emma",
  write: true,
  key: "a".repeat(64),
  kemPriv: "b".repeat(64),
  kemPub: "c".repeat(64),
  cap: { iss: "d".repeat(32), sub: "e".repeat(32), exp: 4102444800, nonce: "f".repeat(32) },
} as unknown as SpaceInviteLinkToken;

const BASE = "https://mariage.didot.io/sync";
const ORIGINE = "https://mariage.didot.io";

/** `encodeSpaceInviteLink` rend l'URL entière : le fragment en est la seconde moitié. */
function fragmentLong(): string {
  const url = encodeSpaceInviteLink(ORIGINE, JETON);
  return url.slice(url.indexOf("#") + 1);
}

let depots: Record<string, unknown> = {};

beforeEach(() => {
  depots = {};
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const code = url.match(/_invite\/([^/?#]+)/)?.[1] ?? "";
    if (init?.method === "POST") {
      depots[code] = JSON.parse(String(init.body)).data;
      return { ok: true, status: 200, json: async () => ({ hash: "h" }) };
    }
    const d = depots[code] as DepotChiffre | undefined;
    const vide = !d || !Object.keys(d).length;
    return { ok: true, status: 200, json: async () => (vide ? { hash: "", data: {} } : { hash: "h", data: d }) };
  });
});

/** L'émission telle que `invite-link.ts` la fait : jeton long → dépôt → lien court. */
async function emettreUnLienCourt() {
  const fragment = fragmentLong();
  const { depot, cle } = await chiffrerLeJeton(fragment);
  const code = tirerUnCode();
  await deposer(BASE, code, depot);
  return { lien: construireLeLienCourt(ORIGINE, code, cle), code, cle, fragment };
}

/** Le chemin de résolution de `join.tsx` — le vrai module, pas une copie. */
async function resoudre(url: string) {
  const r = await resoudreLInvitation(BASE, url, parseSpaceInviteUrl(url));
  return "jeton" in r ? { jeton: r.jeton } : { cause: r.cause };
}

describe("les deux formes de lien", () => {
  it("un lien au format LONG déjà émis est toujours accepté", async () => {
    const long = `${ORIGINE}/join#${fragmentLong()}`;
    const r = await resoudre(long);
    expect(r).toMatchObject({ jeton: { spaceId: JETON.spaceId, spaceName: "Adrien & Emma" } });
  });

  it("un lien au format long au fragment pollué par un partage passe aussi", async () => {
    const long = `${ORIGINE}/join#${fragmentLong()}%20Rejoins-nous%20!`;
    expect(await resoudre(long)).toMatchObject({ jeton: { spaceId: JETON.spaceId } });
  });

  it("un lien au format COURT rend exactement le même jeton", async () => {
    const { lien } = await emettreUnLienCourt();
    const r = await resoudre(lien);
    expect(r).toMatchObject({ jeton: { spaceId: JETON.spaceId, spaceName: "Adrien & Emma" } });
  });

  it("le lien court tient sous cent caractères, quelle que soit la taille du jeton", async () => {
    const { lien } = await emettreUnLienCourt();
    const long = `${ORIGINE}/join#${fragmentLong()}`;
    expect(lien.length).toBeLessThan(100);
    expect(lien.length).toBeLessThan(long.length);
    // La longueur du lien court NE DÉPEND PAS du jeton : c'est tout l'intérêt.
    // Le jeton réel pèse 1342 caractères, soit seize fois plus.
    expect(1342 / lien.length).toBeGreaterThan(15);
  });
});

describe("les trois causes d'un échec", () => {
  it("adresse tronquée — le fragment a été perdu en route → INCOMPLÈTE", async () => {
    const { lien } = await emettreUnLienCourt();
    expect(await resoudre(lien.split("#")[0])).toEqual({ cause: "incomplete" });
  });

  it("dépôt expiré ou retiré → EXPIRÉE", async () => {
    const { lien, code } = await emettreUnLienCourt();
    depots[code] = {};
    expect(await resoudre(lien)).toEqual({ cause: "expiree" });
  });

  it("dépôt substitué sous le même code → INCOMPLÈTE, jamais avalé", async () => {
    const { lien, code } = await emettreUnLienCourt();
    depots[code] = (await chiffrerLeJeton("un autre jeton")).depot;
    expect(await resoudre(lien)).toEqual({ cause: "incomplete" });
  });

  it("adresse qui ne veut rien dire → INVALIDE", async () => {
    expect(await resoudre(`${ORIGINE}/join`)).toEqual({ cause: "invalide" });
    expect(await resoudre(`${ORIGINE}/join#pasunjeton`)).toEqual({ cause: "invalide" });
  });

  it("les trois causes sont bien distinctes", async () => {
    const { lien, code } = await emettreUnLienCourt();
    const tronquée = await resoudre(lien.split("#")[0]);
    depots[code] = {};
    const expirée = await resoudre(lien);
    const invalide = await resoudre(`${ORIGINE}/join`);
    expect(new Set([JSON.stringify(tronquée), JSON.stringify(expirée), JSON.stringify(invalide)]).size).toBe(3);
  });
});

describe("le repli par code saisi à la main", () => {
  it("un code recopié permet de rejoindre, sans passer par l'adresse", async () => {
    const { code, cle } = await emettreUnLienCourt();
    const jeton = decoderLeJeton(await ouvrirLInvitationCourte(BASE, { code, cle }));
    expect(jeton).toMatchObject({ spaceId: JETON.spaceId });
  });

  it("le même code saisi en minuscules et avec un tiret aboutit", async () => {
    const { code, cle } = await emettreUnLienCourt();
    const { normaliserLeCode } = await import("@/lib/invitation-courte");
    const saisi = normaliserLeCode(`${code.slice(0, 5).toLowerCase()}-${code.slice(5).toLowerCase()}`);
    expect(saisi).toBe(code);
    expect(decoderLeJeton(await ouvrirLInvitationCourte(BASE, { code: saisi!, cle }))).toMatchObject({
      spaceId: JETON.spaceId,
    });
  });
});
