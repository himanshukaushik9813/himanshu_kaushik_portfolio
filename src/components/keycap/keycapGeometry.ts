/**
 * Procedural keycap geometry (plan §6.4 / asset table): a rounded, tapered key with a filleted top edge
 * and a slightly dished top, built ring by ring. Pure data (no Three.js import) so it is unit-testable;
 * keycapScene turns it into a BufferGeometry with two groups: 0 = sides, 1 = top (legend).
 */
export interface KeycapDims {
  width: number // base width (x)
  depth: number // base depth (z)
  height: number // total height (y)
  taper: number // top/bottom size ratio of the vertical part
  baseRadius: number
  topRadius: number
  fillet: number // radius of the rounded top edge
  dish: number // how far the centre of the top sinks
}

export const DEFAULT_DIMS: KeycapDims = {
  width: 1.85, depth: 0.92, height: 0.44, taper: 0.86, baseRadius: 0.17, topRadius: 0.13, fillet: 0.075, dish: 0.03,
}

export interface KeycapGeometryData {
  position: Float32Array
  uv: Float32Array
  index: Uint32Array
  groups: { start: number; count: number; materialIndex: number }[]
  top: { width: number; depth: number; y: number }
}

const SEG = 8 // segments per corner
const N = 4 * (SEG + 1) // points per ring

function ring(w: number, d: number, r: number): [number, number][] {
  const pts: [number, number][] = []
  const rr = Math.max(0.0005, Math.min(r, w / 2, d / 2))
  const cx = w / 2 - rr
  const cz = d / 2 - rr
  const centres: [number, number][] = [[cx, cz], [-cx, cz], [-cx, -cz], [cx, -cz]]
  for (let c = 0; c < 4; c++) {
    for (let i = 0; i <= SEG; i++) {
      const a = (c + i / SEG) * (Math.PI / 2)
      pts.push([centres[c]![0] + rr * Math.cos(a), centres[c]![1] + rr * Math.sin(a)])
    }
  }
  return pts
}

export function buildKeycapGeometry(dims: KeycapDims = DEFAULT_DIMS): KeycapGeometryData {
  const { width: W, depth: D, height: H, taper, baseRadius, topRadius, fillet: f, dish } = dims
  const sideTop = H - f
  const Wt = W * taper
  const Dt = D * taper
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const rings: number[] = [] // start index of each ring

  const pushRing = (w: number, d: number, r: number, y: number, uvTop: { w: number; d: number } | null) => {
    rings.push(positions.length / 3)
    const pts = ring(w, d, r)
    pts.forEach(([x, z], i) => {
      positions.push(x, y, z)
      if (uvTop) uvs.push(x / uvTop.w + 0.5, 0.5 - z / uvTop.d)
      else uvs.push(i / N, y / H)
    })
  }
  const bridge = (a: number, b: number) => {
    for (let i = 0; i < N; i++) {
      const i2 = (i + 1) % N
      indices.push(a + i, b + i, b + i2, a + i, b + i2, a + i2)
    }
  }

  // Sides: straight tapered wall, then the fillet curling inwards to horizontal.
  const S = 6
  for (let s = 0; s <= S; s++) {
    const t = s / S
    pushRing(W + (Wt - W) * t, D + (Dt - D) * t, baseRadius + (topRadius - baseRadius) * t, sideTop * t, null)
  }
  const F = 6
  for (let j = 1; j <= F; j++) {
    const phi = (j / F) * (Math.PI / 2)
    const inset = f * (1 - Math.cos(phi))
    pushRing(Wt - 2 * inset, Dt - 2 * inset, topRadius - inset * 0.6, sideTop + f * Math.sin(phi), null)
  }
  const sideStart = 0
  for (let k = 0; k < rings.length - 1; k++) bridge(rings[k]!, rings[k + 1]!)
  const sideCount = indices.length

  // Top: concentric rings to a centre vertex, dished.
  const Wtop = Wt - 2 * f
  const Dtop = Dt - 2 * f
  const topR = topRadius - f * 0.6
  const uvTop = { w: Wtop, d: Dtop }
  const firstTop = rings.length
  const K = 10
  for (let k = 0; k < K; k++) {
    const s = 1 - k / K
    pushRing(Wtop * s, Dtop * s, topR * s, H - dish * (1 - s * s), uvTop)
  }
  for (let k = firstTop; k < rings.length - 1; k++) bridge(rings[k]!, rings[k + 1]!)
  const centre = positions.length / 3
  positions.push(0, H - dish, 0)
  uvs.push(0.5, 0.5)
  const last = rings[rings.length - 1]!
  for (let i = 0; i < N; i++) indices.push(last + i, centre, last + ((i + 1) % N))
  const topCount = indices.length - sideCount

  return {
    position: new Float32Array(positions),
    uv: new Float32Array(uvs),
    index: new Uint32Array(indices),
    groups: [
      { start: sideStart, count: sideCount, materialIndex: 0 },
      { start: sideCount, count: topCount, materialIndex: 1 },
    ],
    top: { width: Wtop, depth: Dtop, y: H },
  }
}
