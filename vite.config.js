import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      visualizer({
        open: true, // Automatically opens the report in browser
        gzipSize: true, // Shows gzip-compressed sizes
        brotliSize: true, // Shows brotli-compressed sizes
        filename: 'stats.html' // Output file name
      })
    ],
    base: '/',
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split Firebase into separate chunk
            firebase: [
              'firebase/app',
              'firebase/firestore',
              'firebase/auth',
              'firebase/analytics'
            ],
            // Split React-related dependencies
            react: ['react', 'react-dom', 'react-router-dom'],
            // Add other large dependencies as needed
          }
        },
        chunkSizeWarningLimit: 1000, // Adjust warning threshold (in kB)
      }
    }
  };
});