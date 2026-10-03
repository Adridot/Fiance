/**
 * Le renouvellement automatique de bout en bout, serveur de dépôt simulé :
 * le propriétaire réémet et dépose, le membre retrouve et adopte — ou, faute de
 * dépôt, se fait connaître par une demande.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateDeviceKeys } from "@drakkar.software/starfish-identities";
import { mintMemberCap } from "@drakkar.software/starfish-sharing";
import { userIdFromPubHex, verifyCapCertSignature } from "@drakkar.software/starfish-protocol";

const JOUR = 24 * 3600;
const ESPACE = "sp-f88da0e30ce94f4dabcc6d050103e931";
const BASE = "https://mariage.example/sync";

const proprietaire = generateDeviceKeys();
const lienEmma = generateDeviceKeys();
const lienRevoque = generateDeviceKeys();
const lienSansRole = generateDeviceKeys();
const EMMA = userIdFromPubHex(lienEmma.edPub);
const REVOQUE = userIdFromPubHex(lienRevoque.edPub);
const SANS_ROLE = userIdFromPubHex(lienSansRole.edPub);

let mockMagasin = "{}";
let mockMembres: string[] = [];
let mockEntree: unknown = null;
const mockJoin = vi.fn(async () => ({}));
const mockVider = vi.fn();
const mockSauver = vi.fn((spaceId: string, userId: string, entree: unknown) => {
  mockMagasin = JSON.stringify({ ...JSON.parse(mockMagasin), [`${spaceId}:${userId}`]: entree });
});
const mockPersister = vi.fn();
const mockCoffre = vi.fn();

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSyncNamespace: () => "dk",
  serializeSpaceInviteStore: () => mockMagasin,
  saveSpaceInviteEntry: (...args: [string, string, unknown]) => mockSauver(...args),
  readSpaceAccess: vi.fn(async () => ({ owner: "owner", members: mockMembres, name: null, image: null, hash: "h" })),
  getSpaceAccessEntry: () => mockEntree,
  hydrateSpaceAccessStore: vi.fn(async () => {}),
  joinSpaceByLink: (...args: unknown[]) => mockJoin(...(args as [])),
  clearNodeAccessCache: () => mockVider(),
}));

const kv = new Map<string, unknown>();
vi.mock("@/lib/kv-storage", () => ({
  readCollection: (cle: string) => (kv.has(cle) ? kv.get(cle) : null),
  writeCollection: (cle: string, v: unknown) => { kv.set(cle, JSON.parse(JSON.stringify(v))); },
}));
vi.mock("@/lib/invite-link", () => ({ hydraterLeMagasinDInvitations: vi.fn(), persisterLeMagasinDInvitations: () => mockPersister() }));
vi.mock("@/lib/compte-session", () => ({ planifierLeCoffre: () => mockCoffre() }));

const ROLES = [
  { id: "r-edit", name: "Édition", isSystem: false, tier: "app-cosmetic", matrix: { guests: "edit" }, createdAt: null, updatedAt: null },
];
let mockAffectations: { id: string; subjectUserId: string; roleId: string; label: null; createdAt: null; updatedAt: null }[] = [];
vi.mock("@/store/usePermissionsStore", () => ({
  usePermissionsStore: { getState: () => ({ roles: ROLES, assignments: mockAffectations }) },
}));

/** Le dépôt `_invite/{code}` : lecture et écriture publiques, CAS sur `baseHash`. */
const depots = new Map<string, { hash: string; data: unknown }>();
let compteur = 0;
const lectures: string[] = [];
const ecritures: string[] = [];
function serveurDeDepot() {
  return vi.fn(async (url: string, init?: { method?: string; body?: string }) => {
    const m = /\/v1\/dk\/(pull|push)\/_invite\/([^/?#]+)$/.exec(url);
    if (!m) return new Response("introuvable", { status: 404 });
    const [, sens, code] = m;
    if (sens === "pull") {
      lectures.push(code);
      return Response.json(depots.get(code) ?? { hash: "", data: {} });
    }
    const { data, baseHash } = JSON.parse(init?.body ?? "{}") as { data: unknown; baseHash: string | null };
    const actuel = depots.get(code);
    if (actuel && actuel.hash !== baseHash) {
      return Response.json({ error: "hash_mismatch", currentHash: actuel.hash }, { status: 409 });
    }
    const hash = `h${++compteur}`;
    depots.set(code, { hash, data });
    ecritures.push(code);
    return Response.json({ hash });
  });
}

const sujetDe = (k: ReturnType<typeof generateDeviceKeys>) => ({
  edPubHex: k.edPub,
  kemPubHex: k.kemPub,
  userIdHex: userIdFromPubHex(k.edPub),
});

async function sessionProprietaire() {
  const { defaultSpaceLayout } = await import("@fiance/sdk");
  return {
    userId: userIdFromPubHex(proprietaire.edPub),
    keys: proprietaire,
    layout: defaultSpaceLayout,
    accountClient: {},
  } as never;
}

/** Le cap du lien d'Emma, émis il y a 40 jours pour 30 : expiré. */
async function capExpire() {
  const maintenant = Math.floor(Date.now() / 1000);
  return mintMemberCap(
    proprietaire.edPriv,
    proprietaire.edPub,
    sujetDe(lienEmma),
    "content",
    { ops: ["read", "write", "list"], collections: ["objdoc"], paths: [`spaces/${ESPACE}/**`] },
    { nbf: maintenant - 40 * JOUR, ttlSec: 30 * JOUR },
  );
}

const affecte = (subjectUserId: string) => ({ id: `a-${subjectUserId}`, subjectUserId, roleId: "r-edit", label: null, createdAt: null, updatedAt: null });

describe("renouvellement automatique", () => {
  beforeEach(async () => {
    vi.resetModules();
    kv.clear();
    depots.clear();
    lectures.length = 0;
    ecritures.length = 0;
    for (const m of [mockJoin, mockVider, mockSauver, mockPersister, mockCoffre]) m.mockClear();
    vi.stubGlobal("fetch", serveurDeDepot());
    const expire = Math.floor(Date.now() / 1000) - 10 * JOUR;
    const entree = (k: ReturnType<typeof generateDeviceKeys>) => ({ edPub: k.edPub, kemPub: k.kemPub, cap: { nonce: "n", exp: expire } });
    mockMagasin = JSON.stringify({
      [`${ESPACE}:${EMMA}`]: entree(lienEmma),
      [`${ESPACE}:${REVOQUE}`]: entree(lienRevoque),
      [`${ESPACE}:${SANS_ROLE}`]: entree(lienSansRole),
    });
    // Le révoqué a quitté `_access` ; l'autre n'a plus d'affectation.
    mockMembres = [EMMA, SANS_ROLE];
    mockAffectations = [affecte(EMMA), affecte(REVOQUE)];
    mockEntree = { kind: "link", cap: await capExpire(), key: lienEmma.edPriv, kemPriv: lienEmma.kemPriv, kemPub: lienEmma.kemPub, write: true };
  });

  it("le propriétaire réémet et dépose pour le seul membre encore affecté", async () => {
    const { reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    const { deriverLeDepot, dechiffrerLeRenouvellement, DUREE_D_UN_ACCES_SEC } = await import("@/lib/renouvellement-des-acces");

    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(1);

    const { code, cle } = await deriverLeDepot(ESPACE, EMMA);
    expect([...depots.keys()]).toEqual([code]);
    const cap = (await dechiffrerLeRenouvellement(depots.get(code)!.data as never, cle)) as Record<string, unknown>;
    expect(cap).toMatchObject({ kind: "member", iss: proprietaire.edPub, sub: lienEmma.edPub, subKem: lienEmma.kemPub, subUserId: EMMA });
    expect(verifyCapCertSignature(cap as never)).toBe(true);
    expect((cap.exp as number) - (cap.nbf as number)).toBe(DUREE_D_UN_ACCES_SEC);
    expect((cap.scope as { ops: string[] }).ops).toContain("write");
  });

  it("ne remint pas à chaque démarrage, et ne redépose qu'après trois jours", async () => {
    const { reemettreLesAcces, REEMISSIONS_KEY } = await import("@/lib/renouvellement-automatique");
    const session = await sessionProprietaire();
    await reemettreLesAcces(session, ESPACE, BASE);
    const premier = (kv.get(REEMISSIONS_KEY) as Record<string, { cap: { nonce: string } }>)[EMMA].cap.nonce;

    expect(await reemettreLesAcces(session, ESPACE, BASE)).toBe(0);
    expect(await reemettreLesAcces(session, ESPACE, BASE, Date.now() + 4 * JOUR * 1000)).toBe(1);
    expect((kv.get(REEMISSIONS_KEY) as Record<string, { cap: { nonce: string } }>)[EMMA].cap.nonce).toBe(premier);
  });

  it("le membre retrouve le dépôt et adopte le nouvel accès, avec sa clé de lien", async () => {
    const { reemettreLesAcces, adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE);

    const membre = { userId: "emma" } as never;
    expect(await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage")).toBe(true);

    expect(mockJoin).toHaveBeenCalledTimes(1);
    const [session, jeton] = mockJoin.mock.calls[0] as unknown as [unknown, Record<string, unknown>];
    expect(session).toBe(membre);
    expect(jeton).toMatchObject({ v: 1, spaceId: ESPACE, key: lienEmma.edPriv, kemPriv: lienEmma.kemPriv, kemPub: lienEmma.kemPub, write: true });
    expect((jeton.cap as { exp: number }).exp).toBeGreaterThan(Math.floor(Date.now() / 1000) + 1000 * JOUR);
    expect(mockVider).toHaveBeenCalled();
  });

  it("sans dépôt de réémission, rien n'est adopté", async () => {
    const { adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    expect(await adopterUnAccesReemis({ userId: "emma" } as never, ESPACE, BASE, "Mariage")).toBe(false);
    expect(mockJoin).not.toHaveBeenCalled();
  });

  it("un dépôt planté par un tiers à l'adresse du sujet est écarté", async () => {
    const { adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    const { deriverLeDepot, chiffrerLeRenouvellement } = await import("@/lib/renouvellement-des-acces");
    // Code et clé se recalculent depuis l'espace et le sujet : un tiers peut écrire là.
    const intrus = generateDeviceKeys();
    const contrefait = await mintMemberCap(
      intrus.edPriv,
      intrus.edPub,
      sujetDe(lienEmma),
      "content",
      { ops: ["read", "write", "list"], collections: ["objdoc"], paths: [`spaces/${ESPACE}/**`] },
      { ttlSec: 3 * 365 * JOUR },
    );
    const { code, cle } = await deriverLeDepot(ESPACE, EMMA);
    depots.set(code, { hash: "h0", data: await chiffrerLeRenouvellement(contrefait, cle) });

    expect(await adopterUnAccesReemis({ userId: "emma" } as never, ESPACE, BASE, "Mariage")).toBe(false);
    expect(mockJoin).not.toHaveBeenCalled();
  });

  it("un accès loin de son terme ne cherche même pas de dépôt", async () => {
    const { adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    const cap = await mintMemberCap(
      proprietaire.edPriv,
      proprietaire.edPub,
      sujetDe(lienEmma),
      "content",
      { ops: ["read", "list"], collections: ["objdoc"], paths: [`spaces/${ESPACE}/**`] },
      { ttlSec: 90 * JOUR },
    );
    mockEntree = { kind: "link", cap, key: lienEmma.edPriv, write: false };
    expect(await adopterUnAccesReemis({ userId: "emma" } as never, ESPACE, BASE, "Mariage")).toBe(false);
    expect(lectures).toEqual([]);
  });
});

describe("la demande de renouvellement", () => {
  beforeEach(async () => {
    vi.resetModules();
    kv.clear();
    depots.clear();
    lectures.length = 0;
    ecritures.length = 0;
    for (const m of [mockJoin, mockVider, mockSauver, mockPersister, mockCoffre]) m.mockClear();
    vi.stubGlobal("fetch", serveurDeDepot());
    // Le propriétaire a perdu son magasin d'invitations ; Emma est encore membre, encore affectée.
    mockMagasin = "{}";
    mockMembres = [EMMA];
    mockAffectations = [affecte(EMMA)];
    mockEntree = { kind: "link", cap: await capExpire(), key: lienEmma.edPriv, kemPriv: lienEmma.kemPriv, kemPub: lienEmma.kemPub, write: true };
  });

  async function deposerUneDemande(cap: unknown) {
    const { deriverLaDemande, chiffrerLaDemande } = await import("@/lib/renouvellement-des-acces");
    const { code, cle } = await deriverLaDemande(ESPACE, EMMA);
    depots.set(code, { hash: "h0", data: await chiffrerLaDemande(cap, cle) });
    return code;
  }

  it("le membre sans réémission dépose une demande chiffrée qui ne porte que son cap", async () => {
    const { adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    const { deriverLaDemande } = await import("@/lib/renouvellement-des-acces");
    const { dechiffrerLeDepot } = await import("@/lib/invitation-courte");

    expect(await adopterUnAccesReemis({ userId: "emma" } as never, ESPACE, BASE, "Mariage")).toBe(false);

    const { code, cle } = await deriverLaDemande(ESPACE, EMMA);
    expect(ecritures).toEqual([code]);
    const clair = await dechiffrerLeDepot(depots.get(code)!.data as never, cle);
    expect(JSON.parse(clair)).toEqual({ v: 1, type: "demande-de-renouvellement", cap: (mockEntree as { cap: unknown }).cap });
    expect(clair).not.toContain(lienEmma.edPriv);
    expect(clair).not.toContain(lienEmma.kemPriv);
  });

  it("la demande n'est redéposée qu'après trois jours", async () => {
    const { adopterUnAccesReemis } = await import("@/lib/renouvellement-automatique");
    const membre = { userId: "emma" } as never;
    await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage");
    await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage", Date.now() + 2 * JOUR * 1000);
    expect(ecritures).toHaveLength(1);
    await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage", Date.now() + 3 * JOUR * 1000 + 1000);
    expect(ecritures).toHaveLength(2);
  });

  it("le propriétaire lit la demande d'un sujet qu'il ne connaît plus, l'enregistre et réémet", async () => {
    const { reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    const { deriverLeDepot, dechiffrerLeRenouvellement } = await import("@/lib/renouvellement-des-acces");
    const demande = await deposerUneDemande(await capExpire());

    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(1);

    expect(mockSauver).toHaveBeenCalledWith(ESPACE, EMMA, expect.objectContaining({ edPub: lienEmma.edPub, kemPub: lienEmma.kemPub }));
    expect(mockPersister).toHaveBeenCalled();
    expect(mockCoffre).toHaveBeenCalled();
    const { code, cle } = await deriverLeDepot(ESPACE, EMMA);
    const cap = (await dechiffrerLeRenouvellement(depots.get(code)!.data as never, cle)) as Record<string, unknown>;
    expect(cap).toMatchObject({ iss: proprietaire.edPub, sub: lienEmma.edPub, subKem: lienEmma.kemPub, subUserId: EMMA });
    expect(verifyCapCertSignature(cap as never)).toBe(true);

    // Désormais connu : sa demande n'est plus relue.
    lectures.length = 0;
    await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE);
    expect(lectures).not.toContain(demande);
  });

  it("une demande signée par une autre clé est écartée", async () => {
    const { reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    const intrus = generateDeviceKeys();
    await deposerUneDemande(
      await mintMemberCap(intrus.edPriv, intrus.edPub, sujetDe(lienEmma), "content",
        { ops: ["read", "write", "list"], collections: ["objdoc"], paths: [`spaces/${ESPACE}/**`] }, { ttlSec: 30 * JOUR }),
    );
    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(0);
    expect(mockSauver).not.toHaveBeenCalled();
    expect(ecritures).toEqual([]);
  });

  it("une demande dont la portée vise un autre espace est écartée", async () => {
    const { reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    await deposerUneDemande(
      await mintMemberCap(proprietaire.edPriv, proprietaire.edPub, sujetDe(lienEmma), "content",
        { ops: ["read", "write", "list"], collections: ["objdoc"], paths: ["spaces/sp-autre/**"] }, { ttlSec: 30 * JOUR }),
    );
    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(0);
    expect(ecritures).toEqual([]);
  });

  it("un sujet retiré de `_access`, ou sans affectation, n'est même pas interrogé", async () => {
    const { reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    const demande = await deposerUneDemande(await capExpire());

    mockMembres = [];
    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(0);
    mockMembres = [EMMA];
    mockAffectations = [];
    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(0);

    expect(lectures).not.toContain(demande);
    expect(ecritures).toEqual([]);
    expect(mockSauver).not.toHaveBeenCalled();
  });

  it("aller-retour : le membre demande, le propriétaire réémet, le membre adopte — sans nouveau lien", async () => {
    const { adopterUnAccesReemis, reemettreLesAcces } = await import("@/lib/renouvellement-automatique");
    const membre = { userId: "emma" } as never;

    expect(await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage")).toBe(false);
    expect(await reemettreLesAcces(await sessionProprietaire(), ESPACE, BASE)).toBe(1);
    expect(await adopterUnAccesReemis(membre, ESPACE, BASE, "Mariage")).toBe(true);

    const [, jeton] = mockJoin.mock.calls[0] as unknown as [unknown, Record<string, unknown>];
    expect(jeton).toMatchObject({ spaceId: ESPACE, key: lienEmma.edPriv, kemPriv: lienEmma.kemPriv, kemPub: lienEmma.kemPub, write: true });
    expect(jeton.cap).toMatchObject({ sub: lienEmma.edPub, subUserId: EMMA });
    expect((jeton.cap as { exp: number }).exp).toBeGreaterThan(Math.floor(Date.now() / 1000) + 1000 * JOUR);
  });
});
