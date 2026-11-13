import type { Profile } from '@/types/content'

export const profile: Profile = {
  name: 'Himanshu Kaushik',
  heroWords: ['Himanshu', 'Kaushik'],
  role: 'Full-Stack & Web3 Developer',
  location: 'Bengaluru, India',
  subtitleLines: ['Full-Stack & Web3 Developer', 'based in Bengaluru, India'],
  supportingLine: 'Building software, intelligent systems and decentralised applications.',
  introCue: 'Himanshu? Wait, who?',
  monogram: 'HK',
  email: 'himanshukaushik981374@gmail.com',
  about: {
    kicker: ['What I do', 'Full-Stack / Web3 Development'],
    // Himanshu's headline (13 Nov). Sentence case + muted/ink split, as in the reference's About H2.
    titleLines: ['Engineering ideas.', "Building what's next."],
    paragraph: [
      { text: "I'm Himanshu Kaushik, a " },
      { text: 'Full-Stack & Web3 Developer', bold: true },
      { text: ' based in ' },
      { text: 'Bengaluru, India', bold: true },
      { text: ', working across TypeScript, Python, Solidity and Rust. I build ' },
      { text: 'full-stack applications', bold: true },
      { text: ', ' },
      { text: 'backend systems', bold: true },
      { text: ', ' },
      { text: 'AI-powered platforms', bold: true },
      { text: ' and ' },
      { text: 'blockchain infrastructure', bold: true },
      { text: ', with a focus on turning complex engineering ideas into practical products.' },
    ],
  },
  education: {
    degree: 'B.E. in Computer Science and Business Systems',
    school: 'B.M.S. Institute of Technology and Management',
    years: '2024 – 2028 (Expected)',
    cgpa: '9.03 / 10',
  },
}
