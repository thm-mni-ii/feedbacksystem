import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import WelcomePage from '../components/WelcomePage.vue'
import CodeEditor from '../components/CodeEditor.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/editor',
    name: 'CodeEditor',
    component: CodeEditor
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router