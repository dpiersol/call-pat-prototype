import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  server: {
    port: 5173,
    fs: {
      allow: [".."],
    },
    proxy: {
      // Same-origin in dev (api.ts uses "" as base) — avoids cross-origin / mixed issues.
      "/auth": { target: "http://127.0.0.1:8787", changeOrigin: true },
      "/admin": { target: "http://127.0.0.1:8787", changeOrigin: true },
      "/reports": { target: "http://127.0.0.1:8787", changeOrigin: true },
      "/attachments": { target: "http://127.0.0.1:8787", changeOrigin: true },
    },
  },
});
