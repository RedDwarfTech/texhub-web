import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [
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
  define: {
    "process.env": process.env,
  },
  css: {},
  optimizeDeps: {
    exclude: ["pg", "pg-cloudflare"],
  },
  build: {
    outDir: "build",
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
        manualChunks: {
          react: ["react", "react-router-dom", "react-dom"],
          reddwarf: ["rd-component", "rdjs-wheel"],
        },
      },
      // https://github.com/brianc/node-postgres/issues/2987
      external: ["pg", "pg-cloudflare", "cloudflare:sockets"],
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
