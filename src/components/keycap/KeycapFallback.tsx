import { CornerDownLeft, MoveLeft } from 'lucide-react'

/**
 * DOM/CSS keycap: the baseline for no-WebGL and reduced-motion (plan R3), and the
 * instant placeholder before the lazy Three.js scene mounts (Phase 6).
 */
export function KeycapFallback({ legend }: { legend: 'enter' | 'backspace' }) {
  const Icon = legend === 'enter' ? CornerDownLeft : MoveLeft
  return (
    <span className="keycap-fallback" aria-hidden="true">
      <span className="keycap-fallback__shadow" />
      <span className="keycap-fallback__cap">
        <span className="keycap-fallback__skirt" />
        <span className="keycap-fallback__top">
          <Icon className="keycap-fallback__icon" strokeWidth={2.2} />
          <span className="keycap-fallback__label">{legend === 'enter' ? 'Enter' : 'Backspace'}</span>
        </span>
      </span>
    </span>
  )
}
