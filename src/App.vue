<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import StartOverlay from './components/StartOverlay.vue'
import ControlHud from './components/ControlHud.vue'
import SurpriseCard from './components/SurpriseCard.vue'
import { wishLines } from './content'
import { useBirthdayScene } from './composables/useBirthdayScene'
import { useAudioBlow } from './composables/useAudioBlow'
import { useHandTracking } from './composables/useHandTracking'
import birthdaySong from './happy-birthday-155461.mp3'
import posterImage from './1.jpg'

const phase = ref('intro')
const busy = ref(false)
const settingsOpen = ref(false)
const surpriseVisible = ref(false)
const revealVisible = ref(false)
const cardVisible = ref(false)
const cardFlipped = ref(false)
const floatingGiftVisible = ref(false)
const autoCountdown = ref(0)
const sceneContainerRef = ref(null)
const bgmRef = ref(null)
const videoRef = ref(null)
const cameraCanvasRef = ref(null)
const protocolWarning = typeof window !== 'undefined' && window.location.protocol === 'file:'

const theme = reactive({
  bottom: '#ff6ea9',
  top: '#ffc0d2',
  cream: '#fff7fb',
})

const scene = useBirthdayScene(sceneContainerRef)
const audio = useAudioBlow(bgmRef, {
  onComplete: () => {
    if (phase.value === 'blowing') {
      triggerCelebration()
    }
  },
})

const handTracking = useHandTracking(videoRef, cameraCanvasRef, {
  onDetected: () => {
    if (phase.value === 'idle') {
      runCountdown()
    }
  },
  onMove: (delta) => {
    scene.nudgeRotation(delta)
  },
})

let countdownTimer = 0
let celebrationTimer = 0
let sequenceLock = false

const hudVisible = computed(() => phase.value !== 'intro')
const showMeter = computed(() => phase.value === 'blowing')
const canOpenSettings = computed(() => phase.value === 'blowing' || phase.value === 'interactive')
const showTopBanner = computed(() =>
  ['blowing', 'celebration', 'interactive'].includes(phase.value),
)

const instructionTitle = computed(() => {
  if (phase.value === 'idle') return '举起双手'
  if (phase.value === 'countdown') return '魔法启动中'
  if (phase.value === 'blowing') return '许个愿吧'
  if (phase.value === 'celebration') return '生日快乐'
  if (phase.value === 'interactive') return '拖动旋转蛋糕'
  return ''
})

const instructionSubtitle = computed(() => {
  if (phase.value === 'idle') {
    return handTracking.cameraAvailable.value
      ? '镜头识别到手势后会自动开始'
      : '摄像头不可用时会自动进入回退流程'
  }
  if (phase.value === 'countdown') return '3 · 2 · 1'
  if (phase.value === 'blowing') return '对着麦克风吹气，或长按屏幕 / 按住空格'
  if (phase.value === 'celebration') return '愿今天的光都为你而亮'
  if (phase.value === 'interactive') return '多端均可拖动，随时再次打开贺卡'
  return ''
})

const autoCountdownText = computed(() =>
  autoCountdown.value > 0 ? `未检测到手势，${autoCountdown.value} 秒后自动开始` : '',
)

const statusInfo = computed(() => {
  if (phase.value === 'idle') {
    return handTracking.cameraAvailable.value
      ? { text: 'WAITING FOR GESTURE', tone: 'neutral' }
      : { text: 'CAMERA LIMITED, AUTO START READY', tone: 'warning' }
  }

  if (phase.value === 'countdown') {
    return { text: 'GESTURE DETECTED', tone: 'success' }
  }

  if (phase.value === 'blowing') {
    return audio.micAvailable.value
      ? { text: 'MIC LISTENING', tone: 'success' }
      : { text: 'TOUCH OR SPACEBAR FALLBACK', tone: 'warning' }
  }

  if (phase.value === 'celebration') {
    return { text: 'WISH GRANTED', tone: 'success' }
  }

  if (phase.value === 'interactive') {
    return { text: 'INTERACTIVE MODE', tone: 'neutral' }
  }

  return { text: 'SYSTEM READY', tone: 'neutral' }
})

const clearAllTimers = () => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = 0
  }
  if (celebrationTimer) {
    window.clearTimeout(celebrationTimer)
    celebrationTimer = 0
  }
}

const startAutoCountdown = () => {
  autoCountdown.value = handTracking.cameraAvailable.value ? 12 : 6
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
  }

  countdownTimer = window.setInterval(() => {
    autoCountdown.value -= 1
    if (autoCountdown.value <= 0) {
      window.clearInterval(countdownTimer)
      countdownTimer = 0
      if (phase.value === 'idle') {
        runCountdown()
      }
    }
  }, 1000)
}

const showCake = () => {
  phase.value = 'blowing'
  settingsOpen.value = true
  scene.setPhase('blowing')
  scene.setInteractive(false)
  scene.resetCake()
  audio.setActive(true)
}

const runCountdown = async () => {
  if (phase.value !== 'idle' || sequenceLock) return
  sequenceLock = true

  if (countdownTimer) {
    window.clearInterval(countdownTimer)
    countdownTimer = 0
  }
  autoCountdown.value = 0
  phase.value = 'countdown'
  scene.setPhase('countdown')

  for (const item of ['3', '2', '1']) {
    scene.transitionTo(item)
    await new Promise((resolve) => {
      celebrationTimer = window.setTimeout(resolve, 1080)
    })
  }

  sequenceLock = false
  showCake()
}

const triggerCelebration = () => {
  clearAllTimers()
  phase.value = 'celebration'
  settingsOpen.value = false
  scene.setPhase('celebration')
  scene.setInteractive(false)
  audio.setActive(false)
  floatingGiftVisible.value = false

  celebrationTimer = window.setTimeout(() => {
    surpriseVisible.value = true
    revealVisible.value = true
    cardVisible.value = false
    cardFlipped.value = false
  }, 1200)
}

const handleThemeUpdate = ({ key, value }) => {
  theme[key] = value
}

const openCard = () => {
  surpriseVisible.value = true
  revealVisible.value = false
  cardVisible.value = true
  cardFlipped.value = false
  floatingGiftVisible.value = false
}

const closeCard = () => {
  surpriseVisible.value = false
  revealVisible.value = false
  cardVisible.value = false
  cardFlipped.value = false
  floatingGiftVisible.value = true
  settingsOpen.value = false
  phase.value = 'interactive'
  scene.setPhase('interactive')
  scene.setInteractive(true)
  scene.resetCake()
  audio.setActive(false)
}

const startExperience = async () => {
  if (busy.value) return
  busy.value = true

  try {
    await audio.start()
    phase.value = 'idle'
    scene.setPhase('idle')
    scene.setInteractive(false)
    startAutoCountdown()

    handTracking
      .start()
      .then(() => {
        if (phase.value === 'idle' && autoCountdown.value <= 6) {
          startAutoCountdown()
        }
      })
      .catch(() => {
        // camera fallback is handled by UI state and countdown
      })
  } finally {
    busy.value = false
  }
}

watch(
  theme,
  () => {
    scene.setTheme(theme)
  },
  { deep: true },
)

watch(
  () => audio.blowProgress.value,
  (value) => {
    scene.setBlowProgress(value)
  },
)

onMounted(() => {
  scene.init()
  scene.setPhase('intro')
})

onBeforeUnmount(async () => {
  clearAllTimers()
  scene.cleanup()
  await handTracking.cleanup()
  await audio.cleanup()
})
</script>

<template>
  <main class="experience-shell">
    <div ref="sceneContainerRef" class="scene-layer"></div>
    <div class="ambient ambient-a"></div>
    <div class="ambient ambient-b"></div>
    <div class="ambient ambient-c"></div>

    <audio ref="bgmRef" :src="birthdaySong" preload="auto" loop></audio>
    <video ref="videoRef" class="screen-reader" playsinline muted></video>

    <p v-if="protocolWarning" class="protocol-banner glass-panel">
      请通过 HTTP / HTTPS 打开页面，摄像头和麦克风权限才会正常工作。
    </p>

    <div class="top-banner" :class="{ visible: showTopBanner }">
      <h2>Happy Birthday</h2>
      <p>Best Wishes for You</p>
    </div>

    <StartOverlay v-if="phase === 'intro'" :busy="busy" @start="startExperience" />

    <ControlHud
      :visible="hudVisible"
      :status-text="statusInfo.text"
      :status-tone="statusInfo.tone"
      :instruction-title="instructionTitle"
      :instruction-subtitle="instructionSubtitle"
      :auto-countdown-text="autoCountdownText"
      :show-meter="showMeter"
      :blow-progress="audio.blowProgress.value"
      :can-open-settings="canOpenSettings"
      :settings-open="settingsOpen"
      :theme="theme"
      :music-playing="audio.musicPlaying.value"
      :camera-status="handTracking.cameraStatus.value"
      :floating-gift-visible="floatingGiftVisible"
      @toggle-settings="settingsOpen = !settingsOpen"
      @toggle-music="audio.toggleMusic"
      @open-gift="openCard"
      @update-theme="handleThemeUpdate"
    >
      <template #camera>
        <canvas ref="cameraCanvasRef" width="160" height="120" class="camera-canvas"></canvas>
      </template>
    </ControlHud>

    <SurpriseCard
      :visible="surpriseVisible"
      :reveal-visible="revealVisible"
      :card-visible="cardVisible"
      :flipped="cardFlipped"
      :wish-lines="wishLines"
      :poster-src="posterImage"
      @reveal="openCard"
      @flip="cardFlipped = true"
      @close="closeCard"
    />
  </main>
</template>

<style scoped>
.experience-shell {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
}

.scene-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.scene-layer :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}

.ambient {
  position: absolute;
  inset: auto;
  border-radius: 999px;
  filter: blur(24px);
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

.ambient-a {
  width: 16rem;
  height: 16rem;
  top: 6%;
  left: -4%;
  background: rgba(255, 143, 177, 0.16);
}

.ambient-b {
  width: 18rem;
  height: 18rem;
  top: 12%;
  right: -3%;
  background: rgba(155, 184, 255, 0.18);
}

.ambient-c {
  width: 15rem;
  height: 15rem;
  bottom: -4%;
  left: 25%;
  background: rgba(255, 218, 163, 0.14);
}

.protocol-banner {
  position: absolute;
  top: 1rem;
  left: 50%;
  z-index: 24;
  width: min(92vw, 40rem);
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  transform: translateX(-50%);
  text-align: center;
  color: rgba(255, 231, 239, 0.92);
}

.top-banner {
  position: absolute;
  top: 12%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -1rem);
  text-align: center;
  opacity: 0;
  transition:
    opacity 320ms ease,
    transform 320ms ease;
  pointer-events: none;
}

.top-banner.visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

.top-banner h2 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 8vw, 6rem);
  line-height: 0.92;
  background: linear-gradient(120deg, #ffd7e5, #fff4f9, #a7beff);
  -webkit-background-clip: text;
  color: transparent;
}

.top-banner p {
  margin: 0.25rem 0 0;
  color: rgba(247, 240, 255, 0.64);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.camera-canvas {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.03);
  transform: scaleX(-1);
  display: block;
}

@media (max-width: 720px) {
  .top-banner {
    top: 10.5%;
  }
}
</style>
