<script setup>
import { introCopy } from '../content'

defineProps({
  busy: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['start'])
</script>

<template>
  <section class="overlay">
    <div class="overlay-card glass-panel">
      <p class="eyebrow">{{ introCopy.eyebrow }}</p>
      <h1 class="title">{{ introCopy.title }}</h1>
      <p class="subtitle">交互式生日贺卡，现已重构为 Vue 3 多端版本。</p>

      <ul class="step-list">
        <li v-for="step in introCopy.steps" :key="step">{{ step }}</li>
      </ul>

      <button class="cta-button" :disabled="busy" @click="$emit('start')">
        {{ busy ? '准备中...' : '进入魔法时刻' }}
      </button>

      <p class="caution">{{ introCopy.caution }}</p>
    </div>
  </section>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: clamp(1.2rem, 4vw, 2.4rem);
  background:
    linear-gradient(180deg, rgba(4, 2, 10, 0.45), rgba(4, 2, 10, 0.76)),
    radial-gradient(circle at top, rgba(255, 143, 177, 0.16), transparent 34%);
}

.overlay-card {
  width: min(100%, 34rem);
  padding: clamp(1.6rem, 4vw, 2.4rem);
  border-radius: 1.8rem;
  text-align: center;
}

.eyebrow {
  margin: 0 0 0.7rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.75rem;
}

.title {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 9vw, 5.4rem);
  line-height: 0.94;
}

.subtitle {
  margin: 0.8rem 0 1.3rem;
  color: rgba(247, 240, 255, 0.72);
  line-height: 1.7;
}

.step-list {
  margin: 0 0 1.6rem;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.8rem;
  text-align: left;
}

.step-list li {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  line-height: 1.6;
}

.cta-button {
  width: 100%;
  padding: 1rem 1.2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 95, 154, 1), rgba(110, 122, 255, 0.86));
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.01);
}

.cta-button:disabled {
  cursor: wait;
  opacity: 0.76;
}

.caution {
  margin: 1rem 0 0;
  color: rgba(247, 240, 255, 0.56);
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>
