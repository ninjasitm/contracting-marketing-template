/** CMS links: relative paths/anchors and http(s), mailto, tel only. No network-path URLs. */
export function isSafeHref(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) return false;
  // Reject browser-normalized controls and backslashes before URL parsing.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f\\]/.test(value) || value.startsWith('//')) return false;
  try {
    const url = new URL(value, 'https://template.invalid/');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}
