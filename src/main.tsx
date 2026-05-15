/**
 * Boots the React app, attaches Material Tailwind theming, and registers the
 * service worker in production. Keeping registration here makes PWA behavior
 * explicit without mixing install concerns into the inventory screens.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/lib/material";
import App from "@/App";
import "@/styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
