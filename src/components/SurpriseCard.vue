<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  revealVisible: Boolean,
  cardVisible: Boolean,
  flipped: Boolean,
  wishLines: {
    type: Array,
    default: () => [],
  },
  posterSrc: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['reveal', 'flip', 'close'])

const typedText = ref('')
const messageRef = ref(null)
let timer = 0

const clearTyping = () => {
  if (timer) {
    window.clearTimeout(timer)
    timer = 0
  }
}

const runTypewriter = async () => {
  clearTyping()
  typedText.value = ''

  const text = props.wishLines.join('\n')
  let index = 0

  const step = async () => {
    typedText.value += text[index]
    index += 1
    await nextTick()
    if (messageRef.value) {
      messageRef.value.scrollTop = messageRef.value.scrollHeight
    }
    if (index < text.length) {
      timer = window.setTimeout(step, text[index - 1] === '\n' ? 260 : 42)
    }
  }

  if (text.length) {
    timer = window.setTimeout(step, 220)
  }
}

watch(
  () => props.flipped,
  (value) => {
    if (value) {
      runTypewriter()
    } else {
      clearTyping()
      typedText.value = ''
    }
  },
)

watch(
  () => props.visible,
  (value) => {
    if (!value) {
      clearTyping()
      typedText.value = ''
    }
  },
)

onBeforeUnmount(clearTyping)
</script>

<template>
  <section v-if="visible" class="surprise-layer" :class="{ active: visible }">
    <button v-if="revealVisible" class="reveal-button" type="button" @click="emit('reveal')">
      打开你的生日贺卡
    </button>

    <div v-if="cardVisible" class="card-shell" :class="{ flipped }">
      <div class="card-inner">
        <article class="card-face card-front glass-panel">
          <div class="poster-frame">
            <img :src="posterSrc" alt="Birthday poster" />
          </div>
          <div class="front-copy">
            <p class="front-label">For Your Special Day</p>
            <h2>Happy Birthday</h2>
            <p>这不是一张普通贺卡，而是一份专门为你保留的惊喜。</p>
          </div>
          <button type="button" class="front-button" @click="emit('flip')">
            看看里面写了什么
          </button>
        </article>

        <article class="card-face card-back glass-panel">
          <p class="back-kicker">Wish Card</p>
          <h3>致最特别的你</h3>
          <div ref="messageRef" class="message soft-scroll">{{ typedText }}</div>
          <button type="button" class="close-button" @click="emit('close')">收起贺卡</button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.surprise-layer {
  position: absolute;
  inset: 0;
  z-index: 18;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 2rem);
  background: rgba(4, 2, 10, 0.34);
  backdrop-filter: blur(6px);
}

.reveal-button {
  padding: 1.1rem 1.8rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 231, 239, 0.94));
  color: #bb3164;
  font-weight: 800;
  box-shadow: 0 18px 44px rgba(255, 143, 177, 0.25);
  cursor: pointer;
}

.card-shell {
  perspective: 1400px;
  width: min(100%, 24rem);
  aspect-ratio: 3 / 4;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 720ms cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-style: preserve-3d;
}

.card-shell.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  padding: 1rem;
  border-radius: 1.6rem;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
}

.card-front {
  gap: 1rem;
}

.card-back {
  transform: rotateY(180deg);
  padding: clamp(1.2rem, 4vw, 1.6rem);
}

.poster-frame {
  flex: 1;
  border-radius: 1.15rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.poster-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.front-copy {
  padding: 0.3rem 0.2rem 0;
}

.front-label,
.back-kicker {
  margin: 0;
  color: rgba(247, 240, 255, 0.56);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.front-copy h2,
.card-back h3 {
  margin: 0.3rem 0 0.7rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 7vw, 2.8rem);
  line-height: 0.96;
}

.front-copy p {
  margin: 0;
  color: rgba(247, 240, 255, 0.72);
  line-height: 1.65;
}

.front-button,
.close-button {
  margin-top: auto;
  padding: 0.95rem 1.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.message {
  flex: 1;
  margin: 0.4rem 0 1rem;
  white-space: pre-line;
  line-height: 1.8;
  color: rgba(247, 240, 255, 0.82);
  overflow: auto;
  padding-right: 0.4rem;
}
</style>
