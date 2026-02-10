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
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
      '3xl': '1920px',
    },
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
      colors: {
        primary: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#158AD0',
          foreground: '#FFFFFF',
        },
        success: MyTheme.colors.green,
        warning: colors.amber,
        error: MyTheme.colors.red,
        info: colors.sky,
        green: MyTheme.colors.green,
        blue: MyTheme.colors.blue,
        red: MyTheme.colors.red,
        slate: colors.slate,
        grey: MyTheme.colors.grey,

        // Enhanced dark mode color system
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A', // grey.900
        },
        foreground: {
          DEFAULT: '#1E293B', // grey.800
          dark: '#F1F5F9', // grey.100
        },

        // Card colors with dark mode support
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
          dark: '#1E293B', // grey.800
          'dark-foreground': '#F1F5F9', // grey.100
        },

        // Popover colors with dark mode support
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
          dark: '#1E293B', // grey.800
          'dark-foreground': '#F1F5F9', // grey.100
        },

        // Muted colors with dark mode support
        muted: {
          DEFAULT: '#F1F5F9', // grey.100
          foreground: '#64748B', // grey.500
          dark: '#334155', // grey.700
          'dark-foreground': '#94A3B8', // grey.400
        },

        // Accent colors with dark mode support
        accent: {
          DEFAULT: '#F1F5F9', // grey.100
          foreground: '#1E293B', // grey.800
          dark: '#334155', // grey.700
          'dark-foreground': '#F1F5F9', // grey.100
        },

        // Destructive colors (same for both modes)
        destructive: {
          DEFAULT: '#FF6464',
          foreground: '#FFFFFF',
        },

        // Border colors with dark mode support
        border: {
          DEFAULT: '#E2E8F0', // grey.200
          dark: '#475569', // grey.600
        },

        // Input colors with dark mode support
        input: {
          DEFAULT: '#E2E8F0', // grey.200
          dark: '#475569', // grey.600
        },

        // Ring colors with dark mode support
        ring: {
          DEFAULT: '#158AD0',
          dark: '#29A7FF', // lighter blue for dark mode
        },

        // Chart colors (consistent across modes)
        chart: {
          '1': '#3BA676', // green.DEFAULT
          '2': '#158AD0', // blue.DEFAULT
          '3': '#FF6464', // red.DEFAULT
          '4': '#FBBF24', // amber.400
          '5': '#64748B', // grey.DEFAULT
        },

        // Additional semantic colors for better dark mode support
        surface: {
          DEFAULT: '#F8FAFC', // grey.50
          dark: '#1E293B', // grey.800
        },
        overlay: {
          DEFAULT: 'rgba(0, 0, 0, 0.5)',
          dark: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Montserrat', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs': [
          '0.65rem',
          {
            lineHeight: '0.75rem',
          },
        ],
      },
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
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(-100%)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'scale-out': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-out-right': {
          '0%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
        '136': '34rem',
        '144': '36rem',
      },
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
      // CSS variables for consistent theming
      addBase({
        ':root': {
          '--background': '0 0% 100%', // white
          '--foreground': '222.2 84% 4.9%', // grey.800
          '--card': '0 0% 100%', // white
          '--card-foreground': '222.2 84% 4.9%', // grey.800
          '--popover': '0 0% 100%', // white
          '--popover-foreground': '222.2 84% 4.9%', // grey.800
          '--primary': '0 0% 0%', // black
          '--primary-foreground': '0 0% 100%', // white
          '--secondary': '199 89% 48%', // blue.DEFAULT
          '--secondary-foreground': '0 0% 100%', // white
          '--muted': '210 40% 96%', // grey.100
          '--muted-foreground': '215.4 16.3% 46.9%', // grey.500
          '--accent': '210 40% 96%', // grey.100
          '--accent-foreground': '222.2 84% 4.9%', // grey.800
          '--destructive': '0 84% 60%', // red.DEFAULT
          '--destructive-foreground': '0 0% 100%', // white
          '--border': '214.3 31.8% 91.4%', // grey.200
          '--input': '214.3 31.8% 91.4%', // grey.200
          '--ring': '199 89% 48%', // blue.DEFAULT
          '--radius': '0.5rem',
          '--chart-1': '152 57% 52%', // green.DEFAULT
          '--chart-2': '199 89% 48%', // blue.DEFAULT
          '--chart-3': '0 84% 60%', // red.DEFAULT
          '--chart-4': '43 96% 56%', // amber.400
          '--chart-5': '215.4 16.3% 46.9%', // grey.DEFAULT
        },
        '.dark': {
          '--background': '222.2 84% 4.9%', // grey.900
          '--foreground': '210 40% 96%', // grey.100
          '--card': '222.2 84% 4.9%', // grey.900
          '--card-foreground': '210 40% 96%', // grey.100
          '--popover': '222.2 84% 4.9%', // grey.900
          '--popover-foreground': '210 40% 96%', // grey.100
          '--primary': '0 0% 100%', // white
          '--primary-foreground': '0 0% 0%', // black
          '--secondary': '199 89% 60%', // lighter blue for dark mode
          '--secondary-foreground': '0 0% 100%', // white
          '--muted': '217.2 32.6% 17.5%', // grey.700
          '--muted-foreground': '215 20.2% 65.1%', // grey.400
          '--accent': '217.2 32.6% 17.5%', // grey.700
          '--accent-foreground': '210 40% 96%', // grey.100
          '--destructive': '0 84% 60%', // red.DEFAULT (same)
          '--destructive-foreground': '0 0% 100%', // white
          '--border': '217.2 32.6% 17.5%', // grey.700
          '--input': '217.2 32.6% 17.5%', // grey.700
          '--ring': '199 89% 60%', // lighter blue for dark mode
        },

        // Apply basic styles to html and body elements
        html: {
          fontSize: '16px',
          scrollBehavior: 'smooth',
        },
        body: {
          fontFamily: theme('fontFamily.sans'),
          color: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          transition: 'background-color 0.3s ease, color 0.3s ease',
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
        // Dark mode utilities
        '.bg-background': {
          backgroundColor: 'hsl(var(--background))',
        },
        '.bg-foreground': {
          backgroundColor: 'hsl(var(--foreground))',
        },
        '.bg-card': {
          backgroundColor: 'hsl(var(--card))',
        },
        '.bg-card-foreground': {
          backgroundColor: 'hsl(var(--card-foreground))',
        },
        '.bg-popover': {
          backgroundColor: 'hsl(var(--popover))',
        },
        '.bg-popover-foreground': {
          backgroundColor: 'hsl(var(--popover-foreground))',
        },
        '.bg-primary': {
          backgroundColor: 'hsl(var(--primary))',
        },
        '.bg-primary-foreground': {
          backgroundColor: 'hsl(var(--primary-foreground))',
        },
        '.bg-secondary': {
          backgroundColor: 'hsl(var(--secondary))',
        },
        '.bg-secondary-foreground': {
          backgroundColor: 'hsl(var(--secondary-foreground))',
        },
        '.bg-muted': {
          backgroundColor: 'hsl(var(--muted))',
        },
        '.bg-muted-foreground': {
          backgroundColor: 'hsl(var(--muted-foreground))',
        },
        '.bg-accent': {
          backgroundColor: 'hsl(var(--accent))',
        },
        '.bg-accent-foreground': {
          backgroundColor: 'hsl(var(--accent-foreground))',
        },
        '.bg-destructive': {
          backgroundColor: 'hsl(var(--destructive))',
        },
        '.bg-destructive-foreground': {
          backgroundColor: 'hsl(var(--destructive-foreground))',
        },
        '.text-background': {
          color: 'hsl(var(--background))',
        },
        '.text-foreground': {
          color: 'hsl(var(--foreground))',
        },
        '.text-card': {
          color: 'hsl(var(--card))',
        },
        '.text-card-foreground': {
          color: 'hsl(var(--card-foreground))',
        },
        '.text-popover': {
          color: 'hsl(var(--popover))',
        },
        '.text-popover-foreground': {
          color: 'hsl(var(--popover-foreground))',
        },
        '.text-primary': {
          color: 'hsl(var(--primary))',
        },
        '.text-primary-foreground': {
          color: 'hsl(var(--primary-foreground))',
        },
        '.text-secondary': {
          color: 'hsl(var(--secondary))',
        },
        '.text-secondary-foreground': {
          color: 'hsl(var(--secondary-foreground))',
        },
        '.text-muted': {
          color: 'hsl(var(--muted))',
        },
        '.text-muted-foreground': {
          color: 'hsl(var(--muted-foreground))',
        },
        '.text-accent': {
          color: 'hsl(var(--accent))',
        },
        '.text-accent-foreground': {
          color: 'hsl(var(--accent-foreground))',
        },
        '.text-destructive': {
          color: 'hsl(var(--destructive))',
        },
        '.text-destructive-foreground': {
          color: 'hsl(var(--destructive-foreground))',
        },
        '.border-border': {
          borderColor: 'hsl(var(--border))',
        },
        '.border-input': {
          borderColor: 'hsl(var(--input))',
        },
        '.ring-ring': {
          '--tw-ring-color': 'hsl(var(--ring))',
        },
      };
      addUtilities(utilities);
    }),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
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
        /bg-(green|blue|red|slate|grey)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
};
