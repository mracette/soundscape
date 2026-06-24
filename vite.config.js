import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: { port: 3000 },
  // Expose CRA-style env vars (REACT_APP_*) via import.meta.env.
  envPrefix: "REACT_APP_",
  // Keep CRA's output directory so deploy is unchanged.
  build: { outDir: "build" },
});
