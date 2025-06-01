// https://nuxt.com/docs/api/configuration/nuxt-config

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';

const CollabPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{purple.50}',
            100: '{purple.100}',
            200: '{purple.200}',
            300: '{purple.300}',
            400: '{purple.400}',
            500: '{purple.500}',
            600: '{purple.600}',
            700: '{purple.700}',
            800: '{purple.800}',
            900: '{purple.900}',
            950: '{purple.950}'
        }
    }
});

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },
  app: {
    head: {
      charset: "utf-8",
      title: "WHY CITY",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      htmlAttrs: {
        lang: "ru",
      },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: [
    "@/assets/scss/bundle.scss",
    "primeicons/primeicons.css",
  ],

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@primevue/nuxt-module',
  ],

  nitro: {
    experimental: {
      websocket: true,
    },
    replace: {
      'import * as process': 'import * as processUnused',
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/mixins.scss";`,
          noExternal: ['vue-countup-v3']
        }
      }
    }
  },

  build: {
    transpile: ['vue-countup-v3'],
  },

  primevue: {
    options: {
      theme: {
          preset: CollabPreset,
          options: {
              darkModeSelector: false || 'none',
          }
      }
    },
    components: {
      exclude: ['Form', 'FormField', 'Editor', 'Chart']
    }
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: false }
})
