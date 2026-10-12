import { describe, expect, it } from 'vitest';
import { isSafeHref } from '../../apps/web/utils/safe-link';

describe('CMS destinations', () => {
  it('accepts internal links and explicit supported schemes', () => {
    for (const href of ['/work/example', 'work/example', './detail', '../detail', '#contact', '?page=2', 'https://example.com', 'http://example.com', 'mailto:hello@example.com', 'tel:+15551234567']) {
      expect(isSafeHref(href), href).toBe(true);
    }
  });
  it('rejects executable, network-path and browser-normalized schemes', () => {
    for (const href of [undefined, null, 42, '', ' ', ' javascript:alert(1)', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<script>', 'vbscript:msgbox(1)', '//example.com', '/\\example.com', '\\example.com', 'https://example.com\u0000']) {
      expect(isSafeHref(href), String(href)).toBe(false);
    }
  });
});
