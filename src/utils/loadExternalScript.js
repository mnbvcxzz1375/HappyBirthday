const loadedScripts = new Map()

export function loadExternalScript(src) {
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src)
  }

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.crossOrigin = 'anonymous'
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
      once: true,
    })
    document.head.appendChild(script)
  })

  loadedScripts.set(src, promise)
  return promise
}
