import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// console.log("Environment Variables:", import.meta.env); // Debugging log

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  }
})
