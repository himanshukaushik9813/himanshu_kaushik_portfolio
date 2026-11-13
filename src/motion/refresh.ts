import { ScrollTrigger } from './gsap'

/**
 * One batched ScrollTrigger.refresh() after webfonts and critical images are ready
 * (plan risk R4). Pinned scenes must be created in DOM order before this runs.
 */
export async function refreshWhenReady(criticalImages: HTMLImageElement[] = []) {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const images = criticalImages.map((img) =>
    img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
  )
  await Promise.all([fonts, ...images])
  ScrollTrigger.refresh()
}
