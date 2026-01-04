import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";
import Terminal from "vite-plugin-terminal";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    solidPlugin(),
    basicSsl(),
    ...(mode === "development" ? [Terminal({ console: "terminal" })] : []),
  ],
  publicDir: "src/assets/public",
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "https://food-diary.motingo.com/api/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/labeller": {
        target: "https://food-diary.motingo.com/labeller/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/labeller/, ""),
      },
    },
  },
  build: {
    target: "esnext",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/acceptance.test.*"],
    browser: {
      enabled: false, // Can be enabled when browser providers are installed
      name: "chromium",
      provider: "playwright",
    },
  },
}));
