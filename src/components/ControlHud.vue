<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  statusText: String,
  statusTone: {
    type: String,
    default: 'neutral',
  },
  instructionTitle: String,
  instructionSubtitle: String,
  autoCountdownText: {
    type: String,
    default: '',
  },
  showMeter: Boolean,
  blowProgress: {
    type: Number,
    default: 0,
  },
  canOpenSettings: Boolean,
  settingsOpen: Boolean,
  theme: {
    type: Object,
    required: true,
  },
  musicPlaying: Boolean,
  cameraStatus: {
    type: String,
    default: 'idle',
  },
  floatingGiftVisible: Boolean,
})

const emit = defineEmits(['toggleSettings', 'toggleMusic', 'openGift', 'updateTheme'])

const statusClass = computed(() => ({
  neutral: props.statusTone === 'neutral',
  success: props.statusTone === 'success',
  warning: props.statusTone === 'warning',
}))

const cameraLabel = computed(() => {
  if (props.cameraStatus === 'detected') return 'HAND DETECTED'
  if (props.cameraStatus === 'searching') return 'SEARCHING'
  if (props.cameraStatus === 'unavailable') return 'CAMERA OFF'
  return 'CAMERA IDLE'
})
</script>

<template>
  <div v-if="visible" class="hud-shell">
    <div class="hud-top">
      <div class="status-chip glass-panel" :class="statusClass">
        <span class="status-dot"></span>
        <span>{{ statusText }}</span>
      </div>

      <div class="top-actions">
        <button
          v-if="canOpenSettings"
          type="button"
          class="icon-button glass-panel"
          @click="emit('toggleSettings')"
        >
          主题
        </button>
        <button type="button" class="icon-button glass-panel" @click="emit('toggleMusic')">
          {{ musicPlaying ? '音乐开' : '音乐关' }}
        </button>
      </div>
    </div>

    <div class="center-copy">
      <p class="instruction-title">{{ instructionTitle }}</p>
      <p class="instruction-subtitle">{{ instructionSubtitle }}</p>
      <p v-if="autoCountdownText" class="countdown-copy">{{ autoCountdownText }}</p>
    </div>

    <aside v-if="canOpenSettings && settingsOpen" class="settings-panel glass-panel">
      <label class="picker-row">
        <span>底层颜色</span>
        <input
          type="color"
          :value="theme.bottom"
          @input="emit('updateTheme', { key: 'bottom', value: $event.target.value })"
        />
      </label>
      <label class="picker-row">
        <span>上层颜色</span>
        <input
          type="color"
          :value="theme.top"
          @input="emit('updateTheme', { key: 'top', value: $event.target.value })"
        />
      </label>
      <label class="picker-row">
        <span>奶油颜色</span>
        <input
          type="color"
          :value="theme.cream"
          @input="emit('updateTheme', { key: 'cream', value: $event.target.value })"
        />
      </label>
    </aside>

    <div class="camera-slot glass-panel">
      <div class="camera-label-row">
        <span>Camera View</span>
        <span :class="['camera-state', cameraStatus]">{{ cameraLabel }}</span>
      </div>
      <slot name="camera" />
    </div>

    <div v-if="showMeter" class="meter-panel">
      <p class="meter-hint">对着麦克风吹气，或长按屏幕 / 按住空格</p>
      <div class="meter-track">
        <div class="meter-fill" :style="{ width: `${blowProgress}%` }"></div>
      </div>
    </div>

    <button
      v-if="floatingGiftVisible"
      type="button"
      class="gift-fab glass-panel"
      @click="emit('openGift')"
    >
      贺卡
    </button>
  </div>
</template>

<style scoped>
.hud-shell {
  position: absolute;
  inset: 0;
  z-index: 12;
  padding: clamp(1rem, 3.5vw, 1.8rem);
  pointer-events: none;
}

.hud-top,
.center-copy,
.meter-panel,
.camera-slot,
.gift-fab,
.settings-panel {
  pointer-events: auto;
}

.hud-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.status-dot {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.45);
}

.status-chip.success .status-dot {
  background: var(--success);
  box-shadow: 0 0 18px rgba(143, 241, 194, 0.7);
}

.status-chip.warning .status-dot {
  background: var(--warning);
  box-shadow: 0 0 18px rgba(255, 212, 138, 0.7);
}

.top-actions {
  display: flex;
  gap: 0.7rem;
}

.icon-button {
  padding: 0.85rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.center-copy {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -52%);
  width: min(92vw, 42rem);
  text-align: center;
}

.instruction-title {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.94;
}

.instruction-subtitle {
  margin: 0.55rem 0 0;
  color: rgba(247, 240, 255, 0.7);
  font-size: clamp(1rem, 2vw, 1.2rem);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.countdown-copy {
  margin: 1rem 0 0;
  color: rgba(255, 143, 177, 0.86);
  font-size: 0.92rem;
}

.settings-panel {
  position: absolute;
  top: clamp(5rem, 11vw, 6.5rem);
  right: clamp(1rem, 3.5vw, 1.8rem);
  width: min(16rem, calc(100vw - 2rem));
  padding: 1rem;
  border-radius: 1.2rem;
  display: grid;
  gap: 0.8rem;
}

.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.92rem;
}

.picker-row input {
  width: 2.2rem;
  height: 1.8rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  cursor: pointer;
}

.camera-slot {
  position: absolute;
  left: clamp(1rem, 3.5vw, 1.8rem);
  bottom: clamp(1rem, 3.5vw, 1.8rem);
  width: min(17rem, calc(100vw - 2rem));
  padding: 0.8rem;
  border-radius: 1.2rem;
}

.camera-label-row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.55rem;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(247, 240, 255, 0.64);
}

.camera-state.detected {
  color: var(--success);
}

.camera-state.searching {
  color: var(--warning);
}

.camera-state.unavailable {
  color: var(--danger);
}

.meter-panel {
  position: absolute;
  left: 50%;
  bottom: clamp(1.2rem, 4vw, 2rem);
  transform: translateX(-50%);
  width: min(30rem, calc(100vw - 2rem));
}

.meter-hint {
  margin: 0 0 0.55rem;
  color: rgba(247, 240, 255, 0.76);
  text-align: center;
  font-size: 0.88rem;
}

.meter-track {
  height: 0.85rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 143, 177, 1), rgba(110, 122, 255, 0.86));
  box-shadow: 0 0 24px rgba(255, 95, 154, 0.45);
  transition: width 100ms linear;
}

.gift-fab {
  position: absolute;
  right: clamp(1rem, 3.5vw, 1.8rem);
  bottom: clamp(1rem, 3.5vw, 1.8rem);
  min-width: 4.1rem;
  padding: 1rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 720px) {
  .hud-top {
    align-items: stretch;
    flex-direction: column;
  }

  .top-actions {
    justify-content: flex-end;
  }

  .camera-slot {
    left: auto;
    right: 1rem;
    bottom: 6.4rem;
    width: min(14rem, calc(100vw - 2rem));
  }

  .center-copy {
    transform: translate(-50%, -44%);
  }

  .instruction-title {
    font-size: clamp(2.6rem, 13vw, 4.3rem);
  }

  .instruction-subtitle {
    letter-spacing: 0.08em;
  }

  .settings-panel {
    top: auto;
    right: 1rem;
    left: 1rem;
    bottom: 8.6rem;
    width: auto;
  }
}
</style>
