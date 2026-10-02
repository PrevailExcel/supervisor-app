import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 3002,
    // In dev, forward /api to the Laravel server (override with VITE_API_BASE_URL for a remote API).
    proxy: { '/api': { target: process.env.VITE_DEV_API || 'http://localhost:8000', changeOrigin: true } },
  },
})
