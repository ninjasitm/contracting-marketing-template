/**
 * Tailwind CSS configuration file
 *
 * This configuration extends the default Tailwind setup with custom colors,
 * fonts, and other theme settings specific to the marketing site template.
 *
 * @see https://tailwindcss.com/docs/configuration
 * @see https://tailwindcss.nuxtjs.org/tailwindcss/configuration
 */

import { resolve as _resolve } from 'path';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

/**
 * Custom theme colors
 * Extended to provide a consistent color scheme across the site
 */
const MyTheme = {
  colors: {
    green: {
      DEFAULT: '#3BA676',
      '50': '#B4E4CF',
      '100': '#A5DFC5',
      '200': '#87D4B2',
      '300': '#69CA9E',
      '400': '#4BBF8B',
      '500': '#3BA676',
      '600': '#2C7D59',
      '700': '#1E533B',
      '800': '#0F2A1E',
      '900': '#000000',
    },
    blue: {
      DEFAULT: '#158AD0',
      '50': '#B8E2FF',
      '100': '#A3D9FF',
      '200': '#7AC8FF',
      '300': '#52B8FF',
      '400': '#29A7FF',
      '500': '#0096FF',
      '600': '#0075C7',
      '700': '#00548F',
      '800': '#003357',
      '900': '#00121F',
    },
    red: {
      DEFAULT: '#FF6464',
      '50': '#FFFFFF',
      '100': '#FFFFFF',
      '200': '#FFDEDE',
      '300': '#FFB6B6',
      '400': '#FF8D8D',
      '500': '#FF6464',
      '600': '#FF2C2C',
      '700': '#F30000',
      '800': '#BB0000',
      '900': '#830000',
    },
    grey: {
      DEFAULT: '#64748B',
      '50': '#F8FAFC',
      '100': '#F1F5F9',
      '200': '#E2E8F0',
      '300': '#CBD5E1',
      '400': '#94A3B8',
      '500': '#64748B',
      '600': '#475569',
      '700': '#334155',
      '800': '#1E293B',
      '900': '#0F172A',
      '950': '#020617',
    },
  },
};

/**
 * Tailwind Configuration
 */
export default <Partial<Config>>{
  // Dark mode can be toggled with the class strategy
  darkMode: 'class',

  // Paths to all files containing Tailwind class names
  content: [
    './app/pages/**/*.{vue,js,ts}',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/utils/**/*.{js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './App.{js,ts,vue}',
    './app.{js,ts,vue}',
    './Error.{js,ts,vue}',
    './error.{js,ts,vue}',
  ],

  // Theme customization
  theme: {
    // Container sizing
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },

    // Screen breakpoints
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
      '3xl': '1920px',
    },

    // Extend default theme
    extend: {
      maxWidth: {
        '8xl': '90rem',
        '9xl': '105rem',
        '10xl': '120rem',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Color palette
      colors: {
        primary: MyTheme.colors.blue,
        secondary: MyTheme.colors.green,
        success: MyTheme.colors.green,
        warning: colors.amber,
        error: MyTheme.colors.red,
        info: colors.sky,

        // Theme colors
        green: MyTheme.colors.green,
        blue: MyTheme.colors.blue,
        red: MyTheme.colors.red,
        slate: colors.slate,
        grey: MyTheme.colors.grey,

        // Dark mode background colors
        dark: {
          bg: {
            primary: '#121212',
            secondary: '#1E1E1E',
            tertiary: '#2D2D2D',
          },
        },
      },

      // Typography
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Montserrat', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.75rem' }],
      },

      // Animations
      animation: {
        'loop-scroll': 'loop-scroll 50s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'scale-out': 'scale-out 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-out-right': 'slide-out-right 0.5s ease-out',
      },
      keyframes: {
        'loop-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },

      // Border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },

      // Spacing
      spacing: {
        '18': '4.5rem', // 72px
        '68': '17rem', // 272px
        '84': '21rem', // 336px
        '88': '22rem', // 352px
        '92': '23rem', // 368px
        '100': '25rem', // 400px
        '104': '26rem', // 416px
        '108': '27rem', // 432px
        '112': '28rem', // 448px
        '120': '30rem', // 480px
        '128': '32rem', // 512px
        '136': '34rem', // 544px
        '144': '36rem', // 576px
      },

      // Box shadows
      boxShadow: {
        'inner-md':
          'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'inner-lg':
          'inset 0 10px 15px -3px rgba(0, 0, 0, 0.1), inset 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },

  // Plugins for additional functionality
  plugins: [
    plugin(function ({ addBase, theme }) {
      // Apply basic styles to html and body elements
      addBase({
        html: {
          fontSize: '16px',
          scrollBehavior: 'smooth',
        },
        body: {
          fontFamily: theme('fontFamily.sans'),
          color: theme('colors.grey.800'),
          backgroundColor: theme('colors.white'),
          transition: 'background-color 0.3s ease',
        },
        // Dark mode styles
        '.dark body': {
          color: theme('colors.grey.200'),
          backgroundColor: theme('colors.dark.bg.primary'),
        },
      });
    }),

    // Common utility classes
    plugin(function ({ addUtilities }) {
      const utilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-md': {
          textShadow:
            '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-lg': {
          textShadow:
            '0 15px 30px rgba(0, 0, 0, 0.11), 0 5px 15px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.flex-center': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        '.flex-between': {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        '.absolute-center': {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      };
      addUtilities(utilities);
    }),
  ],

  // Configure any JIT mode options if needed
  future: {
    hoverOnlyWhenSupported: true,
  },

  // Configure dark class strategy
  safelist: [
    'dark',
    {
      pattern:
        /bg-(primary|secondary|success|error|warning|info)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
};
