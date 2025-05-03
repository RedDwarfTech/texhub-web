import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import nodePolyfills from "rollup-plugin-polyfill-node";
import replace from "@rollup/plugin-replace";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [
    commonjs(),
    nodeResolve({
      exportConditions: ['module']
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    nodePolyfills(/* options */),
    react(),
    svgr({
      svgrOptions: {
        // svgr options
      },
      include: "**/*.svg?react",
    }),
    topLevelAwait(),
    wasm(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: "test.html",
      open: true,
    }) as PluginOption,
  ],
  css: {},
  build: {
    commonjsOptions: { include: [] },
    outDir: "build",
    sourcemap: "hidden",
    rollupOptions: {
      external:["pg-cloudflare"],
      output: {
        sourcemapExcludeSources: false,
        manualChunks: {
          react: ["react", "react-router-dom", "react-dom"],
          reddwarf: ["rd-component", "rdjs-wheel"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  server: {
    proxy: {
      "/tex": {
        target: "https://tex.poemhub.top",
        changeOrigin: true,
      },
      "/infra": {
        target: "https://tex.poemhub.top",
        changeOrigin: true,
      },
    },
  },
});
