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
  skillGraph: {
    viewBackground: '#F6F8F7',
    headerStart: '#5FAF66',
    headerEnd: '#3FAF8E',
    headerText: '#FFFFFF',
    headerAvatar: 'rgba(255, 255, 255, 0.2)',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    courseNode: '#F4B740',
    questionNode: '#7FA8E6',
    edgeDefault: '#94A3B8',
    edgeFocus: '#334155',
    labelBackground: '#E2E8F0B3',
    cardBorder: '#E5E7EB',
    chipFallback: '#9CA3AF',
    competencyPalette: ['#43C57C', '#7B68EE', '#FF6B6B', '#14B8A6', '#F59E0B']
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
