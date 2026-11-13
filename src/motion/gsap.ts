import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Mobile address-bar show/hide must not re-measure pinned scenes (plan risk R6).
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power3.out' })

export { gsap, ScrollTrigger }
