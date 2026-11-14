import type { Highlight } from '@/types/content'

/** CONTENT.md §12. No src = "RECORDING COMING SOON" placeholder; never fake media. */
export const highlights: Highlight[] = [
  { id: 'hl-yieldmaze', projectId: 'yieldmaze', label: 'YieldMaze walkthrough', featured: true },
  { id: 'hl-zeropath', projectId: 'zeropath', label: 'ZeroPath walkthrough' },
  {
    id: 'hl-aviation',
    projectId: 'aviation',
    label: 'Aviation Intelligence: scroll-through of the live dashboard',
    // Rendered from real captures of aviation-intelligence-three.vercel.app (work-showcase/)
    src: '/media/work/aviation-loop.mp4',
    srcWebm: '/media/work/aviation-loop.webm',
    poster: '/media/work/aviation-poster.jpg',
  },
  { id: 'hl-trace', projectId: 'trace', label: 'TRACE walkthrough' },
]
