import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'

// Components
import App from './App.vue'

// Composables
import router from './router'

// Plugins
import { registerPlugins } from './plugins'
import vuetify from './plugins/vuetify'

const pinia = createPinia()
const app = createApp(App)
registerPlugins()

app.use(router)
app.use(vuetify)
app.use(VNetworkGraph)
app.use(pinia)
app.mount('#app')
