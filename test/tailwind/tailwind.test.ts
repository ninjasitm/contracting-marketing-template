/**
 * Tailwind configuration test
 *
 * This test ensures that the Tailwind configuration is properly loaded
 * and that the expected theme values are defined.
 */

import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../tailwind.config';

describe('Tailwind Configuration', () => {
  // Test that the configuration loads
  it('should load the Tailwind configuration', () => {
    expect(tailwindConfig).toBeDefined();
  });

  // Test that the theme is properly defined
  it('should have a properly defined theme', () => {
    expect(tailwindConfig.theme).toBeDefined();
  });

  // Test the color system
  it('should have primary, secondary, and other semantic color definitions', () => {
    const colors = tailwindConfig.theme?.extend?.colors;

    expect(colors).toBeDefined();
    expect(colors?.primary).toBeDefined();
    expect(colors?.secondary).toBeDefined();
    expect(colors?.success).toBeDefined();
    expect(colors?.error).toBeDefined();
    expect(colors?.warning).toBeDefined();
    expect(colors?.info).toBeDefined();
  });

  // Test custom screen sizes
  it('should have custom screen breakpoints defined', () => {
    const screens = tailwindConfig.theme?.screens;

    expect(screens).toBeDefined();
    expect(screens?.xs).toBeDefined();
    expect(screens?.['3xl']).toBeDefined();
  });

  // Test font family definitions
  it('should have custom font families defined', () => {
    const fontFamily = tailwindConfig.theme?.extend?.fontFamily;

    expect(fontFamily).toBeDefined();
    expect(fontFamily?.sans).toContain('Manrope');
    expect(fontFamily?.heading).toContain('Sora');
    expect(fontFamily?.mono).toContain('JetBrains Mono');
  });

  // Test that dark mode is configured properly
  it('should have dark mode configured correctly', () => {
    expect(tailwindConfig.darkMode).toBe('class');
  });

  // Test that plugins are defined
  it('should have plugins defined', () => {
    expect(tailwindConfig.plugins).toBeDefined();
    expect(Array.isArray(tailwindConfig.plugins)).toBe(true);
    expect(tailwindConfig.plugins?.length).toBeGreaterThan(0);
  });
});
