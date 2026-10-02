/**
 * Ce qu'une personne colle ou tape sur l'accueil : lien court, lien long,
 * « CODE#clé » ou « CODE clé » — toutes les formes rendent la même invitation.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSyncNamespace: () => "dk",
}));

import { encodeSpaceInviteLink, type SpaceInviteLinkToken } from "@fiance/sdk";
import { resoudreUneSaisie } from "@/lib/resolution-d-invitation";
import {
  chiffrerLeJeton,
  consommer,
  construireLeLienCourt,
  deposer,
  emballerLInvitation,
  tirerUnCode,
  type DepotChiffre,
} from "@/lib/invitation-courte";

const JETON: SpaceInviteLinkToken = {
  v: 1,
  spaceId: "sp-f88da0e30ce94f4dabcc6d050103e931",
  spaceName: "Léa",
  write: true,
  key: "a".repeat(64),
  kemPriv: "b".repeat(64),
  kemPub: "c".repeat(64),
  cap: { iss: "d".repeat(32), sub: "e".repeat(32), exp: 4102444800, nonce: "f".repeat(32) },
} as unknown as SpaceInviteLinkToken;

const BASE = "https://mariage.didot.io/sync";
const ORIGINE = "https://mariage.didot.io";

let depots: Record<string, unknown> = {};
let appels = 0;

beforeEach(() => {
  depots = {};
  appels = 0;
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    appels += 1;
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

function fragmentLong(): string {
  const url = encodeSpaceInviteLink(ORIGINE, JETON);
  return url.slice(url.indexOf("#") + 1);
}

async function emettre() {
  const { depot, cle } = await chiffrerLeJeton(
    emballerLInvitation({ jeton: fragmentLong(), nomDuMariage: "Adrien & Emma", nomDeLaPersonne: "Léa" }),
  );
  const code = tirerUnCode();
  await deposer(BASE, code, depot);
  return { code, cle, lien: construireLeLienCourt(ORIGINE, code, cle) };
}

describe("resoudreUneSaisie", () => {
  it("un lien court complet", async () => {
    const { lien, code } = await emettre();
    expect(await resoudreUneSaisie(BASE, lien)).toMatchObject({
      jeton: { spaceId: JETON.spaceId },
      nomDuMariage: "Adrien & Emma",
      nomDeLaPersonne: "Léa",
      code,
    });
  });

  it("un lien court noyé dans le message d'invitation", async () => {
    const { lien, code } = await emettre();
    const message = `Bonjour Léa, voici ton invitation pour préparer le mariage avec nous : ${lien} — elle est valable 7 jours et ne sert qu'une fois.`;
    expect(await resoudreUneSaisie(BASE, message)).toMatchObject({ jeton: { spaceId: JETON.spaceId }, code });
  });

  it("un lien long, sans appel au serveur", async () => {
    const r = await resoudreUneSaisie(BASE, `${ORIGINE}/join#${fragmentLong()}`);
    expect(r).toMatchObject({ jeton: { spaceId: JETON.spaceId } });
    expect(appels).toBe(0);
  });

  it("« CODE#clé »", async () => {
    const { code, cle } = await emettre();
    expect(await resoudreUneSaisie(BASE, `${code}#${cle}`)).toMatchObject({ jeton: { spaceId: JETON.spaceId }, code });
  });

  it("« CODE clé », avec espaces superflus", async () => {
    const { code, cle } = await emettre();
    expect(await resoudreUneSaisie(BASE, `  ${code}   ${cle}\n`)).toMatchObject({ code });
  });

  it("un code tapé en minuscules et coupé d'un tiret", async () => {
    const { code, cle } = await emettre();
    const tapé = `${code.slice(0, 5)}-${code.slice(5)}`.toLowerCase();
    expect(await resoudreUneSaisie(BASE, `${tapé} ${cle}`)).toMatchObject({ code });
  });

  it("un code sans sa clé est INCOMPLET", async () => {
    const { code } = await emettre();
    expect(await resoudreUneSaisie(BASE, code)).toEqual({ cause: "incomplete" });
    expect(await resoudreUneSaisie(BASE, `${code}#`)).toEqual({ cause: "incomplete" });
  });

  it("une adresse /i/<code> sans fragment est INCOMPLÈTE", async () => {
    const { lien } = await emettre();
    expect(await resoudreUneSaisie(BASE, lien.split("#")[0])).toEqual({ cause: "incomplete" });
  });

  it("n'importe quoi est INVALIDE, sans appel au serveur", async () => {
    for (const saisie of ["", "   ", "bonjour tout le monde", "https://exemple.org/page"]) {
      expect(await resoudreUneSaisie(BASE, saisie)).toEqual({ cause: "invalide" });
    }
    expect(appels).toBe(0);
  });

  it("un dépôt consommé est UTILISÉ, quelle que soit la forme saisie", async () => {
    const { lien, code, cle } = await emettre();
    await consommer(BASE, code);
    expect(await resoudreUneSaisie(BASE, lien)).toEqual({ cause: "utilisee" });
    expect(await resoudreUneSaisie(BASE, `${code}#${cle}`)).toEqual({ cause: "utilisee" });
  });

  it("un dépôt absent est EXPIRÉ", async () => {
    const { code, cle } = await emettre();
    depots[code] = {};
    expect(await resoudreUneSaisie(BASE, `${code} ${cle}`)).toEqual({ cause: "expiree" });
  });
});
