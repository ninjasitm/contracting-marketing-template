import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-29',
  ssr: false,

  // app config
  app: {
    // global transition
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // typescripts
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Simplified server configuration
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
    // SEO - must be first
    '@nuxtjs/seo',
    // styling
    '@nuxtjs/tailwindcss',
    'nuxt-headlessui',
    'nuxt-icon',
    // theme
    '@nuxtjs/color-mode',
    // management
    '@nuxt/fonts',
    '@pinia/nuxt',
    // utilities
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxt/image',
    'nuxt-svgo-loader',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'shadcn-nuxt',
  ],

  // site config for SEO
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: 'Contracting Marketing Template',
    description: 'Professional marketing website for contracting companies',
    defaultLocale: 'en',
  },

  // SEO module configuration
  robots: {
    // Allow all bots in production, disallow in other environments
    disallow: process.env.NODE_ENV !== 'production' ? ['/'] : [],
  },

  sitemap: {
    // Automatically generate sitemap from routes and content
    strictNuxtContentPaths: true,
  },

  ogImage: {
    enabled: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Contracting Marketing Template',
    },
  },

  // shadcn configuration
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  image: {},

  css: ['./assets/scss/_variables.scss', './assets/scss/app.scss'],

  components: [
    {
      prefix: 'Layout',
      path: './components/layouts',
      global: true,
    },
    {
      prefix: 'Ui',
      path: './components/ui',
      global: true,
    },
    {
      prefix: 'App',
      path: './components/app',
      global: true,
    },
  ],

  imports: {
    dirs: ['./stores'],
  },

  alias: {
    '@content': fileURLToPath(new URL('./content', import.meta.url)),
  },

  // module::pinia
  pinia: {
    storesDirs: ['./stores/**'],
  },

  // module::headlessui
  headlessui: {
    prefix: 'Headless',
  },

  // module::color-mode
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // module::tailwindcss
  tailwindcss: {
    configPath: './tailwind.config.ts',
    exposeConfig: {
      level: 3,
    },
    viewer: true,
    cssPath: './assets/scss/tailwind.css',
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
