const mountedPortraits = new WeakMap()

/** Animated portraits use a still image whenever motion is unavailable or unwanted. */
export function mountPokemonPortrait(image, pokemon, options = {}) {
  mountedPortraits.get(image)?.destroy()
  const environment = options.environment ?? globalThis
  const document = environment.document
  const motion = environment.matchMedia?.('(prefers-reduced-motion: reduce)')
  const onLoad = options.onLoad ?? (() => {})
  const onError = options.onError ?? (() => {})
  const still = pokemon.artwork || ''
  const animated = pokemon.animatedArtwork || ''
  let active = options.active !== false
  let visible = !environment.IntersectionObserver
  let destroyed = false, terminal = false, animationFailed = false
  let generation = 0, source = '', observer, clearRequest = () => {}

  function show(nextSource, moving) {
    if (destroyed || terminal || source === nextSource) return
    clearRequest()
    const request = ++generation
    source = nextSource
    image.dataset.pokemonMotion = moving ? 'animated' : 'still'
    const current = () => !destroyed && generation === request && image.getAttribute('src') === nextSource
    const loaded = () => {
      if (!current() || !image.complete || !image.naturalWidth) return
      onLoad()
    }
    const failed = () => {
      if (!current()) return
      if (moving) {
        animationFailed = true
        refresh()
      } else {
        terminal = true
        clearRequest()
        onError()
      }
    }
    image.addEventListener('load', loaded)
    image.addEventListener('error', failed)
    clearRequest = () => {
      image.removeEventListener('load', loaded)
      image.removeEventListener('error', failed)
    }
    image.src = nextSource
  }

  function refresh() {
    if (destroyed || terminal) return
    if (!still) {
      terminal = true
      onError()
      return
    }
    const moving = Boolean(animated && animated !== still && !animationFailed && active && visible && !motion?.matches && !document?.hidden)
    show(moving ? animated : still, moving)
  }

  const controller = {
    setActive(value) { active = Boolean(value); refresh() },
    destroy() {
      if (destroyed) return
      destroyed = true
      generation++
      clearRequest()
      observer?.disconnect()
      motion?.removeEventListener('change', refresh)
      document?.removeEventListener('visibilitychange', refresh)
      if (mountedPortraits.get(image) === controller) {
        mountedPortraits.delete(image)
        if (image.getAttribute('src') === source) image.removeAttribute('src')
        delete image.dataset.pokemonMotion
      }
    },
  }
  mountedPortraits.set(image, controller)
  motion?.addEventListener('change', refresh)
  document?.addEventListener('visibilitychange', refresh)
  if (environment.IntersectionObserver) {
    observer = new environment.IntersectionObserver(entries => {
      if (destroyed) return
      const entry = entries.find(entry => entry.target === target)
      if (!entry) return
      visible = entry.isIntersecting
      refresh()
    })
    // Observe the containing surface: callers may hide the image until it loads.
    const target = options.visibilityTarget ?? image.parentElement ?? image
    observer.observe(target)
  }
  refresh()
  return controller
}
