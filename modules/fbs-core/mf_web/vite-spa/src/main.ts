// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Components
import App from './App.vue'

// Composables
import router from './router'

// Plugins
import { registerPlugins } from './plugins'
import vuetify from './plugins/vuetify'

import singleSpaVue from 'single-spa-vue'

const pinia = createPinia()
const app = createApp(App)
registerPlugins()

app.use(router)
app.use(vuetify)
app.use(pinia)
app.mount('#app')

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render(h: any) {
      return h(App)
    },
    router
  }
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
