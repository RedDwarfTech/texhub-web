import { PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import autoprefixer from 'autoprefixer';
import { visualizer } from "rollup-plugin-visualizer";
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({ 
      svgrOptions: {
        // svgr options
      },
    }),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      filename: "test.html",
      open:true 
    }) as PluginOption
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({})
      ],
    }
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react','react-router-dom','react-dom'],
          reddwarf: ['rd-component','rdjs-wheel']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  }
})
