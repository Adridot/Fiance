import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * A guest name is composed in ONE place: the SDK.
 *
 * A coverage requirement that rests on vigilance decays with every screen added,
 * so this guard is mechanical: it fails on the mere presence of a hand-rolled
 * recomposition, without anyone having to show that this particular one is
 * wrong. It is aimed at the screen that does not exist yet.
 *
 * Accepted limit: a recomposition written the other way round would pass. The
 * guard covers the form that recurs, not every form conceivable.
 */

const ROOT = join(__dirname, "..", "..", "..");
const TREES = ["apps", "packages"];
const IGNORED = new Set(["node_modules", "dist", "dist.new", ".expo", ".git", "build"]);
const EXTENSIONS = [".ts", ".tsx"];

/**
 * First name then last name, one space apart, in both spellings: template
 * interpolation and JSX braces. The free initial also catches the prefixed
 * variants (`companionFirstName`, `plusOneLastName`). Matching this exact shape
 * is what leaves sort keys (`lastName firstName`) and the SDK's pipe-separated
 * dedup key out of reach on their own.
 */
const RECOMPOSITION = /\$?\{[^}]*[Ff]irstName[^}]*\} \$?\{[^}]*[Ll]astName[^}]*\}/;

/**
 * Uses that carry the forbidden idiom and are legitimate anyway. This list is,
 * in the code, the trace of what stays outside the guarantee: lifting an
 * exclusion means removing an entry. The second check below refuses an entry
 * that has outlived its reason.
 */
const TOLERATED: Record<string, string> = {
  "apps/mobile/lib/guest-import.ts":
    "Import matching keys, not a display. The name particle must stay OUT of " +
    "them: a source that left it inside the last name and a source that split " +
    "it off would never match if the particle entered the key.",
  "packages/fiance-sdk/src/objects/mappers.ts":
    "Space node title, written to the sync server. Out of scope, same reason.",
};

/** Strip comments: a note explaining the ban necessarily quotes the banned
 *  form, and must not be taken for a use. This very file is the first case. */
function withoutComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function sources(from: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(from)) {
    if (IGNORED.has(entry)) continue;
    const path = join(from, entry);
    if (statSync(path).isDirectory()) out.push(...sources(path));
    else if (EXTENSIONS.some((e) => entry.endsWith(e))) out.push(path);
  }
  return out;
}

function offenders(): string[] {
  const out: string[] = [];
  for (const tree of TREES) {
    for (const path of sources(join(ROOT, tree))) {
      if (RECOMPOSITION.test(withoutComments(readFileSync(path, "utf8")))) {
        out.push(relative(ROOT, path).split(sep).join("/"));
      }
    }
  }
  return out.sort();
}

describe("guest name — one composition only, the SDK's", () => {
  const found = offenders();

  it("no surface recomposes a guest name by hand", () => {
    const unexpected = found.filter((f) => !(f in TOLERATED));
    expect(unexpected, [
      "These files assemble a guest's first and last name themselves, hence",
      "without the name particle. Use `formatGuestName` (whole name) or",
      "`formatGuestLastName` (last name only, when the first name already has a",
      "slot of its own) from `@fiance/sdk`.",
      "",
      "If the use is legitimate, add it to TOLERATED above WITH ITS REASON.",
    ].join("\n")).toEqual([]);
  });

  it("no tolerance outlives its reason", () => {
    const stale = Object.keys(TOLERATED).filter((f) => !found.includes(f)).sort();
    expect(stale, [
      "These TOLERATED entries no longer match any recomposition.",
      "Remove them: an exception list that grows without each entry serving is",
      "the sign of a guarantee draining away.",
    ].join("\n")).toEqual([]);
  });

  it("every tolerance carries a written reason", () => {
    for (const [file, reason] of Object.entries(TOLERATED)) {
      expect(reason.trim().length, `${file} has no reason`).toBeGreaterThan(40);
    }
  });
});
