import { createResolver } from '@nuxt/kit';
import { defineNuxtConfig } from 'nuxt/config';
const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  // exp
  experimental: {
    localLayerAliases: true,
  },

  // app config
  app: {
    // global transition
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // typescripts
  // todo: feat/strict-type-check
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Simplified server configuration for Replit
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
  vite: {
    server: {
      hmr: {
        clientPort: 3000,
      },
    },
  },

  // modules
  modules: [
    // chore
    '@nuxtjs/tailwindcss',
    'nuxt-headlessui',
    'nuxt-icon',
    '@nuxtjs/color-mode', // font management
    '@nuxt/fonts', // management
    '@pinia/nuxt',
    '@vueuse/nuxt', // contents,
    '@nuxt/content',
    '@nuxt/image', // todo: feat/localization
    // '@nuxtjs/i18n'
    'nuxt-svgo-loader',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  image: {},

  css: [
    resolve('./assets/scss/_variables.scss'),
    resolve('./assets/scss/app.scss'),
  ],

  components: [
    {
      prefix: 'Layout',
      path: resolve('./components/layouts'),
      global: true,
    },
    {
      prefix: 'Awesome',
      path: resolve('./components/awesome'),
      global: true,
    },
  ],

  imports: {
    dirs: [resolve('./stores'), '~/stores'],
  },

  alias: {
    '@': resolve('./'),
    '~': resolve('./'),
  },

  // module::pinia
  pinia: {
    storesDirs: ['~/stores/**', '#/stores/**', '@/stores/**'],
  },

  // module::headlessui
  headlessui: {
    prefix: 'Headless',
  },

  // module::color-mode
  colorMode: {
    classSuffix: '',
    preference: 'light',
  },

  // module::tailwindcss
  tailwindcss: {
    // Path to the tailwind.config file
    configPath: '~/tailwind.config.ts',
    // Add custom classes before each dev build
    exposeConfig: {
      level: 3, // Show all levels of config
    },
    // Add utility classes to the viewer
    viewer: true,
    // Provide custom CSS file to be imported in the `:root` selector
    cssPath: '~/assets/scss/tailwind.css',
    // config is not needed here, handled in tailwind.config.ts
  },

  content: {
    markdown: {
      mdc: true,
    },
    highlight: {
      theme: 'github-dark',
    },
  },

  // module::fonts
  fonts: {
    // Set default font families
    families: [
      {
        // Primary font used throughout the application
        name: 'Inter',
        // Load multiple weights
        weights: [400, 500, 600, 700],
      },
      {
        // Secondary font for headings
        name: 'Montserrat',
        weights: [500, 600, 700],
      },
    ],
  },

  // module::content
  // todo: feat/localization
  // module::i18n
  // i18n: {
  //   strategy: 'no_prefix',
  //   defaultLocale: 'en',
  //   langDir: 'locales',
  //   vueI18n: {
  //     fallbackLocale: 'en',
  //   },
  //   detectBrowserLanguage: {
  //     useCookie: true,
  //     fallbackLocale: 'en',
  //     redirectOn: 'root',
  //   },
  //   locales: [
  //     {
  //       code: 'en', // English
  //       iso: 'en-US',
  //       name: 'English',
  //       file: 'en.yml',
  //     },
  //     {
  //       code: 'id', // Indonesia
  //       iso: 'id-ID',
  //       name: 'Indonesia',
  //       file: 'id.yml',
  //     }
  //   ]
  // },

  compatibilityDate: '2024-09-01',
});
