import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  cacheDir: "../node_modules/.vite",
  plugins: [react()],
  server: {
    proxy: {
      "/companies": "http://localhost:3000",
      "/filings": "http://localhost:3000",
    },
  },
});
