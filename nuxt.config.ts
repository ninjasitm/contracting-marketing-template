import { createResolver } from '@nuxt/kit';
import { defineNuxtConfig } from 'nuxt/config';
const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-29',
  ssr: false,
  srcDir: resolve('./'),
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
    // font management
    '@nuxtjs/color-mode',
    // management
    '@nuxt/fonts',
    '@pinia/nuxt',
    // contents,
    '@vueuse/nuxt',
    '@nuxt/content',
    // todo: feat/localization
    '@nuxt/image',
    // '@nuxtjs/i18n'
    'nuxt-svgo-loader',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'shadcn-nuxt',
  ],

  // shadcn configuration
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

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
      prefix: 'Ui',
      path: resolve('./components/ui'),
      global: true,
    },
    {
      prefix: 'App',
      path: resolve('./components/app'),
      global: true,
    },
  ],

  imports: {
    dirs: [resolve('./stores'), '~/stores'],
  },

  alias: {
    '@': resolve('./'),
    '~': resolve('./'),
    '@content': resolve('./content'),
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
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light',
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

  // Nitro server configuration with Cloudflare Workers support
  nitro: {
    preset: 'cloudflare-pages',
    compatibilityDate: '2025-05-13',
    cloudflare: {
      nodeCompat: true,
    },
    rollupConfig: {
      output: {
        format: 'esm',
      },
    },
  },
  runtimeConfig: {
    mail: {
      message: {
        to: process.env.GMAIL_EMAIL_TO || 'info@company.com',
      },
      smtp: {
        service: 'gmail',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        startTls: process.env.SMTP_START_TLS !== 'false',
      },
      auth: {
        user: process.env.GMAIL_APP_USER || 'invalid',
        pass: process.env.GMAIL_APP_PASSWORD || 'invalid',
      },
    },
  },
});
