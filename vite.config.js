import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  // Expose CRA-style env vars (REACT_APP_*) via import.meta.env.
  envPrefix: "REACT_APP_",
  // Keep CRA's output directory so deploy is unchanged.
  build: { outDir: "build" },
  // This codebase stores JSX in .js files; esbuild must parse them as JSX.
  esbuild: { loader: "jsx", include: /src\/.*\.js$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
});
