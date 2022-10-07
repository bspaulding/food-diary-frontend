import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [solidPlugin(), basicSsl()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://food-diary.motingo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    target: "esnext",
  },
});
