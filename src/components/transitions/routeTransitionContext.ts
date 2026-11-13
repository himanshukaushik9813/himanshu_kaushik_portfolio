import { createContext, useContext } from 'react'

export type WipeKind = 'bands' | 'columns'
/** Where the home page should land when we come back to it. */
export type HomeRestore = 'hero' | 'works' | 'top'

export interface RouteTransitionApi {
  /** Cover → swap route → reveal. Ignored while another transition runs. */
  go(to: string, kind: WipeKind, opts?: { restore?: HomeRestore }): boolean
  isBusy(): boolean
}

export const RouteTransitionContext = createContext<RouteTransitionApi>({ go: () => false, isBusy: () => false })
export const useRouteTransition = () => useContext(RouteTransitionContext)
