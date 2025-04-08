import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  const base = mode === 'production' 
    ? '/project-manager/' 
    : '/';

  return {
    plugins: [
      react(),
      visualizer({ open: true, gzipSize: true, brotliSize: true, filename: "stats.html" })
    ],
    base: base, // Dynamic base path for GitHub Pages
    server: { port: 5173, host: true },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            react: ['react', 'react-dom', 'react-router-dom'],
          }
        },
        chunkSizeWarningLimit: 1000,
      }
    }
  };
});