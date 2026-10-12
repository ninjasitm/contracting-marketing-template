export type BackgroundEffectName = 'none' | 'waves' | 'net' | 'dots' | 'topology';
export type BackgroundEffectOptions = Record<string, string | number | boolean | undefined>;
export interface BackgroundEffectInstance { destroy(): void; resize?(): void }
