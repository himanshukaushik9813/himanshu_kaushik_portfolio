import { describe, expect, it } from 'vitest'
import { buildWavePaths, centreOffset } from '@/sections/build/waveBuilder'

describe("Let's build wave geometry (A10)", () => {
  const slides = [{ left: 0, width: 400 }, { left: 700, width: 200 }, { left: 1200, width: 500 }]
  it('one connector per gap, starting after a word and ending before the next', () => {
    const d = buildWavePaths(slides, 100, 200)
    expect(d).toHaveLength(2)
    const nums = (s: string) => s.match(/-?\d+(\.\d+)?/g)!.map(Number)
    const a = nums(d[0]!)
    expect(a[0]).toBeGreaterThan(400)
    expect(a[6]).toBeLessThan(700)
  })
  it('alternates a dip then a hump', () => {
    const [first, second] = buildWavePaths(slides, 100, 200).map((s) => s.match(/-?\d+(\.\d+)?/g)!.map(Number))
    expect(first![3]).toBeGreaterThan(100) // control point below the centre line → dip
    expect(second![3]).toBeLessThan(100) // above → hump
  })
  it('centreOffset puts a slide in the middle of the window', () => {
    expect(centreOffset({ left: 700, width: 200 }, 1000)).toBe(-300)
  })
})
