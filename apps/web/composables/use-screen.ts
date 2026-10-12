import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';

export const useScreen = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const isMobile = computed(() => breakpoints.smaller('md').value);
  const isTablet = computed(() => breakpoints.between('md', 'lg').value);
  const isDesktop = computed(() => breakpoints.greater('lg').value);

  return {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl'],
    isMobile,
    isTablet,
    isDesktop,
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
