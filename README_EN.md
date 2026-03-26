# Happy Birthday Vue 3 Refactor

This branch contains a `Vue 3 + Vite` refactor of the original Happy Birthday project.

## Goals

- Move the original single-file implementation into maintainable Vue components and composables
- Keep the core experience: particle cake, countdown, blowing interaction, and wish card
- Improve responsive behavior for desktop, tablet, and mobile
- Preserve the original `master` branch and perform the refactor in an isolated branch

## Stack

- Vue 3
- Vite
- Three.js
- MediaPipe Hands
- Web Audio API

## Features

- Intro overlay
- Gesture-triggered countdown
- Automatic fallback countdown when camera access is unavailable
- 3D particle cake scene
- Microphone-based blowing interaction
- Fallback input:
  - `Space` on desktop
  - long press on mobile
- Live cake color controls
- Flip-style birthday card
- Responsive layout for desktop and mobile viewports

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Important

Do not open the app with `file://`.

Camera and microphone permissions require `http://` or `https://`.

## Structure

```text
src/
  components/
  composables/
  utils/
  App.vue
  content.js
  main.js
  styles.css
```

## Verified

- Production build passes
- Desktop viewport loads correctly
- Mobile viewport loads correctly
- No browser console errors during smoke checks
