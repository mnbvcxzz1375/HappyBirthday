import { ref } from 'vue'

export function useAudioBlow(audioRef, { onComplete } = {}) {
  const blowProgress = ref(0)
  const musicPlaying = ref(false)
  const micAvailable = ref(false)
  const micError = ref('')

  let analyser
  let audioContext
  let mediaStream
  let rafId = 0
  let active = false
  let completed = false
  let started = false
  let isSpacePressed = false
  let isTouching = false

  const updatePlayingState = () => {
    const audio = audioRef.value
    musicPlaying.value = Boolean(audio && !audio.paused)
  }

  const onTouchStart = (event) => {
    if (!active) return
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('label')) {
      return
    }
    isTouching = true
  }

  const onTouchEnd = () => {
    isTouching = false
  }

  const onKeyDown = (event) => {
    if (event.code === 'Space') {
      isSpacePressed = true
    }
  }

  const onKeyUp = (event) => {
    if (event.code === 'Space') {
      isSpacePressed = false
    }
  }

  const attachFallbackControls = () => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('touchcancel', onTouchEnd, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
  }

  const detachFallbackControls = () => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
    document.removeEventListener('touchcancel', onTouchEnd)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
  }

  const tick = () => {
    rafId = window.requestAnimationFrame(tick)
    if (!active) return

    let volume = 0
    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(data)
      let sum = 0
      for (let index = 0; index < data.length; index += 1) {
        sum += data[index]
      }
      volume = sum / data.length
    }

    if (volume > 26 || isSpacePressed || isTouching) {
      blowProgress.value += 1
    } else {
      blowProgress.value -= 0.38
    }

    blowProgress.value = Math.max(0, Math.min(100, blowProgress.value))

    if (blowProgress.value >= 100 && !completed) {
      completed = true
      active = false
      onComplete?.()
    }
  }

  const fadeInMusic = async () => {
    const audio = audioRef.value
    if (!audio) return

    audio.volume = 0
    try {
      await audio.play()
      musicPlaying.value = true
    } catch {
      musicPlaying.value = false
      return
    }

    let volume = 0
    const timer = window.setInterval(() => {
      volume = Math.min(volume + 0.05, 0.55)
      audio.volume = volume
      if (volume >= 0.55) {
        window.clearInterval(timer)
      }
    }, 180)
  }

  const start = async () => {
    if (started) return
    started = true
    attachFallbackControls()

    const audio = audioRef.value
    if (audio) {
      audio.addEventListener('play', updatePlayingState)
      audio.addEventListener('pause', updatePlayingState)
    }

    await fadeInMusic()

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(mediaStream)
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      micAvailable.value = true
      micError.value = ''
    } catch (error) {
      micAvailable.value = false
      micError.value = error instanceof Error ? error.message : 'Microphone not available'
    }

    tick()
  }

  const setActive = (nextValue) => {
    active = nextValue
    completed = false
    if (!nextValue) {
      blowProgress.value = 0
    }
  }

  const toggleMusic = async () => {
    const audio = audioRef.value
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        musicPlaying.value = true
      } catch {
        musicPlaying.value = false
      }
      return
    }

    audio.pause()
    musicPlaying.value = false
  }

  const cleanup = async () => {
    active = false
    if (rafId) {
      window.cancelAnimationFrame(rafId)
    }
    detachFallbackControls()

    const audio = audioRef.value
    if (audio) {
      audio.removeEventListener('play', updatePlayingState)
      audio.removeEventListener('pause', updatePlayingState)
    }

    mediaStream?.getTracks().forEach((track) => track.stop())
    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close()
    }
  }

  return {
    blowProgress,
    micAvailable,
    micError,
    musicPlaying,
    start,
    setActive,
    toggleMusic,
    cleanup,
  }
}
