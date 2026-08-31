#!/usr/bin/env python3
"""
Régénère deploy/patches/ à partir des modifications locales de l'arbre courant.

À lancer après toute modification locale : un patch régénéré tard, ou pas du
tout, laisse l'arbre et la série diverger — et c'est `deploy/apply-patches.sh`
qui le découvre, au pire moment.

INVARIANT : chaque fichier appartient à EXACTEMENT un patch.

C'est ce qui garantit que la série s'applique dans n'importe quel ordre et
qu'aucun patch ne dépend du contexte créé par un précédent. Deux patches
touchant le même fichier obligeraient à générer le second sur un arbre où le
premier est appliqué — fragile, et invisible tant qu'on ne repart pas d'un
arbre amont vierge.

Conséquence assumée : `useGuestsStore.ts` porte TROIS sujets (rapprochement à
l'import, tri des groupes, opérations de lot) mais vit dans un seul patch. La
cohérence de la série prime sur la pureté thématique.

Les fichiers d'i18n font exception : ils sont partagés par plusieurs sujets et
découpés par hunk, chaque hunk étant attribué d'après un marqueur textuel.
"""
import collections
import os
import subprocess
import sys
import tempfile

# Nature d'un sujet : contribuable à l'amont, ou propre à cette instance. Elle
# décide de la langue attendue et de ce qui peut être proposé en pull request.
AMONT = "amont"
LOCAL = "local"
NATURES_VALIDES = (AMONT, LOCAL)

# fichier → patch. Un fichier ne doit apparaître qu'une fois dans tout ce bloc.
GROUPES = collections.OrderedDict([
    ("01-premium-unlock", (LOCAL, [
        "apps/mobile/store/useRevenueCatStore.ts",
    ])),
    ("02-single-wedding", (LOCAL, [
        "apps/mobile/store/useWeddingRegistryStore.ts",
        "apps/mobile/app/settings/index.tsx",
        "apps/mobile/app/onboarding.tsx",
        "apps/mobile/__tests__/single-wedding-lock.test.ts",
    ])),
    ("03-guest-import-cadres", (AMONT, [
        "apps/mobile/lib/guest-import.ts",
        "apps/mobile/store/useGuestsStore.ts",
        "apps/mobile/app/settings/import-file.tsx",
        "apps/mobile/__tests__/guest-import.test.ts",
        # Ce test porte sur `useGuestsStore` (opérations de lot) : il suit son
        # sujet, pas l'intitulé du patch.
        "apps/mobile/__tests__/guest-bulk-store.test.ts",
    ])),
    # Ce patch a débordé de son intitulé, et c'est l'invariant qui l'exige.
    # S'y ajoute la SÉLECTION EN LOT depuis la liste d'invités (cases à cocher,
    # barre d'actions, et le retrait du déroulé des membres sur l'écran des
    # foyers) : elle vit elle aussi dans `guests/index.tsx`, déjà pris ici. Seul
    # le magasin en reste dehors — il appartient au patch 03.
    # La lisibilité de la liste d'invités — nom de famille en premier, particule
    # séparée du nom, ligne dense, repli global dans la barre de filtres — vit
    # pour l'essentiel dans `guests/index.tsx`, déjà pris ici par le tri des
    # groupes. En faire un « 05 » mettrait deux patches sur ce fichier. Le reste
    # du sujet (schéma, fiche invité, plan de table, destinataires) le rejoint
    # pour que le sujet reste d'un seul tenant.
    ("04-groupes-cotes", (AMONT, [
        "packages/fiance-sdk/src/domain/guests.ts",
        "packages/fiance-sdk/src/domain/guests.test.ts",
        "packages/fiance-sdk/src/domain/schema.ts",
        # Le côté et le rang d'une catégorie doivent survivre à l'export/import
        # JSON : ce test tient sur `schema.ts`, déjà pris ici.
        "packages/fiance-sdk/src/sync/backup.guest-groups.test.ts",
        "apps/mobile/app/(tabs)/guests/index.tsx",
        "apps/mobile/app/(tabs)/guests/[id].tsx",
        "apps/mobile/app/(tabs)/guests/groups.tsx",
        # La navigation de la liste et le libellé de côté que trois écrans
        # partagent : le sujet reste d'un seul tenant, dans le patch qui possède
        # déjà la surface de la liste. (L'écran dédié de complétion des prénoms
        # a vécu ici ; la saisie se fait désormais en place dans la liste.)
        "apps/mobile/app/(tabs)/guests/_layout.tsx",
        "apps/mobile/lib/guest-group-side.ts",
        "apps/mobile/components/GuestBulkBar.tsx",
        "apps/mobile/app/(tabs)/guests/communication/[id].tsx",
        "apps/mobile/components/SeatingPlanView.tsx",
        # ── LE FOYER, unité d'envoi et de réponse ────────────────────────
        # Il rejoint ce patch parce que c'est du MODÈLE et de la LISTE, que ce
        # patch possède déjà : `schema.ts`, `guests.ts`, la fiche et la liste y
        # sont, et le foyer ne se comprend pas sans eux. Son domaine, son écran
        # de constitution et le transport de sa collection le suivent.
        "packages/fiance-sdk/src/domain/households.ts",
        "packages/fiance-sdk/src/domain/households.test.ts",
        "apps/mobile/app/(tabs)/guests/households.tsx",
        # L'ADMINISTRATION des foyers : la liste des destinataires, l'écran d'un
        # foyer, et les deux composants que la fiche invité et cet écran
        # partagent — c'est ce partage qui les empêche de diverger sur la
        # validation de la saisie et sur la matérialisation de l'entité.
        "apps/mobile/app/(tabs)/guests/recipients.tsx",
        "apps/mobile/app/(tabs)/guests/household/[id].tsx",
        "apps/mobile/components/HouseholdFields.tsx",
        "apps/mobile/components/HouseholdMemberPicker.tsx",
        # Ce test porte sur les actions de foyer du magasin : il suit son sujet,
        # pas le fichier qu'il exerce (`useGuestsStore` appartient au patch 03).
        "apps/mobile/__tests__/household-store.test.ts",
        # Trois garanties d'écran qui ne se voient pas à l'exécution : aucune
        # écriture par `updateHousehold`, aucune écriture à la frappe, et aucune
        # garde sur l'entité. Vérifiées sur le TEXTE des fichiers.
        "apps/mobile/__tests__/household-screens.test.ts",
        # Le foyer est une COLLECTION de plus : elle traverse la carte des types
        # synchronisés, le transport, la persistance locale et la sauvegarde.
        "packages/fiance-sdk/src/objects/object-types.ts",
        "packages/fiance-sdk/src/objects/mappers.ts",
        "packages/fiance-sdk/src/index.ts",
        # La hauteur de la ligne d'aide d'un menu en ligne. Fichiers NEUFS,
        # mais ils rejoignent le 04 et non le 14 : le barrel qui les exporte
        # vit ici, et un 04 qui exporterait un module absent de son propre
        # patch ne compilerait pas seul.
        "packages/fiance-sdk/src/domain/inline-menu.ts",
        "packages/fiance-sdk/src/domain/inline-menu.test.ts",
        "packages/fiance-sdk/src/sync/backup.ts",
        "packages/fiance-sdk/src/sync/backup.households.test.ts",
        "packages/fiance-sdk/src/sync/backup.documents.test.ts",
        "packages/fiance-sdk/src/sync/import-legacy.test.ts",
        "apps/mobile/lib/persistence.ts",
        "apps/mobile/lib/sync.ts",
        # `space-sync.ts` et son test portent DÉSORMAIS TROIS sujets — la
        # collection des foyers (ici), le document RSVP de foyer que 07 possède
        # par ailleurs, et la durabilité des écritures (08). Ils sont passés au
        # découpage par hunk dans PARTAGES : voir le commentaire qui l'explique.
        # Le destinataire d'une communication devient le foyer : le domaine des
        # communications rejoint donc le foyer, dont il ne fait que projeter les
        # membres. L'écran, lui, était déjà ici.
        "packages/fiance-sdk/src/domain/communications.ts",
        "packages/fiance-sdk/src/domain/communications.test.ts",
        # La disjonction des compteurs de couverts vit dans `guests.ts`, déjà
        # ici : les deux jeux d'essai qui en fixent la forme le suivent.
        "packages/fiance-sdk/src/domain/budget.test.ts",
        "apps/mobile/__tests__/budget-vendor-comparison.test.ts",
    ])),
    # ── Plancher de contraste ─────────────────────────────────────────────
    # Seul élément générique du sujet couleur : il mesure chaque jeton porteur de
    # texte et refuse toute régression. Les autres fichiers `fiance-ui` du sujet
    # portent des VALEURS de palette, qui ne regardent que cette instance.
    ("05a-plancher-de-contraste", (AMONT, [
        "packages/fiance-ui/src/garden-theme.test.ts",
    ])),
    # ── Écrans et palette ─────────────────────────────────────────────────
    # L'intitulé dit « écrans ET palette » parce que le patch porte les deux, et
    # que l'invariant l'a voulu ainsi. Il a commencé comme un patch de VALEURS :
    # la table de jetons, la rampe Tailwind, la marque hors code applicatif, et
    # les littéraux qui recopiaient les anciennes couleurs dans 70 fichiers. Un
    # littéral oublié ne lève aucune erreur — il reste simplement brun au milieu
    # d'une interface devenue verte. D'où le test de contraste, qui tient le
    # plancher, et la recherche des anciens hexadécimaux, qui tient le reste.
    #
    # Il possède ensuite, par le seul jeu de l'invariant, des écrans entiers :
    # neuf d'entre eux nommaient un invité sans sa particule, et l'export de
    # documents avec eux. L'intitulé a suivi le contenu plutôt que l'inverse.
    #
    # Cinq fichiers portant des littéraux à reprendre appartiennent déjà aux
    # patches 02, 03 et 04 (`settings/index.tsx`, `onboarding.tsx`,
    # `settings/import-file.tsx`, `guests/[id].tsx`, `guests/groups.tsx`,
    # `guests/_layout.tsx`). Leurs reprises de couleur sont RESTÉES dans leur
    # patch d'origine, qui porte donc un second sujet : l'invariant prime.
    ("05b-ecrans-et-palette", (LOCAL, [
        # Sources de jetons — les trois tables qui ne doivent pas diverger
        "packages/fiance-ui/src/garden-theme.ts",
        "packages/fiance-ui/src/theme/default.ts",
        "apps/mobile/global.css",
        "apps/mobile/tailwind.config.js",
        # Marque hors code applicatif
        "apps/mobile/app/+html.tsx",
        "apps/mobile/app.json",
        "apps/mobile/scripts/inject-pwa.js",
        # `inject-pwa.js` écrase `dist/manifest.json` au build, mais ce
        # fichier-ci resterait rose si la génération cessait de tourner.
        "apps/mobile/public/manifest.json",
        "CLAUDE.md",
        # Recopies en dur, faute de pouvoir lire les jetons
        "apps/mobile/widgets/PlanningWidget.tsx",
        "packages/fiance-sdk/src/domain/types.ts",
        # Gabarits CSS de documents imprimés : ils ne peuvent pas lire les jetons.
        "apps/mobile/lib/pdf-export.ts",
        "apps/mobile/samples/shared.ts",
        "apps/mobile/samples/small.json",
        "apps/mobile/samples/medium.json",
        "apps/mobile/samples/big.json",
        # Bibliothèque
        "packages/fiance-ui/src/components/FAB.tsx",
        "packages/fiance-ui/src/components/SearchBar.tsx",
        "packages/fiance-ui/src/primitives/input/index.tsx",
        # Écrans applicatifs
        "apps/mobile/app/(tabs)/_layout.web.tsx",
        "apps/mobile/app/(tabs)/home/index.tsx",
        "apps/mobile/app/(tabs)/home/wedding-day.tsx",
        "apps/mobile/app/(tabs)/budget/index.tsx",
        "apps/mobile/app/(tabs)/guests/accommodations.tsx",
        "apps/mobile/app/(tabs)/guests/seating-constraints.tsx",
        "apps/mobile/app/(tabs)/guests/seating.tsx",
        "apps/mobile/app/(tabs)/guests/table-management.tsx",
        "apps/mobile/app/(tabs)/guests/tables.tsx",
        "apps/mobile/app/(tabs)/planning/[id].tsx",
        "apps/mobile/app/(tabs)/planning/_layout.tsx",
        "apps/mobile/app/(tabs)/planning/ceremony.tsx",
        "apps/mobile/app/(tabs)/planning/day-of-item.tsx",
        "apps/mobile/app/(tabs)/planning/events.tsx",
        "apps/mobile/app/(tabs)/planning/honeymoon.tsx",
        "apps/mobile/app/(tabs)/planning/live.tsx",
        "apps/mobile/app/(tabs)/planning/speeches-music.tsx",
        "apps/mobile/app/(tabs)/vendors/[type]/[id].tsx",
        "apps/mobile/app/(tabs)/vendors/[type]/index.tsx",
        "apps/mobile/app/(tabs)/vendors/_layout.tsx",
        "apps/mobile/app/(tabs)/vendors/compare.tsx",
        "apps/mobile/app/(tabs)/vendors/index.tsx",
        "apps/mobile/app/(tabs)/vendors/new.tsx",
        "apps/mobile/app/ideas/[id].tsx",
        "apps/mobile/app/ideas/index.tsx",
        "apps/mobile/app/join.tsx",
        "apps/mobile/app/wedding/[id].tsx",
        "apps/mobile/app/settings/documents.tsx",
        "apps/mobile/app/settings/export-import.tsx",
        "apps/mobile/app/settings/faq.tsx",
        "apps/mobile/app/settings/gifts.tsx",
        "apps/mobile/app/settings/import-external.tsx",
        "apps/mobile/app/settings/premium.tsx",
        "apps/mobile/app/settings/public-page.tsx",
        # Composants
        "apps/mobile/components/CompanionPickerModal.tsx",
        "apps/mobile/components/DesktopSidebar.tsx",
        "apps/mobile/components/EmptyState.tsx",
        "apps/mobile/components/GuestSelectList.tsx",
        "apps/mobile/components/HeaderAddButton.tsx",
        "apps/mobile/components/OfflineBanner.tsx",
        "apps/mobile/components/PaywallSheet.tsx",
        "apps/mobile/components/QRScannerScreen.tsx",
        "apps/mobile/components/QuotaBadge.tsx",
        "apps/mobile/components/ReadOnlyBanner.tsx",
        "apps/mobile/components/SegmentedControl.tsx",
        "apps/mobile/components/budget/ContributorsCard.tsx",
        "apps/mobile/components/planning/PlanningShell.tsx",
        "apps/mobile/components/planning/views.tsx",
        "apps/mobile/components/vendors/GuestPricingSection.tsx",
        # Les intitulés de la page mariage publique (formulaire par foyer) et du
        # devis (les enfants montrés à côté des adultes) : ils suivent l'écran
        # qui les affiche, tous deux déjà pris ici.
        "apps/mobile/i18n/locales/fr/wedding-page.json",
        "apps/mobile/i18n/locales/en/wedding-page.json",
        "apps/mobile/i18n/locales/fr/vendors.json",
        "apps/mobile/i18n/locales/en/vendors.json",
        # Pages marketing
        "apps/mobile/app/(marketing)/[lang]/tools/budget-calculator.tsx",
        "apps/mobile/app/(marketing)/[lang]/tools/seating-chart.tsx",
        "apps/mobile/app/(marketing)/[lang]/tools/timeline.tsx",
        "apps/mobile/components/marketing/BlogPostPage.tsx",
        "apps/mobile/components/marketing/BudgetMiniDemo.tsx",
        "apps/mobile/components/marketing/ConicRing.tsx",
        "apps/mobile/components/marketing/LandingPage.tsx",
        "apps/mobile/components/marketing/LegalPage.tsx",
        "apps/mobile/components/marketing/MarketingNav.tsx",
        "apps/mobile/components/marketing/MarqueeBar.tsx",
        "apps/mobile/components/marketing/PhoneMock.tsx",
    ])),
    # ── Retrait des écrans d'accueil de fonctionnalité ────────────────────
    # UN SEUL fichier applicatif, et c'est voulu. `_layout.tsx` passe aussi
    # `GP.clay` / `GP.card` au `ForgeThemeProvider`, mais PAR RÉFÉRENCE DE
    # JETON : le sujet couleur n'a rien à y modifier, et le fichier revient
    # sans conflit à ce patch.
    ("06-sans-accueils", (LOCAL, [
        "apps/mobile/app/_layout.tsx",
        "apps/mobile/__tests__/no-feature-welcome-host.test.ts",
    ])),
    # ── La particule, partout où un invité est nommé ──────────────────────
    # Ce patch ne porte que TROIS fichiers applicatifs, et c'est l'invariant qui
    # en a décidé : les dix-neuf autres sites corrigés vivent dans des fichiers
    # que 03, 04 et 05 possédaient déjà. Chercher « particule » ici ne montre
    # donc qu'un quart du sujet — voir aussi le bandeau de la fiche invité (04),
    # la recherche (04), les neuf écrans et l'export de documents (05).
    #
    # Le test, lui, est le seul morceau dont la valeur survit au lot : il assure
    # qu'aucune surface ne recompose un nom d'invité à la main, et porte la
    # liste nommée des usages qui en sont dispensés. C'est LÀ qu'est écrite
    # l'exclusion de la synchronisation — la lever, c'est retirer une entrée.
    ("07-particules-partout", (AMONT, [
        "apps/mobile/app/(tabs)/planning/speech.tsx",
        "apps/mobile/app/(tabs)/planning/ceremony-item.tsx",
        "packages/fiance-sdk/src/domain/communication-templates.ts",
        "apps/mobile/__tests__/no-raw-guest-name.test.ts",
        # ── LA RÉPONSE PAR FOYER ─────────────────────────────────────────
        # Le document public passe de deux emplacements nommés à une LISTE de
        # membres, et le nœud se frappe contre le foyer. Ces quatre fichiers-là
        # sont la synchronisation RSVP entière ; ils n'appartenaient à aucun
        # patch, et c'est ici qu'ils viennent parce que ce patch porte déjà le
        # contrat de composition d'un nom — dont ce sujet a fait TOMBER deux
        # tolérances : le document du foyer transporte la particule, ce que les
        # deux emplacements nommés ne faisaient pas.
        "packages/fiance-sdk/src/sync/rsvp.ts",
        "packages/fiance-sdk/src/sync/rsvp.test.ts",
        "apps/mobile/lib/rsvp-sync.ts",
        "apps/mobile/__tests__/rsvp-sync.test.ts",
    ])),
    ("08-durabilite-des-ecritures", (AMONT, [
        # Une modification acceptée par l'interface doit finir au serveur, ou
        # bien être dite. Ces deux fichiers-là n'existent que pour ça ; le reste
        # du sujet vit dans des fichiers que d'autres patches possèdent déjà et
        # se récupère par marqueur de hunk (voir PARTAGES).
        "apps/mobile/store/useSyncPendingStore.ts",
        "apps/mobile/components/UnsavedChangesBanner.tsx",
        # Ajouté le 21 août 2026 : l'ordre du démarrage (le planificateur de
        # poussée branché AVANT l'hydratation, le rattrapage de ce qui attendait)
        # et le vidage au départ de la page. Ce fichier n'appartenait jusqu'ici à
        # AUCUN patch — il n'était pas modifié. L'invariant « un fichier, un
        # patch » est donc respecté, et 08 est son sujet.
        "apps/mobile/lib/providers.tsx",
    ])),
    # ── Le démarrage : le mesurer, et ne plus le faire attendre à blanc ────
    #
    # NEUVIÈME PATCH, et il a fallu le créer. Le plan supposait que le sujet
    # tiendrait dans 01, 06 et 07 ; à l'implémentation, CINQ des huit fichiers
    # touchés n'appartenaient à aucun patch — ceux-ci. Les trois autres
    # (`app/+html.tsx`, `app/_layout.tsx`, `(tabs)/guests/index.tsx`) avaient
    # déjà un foyer (05, 06, 04) et y RESTENT, leurs hunks de démarrage avec
    # eux : l'invariant « un fichier, un patch » prime sur la pureté du sujet,
    # comme pour 04 et 05 avant lui. Chercher « démarrage » ici ne montre donc
    # qu'une part du sujet.
    #
    # Ce que ces cinq fichiers portent :
    #   - `demarrage-marques.ts` — les marques de temps, sans lesquelles on
    #     optimiserait à l'aveugle : aucun navigateur n'étant joignable depuis
    #     la VM, c'est le seul endroit où le temps du démarrage est réel.
    #   - `indicateur-de-chargement.ts` — le seul lien entre l'indicateur écrit
    #     en clair dans le prérendu et React, qui sait quand il a monté.
    #   - `db/provider.tsx`, `lib/server.ts`, `lib/identity.ts` — les points de
    #     passage marqués : fin de l'hydratation, et chacun des `deriveSession`
    #     (un Argon2id, appelé plusieurs fois par démarrage).
    ("09-demarrage-mesure-et-attente", (AMONT, [
        # Ajouté le 22 août 2026 : la cause réelle du délai. Le web tombait sur
        # l'Argon2id de `@noble/hashes` en JavaScript pur — 2 904 ms contre
        # 283 ms pour le vrai `hash-wasm` en WebAssembly, même condensat. Le
        # détournement n'a de raison d'être que sur Hermes. Ce fichier
        # n'appartenait à aucun patch et n'avait jamais été modifié.
        "apps/mobile/metro.config.js",
        "apps/mobile/lib/demarrage-marques.ts",
        "apps/mobile/lib/indicateur-de-chargement.ts",
        "apps/mobile/db/provider.tsx",
        "apps/mobile/lib/server.ts",
        "apps/mobile/lib/identity.ts",
    ])),
    # ── La télémétrie ne s'ouvre pas de collecteur par accident ────────────
    #
    # DIXIÈME PATCH, et il a fallu le créer plutôt que loger le sujet ailleurs.
    # Aucun des neuf ne le couvre : ce n'est ni la durabilité des écritures (08)
    # ni le démarrage (09), même si l'appel part du démarrage. Les deux fichiers
    # n'appartenaient à aucun patch et `analytics.ts` n'avait jamais été modifié
    # — l'invariant « un fichier, un patch » est donc intact.
    #
    # Le sujet : `EXPO_PUBLIC_ANALYTICS_URL` est vide sur cette instance, et
    # `StarfishClient` accepte une base vide en construisant une URL RELATIVE.
    # Le lot d'événements partait donc vers l'origine de l'app elle-même, où
    # nginx sert un site statique et répond 405 — à la minute, par onglet.
    ("10-telemetrie-sans-collecteur", (LOCAL, [
        "apps/mobile/lib/analytics.ts",
        "apps/mobile/__tests__/analytics-sans-route.test.ts",
    ])),
    # ── Une lecture ne doit pas produire une écriture ──────────────────────
    #
    # ONZIÈME PATCH, créé plutôt que logé ailleurs. 08 (durabilité des
    # écritures) était le voisin tentant, et c'est justement pourquoi il ne
    # convient pas : 08 garantit qu'une écriture VOULUE finit au serveur, celui-ci
    # empêche une écriture NON VOULUE d'y aller. Les intituler pareil rendrait
    # les deux illisibles.
    #
    # Le sujet : `pushPublicPageContent` écrivait à chaque appel, y compris
    # quand rien n'avait changé. Seul, ce défaut ne coûtait qu'une écriture
    # inutile par retour au premier plan — il vivait là depuis toujours. Avec le
    # flux d'événements du serveur de sync, il s'est refermé en BOUCLE :
    # l'écriture émet un événement, l'onglet auteur reçoit son propre écho,
    # hydrate, et l'hydratation repousse. 120 requêtes/minute mesurées le 22 août
    # 2026 sans personne devant l'écran.
    #
    # Ce fichier n'appartenait à AUCUN patch — le `public-page.tsx` de 05 est
    # l'écran de réglages, un autre fichier. L'invariant « un fichier, un patch »
    # est donc intact. La garde de rôle qui manquait sur la ré-poussée, elle,
    # vit dans `providers.tsx`, que 08 possède déjà : elle y RESTE, l'invariant
    # primant sur la pureté du sujet, comme pour 04, 05 et 09 avant lui.
    ("11-lecture-sans-ecriture", (AMONT, [
        "apps/mobile/lib/public-page.ts",
        "apps/mobile/__tests__/public-page-push.test.ts",
    ])),
    # Le keyring est versionné par époques, le contenu ne l'est pas : une
    # rotation de clé rend illisible tout ce qui a été scellé avant elle, sans
    # que rien ne le signale. Ce patch pose les trois pièces qui manquaient —
    # dire qu'on ne peut pas lire (et refuser d'écrire), resceller le contenu
    # pour qu'une révocation révoque, et un lien d'invitation qui survive à un
    # partage ordinaire.
    #
    # L'ESSENTIEL VIT DANS DES MODULES NEUFS, et c'est délibéré : `space-sync.ts`
    # appartient déjà à 04 et 08, `join.tsx` à 05b, `identity.ts` à 09. Y loger
    # le chiffrement et l'invitation donnerait des intitulés qui cessent de dire
    # ce qu'ils contiennent. Ces fichiers-là ne reçoivent qu'un point d'appel.
    ("12-acces-chiffre-et-invitations", (LOCAL, [
        # Ce qu'un appareil peut déchiffrer, et pourquoi une lecture a échoué.
        "apps/mobile/lib/acces-chiffre.ts",
        "apps/mobile/store/useAccesChiffreStore.ts",
        "apps/mobile/components/BandeauLectureImpossible.tsx",
        "apps/mobile/__tests__/acces-chiffre.test.ts",
        "apps/mobile/__tests__/acces-chiffre-store.test.ts",
        "apps/mobile/__tests__/acces-chiffre-sync.test.ts",
        "apps/mobile/__tests__/acces-chiffre-refus-ecriture.test.ts",
        # Le rescellement, et la révocation qui n'est accomplie qu'après lui.
        "apps/mobile/lib/rescellement.ts",
        "apps/mobile/lib/permissions/revoke.ts",
        "apps/mobile/__tests__/rescellement.test.ts",
        "apps/mobile/__tests__/revocation-atomique.test.ts",
        # Le lien court : dépôt chiffré, clé dans le fragment.
        # `app/i/[code].tsx` est la route qui reconnaît `/i/<code>` : sans elle
        # nginx sert bien la coquille, mais le routeur affiche « Unmatched Route ».
        "apps/mobile/app/i/[code].tsx",
        "apps/mobile/lib/invitation-courte.ts",
        "apps/mobile/lib/resolution-d-invitation.ts",
        "apps/mobile/components/InvitationNonReconnue.tsx",
        "apps/mobile/components/InvitationDejaAcceptee.tsx",
        "apps/mobile/__tests__/invitation-courte.test.ts",
        "apps/mobile/__tests__/join-lien-court.test.ts",
        # Le refus d'écrire est porté par l'état de lecture, pas par les droits :
        # `permissions.ts` accorde par surface, et y greffer ce refus mêlerait
        # deux sujets. Ce fichier ne reçoit que le branchement.
        "apps/mobile/lib/permissions/usePermissions.ts",
        # Les intitulés de l'écran de jonction. Seul sujet local de ce fichier.
        "apps/mobile/i18n/locales/fr/common.json",
        "apps/mobile/i18n/locales/en/common.json",
    ])),
    # Un lien d'invitation est un objet à usage unique que personne ne peut
    # relire : `createSpaceInviteLink` tire une paire de clés aléatoire et n'en
    # persiste que les moitiés publiques. Le renvoi est pourtant le geste
    # courant. Ce patch rend le lien RÉÉMETTABLE depuis la fiche du
    # collaborateur, regroupe les liens d'une même personne sous une seule
    # fiche, et dit franchement ce que l'app ne sait pas faire.
    #
    # Aucun changement de protocole ni de collection synchronisée : le
    # regroupement est un calcul de VUE, et `createInviteLink` est réemployé
    # tel quel — réaffecter l'affectation existante casserait l'accès de
    # l'appareil déjà appairé.
    ("13-regenerer-lien-collaborateur", (LOCAL, [
        "apps/mobile/lib/collaborateurs.ts",
        "apps/mobile/components/FicheCollaborateur.tsx",
        "apps/mobile/__tests__/collaborateurs.test.ts",
    ])),
    # ── Édition en ligne de la liste d'invités ────────────────────────────
    # Les fichiers NEUFS de la refonte de la page invités. Les fichiers qu'elle
    # modifie (liste, barre de lot, SDK, i18n) restent chez leur propriétaire,
    # le patch 04 : c'est l'invariant un-fichier-un-patch qui l'impose, et c'est
    # aussi ce qui empêche le 04 de grossir encore.
    ("14-edition-en-ligne-des-invites", (AMONT, [
        "apps/mobile/lib/usePointerRegime.ts",
        "apps/mobile/components/InlineSelectMenu.tsx",
        "apps/mobile/components/InlineChoiceSheet.tsx",
        "apps/mobile/components/GuestListRow.tsx",
        "apps/mobile/components/GuestRecordModal.tsx",
        "apps/mobile/components/GuestQuickAddModal.tsx",
    ])),
    # ── La lecture rafraîchit l'instantané local ───────────────────────────
    #
    # QUINZIÈME PATCH, et il a fallu le créer. L'écran d'ouverture est peint
    # depuis le KV, mais le KV n'était réécrit qu'à la MUTATION LOCALE : les
    # setters de l'hydratation sont muets. Une modification venue d'ailleurs
    # ne s'y inscrivait donc jamais, et chaque chargement à froid réaffichait
    # le périmé jusqu'à la fin du pull. Ce n'est PAS le sujet de 08 (la
    # durabilité va du client au serveur, celle-ci du serveur à l'instantané) :
    # l'y loger achèterait la fausse économie que la série refuse.
    #
    # Le test est un fichier NEUF, et il le fallait : dans `space-sync.test.ts`,
    # tout ce qui suit la ligne amont 1408 forme UN SEUL hunk, où ces tests
    # seraient inséparables de ceux de la durabilité. Précédent exact :
    # `acces-chiffre-sync.test.ts`, que 12 a créé pour la même raison.
    #
    # CONSÉQUENCE ASSUMÉE : le bloc d'imports de `space-sync.ts` est un hunk
    # unique que 04, 08, 12 et celui-ci se partagent — il reste à 12, comme
    # aujourd'hui, et les imports de `persistence.ts` partent avec lui. De même,
    # la ligne `getStorage` du KV simulé de `space-sync.test.ts` part dans 08.
    ("15-instantane-local-rafraichi", (AMONT, [
        "apps/mobile/__tests__/hydratation-instantane.test.ts",
    ])),
    # Les artefacts que la construction dépose sur l'hôte de déploiement —
    # journaux, cache pnpm, export précédent — n'ont pas à salir `git status`
    # là-bas non plus. Le sujet appartient à l'outillage de l'instance.
    ("16-ignorer-les-artefacts", (LOCAL, [
        ".gitignore",
    ])),
])

# Fichiers partagés, découpés par hunk : (marqueur dans le hunk, patch cible).
PARTAGES = {
    "apps/mobile/i18n/locales/fr/settings.json": [
        ("singleWeddingInstance", "02-single-wedding"),
        ("importPreview", "03-guest-import-cadres"),
        ("syncStatusUnsaved", "08-durabilite-des-ecritures"),
        # Époques de chiffrement et lien court. `roleNoAccessSummary` vit dans
        # le même hunk et suit son sujet : l'écran des rôles appartient à 12.
        ("chiffrement", "12-acces-chiffre-et-invitations"),
        ("rescellement", "12-acces-chiffre-et-invitations"),
        ("revocation", "12-acces-chiffre-et-invitations"),
        ("removeCollaborator", "12-acces-chiffre-et-invitations"),
        ("Depot", "12-acces-chiffre-et-invitations"),
        ("depot", "12-acces-chiffre-et-invitations"),
        ("roleNoAccessSummary", "12-acces-chiffre-et-invitations"),
    ],
    "apps/mobile/i18n/locales/en/settings.json": [
        ("singleWeddingInstance", "02-single-wedding"),
        ("importPreview", "03-guest-import-cadres"),
        ("syncStatusUnsaved", "08-durabilite-des-ecritures"),
        # Époques de chiffrement et lien court. `roleNoAccessSummary` vit dans
        # le même hunk et suit son sujet : l'écran des rôles appartient à 12.
        ("chiffrement", "12-acces-chiffre-et-invitations"),
        ("rescellement", "12-acces-chiffre-et-invitations"),
        ("revocation", "12-acces-chiffre-et-invitations"),
        ("removeCollaborator", "12-acces-chiffre-et-invitations"),
        ("Depot", "12-acces-chiffre-et-invitations"),
        ("depot", "12-acces-chiffre-et-invitations"),
        ("roleNoAccessSummary", "12-acces-chiffre-et-invitations"),
    ],
    # ── `roles.tsx`, partagé entre 12 et 13 ────────────────────────────────
    #
    # 12 y a posé la progression du rescellement et le compte rendu d'une
    # révocation ; 13 y pose les fiches de collaborateur, la réémission et le
    # changement de rôle par personne. Les marqueurs de 13 viennent EN PREMIER :
    # ses hunks portent en CONTEXTE des lignes que 12 a écrites (l'état du
    # rescellement est déclaré juste au-dessus du sien), et l'ordre inverse les
    # lui volerait. Aucun hunk purement 12 ne contient de marqueur de 13.
    #
    # CONSÉQUENCE ASSUMÉE : les hunks de `roles.tsx` partent TOUS dans 13, y
    # compris la progression du rescellement et le compte rendu de révocation
    # que 12 avait écrits — ils sont entremêlés aux lignes de 13 dans les mêmes
    # hunks, et un hunk n'a qu'un propriétaire. La série s'applique dans l'ordre
    # et `verifier_serie` la rejoue depuis l'amont : c'est ce que l'invariant
    # garantit. Appliquer 01→12 SEULS laisserait en revanche `revoke.ts` rendre
    # `aResceller` sans que rien ne l'affiche.
    "apps/mobile/app/settings/roles.tsx": [
        ("FicheCollaborateur", "13-regenerer-lien-collaborateur"),
        ("collaborateurs", "13-regenerer-lien-collaborateur"),
        ("Collaborateur", "13-regenerer-lien-collaborateur"),
        ("reemission", "13-regenerer-lien-collaborateur"),
        ("setRevocation", "13-regenerer-lien-collaborateur"),
        ("rolesProposables", "13-regenerer-lien-collaborateur"),
        ("changerLeRoleDuGroupe", "13-regenerer-lien-collaborateur"),
        ("regenerer", "13-regenerer-lien-collaborateur"),
        ("InviteQRSheet", "13-regenerer-lien-collaborateur"),
        ("useMemo", "13-regenerer-lien-collaborateur"),
        ("rescellement", "12-acces-chiffre-et-invitations"),
        ("revocationAccomplie", "12-acces-chiffre-et-invitations"),
        ("revocationIncomplete", "12-acces-chiffre-et-invitations"),
        ("onAvancement", "12-acces-chiffre-et-invitations"),
    ],

    # ── `invite-link.ts` et `InviteQRSheet.tsx`, partagés entre 12 et 13 ────
    #
    # 12 porte le lien COURT (dépôt chiffré, retrait du dépôt), 13 la
    # RÉÉMISSION depuis la fiche. Les marqueurs de 13 viennent en premier : ses
    # hunks touchent des lignes que 12 a écrites, l'inverse n'est pas vrai.
    "apps/mobile/lib/invite-link.ts": [
        ("collaborateurs", "13-regenerer-lien-collaborateur"),
        ("réémission", "13-regenerer-lien-collaborateur"),
        ("estUnCollaborateurConnu", "13-regenerer-lien-collaborateur"),
        ("nombreDeCollaborateursDistincts", "13-regenerer-lien-collaborateur"),
        ("invitation-courte", "12-acces-chiffre-et-invitations"),
        ("chiffrerLeJeton", "12-acces-chiffre-et-invitations"),
        ("depot", "12-acces-chiffre-et-invitations"),
        ("Depot", "12-acces-chiffre-et-invitations"),
        ("dépôt", "12-acces-chiffre-et-invitations"),
        ("normalizeSyncBase", "12-acces-chiffre-et-invitations"),
        ("readCollection", "12-acces-chiffre-et-invitations"),
    ],
    "apps/mobile/components/InviteQRSheet.tsx": [
        ("ouvertureDeLaFeuille", "13-regenerer-lien-collaborateur"),
        ("initialName", "13-regenerer-lien-collaborateur"),
        ("initialRoleId", "13-regenerer-lien-collaborateur"),
        ("nomExplicite", "13-regenerer-lien-collaborateur"),
        ("retirer", "12-acces-chiffre-et-invitations"),
        ("retrait", "12-acces-chiffre-et-invitations"),
        ("depot", "12-acces-chiffre-et-invitations"),
    ],

    # ── `space-sync.ts` et son test, partagés entre 04 et 08 ────────────────
    #
    # L'ORDRE DE CES RÈGLES EST SIGNIFIANT : le premier marqueur trouvé gagne.
    # Les marqueurs de 08 viennent EN PREMIER parce que ses hunks parlent de la
    # perte qu'ils corrigent, et que cette perte s'illustre d'un FOYER qui n'est
    # jamais arrivé au serveur — le mot « foyer » figure donc dans des hunks qui
    # appartiennent à 08. Mettre les marqueurs de 04 devant les lui volerait.
    # L'inverse est sans risque : aucun hunk de 04 ne contient de marqueur de 08.
    "apps/mobile/lib/space-sync.ts": [
        # ── Points d'appel du patch 12, EN PREMIER ─────────────────────────
        # Leurs hunks portent des lignes de CONTEXTE contenant des marqueurs de
        # 08 (`readCollection` dans le bloc d'imports) : placés derrière, 08 les
        # leur volerait. L'inverse est sans risque — aucun hunk de 08 ne contient
        # ces identifiants-ci.
        ("acces-chiffre", "12-acces-chiffre-et-invitations"),
        ("AccesChiffre", "12-acces-chiffre-et-invitations"),
        ("signalerLecture", "12-acces-chiffre-et-invitations"),
        ("epoquesDetenues", "12-acces-chiffre-et-invitations"),
        ("collectionIllisible", "12-acces-chiffre-et-invitations"),
        # ── Points d'appel du patch 15, AVANT ceux de 08 ───────────────────
        # Ces deux hunks-ci portent `typesRecouverts` en contexte, un marqueur
        # de 08 : placés derrière, 08 les lui volerait. L'inverse est sans
        # risque, ces identifiants sont neufs — aucun hunk existant ne les
        # contient. Ils viennent APRÈS ceux de 12 : le bloc d'imports porte les
        # deux, et il reste à 12.
        ("persisterCollectionsRecouvertes", "15-instantane-local-rafraichi"),
        ("PERSISTANCE_PAR_TYPE", "15-instantane-local-rafraichi"),
        ("mariageAppliqué", "15-instantane-local-rafraichi"),
        # Matière du 21 août 2026 au soir — la saisie perdue au rechargement et
        # l'écrasement entre fenêtres. Même sujet que 08 (la durabilité d'une
        # écriture), donc même patch : un fichier n'appartient qu'à UN patch, et
        # 08 possède déjà celui-ci. Identifiants seulement, jamais de mot
        # français courant : un marqueur trop large volerait des hunks à 04.
        ("PousséeEnAttente", "08-durabilite-des-ecritures"),
        ("pousséeEnAttente", "08-durabilite-des-ecritures"),
        ("revPoussées", "08-durabilite-des-ecritures"),
        ("VERSIONS_POUSSÉES", "08-durabilite-des-ecritures"),
        ("DERNIÈRES_POUSSÉES", "08-durabilite-des-ecritures"),
        ("amorcerRéférencesDePoussée", "08-durabilite-des-ecritures"),
        ("_référencesAmorcées", "08-durabilite-des-ecritures"),
        ("_référencesEnMémoire", "08-durabilite-des-ecritures"),
        ("magasinParFenêtre", "08-durabilite-des-ecritures"),
        ("neutraliserCachesDePoussée", "08-durabilite-des-ecritures"),
        ("réamorçageRetenu", "08-durabilite-des-ecritures"),
        ("clearNodeAccessCache", "08-durabilite-des-ecritures"),
        ("readCollection", "08-durabilite-des-ecritures"),
        ("versionsPoussées", "08-durabilite-des-ecritures"),
        ("_localEditEpoch", "08-durabilite-des-ecritures"),
        ("_pushDeferred", "08-durabilite-des-ecritures"),
        ("époqueÀLEntrée", "08-durabilite-des-ecritures"),
        ("_lastHydrateApplied", "08-durabilite-des-ecritures"),
        ("_pushRetryTimer", "08-durabilite-des-ecritures"),
        ("_lastPushWriteDenied", "08-durabilite-des-ecritures"),
        ("exécuterPoussée", "08-durabilite-des-ecritures"),
        ("toutEstPassé", "08-durabilite-des-ecritures"),
        ("typesRecouverts", "08-durabilite-des-ecritures"),
        ("useSyncPendingStore", "08-durabilite-des-ecritures"),
        ("household", "04-groupes-cotes"),
        ("Household", "04-groupes-cotes"),
        ("FOYER", "04-groupes-cotes"),
        ("foyer", "04-groupes-cotes"),
        ("RsvpSubmission", "04-groupes-cotes"),
    ],
    "apps/mobile/__tests__/space-sync.test.ts": [
        # Idem, côté test : le gréement (serveur avec état, chemin rapide, KV
        # simulé, sessions par fenêtre) et les reproductions.
        ("makeStatefulServer", "08-durabilite-des-ecritures"),
        ("docKey", "08-durabilite-des-ecritures"),
        ("mockKvStore", "08-durabilite-des-ecritures"),
        ("mockKvAdapter", "08-durabilite-des-ecritures"),
        ("mockCacheDeDocs", "08-durabilite-des-ecritures"),
        ("mockClearNodeAccessCache", "08-durabilite-des-ecritures"),
        ("mockPullCacheKv", "08-durabilite-des-ecritures"),
        ("sessionActive", "08-durabilite-des-ecritures"),
        ("nouvelleFenêtre", "08-durabilite-des-ecritures"),
        ("cléDeDoc", "08-durabilite-des-ecritures"),
        ("hashConnu", "08-durabilite-des-ecritures"),
        ("pousséeEnAttente", "08-durabilite-des-ecritures"),
        ("rejouerPousséeEnAttente", "08-durabilite-des-ecritures"),
        ("viderPousséeEnAttente", "08-durabilite-des-ecritures"),
        ("nomAuServeur", "08-durabilite-des-ecritures"),
        ("nomAppliqué", "08-durabilite-des-ecritures"),
        ("serveur.seed", "08-durabilite-des-ecritures"),
        ("@fiance/sdk", "08-durabilite-des-ecritures"),
        ("durabilit", "08-durabilite-des-ecritures"),
        ("mockSetGuests", "08-durabilite-des-ecritures"),
        ("useSyncPendingStore", "08-durabilite-des-ecritures"),
        ("réessai", "08-durabilite-des-ecritures"),
        ("household", "04-groupes-cotes"),
        ("Household", "04-groupes-cotes"),
        ("foyer", "04-groupes-cotes"),
    ],
    # `noGroupMembers` est le RETRAIT de la clé du déroulé des membres, et
    # `lastNameRequired` l'assouplissement de la règle d'enregistrement : leurs
    # hunks ne contiennent aucun des autres marqueurs, il leur faut le leur.
    # Tout ce fichier appartient de toute façon au même patch — les marqueurs ne
    # sont là que parce que le découpage par hunk l'exige.
    "apps/mobile/i18n/locales/fr/guests.json": [("quickAdd", "04-groupes-cotes"),
                                                ("columnInvitationType", "04-groupes-cotes"),
                                                ("inlineApplyToHousehold", "04-groupes-cotes"),
                                                ("recordOpenFull", "04-groupes-cotes"),
                                                ("nameCaptureFinish", "04-groupes-cotes"),
                                                ("recipientsTitle", "04-groupes-cotes"),
                                                ("addMemberExplain", "04-groupes-cotes"),
                                                ("removeExplain", "04-groupes-cotes"),
                                                ("AllGroups", "04-groupes-cotes"),
                                                ("nameParticle", "04-groupes-cotes"),
                                                ("noGroupMembers", "04-groupes-cotes"),
                                                ("lastNameRequired", "04-groupes-cotes"),
                                                ("sideNamed", "04-groupes-cotes")],
    "apps/mobile/i18n/locales/en/guests.json": [("quickAdd", "04-groupes-cotes"),
                                                ("columnInvitationType", "04-groupes-cotes"),
                                                ("inlineApplyToHousehold", "04-groupes-cotes"),
                                                ("recordOpenFull", "04-groupes-cotes"),
                                                ("nameCaptureFinish", "04-groupes-cotes"),
                                                ("recipientsTitle", "04-groupes-cotes"),
                                                ("addMemberExplain", "04-groupes-cotes"),
                                                ("removeExplain", "04-groupes-cotes"),
                                                ("AllGroups", "04-groupes-cotes"),
                                                ("nameParticle", "04-groupes-cotes"),
                                                ("noGroupMembers", "04-groupes-cotes"),
                                                ("lastNameRequired", "04-groupes-cotes"),
                                                ("sideNamed", "04-groupes-cotes")],
}


# ─── D'où la série est DÉRIVÉE ────────────────────────────────────────────────
#
# Depuis la reconstruction de l'histoire, la source n'est plus l'arbre de
# travail mais l'INTERVALLE `upstream/master..didot/master`. Trois conséquences,
# toutes voulues :
#
#   1. La génération ne dépend plus de l'état de l'arbre. Elle produisait des
#      patches VIDES sur un arbre propre, sans que le filet ne bronche — c'est
#      ce qui l'a fait tomber en panne trois fois en trois semaines.
#   2. Un fichier neuf jamais suivi par git ne peut plus échapper à la série :
#      il est dans un commit ou il n'est pas dans l'arbre. Le filet ne pouvait
#      pas le voir — il lisait `git status --porcelain` en ne retenant que `M`,
#      `A`, `AM`, `MM`, et un fichier non suivi porte `??`.
#   3. `deploy/` lui-même est exclu : il est versionné sur la branche locale, il
#      n'a rien à faire dans une série que l'on applique à un arbre amont.
BASE = os.environ.get("PATCH_BASE", "upstream/master")
TETE = os.environ.get("PATCH_HEAD", "didot/master")
INTERVALLE = f"{BASE}..{TETE}"


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def diff(*chemins):
    """L'écart de la série, pour ces chemins : l'histoire, jamais l'arbre."""
    return git("diff", INTERVALLE, "--", *chemins)


def fichiers_de_l_intervalle():
    """Les fichiers que l'histoire touche, `deploy/` exclu."""
    noms = git("diff", "--name-only", INTERVALLE).splitlines()
    return {n for n in noms if n and not n.startswith("deploy/")}


def decouper_par_hunk(chemin, regles):
    """Rend {patch: [diff, …]} pour un fichier partagé par plusieurs sujets."""
    diff_texte = diff(chemin)
    if not diff_texte.strip():
        return {}
    lignes = diff_texte.splitlines(keepends=True)
    entete, i = [], 0
    while i < len(lignes) and not lignes[i].startswith("@@"):
        entete.append(lignes[i])
        i += 1
    hunks, courant = [], None
    for ligne in lignes[i:]:
        if ligne.startswith("@@"):
            if courant:
                hunks.append(courant)
            courant = [ligne]
        elif courant is not None:
            courant.append(ligne)
    if courant:
        hunks.append(courant)

    out = collections.defaultdict(list)
    for h in hunks:
        corps = "".join(h)
        cible = next((patch for marqueur, patch in regles if marqueur in corps), None)
        if cible is None:
            sys.exit(f"hunk sans propriétaire dans {chemin} :\n{corps[:400]}")
        out[cible].append("".join(entete) + corps)
    return out


def main():
    # Un sujet non classé ne doit pas passer : sa nature décide de ce qui se
    # traduit et de ce qui peut être proposé à l'amont.
    for nom, valeur in GROUPES.items():
        if not (isinstance(valeur, tuple) and len(valeur) == 2
                and valeur[0] in NATURES_VALIDES):
            sys.exit(f"sujet sans nature — {nom} : attendu (AMONT|LOCAL, [fichiers])")

    doublons = [f for f, n in collections.Counter(
        f for _, fs in GROUPES.values() for f in fs).items() if n > 1]
    if doublons:
        sys.exit(f"invariant rompu — fichier(s) dans plusieurs patches : {doublons}")

    extra = collections.defaultdict(list)
    for chemin, regles in PARTAGES.items():
        for patch, diffs in decouper_par_hunk(chemin, regles).items():
            extra[patch].extend(diffs)

    attendus = set()
    for nom, (_nature, fichiers) in GROUPES.items():
        morceaux = []
        d = diff(*fichiers)
        if d.strip():
            morceaux.append(d)
        morceaux.extend(extra.get(nom, []))
        contenu = "".join(morceaux)
        chemin = f"deploy/patches/{nom}.patch"
        open(chemin, "w").write(contenu)
        attendus.update(fichiers)
        print(f"  {nom}.patch  ({len(contenu.splitlines())} lignes)")

    # ── Filet 1 : un fichier de l'histoire que la table ne réclame pas ────────
    #
    # Calculé sur l'INTERVALLE et non sur `git status` : un fichier absent de la
    # table disparaîtrait de la série sans le moindre signal, et c'est arrivé
    # trois fois. Le contrôle porte désormais sur ce que l'histoire touche, ce
    # qui le rend indépendant de l'état de l'arbre.
    orphelins = sorted(fichiers_de_l_intervalle() - attendus - set(PARTAGES))
    if orphelins:
        sys.exit("\nfichiers de l'histoire dans aucun patch :\n  " + "\n  ".join(orphelins))

    verifier_equivalence()


def verifier_equivalence():
    """La série, appliquée en séquence sur l'amont, doit rendre l'arbre de tête.

    Ce contrôle REMPLACE le filet « fichiers modifiés mais dans aucun patch »,
    et il est strictement plus fort : l'ancien vérifiait une couverture
    NOMINALE — le nom du fichier figure quelque part dans la table — le nouveau
    vérifie le RÉSULTAT. Un fichier déclaré dans un patch mais dont le contenu
    n'y est pas le passait ; il ne passe plus.

    Il s'exécute dans un index temporaire, sans jamais toucher l'arbre de
    travail : la génération doit rester lançable pendant qu'on travaille.
    """
    attendu = git("rev-parse", f"{TETE}^{{tree}}").strip()
    with tempfile.TemporaryDirectory() as tmp:
        index = os.path.join(tmp, "index")
        env = {**os.environ, "GIT_INDEX_FILE": index}

        def g(*args):
            return subprocess.run(["git", *args], capture_output=True, text=True,
                                  check=True, env=env).stdout

        g("read-tree", BASE)
        for nom in GROUPES:
            chemin = f"deploy/patches/{nom}.patch"
            if os.path.getsize(chemin) == 0:
                continue
            subprocess.run(["git", "apply", "--cached", "--whitespace=nowarn", chemin],
                           check=True, env=env)
        # `deploy/` n'est pas dans la série : on le retire de la comparaison en
        # le lisant depuis la tête, plutôt qu'en comparant deux arbres partiels.
        g("read-tree", "--prefix=deploy/", f"{TETE}:deploy")
        obtenu = g("write-tree").strip()

    if obtenu != attendu:
        sys.exit(
            "\ncontrôle d'équivalence ÉCHOUÉ : la série appliquée sur "
            f"{BASE} ne reproduit pas l'arbre de {TETE}.\n"
            f"  attendu {attendu}\n  obtenu  {obtenu}\n"
            "Comparer avec :  git diff " + obtenu + " " + attendu
        )
    print(f"\n  équivalence vérifiée : la série reproduit l'arbre de {TETE} ({attendu[:8]})")


if __name__ == "__main__":
    main()
