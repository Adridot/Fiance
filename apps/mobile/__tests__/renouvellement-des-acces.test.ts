/**
 * Le renouvellement des accès, sans réseau : dérivation du dépôt, chiffrement,
 * validation du cap déposé, et décision du propriétaire.
 */
import { describe, expect, it } from "vitest";
import { generateDeviceKeys } from "@drakkar.software/starfish-identities";
import { mintMemberCap } from "@drakkar.software/starfish-sharing";
import { userIdFromPubHex } from "@drakkar.software/starfish-protocol";
import type { PermissionAssignment, RoleDefinition } from "@fiance/sdk";

import {
  DUREE_D_UN_ACCES_SEC,
  capDeRenouvellementValide,
  capPermetLEcriture,
  chiffrerLaDemande,
  chiffrerLeRenouvellement,
  deballerLaDemande,
  deballerLeRenouvellement,
  dechiffrerLaDemande,
  dechiffrerLeRenouvellement,
  demandeARedeposer,
  deriverLaDemande,
  deriverLeDepot,
  emballerLaDemande,
  expireBientot,
  lireLeCap,
  nonceDuCap,
  planDeReemission,
  sujetDeLaDemande,
  sujetDuCap,
  sujetsADemander,
  sujetsDuMagasin,
  type ReemissionConnue,
  type SujetDeLien,
} from "@/lib/renouvellement-des-acces";
import { decoderBase64Url, emballerLInvitation } from "@/lib/invitation-courte";

const JOUR = 24 * 3600;
const ESPACE = "sp-f88da0e30ce94f4dabcc6d050103e931";
const proprietaire = generateDeviceKeys();
const intrus = generateDeviceKeys();
const lien = generateDeviceKeys();
const autreLien = generateDeviceKeys();
type Cles = ReturnType<typeof generateDeviceKeys>;

const sujet = (k: Cles) => ({ edPubHex: k.edPub, kemPubHex: k.kemPub, userIdHex: userIdFromPubHex(k.edPub) });

function minter(o: {
  iss?: Cles;
  sub?: Cles;
  espace?: string;
  ecrire?: boolean;
  collection?: string;
  nbf?: number;
  ttlSec?: number;
  expiresAt?: number;
} = {}): Promise<Record<string, unknown>> {
  const iss = o.iss ?? proprietaire;
  return mintMemberCap(
    iss.edPriv,
    iss.edPub,
    sujet(o.sub ?? lien),
    o.collection ?? "content",
    {
      ops: o.ecrire === false ? ["read", "list"] : ["read", "write", "list"],
      collections: ["objdoc"],
      paths: [`spaces/${o.espace ?? ESPACE}/**`],
    },
    { nbf: o.nbf, ttlSec: o.ttlSec, expiresAt: o.expiresAt },
  ) as Promise<Record<string, unknown>>;
}

const maintenant = () => Math.floor(Date.now() / 1000);
/** Un cap de lien de 30 jours, expiré depuis dix jours. */
const ancienExpire = () => minter({ nbf: maintenant() - 40 * JOUR, ttlSec: 30 * JOUR });

describe("le dépôt de renouvellement", () => {
  it("code et clé sont stables, et propres à l'espace et au sujet", async () => {
    const a = await deriverLeDepot(ESPACE, "sujet-1");
    expect(await deriverLeDepot(ESPACE, "sujet-1")).toEqual(a);
    const autreSujet = await deriverLeDepot(ESPACE, "sujet-2");
    const autreEspace = await deriverLeDepot("sp-autre", "sujet-1");
    expect(autreSujet.code).not.toBe(a.code);
    expect(autreSujet.cle).not.toBe(a.cle);
    expect(autreEspace.code).not.toBe(a.code);
    expect(autreEspace.cle).not.toBe(a.cle);
  });

  it("le code est accepté par le serveur et ne peut pas croiser un code de lien court", async () => {
    const { code, cle } = await deriverLeDepot(ESPACE, "sujet-1");
    expect(code).toMatch(/^RN[0-9A-HJKMNP-TV-Z]{24}$/);
    expect(code).toMatch(/^[a-zA-Z0-9._:@-]+$/);
    expect(code).toHaveLength(26);
    expect(decoderBase64Url(cle)).toHaveLength(32);
    expect(code).not.toContain(cle.slice(0, 8));
  });

  it("aller-retour chiffré : le cap revient tel quel", async () => {
    const cap = await minter({ ttlSec: DUREE_D_UN_ACCES_SEC });
    const { cle } = await deriverLeDepot(ESPACE, "sujet-1");
    const depot = await chiffrerLeRenouvellement(cap, cle);
    expect(JSON.stringify(depot)).not.toContain(String(cap.nonce));
    expect(await dechiffrerLeRenouvellement(depot, cle)).toEqual(cap);
  });

  it("un dépôt ne s'ouvre pas sous la clé d'un autre sujet, ni altéré", async () => {
    const cap = await minter();
    const { cle } = await deriverLeDepot(ESPACE, "sujet-1");
    const { cle: autre } = await deriverLeDepot(ESPACE, "sujet-2");
    const depot = await chiffrerLeRenouvellement(cap, cle);
    expect(await dechiffrerLeRenouvellement(depot, autre)).toBeNull();
    const altere = { ...depot, ct: depot.ct.slice(0, -4) + (depot.ct.endsWith("AAAA") ? "BBBB" : "AAAA") };
    expect(await dechiffrerLeRenouvellement(altere, cle)).toBeNull();
  });

  it("seul un clair de renouvellement se déballe", () => {
    expect(deballerLeRenouvellement(emballerLInvitation({ jeton: "abc" }))).toBeNull();
    expect(deballerLeRenouvellement("pas du json")).toBeNull();
    expect(deballerLeRenouvellement(JSON.stringify({ v: 2, type: "renouvellement", cap: {} }))).toBeNull();
    expect(deballerLeRenouvellement(JSON.stringify({ v: 1, type: "renouvellement", cap: { a: 1 } }))).toEqual({ a: 1 });
  });
});

describe("le cap déposé", () => {
  it("même émetteur, même sujet, même espace, plus lointain : accepté", async () => {
    const ancien = await ancienExpire();
    const nouveau = await minter({ ttlSec: DUREE_D_UN_ACCES_SEC });
    expect(capDeRenouvellementValide(ancien, nouveau, ESPACE, maintenant())).toBe(true);
  });

  it("un cap pour un autre sujet est refusé", async () => {
    const ancien = await ancienExpire();
    expect(capDeRenouvellementValide(ancien, await minter({ sub: autreLien, ttlSec: DUREE_D_UN_ACCES_SEC }), ESPACE, maintenant())).toBe(false);
  });

  it("un cap signé par un autre que le propriétaire est refusé", async () => {
    const ancien = await ancienExpire();
    expect(capDeRenouvellementValide(ancien, await minter({ iss: intrus, ttlSec: DUREE_D_UN_ACCES_SEC }), ESPACE, maintenant())).toBe(false);
  });

  it("un cap sur un autre espace est refusé", async () => {
    const ancien = await ancienExpire();
    expect(
      capDeRenouvellementValide(ancien, await minter({ espace: "sp-autre", ttlSec: DUREE_D_UN_ACCES_SEC }), ESPACE, maintenant()),
    ).toBe(false);
  });

  it("une signature fausse est refusée", async () => {
    const ancien = await ancienExpire();
    const nouveau = await minter({ ttlSec: DUREE_D_UN_ACCES_SEC });
    expect(capDeRenouvellementValide(ancien, { ...nouveau, exp: (nouveau.exp as number) + 1 }, ESPACE, maintenant())).toBe(false);
    expect(capDeRenouvellementValide(ancien, { ...nouveau, subKem: autreLien.kemPub }, ESPACE, maintenant())).toBe(false);
  });

  it("une échéance qui n'est pas plus lointaine, ou déjà passée, est refusée", async () => {
    const ancien = await minter({ ttlSec: 30 * JOUR });
    expect(capDeRenouvellementValide(ancien, await minter({ expiresAt: ancien.exp as number }), ESPACE, maintenant())).toBe(false);
    const expire = await ancienExpire();
    const aussiExpire = await minter({ nbf: maintenant() - 20 * JOUR, ttlSec: 15 * JOUR });
    expect(capDeRenouvellementValide(expire, aussiExpire, ESPACE, maintenant())).toBe(false);
  });

  it("un cap pas encore valide, ou d'une autre collection, est refusé", async () => {
    const ancien = await ancienExpire();
    expect(capDeRenouvellementValide(ancien, await minter({ nbf: maintenant() + JOUR, ttlSec: DUREE_D_UN_ACCES_SEC }), ESPACE, maintenant())).toBe(false);
    expect(
      capDeRenouvellementValide(ancien, await minter({ collection: "objinv", ttlSec: DUREE_D_UN_ACCES_SEC }), ESPACE, maintenant()),
    ).toBe(false);
  });

  it("n'importe quoi d'autre est refusé", async () => {
    const ancien = await ancienExpire();
    expect(capDeRenouvellementValide(ancien, null, ESPACE, maintenant())).toBe(false);
    expect(capDeRenouvellementValide(ancien, "{", ESPACE, maintenant())).toBe(false);
    expect(capDeRenouvellementValide(ancien, { ...ancien, kind: "device" }, ESPACE, maintenant())).toBe(false);
  });

  it("lit le cap, objet ou JSON, et ce qu'il accorde", async () => {
    const cap = await minter({ ecrire: false, ttlSec: 10 * JOUR });
    expect(lireLeCap(JSON.stringify(cap))).toEqual(cap);
    expect(nonceDuCap(JSON.stringify(cap))).toBe(cap.nonce);
    expect(sujetDuCap(cap)).toBe(userIdFromPubHex(lien.edPub));
    expect(capPermetLEcriture(cap)).toBe(false);
    expect(capPermetLEcriture(await minter())).toBe(true);
    expect(expireBientot(cap, maintenant(), 30 * JOUR)).toBe(true);
    expect(expireBientot(cap, maintenant(), 5 * JOUR)).toBe(false);
    expect(expireBientot({}, maintenant(), 30 * JOUR)).toBe(false);
  });

  it("un lien émis par l'app vaut trois ans", async () => {
    const cap = await minter({ ttlSec: DUREE_D_UN_ACCES_SEC });
    expect((cap.exp as number) - (cap.nbf as number)).toBe(3 * 365 * JOUR);
  });
});

describe("le magasin d'invitations", () => {
  it("rend les sujets de cet espace, avec l'échéance de leur lien", () => {
    const brut = JSON.stringify({
      [`${ESPACE}:sujet-1`]: { edPub: "ed1", kemPub: "kem1", cap: { nonce: "n1", exp: 123 } },
      [`${ESPACE}:sujet-2`]: { edPub: "ed2", kemPub: "kem2" },
      [`sp-autre:sujet-3`]: { edPub: "ed3", kemPub: "kem3", cap: { nonce: "n3", exp: 1 } },
      [`${ESPACE}:sujet-4`]: { edPub: 4 },
    });
    expect(sujetsDuMagasin(brut, ESPACE)).toEqual([
      { subUserId: "sujet-1", edPub: "ed1", kemPub: "kem1", exp: 123 },
      { subUserId: "sujet-2", edPub: "ed2", kemPub: "kem2", exp: null },
    ]);
    expect(sujetsDuMagasin("{", ESPACE)).toEqual([]);
    expect(sujetsDuMagasin(null, ESPACE)).toEqual([]);
  });
});

describe("ce que le propriétaire réémet", () => {
  const MAINTENANT_MS = 1_800_000_000_000;
  const MAINTENANT = MAINTENANT_MS / 1000;
  const role = (id: string, edit: boolean): RoleDefinition => ({
    id,
    name: id,
    isSystem: false,
    tier: edit ? "app-cosmetic" : "app-readonly",
    matrix: { guests: edit ? "edit" : "view" },
    createdAt: null,
    updatedAt: null,
  });
  const ROLES = [role("r-edit", true), role("r-vue", false)];
  const affecte = (subjectUserId: string, roleId: string): PermissionAssignment => ({
    id: `a-${subjectUserId}`,
    subjectUserId,
    roleId,
    label: null,
    createdAt: null,
    updatedAt: null,
  });
  const s = (subUserId: string, exp: number | null): SujetDeLien => ({ subUserId, edPub: `ed-${subUserId}`, kemPub: `kem-${subUserId}`, exp });
  const plan = (o: {
    sujets: SujetDeLien[];
    membres?: string[];
    affectations?: PermissionAssignment[];
    connues?: Record<string, ReemissionConnue>;
  }) =>
    planDeReemission({
      sujets: o.sujets,
      membres: o.membres ?? o.sujets.map((x) => x.subUserId),
      affectations: o.affectations ?? o.sujets.map((x) => affecte(x.subUserId, "r-edit")),
      roles: ROLES,
      connues: o.connues ?? {},
      maintenantMs: MAINTENANT_MS,
    });

  it("un membre retiré de `_access` n'est jamais réémis", () => {
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], membres: [] })).toEqual([]);
  });

  it("un sujet sans affectation, ou au rôle supprimé, n'est jamais réémis", () => {
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], affectations: [] })).toEqual([]);
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], affectations: [affecte("u1", "r-disparu")] })).toEqual([]);
  });

  it("un accès loin de son échéance n'est pas touché", () => {
    expect(plan({ sujets: [s("u1", MAINTENANT + 90 * JOUR)] })).toEqual([]);
  });

  it("expiré, à moins de 60 jours, ou d'échéance inconnue : réémis, avec le droit d'écrire de son rôle", () => {
    const decisions = plan({
      sujets: [s("u1", MAINTENANT - JOUR), s("u2", MAINTENANT + 59 * JOUR), s("u3", null)],
      affectations: [affecte("u1", "r-edit"), affecte("u2", "r-vue"), affecte("u3", "r-edit")],
    });
    expect(decisions.map((d) => [d.sujet.subUserId, d.reemettre, d.peutEcrire])).toEqual([
      ["u1", true, true],
      ["u2", true, false],
      ["u3", true, true],
    ]);
  });

  it("déjà réémis : redéposé seulement après trois jours, sans reminter", () => {
    const connue = (deposeIlYA: number): Record<string, ReemissionConnue> => ({
      u1: { cap: {}, exp: MAINTENANT + 1000 * JOUR, deposeLe: MAINTENANT_MS - deposeIlYA * 1000 },
    });
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], connues: connue(2 * JOUR) })).toEqual([]);
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], connues: connue(3 * JOUR) }).map((d) => d.reemettre)).toEqual([false]);
  });

  it("un cap réémis qui approche lui-même de son terme est réémis à son tour", () => {
    const connues = { u1: { cap: {}, exp: MAINTENANT + 30 * JOUR, deposeLe: MAINTENANT_MS } };
    expect(plan({ sujets: [s("u1", MAINTENANT - JOUR)], connues }).map((d) => d.reemettre)).toEqual([true]);
  });
});

describe("la demande de renouvellement (le membre se fait connaître)", () => {
  const SUJET = userIdFromPubHex(lien.edPub);
  const attendu = { spaceId: ESPACE, subUserId: SUJET, issEdPub: proprietaire.edPub };

  it("code et clé distincts de ceux de la réémission, pour le même sujet", async () => {
    const reemission = await deriverLeDepot(ESPACE, SUJET);
    const demande = await deriverLaDemande(ESPACE, SUJET);
    expect(demande.code).toMatch(/^RQ[0-9A-HJKMNP-TV-Z]{24}$/);
    expect(reemission.code).toMatch(/^RN/);
    expect(demande.code.slice(2)).not.toBe(reemission.code.slice(2));
    expect(demande.cle).not.toBe(reemission.cle);
    expect(await deriverLaDemande(ESPACE, SUJET)).toEqual(demande);
  });

  it("une demande ne s'ouvre ni sous la clé de la réémission, ni comme une réémission", async () => {
    const cap = await ancienExpire();
    const demande = await deriverLaDemande(ESPACE, SUJET);
    const reemission = await deriverLeDepot(ESPACE, SUJET);
    const depot = await chiffrerLaDemande(cap, demande.cle);
    expect(await dechiffrerLaDemande(depot, demande.cle)).toEqual(cap);
    expect(await dechiffrerLaDemande(depot, reemission.cle)).toBeNull();
    expect(await dechiffrerLeRenouvellement(depot, demande.cle)).toBeNull();
    expect(await dechiffrerLaDemande(await chiffrerLeRenouvellement(cap, demande.cle), demande.cle)).toBeNull();
  });

  it("le clair ne porte que le cap : jamais `key` ni `kemPriv`", async () => {
    const cap = await ancienExpire();
    const clair = emballerLaDemande(cap);
    expect(Object.keys(JSON.parse(clair))).toEqual(["v", "type", "cap"]);
    expect(JSON.parse(clair).type).toBe("demande-de-renouvellement");
    expect(clair).not.toContain(lien.edPriv);
    expect(clair).not.toContain(lien.kemPriv);
    expect(deballerLaDemande(clair)).toEqual(cap);
    expect(deballerLaDemande(JSON.stringify({ v: 1, type: "renouvellement", cap }))).toBeNull();
  });

  it("acceptée : le cap, même expiré, signé par le propriétaire pour ce sujet et cet espace", async () => {
    const cap = await ancienExpire();
    expect(sujetDeLaDemande(cap, attendu)).toEqual({ subUserId: SUJET, edPub: lien.edPub, kemPub: lien.kemPub, exp: cap.exp });
    expect(sujetDeLaDemande(JSON.stringify(cap), attendu)).not.toBeNull();
  });

  it("refusée si signée par une autre clé que celle du propriétaire courant", async () => {
    expect(sujetDeLaDemande(await minter({ iss: intrus }), attendu)).toBeNull();
    expect(sujetDeLaDemande(await minter(), { ...attendu, issEdPub: intrus.edPub })).toBeNull();
  });

  it("refusée si la signature est fausse", async () => {
    const cap = await ancienExpire();
    expect(sujetDeLaDemande({ ...cap, subKem: autreLien.kemPub }, attendu)).toBeNull();
    expect(sujetDeLaDemande({ ...cap, exp: (cap.exp as number) + 1 }, attendu)).toBeNull();
  });

  it("refusée pour un autre sujet, un autre espace, une autre collection, un autre genre de cap", async () => {
    expect(sujetDeLaDemande(await minter({ sub: autreLien }), attendu)).toBeNull();
    expect(sujetDeLaDemande(await minter({ espace: "sp-autre" }), attendu)).toBeNull();
    expect(sujetDeLaDemande(await minter(), { ...attendu, spaceId: "sp-autre" })).toBeNull();
    expect(sujetDeLaDemande(await minter({ collection: "objinv" }), attendu)).toBeNull();
    expect(sujetDeLaDemande({ ...(await minter()), kind: "device" }, attendu)).toBeNull();
    expect(sujetDeLaDemande(null, attendu)).toBeNull();
  });

  it("redéposée si jamais déposée, ou déposée il y a trois jours ou plus", () => {
    const T = 1_800_000_000_000;
    expect(demandeARedeposer(undefined, T)).toBe(true);
    expect(demandeARedeposer(T - 2 * JOUR * 1000, T)).toBe(false);
    expect(demandeARedeposer(T - 3 * JOUR * 1000, T)).toBe(true);
  });
});

describe("les sujets que le propriétaire interroge", () => {
  const role: RoleDefinition = {
    id: "r", name: "r", isSystem: false, tier: "app-cosmetic", matrix: { guests: "edit" }, createdAt: null, updatedAt: null,
  };
  const affecte = (subjectUserId: string, roleId = "r"): PermissionAssignment => ({
    id: `a-${subjectUserId}`, subjectUserId, roleId, label: null, createdAt: null, updatedAt: null,
  });

  it("membres de `_access`, affectés à un rôle qui existe, et inconnus du magasin local", () => {
    expect(
      sujetsADemander({
        membres: ["connu", "affecte", "sans-affectation", "role-disparu", "affecte"],
        affectations: [affecte("connu"), affecte("affecte"), affecte("role-disparu", "x"), affecte("hors-access")],
        roles: [role],
        connus: ["connu"],
      }),
    ).toEqual(["affecte"]);
  });

  it("personne à interroger sans membre", () => {
    expect(sujetsADemander({ membres: [], affectations: [affecte("u")], roles: [role], connus: [] })).toEqual([]);
  });
});
