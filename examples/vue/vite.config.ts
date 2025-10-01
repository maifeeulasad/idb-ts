import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import babel from 'vite-plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "./build/vue",
  },
  base: "./",
  plugins: [
    vue(),
    vueJsx(),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: [
          ["@babel/preset-env", { loose: true }],
        ],
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "legacy" }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
