import { describe, expect, it } from 'vitest'
import { buildKeycapGeometry, DEFAULT_DIMS } from '@/components/keycap/keycapGeometry'

describe('procedural keycap geometry (A20)', () => {
  const g = buildKeycapGeometry()
  it('has two groups (sides, top) covering every index', () => {
    expect(g.groups.map((x) => x.materialIndex)).toEqual([0, 1])
    expect(g.groups[0]!.count + g.groups[1]!.count).toBe(g.index.length)
    expect(g.index.length % 3).toBe(0)
  })
  it('stays light: under 2k triangles', () => {
    expect(g.index.length / 3).toBeLessThan(2000)
  })
  it('is tapered, filleted and dished within its box', () => {
    const ys: number[] = []
    const xs: number[] = []
    for (let i = 0; i < g.position.length; i += 3) { xs.push(g.position[i]!); ys.push(g.position[i + 1]!) }
    expect(Math.min(...ys)).toBeCloseTo(0)
    expect(Math.max(...ys)).toBeCloseTo(DEFAULT_DIMS.height)
    expect(Math.max(...xs)).toBeCloseTo(DEFAULT_DIMS.width / 2, 3)
    expect(g.top.width).toBeLessThan(DEFAULT_DIMS.width * DEFAULT_DIMS.taper)
    const centreY = g.position[g.position.length - 2]!
    expect(centreY).toBeCloseTo(DEFAULT_DIMS.height - DEFAULT_DIMS.dish)
  })
  it('side faces point outwards and top faces point up', () => {
    const v = (i: number) => [g.position[i * 3]!, g.position[i * 3 + 1]!, g.position[i * 3 + 2]!] as const
    const normal = (t: number) => {
      const [a, b, c] = [v(g.index[t]!), v(g.index[t + 1]!), v(g.index[t + 2]!)]
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      return { n: [u[1]! * w[2]! - u[2]! * w[1]!, u[2]! * w[0]! - u[0]! * w[2]!, u[0]! * w[1]! - u[1]! * w[0]!], a }
    }
    // first side triangle (at +x): normal has +x
    const s = normal(0)
    expect(Math.sign(s.n[0]!)).toBe(Math.sign(s.a[0]))
    // every top triangle faces up
    const top = g.groups[1]!
    for (let t = top.start; t < top.start + top.count; t += 3) expect(normal(t).n[1]).toBeGreaterThan(-1e-9)
  })
  it('top UVs stay inside the legend texture', () => {
    const top = g.groups[1]!
    const used = new Set<number>()
    for (let t = top.start; t < top.start + top.count; t++) used.add(g.index[t]!)
    for (const i of used) {
      expect(g.uv[i * 2]!).toBeGreaterThanOrEqual(-1e-6)
      expect(g.uv[i * 2]!).toBeLessThanOrEqual(1 + 1e-6)
      expect(g.uv[i * 2 + 1]!).toBeGreaterThanOrEqual(-1e-6)
      expect(g.uv[i * 2 + 1]!).toBeLessThanOrEqual(1 + 1e-6)
    }
  })
})
