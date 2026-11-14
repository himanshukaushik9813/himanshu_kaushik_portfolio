import type { Highlight } from '@/types/content'

/** CONTENT.md §12. No src = "RECORDING COMING SOON" placeholder; never fake media. */
export const highlights: Highlight[] = [
  { id: 'hl-yieldmaze', projectId: 'yieldmaze', label: 'YieldMaze walkthrough', featured: true },
  {
    id: 'hl-zeropath',
    projectId: 'zeropath',
    label: 'ZeroPath: scroll-through of the live proof page',
    // Rendered from real captures of frontend-blush-five-75.vercel.app/proof (work-showcase/)
    src: '/media/work/zeropath-loop.mp4',
    srcWebm: '/media/work/zeropath-loop.webm',
    poster: '/media/work/zeropath-poster.jpg',
  },
  {
    id: 'hl-aviation',
    projectId: 'aviation',
    label: 'Aviation Intelligence: scroll-through of the live dashboard',
    // Rendered from real captures of aviation-intelligence-three.vercel.app (work-showcase/)
    src: '/media/work/aviation-loop.mp4',
    srcWebm: '/media/work/aviation-loop.webm',
    poster: '/media/work/aviation-poster.jpg',
  },
  {
    id: 'hl-vistavise',
    projectId: 'vistavise',
    label: 'VistaVise: scroll-through of the live site',
    // Rendered from real captures of vistavise.com.au (work-showcase/)
    src: '/media/work/vistavise-loop.mp4',
    srcWebm: '/media/work/vistavise-loop.webm',
    poster: '/media/work/vistavise-poster.jpg',
  },
  { id: 'hl-trace', projectId: 'trace', label: 'TRACE walkthrough' },
]
