import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxies /api/nomba/* → https://api.nomba.com/* to avoid CORS in dev
      '/api/nomba': {
        target: 'https://api.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba/, ''),
      },
    },
  },
})
