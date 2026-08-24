<template>
  <div class="radar-wrap">
    <div v-if="activeItem" class="radar-hover-card">
      <div class="radar-hover-card__eyebrow" :style="{ color: activeItem.groupColor }">
        {{ activeItem.groupLabel }}
      </div>
      <div class="radar-hover-card__title">{{ activeItem.label }}</div>
      <div class="radar-hover-card__meta">
        <span>{{ Math.round(activeItem.score * 100) }}%</span>
        <span>{{ activeItem.timesAssessed }} Beobachtungen</span>
      </div>
    </div>

    <svg :viewBox="viewBox" class="radar-svg" role="img" aria-label="Kompetenz-Radar">
      <g v-for="segment in groupSegments" :key="segment.groupLabel" class="group-segment">
        <path :d="segment.path" :fill="segment.fill" />
        <rect
          :x="segment.labelBoxX"
          :y="segment.labelBoxY"
          :width="segment.labelBoxWidth"
          :height="segment.labelBoxHeight"
          rx="10"
          class="group-label-card"
        />
        <rect
          :x="segment.labelAccentX"
          :y="segment.labelAccentY"
          :width="segment.labelAccentWidth"
          height="3"
          rx="2"
          :fill="segment.accentColor"
          class="group-label-accent"
        />
        <text :x="segment.labelTextX" :y="segment.labelY" :class="['group-label', segment.anchor]">
          <tspan
            v-for="(line, lineIndex) in segment.labelLines"
            :key="`${segment.groupLabel}-${lineIndex}`"
            :x="segment.labelTextX"
            :dy="lineIndex === 0 ? 0 : 14"
          >
            {{ line }}
          </tspan>
        </text>
      </g>

      <g v-for="ring in rings" :key="ring" class="radar-ring">
        <polygon :points="ringPoints(ring)" />
      </g>

      <g v-for="ring in rings" :key="`label-${ring}`" class="ring-label">
        <text :x="center" :y="center - radius * ring + 4" text-anchor="middle">
          {{ Math.round(ring * 100) }}%
        </text>
      </g>

      <g
        v-for="axis in axes"
        :key="axis.competencyId"
        class="radar-axis"
        @mouseenter="activeCompetencyId = axis.competencyId"
      >
        <title>{{ `${axis.label} · ${Math.round(axis.score * 100)}% · ${axis.groupLabel}` }}</title>
        <line :x1="center" :y1="center" :x2="axis.outerX" :y2="axis.outerY" />
        <circle
          :cx="axis.badgeX"
          :cy="axis.badgeY"
          :r="axis.isActive ? 18 : 14"
          :fill="axis.groupColor"
          :class="['axis-badge', { 'axis-badge--active': axis.isActive }]"
        />
        <text :x="axis.badgeX" :y="axis.badgeY + 4" class="axis-badge-label" text-anchor="middle">
          {{ axis.axisIndex }}
        </text>
      </g>

      <polygon class="radar-area" :points="areaPoints" />
      <g
        v-for="point in points"
        :key="point.competencyId"
        @mouseenter="activeCompetencyId = point.competencyId"
      >
        <title>
          {{ `${point.label} · ${Math.round(point.score * 100)}% · ${point.groupLabel}` }}
        </title>
        <circle
          :cx="point.x"
          :cy="point.y"
          :r="point.isActive ? 7 : 5"
          :class="['radar-point', { 'radar-point--active': point.isActive }]"
        />
        <circle :cx="point.x" :cy="point.y" r="11" class="radar-hit" />
      </g>

      <g v-if="activeLabelCard" class="active-label">
        <line
          :x1="activeLabelCard.badgeX"
          :y1="activeLabelCard.badgeY"
          :x2="activeLabelCard.cardX"
          :y2="activeLabelCard.cardY"
          class="active-label__line"
        />
        <g :transform="`translate(${activeLabelCard.cardX}, ${activeLabelCard.cardY})`">
          <rect
            x="0"
            y="-18"
            :width="activeLabelCard.labelWidth + 24"
            height="36"
            rx="12"
            class="active-label__card"
          />
          <text x="12" y="4" class="active-label__text">{{ activeLabelCard.label }}</text>
        </g>
      </g>

      <circle :cx="center" :cy="center" :r="centerRadius" class="radar-center" />

      <text :x="center" :y="center - 2" class="center-caption" text-anchor="middle">Ø Score:</text>
      <text :x="center" :y="center + 15" class="center-value" text-anchor="middle">
        {{ Math.round(averageScore * 100) }}%
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildRadarItems } from '@/composables/competencyHierarchy'
import type { Competency, ProgressItem } from '@/model/types'

interface Props {
  competencies: Competency[]
  progress: ProgressItem[]
}

const props = defineProps<Props>()
const size = 860
const center = size / 2
const radius = 220
const bandInnerRadius = radius + 18
const bandOuterRadius = radius + 26
const badgeRadius = radius + 36
const groupLabelRadius = radius + 86
const centerRadius = 30
const rings = [0.2, 0.4, 0.6, 0.8, 1]

const viewBox = `0 0 ${size} ${size}`
const activeCompetencyId = ref<string | null>(null)

const radarItems = computed(() => buildRadarItems(props.competencies, props.progress))
const activeItem = computed(
  () =>
    radarItems.value.find((item) => item.competencyId === activeCompetencyId.value) ??
    radarItems.value[0] ??
    null
)

const averageScore = computed(() => {
  if (radarItems.value.length === 0) return 0
  return radarItems.value.reduce((sum, item) => sum + item.score, 0) / radarItems.value.length
})

const axes = computed(() => {
  const count = radarItems.value.length || 1
  return radarItems.value.map((item, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    const badgeX = center + badgeRadius * Math.cos(angle)
    const badgeY = center + badgeRadius * Math.sin(angle)
    const labelDirection = Math.cos(angle) >= 0 ? 1 : -1
    const labelCardX = badgeX + labelDirection * 28
    const labelCardY = badgeY
    const labelWidth = Math.max(56, item.label.length * 7.2)

    return {
      axisIndex: item.axisIndex,
      competencyId: item.competencyId,
      label: item.label,
      groupLabel: item.groupLabel,
      groupColor: item.groupColor,
      score: item.score,
      isActive: item.competencyId === activeCompetencyId.value,
      outerX: center + radius * Math.cos(angle),
      outerY: center + radius * Math.sin(angle),
      badgeX,
      badgeY,
      labelCardX,
      labelCardY,
      labelWidth,
      labelAlign: labelDirection > 0 ? 'right' : 'left'
    }
  })
})

const activeAxis = computed(
  () =>
    axes.value.find((axis) => axis.competencyId === activeCompetencyId.value) ??
    axes.value[0] ??
    null
)

const activeLabelCard = computed(() => {
  const axis = activeAxis.value
  if (!axis) {
    return null
  }

  const preferredDirection = axis.badgeX >= center ? 1 : -1
  const labelWidth = axis.labelWidth + 24
  const minX = 18
  const maxX = size - labelWidth - 18
  const left = clamp(axis.badgeX + preferredDirection * 32, minX, maxX)
  const top = clamp(axis.badgeY - 20, 18, size - 54)

  return {
    ...axis,
    cardX: left,
    cardY: top,
    textX: left + 12,
    textY: top + 22
  }
})

const groupSegments = computed(() => {
  const segments: Array<{
    groupLabel: string
    fill: string
    path: string
    labelX: number
    labelY: number
    labelLines: string[]
    anchor: 'start' | 'middle' | 'end'
    accentColor: string
    labelBoxX: number
    labelBoxY: number
    labelBoxWidth: number
    labelBoxHeight: number
    labelAccentX: number
    labelAccentY: number
    labelAccentWidth: number
    labelTextX: number
  }> = []

  const count = radarItems.value.length
  if (count === 0) {
    return segments
  }

  let startIndex = 0
  while (startIndex < count) {
    const current = radarItems.value[startIndex]
    let endIndex = startIndex
    while (
      endIndex + 1 < count &&
      radarItems.value[endIndex + 1].groupLabel === current.groupLabel
    ) {
      endIndex += 1
    }

    const middleIndex = (startIndex + endIndex) / 2
    const middleAngle = (Math.PI * 2 * middleIndex) / count - Math.PI / 2
    const anchor =
      Math.cos(middleAngle) > 0.3 ? 'start' : Math.cos(middleAngle) < -0.3 ? 'end' : 'middle'
    const labelLines = wrapLabel(current.groupLabel, 14)
    const textWidth = Math.max(
      ...labelLines.map((line) => line.length * 7),
      current.groupLabel.length * 5.5
    )
    const labelBoxWidth = textWidth + 24
    const labelBoxHeight = 18 + labelLines.length * 14
    const labelCenterX = center + groupLabelRadius * Math.cos(middleAngle)
    const rawLabelTopY =
      center + groupLabelRadius * Math.sin(middleAngle) - (labelLines.length - 1) * 7 - 14
    const rawLabelBoxX =
      anchor === 'start'
        ? labelCenterX - 10
        : anchor === 'end'
          ? labelCenterX - labelBoxWidth + 10
          : labelCenterX - labelBoxWidth / 2
    const labelBoxX = clamp(rawLabelBoxX, 12, size - labelBoxWidth - 12)
    const labelBoxY = clamp(rawLabelTopY, 12, size - labelBoxHeight - 12)
    const labelTextX = labelBoxX + 12

    segments.push({
      groupLabel: current.groupLabel,
      fill: `${current.groupColor}20`,
      path: sectorPath(startIndex, endIndex, count),
      labelX: labelCenterX,
      labelY: labelBoxY + 15,
      labelLines,
      anchor: 'start',
      accentColor: current.groupColor,
      labelBoxX,
      labelBoxY,
      labelBoxWidth,
      labelBoxHeight,
      labelAccentX: labelBoxX + 10,
      labelAccentY: labelBoxY + labelBoxHeight - 10,
      labelAccentWidth: Math.max(28, labelBoxWidth - 20),
      labelTextX
    })

    startIndex = endIndex + 1
  }

  return segments
})

const points = computed(() => {
  const count = radarItems.value.length || 1
  return radarItems.value.map((item, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2
    const pointRadius = radius * Math.max(0, Math.min(1, item.score))
    return {
      competencyId: item.competencyId,
      label: item.label,
      groupLabel: item.groupLabel,
      score: item.score,
      isActive: item.competencyId === activeCompetencyId.value,
      x: center + pointRadius * Math.cos(angle),
      y: center + pointRadius * Math.sin(angle)
    }
  })
})

const areaPoints = computed(() => points.value.map((point) => `${point.x},${point.y}`).join(' '))

function ringPoints(scale: number): string {
  const count = radarItems.value.length || 1
  return radarItems.value
    .map((_, index) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2
      const r = radius * scale
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
    })
    .join(' ')
}

function sectorPath(startIndex: number, endIndex: number, count: number): string {
  if (count === 1) {
    return [
      `M ${center + bandInnerRadius} ${center}`,
      `A ${bandInnerRadius} ${bandInnerRadius} 0 1 0 ${center - bandInnerRadius} ${center}`,
      `A ${bandInnerRadius} ${bandInnerRadius} 0 1 0 ${center + bandInnerRadius} ${center}`,
      `L ${center + bandOuterRadius} ${center}`,
      `A ${bandOuterRadius} ${bandOuterRadius} 0 1 1 ${center - bandOuterRadius} ${center}`,
      `A ${bandOuterRadius} ${bandOuterRadius} 0 1 1 ${center + bandOuterRadius} ${center}`,
      'Z'
    ].join(' ')
  }

  const step = (Math.PI * 2) / count
  const startAngle = startIndex * step - Math.PI / 2 - step / 2
  const endAngle = endIndex * step - Math.PI / 2 + step / 2
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  const x1 = center + bandInnerRadius * Math.cos(startAngle)
  const y1 = center + bandInnerRadius * Math.sin(startAngle)
  const x2 = center + bandInnerRadius * Math.cos(endAngle)
  const y2 = center + bandInnerRadius * Math.sin(endAngle)
  const x3 = center + bandOuterRadius * Math.cos(endAngle)
  const y3 = center + bandOuterRadius * Math.sin(endAngle)
  const x4 = center + bandOuterRadius * Math.cos(startAngle)
  const y4 = center + bandOuterRadius * Math.sin(startAngle)

  return [
    `M ${x1} ${y1}`,
    `A ${bandInnerRadius} ${bandInnerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${bandOuterRadius} ${bandOuterRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ')
}

function wrapLabel(label: string, maxChars: number): string[] {
  const words = label.split(/\s+/).filter(Boolean)
  if (words.length <= 1 && label.length <= maxChars) {
    return [label]
  }

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }

    if (current) {
      lines.push(current)
    }
    current = word
  }

  if (current) {
    lines.push(current)
  }

  return lines.length > 2 ? [lines[0], lines.slice(1).join(' ')] : lines
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
</script>

<style scoped>
.radar-wrap {
  position: relative;
  width: 100%;
}

.radar-hover-card {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  min-width: 260px;
  max-width: 320px;
  padding: 14px 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  background: rgba(var(--v-theme-surface), 0.92);
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  text-align: left;
}

.radar-hover-card__eyebrow {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.radar-hover-card__title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.radar-hover-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 12px;
}

.radar-svg {
  width: 100%;
  height: auto;
  display: block;
}

.group-segment path {
  stroke: rgba(var(--v-theme-on-surface), 0.05);
  stroke-width: 1;
}

.group-label-card {
  fill: rgba(var(--v-theme-surface), 0.92);
  stroke: rgba(var(--v-theme-on-surface), 0.08);
  stroke-width: 1;
}

.group-label-accent {
  opacity: 0.95;
}

.group-label {
  fill: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 12px;
  font-weight: 700;
}

.group-label.start {
  text-anchor: start;
}

.group-label.middle {
  text-anchor: middle;
}

.group-label.end {
  text-anchor: end;
}

.radar-ring polygon {
  fill: none;
  stroke: rgba(var(--v-theme-on-surface), 0.12);
  stroke-width: 1;
}

.ring-label text {
  font-size: 10px;
  fill: rgba(var(--v-theme-on-surface), 0.42);
}

.radar-axis line {
  stroke: rgba(var(--v-theme-on-surface), 0.12);
  stroke-width: 1;
}

.radar-area {
  fill: rgba(var(--v-theme-primary), 0.14);
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 3;
}

.radar-point {
  fill: rgb(var(--v-theme-primary));
  stroke: white;
  stroke-width: 2;
  transition: r 0.2s ease;
}

.radar-point--active {
  stroke-width: 3;
}

.radar-hit {
  fill: transparent;
  cursor: pointer;
}

.axis-badge {
  stroke: white;
  stroke-width: 3;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.axis-badge--active {
  filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.18));
}

.axis-badge-label {
  font-size: 10px;
  font-weight: 800;
  fill: white;
}

.active-label__line {
  stroke: rgba(var(--v-theme-on-surface), 0.22);
  stroke-width: 1.5;
}

.active-label__card {
  fill: rgba(var(--v-theme-surface), 0.94);
  stroke: rgba(var(--v-theme-on-surface), 0.08);
  stroke-width: 1;
}

.active-label__text {
  font-size: 12px;
  font-weight: 700;
  fill: rgb(var(--v-theme-on-surface));
}

.radar-center {
  fill: rgb(var(--v-theme-surface));
  stroke: rgba(var(--v-theme-on-surface), 0.15);
  stroke-width: 2;
}

.center-title {
  font-size: 11px;
  font-weight: 700;
  fill: rgba(var(--v-theme-on-surface), 0.68);
}

.center-value {
  font-size: 14px;
  font-weight: 700;
  fill: rgb(var(--v-theme-on-surface));
}

.center-caption {
  font-size: 10px;
  fill: rgba(var(--v-theme-on-surface), 0.6);
}

.summary-title {
  font-size: 12px;
  fill: rgba(var(--v-theme-on-surface), 0.68);
}

.summary-caption {
  font-size: 11px;
  fill: rgba(var(--v-theme-on-surface), 0.58);
}

.summary-value {
  font-size: 24px;
  font-weight: 800;
  fill: rgb(var(--v-theme-on-surface));
}
</style>
