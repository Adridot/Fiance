import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { creerHarnais } from "./mocks/harnais-de-hook";

const rt = vi.hoisted(() => ({ hooks: null as null | Record<string, (...a: unknown[]) => unknown> }));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (...a: unknown[]) => rt.hooks!.useState(...a),
    useEffect: (...a: unknown[]) => rt.hooks!.useEffect(...a),
    useCallback: (...a: unknown[]) => rt.hooks!.useCallback(...a),
  };
});

const synchro = vi.hoisted(() => ({
  active: false,
  session: null as object | null,
  spaceId: null as string | null,
  nodeId: null as string | null,
  ecouteurs: new Set<(up: boolean) => void>(),
}));

const magasin = vi.hoisted(() => ({
  guests: [] as Array<Record<string, unknown>>,
  households: [] as unknown[],
}));

vi.mock("@/lib/starfish", () => ({
  isSyncActive: () => synchro.active,
  getActiveSession: () => synchro.session,
  getActiveSpaceId: () => synchro.spaceId,
  getActiveWeddingNodeId: () => synchro.nodeId,
}));

vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: Object.assign(
    (selector: (s: typeof magasin) => unknown) => selector(magasin),
    { getState: () => magasin },
  ),
}));
vi.mock("@/store/useInvitationTypesStore", () => ({
  useInvitationTypesStore: { getState: () => ({ invitationTypes: [] }) },
}));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("@/lib/public-page", () => ({
  publicPageNodeId: (w: string) => `pub-${w}`,
  getPublicPageInviteLink: vi.fn(),
  ensurePublicPageNode: vi.fn().mockResolvedValue("pub-w1"),
}));
vi.mock("@/lib/guest-link", () => ({
  encodeGuestLink: vi.fn().mockReturnValue("https://example.com/wedding/jeton"),
}));

const sdk = vi.hoisted(() => ({
  createNodeInviteLink: vi.fn(),
}));

vi.mock("@fiance/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@fiance/sdk")>();
  return {
    ...actual,
    onSseStatus: (cb: (up: boolean) => void) => {
      synchro.ecouteurs.add(cb);
      cb(synchro.active);
      return () => synchro.ecouteurs.delete(cb);
    },
    updateObjectIndex: vi.fn().mockResolvedValue(undefined),
    getNodeAccess: vi.fn().mockResolvedValue({
      client: { pull: vi.fn().mockResolvedValue(null), push: vi.fn().mockResolvedValue(undefined) },
    }),
    objInvPush: vi.fn().mockReturnValue("/p"),
    objInvPull: vi.fn().mockReturnValue("/p"),
    createNodeInviteLink: sdk.createNodeInviteLink,
    rsvpToNode: vi.fn().mockReturnValue({
      id: "rsvp-g1", type: "rsvp", parentId: "pub-w1", title: "", access: "invite", enc: false, contentKind: "merge",
    }),
  };
});

import { useGuestRsvpLink } from "@/lib/rsvp-sync";

const invite = {
  id: "g1", firstName: "Alice", lastName: "Dupont", nameParticle: null, householdId: null,
  invitationType: "FULL", rsvpStatus: "PENDING", rsvpDate: null, diet: "STANDARD", dietNotes: null,
};
const entree = { id: "w1", seedPhrase: "graine", syncDisabled: false } as never;

function activerLaSynchro() {
  synchro.active = true;
  synchro.session = {};
  synchro.spaceId = "space-1";
  synchro.nodeId = "w1";
  for (const l of [...synchro.ecouteurs]) l(true);
}

async function laisserFinir() {
  for (let i = 0; i < 40; i++) await Promise.resolve();
}

function monter(guestId: string | null = "g1", registre: unknown = entree) {
  const h = creerHarnais(() => useGuestRsvpLink(guestId ?? undefined, registre as never));
  rt.hooks = h.hooks as never;
  h.rendre();
  return h;
}

describe("useGuestRsvpLink", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    synchro.active = false;
    synchro.session = null;
    synchro.spaceId = null;
    synchro.nodeId = null;
    synchro.ecouteurs.clear();
    magasin.guests = [{ ...invite }];
    magasin.households = [];
    sdk.createNodeInviteLink.mockReset();
    sdk.createNodeInviteLink.mockResolvedValue({ token: {}, link: "" });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("page ouverte à froid : prépare le lien dès que la sync devient active, sans jamais abandonner", async () => {
    const h = monter();
    expect(h.dernier().etat).toBe("preparation");
    expect(sdk.createNodeInviteLink).not.toHaveBeenCalled();

    activerLaSynchro();
    await laisserFinir();

    expect(h.dernier().etat).toBe("pret");
    expect(h.dernier().url).toBe("https://example.com/wedding/jeton");
    expect(sdk.createNodeInviteLink).toHaveBeenCalledTimes(2);
  });

  it("page ouverte à chaud (sync déjà active) : un seul lien fabriqué", async () => {
    activerLaSynchro();
    const h = monter();
    await laisserFinir();
    expect(h.dernier().etat).toBe("pret");
    expect(sdk.createNodeInviteLink).toHaveBeenCalledTimes(2);
  });

  it("la sync qui retombe puis revient ne fabrique pas un second lien", async () => {
    activerLaSynchro();
    const h = monter();
    await laisserFinir();
    synchro.active = false;
    for (const l of [...synchro.ecouteurs]) l(false);
    h.rendre();
    activerLaSynchro();
    await laisserFinir();
    expect(h.dernier().etat).toBe("pret");
    expect(sdk.createNodeInviteLink).toHaveBeenCalledTimes(2);
  });

  it("sync qui n'arrive pas : après l'attente maximale, « échec » ; si elle arrive ensuite, le lien se fait seul", async () => {
    const h = monter();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(h.dernier().etat).toBe("echec");

    activerLaSynchro();
    await laisserFinir();
    expect(h.dernier().etat).toBe("pret");
  });

  it("fabrication en échec : « échec », puis « réessayer » relance et réussit", async () => {
    sdk.createNodeInviteLink.mockRejectedValueOnce(new Error("hors ligne"));
    activerLaSynchro();
    const h = monter();
    await laisserFinir();
    expect(h.dernier().etat).toBe("echec");
    expect(h.dernier().url).toBeNull();

    h.dernier().reessayer();
    h.rendre();
    expect(h.dernier().etat).toBe("preparation");
    await laisserFinir();
    expect(h.dernier().etat).toBe("pret");
  });

  it("sync coupée par l'utilisateur : le dit, et ne fabrique rien", async () => {
    activerLaSynchro();
    const h = monter("g1", { id: "w1", seedPhrase: "graine", syncDisabled: true });
    await laisserFinir();
    expect(h.dernier().etat).toBe("sync-desactivee");
    expect(sdk.createNodeInviteLink).not.toHaveBeenCalled();
  });

  it("invité absent du magasin : indisponible, pas de faux chargement", async () => {
    magasin.guests = [];
    activerLaSynchro();
    const h = monter("g1");
    await laisserFinir();
    expect(h.dernier().etat).toBe("indisponible");
    expect(sdk.createNodeInviteLink).not.toHaveBeenCalled();
  });

  it("nouvelle fiche (pas d'identifiant) : rien à fabriquer", async () => {
    activerLaSynchro();
    const h = monter(null);
    await laisserFinir();
    expect(h.dernier().etat).toBe("indisponible");
    expect(sdk.createNodeInviteLink).not.toHaveBeenCalled();
  });

  it("démontée avant la fin : le résultat tardif est ignoré", async () => {
    let finir!: (v: unknown) => void;
    sdk.createNodeInviteLink.mockReturnValue(new Promise((r) => { finir = r; }));
    activerLaSynchro();
    const h = monter();
    await laisserFinir();
    h.demonter();
    finir({ token: {}, link: "" });
    await laisserFinir();
    expect(h.dernier().url).toBeNull();
  });
});
