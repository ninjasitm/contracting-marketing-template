import { createResolver } from '@nuxt/kit';
import { defineNuxtConfig } from 'nuxt/config';

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: '2025-05-29',
  ssr: false,
  srcDir: './',
  devtools: { enabled: true },
  experimental: {
    localLayerAliases: true,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
  vite: {
    optimizeDeps: {
      include: ['@jagaad/vue-hubspot-form'],
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-headlessui',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-svgo-loader',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],
  image: {},
  dir: {
    pages: 'app/pages',
  },
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
      extensions: ['vue'],
      global: true,
    },
    {
      prefix: 'App',
      path: resolve('./components/app'),
      global: true,
    },
  ],
  imports: {
    dirs: [resolve('./stores'), resolve('./app/stores')],
  },
  alias: {
    '@': resolve('./'),
    '~': resolve('./'),
    '@content': resolve('./content'),
  },
  pinia: {
    storesDirs: [resolve('./stores/**'), resolve('./app/stores/**')],
  },
  headlessui: {
    prefix: 'Headless',
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    exposeConfig: {
      level: 3,
    },
    viewer: true,
    cssPath: '~/assets/scss/tailwind.css',
  },
  content: {
    markdown: {
      mdc: true,
    },
    highlight: {
      theme: 'github-dark',
    },
  },
  fonts: {
    families: [
      {
        name: 'Inter',
        weights: [400, 500, 600, 700],
      },
      {
        name: 'Montserrat',
        weights: [500, 600, 700],
      },
    ],
  },
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
      provider: process.env.EMAIL_PROVIDER || 'mailchannels',
      apiKey: process.env.EMAIL_API_KEY || '',
      message: {
        to:
          process.env.CONTACT_EMAIL_TO ||
          process.env.GMAIL_EMAIL_TO ||
          'info@company.com',
      },
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
      },
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_APP_USER || '',
        pass: process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '',
      },
      mailgun: {
        domain: process.env.MAILGUN_DOMAIN || '',
        region: process.env.MAILGUN_REGION || 'us',
      },
    },
  },
});
