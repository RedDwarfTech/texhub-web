import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  define: {
    "process.env": JSON.stringify({
      NODE_ENV: "production",
    }),
  },
  plugins: [
    commonjs(),
    nodeResolve({
      exportConditions: ["module"],
    }),
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
  optimizeDeps:{
    exclude: ['wkx', 'sequelize']
  },
  build: {
    commonjsOptions: { include: [] },
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      external: ['sequelize'],
      output: {
        sourcemapExcludeSources: false,
        manualChunks: {
          react: ["react-router-dom"],
          reddwarf: ["rd-component", "rdjs-wheel"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
      'sequelize': path.resolve(__dirname, 'src/empty.js'),
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
