/**
 * Un lien neuf ouvert sur un appareil qui a déjà le mariage : l'appareil adopte
 * l'accès du lien sous son identité existante, et relance sa synchronisation.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAdopter = vi.fn(async () => {});
const mockClearActivation = vi.fn();
const mockRelancer = vi.fn();
const mockPlanifier = vi.fn();
const mockResoudre = vi.fn(async () => {});
const SESSION = { userId: "emma-existante" };
let mockEntreeDAcces: unknown = null;

vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSpaceAccessEntry: () => mockEntreeDAcces,
  joinSpaceByLink: vi.fn(),
}));
vi.mock("@/lib/identity", () => ({ generatePassphrase: vi.fn(), deriveSessionFromPhrase: vi.fn() }));
vi.mock("@/lib/server", () => ({
  resolveServerUrl: () => "https://mariage.example/sync",
  resolveSessionConfig: vi.fn(async (entree: { seedPhrase?: string }) =>
    entree.seedPhrase ? { session: SESSION, serverUrl: "https://mariage.example/sync", userId: SESSION.userId } : null,
  ),
}));
vi.mock("@/lib/permissions/resolve", () => ({ resolveActiveMemberPermissions: () => mockResoudre() }));
vi.mock("@/lib/compte-session", () => ({ planifierLeCoffre: () => mockPlanifier() }));
vi.mock("@/lib/renouvellement-automatique", () => ({ adopterLeJeton: (...a: unknown[]) => mockAdopter(...(a as [])) }));
vi.mock("@/lib/providers", () => ({ clearActivation: (id: string) => mockClearActivation(id) }));
vi.mock("@/store/useCompteStore", () => ({ useCompteStore: { getState: () => ({ relancer: mockRelancer }) } }));

type Entree = { id: string; spaceId?: string; role?: string; seedPhrase?: string; inviteSubjectId?: string; roleId?: string; permissions?: unknown };
let registre: { activeWeddingId: string | null; weddings: Entree[] };
const mockSwitch = vi.fn(async (id: string) => { registre = { ...registre, activeWeddingId: id }; });
const mockUpdate = vi.fn(async (id: string, maj: Partial<Entree>) => {
  registre = { ...registre, weddings: registre.weddings.map((w) => (w.id === id ? { ...w, ...maj } : w)) };
});
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({ registry: registre, switchWedding: mockSwitch, updateWedding: mockUpdate, createWedding: vi.fn() }),
  },
}));

const jeton = (nonce: string, subUserId: string) => ({
  v: 1 as const,
  spaceId: "sp-1",
  spaceName: "Mariage",
  cap: { kind: "member", nonce, subUserId, exp: 9_999_999_999 },
  key: "cle",
  write: true,
});

describe("renouvellement de l'accès par un lien neuf", () => {
  beforeEach(async () => {
    vi.resetModules();
    for (const m of [mockAdopter, mockClearActivation, mockRelancer, mockPlanifier, mockResoudre, mockSwitch, mockUpdate]) m.mockClear();
    mockEntreeDAcces = { kind: "link", cap: { nonce: "ancien", subUserId: "sujet-ancien" } };
    registre = {
      activeWeddingId: "w-emma",
      weddings: [{
        id: "w-emma", spaceId: "sp-1", role: "member", seedPhrase: "phrase existante",
        inviteSubjectId: "sujet-ancien", roleId: "r-ancien", permissions: { guests: "view" },
      }],
    };
  });

  it("adopte le lien sous l'identité existante, puis relance la sync du mariage actif", async () => {
    const { renouvelerLAccesParLien } = await import("@/lib/join-space");
    const { useAccesRefuseStore } = await import("@/store/useAccesRefuseStore");
    useAccesRefuseStore.getState().signaler("sp-1", 401);

    await renouvelerLAccesParLien(jeton("neuf", "sujet-neuf") as never);

    expect(mockAdopter).toHaveBeenCalledWith(SESSION, expect.objectContaining({ spaceId: "sp-1" }));
    expect(registre.weddings[0]).toMatchObject({ seedPhrase: "phrase existante", inviteSubjectId: "sujet-neuf" });
    expect(registre.weddings[0].roleId).toBeUndefined();
    expect(registre.weddings[0].permissions).toBeUndefined();
    expect(useAccesRefuseStore.getState().refus).toBeNull();
    expect(mockClearActivation).toHaveBeenCalledWith("w-emma");
    expect(mockRelancer).toHaveBeenCalledTimes(1);
    expect(mockSwitch).not.toHaveBeenCalled();
    expect(mockPlanifier).toHaveBeenCalled();
  });

  it("un mariage qui n'est pas l'actif : on bascule dessus au lieu de relancer", async () => {
    registre.activeWeddingId = "w-autre";
    registre.weddings.push({ id: "w-autre", spaceId: "sp-2", role: "owner", seedPhrase: "x" });
    const { renouvelerLAccesParLien } = await import("@/lib/join-space");

    await renouvelerLAccesParLien(jeton("neuf", "sujet-neuf") as never);

    expect(mockSwitch).toHaveBeenCalledWith("w-emma");
    expect(mockRelancer).not.toHaveBeenCalled();
  });

  it("sans identité enregistrée pour ce mariage, l'erreur remonte et rien n'est adopté", async () => {
    registre.weddings[0].seedPhrase = undefined;
    const { renouvelerLAccesParLien } = await import("@/lib/join-space");

    await expect(renouvelerLAccesParLien(jeton("neuf", "sujet-neuf") as never)).rejects.toThrow(/identité/);
    expect(mockAdopter).not.toHaveBeenCalled();
  });

  it("joinWeddingByToken : un lien neuf renouvelle, le même lien ne fait que basculer", async () => {
    const { joinWeddingByToken } = await import("@/lib/join-space");

    await joinWeddingByToken(jeton("ancien", "sujet-ancien") as never);
    expect(mockAdopter).not.toHaveBeenCalled();
    expect(mockSwitch).toHaveBeenCalledWith("w-emma");

    await joinWeddingByToken(jeton("neuf", "sujet-neuf") as never);
    expect(mockAdopter).toHaveBeenCalledTimes(1);
  });
});
