import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { listStemFiles } from "./tools/stem-inspector/listStems";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** Dev-only endpoint for the stem inspector: lists public/audio/wav/<song>/*.wav. */
function stemsEndpoint() {
  return {
    name: "stem-inspector-stems",
    configureServer(server) {
      server.middlewares.use("/__stems", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(listStemFiles(resolve(__dirname, "public/audio/wav"))));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    vanillaExtractPlugin(),
    stemsEndpoint(),
  ],
  server: { port: Number(process.env.PORT) || 3000 },
  // Expose CRA-style env vars (REACT_APP_*) via import.meta.env.
  envPrefix: "REACT_APP_",
  // Keep CRA's output directory so deploy is unchanged.
  build: { outDir: "build" },
});
