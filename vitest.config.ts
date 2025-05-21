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
import Vue from '@vitejs/plugin-vue';

export default defineVitestConfig({
  // Plugins for Vue support
  plugins: [Vue()],

  // Test configuration
  test: {
    // Enable global test environment setup
    globals: true,

    // Mock browser environment
    environment: 'jsdom',

    // Exclude certain files/directories from testing
    exclude: ['node_modules', 'dist', '.nuxt', 'coverage'],

    // Include specific file patterns for testing
    include: ['./test/**/*.{test,spec}.{js,ts}'],

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
    alias: {
      '@': resolve(__dirname, './'),
      '~': resolve(__dirname, './'),
      '#app': resolve(__dirname, 'node_modules/nuxt/dist/app'),
    },
  },
});
