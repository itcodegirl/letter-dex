import test from 'node:test'
import assert from 'node:assert/strict'
import { mountPokemonPortrait } from '../src/ui/pokemon-portrait.js'

const pokemon = { artwork: 'https://example.test/pikachu.png', animatedArtwork: 'https://example.test/pikachu.gif' }

class Events {
  listeners = new Map()
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type).add(listener)
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener) }
  emit(type) { for (const listener of [...(this.listeners.get(type) ?? [])]) listener() }
  callbacks(type) { return [...(this.listeners.get(type) ?? [])] }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0) }
}

class Portrait extends Events {
  dataset = {}
  hidden = true
  parentElement = {}
  attributes = new Map()
  requests = []
  complete = false
  naturalWidth = 0
  set src(value) {
    this.attributes.set('src', value)
    this.requests.push(value)
    this.complete = false
    this.naturalWidth = 0
  }
  get src() { return this.getAttribute('src') }
  getAttribute(name) { return this.attributes.get(name) ?? null }
  removeAttribute(name) { this.attributes.delete(name) }
  load() { this.complete = true; this.naturalWidth = 96; this.emit('load') }
  fail() { this.complete = true; this.naturalWidth = 0; this.emit('error') }
}

function setup({ reduce = false, hidden = false, observe = true } = {}) {
  const image = new Portrait()
  const motion = new Events(); motion.matches = reduce
  const document = new Events(); document.hidden = hidden
  const observers = []
  const environment = { document, matchMedia: () => motion }
  if (observe) environment.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe(target) { this.target = target }
    disconnect() { this.disconnected = true }
    intersect(visible) { this.callback([{ target: this.target, isIntersecting: visible }]) }
  }
  return { image, motion, document, observers, environment }
}

test('a hidden portrait loads a still, then animates only when its containing surface is visible', () => {
  const { image, observers, environment } = setup()
  let loaded = 0
  const portrait = mountPokemonPortrait(image, pokemon, { environment, onLoad: () => { loaded++ } })
  assert.equal(image.src, pokemon.artwork)
  assert.equal(observers[0].target, image.parentElement)
  image.load()
  assert.equal(loaded, 1)
  assert.equal(image.hidden, true, 'the caller owns visibility')
  observers[0].intersect(true)
  assert.equal(image.src, pokemon.animatedArtwork)
  assert.equal(image.dataset.pokemonMotion, 'animated')
  image.load()
  observers[0].intersect(false)
  assert.equal(image.src, pokemon.artwork)
  assert.equal(image.dataset.pokemonMotion, 'still')
  portrait.destroy()
})

test('a mystery stays still until revealed, and reduced motion/background changes stop GIF playback', () => {
  const { image, motion, document, observers, environment } = setup()
  const target = {}
  const portrait = mountPokemonPortrait(image, pokemon, { environment, active: false, visibilityTarget: target })
  assert.equal(observers[0].target, target)
  observers[0].intersect(true)
  assert.equal(image.src, pokemon.artwork)
  portrait.setActive(true)
  assert.equal(image.src, pokemon.animatedArtwork)
  motion.matches = true; motion.emit('change')
  assert.equal(image.src, pokemon.artwork)
  document.hidden = true; document.emit('visibilitychange')
  motion.matches = false; motion.emit('change')
  assert.equal(image.src, pokemon.artwork)
  document.hidden = false; document.emit('visibilitychange')
  assert.equal(image.src, pokemon.animatedArtwork)
  portrait.setActive(false)
  assert.equal(image.src, pokemon.artwork)
  portrait.destroy()
})

test('initial reduced-motion and background preferences never request the animation', () => {
  for (const preference of [{ reduce: true }, { hidden: true }]) {
    const { image, observers, environment } = setup(preference)
    const portrait = mountPokemonPortrait(image, pokemon, { environment })
    observers[0].intersect(true)
    image.load()
    assert.deepEqual(image.requests, [pokemon.artwork])
    portrait.destroy()
  }
})

test('an unavailable animation falls back once and does not retry on every visibility change', () => {
  const { image, observers, environment } = setup()
  let failures = 0, loaded = 0
  const portrait = mountPokemonPortrait(image, pokemon, { environment, onLoad: () => { loaded++ }, onError: () => { failures++ } })
  observers[0].intersect(true)
  image.fail()
  assert.equal(image.src, pokemon.artwork)
  assert.equal(failures, 0)
  image.load()
  assert.equal(loaded, 1)
  observers[0].intersect(false); observers[0].intersect(true)
  assert.equal(image.requests.filter(source => source === pokemon.animatedArtwork).length, 1)
  assert.equal(image.dataset.pokemonMotion, 'still')
  portrait.destroy()
})

test('missing animation stays usable, while a missing or failed still produces one terminal error', () => {
  for (const detail of [{ artwork: pokemon.artwork }, {}]) {
    const { image, observers, environment } = setup()
    let failures = 0
    const portrait = mountPokemonPortrait(image, detail, { environment, onError: () => { failures++ } })
    observers[0].intersect(true)
    if (detail.artwork) {
      image.load()
      assert.equal(failures, 0)
      image.fail()
    }
    assert.equal(failures, 1)
    observers[0].intersect(false); observers[0].intersect(true)
    image.fail()
    assert.equal(failures, 1)
    portrait.destroy()
  }
})

test('old image completions cannot publish or fail a newer source or a destroyed portrait', () => {
  const { image, observers, motion, document, environment } = setup()
  let loaded = 0, failures = 0
  const portrait = mountPokemonPortrait(image, pokemon, { environment, onLoad: () => { loaded++ }, onError: () => { failures++ } })
  const oldLoad = image.callbacks('load')[0], oldError = image.callbacks('error')[0]
  observers[0].intersect(true)
  image.complete = true; image.naturalWidth = 96
  oldLoad(); oldError()
  assert.equal(image.src, pokemon.animatedArtwork)
  assert.equal(loaded, 0); assert.equal(failures, 0)
  const latestLoad = image.callbacks('load')[0], latestError = image.callbacks('error')[0]
  portrait.destroy(); portrait.destroy()
  latestLoad(); latestError(); observers[0].intersect(true)
  assert.equal(loaded, 0); assert.equal(failures, 0)
  assert.equal(image.src, null)
  assert.equal(image.dataset.pokemonMotion, undefined)
  assert.equal(image.listenerCount, 0)
  assert.equal(motion.listenerCount, 0)
  assert.equal(document.listenerCount, 0)
  assert.equal(observers[0].disconnected, true)
})

test('rebinding a persistent companion disposes its old controller without stopping the new one', () => {
  const { image, observers, environment } = setup()
  const old = mountPokemonPortrait(image, pokemon, { environment })
  observers[0].intersect(true)
  const next = mountPokemonPortrait(image, { artwork: 'https://example.test/eevee.png' }, { environment })
  old.destroy()
  assert.equal(observers[0].disconnected, true)
  assert.equal(image.src, 'https://example.test/eevee.png')
  assert.equal(image.listenerCount, 2)
  next.destroy()
})

test('browsers without intersection observation still respect motion preferences', () => {
  const { image, environment } = setup({ observe: false })
  const portrait = mountPokemonPortrait(image, pokemon, { environment })
  assert.equal(image.src, pokemon.animatedArtwork)
  portrait.setActive(false)
  assert.equal(image.src, pokemon.artwork)
  portrait.destroy()
})
