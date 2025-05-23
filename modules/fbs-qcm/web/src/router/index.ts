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
      path: '/EditCatalogInformation/:id',
      name: '/EditCatalogInformation',
      component: () => import('../views/EditCatalogView.vue')
    },
    {
      path: '/catalogManagement',
      name: '/CatalogManagement',
      component: () => import('../views/CatalogOverview.vue')
    },
    {
      path: '/myTest',
      name: '/myTest',
      component: () => import('../views/MyTest.vue')
    },
    {
      path: '/manageCatalog/:catalogId/:questionId',
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
    },
    {
      path: '/study/:courseId?',
      name: 'study',
      component: () => import('../views/StudyCourseView.vue')
    },
    {
      path: '/questionCatalogs',
      name: 'questionCatalogs',
      component: () => import('../views/CatalogOverview.vue')
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

  // //Check if ongoing session
  // if (to.name === 'home') {
  //   sessionService
  //     .checkOngoingSessions()
  //     .then((session) => {
  //       console.log('router check session -->', session.data)
  //       if (session.data.length > 0) {
  //         // route to catalog session with /catalogSession/:courseId?/:catalogId?
  //         next({
  //           name: 'catalogSession',
  //           params: { courseId: session.data[0].courseId, catalogId: session.data[0].catalogId }
  //         })
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('router check session error -->', error)
  //     })
  // } else {
  //   next()
  // }

  next()
})

export default router
