// Mini-exécuteur de hooks (useState / useEffect / useCallback) pour tester un hook sans DOM.
type Pile = { state: unknown[]; effets: Array<{ deps?: unknown[]; nettoyage?: () => void } | undefined> };

export function creerHarnais<T>(hook: () => T) {
  const pile: Pile = { state: [], effets: [] };
  const callbacks: Array<{ deps: unknown[]; fn: unknown } | undefined> = [];
  let ordre = 0;
  let sale = false;
  let enRendu = false;
  let planifie = false;
  let dernier!: T;
  let aExecuter: Array<() => void> = [];

  const memeDeps = (a?: unknown[], b?: unknown[]) =>
    !!a && !!b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

  function rendre() {
    enRendu = true;
    try {
      do {
        sale = false;
        ordre = 0;
        dernier = hook();
        const effets = aExecuter;
        aExecuter = [];
        for (const e of effets) e();
      } while (sale);
    } finally {
      enRendu = false;
    }
  }

  function planifier() {
    if (enRendu || planifie) return;
    planifie = true;
    queueMicrotask(() => {
      planifie = false;
      rendre();
    });
  }

  const hooks = {
    useState<S>(init: S | (() => S)) {
      const i = ordre++;
      if (!(i in pile.state)) pile.state[i] = typeof init === "function" ? (init as () => S)() : init;
      const set = (v: S | ((p: S) => S)) => {
        const suivant = typeof v === "function" ? (v as (p: S) => S)(pile.state[i] as S) : v;
        if (Object.is(suivant, pile.state[i])) return;
        pile.state[i] = suivant;
        sale = true;
        planifier();
      };
      return [pile.state[i] as S, set] as const;
    },
    useEffect(fn: () => void | (() => void), deps?: unknown[]) {
      const i = ordre++;
      const slot = (pile.effets[i] ??= {});
      if (memeDeps(deps, slot.deps)) return;
      aExecuter.push(() => {
        slot.nettoyage?.();
        slot.deps = deps;
        slot.nettoyage = fn() ?? undefined;
      });
    },
    useCallback<F>(fn: F, deps: unknown[]) {
      const i = ordre++;
      const prec = callbacks[i];
      if (prec && memeDeps(prec.deps, deps)) return prec.fn as F;
      callbacks[i] = { deps, fn };
      return fn;
    },
  };

  return {
    hooks,
    rendre,
    dernier: () => dernier,
    demonter: () => pile.effets.forEach((e) => e?.nettoyage?.()),
  };
}
