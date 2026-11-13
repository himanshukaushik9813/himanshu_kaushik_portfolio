/**
 * HK monogram (our own mark, CONTENT.md §1). Geometric single-weight construction:
 * H's right stem doubles as K's stem; K's arms leave from the crossbar.
 * Aspect ≈ 0.74 (matches the reference's mark proportions for layout parity).
 * TODO(Himanshu): replace with a designed mark if you have one.
 */
export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 86"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth="9"
      strokeLinecap="square"
    >
      <path d="M8 28V82" />
      <path d="M32 4V82" />
      <path d="M8 55H32" />
      <path d="M32 55L58 28" />
      <path d="M40 48L58 82" />
    </svg>
  )
}
