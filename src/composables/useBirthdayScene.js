import * as THREE from 'three'
import { createCakeShape, createTextShape } from '../utils/createParticleTargets'

const DEFAULT_THEME = {
  bottom: '#ff6ea9',
  top: '#ffc0d2',
  cream: '#fff7fb',
}

export function useBirthdayScene(containerRef) {
  const theme = { ...DEFAULT_THEME }
  const isCoarsePointer =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 900)

  const particleCount = isCoarsePointer ? 3600 : 6200
  const particles = []
  const targetCache = {}

  let scene
  let camera
  let renderer
  let particleSystem
  let frameId = 0
  let time = 0
  let phase = 'intro'
  let blowProgress = 0
  let interactive = false
  let rotationVelocity = 0
  let dragging = false
  let previousPointerX = 0

  const resize = () => {
    if (!camera || !renderer) return
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  }

  const getCircleTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }

  const ensureTargets = () => {
    if (targetCache.cake) return
    targetCache['3'] = createTextShape('3')
    targetCache['2'] = createTextShape('2')
    targetCache['1'] = createTextShape('1')
    targetCache.cake = createCakeShape(isCoarsePointer)
  }

  const createParticles = () => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const baseColor = new THREE.Color(0xff6ea9)

    for (let index = 0; index < particleCount; index += 1) {
      const x = (Math.random() - 0.5) * 320
      const y = (Math.random() - 0.5) * 320
      const z = (Math.random() - 0.5) * 220
      positions[index * 3] = x
      positions[index * 3 + 1] = y
      positions[index * 3 + 2] = z
      colors[index * 3] = baseColor.r
      colors[index * 3 + 1] = baseColor.g
      colors[index * 3 + 2] = baseColor.b
      sizes[index] = 1 + Math.random() * 1.3

      particles.push({
        current: new THREE.Vector3(x, y, z),
        target: new THREE.Vector3(x, y, z),
        baseTarget: new THREE.Vector3(x, y, z),
        targetColor: baseColor.clone(),
        type: 'bg',
        layer: null,
        noiseOffset: Math.random() * 100,
        angle: Math.random() * Math.PI * 2,
        radius: 18 + Math.random() * 38,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
      })
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    particleSystem = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        map: getCircleTexture(),
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )

    scene.add(particleSystem)
  }

  const transitionTo = (key) => {
    ensureTargets()
    const targets = targetCache[key] || []

    particles.forEach((particle, index) => {
      if (index < targets.length) {
        const target = targets[index]
        particle.baseTarget.copy(target.vec)
        particle.target.copy(target.vec)
        particle.type = target.type
        particle.layer = target.layer ?? null
        particle.targetColor = target.color ? target.color.clone() : new THREE.Color(0xffffff)
        particle.current.x += (Math.random() - 0.5) * 6
        particle.current.y += (Math.random() - 0.5) * 6
        particle.current.z += (Math.random() - 0.5) * 6
      } else {
        const angle = Math.random() * Math.PI * 2
        const radius = 42 + Math.random() * 40
        particle.baseTarget.set(
          radius * Math.cos(angle),
          (Math.random() - 0.5) * 58,
          radius * Math.sin(angle),
        )
        particle.target.copy(particle.baseTarget)
        particle.type = 'bg'
        particle.layer = null
        particle.targetColor = new THREE.Color(0x2b1c35)
      }
    })
  }

  const updateParticles = () => {
    const positions = particleSystem.geometry.attributes.position.array
    const colors = particleSystem.geometry.attributes.color.array
    const sizes = particleSystem.geometry.attributes.size.array
    time += 0.016
    const blowInfluence = blowProgress / 100

    for (let index = 0; index < particleCount; index += 1) {
      const particle = particles[index]
      let targetX = particle.target.x
      let targetY = particle.target.y
      let targetZ = particle.target.z

      if (particle.type === 'cake') {
        if (particle.layer === 'bottom') {
          particle.targetColor.set(theme.bottom)
        } else if (particle.layer === 'top') {
          particle.targetColor.set(theme.top)
        } else if (particle.layer === 'cream') {
          particle.targetColor.set(theme.cream)
        }
      }

      if (phase === 'intro') {
        const introAngle = particle.angle + time * 0.05
        const introRadius = particle.radius + Math.sin(time * 0.55 + index * 0.01) * 10
        targetX = Math.cos(introAngle) * introRadius * 3
        targetZ = Math.sin(introAngle) * introRadius * 3
        targetY = particle.baseTarget.y + Math.sin(time * 0.5 + targetX * 0.03) * 16
        particle.targetColor.setHSL(0.88 + Math.sin(time * 0.2 + index * 0.02) * 0.08, 0.72, 0.64)
      } else if (phase === 'idle') {
        const idleAngle = particle.angle + time * 0.08
        const idleRadius = particle.radius + Math.sin(time + index * 0.01) * 2.5
        targetX = Math.cos(idleAngle) * idleRadius
        targetZ = Math.sin(idleAngle) * idleRadius
        targetY = particle.baseTarget.y + Math.sin(time + targetX * 0.04) * 4.5
        particle.targetColor.setHSL(0.88, 0.35, 0.18)
      } else if (phase === 'celebration') {
        if (particle.type === 'bg') {
          const partyAngle = particle.angle + time * 0.14 + particle.orbitSpeed
          const partyRadius = particle.radius + Math.sin(time + index) * 4
          targetX = Math.cos(partyAngle) * partyRadius * 1.4
          targetZ = Math.sin(partyAngle) * partyRadius * 1.4
          targetY = particle.baseTarget.y + Math.sin(time + particle.noiseOffset) * 4
          particle.targetColor.setHSL(0.9 + Math.sin(time + index * 0.01) * 0.06, 0.82, 0.65)
        }
      } else if (phase === 'interactive' && particle.type === 'bg') {
        const glideAngle = particle.angle + time * 0.1
        const glideRadius = particle.radius + Math.sin(time + index * 0.012) * 2.8
        targetX = Math.cos(glideAngle) * glideRadius * 1.2
        targetZ = Math.sin(glideAngle) * glideRadius * 1.2
        targetY = particle.baseTarget.y + Math.sin(time * 1.2 + particle.noiseOffset) * 3.5
        particle.targetColor.setHSL(0.83, 0.68, 0.5)
      }

      if (particle.type === 'flame') {
        const flicker = Math.sin(time * 6 + particle.noiseOffset) * 0.55
        targetX += flicker

        if (phase === 'celebration' || phase === 'interactive' || blowInfluence > 0.1) {
          const lift = phase === 'blowing' ? blowInfluence * 28 : 56
          targetY += lift
          targetX += (Math.random() - 0.5) * lift * 0.4
          targetZ += (Math.random() - 0.5) * lift * 0.15
          particle.targetColor.lerp(new THREE.Color(0xf6f0ff), 0.08)
        }
      }

      particle.current.x += (targetX - particle.current.x) * 0.08
      particle.current.y += (targetY - particle.current.y) * 0.08
      particle.current.z += (targetZ - particle.current.z) * 0.08

      positions[index * 3] = particle.current.x
      positions[index * 3 + 1] = particle.current.y
      positions[index * 3 + 2] = particle.current.z

      colors[index * 3] += (particle.targetColor.r - colors[index * 3]) * 0.1
      colors[index * 3 + 1] += (particle.targetColor.g - colors[index * 3 + 1]) * 0.1
      colors[index * 3 + 2] += (particle.targetColor.b - colors[index * 3 + 2]) * 0.1

      if (
        particle.type === 'flame' &&
        (phase === 'celebration' || phase === 'interactive' || blowInfluence > 0.1)
      ) {
        sizes[index] = Math.max(0, 1.4 * (1 - Math.max(blowInfluence, phase === 'blowing' ? 0 : 1)))
      } else {
        sizes[index] = 1.05 + Math.sin(time * 1.4 + index) * 0.24
      }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true
    particleSystem.geometry.attributes.color.needsUpdate = true
    particleSystem.geometry.attributes.size.needsUpdate = true

    if (interactive) {
      if (!dragging) {
        rotationVelocity *= 0.95
        particleSystem.rotation.y += rotationVelocity + 0.004
      }
    } else if (phase !== 'idle' && phase !== 'intro') {
      particleSystem.rotation.y = Math.sin(time * 0.18) * 0.16
    } else {
      particleSystem.rotation.y *= 0.92
    }
  }

  const render = () => {
    frameId = window.requestAnimationFrame(render)
    if (!renderer || !particleSystem) return
    updateParticles()
    renderer.render(scene, camera)
  }

  const pointerDown = (event) => {
    if (!interactive) return
    dragging = true
    previousPointerX = event.clientX ?? event.touches?.[0]?.clientX ?? 0
    rotationVelocity = 0
  }

  const pointerMove = (event) => {
    if (!interactive || !dragging) return
    const currentX = event.clientX ?? event.touches?.[0]?.clientX ?? 0
    const sensitivity = isCoarsePointer ? 0.013 : 0.0075
    const delta = currentX - previousPointerX
    rotationVelocity = delta * sensitivity
    particleSystem.rotation.y += rotationVelocity
    previousPointerX = currentX
  }

  const pointerUp = () => {
    dragging = false
  }

  const bindInteraction = (container) => {
    container.addEventListener('pointerdown', pointerDown)
    window.addEventListener('pointermove', pointerMove, { passive: true })
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('pointercancel', pointerUp)
  }

  const unbindInteraction = (container) => {
    container.removeEventListener('pointerdown', pointerDown)
    window.removeEventListener('pointermove', pointerMove)
    window.removeEventListener('pointerup', pointerUp)
    window.removeEventListener('pointercancel', pointerUp)
  }

  const init = () => {
    const container = containerRef.value
    if (!container) return

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05030b, 0.0018)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 52
    renderer = new THREE.WebGLRenderer({
      antialias: !isCoarsePointer,
      alpha: true,
      powerPreference: 'high-performance',
    })

    resize()
    container.appendChild(renderer.domElement)
    ensureTargets()
    createParticles()
    bindInteraction(container)
    window.addEventListener('resize', resize)
    render()
  }

  const cleanup = () => {
    const container = containerRef.value
    if (frameId) {
      window.cancelAnimationFrame(frameId)
    }
    window.removeEventListener('resize', resize)
    if (container) {
      unbindInteraction(container)
      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
    particleSystem?.geometry?.dispose()
    particleSystem?.material?.dispose()
    renderer?.dispose()
  }

  return {
    init,
    cleanup,
    transitionTo,
    setPhase(nextPhase) {
      phase = nextPhase
    },
    setInteractive(nextValue) {
      interactive = nextValue
    },
    nudgeRotation(delta) {
      if (!interactive || Math.abs(delta) < 0.002) return
      rotationVelocity += delta * -0.38
    },
    setBlowProgress(value) {
      blowProgress = value
    },
    setTheme(nextTheme) {
      Object.assign(theme, nextTheme)
    },
    resetCake() {
      transitionTo('cake')
      blowProgress = 0
    },
  }
}
