import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      // Globaler, kursunabhängiger Fragenpool: Kompetenzen und Fragen werden
      // hier angelegt und später einzelnen Kursen zugeordnet.
      path: '/pool',
      name: 'questionPool',
      component: () => import('../views/QuestionOverviewView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      // Dozenten-Sandbox zum Simulieren von Algorithmus + Fragenpool, bevor
      // eine Konfiguration für Studenten live geschaltet wird.
      path: '/lab',
      name: 'AlgorithmLab',
      component: () => import('../views/AlgorithmLabView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      // Kurs-Workspace: gemeinsamer Rahmen (Kopfzeile + kursbezogene
      // Unternavigation) für alle Ansichten, die zu genau einem Kurs gehören.
      path: '/courses/:courseId',
      component: () => import('../views/CourseWorkspaceView.vue'),
      children: [
        {
          path: '',
          name: 'studyCourse',
          component: () => import('../views/StudyCourseView.vue')
        },
        {
          path: 'competencies',
          name: 'courseCompetencies',
          component: () => import('../views/CompetencyGraphView.vue')
        },
        {
          path: 'questions',
          name: 'courseQuestions',
          component: () => import('../views/CourseQuestionsView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'settings',
          name: 'courseSettings',
          component: () => import('../views/CourseSettingsView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'session/:sessionId',
          name: 'studySession',
          component: () => import('../views/StudySessionView.vue')
        }
      ]
    }
    // {
    //   path: "/:pathMatch(.*)*",
    //   name: "not-found",
    //   component: () => import("../views/NotFoundView.vue"),
    // },
  ]
})

// Dozenten-Werkzeuge (Fragenpool, Algorithm Lab, Kurs-Fragen/-Einstellungen)
// sind nur für ADMIN in der Navigation sichtbar - zusätzlich hier als Guard
// absichern, damit sie nicht per Direktaufruf der URL umgangen werden können.
router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true

  const authStore = useAuthStore()
  const isAdmin = authStore.decodedToken?.globalRole === 'ADMIN'
  if (isAdmin) return true

  return { name: 'home', query: { forbidden: '1' } }
})

export default router
