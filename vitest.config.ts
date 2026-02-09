/**
 * Vitest Configuration
 *
 * This configuration sets up the testing environment for the marketing template
 * with proper handling of TypeScript and Vue files.
 *
 * @see https://vitest.dev/config/
 */

import { resolve } from 'path';
import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  // Test configuration
  test: {
    // Enable global test environment setup
    globals: true,

    // Default to jsdom; server tests can opt into node via file directive
    environment: 'jsdom',

    // Exclude certain files/directories from testing
    exclude: ['node_modules', 'dist', '.nuxt', 'coverage'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/tests/**',
        'prisma/**',
        '.nuxt/**',
      ],
    },
    environmentOptions: {
      nuxt: {
        mock: {
          intersectionObserver: true,
          indexedDb: true,
        },
      },
    },
  },

  // Resolve aliases to match Nuxt configuration
  resolve: {
    alias: [
      {
        find: /^#app\/composables\/error$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-error.ts'),
      },
      {
        find: /^#app\/composables\/router$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-router.ts'),
      },
      {
        find: /^#app\/composables\/head$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-head.ts'),
      },
      {
        find: /^#app\/composables\/ssr$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-ssr.ts'),
      },
      {
        find: /^#app\/nuxt-vitest-app-entry$/,
        replacement: resolve(
          __dirname,
          './test/mocks/nuxt-vitest-app-entry.ts',
        ),
      },
      {
        find: /^nodemailer$/,
        replacement: resolve(__dirname, './test/mocks/nodemailer.ts'),
      },
      {
        find: /^#app\/config$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-config.ts'),
      },
      {
        find: /^#app\/nuxt$/,
        replacement: resolve(__dirname, './test/mocks/nuxt-app.ts'),
      },
      {
        find: '#app',
        replacement: resolve(__dirname, './test/mocks/nuxt-app.ts'),
      },
      { find: '@', replacement: resolve(__dirname, './') },
      { find: '~', replacement: resolve(__dirname, './') },
    ],
  },
});
