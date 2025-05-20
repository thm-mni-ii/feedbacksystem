/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {},
  theme: {
    themes: {
      light: {
        colors: {
          background: "#FFFFFF",
          surface: "#FFFFFF",
          primary: "#81BA24",
          "primary-dark": "#4F8A00",
          "primary-light": "#B4ED59",
          secondary: "#03DAC6",
          "secondary-darken-1": "#018786",
          grey: "#F5F5F5",
          "dark-grey": "#414958",
          black: "#1F242E",
          white: "#FFFFFF",
          error: "#e60000",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
    },
  },
});
