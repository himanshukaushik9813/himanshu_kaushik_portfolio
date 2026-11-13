/**
 * Three.js keycap scene (plan §6.4, A20). Lazy-loaded chunk: the only WebGL on the site.
 * - procedural geometry (keycapGeometry), runtime legend + emissive mask (keycapLegend)
 * - MeshStandardMaterial + RoomEnvironment PMREM + one warm key light, Neutral tone mapping, sRGB
 * - fake soft contact shadow whose scale/opacity follow the cap travel
 * - render on demand: only when invalidated, in view and the tab is visible (gsap.ticker)
 */
import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, DirectionalLight, Group, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, NeutralToneMapping, PerspectiveCamera, PlaneGeometry, PMREMGenerator, SRGBColorSpace,
  Scene, WebGLRenderer, Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap } from '@/motion/gsap'
import { buildKeycapGeometry, DEFAULT_DIMS } from './keycapGeometry'
import { drawLegend, drawShadow, type Legend } from './keycapLegend'

export interface KeycapSceneHandle {
  setPress(press: number, glow: number): void
  dispose(): void
}

const TRAVEL = 0.16
const ELEVATION = (54 * Math.PI) / 180
const FOV = 24

export function createKeycapScene(host: HTMLElement, legend: Legend, onReady: () => void, onLost: () => void): KeycapSceneHandle {
  const css = getComputedStyle(document.documentElement)
  const accent = css.getPropertyValue('--accent').trim() || '#ff5a3d'

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.toneMapping = NeutralToneMapping
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.className = 'keycap__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  scene.environmentIntensity = 0.8
  pmrem.dispose()

  const light = new DirectionalLight(0xfff0e2, 1.7)
  light.position.set(-1.6, 5, 1.4)
  scene.add(light)

  // Geometry + materials
  const data = buildKeycapGeometry()
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(data.position, 3))
  geo.setAttribute('uv', new BufferAttribute(data.uv, 2))
  geo.setIndex(new BufferAttribute(data.index, 1))
  data.groups.forEach((g) => geo.addGroup(g.start, g.count, g.materialIndex))
  geo.computeVertexNormals()

  const aspect = data.top.width / data.top.depth
  const legendCanvases = drawLegend(legend, aspect, { paper: '#f7f6f2', ink: '#1c1917', accent, font: 'Satoshi, "Satoshi-Variable", system-ui, sans-serif' })
  const maxAniso = renderer.capabilities.getMaxAnisotropy()
  const mapTex = new CanvasTexture(legendCanvases.map)
  mapTex.colorSpace = SRGBColorSpace
  mapTex.anisotropy = maxAniso
  const emissiveTex = new CanvasTexture(legendCanvases.emissive)
  emissiveTex.anisotropy = maxAniso

  const sideMat = new MeshStandardMaterial({ color: new Color('#edece7'), roughness: 0.72, metalness: 0 })
  const topMat = new MeshStandardMaterial({
    map: mapTex, roughness: 0.72, metalness: 0,
    emissive: new Color(accent), emissiveMap: emissiveTex, emissiveIntensity: 0,
  })
  const cap = new Mesh(geo, [sideMat, topMat])

  const shadowTex = new CanvasTexture(drawShadow())
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 })
  const shadow = new Mesh(new PlaneGeometry(DEFAULT_DIMS.width * 1.3, DEFAULT_DIMS.depth * 1.75), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(0.04, 0.001, 0.12)

  const key = new Group()
  key.add(shadow, cap)
  key.rotation.y = 0.1 // slight yaw
  // static 3/4 view (REFERENCE_ANALYSIS §6.3): the ≈9° roll is applied around the *viewing* axis so it reads
  // on screen as a clockwise tilt, right end lower.
  const tilt = new Group()
  tilt.add(key)
  tilt.quaternion.setFromAxisAngle(new Vector3(0, Math.sin(ELEVATION), Math.cos(ELEVATION)).normalize(), -0.15)
  scene.add(tilt)

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50)
  const target = new Vector3(0, DEFAULT_DIMS.height * 0.42, 0)
  const fit = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // the key (≈ base width + roll) should span ~74% of the stage width, leaving room for the shadow
    const halfW = (DEFAULT_DIMS.width * 1.04) / 2 / 0.74
    const hfov = 2 * Math.atan(Math.tan((FOV * Math.PI) / 360) * camera.aspect)
    const dist = halfW / Math.tan(hfov / 2)
    camera.position.set(0, target.y + Math.sin(ELEVATION) * dist, Math.cos(ELEVATION) * dist)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    invalidate()
  }

  // Render on demand
  let needs = true
  let inView = true
  let first = true
  const invalidate = () => { needs = true }
  const tick = () => {
    if (!needs || !inView || document.hidden) return
    needs = false
    renderer.render(scene, camera)
    if (first) { first = false; onReady() }
  }
  gsap.ticker.add(tick)
  const io = new IntersectionObserver(([e]) => { inView = !!e?.isIntersecting; if (inView) invalidate() })
  io.observe(host)
  const ro = new ResizeObserver(fit)
  ro.observe(host)
  const onVis = () => { if (!document.hidden) invalidate() }
  document.addEventListener('visibilitychange', onVis)
  const lost = (e: Event) => { e.preventDefault(); onLost() }
  canvas.addEventListener('webglcontextlost', lost)
  fit()

  // Satoshi may still be loading the first time: redraw the legend once it is ready.
  void document.fonts?.load('700 64px Satoshi').then(() => {
    const again = drawLegend(legend, aspect, { paper: '#f7f6f2', ink: '#1c1917', accent, font: 'Satoshi, system-ui, sans-serif' })
    legendCanvases.map.getContext('2d')!.drawImage(again.map, 0, 0)
    legendCanvases.emissive.getContext('2d')!.drawImage(again.emissive, 0, 0)
    mapTex.needsUpdate = true
    emissiveTex.needsUpdate = true
    invalidate()
  }).catch(() => {})

  return {
    setPress(press, glow) {
      cap.position.y = -TRAVEL * press
      cap.rotation.x = 0.035 * press
      topMat.emissiveIntensity = glow
      const s = 1 - 0.06 * press
      shadow.scale.set(s, s, 1)
      shadowMat.opacity = 0.55 + 0.2 * press
      invalidate()
    },
    dispose() {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', lost)
      geo.dispose(); sideMat.dispose(); topMat.dispose(); mapTex.dispose(); emissiveTex.dispose()
      shadowMat.dispose(); shadowTex.dispose(); shadow.geometry.dispose(); envRT.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
