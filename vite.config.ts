import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Sandbox — correct base: sandbox.api.nomba.com
      '/api/nomba-sandbox': {
        target: 'https://sandbox.api.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba-sandbox/, ''),
      },
      // Production
      '/api/nomba': {
        target: 'https://api.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba/, ''),
      },
    },
  },
})
