import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = { left: ReactNode; center?: ReactNode; right?: ReactNode; className?: string } & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

/** Corner-label row used at the top of most sections (reference §2 signature). Extra props (data-*) are forwarded. */
export function MetaRow({ left, center, right, className, ...rest }: Props) {
  return (
    <div className={cn('meta-row meta', className)} {...rest}>
      <span>{left}</span>
      {center !== undefined ? <span className="meta-row__center">{center}</span> : null}
      {right !== undefined ? <span className="meta-row__right">{right}</span> : null}
    </div>
  )
}
