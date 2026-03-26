import * as THREE from 'three'

function sampleCanvasPoints(canvas, scale = 1, step = 3, color = 0xffffff) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const { width, height } = canvas
  const data = ctx.getImageData(0, 0, width, height).data
  const points = []

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 120) {
        points.push({
          vec: new THREE.Vector3((x - width / 2) * scale, -(y - height / 2) * scale, 0),
          type: 'text',
          color: new THREE.Color(color),
        })
      }
    }
  }

  return points
}

export function createTextShape(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '700 220px "Cormorant Garamond", serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10)

  return sampleCanvasPoints(canvas, 0.22, 3)
}

export function createCakeShape(isCoarsePointer) {
  const points = []
  const bodyDensity = isCoarsePointer ? 820 : 1450
  const creamDensity = isCoarsePointer ? 260 : 440
  const sprinkleDensity = isCoarsePointer ? 80 : 140
  const flameDensity = isCoarsePointer ? 240 : 420
  const candleDensity = isCoarsePointer ? 180 : 300
  const layers = [
    { y: -16, radius: 18, height: 11, type: 'bottom' },
    { y: -5, radius: 12.5, height: 8.5, type: 'top' },
  ]

  layers.forEach((layer) => {
    for (let i = 0; i < bodyDensity; i += 1) {
      const theta = Math.random() * Math.PI * 2
      const radius = layer.radius * (0.9 + Math.random() * 0.14)
      const height = Math.random() * layer.height
      points.push({
        vec: new THREE.Vector3(
          radius * Math.cos(theta),
          layer.y + height,
          radius * Math.sin(theta),
        ),
        type: 'cake',
        layer: layer.type,
      })
    }

    for (let i = 0; i < creamDensity; i += 1) {
      const theta = Math.random() * Math.PI * 2
      const radius = Math.random() * layer.radius
      points.push({
        vec: new THREE.Vector3(
          radius * Math.cos(theta),
          layer.y + layer.height,
          radius * Math.sin(theta),
        ),
        type: 'cake',
        layer: 'cream',
      })
    }

    for (let i = 0; i < sprinkleDensity; i += 1) {
      const theta = Math.random() * Math.PI * 2
      const radius = layer.radius + 0.25
      const height = Math.random() * layer.height
      points.push({
        vec: new THREE.Vector3(
          radius * Math.cos(theta),
          layer.y + height,
          radius * Math.sin(theta),
        ),
        type: 'cake',
        color: new THREE.Color().setHSL(Math.random(), 1, 0.68),
      })
    }
  })

  const candleY = layers[1].y + layers[1].height
  for (let i = 0; i < candleDensity; i += 1) {
    const theta = Math.random() * Math.PI * 2
    const radius = Math.random() * 0.85
    const height = Math.random() * 11.5
    points.push({
      vec: new THREE.Vector3(
        radius * Math.cos(theta),
        candleY + height,
        radius * Math.sin(theta),
      ),
      type: 'candle',
      color:
        Math.sin(height * 1.4 + theta) > 0
          ? new THREE.Color(0xff4068)
          : new THREE.Color(0xffffff),
    })
  }

  const flameY = candleY + 11
  for (let i = 0; i < flameDensity; i += 1) {
    const lift = Math.random()
    const height = lift * 6.2
    const radius = (1 - lift) * 1.8 * Math.random()
    const theta = Math.random() * Math.PI * 2
    const color = new THREE.Color(0xffb347)
    if (lift < 0.2) {
      color.setHex(0x5aa9ff)
    } else if (lift > 0.72) {
      color.setHex(0xff6b35)
    }

    points.push({
      vec: new THREE.Vector3(
        radius * Math.cos(theta),
        flameY + height,
        radius * Math.sin(theta),
      ),
      type: 'flame',
      color,
    })
  }

  return points
}
