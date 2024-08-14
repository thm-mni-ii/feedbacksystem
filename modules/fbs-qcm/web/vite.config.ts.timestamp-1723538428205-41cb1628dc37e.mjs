// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import eslintPlugin from "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/node_modules/vite-plugin-eslint/dist/index.mjs";
import vuetify from "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/node_modules/vite-plugin-vuetify/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/leon/code/feedbacksystem/modules/fbs-qcm/web/vite.config.ts";
var vite_config_default = defineConfig({
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: "internal:charset-removal",
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === "charset") {
                atRule.remove();
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
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    host: true,
    port: 8085,
    proxy: {
      "/api_v1": {
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsZW9uXFxcXGNvZGVcXFxcZmVlZGJhY2tzeXN0ZW1cXFxcbW9kdWxlc1xcXFxmYnMtcWNtXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbGVvblxcXFxjb2RlXFxcXGZlZWRiYWNrc3lzdGVtXFxcXG1vZHVsZXNcXFxcZmJzLXFjbVxcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2xlb24vY29kZS9mZWVkYmFja3N5c3RlbS9tb2R1bGVzL2Zicy1xY20vd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xyXG5pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcclxuaW1wb3J0IHZ1ZXRpZnkgZnJvbSAndml0ZS1wbHVnaW4tdnVldGlmeSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzOiB7XHJcbiAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3N0Y3NzUGx1Z2luOiAnaW50ZXJuYWw6Y2hhcnNldC1yZW1vdmFsJyxcclxuICAgICAgICAgIEF0UnVsZToge1xyXG4gICAgICAgICAgICBjaGFyc2V0OiAoYXRSdWxlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoYXRSdWxlLm5hbWUgPT09ICdjaGFyc2V0Jykge1xyXG4gICAgICAgICAgICAgICAgYXRSdWxlLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAaW1wb3J0IFwiQC9hc3NldHMvc2V0dGluZ3Muc2Nzc1wiO2BcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgdnVlKCksXHJcbiAgICB2dWVKc3goKSxcclxuICAgIGVzbGludFBsdWdpbigpLFxyXG4gICAgdnVldGlmeSh7XHJcbiAgICAgIGF1dG9JbXBvcnQ6IHRydWVcclxuICAgIH0pXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcG9ydDogODA4NSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpX3YxJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC8nLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVcsU0FBUyxlQUFlLFdBQVc7QUFFcFksU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGFBQWE7QUFONk0sSUFBTSwyQ0FBMkM7QUFTbFIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLGVBQWU7QUFBQSxVQUNmLFFBQVE7QUFBQSxZQUNOLFNBQVMsQ0FBQyxXQUFnQjtBQUN4QixrQkFBSSxPQUFPLFNBQVMsV0FBVztBQUM3Qix1QkFBTyxPQUFPO0FBQUEsY0FDaEI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsUUFDVCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
