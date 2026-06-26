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

export const skillGraphPalette = {
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
} as const

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {},
  theme: {
    themes: {
      light: {
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          primary: '#81BA24',
          'primary-dark': '#4F8A00',
          'primary-light': '#B4ED59',
          secondary: '#03DAC6',
          'secondary-darken-1': '#018786',
          grey: '#F5F5F5',
          'dark-grey': '#414958',
          black: '#1F242E',
          white: '#FFFFFF',
          error: '#e60000',
          info: '#2196F3',
          low: '#FB8C00',
          medium: '#fbe94a',
          good: '#b8f75b',
          success: '#4CAF50',
          warning: '#FB8C00',
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
