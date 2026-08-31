/**
 * Le rescellement d'un espace côté application.
 *
 * Même contrat que `fiance-db reseal` : sauter ce qui est déjà à l'époque
 * courante, ne rien changer au contenu, relire avant de rechiffrer en cas de
 * conflit, et nommer ce qui reste quand il en reste.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

interface DocumentDeTest {
  hash: string;
  data: Record<string, unknown> | null;
}

let mockArbre: unknown[] = [];
let mockKeyring: unknown = null;
let mockDocs: Record<string, DocumentDeTest> = {};
let mockPoussEnEchec: Set<string> = new Set();
const mockPoussees: { nodeId: string; contenu: unknown }[] = [];
/** Les nœuds dont la première poussée lève un conflit — le mutateur doit être rappelé. */
let mockConflitUneFois: Set<string> = new Set();

vi.mock("@fiance/sdk", () => ({
  readObjectTree: async () => mockArbre,
  objDocPull: (s: string, n: string) => `pull/${s}/${n}`,
  objDocPush: (s: string, n: string) => `push/${s}/${n}`,
  getNodeAccess: async (_sid: string, nodeId: string) => ({
    encryptor: { encrypt: async (d: unknown) => d, decrypt: async (d: unknown) => d },
    client: {
      pull: async (chemin: string) => {
        if (chemin.includes("_keyring")) return { hash: "k", data: mockKeyring };
        return mockDocs[nodeId] ?? { hash: "", data: {} };
      },
      push: vi.fn(),
    },
    push: async (
      _pull: string,
      _push: string,
      mutateur: (cur: Record<string, unknown> | null) => Record<string, unknown> | null,
    ) => {
      if (mockPoussEnEchec.has(nodeId)) throw new Error("403");
      if (mockConflitUneFois.has(nodeId)) {
        // Premier essai au hash périmé : `runCas` relit et rappelle le mutateur.
        mockConflitUneFois.delete(nodeId);
        mutateur(null);
      }
      const suite = mutateur(mockDocs[nodeId]?.data ?? null);
      if (suite === null) return;
      mockPoussees.push({ nodeId, contenu: suite });
      mockDocs[nodeId] = { hash: "h2", data: { ...(suite as Record<string, unknown>), _epoch: 2 } };
    },
  }),
}));

vi.mock("@/lib/space-sync", () => ({ neutraliserCachesDePoussée: vi.fn() }));

const SESSION = {
  userId: "u1",
  layout: { keyringPull: (id: string) => `pull/spaces/${id}/_keyring` },
} as never;

const KEYRING = { currentEpoch: 2, epochs: { "1": { wrappedKeys: [] }, "2": { wrappedKeys: [] } } };

function noeud(type: string, enc = true) {
  return { id: `col:${type}:node-A`, type, parentId: "node-A", enc, access: "space", contentKind: "merge", updatedAt: 1 };
}

describe("rescellerEspace", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPoussees.length = 0;
    mockPoussEnEchec = new Set();
    mockConflitUneFois = new Set();
    mockKeyring = KEYRING;
    mockArbre = [noeud("guest"), noeud("vendor"), noeud("household")];
    mockDocs = {
      "col:guest:node-A": { hash: "h", data: { _encrypted: "…", _epoch: 1, items: { g1: { id: "g1" } } } },
      "col:vendor:node-A": { hash: "h", data: { _encrypted: "…", _epoch: 1, items: {} } },
      "col:household:node-A": { hash: "h", data: { _encrypted: "…", _epoch: 2, items: {} } },
    };
  });

  it("rescelle ce qui est en retard et saute ce qui est à jour", async () => {
    const { rescellerEspace, rescellementComplet } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect(r.epoque).toBe(2);
    expect(r.rescellees.sort()).toEqual(["guest", "vendor"]);
    expect(r.dejaAJour).toEqual(["household"]);
    expect(r.restant).toEqual([]);
    expect(rescellementComplet(r)).toBe(true);
    expect(mockPoussees.map((p) => p.nodeId).sort()).toEqual(["col:guest:node-A", "col:vendor:node-A"]);
  });

  it("ne change RIEN au contenu : ce qui repart est ce qui était là", async () => {
    const avant = JSON.parse(JSON.stringify(mockDocs["col:guest:node-A"].data));
    const { rescellerEspace } = await import("@/lib/rescellement");
    await rescellerEspace(SESSION, "sp-1");

    const poussee = mockPoussees.find((p) => p.nodeId === "col:guest:node-A");
    expect(poussee?.contenu).toEqual(avant);
  });

  it("est rejouable : un espace déjà rescellé n'émet aucune écriture", async () => {
    for (const k of Object.keys(mockDocs)) mockDocs[k].data!._epoch = 2;
    const { rescellerEspace } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect(mockPoussees).toEqual([]);
    expect(r.rescellees).toEqual([]);
    expect(r.dejaAJour.sort()).toEqual(["guest", "household", "vendor"]);
  });

  it("relit avant de rechiffrer en cas de conflit", async () => {
    mockConflitUneFois = new Set(["col:guest:node-A"]);
    const { rescellerEspace } = await import("@/lib/rescellement");
    await rescellerEspace(SESSION, "sp-1");

    // Le mutateur a été rappelé avec la relecture : ce qui part n'est pas `null`.
    const poussee = mockPoussees.find((p) => p.nodeId === "col:guest:node-A");
    expect(poussee?.contenu).toMatchObject({ _epoch: 1, items: { g1: { id: "g1" } } });
  });

  it("nomme ce qui reste quand une poussée échoue", async () => {
    mockPoussEnEchec = new Set(["col:vendor:node-A"]);
    const { rescellerEspace, rescellementComplet } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect(r.rescellees).toEqual(["guest"]);
    expect(r.restant).toEqual(["vendor"]);
    expect(rescellementComplet(r)).toBe(false);
  });

  it("un keyring illisible n'écrit rien et rapporte tout comme restant", async () => {
    mockKeyring = null;
    const { rescellerEspace, rescellementComplet } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect(mockPoussees).toEqual([]);
    expect(r.epoque).toBeNull();
    expect(r.restant.sort()).toEqual(["guest", "household", "vendor"]);
    expect(rescellementComplet(r)).toBe(false);
  });

  it("un document absent est sauté sans déchiffrement ni écriture", async () => {
    mockDocs["col:guest:node-A"] = { hash: "", data: {} };
    const { rescellerEspace } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect(r.rescellees).toEqual(["vendor"]);
    expect(r.restant).toEqual([]);
  });

  it("les nœuds en clair sont hors périmètre", async () => {
    mockArbre = [...mockArbre, noeud("publicPage", false)];
    const { rescellerEspace } = await import("@/lib/rescellement");
    const r = await rescellerEspace(SESSION, "sp-1");

    expect([...r.rescellees, ...r.dejaAJour, ...r.restant]).not.toContain("publicPage");
  });

  it("rend l'avancement, du premier au dernier", async () => {
    const vus: number[] = [];
    const { rescellerEspace } = await import("@/lib/rescellement");
    await rescellerEspace(SESSION, "sp-1", { onAvancement: (a) => vus.push(a.fait) });

    expect(vus[0]).toBe(0);
    expect(vus[vus.length - 1]).toBe(2);
  });
});
