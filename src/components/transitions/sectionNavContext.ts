import { createContext, useContext } from 'react'

export type SectionNavigate = (hash: string, opts?: { beforeJump?: () => void }) => void
export const SectionNavContext = createContext<SectionNavigate>(() => {})

export function useSectionNav() {
  return useContext(SectionNavContext)
}

/**
 * Click handler for in-page anchors: keeps the real href (works without JS), intercepts with
 * the fade transition. Reads the hash from the clicked element, so no closures over render state.
 */
export function useSectionLinkHandler(opts?: { beforeJump?: () => void }) {
  const navigate = useSectionNav()
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const hash = e.currentTarget.getAttribute('href')
    if (!hash?.startsWith('#')) return
    e.preventDefault()
    e.stopPropagation() // keep Lenis' own anchor handler out of it
    navigate(hash, opts)
  }
}
