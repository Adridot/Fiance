import { describe, expect, it, vi } from "vitest";
import { basculeAEspace, estEspace } from "./bascule-clavier";

function evenement(key: string, repeat = false) {
  return { key, repeat, preventDefault: vi.fn(), stopPropagation: vi.fn() };
}

describe("estEspace", () => {
  it("reconnaît les deux noms de la barre d'espace", () => {
    expect(estEspace(" ")).toBe(true);
    expect(estEspace("Spacebar")).toBe(true);
  });

  it("laisse Entrée et les autres touches à react-native-web", () => {
    for (const touche of ["Enter", "Tab", "a", "Escape", ""]) expect(estEspace(touche)).toBe(false);
  });
});

describe("basculeAEspace", () => {
  it("bascule une fois par appui sur Espace et empêche le défilement", () => {
    const basculer = vi.fn();
    const e = evenement(" ");
    basculeAEspace(basculer)(e);
    expect(basculer).toHaveBeenCalledTimes(1);
    expect(e.preventDefault).toHaveBeenCalledTimes(1);
    expect(e.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("ignore la répétition d'une touche maintenue, sans laisser la page défiler", () => {
    const basculer = vi.fn();
    const e = evenement(" ", true);
    basculeAEspace(basculer)(e);
    expect(basculer).not.toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("ne touche ni à Entrée (déjà un onPress) ni aux autres touches", () => {
    const basculer = vi.fn();
    for (const touche of ["Enter", "Tab", "ArrowDown"]) {
      const e = evenement(touche);
      basculeAEspace(basculer)(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(e.stopPropagation).not.toHaveBeenCalled();
    }
    expect(basculer).not.toHaveBeenCalled();
  });
});
