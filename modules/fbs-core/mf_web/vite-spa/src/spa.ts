import { h, createApp } from 'vue';
import singleSpaVue from 'single-spa-vue';
import vuetify from './plugins/vuetify';
import App from './App.vue';

const vueLifecycles = singleSpaVue({
    createApp,
    appOptions: {
        render() {
            return h(App, {
                name: this.name,
            });
        },
    },
    handleInstance: (app) => {
        app.use(vuetify);
    }
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
