/**
 * Connector paths for "Let's build" (A10). One cubic per gap between consecutive words, alternating a dip (∪)
 * and a hump (∩), starting just after the trailing edge of a word and ending just before the next one.
 * Pure geometry so it can be unit-tested and re-run on every ScrollTrigger refresh.
 */
export interface SlideBox { left: number; width: number }

export function buildWavePaths(slides: SlideBox[], centerY: number, fontSize: number): string[] {
  const inset = fontSize * 0.08
  const depth = fontSize * 0.44 // control-point offset; the visible bump is ≈ 0.75 × this
  const out: string[] = []
  for (let i = 0; i < slides.length - 1; i++) {
    const a = slides[i]!
    const b = slides[i + 1]!
    const x1 = a.left + a.width + inset
    const x2 = b.left - inset
    const w = x2 - x1
    const dir = i % 2 === 0 ? 1 : -1
    const y = centerY
    const cy = y + dir * depth
    out.push(`M${r(x1)} ${r(y - dir * fontSize * 0.04)} C${r(x1 + w * 0.28)} ${r(cy)} ${r(x2 - w * 0.28)} ${r(cy)} ${r(x2)} ${r(y - dir * fontSize * 0.05)}`)
  }
  return out
}

/** Track offset that centres slide `i` in a window of width `vw`. */
export function centreOffset(slide: SlideBox, vw: number): number {
  return vw / 2 - (slide.left + slide.width / 2)
}

const r = (n: number) => Math.round(n * 10) / 10
