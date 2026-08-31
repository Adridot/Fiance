/**
 * Jetons de design — consommateurs JS/TS (barre d'onglets, ForgeThemeProvider,
 * styles en ligne).
 *
 * MODIFICATION LOCALE — les valeurs sont celles de la palette du mariage, pas
 * celles de Garden Press amont.
 *
 * ⚠️ LES NOMS SONT DES RÔLES, PAS DES COULEURS. Ils viennent de l'amont et
 * n'ont volontairement PAS été renommés : 42 fichiers les lisent. Se fier au
 * nom pour deviner la teinte mène à l'erreur — `clay` n'est plus un brun.
 *
 *   clay        → accent PRIMAIRE — Sea Green #00916e (un vert, pas un brun)
 *   olive       → accent de CONFIRMATION — Sea Green assombri (un vert sombre)
 *   mustard     → accent d'ATTENTION — Jasmine assombri (un ambre sombre)
 *   blue        → accent d'INFORMATION — Icy Aqua assombri (un aqua sombre,
 *                 pas un bleu)
 *   strawberry  → accent FESTIF — Wild Strawberry (ornements, sceaux,
 *                 pastilles actives) ; seul jeton nommé d'après sa couleur,
 *                 parce qu'il est neuf
 *   paper/card  → fonds de page et de carte — Powder Petal éclairci
 *   postit      → fond du pense-bête — Jasmine
 *
 * Les variantes `*Soft` sont les remplissages clairs du même rôle. Une couleur
 * claire de la palette ne porte JAMAIS de texte : Jasmine, Icy Aqua et Powder
 * Petal contrastent à 1,38, 1,18 et ~1,2 contre le blanc. Tout rôle qui demande
 * à la fois un fond et de l'encre a donc deux valeurs — la claire remplit, la
 * sombre écrit.
 *
 * Correspondance palette → rôle : Sea Green = clay, Wild Strawberry =
 * strawberry, Powder Petal = paper / strawberrySoft, Jasmine = mustardSoft /
 * postit, Icy Aqua = blueSoft.
 *
 * Les planchers de contraste sont tenus par `garden-theme.test.ts` : aucun
 * jeton ne peut descendre sous la valeur qu'il portait dans l'ancienne
 * identité. Toute retouche de couleur passe par ce test.
 */
export const theme = {
  clay:           "#00916e",
  claySoft:       "#cfeae2",
  olive:          "#0a6b53",
  oliveSoft:      "#d7ece4",
  mustard:        "#85610b",
  mustardSoft:    "#fbd87f",
  paper:          "#fdf4ef",
  card:           "#fffbf8",
  postit:         "#fbd87f",
  blue:           "#0e6a7a",
  blueSoft:       "#b5f8fe",
  strawberry:     "#f75590",
  strawberryInk:  "#b81f5f",
  strawberrySoft: "#fce4d8",
  ink:            "#11241f",
  inkSoft:        "#35443f",
  mute:           "#616f6a",
  hair:           "rgba(17,36,31,0.14)",
  hairStrong:     "rgba(17,36,31,0.24)",
  // Variantes sombres. `inkSoftDark` et `muteDark` recopient les valeurs que
  // `apps/mobile/global.css` pose déjà sous `:root.dark` : les écrans toujours
  // sombres (le déroulé du jour J) lisent le thème en JS et n'ont pas accès aux
  // jetons CSS. Les deux fichiers ne doivent pas diverger.
  paperDark:      "#0d1714",
  cardDark:       "#14211d",
  inkDark:        "#eaf5f0",
  inkSoftDark:    "#a9c3ba",
  muteDark:       "#82968f",
} as const;
