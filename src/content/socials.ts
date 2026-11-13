import type { Social } from '@/types/content'

/** CONTENT.md §9. Phone number is intentionally absent (never displayed). */
export const socials: Social[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/himanshukaushik9813', handle: '@himanshukaushik9813' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/himanshu-kaushik-590185329/', handle: 'Himanshu Kaushik' },
  { id: 'email', label: 'Email', href: 'mailto:himanshukaushik981374@gmail.com', handle: 'himanshukaushik981374@gmail.com' },
]

/** Contact list rows (decision D9): GitHub, LinkedIn, Email. */
export const contactRows = socials.filter((s) => ['github', 'linkedin', 'email'].includes(s.id))

/** Menu aside "ELSEWHERE" list. TODO(Himanshu): add X / LeetCode here if wanted. */
export const elsewhere: Social[] = [
  socials[0]!,
  socials[1]!,
  { id: 'node', label: 'NODE', href: 'https://nodebmsit.live', handle: 'nodebmsit.live' },
]
