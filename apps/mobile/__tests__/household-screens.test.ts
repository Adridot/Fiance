// `updateHousehold` on a household with no entity is a silent no-op: the typed
// address vanishes with no error. Hence these checks on the file text.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const MOBILE = join(__dirname, "..");
const GUEST_SCREEN = join(MOBILE, "app", "(tabs)", "guests", "[id].tsx");
const FIELDS = join(MOBILE, "components", "HouseholdFields.tsx");
const RECIPIENTS = join(MOBILE, "app", "(tabs)", "guests", "recipients.tsx");
const HOUSEHOLD_SCREEN = join(MOBILE, "app", "(tabs)", "guests", "household", "[id].tsx");

const read = (p: string) => readFileSync(p, "utf8");

function sources(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    if (entry === "node_modules") continue;
    const path = join(root, entry);
    if (statSync(path).isDirectory()) out.push(...sources(path));
    else if (path.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("no screen writes a household field through `updateHousehold`", () => {
  it("the reducer that cannot create anything is called from no surface", () => {
    const offenders = [join(MOBILE, "app"), join(MOBILE, "components")]
      .flatMap(sources)
      .filter((f) => /\bupdateHousehold\(/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("materialization is the path typing takes", () => {
    expect(read(FIELDS)).toContain("materializeHousehold(memberIds");
  });
});

describe("name and address are written on commit, not on keystroke", () => {
  const fields = read(FIELDS);

  it("typing only holds a local draft", () => {
    expect(fields).toContain("onChangeText={setName}");
    expect(fields).toContain("onChangeText={setAddress}");
  });

  it("the write is hooked to losing focus", () => {
    expect(fields).toContain("onBlur={commitName}");
    expect(fields).toContain("onBlur={commitAddress}");
  });

  it("a field opened then closed without typing writes nothing", () => {
    expect(fields).toMatch(/if \(draft === null\) return;/);
  });

  it("both surfaces that name a household share THIS component", () => {
    expect(read(GUEST_SCREEN)).toContain("<HouseholdFields");
    expect(read(HOUSEHOLD_SCREEN)).toContain("<HouseholdFields");
  });
});

describe("removal, name and address no longer depend on the entity", () => {
  it("no household-entity guard left on the guest screen", () => {
    expect(read(GUEST_SCREEN)).not.toContain("resolved?.household &&");
  });
});

describe("the new screens honour the write permission", () => {
  it("the household screen gates add, remove, split and delete", () => {
    const household = read(HOUSEHOLD_SCREEN);
    expect(household).toContain("useCanEditHere");
    expect(household).toContain("const canEdit = useCanEditHere();");
    expect(household).toContain("{canEdit && (");
    expect(household).toContain("{canEdit && !splitting && (");
  });

  it("the recipients list offers no mutating command", () => {
    const list = read(RECIPIENTS);
    for (const action of ["attachToHousehold", "detachFromHousehold", "splitHousehold", "removeHousehold", "materializeHousehold"]) {
      expect(list).not.toContain(`${action}(`);
    }
  });
});
