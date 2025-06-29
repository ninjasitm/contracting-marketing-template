declare module 'vue-typewriter-effect' {
  import type { DefineComponent } from 'vue';

  // Define the component props for VueTypewriterEffect
  export interface VueTypewriterEffectProps {
    strings?: string[];
    speed?: number;
    delay?: number;
    loop?: boolean;
    showCursor?: boolean;
    cursorChar?: string;
    autoStart?: boolean;
    pauseFor?: number;
    deleteSpeed?: number;
    deleteAll?: boolean;
  }

  const VueTypewriterEffect: DefineComponent<VueTypewriterEffectProps>;
  export default VueTypewriterEffect;
}
