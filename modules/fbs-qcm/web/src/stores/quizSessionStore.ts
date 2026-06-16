// stores/quizSession.store.ts
// Pinia Store – verwaltet die laufende Quiz-Session reaktiv

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AdaptiveQuizAlgorithm, createSession } from '@/composables/algorithm'
import type { Skill, Question, SessionState, NextQuestion, AnswerResult } from '@/data/types'

// ── Dummy-Daten (später durch API ersetzen) ────────────────────────────
export const DEMO_SKILLS: Skill[] = [
  { id: 'grundlagen', label: 'Grundlagen', prerequisites: [], unlocks: ['variablen'] },
  {
    id: 'variablen',
    label: 'Variablen & Typen',
    prerequisites: ['grundlagen'],
    unlocks: ['funktionen', 'schleifen']
  },
  { id: 'funktionen', label: 'Funktionen', prerequisites: ['variablen'], unlocks: ['rekursion'] },
  { id: 'schleifen', label: 'Schleifen', prerequisites: ['variablen'], unlocks: ['rekursion'] },
  { id: 'rekursion', label: 'Rekursion', prerequisites: ['funktionen', 'schleifen'], unlocks: [] }
]

export const DEMO_QUESTIONS: Question[] = [
  { id: 'g1', skillId: 'grundlagen', text: 'Was ist ein Algorithmus?', difficulty: 0.1 },
  {
    id: 'g2',
    skillId: 'grundlagen',
    text: 'Was unterscheidet Compiler von Interpreter?',
    difficulty: 0.4
  },
  {
    id: 'g3',
    skillId: 'grundlagen',
    text: 'Erkläre das Konzept der Abstraktion.',
    difficulty: 0.7
  },
  {
    id: 'v1',
    skillId: 'variablen',
    text: 'Was ist der Unterschied zwischen let und const?',
    difficulty: 0.2
  },
  { id: 'v2', skillId: 'variablen', text: 'Was ist Type Inference?', difficulty: 0.5 },
  { id: 'v3', skillId: 'variablen', text: 'Erkläre Scope und Hoisting.', difficulty: 0.8 },
  { id: 'f1', skillId: 'funktionen', text: 'Was ist eine Pure Function?', difficulty: 0.3 },
  {
    id: 'f2',
    skillId: 'funktionen',
    text: 'Call by Value vs. Call by Reference?',
    difficulty: 0.6
  },
  { id: 'f3', skillId: 'funktionen', text: 'Was ist eine Higher-Order Function?', difficulty: 0.8 },
  {
    id: 's1',
    skillId: 'schleifen',
    text: 'Was ist der Unterschied zwischen for und while?',
    difficulty: 0.2
  },
  {
    id: 's2',
    skillId: 'schleifen',
    text: 'Was macht forEach in funktionaler Programmierung?',
    difficulty: 0.5
  },
  {
    id: 's3',
    skillId: 'schleifen',
    text: 'Erkläre den Unterschied zwischen break und continue.',
    difficulty: 0.4
  },
  { id: 'r1', skillId: 'rekursion', text: 'Was ist ein Base Case?', difficulty: 0.4 },
  { id: 'r2', skillId: 'rekursion', text: 'Was ist Tail Recursion?', difficulty: 0.8 },
  {
    id: 'r3',
    skillId: 'rekursion',
    text: 'Wann ist Rekursion effizienter als Iteration?',
    difficulty: 0.9
  }
]

// ── Store ──────────────────────────────────────────────────────────────
export const useQuizSessionStore = defineStore('quizSession', () => {
  const algo = new AdaptiveQuizAlgorithm({
    masteryThreshold: 0.75,
    minAnswersForMastery: 3,
    cooldownCount: 4,
    noiseFactor: 0.12
  })

  // State
  const skills = ref<Skill[]>(DEMO_SKILLS)
  const questions = ref<Question[]>(DEMO_QUESTIONS)
  const session = ref<SessionState | null>(null)
  const currentQuestion = ref<NextQuestion | null>(null)
  const lastResult = ref<AnswerResult | null>(null)
  const isComplete = ref(false)

  // Computed
  const progress = computed(() => {
    if (!session.value) return []
    return algo.getProgress(skills.value, session.value)
  })

  const overallProgress = computed(() => {
    if (!session.value) return 0
    return algo.getOverallProgress(skills.value, session.value)
  })

  const currentDifficulty = computed(() => session.value?.currentDifficulty ?? 0)

  const historyCount = computed(() => session.value?.history.length ?? 0)

  const unlockedSkills = computed(() => progress.value.filter((p) => p.unlocked && !p.mastered))

  const masteredSkills = computed(() => progress.value.filter((p) => p.mastered))

  const lockedSkills = computed(() => progress.value.filter((p) => !p.unlocked))

  // Actions
  function startSession() {
    session.value = createSession('demo-student', skills.value)
    isComplete.value = false
    lastResult.value = null
    advance()
  }

  function advance() {
    if (!session.value) return
    const next = algo.nextQuestion(skills.value, questions.value, session.value)
    currentQuestion.value = next
  }

  function submitAnswer(isCorrect: boolean) {
    if (!session.value || !currentQuestion.value) return

    const { updatedState, result } = algo.submitAnswer(
      currentQuestion.value.question,
      isCorrect,
      skills.value,
      session.value
    )

    session.value = updatedState
    lastResult.value = result

    if (result.sessionComplete) {
      isComplete.value = true
      currentQuestion.value = null
    } else {
      advance()
    }
  }

  function resetSession() {
    session.value = null
    currentQuestion.value = null
    lastResult.value = null
    isComplete.value = false
  }

  return {
    // state
    skills,
    questions,
    session,
    currentQuestion,
    lastResult,
    isComplete,
    // computed
    progress,
    overallProgress,
    currentDifficulty,
    historyCount,
    unlockedSkills,
    masteredSkills,
    lockedSkills,
    // actions
    startSession,
    submitAnswer,
    resetSession
  }
})
