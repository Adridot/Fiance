/**
 * La couche « session de compte » : le registre local devient le coffre, et le
 * coffre redevient un registre sur un autre appareil.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@fiance/sdk", () => ({ getSyncNamespace: () => "dk", clearSpaceAccessStore: vi.fn() }));

const mockSeConnecter = vi.fn();
const mockCreerLeCompte = vi.fn();
const mockEnregistrer = vi.fn();
const mockLire = vi.fn(async (): Promise<unknown> => null);
vi.mock("@/lib/compte", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  seConnecter: (...a: unknown[]) => mockSeConnecter(...a),
  creerLeCompte: (...a: unknown[]) => mockCreerLeCompte(...a),
  enregistrerLeCoffre: (...a: unknown[]) => mockEnregistrer(...a),
  changerLeMotDePasse: vi.fn(),
  lireLeCoffre: () => mockLire(),
}));

vi.mock("@/lib/server", () => ({
  resolveServerUrl: () => "https://mariage.didot.io/sync",
  normalizeSyncBase: (u: string) => u,
}));

const kv = new Map<string, unknown>();
vi.mock("@/lib/kv-storage", () => ({
  readCollection: (c: string) => (kv.has(c) ? kv.get(c) : null),
  writeCollection: (c: string, v: unknown) => { kv.set(c, v); },
}));

const mockPousser = vi.fn(async () => true);
const mockTeardown = vi.fn();
vi.mock("@/lib/space-sync", () => ({
  pousserAvantDeQuitter: () => mockPousser(),
  attendreLaFinDeLHydratation: async () => {},
  resetDirtyPushBaseline: vi.fn(),
}));
vi.mock("@/lib/starfish", () => ({ teardownSync: () => mockTeardown() }));

const secure = new Map<string, string>();
vi.mock("@/lib/secure-store", () => ({
  secureGet: async (k: string) => secure.get(k) ?? null,
  secureSet: async (k: string, v: string) => { secure.set(k, v); },
  secureDelete: async (k: string) => { secure.delete(k); },
}));

vi.mock("@/store/useRevenueCatStore", () => ({ useRevenueCatStore: { getState: () => ({ setPremium: vi.fn() }) } }));

// Le registre persisté, sur une Map : le vrai module tire `expo-sqlite`.
type Registre = { activeWeddingId: string | null; vides?: never; weddings: Array<Record<string, unknown> & { id: string }> };
let persiste: Registre;
const mockSupprimer = vi.fn(async (id: string) => {
  persiste = { ...persiste, weddings: persiste.weddings.filter((w) => w.id !== id) };
});
vi.mock("@/lib/wedding-registry", () => ({
  loadRegistry: async () => structuredClone(persiste),
  saveRegistry: async (r: Registre) => { persiste = structuredClone(r); },
  deleteWeddingEntry: (id: string) => mockSupprimer(id),
  createWeddingEntry: vi.fn(),
  setActiveWeddingEntry: vi.fn(),
  updateWeddingEntry: vi.fn(),
}));

import { CompteError } from "@/lib/compte";
import {
  construireLeCoffre,
  creerMonCompte,
  installerLeSuiviDuCoffre,
  ouvrirUneSession,
  planifierLeCoffre,
  restaurerLesAnnexes,
  seDeconnecter,
  verifierLeCoffre,
} from "@/lib/compte-session";
import { useCompteStore } from "@/store/useCompteStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

const COMPTE = { identifiant: "Marie", locator: "a".repeat(64), cle: "k" };

const MARIAGE = {
  id: "w1", label: "Notre mariage", dbFileName: "wedding_w1.db", createdAt: "2026-01-01T00:00:00Z",
  seedPhrase: "a b c", spaceId: "sp-1", role: "owner",
};
const AUTRE = {
  id: "w2", label: "Celui de Paul", dbFileName: "wedding_w2.db", createdAt: "2026-02-01T00:00:00Z",
  seedPhrase: "d e f", spaceId: "sp-2", role: "member",
};

function unCoffre(weddings: Array<Record<string, unknown>>, annexes: Record<string, unknown> = {}) {
  return { v: 1, identifiant: "Marie", registre: { activeWeddingId: weddings[0]?.id ?? null, weddings }, annexes, majLe: "2026-10-01T00:00:00Z" };
}

beforeEach(async () => {
  vi.useRealTimers();
  vi.clearAllMocks();
  kv.clear();
  secure.clear();
  persiste = { activeWeddingId: null, weddings: [] };
  mockPousser.mockResolvedValue(true);
  mockLire.mockResolvedValue(null);
  mockEnregistrer.mockResolvedValue(undefined);
  useCompteStore.setState({ compte: null, charge: true, coffre: "a-jour" });
  await useWeddingRegistryStore.getState().load();
});

describe("construireLeCoffre", () => {
  it("range le registre tel quel, sans le marqueur de première hydratation", async () => {
    persiste = { activeWeddingId: "w1", weddings: [{ ...MARIAGE, premiereHydratationAttendue: true }, AUTRE] };

    const coffre = await construireLeCoffre("Marie");

    expect(coffre.v).toBe(1);
    expect(coffre.identifiant).toBe("Marie");
    expect(coffre.registre).toEqual({ activeWeddingId: "w1", weddings: [MARIAGE, AUTRE] });
    expect(JSON.stringify(coffre)).not.toContain("premiereHydratationAttendue");
  });

  it("emporte les annexes du mariage actif, et garde celles déjà connues des autres", async () => {
    mockSeConnecter.mockResolvedValue({
      compte: COMPTE,
      coffre: unCoffre([AUTRE], { w2: { inviteDepotCodes: ["CODE2"] } }),
    });
    await ouvrirUneSession("Marie", "un-mot-de-passe");
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE, AUTRE] };
    kv.set("spaceInviteStore", "{revocation}");
    kv.set("inviteDepotCodes", { w1: ["CODE1"] });

    const coffre = await construireLeCoffre("Marie");

    expect(coffre.annexes).toEqual({
      w1: { spaceInviteStore: "{revocation}", inviteDepotCodes: ["CODE1"] },
      w2: { inviteDepotCodes: ["CODE2"] },
    });
  });
});

describe("ouvrirUneSession", () => {
  it("sur un appareil vierge : écrit le registre, pose le marqueur et le compte local", async () => {
    mockSeConnecter.mockResolvedValue({ compte: COMPTE, coffre: unCoffre([MARIAGE, AUTRE], { w1: { inviteDepotCodes: ["CODE1"] } }) });

    await ouvrirUneSession("Marie", "un-mot-de-passe");

    expect(persiste.activeWeddingId).toBe("w1");
    expect(persiste.weddings.map((w) => w.id)).toEqual(["w1", "w2"]);
    expect(persiste.weddings.every((w) => w.premiereHydratationAttendue === true)).toBe(true);
    expect(useCompteStore.getState().compte).toEqual(COMPTE);
    expect(JSON.parse(secure.get("fiance_compte")!)).toEqual(COMPTE);
    expect(useWeddingRegistryStore.getState().registry?.weddings).toHaveLength(2);
  });

  it("sans synchronisation possible, le marqueur ne se pose pas : il ne lèverait jamais", async () => {
    mockSeConnecter.mockResolvedValue({ compte: COMPTE, coffre: unCoffre([{ ...MARIAGE, syncDisabled: true }]) });

    await ouvrirUneSession("Marie", "un-mot-de-passe");

    expect(persiste.weddings[0].premiereHydratationAttendue).toBeUndefined();
  });

  it("sur un appareil non vierge : fusionne sans rien retirer ni toucher à l'existant", async () => {
    const local = { ...MARIAGE, label: "Renommé ici" };
    persiste = { activeWeddingId: "w1", weddings: [local] };
    // Le même mariage sous un autre `id` local mais le même espace, et un mariage inconnu.
    const memeEspace = { ...MARIAGE, id: "autre-id", label: "Du coffre" };
    mockSeConnecter.mockResolvedValue({ compte: COMPTE, coffre: unCoffre([memeEspace, AUTRE]) });

    await ouvrirUneSession("Marie", "un-mot-de-passe");

    expect(persiste.activeWeddingId).toBe("w1");
    expect(persiste.weddings.map((w) => w.id)).toEqual(["w1", "w2"]);
    expect(persiste.weddings[0]).toEqual(local);
    expect(persiste.weddings[1].premiereHydratationAttendue).toBe(true);
  });

  it("un identifiant refusé ne touche à rien", async () => {
    mockSeConnecter.mockRejectedValue(new CompteError("identifiants", "non"));
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };

    await expect(ouvrirUneSession("Marie", "mauvais-mot-de-passe")).rejects.toMatchObject({ cas: "identifiants" });

    expect(persiste.weddings).toEqual([MARIAGE]);
    expect(useCompteStore.getState().compte).toBeNull();
  });
});

describe("restaurerLesAnnexes", () => {
  it("pose les annexes du dernier coffre lu, seulement si la clé locale est absente", async () => {
    mockSeConnecter.mockResolvedValue({
      compte: COMPTE,
      coffre: unCoffre([MARIAGE], { w1: { spaceInviteStore: "{revocation}", inviteDepotCodes: ["CODE1"] } }),
    });
    await ouvrirUneSession("Marie", "un-mot-de-passe");

    restaurerLesAnnexes("w1");
    expect(kv.get("spaceInviteStore")).toBe("{revocation}");
    expect(kv.get("inviteDepotCodes")).toEqual({ w1: ["CODE1"] });

    kv.set("spaceInviteStore", "{local}");
    restaurerLesAnnexes("w1");
    expect(kv.get("spaceInviteStore")).toBe("{local}");
  });
});

describe("seDeconnecter", () => {
  it("est refusée sans compte, et n'efface rien", async () => {
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };

    expect(await seDeconnecter()).toBe("sans-compte");

    expect(persiste.weddings).toHaveLength(1);
    expect(mockSupprimer).not.toHaveBeenCalled();
    expect(mockTeardown).not.toHaveBeenCalled();
  });

  it("une poussée en échec arrête la déconnexion, sauf si l'écran a confirmé", async () => {
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };
    mockPousser.mockResolvedValue(false);

    expect(await seDeconnecter()).toBe("poussee-en-echec");
    expect(persiste.weddings).toHaveLength(1);
    expect(useCompteStore.getState().compte).toEqual(COMPTE);

    expect(await seDeconnecter({ forcer: true })).toBe("ok");
    expect(persiste.weddings).toHaveLength(0);
    expect(useCompteStore.getState().compte).toBeNull();
  });

  it("enregistre le coffre une dernière fois, puis efface registre, compte et accès", async () => {
    useCompteStore.setState({ compte: COMPTE });
    secure.set("fiance_compte", JSON.stringify(COMPTE));
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE, AUTRE] };

    expect(await seDeconnecter()).toBe("ok");

    expect(mockEnregistrer).toHaveBeenCalledTimes(1);
    expect(mockEnregistrer.mock.calls[0][2].registre.weddings).toHaveLength(2);
    expect(mockSupprimer).toHaveBeenCalledTimes(2);
    expect(persiste).toEqual({ activeWeddingId: null, weddings: [] });
    expect(secure.has("fiance_compte")).toBe(false);
    expect(mockTeardown).toHaveBeenCalled();
    expect(useWeddingRegistryStore.getState().registry?.weddings).toEqual([]);
  });

  it("efface les entrées dk.spaceaccess.* du stockage local, et elles seules", async () => {
    const ls = new Map<string, string>([["dk.spaceaccess.u1", "x"], ["dk.spaceaccess.u2", "y"], ["autre", "z"]]);
    vi.stubGlobal("localStorage", {
      get length() { return ls.size; },
      key: (i: number) => [...ls.keys()][i] ?? null,
      removeItem: (k: string) => { ls.delete(k); },
    });
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };

    try {
      expect(await seDeconnecter()).toBe("ok");
      expect([...ls.keys()]).toEqual(["autre"]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("sur le web, balaie juste avant le rechargement les bases de mariage, le cache de lecture et les accès", async () => {
    const ls = new Map<string, string>([
      ["wedding_w1.db::entitlements", "x"],
      ["wedding_w1.db::optimisticPurchase", "x"],
      ["starfish.pullcache./v1/dk/pull/spaces/abc", "x"],
      ["dk.spaceaccess.u1", "x"],
      ["wedding_registry", "garde"],
      ["autre", "garde"],
    ]);
    const stockage = {
      get length() { return ls.size; },
      key: (i: number) => [...ls.keys()][i] ?? null,
      removeItem: (k: string) => { ls.delete(k); },
    };
    vi.stubGlobal("localStorage", stockage);
    vi.stubGlobal("sessionStorage", { clear: vi.fn() });
    const replace = vi.fn(() => {
      expect([...ls.keys()]).toEqual(["wedding_registry", "autre"]);
    });
    vi.stubGlobal("location", { replace });
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };
    // Un magasin réécrit sa clé pendant la purge : seul le balayage final la retire.
    mockSupprimer.mockImplementationOnce(async () => { ls.set("wedding_w1.db::entitlements", "revenu"); });

    try {
      expect(await seDeconnecter()).toBe("ok");
      expect(replace).toHaveBeenCalledWith("/onboarding");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("un coffre déplacé par un changement de mot de passe ne bloque pas la déconnexion", async () => {
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };
    mockEnregistrer.mockRejectedValue(new CompteError("deplace", "déplacé"));

    expect(await seDeconnecter()).toBe("ok");
    expect(persiste.weddings).toHaveLength(0);
  });
});

describe("planifierLeCoffre", () => {
  it("est muette sans compte : ni état, ni écriture", async () => {
    vi.useFakeTimers();

    planifierLeCoffre();
    await vi.advanceTimersByTimeAsync(5000);

    expect(useCompteStore.getState().coffre).toBe("a-jour");
    expect(mockEnregistrer).not.toHaveBeenCalled();
  });

  it("avec un compte : en attente, puis à jour après 1,5 s, en une seule écriture", async () => {
    vi.useFakeTimers();
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };

    planifierLeCoffre();
    planifierLeCoffre();
    expect(useCompteStore.getState().coffre).toBe("en-attente");
    await vi.advanceTimersByTimeAsync(1400);
    expect(mockEnregistrer).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);

    expect(mockEnregistrer).toHaveBeenCalledTimes(1);
    expect(useCompteStore.getState().coffre).toBe("a-jour");
  });

  it("un échec réseau pose « echec » sans lever", async () => {
    vi.useFakeTimers();
    useCompteStore.setState({ compte: COMPTE });
    mockEnregistrer.mockRejectedValue(new CompteError("reseau", "hors ligne"));

    planifierLeCoffre();
    await vi.advanceTimersByTimeAsync(2000);

    expect(useCompteStore.getState().coffre).toBe("echec");
  });

  it("un coffre déplacé pose « deplace » et ne réessaie pas", async () => {
    vi.useFakeTimers();
    useCompteStore.setState({ compte: COMPTE });
    mockEnregistrer.mockRejectedValue(new CompteError("deplace", "déplacé"));

    planifierLeCoffre();
    await vi.advanceTimersByTimeAsync(10_000);

    expect(useCompteStore.getState().coffre).toBe("deplace");
    expect(mockEnregistrer).toHaveBeenCalledTimes(1);
  });
});

describe("verifierLeCoffre", () => {
  it("coffre absent : pose « deplace »", async () => {
    useCompteStore.setState({ compte: COMPTE });
    mockLire.mockResolvedValue(null);

    await verifierLeCoffre();

    expect(useCompteStore.getState().coffre).toBe("deplace");
  });

  it("coffre présent : ne change rien", async () => {
    useCompteStore.setState({ compte: COMPTE });
    mockLire.mockResolvedValue(unCoffre([MARIAGE]));

    await verifierLeCoffre();

    expect(useCompteStore.getState().coffre).toBe("a-jour");
  });

  it("erreur réseau ou coffre illisible : ne change rien et ne lève pas", async () => {
    useCompteStore.setState({ compte: COMPTE });
    mockLire.mockRejectedValue(new CompteError("reseau", "hors ligne"));
    await expect(verifierLeCoffre()).resolves.toBeUndefined();
    mockLire.mockRejectedValue(new CompteError("illisible", "abîmé"));
    await expect(verifierLeCoffre()).resolves.toBeUndefined();

    expect(useCompteStore.getState().coffre).toBe("a-jour");
  });

  it("sans compte : ne lit rien", async () => {
    await verifierLeCoffre();

    expect(mockLire).not.toHaveBeenCalled();
    expect(useCompteStore.getState().coffre).toBe("a-jour");
  });

  it("une reconnexion réussie ramène l'état à « a-jour »", async () => {
    useCompteStore.setState({ compte: COMPTE, coffre: "deplace" });
    mockSeConnecter.mockResolvedValue({ compte: { ...COMPTE, locator: "b".repeat(64) }, coffre: unCoffre([MARIAGE]) });

    await ouvrirUneSession("Marie", "nouveau-mot-de-passe");

    expect(useCompteStore.getState().coffre).toBe("a-jour");
  });
});

describe("le suivi du registre", () => {
  it("replanifie le coffre quand le registre change, pas quand seul le marqueur tombe", async () => {
    vi.useFakeTimers();
    useCompteStore.setState({ compte: COMPTE });
    persiste = { activeWeddingId: "w1", weddings: [{ ...MARIAGE, premiereHydratationAttendue: true }] };
    await useWeddingRegistryStore.getState().load();
    installerLeSuiviDuCoffre();

    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };
    await useWeddingRegistryStore.getState().load();
    await vi.advanceTimersByTimeAsync(3000);
    expect(mockEnregistrer).not.toHaveBeenCalled();

    persiste = { activeWeddingId: "w1", weddings: [{ ...MARIAGE, label: "Renommé" }] };
    await useWeddingRegistryStore.getState().load();
    await vi.advanceTimersByTimeAsync(3000);
    expect(mockEnregistrer).toHaveBeenCalledTimes(1);
  });
});

describe("creerMonCompte", () => {
  it("construit le coffre, le dépose, puis mémorise le compte", async () => {
    persiste = { activeWeddingId: "w1", weddings: [MARIAGE] };
    mockCreerLeCompte.mockResolvedValue(COMPTE);

    await creerMonCompte("Marie", "un-mot-de-passe");

    expect(mockCreerLeCompte.mock.calls[0][3].registre.weddings).toEqual([MARIAGE]);
    expect(useCompteStore.getState().compte).toEqual(COMPTE);
  });
});
