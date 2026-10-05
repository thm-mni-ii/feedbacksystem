<template>
  <section>
    <v-alert type="warning" variant="tonal" class="mb-6">
      Simulation mit künstlichem Lernenden – verändert keine gespeicherten Lernverläufe.
      Simulierte Antworten werden binär erzeugt; es wird keine konkrete Auswahl oder Texteingabe
      nachgebildet.
    </v-alert>

    <v-card variant="outlined" class="pa-4 pa-md-6 mb-6">
      <div class="d-flex align-center ga-3 mb-4">
        <v-icon color="primary" icon="mdi-tune-variant" />
        <div>
          <h2 class="text-h6">Simulation vorbereiten</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Lege fest, mit wie viel Vorwissen der simulierte Lernende startet.
          </p>
        </div>
      </div>

      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="profile"
            :items="profileOptions"
            item-title="title"
            item-value="value"
            label="Vorwissen des simulierten Lernenden"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <div class="d-flex align-center flex-wrap ga-3">
        <v-btn
          color="primary"
          prepend-icon="mdi-play"
          :loading="isLoading"
          :disabled="isRunning"
          @click="startSimulation"
        >
          {{ simulation ? 'Neu starten' : 'Simulation starten' }}
        </v-btn>
        <span v-if="simulation" class="text-body-2 text-medium-emphasis">
          {{ eligibleQuestionCount }} Aufgaben im Simulationspool
        </span>
      </div>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
        {{ errorMessage }}
      </v-alert>
    </v-card>

    <template v-if="simulation">
      <v-card variant="outlined" class="pa-4 mb-6">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-2">
          <div>
            <div class="text-overline text-medium-emphasis">Session-Fortschritt</div>
            <div class="text-subtitle-1 font-weight-bold">
              Aufgabe {{ simulation.session.history.length }} /
              {{ simulation.session.algorithm.configuration.session.maxQuestionsPerSession }}
            </div>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip size="small" color="primary" variant="tonal">
              {{ profileLabel }}
            </v-chip>
          </div>
        </div>
        <v-progress-linear
          :model-value="progress"
          color="primary"
          height="8"
          rounded
          aria-label="Simulationsfortschritt"
        />
      </v-card>

      <v-row align="stretch">
        <v-col cols="12" lg="7">
          <v-card v-if="simulation.currentQuestion && !simulation.endReason" variant="outlined">
            <v-card-text class="pa-4 pa-md-6">
              <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
                <v-chip color="primary" variant="tonal">
                  {{ simulation.currentQuestion.targetCompetency.name }}
                </v-chip>
                <span class="text-body-2 text-medium-emphasis">
                  Schwierigkeit {{ formatPercent(simulation.currentQuestion.question.difficulty) }}
                </span>
              </div>
              <h2 class="text-h6 mb-4">
                {{
                  simulation.currentQuestion.question.title ||
                  simulation.currentQuestion.question.text
                }}
              </h2>
              <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
                <div class="font-weight-medium">Warum diese Aufgabe?</div>
                <div class="text-body-2 mt-1">
                  {{ upcomingExplanation }}
                </div>
              </v-alert>

              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-skip-next"
                  :disabled="isRunning || isLoading"
                  @click="simulateNextAnswer"
                >
                  Antwort simulieren
                </v-btn>
                <v-btn
                  v-if="!isRunning"
                  variant="outlined"
                  prepend-icon="mdi-play"
                  :disabled="isLoading"
                  @click="startAutoplay"
                >
                  Automatisch abspielen
                </v-btn>
                <v-btn
                  v-else
                  variant="outlined"
                  prepend-icon="mdi-pause"
                  @click="stopAutoplay"
                >
                  Pause
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <v-alert v-else type="success" variant="tonal">
            <div class="text-h6 mb-1">Simulation beendet</div>
            {{ endReasonText }}
          </v-alert>

          <v-card v-if="lastStep" variant="outlined" class="mt-4">
            <v-card-title class="text-subtitle-1">
              Auswirkung von Aufgabe {{ lastStep.number }}
            </v-card-title>
            <v-card-text>
              <v-alert
                :type="lastStep.answeredCorrectly ? 'success' : 'warning'"
                variant="tonal"
                density="comfortable"
                class="mb-4"
              >
                Der simulierte Lernende antwortet
                <strong>{{ lastStep.answeredCorrectly ? 'richtig' : 'falsch' }}</strong>.
                <span class="d-block text-body-2 mt-1">
                  Antwortwahrscheinlichkeit bei simuliertem Zustand:
                  {{ formatPercent(lastStep.responseProbability) }}.
                  Vorhersage des Algorithmus vor der Antwort:
                  {{ formatPercent(lastStep.predictionBefore) }}.
                </span>
              </v-alert>

              <div class="text-subtitle-2 mb-2">Änderung der Algorithmus-Schätzung</div>
              <div class="d-flex align-center ga-3 mb-2">
                <span class="text-body-2 text-no-wrap">
                  {{ formatPercent(lastStep.estimatedMasteryBefore) }}
                </span>
                <v-icon icon="mdi-arrow-right" size="small" />
                <span class="text-body-1 font-weight-bold">
                  {{ formatPercent(lastStep.estimatedMasteryAfter) }}
                </span>
              </div>
              <v-progress-linear
                :model-value="lastStep.estimatedMasteryAfter * 100"
                color="primary"
                height="8"
                rounded
                class="mb-4"
              />

              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>Auswahl nachvollziehen</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2">
                      <strong>Zielkompetenz:</strong>
                      {{ lastStep.competencySelectionExplanation }}
                    </p>
                    <p class="text-body-2 mb-0">
                      <strong>Aufgabe:</strong>
                      {{ lastStep.questionSelectionExplanation }}
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-title>Simulierter Wissenszustand</v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2 mb-0">
                      Für {{ lastStep.targetCompetency.name }} war der simulierte Lernende
                      {{ lastStep.knowsBefore ? 'vorher im Zustand „beherrscht“' : 'vorher im Zustand „noch nicht beherrscht“' }}.
                      {{ lastStep.knowsAfter
                        ? 'Nach dieser Aufgabe befindet er sich im Zustand „beherrscht“.'
                        : 'Auch nach dieser Aufgabe ist die Kompetenz im Simulationsmodell noch nicht beherrscht.' }}
                      Dieser verborgene Simulationszustand ist nur ein Orakel zum Erklären des
                      künstlichen Lernenden und steht bei echten Lernenden nicht zur Verfügung.
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card variant="outlined" class="profile-card">
            <v-card-title class="text-subtitle-1">Kompetenzprofil in Echtzeit</v-card-title>
            <v-card-text class="pt-0">
              <p class="text-caption text-medium-emphasis">
                Balken = Schätzung des Algorithmus. Der simulierte Zustand ist getrennt davon
                ausgewiesen und keine reale Messung.
              </p>
              <div class="competency-list">
                <div
                  v-for="competency in competencyProfile"
                  :key="competency.id"
                  class="competency-item py-3"
                >
                  <div class="d-flex align-center justify-space-between ga-2 mb-1">
                    <span class="text-body-2 font-weight-medium">{{ competency.name }}</span>
                    <span class="text-body-2 text-no-wrap">
                      {{ formatPercent(competency.estimatedMastery) }}
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="competency.estimatedMastery * 100"
                    color="primary"
                    height="6"
                    rounded
                  />
                  <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
                    <span>{{ competency.timesAssessed }} Beobachtungen</span>
                    <span>
                      Simuliert:
                      {{ competency.knowsCompetency ? 'beherrscht' : 'noch nicht beherrscht' }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-if="steps.length" variant="outlined" class="mt-6">
        <v-card-title class="text-subtitle-1">Bisheriger Verlauf</v-card-title>
        <v-table density="compact">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Kompetenz</th>
              <th>Antwort</th>
              <th>Vorhersage</th>
              <th>Schätzung danach</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="step in steps" :key="step.number">
              <td>{{ step.number }}</td>
              <td>{{ step.targetCompetency.name }}</td>
              <td>{{ step.answeredCorrectly ? 'Richtig' : 'Falsch' }}</td>
              <td>{{ formatPercent(step.predictionBefore) }}</td>
              <td>{{ formatPercent(step.estimatedMasteryAfter) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref, shallowRef } from 'vue'
import {
  advanceAlgorithmSimulation,
  createAlgorithmSimulation,
  SIMULATED_LEARNER_PROFILES,
  type AlgorithmSimulation,
  type SimulatedLearnerProfile,
  type SimulationStep
} from '@/composables/algorithmSimulation'
import studyContentService from '@/services/studyContent.service'

const profile = ref<SimulatedLearnerProfile>('medium')
const simulationSeed = 42
const isLoading = ref(false)
const isRunning = ref(false)
const errorMessage = ref<string | null>(null)
const simulation = shallowRef<AlgorithmSimulation | null>(null)
const steps = ref<SimulationStep[]>([])
let autoplayTimer: ReturnType<typeof setInterval> | undefined

const profileOptions = Object.entries(SIMULATED_LEARNER_PROFILES).map(([value, item]) => ({
  title: `${item.label} · ${Math.round(item.initialKnowledgeProbability * 100)} %`,
  value
}))
const profileLabel = computed(
  () => SIMULATED_LEARNER_PROFILES[simulation.value?.profile ?? profile.value].label
)
const progress = computed(() => {
  const current = simulation.value
  if (!current) return 0
  return Math.min(
    100,
    (current.session.history.length /
      current.session.algorithm.configuration.session.maxQuestionsPerSession) *
      100
  )
})
const eligibleQuestionCount = computed(() => simulation.value?.eligibleQuestionCount ?? 0)
const lastStep = computed(() => steps.value[steps.value.length - 1] ?? null)
const endReasonText = computed(() => {
  const reason = simulation.value?.endReason
  if (reason === 'evidence') {
    return 'Die verfügbaren Kompetenzen erfüllen die eingestellten Kriterien für ausreichende Evidenz.'
  }
  if (reason === 'task-limit') return 'Das Aufgabenlimit dieser Session wurde erreicht.'
  return 'Es steht keine weitere geeignete Aufgabe zur Verfügung.'
})
const upcomingExplanation = computed(() => {
  const current = simulation.value
  const next = current?.currentQuestion
  if (!current || !next) return ''
  const model = current.session.algorithm.configuration.model
  const mastery = current.session.competencies[next.targetCompetency.id]?.score ?? model.initialMastery
  const assessed = current.session.competencies[next.targetCompetency.id]?.timesAssessed ?? 0
  const difficultyDifference = Math.abs(next.question.difficulty - mastery)
  const difficultyMessage =
    difficultyDifference <= current.session.algorithm.configuration.selection.difficultyWindow
      ? 'Die Schwierigkeit liegt im bevorzugten Bereich.'
      : 'Es gibt keine verfügbare Aufgabe im bevorzugten Schwierigkeitsbereich; der Algorithmus nimmt die nächstliegende.'
  const focusMessage =
    current.session.currentCompetencyId === next.targetCompetency.id &&
    current.session.questionsInCurrentCompetency <
      current.session.algorithm.configuration.selection.stickinessQuestions
      ? 'Die Kompetenz bleibt innerhalb der Fokusphase aktiv.'
    : `Die Standardstrategie berücksichtigt Lernstand und bisherige Beobachtungen; für diese Kompetenz liegen ${assessed} Beobachtungen vor.`
  return `${focusMessage} ${difficultyMessage} Kürzlich gestellte Aufgaben und die Q-Matrix-Utility beeinflussen die Aufgabenwahl ebenfalls.`
})
const competencyProfile = computed(() => {
  const current = simulation.value
  if (!current) return []
  return current.competencies
    .map((competency) => ({
      id: competency.id,
      name: competency.name,
      estimatedMastery:
        current.session.competencies[competency.id]?.score ??
        current.session.algorithm.configuration.model.initialMastery,
      timesAssessed: current.session.competencies[competency.id]?.timesAssessed ?? 0,
      knowsCompetency: current.knowledge.get(competency.id)?.knowsCompetency ?? false
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
})

onScopeDispose(stopAutoplay)

async function startSimulation() {
  stopAutoplay()
  isLoading.value = true
  errorMessage.value = null
  steps.value = []
  try {
    const content = await studyContentService.getStudyContent()
    const nextSimulation = createAlgorithmSimulation({
      ...content,
      profile: profile.value,
      seed: simulationSeed,
      strategy: 'coverage-weighted'
    })
    simulation.value = nextSimulation
    if (!nextSimulation.currentQuestion && nextSimulation.endReason === 'no-question') {
      errorMessage.value =
        'Der Aufgabenpool enthält keine verwendbare Aufgabe mit genau einer erforderlichen Kompetenz.'
    }
  } catch (error) {
    console.error('Simulation konnte nicht gestartet werden.', error)
    simulation.value = null
    errorMessage.value =
      error instanceof Error ? error.message : 'Die Simulation konnte nicht gestartet werden.'
  } finally {
    isLoading.value = false
  }
}

function simulateNextAnswer() {
  const current = simulation.value
  if (!current || current.endReason) return
  try {
    const step = advanceAlgorithmSimulation(current)
    if (step) steps.value = [...steps.value, step]
    simulation.value = { ...current }
  } catch (error) {
    console.error('Simulationsschritt ist fehlgeschlagen.', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Der nächste Simulationsschritt ist fehlgeschlagen.'
    stopAutoplay()
  }
}

function startAutoplay() {
  if (!simulation.value || simulation.value.endReason) return
  isRunning.value = true
  autoplayTimer = setInterval(() => {
    if (!simulation.value || simulation.value.endReason) {
      stopAutoplay()
      return
    }
    simulateNextAnswer()
  }, 1400)
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = undefined
  isRunning.value = false
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)} %`
}
</script>

<style scoped>
.competency-list {
  max-height: 620px;
  overflow-y: auto;
}

.competency-item + .competency-item {
  border-top: 1px solid rgb(var(--v-theme-app-border));
}
</style>
