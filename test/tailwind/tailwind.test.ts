/**
 * Tailwind configuration test
 *
 * This test ensures that the Tailwind configuration is properly loaded
 * and that the expected theme values are defined.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../apps/web/tailwind.config';
const resolvedConfig = resolveConfig(tailwindConfig as any);

describe('Tailwind Configuration', () => {
  it('compiles the shared card rule when content includes a card candidate', async () => {
    const css = readFileSync('apps/web/assets/scss/tailwind.css', 'utf8');
    const result = await postcss([tailwindcss({
      ...tailwindConfig,
      content: [{ raw: '<div class="card"></div>', extension: 'html' }],
    })]).process(css, { from: undefined });
    expect(result.css).toContain('.card');
    expect(result.css).toContain('30 41 59');
  });
  // Test that the configuration loads
  it('should load the Tailwind configuration', () => {
    expect(resolvedConfig).toBeDefined();
  });

  // Test that the theme is properly defined
  it('should have a properly defined theme', () => {
    expect(resolvedConfig.theme).toBeDefined();
  });

  // Test the color system
  it('should have primary, secondary, and other semantic color definitions', () => {
    const colors = resolvedConfig.theme.colors;
    expect(colors).toBeDefined();
    expect(colors.primary).toBeDefined();
    expect(colors.secondary).toBeDefined();
    expect(colors.success).toBeDefined();
    expect(colors.error).toBeDefined();
    expect(colors.warning).toBeDefined();
    expect(colors.info).toBeDefined();
  });

  // Test custom screen sizes
  it('should have custom screen breakpoints defined', () => {
    const screens = resolvedConfig.theme.screens;
    expect(screens).toBeDefined();
    expect(screens.xs).toBeDefined();
    expect(screens['3xl']).toBeDefined();
  });

  // Test font family definitions
  it('should have custom font families defined', () => {
    const fontFamily = resolvedConfig.theme.fontFamily;
    expect(fontFamily).toBeDefined();
    expect(fontFamily.sans).toContain('Inter');
    expect(fontFamily.heading).toContain('Montserrat');
    expect(fontFamily.mono).toContain('JetBrains Mono');
  });

  // Test that dark mode is configured properly
  it('should have dark mode configured correctly', () => {
    expect(resolvedConfig.darkMode).toBe('class');
  });

  // Test that plugins are defined
  it('should have plugins defined', () => {
    expect(tailwindConfig.plugins).toBeDefined();
    expect(Array.isArray(tailwindConfig.plugins)).toBe(true);
  });
});
