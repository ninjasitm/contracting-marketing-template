import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer transition-all duration-300
  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:dark:ring-offset-gray-50 focus:dark:ring-gray-400 focus:ring-gray-600/[0.6] focus:ring-offset-gray-800/[0.6]
  flex items-center justify-center font-semibold
  hover:scale-[1.02] hover:opacity-90`,
  {
    variants: {
      uppercase: {
        true: 'uppercase',
        false: '',
      },
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        none: 'hover:opacity-80 hover:scale-[105%] transform duration-300',
        primary:
          'text-white bg-primary-500 hover:bg-primary-400 border-primary-500',
        danger: 'text-white bg-red-500 hover:bg-red-400 border-red-500',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        xxl: 'h-16 px-8 lg:px-16 text-xl',
        xl: 'h-14 px-6 lg:px-12 text-lg',
        lg: 'h-12 px-4 lg:px-10 text-md',
        md: 'h-10 px-3 text-base',
        xs: 'h-6 px-1 text-xs',
        icon: 'h-9 w-9',
      },
      rounded: {
        true: 'rounded-full',
        full: 'rounded-full',
        false: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        '4xl': 'rounded-4xl',
        '5xl': 'rounded-5xl',
      },
      shadow: {
        true: 'shadow-lg hover:shadow-xl',
        false: '',
        sm: 'shadow-sm hover:shadow-md',
        md: 'shadow-md hover:shadow-lg',
        lg: 'shadow-lg hover:shadow-xl',
        xl: 'shadow-xl hover:shadow-2xl',
        '2xl': 'shadow-2xl hover:shadow-3xl',
        '3xl': 'shadow-3xl hover:shadow-4xl',
        '4xl': 'shadow-4xl hover:shadow-5xl',
        '5xl': 'shadow-5xl hover:shadow-6xl',
      },
      as: {
        button: 'button',
        a: 'a',
        link: 'a',
        div: 'div',
        span: 'span',
        default: 'button',
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
        rounded: 'md',
        shadow: 'md',
        uppercase: false,
        as: 'default',
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
