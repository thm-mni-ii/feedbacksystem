<template>
  <v-container fluid class="quiz-lab pa-6">
    <!-- ── Header ─────────────────────────────────────────────────── -->
    <div class="lab-header mb-8">
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <div>
          <p class="lab-eyebrow mb-1">Algorithmus-Testumgebung</p>
          <h1 class="lab-title">Quiz Engine</h1>
        </div>
        <div class="d-flex align-center gap-3">
          <v-chip
            v-if="store.session"
            :color="difficultyColor"
            variant="tonal"
            size="small"
            class="diff-chip"
          >
            <v-icon start size="12">mdi-gauge</v-icon>
            Difficulty {{ (store.currentDifficulty * 100).toFixed(0) }}%
          </v-chip>
          <v-chip v-if="store.session" color="surface-variant" variant="tonal" size="small">
            <v-icon start size="12">mdi-help-circle-outline</v-icon>
            {{ store.historyCount }} Fragen
          </v-chip>
          <v-btn
            v-if="!store.session"
            color="primary"
            variant="flat"
            size="large"
            rounded="lg"
            @click="store.startSession()"
          >
            <v-icon start>mdi-play</v-icon>
            Session starten
          </v-btn>
          <v-btn
            v-else
            color="error"
            variant="tonal"
            size="small"
            rounded="lg"
            @click="store.resetSession()"
          >
            <v-icon start>mdi-restart</v-icon>
            Reset
          </v-btn>
        </div>
      </div>
    </div>

    <!-- ── Start-Screen ────────────────────────────────────────────── -->
    <div v-if="!store.session" class="start-screen">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="start-card pa-8 text-center" rounded="xl" flat>
            <div class="start-icon mb-4">
              <v-icon size="64" color="primary">mdi-brain</v-icon>
            </div>
            <h2 class="mb-3">Adaptiver Wissenstest</h2>
            <p class="text-medium-emphasis mb-6">
              Der Algorithmus wählt Fragen individuell basierend auf deinem Lernfortschritt. Skills
              werden schrittweise freigeschaltet.
            </p>
            <div class="skill-preview d-flex flex-wrap gap-2 justify-center mb-6">
              <v-chip
                v-for="skill in store.skills"
                :key="skill.id"
                :color="skill.prerequisites.length === 0 ? 'primary' : 'surface-variant'"
                size="small"
                variant="tonal"
              >
                <v-icon v-if="skill.prerequisites.length > 0" start size="12"
                  >mdi-lock-outline</v-icon
                >
                {{ skill.label }}
              </v-chip>
            </div>
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              rounded="xl"
              @click="store.startSession()"
            >
              <v-icon start>mdi-play-circle</v-icon>
              Jetzt starten
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ── Haupt-Layout ────────────────────────────────────────────── -->
    <v-row v-else-if="!store.isComplete" class="main-layout">
      <!-- Linke Spalte: Skill-Graph-Visualisierung -->
      <v-col cols="12" md="4" lg="3">
        <div class="panel-label mb-3">
          <v-icon size="14" class="mr-1">mdi-graph</v-icon>
          Skill-Graph
        </div>

        <div class="skill-graph">
          <div
            v-for="skill in store.progress"
            :key="skill.skillId"
            class="skill-node-wrap"
            :class="{
              'is-active': isCurrentSkill(skill.skillId),
              'is-mastered': skill.mastered,
              'is-locked': !skill.unlocked
            }"
          >
            <!-- Connector-Line zu Prerequisites -->
            <div
              v-if="getPrerequisites(skill.skillId).length > 0"
              class="prereq-label text-caption text-medium-emphasis mb-1"
            >
              <v-icon size="10">mdi-arrow-up-thin</v-icon>
              benötigt: {{ getPrerequisites(skill.skillId).join(', ') }}
            </div>

            <v-card
              class="skill-node pa-3 mb-2"
              :class="{
                'skill-node--active': isCurrentSkill(skill.skillId),
                'skill-node--mastered': skill.mastered,
                'skill-node--locked': !skill.unlocked
              }"
              rounded="lg"
              flat
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="skill-node-label">{{ skill.label }}</span>
                <v-icon :color="skillIconColor(skill)" size="16">
                  {{ skillIcon(skill) }}
                </v-icon>
              </div>

              <!-- P(L) Balken -->
              <div class="pL-bar-bg">
                <div
                  class="pL-bar-fill"
                  :class="{ 'pL-bar-fill--mastered': skill.mastered }"
                  :style="{ width: `${skill.pLearned * 100}%` }"
                />
              </div>
              <div class="d-flex justify-space-between mt-1">
                <span class="text-caption text-medium-emphasis">P(L)</span>
                <span class="text-caption font-weight-bold">
                  {{ (skill.pLearned * 100).toFixed(0) }}%
                </span>
              </div>

              <!-- Fragen-Counter -->
              <div class="text-caption text-medium-emphasis mt-1">
                {{ store.session?.skills[skill.skillId]?.timesAsked ?? 0 }} Fragen gestellt
              </div>
            </v-card>
          </div>
        </div>
      </v-col>

      <!-- Mittlere Spalte: Aktuelle Frage -->
      <v-col cols="12" md="5" lg="6">
        <div class="panel-label mb-3">
          <v-icon size="14" class="mr-1">mdi-card-text-outline</v-icon>
          Aktuelle Frage
        </div>

        <transition name="question-transition" mode="out-in">
          <v-card
            v-if="store.currentQuestion"
            :key="store.currentQuestion.question.id"
            class="question-card pa-6"
            rounded="xl"
            flat
          >
            <!-- Skill-Badge -->
            <div class="d-flex align-center gap-2 mb-5">
              <v-chip color="primary" size="small" variant="tonal">
                <v-icon start size="12">mdi-tag-outline</v-icon>
                {{ store.currentQuestion.skill.label }}
              </v-chip>
              <v-chip
                :color="difficultyChipColor(store.currentQuestion.question.difficulty)"
                size="small"
                variant="tonal"
              >
                {{ difficultyLabel(store.currentQuestion.question.difficulty) }}
              </v-chip>
              <v-chip color="surface-variant" size="small" variant="tonal">
                <v-icon start size="12">mdi-gauge</v-icon>
                d={{ store.currentQuestion.question.difficulty.toFixed(1) }}
              </v-chip>
            </div>

            <!-- Frage-Text -->
            <div class="question-text mb-8">
              {{ store.currentQuestion.question.text }}
            </div>

            <!-- Debug-Info (BKT-Zustand vor Antwort) -->
            <v-expand-transition>
              <div v-if="showDebug" class="debug-box mb-6 pa-4">
                <p class="text-caption font-weight-bold mb-2 text-medium-emphasis">
                  BKT-Zustand vor Antwort
                </p>
                <div class="debug-grid">
                  <div class="debug-item">
                    <span class="debug-key">P(L) aktuell</span>
                    <span class="debug-val">{{ currentSkillPL }}</span>
                  </div>
                  <div class="debug-item">
                    <span class="debug-key">Student-Difficulty</span>
                    <span class="debug-val">{{ store.currentDifficulty.toFixed(2) }}</span>
                  </div>
                  <div class="debug-item">
                    <span class="debug-key">Fragen-Difficulty</span>
                    <span class="debug-val">{{ store.currentQuestion.question.difficulty }}</span>
                  </div>
                  <div class="debug-item">
                    <span class="debug-key">Cooldown-Queue</span>
                    <span class="debug-val"
                      >{{ store.session?.recentQuestionIds.length ?? 0 }} Fragen</span
                    >
                  </div>
                </div>
              </div>
            </v-expand-transition>

            <!-- Antwort-Buttons -->
            <div class="answer-buttons d-flex gap-3">
              <v-btn
                color="error"
                variant="tonal"
                size="large"
                rounded="lg"
                class="answer-btn flex-1-1"
                @click="answer(false)"
              >
                <v-icon start>mdi-close-circle-outline</v-icon>
                Falsch
              </v-btn>
              <v-btn
                color="success"
                variant="flat"
                size="large"
                rounded="lg"
                class="answer-btn flex-1-1"
                @click="answer(true)"
              >
                <v-icon start>mdi-check-circle-outline</v-icon>
                Richtig
              </v-btn>
            </div>

            <!-- Debug-Toggle -->
            <div class="text-center mt-4">
              <v-btn
                variant="text"
                size="x-small"
                color="medium-emphasis"
                @click="showDebug = !showDebug"
              >
                <v-icon start size="12">mdi-bug-outline</v-icon>
                {{ showDebug ? 'Debug ausblenden' : 'Debug anzeigen' }}
              </v-btn>
            </div>
          </v-card>
        </transition>

        <!-- Feedback nach Antwort (kurz eingeblendet) -->
        <transition name="fade">
          <v-alert
            v-if="showFeedback && store.lastResult"
            :color="lastAnswerCorrect ? 'success' : 'error'"
            variant="tonal"
            rounded="lg"
            class="mt-4 feedback-alert"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-bold mb-1">
                  {{ lastAnswerCorrect ? '✓ Richtig!' : '✗ Falsch' }}
                </div>
                <div class="text-body-2">
                  P(L) → {{ (store.lastResult.updatedPLearned * 100).toFixed(1) }}%
                  <span v-if="store.lastResult.masteryAchieved" class="ml-2">
                    🏆 Skill gemeistert!
                  </span>
                  <span v-if="store.lastResult.unlockedSkills.length > 0" class="ml-2">
                    🔓 Freigeschaltet:
                    {{ store.lastResult.unlockedSkills.map((s) => s.label).join(', ') }}
                  </span>
                </div>
              </div>
            </div>
          </v-alert>
        </transition>
      </v-col>

      <!-- Rechte Spalte: Fortschritt & Historie -->
      <v-col cols="12" md="3" lg="3">
        <div class="panel-label mb-3">
          <v-icon size="14" class="mr-1">mdi-chart-line</v-icon>
          Fortschritt
        </div>

        <!-- Gesamtfortschritt -->
        <v-card class="progress-card pa-4 mb-4" rounded="xl" flat>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-body-2 font-weight-bold">Gesamt</span>
            <span class="progress-pct">{{ (store.overallProgress * 100).toFixed(0) }}%</span>
          </div>
          <v-progress-linear
            :model-value="store.overallProgress * 100"
            color="primary"
            bg-color="surface-variant"
            rounded
            height="8"
          />
          <div class="d-flex justify-space-between mt-3 text-caption text-medium-emphasis">
            <span>{{ store.masteredSkills.length }} gemeistert</span>
            <span>{{ store.unlockedSkills.length }} aktiv</span>
            <span>{{ store.lockedSkills.length }} gesperrt</span>
          </div>
        </v-card>

        <!-- Difficulty-Verlauf (mini sparkline) -->
        <v-card class="pa-4 mb-4" rounded="xl" flat>
          <div class="panel-label mb-3">
            <v-icon size="14" class="mr-1">mdi-trending-up</v-icon>
            Difficulty-Verlauf
          </div>
          <div class="sparkline-container">
            <svg width="100%" height="48" viewBox="0 0 200 48">
              <polyline
                v-if="difficultyHistory.length > 1"
                :points="sparklinePoints"
                fill="none"
                stroke="rgb(var(--v-theme-primary))"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                v-for="(pt, i) in sparklineCircles"
                :key="i"
                :cx="pt.x"
                :cy="pt.y"
                r="2.5"
                :fill="
                  i === sparklineCircles.length - 1 ? 'rgb(var(--v-theme-primary))' : 'transparent'
                "
              />
            </svg>
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>Start</span>
              <span>Jetzt: {{ (store.currentDifficulty * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </v-card>

        <!-- Antwort-Historie -->
        <v-card class="pa-4" rounded="xl" flat>
          <div class="panel-label mb-3">
            <v-icon size="14" class="mr-1">mdi-history</v-icon>
            Letzte Antworten
          </div>
          <div class="history-list">
            <div
              v-for="record in recentHistory"
              :key="record.questionId"
              class="history-item d-flex align-center gap-2 mb-2"
            >
              <v-icon :color="record.isCorrect ? 'success' : 'error'" size="14">
                {{ record.isCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="text-caption font-weight-medium">
                  {{ skillLabel(record.skillId) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  d={{ record.difficulty.toFixed(1) }}
                </div>
              </div>
            </div>
            <p v-if="recentHistory.length === 0" class="text-caption text-medium-emphasis">
              Noch keine Antworten.
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Session abgeschlossen ───────────────────────────────────── -->
    <div v-else class="complete-screen">
      <v-row justify="center">
        <v-col cols="12" md="7">
          <v-card class="complete-card pa-8 text-center" rounded="xl" flat>
            <div class="complete-icon mb-4">🎓</div>
            <h2 class="mb-2">Alle Skills gemeistert!</h2>
            <p class="text-medium-emphasis mb-6">
              {{ store.historyCount }} Fragen · Durchschnittliche Difficulty: {{ avgDifficulty }}%
            </p>

            <!-- Finale Scores -->
            <div class="final-scores mb-6">
              <div
                v-for="skill in store.progress"
                :key="skill.skillId"
                class="final-score-row d-flex align-center gap-3 mb-3"
              >
                <v-icon color="success" size="16">mdi-check-circle</v-icon>
                <span class="flex-grow-1 text-left text-body-2">{{ skill.label }}</span>
                <v-progress-linear
                  :model-value="skill.pLearned * 100"
                  color="success"
                  bg-color="surface-variant"
                  rounded
                  height="6"
                  class="flex-grow-1"
                  style="max-width: 100px"
                />
                <span class="text-caption font-weight-bold">
                  {{ (skill.pLearned * 100).toFixed(0) }}%
                </span>
              </div>
            </div>

            <v-btn
              color="primary"
              variant="flat"
              size="large"
              rounded="xl"
              @click="store.resetSession()"
            >
              <v-icon start>mdi-restart</v-icon>
              Neue Session
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuizSessionStore } from '@/stores/quizSessionStore'

const store = useQuizSessionStore()

const showDebug = ref(false)
const showFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const difficultyHistory = ref<number[]>([])

// ── Antwort abgeben ──────────────────────────────────────────────────
function answer(isCorrect: boolean) {
  lastAnswerCorrect.value = isCorrect
  difficultyHistory.value.push(store.currentDifficulty)
  store.submitAnswer(isCorrect)
  showFeedback.value = true
  setTimeout(() => {
    showFeedback.value = false
  }, 2200)
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────
function isCurrentSkill(skillId: string) {
  return store.currentQuestion?.skill.id === skillId
}

function getPrerequisites(skillId: string): string[] {
  const skill = store.skills.find((s) => s.id === skillId)
  return (
    skill?.prerequisites.map((pid) => store.skills.find((s) => s.id === pid)?.label ?? pid) ?? []
  )
}

function skillLabel(skillId: string) {
  return store.skills.find((s) => s.id === skillId)?.label ?? skillId
}

function skillIcon(skill: { unlocked: boolean; mastered: boolean }) {
  if (skill.mastered) return 'mdi-check-circle'
  if (!skill.unlocked) return 'mdi-lock'
  return 'mdi-circle-outline'
}

function skillIconColor(skill: { unlocked: boolean; mastered: boolean }) {
  if (skill.mastered) return 'success'
  if (!skill.unlocked) return 'surface-variant'
  return 'primary'
}

function difficultyLabel(d: number) {
  if (d <= 0.3) return 'Leicht'
  if (d <= 0.6) return 'Mittel'
  return 'Schwer'
}

function difficultyChipColor(d: number) {
  if (d <= 0.3) return 'success'
  if (d <= 0.6) return 'warning'
  return 'error'
}

const difficultyColor = computed(() => {
  const d = store.currentDifficulty
  if (d <= 0.35) return 'success'
  if (d <= 0.65) return 'warning'
  return 'error'
})

const currentSkillPL = computed(() => {
  const skillId = store.currentQuestion?.skill.id
  if (!skillId || !store.session) return '–'
  return (store.session.skills[skillId]?.pLearned * 100).toFixed(1) + '%'
})

const recentHistory = computed(() => {
  return [...(store.session?.history ?? [])].reverse().slice(0, 8)
})

const avgDifficulty = computed(() => {
  const h = store.session?.history ?? []
  if (h.length === 0) return 0
  return ((h.reduce((s, r) => s + r.difficulty, 0) / h.length) * 100).toFixed(0)
})

// ── Sparkline ────────────────────────────────────────────────────────
const sparklineCircles = computed(() => {
  const data = difficultyHistory.value
  if (data.length < 2) return []
  const w = 200,
    h = 44
  return data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - v * h + 2
  }))
})

const sparklinePoints = computed(() => {
  return sparklineCircles.value.map((p) => `${p.x},${p.y}`).join(' ')
})

// Difficulty beim Start tracken
watch(
  () => store.session,
  (s) => {
    if (s) difficultyHistory.value = [s.currentDifficulty]
  }
)
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────── */
.quiz-lab {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

/* ── Header ─────────────────────────────────────────────────────── */
.lab-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.lab-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}

/* ── Panel Labels ────────────────────────────────────────────────── */
.panel-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface-variant));
  display: flex;
  align-items: center;
}

/* ── Skill Graph ─────────────────────────────────────────────────── */
.skill-node {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1.5px solid rgb(var(--v-theme-surface-variant));
  transition: all 0.25s ease;
  cursor: default;
}

.skill-node--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.05) !important;
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.12) !important;
}

.skill-node--mastered {
  border-color: rgb(var(--v-theme-success)) !important;
  opacity: 0.8;
}

.skill-node--locked {
  opacity: 0.45;
}

.skill-node-label {
  font-size: 13px;
  font-weight: 600;
}

.pL-bar-bg {
  height: 4px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 2px;
  overflow: hidden;
}

.pL-bar-fill {
  height: 100%;
  background: rgb(var(--v-theme-primary));
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.pL-bar-fill--mastered {
  background: rgb(var(--v-theme-success));
}

/* ── Question Card ───────────────────────────────────────────────── */
.question-card {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1.5px solid rgb(var(--v-theme-surface-variant));
}

.question-text {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.5;
  min-height: 80px;
}

.answer-btn {
  min-width: 0;
  letter-spacing: 0;
  font-weight: 600;
}

/* ── Debug Box ───────────────────────────────────────────────────── */
.debug-box {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  border: 1px dashed rgb(var(--v-theme-outline));
  font-family: monospace;
}

.debug-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.debug-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.debug-key {
  font-size: 10px;
  color: black;
}

.debug-val {
  font-size: 12px;
  font-weight: 700;
  color: black;
}

/* ── Progress ────────────────────────────────────────────────────── */
.progress-card {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1.5px solid rgb(var(--v-theme-surface-variant));
}

.progress-pct {
  font-size: 1.5rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

/* ── Sparkline ───────────────────────────────────────────────────── */
.sparkline-container svg {
  display: block;
}

/* ── History ─────────────────────────────────────────────────────── */
.history-list {
  max-height: 220px;
  overflow-y: auto;
}

/* ── Complete Screen ─────────────────────────────────────────────── */
.complete-icon {
  font-size: 4rem;
}

.complete-card {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1.5px solid rgb(var(--v-theme-surface-variant));
}

/* ── Start Card ──────────────────────────────────────────────────── */
.start-card {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1.5px solid rgb(var(--v-theme-surface-variant));
}

/* ── Transitions ─────────────────────────────────────────────────── */
.question-transition-enter-active,
.question-transition-leave-active {
  transition: all 0.25s ease;
}

.question-transition-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.question-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Feedback Alert ──────────────────────────────────────────────── */
.feedback-alert {
  position: sticky;
  bottom: 16px;
}
</style>
