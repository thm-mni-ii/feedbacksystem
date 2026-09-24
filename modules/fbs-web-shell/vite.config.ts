/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/graphql': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url?.startsWith('/oauth2/callback')) {
            return '/index.html'
          }
        }
      },
      '/.well-known': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/connect': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        inline: ['vuetify']
      }
    }
  }
})
