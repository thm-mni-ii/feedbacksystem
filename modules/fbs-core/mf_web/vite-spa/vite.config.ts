import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginSingleSpa from 'vite-plugin-single-spa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginSingleSpa({
      type: 'mife',
      serverPort: 4101,
      assetFileNames: '[name].[ext]',
      spaEntryPoints: 'src/spa.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
