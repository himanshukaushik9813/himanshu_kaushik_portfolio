/**
 * Legend textures drawn at runtime on 2D canvases (plan §6.4): the visible legend (accent icon + ink label)
 * and an emissive mask (legend only, white on black) so the legend can glow accent on press.
 */
export type Legend = 'enter' | 'backspace'

// Icon outlines (24×24 viewBox, stroke-drawn). Lucide-style shapes, drawn by our own code.
const ICONS: Record<Legend, string[]> = {
  enter: ['M20 4v7a4 4 0 0 1-4 4H4', 'M9 10l-5 5 5 5'],
  backspace: ['M19 12H5', 'M12 19l-7-7 7-7'],
}
const LABELS: Record<Legend, string> = { enter: 'ENTER', backspace: 'BACKSPACE' }

export interface LegendCanvases { map: HTMLCanvasElement; emissive: HTMLCanvasElement }

export function drawLegend(legend: Legend, aspect: number, opts: { paper: string; ink: string; accent: string; font: string }): LegendCanvases {
  const w = 1024
  const h = Math.round(w / aspect)
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const map = make()
  const emissive = make()
  const draw = (ctx: CanvasRenderingContext2D, bg: string, ink: string, icon: string) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    const label = LABELS[legend]
    const fontPx = Math.round(h * (legend === 'enter' ? 0.3 : 0.22))
    ctx.font = `700 ${fontPx}px ${opts.font}`
    const spacing = fontPx * 0.08
    const chars = [...label]
    const textW = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1)
    const iconSize = fontPx * 1.15
    const gap = fontPx * 0.45
    const total = iconSize + gap + textW
    let x = (w - total) / 2
    const cy = h * 0.5
    // icon
    ctx.save()
    ctx.translate(x, cy - iconSize / 2)
    ctx.scale(iconSize / 24, iconSize / 24)
    ctx.strokeStyle = icon
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const d of ICONS[legend]) ctx.stroke(new Path2D(d))
    ctx.restore()
    x += iconSize + gap
    // label, manual letter-spacing (works in every canvas implementation)
    ctx.fillStyle = ink
    ctx.textBaseline = 'middle'
    for (const ch of chars) {
      ctx.fillText(ch, x, cy + fontPx * 0.04)
      x += ctx.measureText(ch).width + spacing
    }
  }
  // the legend is ink at rest (as in the reference); the accent appears only as the press glow
  draw(map.getContext('2d')!, opts.paper, opts.ink, opts.ink)
  draw(emissive.getContext('2d')!, '#000', '#fff', '#fff')
  return { map, emissive }
}

export function drawShadow(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  // soft rounded-rect blob that fades out well inside the canvas (no hard edge where the plane ends)
  ctx.filter = 'blur(20px)'
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  ctx.beginPath()
  ctx.roundRect(46, 58, 164, 140, 30)
  ctx.fill()
  return c
}
