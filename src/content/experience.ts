import type { ExperienceRow } from '@/types/content'

/** CONTENT.md §5–7 + education (§1). Order per IMPLEMENTATION_PLAN.md §11.1. */
export const experience: ExperienceRow[] = [
  {
    id: 'care4edu',
    kind: 'role',
    emphasis: 'primary',
    title: 'Care4Edu Pvt. Ltd.',
    detail: 'Software Developer · Bengaluru, India · 2026 – Present',
    bullets: [
      'Developed and maintained full-stack web features using Next.js, Node.js and REST APIs for an education platform.',
      'Built data dashboards and backend services.',
      'Collaborated with the team on UI, API design and deployment.',
    ],
  },
  {
    id: 'node',
    kind: 'leadership',
    emphasis: 'primary',
    title: 'NODE — Network of Decentralized Engineers',
    detail: 'Founding Member & President · BMSIT&M',
    bullets: [
      'Lead the Web3 student engineering community.',
      'Organise workshops.',
      'Coordinate build nights.',
      'Lead hackathon teams.',
      'Support open-source projects.',
    ],
    href: 'https://nodebmsit.live',
  },
  {
    id: 'codesprint',
    kind: 'achievement',
    emphasis: 'primary',
    title: '1st Place — GDG NMIT CodeSprint 2026',
    detail: 'Overall winner at the GDG flagship hackathon with YieldMaze',
  },
  {
    id: 'hackathons',
    kind: 'achievement',
    emphasis: 'primary',
    title: '7+ Hackathon Wins',
    detail: 'Recognised for innovative software solutions',
  },
  {
    id: 'leetcode',
    kind: 'achievement',
    emphasis: 'primary',
    title: '500+ DSA problems',
    detail: 'Solved on LeetCode',
  },
  {
    id: 'fashion',
    kind: 'leadership',
    emphasis: 'secondary',
    title: 'Fashion Club Head',
    detail: 'College Fest Event Coordinator · BMSIT&M',
    bullets: ['Led fashion events and annual college fest logistics.'],
  },
  {
    id: 'education',
    kind: 'education',
    emphasis: 'primary',
    title: 'B.E. in Computer Science and Business Systems',
    detail: 'B.M.S. Institute of Technology and Management · 2024 – 2028 (Expected) · CGPA 9.03 / 10',
  },
]
