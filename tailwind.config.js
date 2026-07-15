/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            maxWidth: "100%",
            h2: {
              color: theme("colors.gray.900"),
              fontWeight: "700",
              fontSize: theme("fontSize.2xl")[0],
              marginTop: theme("spacing.10"),
              marginBottom: theme("spacing.4"),
              borderBottomWidth: "1px",
              borderColor: theme("colors.gray.300"),
              paddingBottom: theme("spacing.2"),
            },
            h3: {
              color: theme("colors.indigo.600"),
              fontWeight: "700",
              fontSize: theme("fontSize.xl")[0],
              marginTop: theme("spacing.6"),
              marginBottom: theme("spacing.2"),
            },
            p: {
              color: theme("colors.gray.700"),
              marginBottom: theme("spacing.4"),
            },
            strong: {
              color: theme("colors.gray.900"),
              fontWeight: "700",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.gray.300"),
            h2: {
              color: theme("colors.white"),
              borderColor: theme("colors.gray.700"),
            },
            h3: {
              color: theme("colors.indigo.400"),
            },
            p: {
              color: theme("colors.gray.300"),
            },
            strong: {
              color: theme("colors.white"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
