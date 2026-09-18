import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design tokens — themeable via CSS variables (see app/globals.css)
        void: {
          950: "var(--void-950)",
          900: "var(--void-900)",
          850: "var(--void-850)",
          800: "var(--void-800)",
          700: "var(--void-700)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-dim)",
          faint: "var(--ink-faint)",
        },
        pulse: {
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        volt: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        mint: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      fontFamily: {
        display: ["'Segoe UI'", "system-ui", "sans-serif"],
        body: ["'Segoe UI'", "system-ui", "sans-serif"],
        mono: ["'Cascadia Code'", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(56, 189, 248, 0.25)",
        "glow-volt": "0 0 24px rgba(139, 92, 246, 0.25)",
        card: "0 4px 24px rgba(2, 6, 18, 0.5)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "node-drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(6px, -8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "node-drift": "node-drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
