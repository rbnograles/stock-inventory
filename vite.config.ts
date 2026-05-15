/**
 * Configures the React/Vite runtime with the app-level `@` alias so feature
 * code can stay readable as the inventory app grows. Keeping the alias here
 * avoids brittle deep relative imports across scanner, storage, and UI modules.
 */
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
