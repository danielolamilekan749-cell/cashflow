import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Sandbox proxy — no credentials needed for most endpoints
      '/api/nomba-sandbox': {
        target: 'https://sandbox.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba-sandbox/, ''),
      },
      // Production proxy — requires real credentials
      '/api/nomba': {
        target: 'https://api.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba/, ''),
      },
    },
  },
})
