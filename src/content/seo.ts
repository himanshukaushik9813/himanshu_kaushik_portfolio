import { profile } from './profile'
import { socials } from './socials'
import { publishedProjects } from './projects'

/**
 * Per-route head tags (Phase 9), written into the prerendered HTML by scripts/prerender.mjs.
 * SITE_URL (absolute links: canonical, og:url, og:image, sitemap) comes from the VITE_SITE_URL env var at build
 * time; until the domain is chosen those absolute tags are simply left out.
 */
export interface RouteSeo { path: string; title: string; description: string; jsonLd?: object }

const github = socials.find((s) => s.id === 'github')!.href
const linkedin = socials.find((s) => s.id === 'linkedin')!.href

export const seo: RouteSeo[] = [
  {
    path: '/',
    title: `${profile.name} — Full-Stack & Web3 Developer`,
    description: `${profile.name} is a Full-Stack & Web3 Developer in Bengaluru, India, building full-stack applications, backend systems, AI-powered platforms and blockchain infrastructure.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: 'Full-Stack & Web3 Developer',
      email: `mailto:${profile.email}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
      sameAs: [github, linkedin],
      worksFor: { '@type': 'Organization', name: 'Care4Edu Pvt. Ltd.' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'B.M.S. Institute of Technology and Management' },
    },
  },
  {
    path: '/projects',
    title: `Projects — ${profile.name}`,
    description: `Engineering write-ups of ${profile.name}'s projects: ${publishedProjects.map((p) => p.title).join(', ')}.`,
  },
]
