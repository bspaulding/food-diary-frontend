import { defineConfig, UserConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";
import Terminal from "vite-plugin-terminal";

const useLocalHasura: boolean =
  process.env.FOOD_DIARY_USE_LOCAL_HASURA === "true";
console.log({ useLocalHasura });

export default defineConfig(
  ({ mode }: { mode: string }): UserConfig => ({
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
          target: useLocalHasura
            ? "http://localhost:8080/"
            : "https://food-diary.motingo.com/api/",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        "/labeller": {
          target: "https://food-diary.motingo.com/labeller/",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/labeller/, ""),
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
      exclude: ["**/node_modules/**", "**/dist/**", "**/acceptance*.test.*"],
      browser: {
        enabled: false, // Can be enabled when browser providers are installed
        name: "chromium",
        provider: "playwright",
      },
    },
  }),
);
