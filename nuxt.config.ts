// https://nuxt.com/docs/api/configuration/nuxt-config

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';

const CollabPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'rgb(253, 244, 245)',
            100: 'rgb(246, 200, 208)',
            200: 'rgb(239, 157, 171);',
            300: 'rgb(232, 114, 134);',
            400: 'rgb(225, 70, 97)',
            500: 'rgb(218, 27, 60)',
            600: 'rgb(185, 23, 51)',
            700: 'rgb(153, 19, 42)',
            800: 'rgb(120, 15, 33)',
            900: 'rgb(87, 11, 24)',
            950: 'rgb(55, 7, 15)'
        },

        surface: {
          50: 'rgb(245, 244, 244)',
          100: 'rgb(207, 202, 203)',
          200: 'rgb(168, 160, 162)',
          300: 'rgb(130, 119, 120);',
          400: 'rgb(91, 77, 79)',
          500: 'rgb(53, 35, 38);',
          600: 'rgb(45, 30, 32)',
          700: 'rgb(37, 25, 27)',
          800: 'rgb(29, 19, 21)',
          900: 'rgb(21, 14, 15);',
          950: 'rgb(13, 9, 10);'
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
    publicAssets: [
      {
        dir: 'public', 
        maxAge: 60,
      },
    ]
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/mixins.scss";`,
        }
      }
    },
    optimizeDeps : {
      exclude: ['vue-countup-v3']
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
              darkModeSelector: '.darkmode',
          }
      }
    },
    components: {
      exclude: ['Form', 'FormField', 'Editor', 'Chart']
    }
  },
  runtimeConfig: {
    dbUrl: process.env.DATABASE_URL, 
  },
  image: {
    domains: [
      'www.why-city.ru'
    ]
  },
})
