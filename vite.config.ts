import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer'
    }
  },
  define: {
    global: 'globalThis'
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/vue-i18n')) {
            return 'vue'
          }
          if (id.includes('node_modules/music-metadata') || id.includes('node_modules/buffer')) {
            return 'music'
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
