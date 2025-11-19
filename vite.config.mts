import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import commonjs from "@rollup/plugin-commonjs";
import { normalizePath } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

export default defineConfig({
  define: {
    "process.env": JSON.stringify({
      NODE_ENV: "production",
    }),
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: "",
        },
      ],
    }),
    commonjs(),
    react(),
    svgr({
      svgrOptions: {
        // svgr options
      },
      include: "**/*.svg?react",
    }),
    wasm(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      //emitFile: false,
      filename: "test.html",
      open: true,
    }) as PluginOption,
  ],
  css: {},
  optimizeDeps: {
    exclude: [],
  },
  build: {
    commonjsOptions: { include: [] },
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      external: ["react/jsx-runtime"],
      output: {
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
