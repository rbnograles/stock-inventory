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

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate,
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
