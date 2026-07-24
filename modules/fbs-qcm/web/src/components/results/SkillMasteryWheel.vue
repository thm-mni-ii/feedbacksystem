<template>
  <div class="mastery-wheel-container">
    <svg :width="containerSize" :height="containerSize" class="mastery-wheel-svg" ref="svgElement">
      <!-- Äußerer Ring Hintergrund -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="outerRadius"
        fill="none"
        stroke="#e0e0e0"
        stroke-width="1"
      />

      <!-- Innerer Ring -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="innerRadius"
        fill="none"
        stroke="#e0e0e0"
        stroke-width="1"
      />

      <!-- Skill Segments -->
      <g v-for="(skill, index) in skills" :key="skill.skillId" @click="selectSkill(skill)">
        <!-- Segment Arc Background -->
        <path
          :d="getSegmentPath(index)"
          :fill="getSegmentColor(skill.status)"
          :opacity="selectedSkill?.skillId === skill.skillId ? 1 : 0.7"
          class="segment-path"
          :class="{ active: selectedSkill?.skillId === skill.skillId }"
        />

        <!-- Mastery Percentage (inner bar) -->
        <path
          :d="getMasteryBarPath(index, skill.pLearned)"
          :stroke="getMasteryBarColor(skill.pLearned)"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
        />

        <!-- Skill Label -->
        <text
          :x="getLabelX(index)"
          :y="getLabelY(index)"
          class="skill-label"
          :class="{ active: selectedSkill?.skillId === skill.skillId }"
          @click="selectSkill(skill)"
        >
          {{ skill.label }}
        </text>

        <!-- Mastery Percentage Text -->
        <text
          :x="getPercentX(index)"
          :y="getPercentY(index)"
          class="mastery-percent"
          :class="{ active: selectedSkill?.skillId === skill.skillId }"
        >
          {{ Math.round(skill.pLearned * 100) }}%
        </text>

        <!-- Interactive Circle (invisible, large hit target) -->
        <circle
          :cx="getInteractiveCenterX(index)"
          :cy="getInteractiveCenterY(index)"
          r="20"
          fill="transparent"
          class="interactive-circle"
        />
      </g>

      <!-- Zentraler Circle mit Overall Progress -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="centerRadius"
        fill="white"
        stroke="#e0e0e0"
        stroke-width="2"
      />

      <text :x="centerX" :y="centerY - 15" class="center-label" text-anchor="middle">
        Gesamtfortschritt
      </text>

      <text :x="centerX" :y="centerY + 15" class="center-value" text-anchor="middle">
        {{ Math.round(overallProgress * 100) }}%
      </text>
    </svg>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color mastered"></div>
        <span>Gemeistert</span>
      </div>
      <div class="legend-item">
        <div class="legend-color progress"></div>
        <span>In Progress</span>
      </div>
      <div class="legend-item">
        <div class="legend-color locked"></div>
        <span>Gesperrt</span>
      </div>
    </div>

    <!-- Tooltip -->
    <v-tooltip v-if="hoveredSkill" :text="getTooltipText(hoveredSkill)" location="right">
      <template #activator="{ props }"></template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SkillVisualization } from '@/composables/types'

const props = defineProps<{
  skills: SkillVisualization[]
}>()

const emit = defineEmits<{
  select: [skill: SkillVisualization]
}>()

// ─── Constants ────────────────────────────────────────────────────
const containerSize = 600
const centerX = containerSize / 2
const centerY = containerSize / 2
const outerRadius = 200
const innerRadius = 100
const centerRadius = 40
const svgElement = ref<SVGSVGElement>()

// ─── State ────────────────────────────────────────────────────────
const selectedSkill = ref<SkillVisualization | null>(null)
const hoveredSkill = ref<SkillVisualization | null>(null)

// ─── Computed ─────────────────────────────────────────────────────
const overallProgress = computed(() => {
  if (props.skills.length === 0) return 0
  return props.skills.reduce((sum, s) => sum + s.pLearned, 0) / props.skills.length
})

const segmentAngle = computed(() => (360 / props.skills.length) * (Math.PI / 180))

// ─── Methods ──────────────────────────────────────────────────────
/**
 * Gibt die Farbcodierung basierend auf Status zurück
 */
function getSegmentColor(status: string): string {
  switch (status) {
    case 'mastered':
      return '#2563EB'
    case 'progress':
      return '#FFA726'
    case 'locked':
      return '#BDBDBD'
    default:
      return '#f0f0f0'
  }
}

/**
 * Gibt die Farbe für den Mastery-Indikator zurück
 */
function getMasteryBarColor(pLearned: number): string {
  if (pLearned >= 0.75) return '#3B82F6'
  if (pLearned >= 0.5) return '#FFC107'
  return '#F44336'
}

/**
 * Berechnet den SVG-Pfad für ein Skill-Segment
 */
function getSegmentPath(index: number): string {
  const angle = index * segmentAngle.value - Math.PI / 2
  const x1 = centerX + innerRadius * Math.cos(angle)
  const y1 = centerY + innerRadius * Math.sin(angle)
  const x2 = centerX + outerRadius * Math.cos(angle)
  const y2 = centerY + outerRadius * Math.sin(angle)

  const nextAngle = angle + segmentAngle.value
  const x3 = centerX + outerRadius * Math.cos(nextAngle)
  const y3 = centerY + outerRadius * Math.sin(nextAngle)
  const x4 = centerX + innerRadius * Math.cos(nextAngle)
  const y4 = centerY + innerRadius * Math.sin(nextAngle)

  const largeArc = segmentAngle.value > Math.PI ? 1 : 0

  return `
    M ${x1} ${y1}
    L ${x2} ${y2}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
    L ${x4} ${y4}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
    Z
  `
}

/**
 * Berechnet den Pfad für den Mastery-Indikator (innerer Balken)
 */
function getMasteryBarPath(index: number, pLearned: number): string {
  const startAngle = index * segmentAngle.value - Math.PI / 2
  const endAngle = startAngle + segmentAngle.value * pLearned

  const x1 = centerX + (innerRadius + 8) * Math.cos(startAngle)
  const y1 = centerY + (innerRadius + 8) * Math.sin(startAngle)
  const x2 = centerX + (innerRadius + 8) * Math.cos(endAngle)
  const y2 = centerY + (innerRadius + 8) * Math.sin(endAngle)

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  return `
    M ${x1} ${y1}
    A ${innerRadius + 8} ${innerRadius + 8} 0 ${largeArc} 1 ${x2} ${y2}
  `
}

/**
 * Position für Skill-Label
 */
function getLabelX(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerX + (outerRadius + 40) * Math.cos(angle)
}

function getLabelY(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerY + (outerRadius + 40) * Math.sin(angle)
}

/**
 * Position für Prozentzahl
 */
function getPercentX(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerX + (innerRadius + (outerRadius - innerRadius) / 2) * Math.cos(angle)
}

function getPercentY(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerY + (innerRadius + (outerRadius - innerRadius) / 2) * Math.sin(angle)
}

/**
 * Mittelpunkt für interaktives Element
 */
function getInteractiveCenterX(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerX + (innerRadius + (outerRadius - innerRadius) / 2) * Math.cos(angle)
}

function getInteractiveCenterY(index: number): number {
  const angle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2
  return centerY + (innerRadius + (outerRadius - innerRadius) / 2) * Math.sin(angle)
}

/**
 * Wählt einen Skill aus
 */
function selectSkill(skill: SkillVisualization) {
  selectedSkill.value = skill
  emit('select', skill)
}

/**
 * Generiert Tooltip-Text
 */
function getTooltipText(skill: SkillVisualization): string {
  return `
    ${skill.label}
    P(L): ${Math.round(skill.pLearned * 100)}%
    Fragen: ${skill.timesAsked}
    Status: ${skill.status}
  `
}
</script>

<style scoped>
.mastery-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mastery-wheel-svg {
  max-width: 100%;
  max-height: 500px;
  height: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.segment-path {
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.segment-path:hover {
  opacity: 1 !important;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.segment-path.active {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  stroke: #333;
  stroke-width: 2;
}

.skill-label {
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  cursor: pointer;
  transition: all 0.3s ease;
  fill: #333;
}

.skill-label:hover,
.skill-label.active {
  font-size: 14px;
  fill: #000;
  font-weight: 700;
}

.mastery-percent {
  font-size: 14px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.mastery-percent.active {
  font-size: 16px;
}

.interactive-circle {
  cursor: pointer;
  transition: all 0.3s ease;
}

.interactive-circle:hover {
  fill: rgba(0, 0, 0, 0.05);
}

.center-label {
  font-size: 12px;
  font-weight: 600;
  fill: #666;
}

.center-value {
  font-size: 24px;
  font-weight: 700;
  fill: #2563eb;
}

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.mastered {
  background: #2563eb;
}

.legend-color.progress {
  background: #ffa726;
}

.legend-color.locked {
  background: #bdbdbd;
}

@media (max-width: 600px) {
  .mastery-wheel-svg {
    width: 100%;
    max-width: 400px;
  }
}
</style>
