import withNuxt from './app/.nuxt/eslint.config.mjs';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default withNuxt(
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ["**/*.vue"],
    plugins: {
      vue: pluginVue
    },
    rules: {
      'vue/multi-word-component-names': 'off', // allow single word component names
      "@typescript-eslint/no-floating-promises": "error", // disallow floating promises
      'vue/no-v-html': 'off', // allow v-html directive
      'vue/no-unused-vars': 'off', // allow unused variables in Vue files
      'vue/no-unused-components': 'off', // allow unused components in Vue files
      'vue/require-default-prop': 'off', // allow default prop in Vue files
      'vue/require-prop-types': 'off', // allow prop types in Vue files
      'vue/valid-v-slot': 'off', // allow valid v-slot directive
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './app/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        globals: {
          ...globals['shared-node-browser']
        }
      },
    },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/coverage/**',
      '**/public/**',
      '**/out/**',
      '**/.output/**',
      '**/components.d.ts',
      '**/nuxt.d.ts',
      '**/.vercel/**',
      '**/prisma/client/**'
    ]
  },
  // your custom flat configs go here, for example:
  {
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './app/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: ['**/*.ts'],
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "semi": "error", // enforce semicolon at the end of statements
      "@typescript-eslint/no-floating-promises": "error", // disallow floating promises
      'no-console': 'off', // allow console.log in TypeScript files
      '@typescript-eslint/no-explicit-any': 'off', // allow any type in TypeScript files
      'vue/multi-word-component-names': 'off', // allow single word component names
      "@typescript-eslint/no-unused-vars": "off", // allow unused variables in TypeScript files
      '@typescript-eslint/no-unused-expressions': 'off', // allow unused expressions in TypeScript files
      "no-unused-vars": "off", // allow unused variables in TypeScript files
      "require-await": "error"
    },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/coverage/**',
      '**/public/**',
      '**/out/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/prisma/client/**',
      '**/src/tests/**'
    ]
  },
  // {
  //   ...
  // }
);
