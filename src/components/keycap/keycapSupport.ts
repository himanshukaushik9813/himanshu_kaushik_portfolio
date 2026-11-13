import { prefersReducedMotion } from '@/motion/useReducedMotion'

/**
 * Whether to load the WebGL keycap at all (plan §8 "Lite" + R3). Kept out of the Three.js chunk.
 * Lite = reduced motion, Save-Data, or ≤2 GB device memory: the DOM keycap stays.
 */
export function shouldUseWebGL(): boolean {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return false
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
