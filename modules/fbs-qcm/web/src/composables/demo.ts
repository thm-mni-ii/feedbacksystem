// ============================================================
// demo.ts
// Beispiel-Nutzung mit Dummy-Daten
// Zeigt den kompletten Flow einer Quiz-Session
// ============================================================

import type { Skill, Question } from './types'
import { createSession } from './algorithm'
import { AdaptiveQuizAlgorithm } from './algorithm'

// ------------------------------------------------------------
// Dummy-Daten: Skill-Graph (KST-Struktur)
// ------------------------------------------------------------
//
//  Grundlagen ──► Variablen ──► Funktionen
//                           └──► Schleifen ──► Rekursion
//
// Grundlagen hat keine Prerequisites → sofort unlocked
// Variablen braucht: Grundlagen
// Funktionen braucht: Variablen
// Schleifen braucht: Variablen
// Rekursion braucht: Funktionen + Schleifen

const SKILLS: Skill[] = [
  {
    id: 'grundlagen',
    label: 'Grundlagen',
    prerequisites: [],
    unlocks: ['variablen'],
  },
  {
    id: 'variablen',
    label: 'Variablen & Datentypen',
    prerequisites: ['grundlagen'],
    unlocks: ['funktionen', 'schleifen'],
  },
  {
    id: 'funktionen',
    label: 'Funktionen',
    prerequisites: ['variablen'],
    unlocks: ['rekursion'],
  },
  {
    id: 'schleifen',
    label: 'Schleifen & Iteration',
    prerequisites: ['variablen'],
    unlocks: ['rekursion'],
  },
  {
    id: 'rekursion',
    label: 'Rekursion',
    prerequisites: ['funktionen', 'schleifen'],
    unlocks: [],
  },
]

// ------------------------------------------------------------
// Dummy-Daten: Fragenpool
// ------------------------------------------------------------

const QUESTIONS: Question[] = [
  // Grundlagen (3 Fragen, verschiedene Schwierigkeiten)
  { id: 'g1', skillId: 'grundlagen', text: 'Was ist ein Algorithmus?', difficulty: 0.1 },
  { id: 'g2', skillId: 'grundlagen', text: 'Was ist der Unterschied zwischen Compiler und Interpreter?', difficulty: 0.4 },
  { id: 'g3', skillId: 'grundlagen', text: 'Erkläre das Konzept der Abstraktion.', difficulty: 0.7 },

  // Variablen
  { id: 'v1', skillId: 'variablen', text: 'Was ist der Unterschied zwischen let und const?', difficulty: 0.2 },
  { id: 'v2', skillId: 'variablen', text: 'Was ist Type Inference?', difficulty: 0.5 },
  { id: 'v3', skillId: 'variablen', text: 'Erkläre Scope und Hoisting.', difficulty: 0.8 },

  // Funktionen
  { id: 'f1', skillId: 'funktionen', text: 'Was ist eine Pure Function?', difficulty: 0.3 },
  { id: 'f2', skillId: 'funktionen', text: 'Was ist der Unterschied zwischen Call by Value und Call by Reference?', difficulty: 0.6 },
  { id: 'f3', skillId: 'funktionen', text: 'Was ist eine Higher-Order Function?', difficulty: 0.8 },

  // Schleifen
  { id: 's1', skillId: 'schleifen', text: 'Was ist der Unterschied zwischen for und while?', difficulty: 0.2 },
  { id: 's2', skillId: 'schleifen', text: 'Was ist eine forEach-Schleife in funktionaler Programmierung?', difficulty: 0.5 },
  { id: 's3', skillId: 'schleifen', text: 'Erkläre den Unterschied zwischen break und continue.', difficulty: 0.4 },

  // Rekursion
  { id: 'r1', skillId: 'rekursion', text: 'Was ist ein Base Case?', difficulty: 0.4 },
  { id: 'r2', skillId: 'rekursion', text: 'Was ist Tail Recursion?', difficulty: 0.8 },
  { id: 'r3', skillId: 'rekursion', text: 'Wann ist Rekursion effizienter als Iteration?', difficulty: 0.9 },
]

// ------------------------------------------------------------
// Beispiel-Session
// ------------------------------------------------------------

async function runDemo() {
  const algo = new AdaptiveQuizAlgorithm({
    masteryThreshold: 0.75,
    minAnswersForMastery: 2, // Für Demo: weniger Antworten nötig
    cooldownCount: 3,
    noiseFactor: 0.1,
  })

  // Session starten
  let state = createSession('student-42', SKILLS)

  console.log('=== Session gestartet ===')
  console.log('Freigeschaltete Skills:', Object.entries(state.skills)
    .filter(([, s]) => s.unlocked)
    .map(([id]) => id))

  // 10 Runden simulieren
  for (let round = 1; round <= 10; round++) {
    const next = algo.nextQuestion(SKILLS, QUESTIONS, state)

    if (!next) {
      console.log('\n✅ Session abgeschlossen – alle Skills gemeistert!')
      break
    }

    // Antwort simulieren (zufällig, aber mit Tendenz zu richtig)
    const isCorrect = Math.random() > 0.35

    console.log(`\n--- Runde ${round} ---`)
    console.log(`Skill:    ${next.skill.label}`)
    console.log(`Frage:    ${next.question.text}`)
    console.log(`Difficulty: ${next.question.difficulty}`)
    console.log(`Antwort:  ${isCorrect ? '✓ richtig' : '✗ falsch'}`)

    const { updatedState, result } = algo.submitAnswer(
      next.question,
      isCorrect,
      SKILLS,
      state,
    )
    state = updatedState

    console.log(`P(L) nach Update: ${result.updatedPLearned.toFixed(3)}`)

    if (result.masteryAchieved) {
      console.log(`🏆 Skill gemeistert: ${next.skill.label}`)
    }
    if (result.unlockedSkills.length > 0) {
      console.log(`🔓 Neue Skills freigeschaltet: ${result.unlockedSkills.map(s => s.label).join(', ')}`)
    }
    if (result.sessionComplete) {
      console.log('\n✅ Alle Skills gemeistert!')
      break
    }
  }

  console.log('\n=== Finaler Fortschritt ===')
  const progress = algo.getProgress(SKILLS, state)
  for (const p of progress) {
    const bar = '█'.repeat(Math.round(p.pLearned * 10)) + '░'.repeat(10 - Math.round(p.pLearned * 10))
    console.log(`${p.label.padEnd(25)} [${bar}] P(L)=${p.pLearned.toFixed(2)} ${p.mastered ? '✓' : ''} ${!p.unlocked ? '🔒' : ''}`)
  }

  console.log(`\nGesamtfortschritt: ${(algo.getOverallProgress(SKILLS, state) * 100).toFixed(1)}%`)
  console.log(`Aktuelle Difficulty: ${state.currentDifficulty.toFixed(2)}`)
  console.log(`Gestellte Fragen: ${state.history.length}`)
}

runDemo()
