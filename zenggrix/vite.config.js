import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static-friendly build: `npm run build` outputs a fully static `dist/` folder
// that Vercel (or any CDN) can serve instantly after a GitHub commit.
export default defineConfig({
  plugins: [react()],
  base: './',
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
