import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MOBILE = join(__dirname, "..");

const dansLeScript = [...readFileSync(join(MOBILE, "scripts", "inject-pwa.js"), "utf8").matchAll(/\burl:\s*"([^"]+)"/g)].map((m) => m[1]);
const dansLeManifeste: string[] = JSON.parse(readFileSync(join(MOBILE, "public", "manifest.json"), "utf8")).shortcuts.map(
  (s: { url: string }) => s.url,
);

/** Un groupe de routes `(tabs)` n'apparaît pas dans l'URL : la route est celle de son dossier. */
function routeExiste(url: string): boolean {
  return [join("app", "(tabs)", url, "index.tsx"), join("app", url, "index.tsx"), join("app", `${url}.tsx`)].some((f) =>
    existsSync(join(MOBILE, f)),
  );
}

describe.each([
  ["scripts/inject-pwa.js", dansLeScript],
  ["public/manifest.json", dansLeManifeste],
])("raccourcis du manifeste (%s)", (_, urls) => {
  it("déclare les trois raccourcis", () => {
    expect(urls).toEqual(["/budget", "/guests", "/planning"]);
  });

  it("aucune URL ne porte de groupe de routes", () => {
    expect(urls.filter((u) => /[()]/.test(u))).toEqual([]);
  });

  it("chaque URL mène à un écran qui existe", () => {
    expect(urls.filter((u) => !routeExiste(u))).toEqual([]);
  });
});
