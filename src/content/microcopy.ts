/**
 * Interface microcopy. Reference-site wording is NOT reused; these are our own lines.
 * Lines marked EDITABLE are suggestions awaiting Himanshu's approval (Phase 2 report §6).
 */
export const microcopy = {
  intro: { heading: 'Hello World!' },
  hero: { keycapCaption: 'Press to view projects', keycapLegend: 'Enter' },
  works: {
    turnoverMeta: 'From idea to production', // EDITABLE
    turnoverCue: 'Scroll to reveal',
    headerLeft: 'Selected work',
    headerCenter: 'Scroll to explore',
    title: 'Featured',
    viewMore: 'View more',
    footerLeft: 'Built end to end.', // EDITABLE
    footerRight: 'Keep scrolling',
    screenshotPending: 'Screenshot coming soon',
  },
  highlights: {
    titleLines: ['See it', 'in action.'] as [string, string], // EDITABLE
    intro: 'Short scroll-throughs of the projects above, captured from the live builds.', // EDITABLE
    onView: 'On view',
    footer: ['Project walkthroughs', 'Captured from live builds'] as [string, string],
    pending: 'Recording coming soon',
  },
  experience: { left: 'Experience & Recognition', right: '(2024—Now)' },
  skills: { left: 'Toolkit', right: 'What I work with.', activity: 'Code activity', viewGithub: 'View GitHub' },
  connect: {
    eyebrow: 'Got something in mind?',
    copy: 'Hiring, building something, or just curious? Pick a channel and say hello.', // EDITABLE
    titleLines: ["Let's", 'Connect'] as [string, string],
    note: 'Pick whichever is easiest.', // EDITABLE
    resume: 'Download résumé',
  },
  footer: { backToTop: 'Back to top' },
  projects: {
    navCenter: 'Project archive',
    navRight: '2024—26',
    metaLeft: 'All projects',
    // Alternating ink/muted phrases, as in the reference archive hero. EDITABLE.
    heroPhrases: [
      { text: 'Every project,', muted: false },
      { text: 'in full detail —', muted: true },
      { text: 'contracts, circuits,', muted: false },
      { text: 'models', muted: true },
      { text: 'and the engineering', muted: false },
      { text: 'behind them.', muted: true },
    ],
    heroNote: 'Full engineering write-ups for every published project.',
    keycapCaption: 'Press to go back',
    keycapLegend: 'Backspace',
    engineering: 'Engineering',
    footerEyebrow: 'Want the details behind any of these?',
    footerCta: "Let's talk",
    footerEnd: 'End of archive / 2026',
  },
} as const
