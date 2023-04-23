import fs from 'fs';
import { resolve } from 'path'
import { defineConfig } from "vite";
import glsl from 'vite-plugin-glsl';
import react from "@vitejs/plugin-react";

export default defineConfig(() => ({
  plugins: [
    glsl({
      include: ['**/*.vert', '**/*.frag'],
      watch: true, 
    })
  ],
    esbuild: {
      loader: "tsx",
      include: /src\/.*\.[tj]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: "load-js-files-as-jsx",
            setup(build) {
              build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => {
                  return ({
                      loader: "tsx",
                      contents: await fs.readFileSync(args.path, "utf8")
                  });
              });
            },
          },
        ],
      },
    },
    resolve: {
      alias: [
        {
          find: "src",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    root: "src",
  }));