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
        // Neutral surface scale — remaps via CSS vars (light default, .dark override)
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
        // Brand + semantic palette; each tone readable on white at 4.5:1+
        pulse: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          950: "#082f49",
        },
        volt: {
          50: "#f5f3ff",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          950: "#3c0d7a",
        },
        mint: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          950: "#04301f",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          950: "#451a03",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          950: "#4c0519",
        },
      },
      fontFamily: {
        display: ["'Segoe UI'", "system-ui", "sans-serif"],
        body: ["'Segoe UI'", "system-ui", "sans-serif"],
        mono: ["'Cascadia Code'", "Consolas", "monospace"],
      },
      boxShadow: {
        // Clean, layered card shadows — no neon glow.
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
        lift: "0 4px 8px rgba(16, 24, 40, 0.06), 0 2px 4px rgba(16, 24, 40, 0.04)",
        pop: "0 12px 24px rgba(16, 24, 40, 0.08), 0 4px 8px rgba(16, 24, 40, 0.04)",
        glow: "0 1px 2px rgba(16, 24, 40, 0.05)", // legacy alias: no glow, same as card
        "glow-volt": "0 1px 2px rgba(16, 24, 40, 0.05)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
