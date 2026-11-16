import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is hosted at a domain root, so absolute asset URLs also work on
// nested client-side routes such as /admin/content.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: 5173,
    open: false,
  },
});
