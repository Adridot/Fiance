import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// La télémétrie ne doit PAS s'ouvrir un point de collecte par accident.
//
// `EXPO_PUBLIC_ANALYTICS_URL` est vide sur cette instance : aucun collecteur
// n'est déployé. Or `StarfishClient` accepte une base vide et construit alors
// une URL RELATIVE — le lot d'événements part vers l'origine de l'app,
// `POST /v1/dk/push/events/fiance/{uuid}`, où nginx sert un site statique et
// répond 405. À la minute, par onglet ouvert : 77 en une heure le 24 août 2026.

const mockCreateTelemetry = vi.fn(async (_cfg: Record<string, unknown>) => ({ inner: true }));
const mockInit = vi.fn();

vi.mock("@drakkar.software/dk-spaces-analytics-sdk", () => ({
  createTelemetry: (cfg: Record<string, unknown>) => mockCreateTelemetry(cfg),
  createTelemetryClient: () => ({ init: mockInit }),
}));

const BASE = process.env.EXPO_PUBLIC_ANALYTICS_URL;

beforeEach(() => {
  vi.resetModules();
  mockCreateTelemetry.mockClear();
  mockInit.mockClear();
  (globalThis as Record<string, unknown>).__DEV__ = false;
  // La garde anti-double-init vit sur `globalThis` : elle survit à
  // `resetModules()` et masquerait le second cas si on ne l'effaçait pas.
  delete (globalThis as Record<string, unknown>).__fiance_analytics_started__;
});

afterEach(() => {
  if (BASE === undefined) delete process.env.EXPO_PUBLIC_ANALYTICS_URL;
  else process.env.EXPO_PUBLIC_ANALYTICS_URL = BASE;
});

describe("télémétrie sans point de collecte configuré", () => {
  it("ne construit aucun client quand l'URL est vide", async () => {
    process.env.EXPO_PUBLIC_ANALYTICS_URL = "";
    const { initAnalytics } = await import("@/lib/analytics");

    await initAnalytics();

    expect(mockCreateTelemetry).not.toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it("ne construit aucun client quand la variable est absente", async () => {
    delete process.env.EXPO_PUBLIC_ANALYTICS_URL;
    const { initAnalytics } = await import("@/lib/analytics");

    await initAnalytics();

    expect(mockCreateTelemetry).not.toHaveBeenCalled();
  });

  it("construit le client quand une URL est configurée", async () => {
    process.env.EXPO_PUBLIC_ANALYTICS_URL = "https://telemetrie.example";
    const { initAnalytics } = await import("@/lib/analytics");

    await initAnalytics();

    expect(mockCreateTelemetry).toHaveBeenCalledTimes(1);
    expect(mockCreateTelemetry.mock.calls[0][0]).toMatchObject({
      syncBaseUrl: "https://telemetrie.example",
      app: "fiance",
    });
    expect(mockInit).toHaveBeenCalledTimes(1);
  });
});
