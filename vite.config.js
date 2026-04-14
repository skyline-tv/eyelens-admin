import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    // Optional: forces Vite to fail if 3001 is already in use 
    // instead of automatically trying 3002
    strictPort: true, 
  },
})