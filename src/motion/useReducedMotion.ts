import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}

/** Media query for the static (unpinned) version of the scroll scenes: reduced motion, or a phone held sideways
 *  (too short for a pinned full-screen scene; the reference drops its pins there too). Mirrored in CSS. */
export const STATIC_SCENES_QUERY = '(prefers-reduced-motion: reduce), (max-height: 500px) and (orientation: landscape)'
export function staticScenes(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(STATIC_SCENES_QUERY).matches
}
