import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const fbsLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#f5f5f5',
    surface: '#ffffff',
    primary: '#405e9a',
    'primary-darken-1': '#29434e',
    'primary-lighten-1': '#819ca9',
    secondary: '#7986cb',
    'secondary-darken-1': '#49599a',
    'secondary-lighten-1': '#aab6fe',
    error: '#ff3300',
    info: '#2196F3',
    success: '#48b333',
    warning: '#ff9900'
  }
}

const fbsDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    primary: '#7986cb',
    'primary-darken-1': '#405e9a',
    'primary-lighten-1': '#aab6fe',
    secondary: '#819ca9',
    'secondary-darken-1': '#29434e',
    error: '#ff5252',
    info: '#64b5f6',
    success: '#66bb6a',
    warning: '#ffa726'
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'fbsLightTheme',
    themes: {
      fbsLightTheme,
      fbsDarkTheme
    }
  }
})
