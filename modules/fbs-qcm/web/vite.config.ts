import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import eslintPlugin from 'vite-plugin-eslint'
import vuetify from 'vite-plugin-vuetify'

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
    port: 8085,
    proxy: {
      '/api_v1': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        secure: false
      },
      '/core': {
        target: 'http://localhost:4200/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/core/, '/api/v1')
      }
    }
  }
})
