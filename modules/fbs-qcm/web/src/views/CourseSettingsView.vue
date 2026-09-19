<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { courseMocks } from '@/composables/course.mock'
import {
  COMPLETION_PRESETS,
  type CompletionPreset,
  type CourseStudyConfiguration,
  type StudyAlgorithmConfig,
  type StudyAlgorithmOverrides
} from '@/model/StudyAlgorithmConfig'
import studyConfigurationService from '@/services/studyConfiguration.service'

const route = useRoute()
const courseId = String(route.params.courseId)
const course = courseMocks.find((item) => String(item.id) === courseId)

const configuration = ref<CourseStudyConfiguration | null>(null)
const form = ref<StudyAlgorithmConfig | null>(null)
const completionPreset = ref<CompletionPreset | 'custom'>('balanced')
const isLoading = ref(true)
const isSaving = ref(false)
const isResetting = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')
const isSnackbarVisible = ref(false)

const completionPresetItems = [
  { title: 'Kurz', value: 'short' },
  { title: 'Ausgewogen', value: 'balanced' },
  { title: 'Gründlich', value: 'thorough' },
  { title: 'Individuell', value: 'custom' }
]

const currentCompletionDescription = computed(() => {
  if (!form.value) return ''
  const { minEvidencePerCompetency, maxUncertainty } = form.value.completion
  return `Der Algorithmus beendet eine Kompetenz erst, wenn mindestens ${minEvidencePerCompetency} ${
    minEvidencePerCompetency === 1 ? 'Nachweis' : 'Nachweise'
  } vorliegen und die verbleibende Unsicherheit höchstens ${Math.round(maxUncertainty * 100)} % beträgt.`
})

const isFormValid = computed(() => {
  if (!form.value) return false
  const { session, selection, completion } = form.value
  return (
    Number.isInteger(session.maxQuestionsPerSession) &&
    session.maxQuestionsPerSession >= 1 &&
    session.maxQuestionsPerSession <= 200 &&
    Number.isInteger(selection.stickinessQuestions) &&
    selection.stickinessQuestions >= 1 &&
    selection.stickinessQuestions <= 20 &&
    Number.isInteger(selection.recentQuestionWindow) &&
    selection.recentQuestionWindow >= 0 &&
    selection.recentQuestionWindow <= 100 &&
    selection.difficultyWindow >= 0 &&
    selection.difficultyWindow <= 1 &&
    Number.isInteger(completion.minEvidencePerCompetency) &&
    completion.minEvidencePerCompetency >= 1 &&
    completion.minEvidencePerCompetency <= 10 &&
    completion.maxUncertainty >= 0.1 &&
    completion.maxUncertainty <= 0.95
  )
})

function matchesCompletionPreset(
  value: StudyAlgorithmConfig['completion'],
  preset: CompletionPreset
): boolean {
  const candidate = COMPLETION_PRESETS[preset]
  return (
    value.minEvidencePerCompetency === candidate.minEvidencePerCompetency &&
    value.maxUncertainty === candidate.maxUncertainty
  )
}

function setConfiguration(value: CourseStudyConfiguration) {
  configuration.value = value
  form.value = structuredClone(value.effectiveConfig)
  completionPreset.value =
    (Object.keys(COMPLETION_PRESETS) as CompletionPreset[]).find((preset) =>
      matchesCompletionPreset(value.effectiveConfig.completion, preset)
    ) ?? 'balanced'
}

function applyCompletionPreset(preset: CompletionPreset | 'custom') {
  if (!form.value || preset === 'custom') return
  form.value.completion = { ...COMPLETION_PRESETS[preset] }
}

function markCompletionAsCustom() {
  if (completionPreset.value !== 'custom') {
    completionPreset.value = 'custom'
  }
}

function showSnackbar(message: string, color: 'success' | 'error') {
  snackbarMessage.value = message
  snackbarColor.value = color
  isSnackbarVisible.value = true
}

function buildOverrides(
  value: StudyAlgorithmConfig,
  defaults: StudyAlgorithmConfig
): StudyAlgorithmOverrides {
  const overrides: StudyAlgorithmOverrides = {}

  if (value.session.maxQuestionsPerSession !== defaults.session.maxQuestionsPerSession) {
    overrides.session = {
      maxQuestionsPerSession: value.session.maxQuestionsPerSession
    }
  }
  if (
    value.completion.minEvidencePerCompetency !== defaults.completion.minEvidencePerCompetency ||
    value.completion.maxUncertainty !== defaults.completion.maxUncertainty
  ) {
    overrides.completion = { ...value.completion }
  }

  const selection = (
    Object.keys(value.selection) as Array<keyof StudyAlgorithmConfig['selection']>
  ).reduce<Partial<StudyAlgorithmConfig['selection']>>((result, key) => {
    if (value.selection[key] !== defaults.selection[key]) {
      result[key] = value.selection[key]
    }
    return result
  }, {})
  if (Object.keys(selection).length > 0) {
    overrides.selection = selection
  }

  return overrides
}

async function loadConfiguration() {
  isLoading.value = true
  try {
    setConfiguration(await studyConfigurationService.get(courseId))
  } catch (error) {
    console.error('Kurskonfiguration konnte nicht geladen werden.', error)
    showSnackbar('Die Einstellungen konnten nicht geladen werden.', 'error')
  } finally {
    isLoading.value = false
  }
}

async function saveConfiguration() {
  if (!configuration.value || !form.value) return
  if (!isFormValid.value) {
    showSnackbar('Bitte prüfe die eingegebenen Werte.', 'error')
    return
  }
  isSaving.value = true
  try {
    const overrides = buildOverrides(form.value, configuration.value.defaults)
    setConfiguration(
      await studyConfigurationService.update(courseId, configuration.value.revision, overrides)
    )
    showSnackbar(
      'Einstellungen gespeichert. Sie gelten für neu gestartete Lernsitzungen.',
      'success'
    )
  } catch (error) {
    console.error('Kurskonfiguration konnte nicht gespeichert werden.', error)
    showSnackbar(
      axios.isAxiosError(error) && error.response?.status === 409
        ? 'Die Einstellungen wurden zwischenzeitlich geändert. Lade die Seite neu und versuche es erneut.'
        : 'Die Einstellungen konnten nicht gespeichert werden.',
      'error'
    )
  } finally {
    isSaving.value = false
  }
}

async function resetConfiguration() {
  if (!configuration.value) return
  isResetting.value = true
  try {
    setConfiguration(await studyConfigurationService.reset(courseId, configuration.value.revision))
    showSnackbar(
      'Standardeinstellungen wiederhergestellt. Laufende Sitzungen bleiben unverändert.',
      'success'
    )
  } catch (error) {
    console.error('Kurskonfiguration konnte nicht zurückgesetzt werden.', error)
    showSnackbar(
      axios.isAxiosError(error) && error.response?.status === 409
        ? 'Die Einstellungen wurden zwischenzeitlich geändert. Lade die Seite neu und versuche es erneut.'
        : 'Die Einstellungen konnten nicht zurückgesetzt werden.',
      'error'
    )
  } finally {
    isResetting.value = false
  }
}

onMounted(loadConfiguration)
</script>

<template>
  <v-container class="py-8" style="max-width: 900px">
    <v-card rounded="lg" elevation="2">
      <v-card-title class="text-h5 pa-6 pb-2">Lernalgorithmus konfigurieren</v-card-title>
      <v-card-subtitle class="px-6 pb-4">
        {{ course?.name ?? `Kurs ${courseId}` }}
      </v-card-subtitle>

      <v-divider />

      <v-card-text class="pa-6">
        <v-card variant="tonal" color="primary" class="mb-6">
          <v-card-item prepend-icon="mdi-information-outline">
            <v-card-text class="text-body-2">
              Änderungen gelten nur für neue Lernsitzungen. Bereits gestartete Sitzungen behalten
              ihre ursprünglichen Einstellungen.
            </v-card-text>
          </v-card-item>
        </v-card>
        <v-card variant="tonal" color="primary" class="mb-6">
          <v-card-item prepend-icon="mdi-lightbulb-outline">
            <v-card-text class="text-body-2">
              Die <strong>Prüftiefe</strong> legt fest, wie sicher das System sein möchte, dass eine
              Kompetenz beherrscht wird. Ein <strong>Nachweis</strong> ist dabei eine beantwortete
              Frage, die dem Algorithmus Informationen über diese Kompetenz liefert. Mehr Nachweise
              und eine geringere Restunsicherheit führen zu einer gründlicheren, aber meist längeren
              Sitzung.
            </v-card-text>
          </v-card-item>
        </v-card>
        <div v-if="isLoading" class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-form v-else-if="form && configuration" @submit.prevent="saveConfiguration">
          <h2 class="text-h6 mb-4">Umfang und Abschluss</h2>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.session.maxQuestionsPerSession"
                type="number"
                min="1"
                max="200"
                label="Maximale Fragen pro Sitzung"
                hint="Die Sitzung endet spätestens nach dieser Anzahl."
                persistent-hint
                :rules="[
                  (value) =>
                    (Number.isInteger(Number(value)) &&
                      Number(value) >= 1 &&
                      Number(value) <= 200) ||
                    'Erlaubt sind ganze Zahlen von 1 bis 200.'
                ]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="completionPreset"
                :items="completionPresetItems"
                label="Prüftiefe des Lernfortschritts"
                hint="Wie viele Hinweise das System sammelt, bevor es eine Kompetenz als ausreichend geprüft betrachtet."
                persistent-hint
                @update:model-value="applyCompletionPreset"
              />
            </v-col>
          </v-row>
          <p class="text-body-2 text-medium-emphasis my-8">
            {{ currentCompletionDescription }}
          </p>
          <v-expansion-panels variant="accordion" class="mb-8">
            <v-expansion-panel title="Abschlusskriterien individuell anpassen">
              <v-expansion-panel-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Nutze diese Felder, wenn die drei Vorgaben oben nicht genau zu deinem Kurs passen.
                  Die Werte gelten für jede Kompetenz im Kurs.
                </p>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.completion.minEvidencePerCompetency"
                      type="number"
                      min="1"
                      max="10"
                      label="Benötigte Nachweise je Kompetenz"
                      hint="Wie viele beantwortete Fragen mindestens in die Einschätzung einfließen."
                      persistent-hint
                      :rules="[
                        (value) =>
                          (Number.isInteger(Number(value)) &&
                            Number(value) >= 1 &&
                            Number(value) <= 10) ||
                          'Erlaubt sind ganze Zahlen von 1 bis 10.'
                      ]"
                      @update:model-value="markCompletionAsCustom"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-body-1 mb-1">
                      Maximale verbleibende Unsicherheit:
                      <strong>{{ Math.round(form.completion.maxUncertainty * 100) }} %</strong>
                    </div>
                    <v-slider
                      v-model="form.completion.maxUncertainty"
                      :min="0.1"
                      :max="0.95"
                      :step="0.05"
                      color="primary"
                      thumb-label
                      hide-details
                      @update:model-value="markCompletionAsCustom"
                    />
                    <p class="text-body-2 text-medium-emphasis">
                      Niedrigere Werte verlangen mehr Sicherheit und können mehr Fragen erfordern.
                    </p>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <h2 class="text-h6 mb-4">Fragenauswahl</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Hier werden die Regeln für die Fragenauswahl festgelegt.
          </p>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.selection.stickinessQuestions"
                type="number"
                min="1"
                max="20"
                label="Fragen pro Kompetenzblock"
                hint="So viele Fragen bleiben nacheinander bei derselben Kompetenz, bevor der Fokus wechseln darf."
                persistent-hint
                :rules="[
                  (value) =>
                    (Number.isInteger(Number(value)) &&
                      Number(value) >= 1 &&
                      Number(value) <= 20) ||
                    'Erlaubt sind ganze Zahlen von 1 bis 20.'
                ]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.selection.recentQuestionWindow"
                type="number"
                min="0"
                max="100"
                label="Wiederholungsabstand"
                hint="So viele zuletzt gestellte Fragen werden zunächst übersprungen, damit sich Fragen nicht direkt wiederholen."
                persistent-hint
                :rules="[
                  (value) =>
                    (Number.isInteger(Number(value)) &&
                      Number(value) >= 0 &&
                      Number(value) <= 100) ||
                    'Erlaubt sind ganze Zahlen von 0 bis 100.'
                ]"
              />
            </v-col>
          </v-row>

          <div class="mt-6">
            <div class="d-flex justify-space-between">
              <span class="text-body-1">
                Passende Schwierigkeit
                <v-tooltip
                  text="Wie weit die Schwierigkeit einer Frage vom geschätzten Lernstand abweichen darf."
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      v-bind="tooltipProps"
                      icon="mdi-help-circle-outline"
                      size="small"
                      class="ml-1"
                    />
                  </template>
                </v-tooltip>
              </span>
              <span class="text-body-2 font-weight-medium">
                ± {{ Math.round(form.selection.difficultyWindow * 100) }} %
              </span>
            </div>
            <v-slider
              v-model="form.selection.difficultyWindow"
              :min="0.05"
              :max="0.5"
              :step="0.05"
              color="primary"
              hide-details
            />
            <p class="text-body-2 text-medium-emphasis">
              Kleinere Werte wählen Fragen näher am aktuell geschätzten Kompetenzniveau.
            </p>
          </div>

          <v-divider class="my-6" />

          <div class="d-flex flex-wrap ga-3 justify-end">
            <v-btn
              variant="text"
              prepend-icon="mdi-restore"
              :loading="isResetting"
              :disabled="isSaving"
              @click="resetConfiguration"
            >
              Standards wiederherstellen
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              prepend-icon="mdi-content-save"
              :loading="isSaving"
              :disabled="isResetting || !isFormValid"
            >
              Einstellungen speichern
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="isSnackbarVisible" :color="snackbarColor" :timeout="5000">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="isSnackbarVisible = false">Schließen</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
