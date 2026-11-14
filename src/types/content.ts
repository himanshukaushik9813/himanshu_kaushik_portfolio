/** Typed content schema. Every personal fact on the site comes from src/content/*, sourced from CONTENT.md. */

export type Url = `https://${string}` | `mailto:${string}` | `/${string}`

export interface Profile {
  name: string
  /** Hero headline, split into words (one line on desktop, one word per line on mobile). */
  heroWords: [string, string]
  role: string
  location: string
  subtitleLines: [string, string]
  supportingLine?: string
  introCue: string
  monogram: string
  email: string
  about: {
    kicker: [string, string]
    titleLines: [string, string] // [muted, ink]
    /** Paragraph segments: bold segments render <strong>. */
    paragraph: { text: string; bold?: boolean }[]
  }
  education: { degree: string; school: string; years: string; cgpa: string }
}

export type AccentSlot = 1 | 2 | 3 | 4
export type DetailShape = 'grid' | 'ring' | 'crescent'

export interface TechItem {
  name: string
  /** simple-icons slug (resolved in Phase 2); undefined = text-only chip */
  icon?: string
}

export interface ProjectLink {
  kind: 'code' | 'live' | 'contract'
  label: string
  href: Url
}

export interface Project {
  id: string
  /** false = hidden everywhere (e.g. TRACE until verified) */
  published: boolean
  title: string
  category: string
  /** Short description for the Featured card (verbatim from CONTENT.md). */
  summary: string
  /** Full engineering bullets for /projects (verbatim). */
  work: string[]
  stack: TechItem[]
  links: ProjectLink[]
  /** true = shows "DEMO OFFLINE" badge instead of a live link */
  offline: boolean
  badge?: string
  accentSlot: AccentSlot
  detailShape: DetailShape
  /** 4:5 screenshot import; undefined = placeholder tile */
  screenshot?: string
  featured: boolean
  extraFacts?: string[]
}

export interface Greeting {
  word: string
  language: string
  lang: string
  script: 'latin' | 'other'
  dir?: 'rtl'
}

export interface SkillGroup {
  title: string
  subgroups: { title: string; items: string[] }[]
}

export interface ExperienceRow {
  id: string
  title: string
  detail: string
  kind: 'role' | 'leadership' | 'achievement' | 'education'
  emphasis: 'primary' | 'secondary'
  bullets?: string[]
  href?: Url
}

export interface Social {
  id: 'github' | 'linkedin' | 'email' | 'x' | 'leetcode' | 'node'
  label: string
  href: Url
  handle: string
}

export interface Highlight {
  id: string
  projectId: string
  label: string
  /** undefined = "RECORDING COMING SOON" placeholder (no fake media) */
  src?: string
  /** WebM version of src (smaller); listed first so browsers that support it use it */
  srcWebm?: string
  poster?: string
  featured?: boolean
  title?: string
  note?: string
}
