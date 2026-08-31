#!/usr/bin/env bash
# Rebuild du bundle web de Fiancé + remise en service.
#
# Trois pièges que ce script encapsule :
#   1. Le Node de l'hôte (18) est trop vieux pour Expo SDK 57 → build en
#      conteneur node:22.
#   2. En --user non-root, `corepack enable` ne peut pas écrire dans
#      /usr/local/bin → --install-directory /tmp/bin.
#   3. `expo export` recrée dist/ : le bind-mount de fiance-web pointe alors
#      sur un inode supprimé et TOUT le site répond 500. Le conteneur doit
#      être recréé après le build, pas simplement rechargé.
set -euo pipefail

ROOT=/home/adidot/fiance

# Les modifications locales de cette instance (déverrouillage premium, verrou du
# mariage unique, cadres à l'import) vivent dans deploy/patches/. Un patch qui
# cesse de s'appliquer après une mise à jour amont ne produit AUCUNE erreur
# visible à l'exécution : la fonctionnalité disparaît simplement. On refuse donc
# de construire plutôt que de livrer un bundle amputé.
echo "→ vérification des modifications locales"
"$ROOT/deploy/apply-patches.sh" --check

# Construction dans un répertoire à part, puis bascule.
#
# `expo export` VIDE son répertoire de sortie avant de reconstruire. Bâtir
# directement dans `dist/` mettait donc le site hors service pendant toute la
# durée du build — plusieurs minutes — et un build interrompu laissait le site
# mort, avec des 500 sur toutes les pages alors que rien n'était cassé.
#
# On bâtit dans `dist.new`, et on ne remplace `dist` qu'une fois le résultat
# vérifié. Le site continue de servir l'ancienne version jusqu'à la bascule.
echo "→ build du bundle web (plusieurs minutes, le site reste en ligne)"
rm -rf "$ROOT/apps/mobile/dist.new"
docker run --rm \
  -v "$ROOT:/app" -w /app \
  -e CI=1 -e NODE_OPTIONS=--max-old-space-size=4096 \
  -e HOME=/tmp -e COREPACK_HOME=/tmp/.corepack \
  --user "$(id -u):$(id -g)" \
  node:22-bookworm bash -c '
    set -e
    mkdir -p /tmp/bin && export PATH=/tmp/bin:$PATH
    corepack enable --install-directory /tmp/bin
    corepack prepare pnpm@10.33.0 --activate
    pnpm install --frozen-lockfile
    cd apps/mobile
    npx expo export --platform web --output-dir dist.new
  '

# inject-pwa.js écrit en dur dans dist/. Plutôt que de renommer des répertoires
# sous les pieds du conteneur qui sert le site, on monte dist.new À LA PLACE de
# dist le temps de cette passe : le script croit travailler dans dist, l'arbre
# servi n'est pas touché.
echo "→ génération du manifeste PWA"
docker run --rm \
  -v "$ROOT:/app" \
  -v "$ROOT/apps/mobile/dist.new:/app/apps/mobile/dist" \
  -w /app/apps/mobile \
  -e HOME=/tmp --user "$(id -u):$(id -g)" \
  node:22-bookworm node scripts/inject-pwa.js

# Garde-fou repris du CLAUDE.md du dépôt : un import direct de
# @expo/ui/swift-ui/modifiers fait planter le bundle web au chargement, et
# `expo export` ne le détecte pas — seule la page qui refuse de s'afficher le
# révèle. Doit valoir 0.
echo "→ vérification ExpoUI"
if grep -qc ExpoUI "$ROOT"/apps/mobile/dist.new/_expo/static/js/web/entry-*.js 2>/dev/null; then
  echo "ÉCHEC : ExpoUI présent dans le bundle web — la page ne s'affichera pas." >&2
  echo "Le site continue de servir la version précédente ; dist.new est conservé pour analyse." >&2
  exit 1
fi

# Contrôle minimal avant bascule : un export tronqué produirait un dist sans
# page d'accueil, et le conteneur répondrait 500 sur tout.
[ -f "$ROOT/apps/mobile/dist.new/index.html" ] || {
  echo "ÉCHEC : dist.new/index.html absent — bascule annulée, le site reste en ligne." >&2
  exit 1
}

echo "→ bascule"
rm -rf "$ROOT/apps/mobile/dist.old"
[ -d "$ROOT/apps/mobile/dist" ] && mv "$ROOT/apps/mobile/dist" "$ROOT/apps/mobile/dist.old"
mv "$ROOT/apps/mobile/dist.new" "$ROOT/apps/mobile/dist"

echo "→ recréation du conteneur (le bind-mount pointe sur l'ancien dist sinon)"
docker compose -f "$ROOT/deploy/docker-compose.yml" up -d --force-recreate

echo "→ contrôle"
sleep 1
for p in / /fr /home /sync/healthz; do
  printf '  %-16s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' -m 15 "https://mariage.didot.io$p")"
done
