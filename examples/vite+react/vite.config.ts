import { defineConfig } from 'vite';
import svgrPlugin from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import ViteVisualizer from "rollup-plugin-visualizer";
import { VitePluginRadar } from "vite-plugin-radar";

// https://stackoverflow.com/a/15802301
const headCommitHash = (): string | undefined => {
  try {
    return require("child_process").execSync("git rev-parse HEAD").toString();
  } catch (_) {}
  return undefined;
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __HEAD_COMMIT_HASH__: JSON.stringify(headCommitHash()),
  },
  build: {
    outDir: "./build",
  },
  base: "./",
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "legacy" }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePluginRadar({
      enableDev: true,
      analytics: {
        id: "G-366693052",
      },
    }),
    // ViteVisualizer({
    //   filename: "./build/report-rollup-plugin-visualizer.html",
    //   brotliSize: true,
    // }),
  ],
});
