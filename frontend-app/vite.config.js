import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/api/students': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
      '/api/emploi': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
      },
      '/api/profs': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
    },
  },
})

