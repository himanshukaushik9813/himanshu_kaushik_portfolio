import { Link } from 'react-router'
import { KeycapFallback } from './KeycapFallback'
import { cn } from '@/lib/cn'
import './keycap.css'

/** Keycap CTA. Phase 2: static link + CSS key. Phase 6 adds the WebGL scene, press animation and keyboard shortcut. */
export function Keycap({ legend, caption, to, theme = 'light', className }: { legend: 'enter' | 'backspace'; caption: string; to: string; theme?: 'light' | 'dark'; className?: string }) {
  return (
    <Link to={to} className={cn('keycap', `keycap--${theme}`, className)} aria-label={caption}>
      <span className="keycap__stage">
        <KeycapFallback legend={legend} />
      </span>
      <span className="keycap__caption caption">{caption}</span>
    </Link>
  )
}
