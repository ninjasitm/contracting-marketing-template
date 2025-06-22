import { useBreakpoints } from '@vueuse/core';

export const useScreen = () => {
  const breakpoints = useBreakpoints({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  });

  return {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl'],
    greater: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') =>
      breakpoints.greater(breakpoint),
    smaller: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') =>
      breakpoints.smaller(breakpoint),
    between: (
      a: 'sm' | 'md' | 'lg' | 'xl' | '2xl',
      b: 'sm' | 'md' | 'lg' | 'xl' | '2xl',
    ) => breakpoints.between(a, b),
  };
};
