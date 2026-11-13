import type { Highlight } from '@/types/content'

/** CONTENT.md §12. No src = "RECORDING COMING SOON" placeholder; never fake media. */
export const highlights: Highlight[] = [
  { id: 'hl-yieldmaze', projectId: 'yieldmaze', label: 'YieldMaze walkthrough', featured: true },
  { id: 'hl-zeropath', projectId: 'zeropath', label: 'ZeroPath walkthrough' },
  { id: 'hl-aviation', projectId: 'aviation', label: 'Aviation platform walkthrough' },
  { id: 'hl-trace', projectId: 'trace', label: 'TRACE walkthrough' },
]
