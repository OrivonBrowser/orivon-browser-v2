import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'electron/main/index.ts') },
      },
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'electron/preload/index.ts') },
      },
    },
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: { input: { index: path.resolve(__dirname, 'index.html') } },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    define: {
      'process.env.IS_ELECTRON': JSON.stringify('true'),
    },
  },
});
