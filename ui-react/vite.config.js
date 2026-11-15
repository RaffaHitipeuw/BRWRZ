import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const forceClassicScript = () => ({
  name: 'force-classic-script',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html) {
    // Hapus type="module" dan crossorigin, lalu tambahkan defer agar jalan di file:/// CEF
    return html
      .replace(/<script\s+type="module"\s+crossorigin/gi, '<script defer')
      .replace(/type="module"\s*/gi, 'defer ')
      .replace(/crossorigin\s*/gi, '');
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), forceClassicScript()],
  build: {
    outDir: '../ui', // Langsung masuk ke D:\main\Projects\BRWRZ\ui yang dibaca oleh MeshBrowser.exe
    emptyOutDir: true,
    target: 'es2015',
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, 'index.html'),
      output: {
        format: 'iife', // Format standar klasik tanpa SystemJS
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
