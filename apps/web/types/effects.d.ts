/** Vanta has no bundled types. three and p5 use their installed @types packages. */
declare module 'vanta/dist/vanta.waves.min' {
  interface EffectInstance { destroy(): void; resize?(): void }
  export default function createEffect(options: Record<string, unknown>): EffectInstance;
}
declare module 'vanta/dist/vanta.net.min' {
  export { default } from 'vanta/dist/vanta.waves.min';
}
declare module 'vanta/dist/vanta.dots.min' {
  export { default } from 'vanta/dist/vanta.waves.min';
}
declare module 'vanta/dist/vanta.topology.min' {
  export { default } from 'vanta/dist/vanta.waves.min';
}
