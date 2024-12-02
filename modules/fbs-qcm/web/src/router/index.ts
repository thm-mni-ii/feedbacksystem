import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
        path: '/cytp',
        name: '/CytographTest',
        component: () => import('../views/CytoGraph.vue')
    },
    {
        path: '/myTest',
        name: '/myTest',
        component: () => import('../views/MyTest.vue')
    },
    {
      path: '/manageCatalog/:catalogId',
      name: 'manageCatalog',
      component: () => import('../views/ManageCatalogView.vue')
    },
    {
      path: '/newQuestion',
      name: 'newQuestion',
      component: () => import('../views/NewQuestionView.vue')
    },
    {
      path: '/catalogSession/:courseId?/:catalogId?',
      name: 'catalogSession',
      component: () => import('../views/CatalogSessionView.vue')
    },
    {
      path: '/addCat',
      name: 'addCat',
      component: () => import('../views/NewCatView.vue')
    },
    {
      path: '/question',
      name: 'question',
      component: () => import('../views/QuestionView.vue')
    },
    {
      path: '/deleteQuestion',
      name: 'delete',
      component: () => import('../views/DeleteQuestionView.vue')
    },
    {
      path: '/allQuestions',
      name: 'allQuestions',
      component: () => import('../views/AllQuestionsView.vue')
    }
    // {
    //   path: "/:pathMatch(.*)*",
    //   name: "not-found",
    //   component: () => import("../views/NotFoundView.vue"),
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

router.beforeEach((to, from, next) => {
  // console.log('beforeEach', to, from)

  next()
})

export default router
