/**
 * Le lien d'invitation : un accès de trois ans, émis sur un contenu à l'époque
 * courante, et un magasin d'invitations qui ne perd pas les liens passés.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreer = vi.fn(async () => ({
  token: { cap: { subUserId: "sujet-neuf" } },
  link: "https://mariage.example/join#JETON",
  inviteUserId: "sujet-neuf",
}));
const mockHydraterMagasin = vi.fn();
let mockResceller: () => Promise<{ epoque: number | null; rescellees: string[]; dejaAJour: string[]; restant: string[] }>;

vi.mock("expo-linking", () => ({ createURL: () => "https://mariage.example/" }));
vi.mock("@fiance/sdk", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  createSpaceInviteLink: (...args: unknown[]) => mockCreer(...(args as [])),
  serializeSpaceInviteStore: () => "{}",
  hydrateSpaceInviteStore: (...args: unknown[]) => mockHydraterMagasin(...args),
  getSyncNamespace: () => "dk",
}));
vi.mock("@/lib/server", () => ({
  resolveSessionConfig: async () => ({
    serverUrl: "https://mariage.example/sync",
    userId: "proprietaire",
    session: {
      userId: "proprietaire",
      accountClient: { pull: async () => ({ data: { members: [] } }) },
      layout: { spaceAccessPull: () => "/pull/spaces/sp-1/_access" },
    },
  }),
  normalizeSyncBase: (u: string) => u,
  resolveServerUrl: () => "https://mariage.example/sync",
}));
vi.mock("@/lib/invitation-courte", () => ({
  chiffrerLeJeton: async () => ({ depot: { iv: "iv", ct: "ct" }, cle: "cle" }),
  construireLeLienCourt: (_o: string, code: string, cle: string) => `https://mariage.example/i/${code}#${cle}`,
  deposer: async () => {},
  emballerLInvitation: () => "clair",
  retirer: async () => {},
  tirerUnCode: () => "ABCDEFGHJK",
}));
vi.mock("@/lib/space-provision", () => ({ ensureSpaceProvisioned: async () => "sp-1" }));
vi.mock("@/lib/space-sync", () => ({ pushSpaceSnapshot: vi.fn(async () => true) }));
vi.mock("@/lib/compte-session", () => ({ planifierLeCoffre: vi.fn() }));
vi.mock("@/lib/rescellement", () => ({ rescellerEspace: () => mockResceller() }));
vi.mock("@/lib/premium", () => ({ isPremium: () => true }));
vi.mock("@/store/usePermissionsStore", () => ({
  usePermissionsStore: { getState: () => ({ assignments: [], roles: [], upsertAssignment: vi.fn() }) },
}));
const kv = new Map<string, unknown>();
vi.mock("@/lib/kv-storage", () => ({
  readCollection: (cle: string) => (kv.has(cle) ? kv.get(cle) : null),
  writeCollection: (cle: string, v: unknown) => { kv.set(cle, v); },
}));

const ENTREE = { id: "w1", label: "Mariage", dbFileName: "w1.db", createdAt: "", seedPhrase: "x", spaceId: "sp-1" };

describe("createInviteLink", () => {
  beforeEach(() => {
    vi.resetModules();
    kv.clear();
    mockCreer.mockClear();
    mockHydraterMagasin.mockClear();
    mockResceller = async () => ({ epoque: 4, rescellees: [], dejaAJour: ["guest"], restant: [] });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("émet un accès de trois ans", async () => {
    const { createInviteLink } = await import("@/lib/invite-link");
    const lien = await createInviteLink(ENTREE as never, undefined, "Emma");

    expect(lien).toBe("https://mariage.example/i/ABCDEFGHJK#cle");
    const args = mockCreer.mock.calls[0] as unknown[];
    expect(args[5]).toEqual({ ttlSec: 3 * 365 * 24 * 3600 });
  });

  it("un contenu qui n'a pas pu être ramené à l'époque courante bloque le lien, avant toute émission", async () => {
    mockResceller = async () => ({ epoque: 4, rescellees: [], dejaAJour: [], restant: ["weddingEvent", "legalMilestone"] });
    const { createInviteLink } = await import("@/lib/invite-link");

    await expect(createInviteLink(ENTREE as never, undefined, "Emma")).rejects.toThrow(/weddingEvent, legalMilestone/);
    expect(mockCreer).not.toHaveBeenCalled();
  });

  it("recharge le magasin persisté avant de le réécrire", async () => {
    kv.set("spaceInviteStore", '{"sp-1:ancien":{"edPub":"e","kemPub":"k"}}');
    const { createInviteLink } = await import("@/lib/invite-link");
    await createInviteLink(ENTREE as never, undefined, "Emma");

    expect(mockHydraterMagasin).toHaveBeenCalledWith('{"sp-1:ancien":{"edPub":"e","kemPub":"k"}}');
  });
});
