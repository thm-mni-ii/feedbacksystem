import { defineConfig } from 'vite'
import vitePluginSingleSpa from 'vite-plugin-single-spa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vitePluginSingleSpa({
        type: 'root'
    })],
    resolve: {
        alias: {
            'wj-elements/': `${process.cwd()}/node_modules/wj-elements/`
        }
    },
    server: {
        hmr: false
    },
    optimizeDeps: {
        exclude: [`${process.cwd()}/node_modules/wj-elements/dist/wj-icon.js`],
    }
})