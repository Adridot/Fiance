/**
 * NOTE: This config is NOT consumed by the Tailwind v4 CSS pipeline.
 * The project uses @tailwindcss/postcss (v4) with CSS-first configuration.
 * All theme values (accent colors, primary overrides) live in global.css.
 * This file is retained for IDE tooling and Storybook compatibility only.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.stories.{ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset"), require("@fiance/ui/tailwind-preset")],
  theme: {
    extend: {
      colors: {
        // MODIFICATION LOCALE — palette du mariage. Ce bloc RECOPIE `global.css`,
        // qui fait seule autorité (ce fichier n'est pas lu par la chaîne
        // Tailwind v4, cf. la note d'en-tête). Les deux ne doivent pas diverger :
        // une divergence ne casserait que l'aperçu Storybook et la complétion de
        // l'éditeur, silencieusement.
        // ⚠️ `clay`, `olive`, `mustard`, `blue` sont des RÔLES, pas des couleurs.
        // Rampe primaire — Sea Green, ancrée sur 500 = #00916e
        primary: {
          50: "#e5f5f1",
          100: "#ceeee6",
          200: "#aae4d6",
          300: "#71d6c0",
          400: "#15c199",
          500: "#00916e",
          600: "#007a60",
          700: "#006650",
          800: "#005241",
          900: "#003d31",
        },
        // Accents de rôle
        accent: {
          clay:          "#00916e",  // Sea Green — primaire
          "clay-soft":   "#cfeae2",
          olive:         "#0a6b53",  // Sea Green assombri — confirmation
          "olive-soft":  "#d7ece4",
          mustard:       "#85610b",  // Jasmine assombri — attention
          "mustard-soft":"#fbd87f",  // Jasmine
          paper:         "#fdf4ef",  // Powder Petal éclairci
          card:          "#fffbf8",
          postit:        "#fbd87f",  // Jasmine
          blue:          "#0e6a7a",  // Icy Aqua assombri — information
          "blue-soft":   "#b5f8fe",  // Icy Aqua
          strawberry:      "#f75590",  // Wild Strawberry — festif
          "strawberry-ink":  "#b81f5f",
          "strawberry-soft": "#fce4d8",  // Powder Petal
          // deprecated aliases
          gold:          "#85610b",
          "gold-light":  "#fbd87f",
          sage:          "#0a6b53",
          "sage-light":  "#d7ece4",
          blush:         "#cfeae2",
          cream:         "#fdf4ef",
          rose:          "#00916e",
          "rose-light":  "#cfeae2",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        script:  ["Caveat", "cursive"],
        sans:    ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
