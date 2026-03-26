import { ref } from 'vue'
import { loadExternalScript } from '../utils/loadExternalScript'

export function useHandTracking(videoRef, canvasRef, { onDetected, onMove } = {}) {
  const cameraStatus = ref('idle')
  const cameraAvailable = ref(false)

  let cameraInstance
  let handsInstance
  let lastHandX = null

  const ensureMediapipe = async () => {
    await Promise.all([
      loadExternalScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js',
      ),
      loadExternalScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js',
      ),
      loadExternalScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js'),
    ])
  }

  const draw = (results) => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!results.multiHandLandmarks?.length) return

    results.multiHandLandmarks.forEach((landmarks) => {
      window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
        color: '#ff8fb1',
        lineWidth: 2,
      })
      window.drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 })
    })
  }

  const start = async () => {
    const video = videoRef.value
    if (!video) return

    await ensureMediapipe()

    handsInstance = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    })

    handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    handsInstance.onResults((results) => {
      draw(results)

      if (results.multiHandLandmarks?.length) {
        cameraStatus.value = 'detected'
        const currentHandX = results.multiHandLandmarks[0][9].x
        if (lastHandX !== null) {
          onMove?.(currentHandX - lastHandX)
        }
        lastHandX = currentHandX
        onDetected?.()
      } else {
        cameraStatus.value = 'searching'
        lastHandX = null
      }
    })

    try {
      cameraInstance = new window.Camera(video, {
        onFrame: async () => {
          await handsInstance.send({ image: video })
        },
        width: 320,
        height: 240,
      })

      await cameraInstance.start()
      cameraAvailable.value = true
      cameraStatus.value = 'searching'
    } catch (error) {
      cameraAvailable.value = false
      cameraStatus.value = 'unavailable'
      throw error
    }
  }

  const cleanup = async () => {
    try {
      cameraInstance?.stop?.()
    } catch {
      // ignore stop issues from MediaPipe internals
    }

    const video = videoRef.value
    const stream = video?.srcObject
    if (stream?.getTracks) {
      stream.getTracks().forEach((track) => track.stop())
    }

    if (handsInstance?.close) {
      await handsInstance.close()
    }
  }

  return {
    cameraStatus,
    cameraAvailable,
    start,
    cleanup,
  }
}
