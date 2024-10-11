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
      path: '/answerQuestion',
      name: 'answerQuestion',
      component: () => import('../views/CatalogSessionView.vue')
    },
    {
      path: '/newQuestion',
      name: 'newQuestion',
      component: () => import('../views/NewQuestionView.vue')
    },
    {
      path: '/catalogSession/:catalogId',
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
      path: '/editQuestion',
      name: 'edit',
      component: () => import('../views/EditQuestionView.vue')
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
