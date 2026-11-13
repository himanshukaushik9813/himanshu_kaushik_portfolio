import { useSyncExternalStore } from 'react'

/**
 * Tiny store: has the intro scene been left (hero fully revealed and scrolled past the pin)?
 * Written by IntroScene's ScrollTrigger; read by SiteNav (navbar stays hidden during the intro, A6).
 */
let exited = false
const listeners = new Set<() => void>()

export function setIntroExited(value: boolean) {
  if (value === exited) return
  exited = value
  listeners.forEach((l) => l())
}

export function useIntroExited() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => exited,
    () => false,
  )
}
