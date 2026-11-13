import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Mobile address-bar show/hide must not re-measure pinned scenes (plan risk R6).
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power3.out' })

export { gsap, ScrollTrigger, SplitText }
