import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function IconCircle({ children, size = 'small', className }: { children: ReactNode; size?: 'small' | 'large'; className?: string }) {
  return <span className={cn('icon-circle', size === 'large' && 'icon-circle--large', className)}>{children}</span>
}
