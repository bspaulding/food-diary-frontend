import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), solidPlugin()],
  publicDir: "src/assets/public",
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    setupFiles: ["./src/test-setup-browser-live.ts"],
    include: [
      "src/acceptance.test.tsx",
      "src/acceptance-add-recipe.test.tsx",
      "src/acceptance-add-entry.test.tsx",
    ],
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      headless: true,
    },
  },
});
