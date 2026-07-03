import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nomba': {
        target: 'https://sandbox.nomba.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nomba/, ''),
      },
    },
  },
})
