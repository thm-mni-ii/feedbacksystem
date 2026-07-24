/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

const BLUE = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A'
} as const

const NEUTRAL = {
  background: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  textPrimary: '#1F2937',
  black: '#000000',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  borderStrong: '#CBD5E1',
  shadow: 'rgba(15, 23, 42, 0.12)',
  darkGrey: '#414958'
} as const

const SEMANTIC = {
  danger: '#E74C3C',
  dangerHover: '#C0392B'
} as const

const skillGraphPaletteBase = {
  viewBackground: BLUE[50],
  viewBackgroundAlt: '#E0F2FE',
  surface: NEUTRAL.surface,
  surfaceMuted: '#F5F8FB',
  panelBackground: NEUTRAL.surface,
  panelBorder: '#D5E1EC',
  panelShadow: 'rgba(15, 23, 42, 0.08)',
  headerStart: BLUE[600],
  headerEnd: BLUE[700],
  headerText: NEUTRAL.surface,
  headerAvatar: 'rgba(255, 255, 255, 0.2)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  accent: BLUE[600],
  accentSoft: BLUE[100],
  courseNode: BLUE[500],
  questionNode: '#8CA2BE',
  edgeDefault: '#B8C6D8',
  edgeFocus: '#627992',
  labelBackground: '#EEF3F8',
  cardBorder: '#D5E1EC',
  chipFallback: '#94A3B8',
  hierarchyDepth1: BLUE[50],
  hierarchyDepth2: '#EEF4FF',
  hierarchyDepth3: '#ECFBF9',
  hierarchyDepth4: '#F4F8FC',
  competencyPalette: [BLUE[500], BLUE[600], BLUE[700], BLUE[400], BLUE[800]]
} as const

export const appPalette = {
  ...NEUTRAL,
  headerStart: BLUE[600],
  headerEnd: BLUE[700],
  headerText: NEUTRAL.surface,
  headerAvatar: 'rgba(255, 255, 255, 0.2)',
  focusRing: 'rgba(59, 130, 246, 0.25)',
  danger: SEMANTIC.danger,
  dangerHover: SEMANTIC.dangerHover,
  success: BLUE[500],
  successHover: BLUE[600],
  graphPrimary: BLUE[500],
  graphPrimaryDark: BLUE[600],
  graphText: '#1E3A5F',
  graphMuted: '#64748B',
  skillGraph: skillGraphPaletteBase
} as const

export const skillGraphPalette = appPalette.skillGraph

export default createVuetify({
  components: {},
  theme: {
    themes: {
      light: {
        colors: {
          background: appPalette.background,
          surface: appPalette.surface,
          primary: BLUE[600],
          'primary-dark': BLUE[700],
          'primary-light': BLUE[300],
          secondary: BLUE[500],
          'secondary-darken-1': BLUE[600],
          grey: appPalette.surfaceMuted,
          'dark-grey': appPalette.darkGrey,
          black: appPalette.black,
          white: appPalette.surface,
          error: SEMANTIC.danger,
          info: BLUE[500],
          low: '#FB8C00',
          medium: BLUE[300],
          good: BLUE[400],
          success: BLUE[500],
          warning: '#FB8C00',
          'app-bg': appPalette.background,
          'app-surface-muted': appPalette.surfaceMuted,
          'app-text-primary': appPalette.textPrimary,
          'app-text-secondary': appPalette.textSecondary,
          'app-border': appPalette.border,
          'app-border-strong': appPalette.borderStrong,
          'app-header-start': appPalette.headerStart,
          'app-header-end': appPalette.headerEnd,
          'app-danger': appPalette.danger,
          'app-success': appPalette.success,
          'app-graph-primary': appPalette.graphPrimary,
          'app-graph-primary-dark': appPalette.graphPrimaryDark,
          'app-graph-text': appPalette.graphText,
          'app-graph-muted': appPalette.graphMuted,
          'skill-graph-bg': skillGraphPalette.viewBackground,
          'skill-graph-header-start': skillGraphPalette.headerStart,
          'skill-graph-header-end': skillGraphPalette.headerEnd,
          'skill-graph-course': skillGraphPalette.courseNode,
          'skill-graph-question': skillGraphPalette.questionNode
        }
      }
    }
  }
})
