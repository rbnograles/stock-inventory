const withMT = require("@material-tailwind/react/utils/withMT");

const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
};

const rose = {
  50: "#fff1f2",
  100: "#ffe4e6",
  200: "#fecdd3",
  300: "#fda4af",
  400: "#fb7185",
  500: "#f43f5e",
  600: "#e11d48",
  700: "#be123c",
  800: "#9f1239",
  900: "#881337",
  950: "#4c0519",
};

const emerald = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
  950: "#022c22",
};

const sky = {
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
  950: "#082f49",
};

const fuchsia = {
  50: "#fdf4ff",
  100: "#fae8ff",
  200: "#f5d0fe",
  300: "#f0abfc",
  400: "#e879f9",
  500: "#d946ef",
  600: "#c026d3",
  700: "#a21caf",
  800: "#86198f",
  900: "#701a75",
  950: "#4a044e",
};

const violet = {
  50: "#f5f3ff",
  100: "#ede9fe",
  200: "#ddd6fe",
  300: "#c4b5fd",
  400: "#a78bfa",
  500: "#8b5cf6",
  600: "#7c3aed",
  700: "#6d28d9",
  800: "#5b21b6",
  900: "#4c1d95",
  950: "#2e1065",
};

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate,
        rose,
        emerald,
        sky,
        fuchsia,
        violet,
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 36px -22px rgba(13, 148, 136, 0.55)",
        card: "0 8px 24px -16px rgba(15, 23, 42, 0.25)",
      },
      backgroundImage: {
        "vibe-light":
          "radial-gradient(1200px 600px at 50% -10%, rgba(45, 212, 191, 0.18), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(244, 114, 182, 0.10), transparent 55%), linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%)",
        "vibe-dark":
          "radial-gradient(1200px 600px at 50% -10%, rgba(45, 212, 191, 0.12), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(232, 121, 249, 0.08), transparent 55%), linear-gradient(180deg, #020617 0%, #0b1120 100%)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "pop-in": "pop-in 160ms ease-out",
        "float-slow": "float-slow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
});
