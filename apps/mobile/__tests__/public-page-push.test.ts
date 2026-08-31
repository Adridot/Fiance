/**
 * MODIFICATION LOCALE — la page publique ne se repousse pas pour rien.
 *
 * Ce fichier existe à cause d'une boucle mesurée en production le 22 août 2026 :
 * 120 requêtes/minute, sans personne devant l'écran. `pushPublicPageContent`
 * écrivait à chaque appel, y compris quand rien n'avait changé ; l'écriture
 * émettait un événement, l'événement déclenchait une hydratation, et
 * l'hydratation rappelait la poussée.
 *
 * Ce qui est vérifié ici tient en trois points, et le TROISIÈME est celui qui
 * distingue un correctif d'une illusion de correctif :
 *
 *   - un document identique n'écrit pas,
 *   - un document réellement modifié écrit toujours (sans quoi on aurait éteint
 *     la fonctionnalité au lieu de la boucle),
 *   - le `timestamp`, seul à changer, ne suffit PAS à déclencher une écriture —
 *     et surtout : la deuxième poussée d'une session n'écrit pas non plus, alors
 *     même que `handle.push` appelle son mutateur avec `cur = null` dans ce cas
 *     (chemin rapide de `makeHandle`, cache de documents chaud). C'est très
 *     exactement le trou par lequel une garde naïve ne corrigerait rien.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-native", () => ({ Platform: { OS: "web" } }));
vi.mock("@/lib/premium", () => ({ isPremium: () => false }));
vi.mock("@/lib/seo-urls", () => ({ BASE_URL: "https://exemple.test" }));
vi.mock("@/lib/index-lock", () => ({
  withIndexLock: (_id: string, fn: () => unknown) => fn(),
}));

// ─── Magasins ────────────────────────────────────────────────────────────────
// `dayOfItems` est réassigné par référence à chaque « hydratation » simulée,
// comme le fait `hydrateFromSpace` : c'est la moitié du défaut d'origine.
let dayOfItems: Record<string, unknown>[] = [];
let wedding: Record<string, unknown> | null = {
  partner1Name: "Adrien",
  partner2Name: "Emma",
  weddingDate: "2027-06-12",
  venueName: "Le Domaine",
  description: null,
  faq: null,
};

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: { getState: () => ({ wedding }) },
}));
vi.mock("@/store/usePlanningStore", () => ({
  usePlanningStore: { getState: () => ({ dayOfItems }) },
}));
vi.mock("@/store/useGiftsStore", () => ({
  useGiftsStore: { getState: () => ({ gifts: [] }) },
}));
vi.mock("@/store/useWeddingEventsStore", () => ({
  useWeddingEventsStore: { getState: () => ({ weddingEvents: [] }) },
}));

// ─── Le SDK ──────────────────────────────────────────────────────────────────
// `handle.push` est reproduit dans son comportement qui compte : il rend au
// mutateur ce que le « serveur » détient, et n'écrit que si le mutateur rend
// autre chose que `null`.
const écritures: Record<string, unknown>[] = [];
/** Le « serveur », PAR NŒUD — un document unique partagé par tous les nœuds
 *  ferait croire à tort qu'une empreinte fuit de l'un à l'autre. */
const serveurs = new Map<string, Record<string, unknown>>();
const NŒUD_PAR_DÉFAUT = "/pull/sp1/pub-w1";
/** Rejoue le CHEMIN RAPIDE de `makeHandle` : mutateur appelé avec `null`, sans
 *  relire le serveur. C'est ce que fait le vrai SDK dès que son cache connaît
 *  le hash du document — et, le cache de pull étant PERSISTÉ, dès la première
 *  poussée qui suit un rechargement de page. C'est pourquoi le défaut est
 *  `true` : c'est l'état ordinaire en production, pas un cas de bord. */
let cheminRapide = true;
/** Lectures explicites faites par `pushPublicPageContent` (garde 2). */
const lectures: string[] = [];

const push = vi.fn(
  async (
    chemin: string,
    _pushPath: string,
    mutateur: (cur: Record<string, unknown> | null) => Record<string, unknown> | null,
  ) => {
    const suivant = mutateur(cheminRapide ? null : (serveurs.get(chemin) ?? null));
    if (suivant === null) return;
    serveurs.set(chemin, suivant);
    écritures.push(suivant);
    cheminRapide = true; // le cache est désormais chaud, comme dans le vrai SDK
  },
);

const clientPull = vi.fn(async (chemin: string) => {
  lectures.push(chemin);
  const doc = serveurs.get(chemin);
  return doc ? { data: doc, hash: `h-${chemin}`, timestamp: 1 } : { data: {}, hash: "" };
});

vi.mock("@fiance/sdk", () => ({
  getNodeAccess: vi.fn(async () => ({
    push,
    encryptor: null,
    client: { pull: clientPull },
    isOwnerOpen: true,
  })),
  objInvPull: (s: string, n: string) => `/pull/${s}/${n}`,
  objInvPush: (s: string, n: string) => `/push/${s}/${n}`,
  updateObjectIndex: vi.fn(),
  createNodeInviteLink: vi.fn(),
  encodeNodeInviteLink: vi.fn(),
  publicPageToNode: vi.fn(),
}));

import {
  pushPublicPageContent,
  empreintePagePublique,
  oublierEmpreintesPagePublique,
  buildPublicPageDocument,
} from "@/lib/public-page";

const session = {} as never;

beforeEach(() => {
  écritures.length = 0;
  lectures.length = 0;
  serveurs.clear();
  cheminRapide = true;
  push.mockClear();
  clientPull.mockClear();
  oublierEmpreintesPagePublique();
  dayOfItems = [];
  wedding = {
    partner1Name: "Adrien",
    partner2Name: "Emma",
    weddingDate: "2027-06-12",
    venueName: "Le Domaine",
    description: null,
    faq: null,
  };
});

describe("empreintePagePublique", () => {
  it("écarte `timestamp` — le seul champ qui change à chaque construction", () => {
    const a = { version: 2, timestamp: "2026-08-24T09:00:00.000Z", about: { x: 1 } };
    const b = { version: 2, timestamp: "2026-08-24T09:00:02.000Z", about: { x: 1 } };
    expect(empreintePagePublique(a)).toBe(empreintePagePublique(b));
  });

  it("ne dépend pas de l'ordre des clés — le relu du serveur peut différer du construit", () => {
    expect(empreintePagePublique({ a: 1, b: { c: 2, d: 3 } })).toBe(
      empreintePagePublique({ b: { d: 3, c: 2 }, a: 1 }),
    );
  });

  it("traite `undefined` et absent à l'identique — JSON perd l'un et pas l'autre", () => {
    expect(empreintePagePublique({ a: 1, gifts: undefined })).toBe(
      empreintePagePublique({ a: 1 }),
    );
  });

  it("distingue un vrai changement", () => {
    expect(empreintePagePublique({ about: { venueName: "A" } })).not.toBe(
      empreintePagePublique({ about: { venueName: "B" } })
    );
  });

  it("distingue l'ordre d'une liste — le programme public est ordonné", () => {
    expect(empreintePagePublique({ timeline: [{ id: "a" }, { id: "b" }] })).not.toBe(
      empreintePagePublique({ timeline: [{ id: "b" }, { id: "a" }] }),
    );
  });
});

describe("pushPublicPageContent", () => {
  it("écrit la première fois — sans quoi le lien public resterait mort", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
  });

  it("n'écrit PAS une seconde fois quand rien n'a changé", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
  });

  it("n'OUVRE même pas le nœud au second appel — la boucle coûtait aussi des lectures", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    push.mockClear();
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(push).not.toHaveBeenCalled();
  });

  it("tient alors même que le mutateur ne voit jamais `cur` (chemin rapide du SDK)", async () => {
    // Le piège : le cache de pull étant persisté, le mutateur ne voit plus
    // l'état du serveur — y compris au PREMIER appel après un rechargement de
    // page. Une garde fondée sur le seul `cur` n'aurait rien corrigé.
    // Ici la relecture explicite (garde 2) referme le trou : on simule un
    // rechargement en oubliant l'empreinte, le serveur détenant déjà notre
    // document.
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
    oublierEmpreintesPagePublique(); // rechargement de page
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1); // pas de seconde écriture
  });

  it("échange l'écriture contre une LECTURE au premier appel d'une page", async () => {
    // Le reste corrigé par 9.7 : avant, chaque chargement de page réécrivait le
    // nœud à l'identique. Une lecture n'émet aucun événement, donc ne réamorce
    // rien — c'est tout l'intérêt de l'échange.
    serveurs.set(NŒUD_PAR_DÉFAUT, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(0);
    expect(lectures).toHaveLength(1);
  });

  it("ne relit pas quand l'empreinte en mémoire suffit — la boucle ne coûte rien", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    lectures.length = 0;
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(lectures).toHaveLength(0);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("écrit quand même si la relecture échoue — un réseau coupé ne fait pas taire la publication", async () => {
    clientPull.mockImplementationOnce(async () => { throw new Error("réseau"); });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
  });

  it("le temps qui passe seul ne déclenche rien", async () => {
    const a = buildPublicPageDocument();
    await new Promise((r) => setTimeout(r, 5));
    const b = buildPublicPageDocument();
    expect(a.timestamp).not.toBe(b.timestamp);
    expect(empreintePagePublique(a)).toBe(empreintePagePublique(b));
  });

  it("une hydratation qui ne change rien n'écrit rien, même en remplaçant les références", async () => {
    dayOfItems = [{ id: "d1", title: "Cocktail", time: "18:00", isPublic: true }];
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);

    // L'hydratation : mêmes données, objets NEUFS — la moitié du défaut d'origine.
    dayOfItems = [{ id: "d1", title: "Cocktail", time: "18:00", isPublic: true }];
    wedding = { ...(wedding as Record<string, unknown>) };
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
  });

  it("écrit de nouveau dès qu'une donnée change VRAIMENT", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    dayOfItems = [{ id: "d1", title: "Vin d'honneur", time: "18:00", isPublic: true }];
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(2);
  });

  it("retient l'empreinte par nœud, pas globalement", async () => {
    await pushPublicPageContent(session, "sp1", "pub-w1");
    await pushPublicPageContent(session, "sp2", "pub-w2");
    expect(écritures).toHaveLength(2);
  });

  it("n'écrit pas quand le serveur détient déjà l'équivalent au premier appel", async () => {
    // Cache froid, chemin lent : le serveur rend un document identique au nôtre,
    // à l'horodatage près. C'est le cas d'un rechargement de page.
    serveurs.set(NŒUD_PAR_DÉFAUT, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(0);
  });

  it("après ce constat, l'appel suivant n'écrit pas non plus", async () => {
    // Sans mémorisation sur la branche « le serveur l'avait déjà », le cache du
    // SDK serait chaud et l'appel suivant repartirait en écriture : la boucle
    // reviendrait par ce trou-là.
    serveurs.set(NŒUD_PAR_DÉFAUT, { ...buildPublicPageDocument(), timestamp: "1999-01-01T00:00:00.000Z" });
    await pushPublicPageContent(session, "sp1", "pub-w1");
    cheminRapide = true;
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(0);
  });

  it("réessaie après un échec réseau — l'empreinte n'est pas retenue sur exception", async () => {
    push.mockImplementationOnce(async () => { throw new Error("réseau"); });
    await expect(pushPublicPageContent(session, "sp1", "pub-w1")).rejects.toThrow("réseau");
    await pushPublicPageContent(session, "sp1", "pub-w1");
    expect(écritures).toHaveLength(1);
  });
});
