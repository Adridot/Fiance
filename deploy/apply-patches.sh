#!/usr/bin/env bash
#
# Réapplique les modifications locales de cette instance sur l'arbre courant.
#
# Ces patches ne sont pas des correctifs temporaires : ce sont les écarts
# assumés entre le dépôt amont et cette instance familiale auto-hébergée. Ils
# doivent être réappliqués après chaque récupération d'une version amont.
#
#   --check   vérifie sans rien modifier
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

MODE=${1:-apply}
PATCHES=(deploy/patches/*.patch)   # l'ordre du glob EST l'ordre d'application

# ── Contrôle 1 : la série s'applique-t-elle sur l'amont, dans l'ordre ? ───────
#
# Vérifier chaque patch isolément contre l'arbre courant ne suffit pas : les
# patches sont appliqués EN SÉQUENCE, donc l'un d'eux peut dépendre du contexte
# qu'un précédent vient de créer. Testés séparément, ils passeraient au vert et
# échoueraient à l'application. On rejoue donc la série dans un index Git
# temporaire amorcé sur HEAD — sans jamais toucher l'arbre de travail.
verifier_serie() {
  local index; index=$(mktemp -t fiance-patch-index.XXXXXX)
  local rc=0
  trap 'rm -f "$index"' RETURN
  GIT_INDEX_FILE="$index" git read-tree HEAD
  for patch in "${PATCHES[@]}"; do
    if ! GIT_INDEX_FILE="$index" git apply --cached "$patch" 2>/dev/null; then
      echo "  la série casse à $(basename "$patch") — il ne s'applique pas sur l'amont + les précédents" >&2
      rc=1
      break
    fi
  done
  return $rc
}

# ── Contrôle 2 : état de chaque patch vis-à-vis de l'arbre de travail ────────
FAILED=()
for patch in "${PATCHES[@]}"; do
  name=$(basename "$patch")
  if git apply --check "$patch" 2>/dev/null; then
    if [[ $MODE == "--check" ]]; then
      echo "  à appliquer   $name"
    else
      git apply "$patch"
      echo "  appliqué      $name"
    fi
  elif git apply --reverse --check "$patch" 2>/dev/null; then
    # Déjà en place : réappliquer produirait une erreur trompeuse.
    echo "  déjà appliqué $name"
  else
    echo "  EN CONFLIT    $name" >&2
    FAILED+=("$name")
  fi
done

if (( ${#FAILED[@]} > 0 )); then
  cat >&2 <<MSG

$(printf '%s\n' "${FAILED[@]}") ne s'applique(nt) plus.

Soit l'amont a modifié les mêmes lignes, soit l'arbre local a divergé du patch
(une modification faite après sa génération). Comparer d'abord avec
\`git diff\`, puis régénérer le patch ; ou le reprendre à la main avec
\`git apply --3way\` pour obtenir les marqueurs de conflit.

Ne pas mettre en service sans cela : une modification locale silencieusement
absente ne se voit qu'à l'usage — sync qui ne démarre pas, verrou du mariage
unique levé, cadres d'invitation ignorés à l'import.
MSG
  exit 1
fi

if ! verifier_serie; then
  cat >&2 <<'MSG'

Chaque patch est valide isolément, mais la SÉRIE ne s'applique pas sur l'amont.

C'est le cas typique de deux patches qui touchent le même fichier, dont le
second a été généré sur un arbre où le premier était déjà appliqué. Après une
récupération amont, la réapplication échouerait alors qu'un contrôle
patch-par-patch ne voit rien.

Régénérer les patches concernés dans l'ordre, chacun sur un arbre où les
précédents sont appliqués.
MSG
  exit 1
fi
