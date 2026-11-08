import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/workspaces': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    },
  },
})