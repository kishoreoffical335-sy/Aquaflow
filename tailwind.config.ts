import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ocean: {
          950: "#020813",
          900: "#040e1d",
          850: "#07162c",
          800: "#0b203f",
          700: "#10325e",
        },
        aqua: {
          300: "#7ee7f8",
          400: "#38d8f4",
          500: "#00c4ec",
          600: "#009bbd",
        },
        cyan: {
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        ice: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
        },
        glass: {
          surface: "rgba(10, 25, 47, 0.45)",
          border: "rgba(255, 255, 255, 0.12)",
          highlight: "rgba(255, 255, 255, 0.25)",
          cyanBorder: "rgba(56, 216, 244, 0.25)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "liquid-glass": "0 20px 50px 0 rgba(0, 8, 25, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 1px 0 rgba(0, 196, 236, 0.15)",
        "liquid-glow": "0 0 35px -5px rgba(0, 196, 236, 0.35)",
        "header-glass": "0 10px 30px -5px rgba(0, 6, 20, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)",
      },
      backgroundImage: {
        "water-radial": "radial-gradient(circle at 50% 10%, rgba(0, 196, 236, 0.18) 0%, rgba(6, 24, 52, 0.4) 45%, rgba(2, 8, 19, 0) 80%)",
        "liquid-surface": "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(56, 216, 244, 0.05) 50%, rgba(10, 30, 60, 0.3) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
