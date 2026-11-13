import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Corner-label row used at the top of most sections (reference §2 signature). */
export function MetaRow({ left, center, right, className }: { left: ReactNode; center?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('meta-row meta', className)}>
      <span>{left}</span>
      {center !== undefined ? <span className="meta-row__center">{center}</span> : null}
      {right !== undefined ? <span className="meta-row__right">{right}</span> : null}
    </div>
  )
}
