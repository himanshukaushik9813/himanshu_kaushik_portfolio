import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from './gsap'

/**
 * StrictMode-safe GSAP setup: everything created inside `setup` is scoped to `scope`
 * and reverted on unmount / dependency change (plan risk R12).
 */
export function useGsap(
  setup: (ctx: gsap.Context) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return
    let cleanup: void | (() => void)
    const ctx = gsap.context((self) => {
      cleanup = setup(self)
    }, scope.current)
    return () => {
      if (typeof cleanup === 'function') cleanup()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
