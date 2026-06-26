<template>
  <div class="skill-results-view">
    <!-- Header -->
    <section class="results-header">
      <v-container class="text-center py-6">
        <v-avatar
          size="72"
          class="mb-3"
          :style="resultsAvatarStyle"
        >
          <v-icon size="40" color="white">mdi-trophy</v-icon>
        </v-avatar>
        <h1 class="text-h2 font-weight-bold mb-2">Quiz abgeschlossen! 🎉</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Hier ist dein detaillierter Lernfortschritt
        </p>
      </v-container>
    </section>

    <v-container fluid class="pa-4">
      <!-- 1. Summary Card -->
      <v-row class="mb-4">
        <v-col cols="12">
          <SkillsSummaryCard :results="results" />
        </v-col>
      </v-row>

      <!-- 2. View Selector Tabs -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="elevation-1">
            <v-tabs v-model="activeView" grow>
              <v-tab value="wheel">🎡 Mastery-Rad</v-tab>
              <v-tab value="graph">🔗 Lernpfad</v-tab>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>

      <!-- 3. Main Content: Wheel View -->
      <template v-if="activeView === 'wheel'">
        <v-row class="mb-6">
          <v-col cols="12" lg="8">
            <v-card elevation="1" class="pa-6" rounded="lg">
              <SkillMasteryWheel :skills="results.skills" @select="selectedSkill = $event" />
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <SkillPerformanceTable
              :skills="results.skills"
              :selected="selectedSkill?.skillId"
              @select="selectedSkill = $event"
            />
          </v-col>
        </v-row>
      </template>

      <!-- 4. Main Content: Graph View -->
      <template v-if="activeView === 'graph'">
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card elevation="1" class="pa-6" rounded="lg">
              <SkillDependencyGraph :skills="results.skills" @select="selectedSkill = $event" />
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- 5. Detail Panel -->
      <v-row v-if="selectedSkill" class="mb-6">
        <v-col cols="12">
          <SkillDetailPanel
            :skill="selectedSkill"
            :answers="getSkillAnswers(selectedSkill.skillId)"
          />
        </v-col>
      </v-row>

      <!-- 6. Next Steps / Actions -->
      <v-row class="mt-6 mb-4">
        <v-col cols="12">
          <NextStepsCard :skills="results.skills" @retry="retry" @export="exportResults" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuizSessionStore } from '@/stores/quizSessionStore'
import type { SessionResults, SkillVisualization, AnswerVisualization } from '@/composables/types'
import SkillsSummaryCard from '@/components/results/SkillsSummaryCard.vue'
import SkillMasteryWheel from '@/components/results/SkillMasteryWheel.vue'
import SkillPerformanceTable from '@/components/results/SkillPerformanceTable.vue'
import SkillDependencyGraph from '@/components/results/SkillDependencyGraph.vue'
import SkillDetailPanel from '@/components/results/SkillDetailPanel.vue'
import NextStepsCard from '@/components/results/NextStepsCard.vue'
import { appPalette } from '@/plugins/vuetify'

// ─── State ────────────────────────────────────────────────────────
const quizStore = useQuizSessionStore()
const activeView = ref<'wheel' | 'graph'>('wheel')
const selectedSkill = ref<SkillVisualization | null>(null)

// ─── Computed ─────────────────────────────────────────────────────
const results = computed(() => buildSessionResults())
const resultsAvatarStyle = computed(() => ({
  background: `linear-gradient(135deg, ${appPalette.headerStart}, ${appPalette.headerEnd})`
}))

// ─── Lifecycle ────────────────────────────────────────────────────
onMounted(() => {
  // Optional: scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// ─── Methods ──────────────────────────────────────────────────────
/**
 * Konvertiert den Session-State in SessionResults für die Visualisierung
 */
function buildSessionResults(): SessionResults {
  if (!quizStore.session) {
    throw new Error('No active session')
  }

  const session = quizStore.session
  const correctAnswers = session.history.filter((h) => h.isCorrect).length
  const incorrectAnswers = session.history.length - correctAnswers

  // Konvertiere SkillState zu SkillVisualization
  const skills: SkillVisualization[] = quizStore.skills.map((skill) => {
    const skillState = session.skills[skill.id]
    const skillAnswers = session.history.filter((h) => h.skillId === skill.id)
    const successCount = skillAnswers.filter((h) => h.isCorrect).length

    // Berechne Statistiken
    const avgDifficulty =
      skillAnswers.length > 0
        ? skillAnswers.reduce((sum, h) => sum + h.difficulty, 0) / skillAnswers.length
        : 0

    const totalTime = skillAnswers.reduce((sum, h) => {
      // Wir speichern keine absoluten Zeiten, daher schätzen wir
      return sum + 50 // ms, placeholder
    }, 0)
    const avgTimePerQuestion = skillAnswers.length > 0 ? totalTime / skillAnswers.length : 0

    return {
      skillId: skill.id,
      label: skill.label,
      pLearned: skillState.pLearned,
      mastered: skillState.mastered,
      unlocked: skillState.unlocked,
      timesAsked: skillState.timesAsked,
      successRate: skillAnswers.length > 0 ? successCount / skillAnswers.length : 0,
      prerequisites: skill.prerequisites,
      unlocks: skill.unlocks,
      avgDifficulty,
      avgTimePerQuestion,
      status: skillState.mastered ? 'mastered' : skillState.unlocked ? 'progress' : 'locked'
    }
  })

  return {
    studentId: session.studentId,
    sessionId: `session-${session.startedAt}`,
    startedAt: session.startedAt,
    completedAt: Date.now(),
    totalTimeSeconds: Math.floor((Date.now() - session.startedAt) / 1000),
    skills,
    overallProgress: quizStore.overallProgress,
    questionsAnswered: session.history.length,
    correctAnswers,
    incorrectAnswers
  }
}

/**
 * Gibt alle Antworten für einen bestimmten Skill zurück
 */
function getSkillAnswers(skillId: string): AnswerVisualization[] {
  if (!quizStore.session) return []

  return quizStore.session.history
    .filter((h) => h.skillId === skillId)
    .map((record) => {
      const question = quizStore.questions.find((q) => q.id === record.questionId)
      const skill = quizStore.skills.find((s) => s.id === skillId)

      return {
        ...record,
        questionText: question?.text ?? 'Unknown',
        skillLabel: skill?.label ?? 'Unknown',
        timeSeconds: 0, // placeholder
        wasCorrect: record.isCorrect
      }
    })
}

/**
 * Retry: Neue Session starten
 */
function retry() {
  quizStore.resetSession()
  quizStore.startSession()
  // Router push to quiz view
}

/**
 * Export: PDF/CSV exportieren
 */
function exportResults() {
  // TODO: Implementieren
  console.log('Exporting results...', results.value)
}
</script>

<style scoped>
.skill-results-view {
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-app-surface-muted)),
    rgb(var(--v-theme-surface))
  );
  min-height: 100vh;
}

.results-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-app-header-start)),
    rgb(var(--v-theme-app-header-end))
  );
  color: rgb(var(--v-theme-white));
  box-shadow: 0 4px 12px rgba(var(--v-theme-black), 0.12);
}

:deep(.v-tabs) {
  border-bottom: 1px solid rgba(var(--v-theme-app-border-strong), 0.5);
}
</style>
