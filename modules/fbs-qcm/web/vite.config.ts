import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import eslintPlugin from 'vite-plugin-eslint'
import vuetify from 'vite-plugin-vuetify'

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3000/';
const coreUrl = process.env.CORE_URL ?? 'https://localhost/';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule: any) => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            }
          }
        }
      ]
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/settings.scss";`
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    eslintPlugin(),
    vuetify({
      autoImport: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 8086,
    proxy: {
      '/api_v1': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/core': {
        target: coreUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/core/, '/api/v1')
      }
    }
  }
})
