/** Thin diagonal arrow used across the site (↗ / ↘ / ↓). Drawn, not a font glyph, for consistent weight. */
export function Arrow({ dir = 'up-right', size = 14, stroke = 1.4 }: { dir?: 'up-right' | 'down-right' | 'down' | 'left'; size?: number; stroke?: number }) {
  const d = {
    'up-right': 'M5 19L19 5M8 5h11v11',
    'down-right': 'M5 5l14 14M19 8v11H8',
    down: 'M12 4v16M5 13l7 7 7-7',
    left: 'M20 12H4M11 5l-7 7 7 7',
  }[dir]
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" aria-hidden="true" style={{ flex: 'none' }}>
      <path d={d} />
    </svg>
  )
}
