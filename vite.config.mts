import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  define: {
    "process.env": JSON.stringify({
      NODE_ENV: "production",
    }),
  },
  plugins: [
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
  optimizeDeps: {
    exclude: [],
  },
  build: {
    cssMinify: 'esbuild',
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      external: ["react/jsx-runtime"],
      output: {
manualChunks(id) {
        if (id.includes("react-router-dom") || id.includes("react-dom")) {
          return "react";
        }
        if (id.includes("rd-component") || id.includes("rdjs-wheel")) {
          return "reddwarf";
        }
      },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "~bootstrap": path.resolve(import.meta.dirname, "node_modules/bootstrap"),
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
