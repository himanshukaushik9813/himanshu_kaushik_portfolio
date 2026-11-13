import { prefersReducedMotion } from '@/motion/useReducedMotion'

/**
 * Whether to load the WebGL keycap at all (plan §8 "Lite" + R3). Kept out of the Three.js chunk.
 * Lite = reduced motion, Save-Data, ≤2 GB device memory, or no real GPU (software WebGL): the DOM keycap stays.
 */
export function shouldUseWebGL(): boolean {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return false
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return false
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    // Software rasterisers (no real GPU: SwiftShader, llvmpipe…) take seconds to compile the scene's shaders
    // and would block the page; those visitors keep the DOM key.
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (new URLSearchParams(window.location.search).has('webgl')) return true // test/debug override
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)
  } catch {
    return false
  }
}
