/** Motion tokens mirrored from styles/tokens.css §5.6 and REFERENCE_ANALYSIS.md. Durations in seconds. */
export const ease = {
  interaction: 'cubic-bezier(.16,1,.3,1)',
  fill: 'cubic-bezier(.65,0,.35,1)',
  nav: 'cubic-bezier(.22,1,.36,1)',
} as const

export const dur = {
  interaction: 0.9,
  fill: 1.15,
  icon: 1.35,
  iconFill: 1.6,
  connect: 0.6,
  nav: 0.5,
  genericHover: 1.2,
  footerNavFill: 2.4,
} as const

export const intro = {
  greetingCycle: 3.5,
  greetingFade: 0.85,
  greetingBlur: 14,
  waveAngle: 26,
  waveBeat: 0.44,
  pinLength: 1.5, // × section height
  scrub: 0.35,
} as const

export const lenisOptions = {
  lerp: 0.08,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 0.9,
  anchors: true,
} as const
