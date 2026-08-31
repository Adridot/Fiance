import { describe, it, expect } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { base64ToBytes, parseSpreadsheet, mapRowsToGuests, reconcileGuests, type ParsedSheet } from "@/lib/guest-import";
import type { Guest, GuestGroup, Table } from "@fiance/sdk";

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Build a minimal xlsx (shared-strings style, like mariages.net exports). */
function buildXlsx(headers: string[], rows: string[][]): Uint8Array {
  const allRows = [headers, ...rows];
  const strings: string[] = [];
  const stringIndex = new Map<string, number>();
  const colLetter = (i: number) => {
    let s = "";
    for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) {
      s = String.fromCharCode(65 + (n % 26)) + s;
    }
    return s;
  };
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const rowsXml = allRows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${colLetter(c)}${r + 1}`;
          if (value === "") return `<c r="${ref}"/>`; // self-closing empty cell
          let idx = stringIndex.get(value);
          if (idx == null) {
            idx = strings.length;
            strings.push(value);
            stringIndex.set(value, idx);
          }
          return `<c r="${ref}" t="s"><v>${idx}</v></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet><sheetData>${rowsXml}</sheetData></worksheet>`;
  const shared = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst count="${strings.length}" uniqueCount="${strings.length}">${strings
    .map((s) => `<si><t>${escape(s)}</t></si>`)
    .join("")}</sst>`;

  return zipSync({
    "xl/sharedStrings.xml": strToU8(shared),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
  });
}

const MARIAGES_NET_HEADERS = [
  "PRÉNOM", "NOM", "E-MAIL", "TÉLÉPHONE", "TÉLÉPHONE PORTABLE", "GROUPE", "INVITÉ",
  "CONFIRMÉ", "MENU", "ADRESSE", "CODE POSTAL", "VILLE", "DÉPARTEMENT", "TABLE", "SEXE",
];

function makeIdCounter() {
  let n = 0;
  return () => `id-${++n}`;
}

const NO_EXISTING = { groups: [] as GuestGroup[], tables: [] as Table[] };

// ─── parseSpreadsheet ────────────────────────────────────────────────────────

describe("parseSpreadsheet (xlsx)", () => {
  it("parses a mariages.net-style xlsx with shared strings and empty cells", () => {
    const bytes = buildXlsx(MARIAGES_NET_HEADERS, [
      ["Anastasia DANIEL", "", "ana@example.com", "", "0612345678", "Mariés", "OK", "CONFIRMÉ", "Adultes", "", "", "", "", "Table d'Honneur", "Femme"],
      ["Catherine", "", "", "", "", "Famille", "", "EN ATTENTE", "Adultes", "", "", "", "", "", "Femme"],
    ]);
    const sheet = parseSpreadsheet(bytes);
    expect(sheet.headers).toEqual(MARIAGES_NET_HEADERS);
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[0][0]).toBe("Anastasia DANIEL");
    expect(sheet.rows[0][13]).toBe("Table d'Honneur");
    expect(sheet.rows[1][7]).toBe("EN ATTENTE");
  });

  it("throws on empty content", () => {
    expect(() => parseSpreadsheet(strToU8("  \n \n"))).toThrow();
  });
});

describe("parseSpreadsheet (csv)", () => {
  it("parses semicolon-delimited CSV with BOM and quoted fields", () => {
    const csv = '﻿Prénom;Nom;Email\n"Jean; Junior";Dupont;jean@example.com\nMarie;"Du ""Pont""";\n';
    const sheet = parseSpreadsheet(strToU8(csv));
    expect(sheet.headers).toEqual(["Prénom", "Nom", "Email"]);
    expect(sheet.rows[0]).toEqual(["Jean; Junior", "Dupont", "jean@example.com"]);
    expect(sheet.rows[1][1]).toBe('Du "Pont"');
  });

  it("parses comma-delimited CSV with English headers", () => {
    const csv = "First name,Last name,Email,RSVP\nJohn,Smith,john@example.com,yes\n";
    const sheet = parseSpreadsheet(strToU8(csv));
    expect(sheet.headers).toEqual(["First name", "Last name", "Email", "RSVP"]);
    expect(sheet.rows[0]).toEqual(["John", "Smith", "john@example.com", "yes"]);
  });
});

// ─── mapRowsToGuests ─────────────────────────────────────────────────────────

describe("mapRowsToGuests", () => {
  it("maps mariages.net columns: rsvp, group, table, address, mobile preference", () => {
    const sheet: ParsedSheet = {
      headers: MARIAGES_NET_HEADERS,
      rows: [
        ["Paul", "Martin", "paul@example.com", "0102030405", "0612345678", "Mariés", "OK", "CONFIRMÉ", "Adultes", "1 rue de la Paix", "75001", "Paris", "75", "Table d'Honneur", "Homme"],
        ["Catherine", "Durand", "", "0102030405", "", "Famille", "", "EN ATTENTE", "Adultes", "", "", "", "", "", "Femme"],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter(), now: "2026-07-02T00:00:00.000Z" });

    expect(result.guests).toHaveLength(2);
    expect(result.skippedRows).toBe(0);

    const paul = result.guests[0];
    expect(paul.firstName).toBe("Paul");
    expect(paul.lastName).toBe("Martin");
    expect(paul.rsvpStatus).toBe("ACCEPTED");
    expect(paul.phone).toBe("0612345678"); // mobile preferred over landline
    expect(paul.address).toBe("1 rue de la Paix, 75001, Paris");
    expect(paul.email).toBe("paul@example.com");
    // These headers carry no invitation-type column, so every row lands undetermined.
    expect(paul.invitationType).toBe("IMPORT_UNDETERMINED");

    const catherine = result.guests[1];
    expect(catherine.rsvpStatus).toBe("PENDING");
    expect(catherine.phone).toBe("0102030405"); // landline fallback

    expect(result.groups.map((g) => g.name)).toEqual(["Mariés", "Famille"]);
    expect(result.tables.map((tb) => tb.name)).toEqual(["Table d'Honneur"]);
    expect(paul.groupId).toBe(result.groups[0].id);
    expect(paul.tableId).toBe(result.tables[0].id);
    expect(catherine.groupId).toBe(result.groups[1].id);
    expect(catherine.tableId).toBeNull();
  });

  it("splits a full name found in the first-name column", () => {
    const sheet: ParsedSheet = {
      headers: ["PRÉNOM", "NOM"],
      rows: [["Anastasia DANIEL", ""]],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests[0].firstName).toBe("Anastasia");
    expect(result.guests[0].lastName).toBe("DANIEL");
  });

  it("reuses existing groups and tables by case-insensitive name", () => {
    const existing = {
      groups: [{ id: "g1", name: "mariés", createdAt: null, updatedAt: null }],
      tables: [{ id: "t1", name: "TABLE D'HONNEUR", capacity: null, notes: null, positionX: null, positionY: null, shape: null }],
    };
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Nom", "Groupe", "Table"],
      rows: [["Paul", "Martin", "Mariés", "Table d'Honneur"]],
    };
    const result = mapRowsToGuests(sheet, existing, { makeId: makeIdCounter() });
    expect(result.groups).toHaveLength(0);
    expect(result.tables).toHaveLength(0);
    expect(result.guests[0].groupId).toBe("g1");
    expect(result.guests[0].tableId).toBe("t1");
  });

  it("skips rows without any name and counts them", () => {
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Nom", "Email"],
      rows: [
        ["", "", "orphan@example.com"],
        ["Marie", "", ""],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests).toHaveLength(1);
    expect(result.skippedRows).toBe(1);
  });

  it("maps rsvp values: declined, maybe, unknown → PENDING", () => {
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Statut"],
      rows: [
        ["A", "Annulé"],
        ["B", "peut-être"],
        ["C", "???"],
        ["D", ""],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests.map((g) => g.rsvpStatus)).toEqual(["DECLINED", "MAYBE", "PENDING", "PENDING"]);
  });

  it("imports the full xlsx round-trip", () => {
    const bytes = buildXlsx(MARIAGES_NET_HEADERS, [
      ["Paul", "Martin", "", "", "", "Mariés", "OK", "CONFIRMÉ", "Adultes", "", "", "", "", "", "Homme"],
    ]);
    const result = mapRowsToGuests(parseSpreadsheet(bytes), NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests).toHaveLength(1);
    expect(result.guests[0].rsvpStatus).toBe("ACCEPTED");
    expect(result.groups).toHaveLength(1);
  });
});

// ─── base64ToBytes ───────────────────────────────────────────────────────────

describe("base64ToBytes", () => {
  it("round-trips binary data", () => {
    const original = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 255, 128, 7]);
    const b64 = Buffer.from(original).toString("base64");
    expect(Array.from(base64ToBytes(b64))).toEqual(Array.from(original));
  });

  it("handles unpadded input", () => {
    const b64 = Buffer.from("hello!").toString("base64").replace(/=+$/, "");
    expect(Buffer.from(base64ToBytes(b64)).toString("utf8")).toBe("hello!");
  });
});

// ─── mapRowsToGuests — invitation types ──────────────────────────────────────

describe("mapRowsToGuests — invitation types", () => {
  const sheetWith = (header: string, values: string[]) => ({
    headers: ["Prénom", "Nom", header],
    rows: values.map((v, i) => [`Prenom${i}`, `Nom${i}`, v]),
  });
  const ids = () => {
    let n = 0;
    return () => `id-${n++}`;
  };

  it("recognises the usual column headers, whatever the accents and case", () => {
    for (const header of ["Cadre", "CADRE", "Type d'invitation", "invitation", "Cadre d'invitation"]) {
      const r = mapRowsToGuests(sheetWith(header, ["Vin d'honneur"]), { groups: [], tables: [] }, { makeId: ids() });
      expect(r.withoutInvitationType, `header "${header}" not recognised`).toBe(0);
      expect(r.invitationTypes[0].label).toBe("Vin d'honneur");
    }
  });

  it("reuses an existing type, by id or by label, without duplicating it", () => {
    const existing = [
      { id: "FULL", label: "Journée complète", isDefault: true, needsSleeping: false, createdAt: null, updatedAt: null },
    ];
    const r = mapRowsToGuests(
      sheetWith("Cadre", ["FULL", "Journée complète", "journee complete"]),
      { groups: [], tables: [], invitationTypes: existing },
      { makeId: ids() },
    );
    expect(r.invitationTypes).toHaveLength(0);
    expect(r.guests.map((g) => g.invitationType)).toEqual(["FULL", "FULL", "FULL"]);
  });

  it("creates a new type only once when several rows repeat it", () => {
    const r = mapRowsToGuests(
      sheetWith("Cadre", ["Brunch", "Brunch", "Brunch"]),
      { groups: [], tables: [] },
      { makeId: ids() },
    );
    expect(r.invitationTypes).toHaveLength(1);
    expect(new Set(r.guests.map((g) => g.invitationType)).size).toBe(1);
  });

  it("reports rows without an invitation type instead of forcing FULL on them", () => {
    const r = mapRowsToGuests(
      sheetWith("Cadre", ["Cérémonie", "", "  "]),
      { groups: [], tables: [] },
      { makeId: ids() },
    );
    expect(r.withoutInvitationType).toBe(2);
    expect(r.guests[1].invitationType).toBe("IMPORT_UNDETERMINED");
    expect(r.guests[1].invitationType).not.toBe("FULL");
    expect(r.invitationTypes.some((t) => t.id === "IMPORT_UNDETERMINED")).toBe(true);
  });

  it("reports namesakes found in the source", () => {
    const r = mapRowsToGuests(
      { headers: ["Prénom", "Nom", "Cadre"], rows: [["Jean", "Dupont", "Cérémonie"], ["Jean", "Dupont", "Cérémonie"], ["Marie", "Curie", "Cérémonie"]] },
      { groups: [], tables: [] },
      { makeId: ids() },
    );
    expect(r.duplicateNames).toEqual(["jean dupont"]);
    expect(r.guests).toHaveLength(3); // imported all the same: a real namesake is plausible
  });
});

// ─── reconcileGuests ─────────────────────────────────────────────────────────

const guest = (over: Partial<Guest> & { firstName: string; lastName: string }): Guest => ({
  id: `g-${over.firstName}-${over.lastName}`,
  side: null, invitationType: "FULL", rsvpStatus: "PENDING", rsvpDate: null,
  isSleeping: null, childrenCount: 0, diet: "STANDARD", dietNotes: null,
  groupId: null, tableId: null, companionId: null, noTableNeeded: null,
  giftDescription: null, thankYouSent: null, thankYouSentDate: null,
  accommodationId: null, roomNumber: null, rsvpToken: null,
  email: null, phone: null, address: null, notes: null,
  shuttleVendorId: null, shuttlePickupLocation: null, shuttlePickupTime: null,
  parkingNeeded: null, parkingNotes: null, arrivalNotes: null, transportMode: null,
  createdAt: null, updatedAt: null,
  ...over,
});

describe("reconcileGuests", () => {
  it("does not add a guest already present: the import is replayable", () => {
    const existing = [guest({ firstName: "Jean", lastName: "Dupont" })];
    const incoming = [guest({ id: "new", firstName: "Jean", lastName: "Dupont" })];

    const r = reconcileGuests(existing, incoming);

    expect(r.toAdd).toHaveLength(0);
    expect(r.matched).toBe(1);
  });

  it("matches across accents and case", () => {
    const existing = [guest({ firstName: "Cécile", lastName: "MARTIN" })];
    const incoming = [guest({ id: "new", firstName: "cecile", lastName: "martin" })];

    expect(reconcileGuests(existing, incoming).toAdd).toHaveLength(0);
  });

  it("adds the guests that are genuinely unknown", () => {
    const existing = [guest({ firstName: "Jean", lastName: "Dupont" })];
    const incoming = [
      guest({ id: "a", firstName: "Jean", lastName: "Dupont" }),
      guest({ id: "b", firstName: "Marie", lastName: "Curie" }),
    ];

    const r = reconcileGuests(existing, incoming);

    expect(r.toAdd.map((g) => g.lastName)).toEqual(["Curie"]);
  });

  it("fills an empty field without overwriting one already entered in the app", () => {
    const existing = [guest({ firstName: "Jean", lastName: "Dupont", email: null, notes: "Allergique aux fruits de mer" })];
    const incoming = [guest({ id: "new", firstName: "Jean", lastName: "Dupont", email: "jean@example.com", notes: "" })];

    const r = reconcileGuests(existing, incoming);

    expect(r.toUpdate).toHaveLength(1);
    expect(r.toUpdate[0].updates.email).toBe("jean@example.com");
    expect(r.toUpdate[0].updates).not.toHaveProperty("notes");
  });

  it("replaces the undetermined type when the source finally brings a real one", () => {
    const existing = [guest({ firstName: "Jean", lastName: "Dupont", invitationType: "IMPORT_UNDETERMINED" })];
    const incoming = [guest({ id: "new", firstName: "Jean", lastName: "Dupont", invitationType: "CEREMONY" })];

    expect(reconcileGuests(existing, incoming).toUpdate[0].updates.invitationType).toBe("CEREMONY");
  });

  it("does not overwrite an invitation type already chosen in the app", () => {
    const existing = [guest({ firstName: "Jean", lastName: "Dupont", invitationType: "CEREMONY" })];
    const incoming = [guest({ id: "new", firstName: "Jean", lastName: "Dupont", invitationType: "FULL" })];

    const r = reconcileGuests(existing, incoming);
    expect(r.toUpdate).toHaveLength(0);
  });

  it("lets two existing namesakes absorb two namesake source rows", () => {
    const existing = [
      guest({ id: "x1", firstName: "Jean", lastName: "Dupont" }),
      guest({ id: "x2", firstName: "Jean", lastName: "Dupont" }),
    ];
    const incoming = [
      guest({ id: "a", firstName: "Jean", lastName: "Dupont" }),
      guest({ id: "b", firstName: "Jean", lastName: "Dupont" }),
    ];

    const r = reconcileGuests(existing, incoming);

    expect(r.toAdd).toHaveLength(0);
    expect(r.matched).toBe(2);
  });
});

// ─── reconcileGuests — first names ───────────────────────────────────────────

describe("reconcileGuests — the first name is never filled in", () => {
  it("a guest without a first name keeps none, even when the source offers one", () => {
    const existing = [guest({ firstName: "", lastName: "ARDOUIN", groupId: "g1" })];
    const incoming = [guest({ firstName: "", lastName: "ARDOUIN", email: "a@b.c" })];

    const { toAdd, toUpdate, matched } = reconcileGuests(existing, incoming);

    expect(matched).toBe(1);
    expect(toAdd).toHaveLength(0);
    expect(toUpdate[0].updates).not.toHaveProperty("firstName");
    expect(toUpdate[0].updates.email).toBe("a@b.c");
  });

  it("a source lending a spouse's first name adds a person rather than overwriting one", () => {
    // Reconciliation is no safety net here: a borrowed first name changes the match
    // key, so the row is ADDED. The guarantee rests on the source normalizer.
    const existing = [guest({ firstName: "", lastName: "ARDOUIN" })];
    const incoming = [guest({ firstName: "Luc 2", lastName: "ARDOUIN" })];

    const { toAdd, toUpdate } = reconcileGuests(existing, incoming);

    expect(toUpdate).toHaveLength(0);
    expect(toAdd).toHaveLength(1);
    expect(existing[0].firstName).toBe("");
  });
});
