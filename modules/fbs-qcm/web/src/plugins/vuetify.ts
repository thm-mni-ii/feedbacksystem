/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

export const appPalette = {
  background: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  textPrimary: '#1F2937',
  black: '#000000',
  textSecondary: '#6B7280',
  headerStart: '#5FAF66',
  headerEnd: '#3FAF8E',
  headerText: '#FFFFFF',
  headerAvatar: 'rgba(255, 255, 255, 0.2)',
  border: '#E5E7EB',
  borderStrong: '#CBD5E1',
  shadow: 'rgba(15, 23, 42, 0.12)',
  focusRing: 'rgba(59, 130, 246, 0.25)',
  danger: '#E74C3C',
  dangerHover: '#C0392B',
  success: '#27AE60',
  successHover: '#219653',
  graphPrimary: '#3498DB',
  graphPrimaryDark: '#2980B9',
  graphText: '#2C3E50',
  graphMuted: '#95A5A6',
  // Skill Graph tokens are intentionally semantic so UI tweaks can be done in one place.
  skillGraph: {
    viewBackground: '#EEF4F8',
    viewBackgroundAlt: '#E6EEF5',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F8FB',
    panelBackground: '#FFFFFF',
    panelBorder: '#D5E1EC',
    panelShadow: 'rgba(15, 23, 42, 0.08)',
    headerStart: '#5FAF66',
    headerEnd: '#3FAF8E',
    headerText: '#FFFFFF',
    headerAvatar: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    accent: '#2563EB',
    accentSoft: '#DBEAFE',
    courseNode: '#E9A93B',
    questionNode: '#8CA2BE',
    edgeDefault: '#B8C6D8',
    edgeFocus: '#627992',
    labelBackground: '#EEF3F8',
    cardBorder: '#D5E1EC',
    chipFallback: '#94A3B8',
    hierarchyDepth1: '#ECF4FF',
    hierarchyDepth2: '#EEF4FF',
    hierarchyDepth3: '#ECFBF9',
    hierarchyDepth4: '#F4F8FC',
    competencyPalette: ['#3B82F6', '#0EA5A4', '#22C55E', '#14B8A6', '#6366F1']
  }
} as const
export const skillGraphPalette = appPalette.skillGraph

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {},
  theme: {
    themes: {
      light: {
        colors: {
          background: appPalette.background,
          surface: appPalette.surface,
          primary: '#81BA24',
          'primary-dark': '#4F8A00',
          'primary-light': '#B4ED59',
          secondary: '#03DAC6',
          'secondary-darken-1': '#018786',
          grey: appPalette.surfaceMuted,
          'dark-grey': '#414958',
          black: appPalette.black,
          white: appPalette.surface,
          error: '#e60000',
          info: '#2196F3',
          low: '#FB8C00',
          medium: '#fbe94a',
          good: '#b8f75b',
          success: '#4CAF50',
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
