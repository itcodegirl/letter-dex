import * as THREE from '../../assets/vendor/three.module.min.js'

// A view of quest progress. Learning state never lives in the scene graph.
export function createTrail(host, onUnavailable) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#748eaa', 27, 78)
  const camera = new THREE.PerspectiveCamera(49, 1, 0.1, 110)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35
  host.append(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const geometry = new Set(), materials = new Set()
  const material = (color, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true, ...extra })
    materials.add(m)
    return m
  }
  const stoneTexture = new THREE.TextureLoader().load(
    new URL('../../assets/trail/stone-surface.png', import.meta.url).href,
    () => { stoneTexture.colorSpace = THREE.SRGBColorSpace },
  )
  stoneTexture.wrapS = THREE.RepeatWrapping
  stoneTexture.wrapT = THREE.RepeatWrapping
  stoneTexture.repeat.set(1.5, 1.5)
  stoneTexture.colorSpace = THREE.SRGBColorSpace
  const rock = material('#d5aa67', { map: stoneTexture, roughness: 1, flatShading: false })
  const bridgeTexture = new THREE.TextureLoader().load(new URL('../../assets/trail/bridge-wood.png', import.meta.url).href)
  bridgeTexture.colorSpace = THREE.SRGBColorSpace
  const bridgeWood = material('#e7d7b9', { map: bridgeTexture, roughness: .95, flatShading: false })
  const grass = material('#405a3c'), trunk = material('#543d31')
  const leaves = ['#284b3c', '#365b43', '#49694b'].map(c => material(c))
  const gold = material('#efbb66', { emissive: '#f8a833', emissiveIntensity: 0.65 })
  const darkGold = material('#726448')
  const beaconCore = material('#726448', { emissive: '#f8a833', emissiveIntensity: 0 })
  const add = (g, m, x, y, z, parent = scene) => {
    geometry.add(g)
    const mesh = new THREE.Mesh(g, m)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }
  scene.add(new THREE.HemisphereLight('#d4e8f6', '#504134', 2.4))
  const sun = new THREE.DirectionalLight('#ffdc99', 3.2)
  sun.position.set(-10, 18, -25)
  scene.add(sun)
  const river = add(new THREE.PlaneGeometry(11, 90, 1, 1), material('#378695', { metalness: 0.25, roughness: 0.38, transparent: true, opacity: 0.82 }), 0, -0.26, -28)
  river.rotation.x = -Math.PI / 2
  for (const side of [-1, 1]) {
    add(new THREE.BoxGeometry(24, 3, 90), grass, side * 17, -1.8, -28)
    for (let i = 0; i < 35; i++) {
      const z = 12 - i * 2.2
      const x = side * (5.5 + Math.sin(i * 2.37) * 0.65)
      const b = add(new THREE.DodecahedronGeometry(1, 0), rock, x, -0.15, z)
      b.scale.set(1.2, 0.6 + (i % 3) * 0.15, 1.5)
      b.rotation.y = i
      if (i % 2 === 0) {
        const tx = side * (7.5 + (i % 4) * 1.1)
        const height = 5 + (i % 5)
        add(new THREE.CylinderGeometry(0.22, 0.45, height, 6), trunk, tx, height / 2, z)
        for (let j = 0; j < 3; j++) {
          add(new THREE.ConeGeometry(2.3 - j * 0.45, 3.4, 7), leaves[i % 3], tx, height * 0.6 + j * 1.5, z)
        }
      }
    }
  }
  // Start and destination banks frame the route.
  add(new THREE.BoxGeometry(12, 1, 9), rock, 0, -0.65, 9)
  add(new THREE.BoxGeometry(13, 1.2, 10), grass, 0, -0.45, -35)
  const stones = [], beacons = []
  for (let i = 0; i < 8; i++) {
    const z = 2 - i * 4.1
    const group = new THREE.Group()
    group.position.set(Math.sin(i * 1.2) * 0.65, -0.72, z)
    scene.add(group)
    const stone = add(new THREE.CylinderGeometry(1.35, 1.65, 0.7, 7), rock, 0, 0, 0, group)
    stone.rotation.y = i * 0.7
    const ring = add(new THREE.TorusGeometry(1.05, 0.045, 4, 20), gold, 0, 0.37, 0, group)
    ring.rotation.x = -Math.PI / 2
    ring.visible = false
    stones.push({ group, ring })
    const beacon = new THREE.Group()
    beacon.position.set(i % 2 ? 4.7 : -4.7, 0, z)
    scene.add(beacon)
    add(new THREE.CylinderGeometry(0.09, 0.13, 1.5, 5), trunk, 0, 0.75, 0, beacon)
    const lamp = add(new THREE.OctahedronGeometry(0.26), darkGold, 0, 1.65, 0, beacon)
    beacons.push(lamp)
  }
  // Original stone arch and a warm destination beacon.
  for (let i = 0; i < 9; i++) {
    const angle = Math.PI * i / 8
    const archStone = add(
      new THREE.DodecahedronGeometry(0.62 + (i % 2) * 0.1, 0),
      rock,
      Math.cos(angle) * 2.15,
      0.7 + Math.sin(angle) * 3.2,
      -34,
    )
    archStone.scale.set(1.15, 1.35, 0.8)
    archStone.rotation.z = -angle
  }
  const portal = add(new THREE.TorusGeometry(1.35, 0.12, 6, 30), gold, 0, 2.3, -34)
  const beam = add(new THREE.CylinderGeometry(.13, .4, 20, 8), gold, 0, 11, -34)
  beam.visible = false
  const beaconLight = new THREE.PointLight('#ffcb68', 22, 13)
  beaconLight.position.set(0, 3, -32)
  scene.add(beaconLight)
  const ripples = []
  const rippleMat = material('#88cbd0', { transparent: true, opacity: 0.2 })
  for (let i = 0; i < 32; i++) {
    const ripple = add(new THREE.PlaneGeometry(0.5 + (i % 4), 0.035), rippleMat, Math.sin(i * 3) * 4.3, -0.245, 10 - i * 1.7)
    ripple.rotation.x = -Math.PI / 2
    ripples.push(ripple)
  }
  const bridges = []
  for (let i = 0; i < 8; i++) {
    const bridge = new THREE.Group()
    bridge.position.set(0, 0.3, 2 - i * 4.1)
    for (let p = 0; p < 5; p++) add(new THREE.BoxGeometry(3.5, 0.2, 0.7), bridgeWood, 0, 0, -1.6 + p * 0.8, bridge)
    scene.add(bridge); bridges.push(bridge); bridge.visible = false
  }
  let chapter = 0
  let target = 0, current = 0, active = true, lost = false, disposed = false, frame = 0, previous = 0
  function resize() {
    const { width, height } = host.getBoundingClientRect()
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
    draw(0, 1)
  }
  function draw(time, delta) {
    const snap = motion.matches
    current += (target - current) * (snap ? 1 : 1 - Math.exp(-delta * 2.5))
    camera.position.set(Math.sin(current * 0.2) * 0.3, 4.2, 12 - current * 3.35)
    camera.lookAt(0, 0.6, camera.position.z - 18)
    stones.forEach(({ group, ring }, i) => {
      const raised = i < target
      group.visible = chapter !== 1
      bridges[i].visible = chapter === 1 && raised
      const y = raised ? 0.17 : -0.72
      group.position.y += (y - group.position.y) * (snap ? 1 : 1 - Math.exp(-delta * 4))
      ring.visible = raised
      beacons[i].material = raised ? gold : darkGold
    })
    if (!snap) ripples.forEach((r, i) => { r.position.x = Math.sin(time * 0.0002 + i * 3) * 4.3 })
    portal.rotation.z = snap ? 0 : Math.sin(time * 0.0003) * 0.08
    // The rescue starts dark. Each saved success adds light; the final answer
    // earns the sky beam. Derive this on every draw so replay and resume agree.
    const rescuing = chapter === 2
    const charge = target / 8
    beaconCore.color.copy(darkGold.color).lerp(gold.color, charge)
    beaconCore.emissiveIntensity = charge * 1.3
    portal.material = rescuing ? beaconCore : gold
    beaconLight.intensity = rescuing ? charge * 72 : 22
    beam.visible = rescuing && target === 8
    if (!lost) renderer.render(scene, camera)
  }
  function tick(time) {
    frame = 0
    if (disposed || !active || document.hidden || lost) return
    if (time - previous >= 32) {
      draw(time, Math.min((time - previous) / 1000, 0.1))
      previous = time
    }
    frame = requestAnimationFrame(tick)
  }
  function resume() { if (!frame && !disposed && active && !document.hidden && !lost) frame = requestAnimationFrame(tick) }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  document.addEventListener('visibilitychange', resume)
  const contextLost = event => { event.preventDefault(); lost = true; host.classList.add('unavailable'); onUnavailable(true) }
  const contextRestored = () => { lost = false; host.classList.remove('unavailable'); onUnavailable(false); resize(); resume() }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored)
  resize(); resume()
  return {
    setChapter(value) {
      chapter = value
      renderer.toneMappingExposure = value === 2 ? .95 : 1.35
      scene.fog.color.set(value === 2 ? '#30474f' : '#748eaa')
      resume()
    },
    setProgress(value) { target = Math.min(8, Math.max(0, value)); resume() },
    setActive(value) { active = value; resume() },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect()
      document.removeEventListener('visibilitychange', resume)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored)
      geometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); stoneTexture.dispose(); bridgeTexture.dispose(); renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
