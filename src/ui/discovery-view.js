import { getPokemon, preloadArtwork } from '../core/pokeapi.js'
import { speak } from '../core/speech.js'
import { followFootprint, openDiscoveryJournal } from '../core/discoveries.js'

const icon = name => `<span class="material-symbols-rounded" aria-hidden="true">${name}</span>`

export class DiscoveryView {
  constructor(root, { save, camp, next, buddy, destination }) {
    Object.assign(this, { root, save, camp, next, buddy, destination })
    this.version = 0
  }
  cancel() { this.version++; this.root.replaceChildren() }

  show(entry, { replay = false } = {}) {
    const version = ++this.version
    const current = () => version === this.version
    const step = replay ? 'journal' : entry.step
    const destination = step === 'journal' ? this.destination(entry) : null
    this.root.dataset.step = step
    this.root.replaceChildren()
    const top = document.createElement('p'); top.className = 'discovery-chapter'; top.textContent = `${entry.title} complete`; this.root.append(top)
    const heading = document.createElement('h1')
    heading.textContent = step === 'footprints' ? 'Who is hiding here?' : step === 'meet' ? (entry.isNew ? 'You found a new friend!' : 'A friend came to see you!') : 'Remember this adventure!'
    this.root.append(heading)
    const display = document.createElement('div')
    display.className = step === 'journal' ? 'journal-spread' : `discovery-creature${step === 'footprints' ? ' peeking' : ''}`
    const portrait = document.createElement('img'); portrait.alt = ''; portrait.hidden = true
    const name = document.createElement('p'); name.className = 'discovery-name'; name.textContent = 'Your discovery is saved.'
    let pokemonName = null
    const hear = document.createElement('button'); hear.className = 'discovery-hear'; hear.innerHTML = `${icon('volume_up')}<span>Hear name</span>`
    hear.addEventListener('click', () => { if (current()) speak(pokemonName ?? 'Your discovery is saved. Its picture will return when the connection is ready.') })
    if (step === 'journal') {
      const left = document.createElement('div'); left.className = 'journal-page journal-left'; left.append(portrait, name, hear)
      const right = document.createElement('div'); right.className = 'journal-page journal-right'
      const title = document.createElement('h2'); title.textContent = entry.memory
      const stamp = document.createElement('p'); stamp.className = 'journey-stamp'; stamp.innerHTML = `${icon('verified')} Adventure remembered`
      const preview = document.createElement('button'); preview.className = 'destination-preview'
      preview.setAttribute('aria-label', `Hear next adventure: ${destination.title}`)
      const scene = document.createElement('img'); scene.src = `./assets/destinations/${destination.image}.png`; scene.alt = ''
      const label = document.createElement('span'); label.className = 'destination-label'; label.innerHTML = icon('volume_up')
      const caption = document.createElement('span'); caption.textContent = `Next: ${destination.title}`; label.append(caption)
      preview.append(scene, label)
      preview.addEventListener('click', () => {
        if (!current()) return
        this.buddy(destination.invitation); speak(destination.invitation)
      })
      right.append(title, stamp, preview); display.append(left, right)
    } else if (step !== 'footprints') display.append(portrait)
    this.root.append(display)
    if (step === 'meet') this.root.append(name)
    const status = document.createElement('p'); status.className = 'discovery-status'; status.setAttribute('role', 'status')
    const retry = document.createElement('button'); retry.className = 'discovery-retry'; retry.textContent = 'Load picture again'; retry.hidden = true
    let loading = false
    const load = async () => {
      if (loading) return
      loading = true; retry.hidden = true; status.textContent = 'Looking for your friend…'
      try {
        const pokemon = await getPokemon(entry.slug)
        if (!current()) return
        pokemonName = pokemon.name
        name.textContent = pokemon.name
        portrait.onload = () => { if (current()) { portrait.hidden = false; status.textContent = ''; loading = false } }
        portrait.onerror = () => { if (current()) { portrait.hidden = true; loading = false; status.textContent = 'Your friend is saved. The picture is taking a little longer.'; retry.hidden = false } }
        portrait.alt = pokemon.name
        if (!pokemon.artwork) throw new Error('No artwork')
        portrait.src = pokemon.artwork
      } catch {
        if (!current()) return
        loading = false; status.textContent = 'Your friend is saved. You can keep going or try the picture again.'; retry.hidden = false
      }
    }
    retry.addEventListener('click', load)
    const controls = document.createElement('div'); controls.className = 'discovery-controls'
    if (step === 'footprints') {
      const hint = document.createElement('p'); hint.className = 'discovery-hint'; hint.textContent = `Tap footprint ${entry.footprints + 1}.`
      this.root.append(hint)
      const prints = document.createElement('div'); prints.className = 'footprint-path'
      for (let i = 0; i < 3; i++) {
        const button = document.createElement('button'); button.className = `footprint${i < entry.footprints ? ' followed' : ''}`
        button.innerHTML = `${icon(i < entry.footprints ? 'check' : 'pets')}<span>${i + 1}</span>`
        button.setAttribute('aria-label', `Footprint ${i + 1}`); button.disabled = i !== entry.footprints
        button.addEventListener('click', () => {
          if (!current() || !followFootprint(entry, i)) return
          this.save(); speak(entry.step === 'meet' ? 'There you are!' : 'A little closer!'); this.show(entry)
        })
        prints.append(button)
      }
      this.root.append(prints)
      const clue = document.createElement('button'); clue.innerHTML = `${icon('volume_up')} Hear clue`; clue.className = 'discovery-secondary'
      clue.addEventListener('click', () => speak(`Follow the footprints. Tap footprint ${entry.footprints + 1} to find our friend.`)); controls.append(clue)
      this.buddy([
        'Look! Footprints lead into the clearing.',
        'We’re getting closer. Follow the next footprint.',
        'One more footprint. Who could it be?',
      ][entry.footprints])
    } else if (step === 'meet') {
      const hello = document.createElement('button'); hello.className = 'discovery-primary'; hello.innerHTML = `Say hello ${icon('volume_up')}`
      hello.addEventListener('click', () => {
        if (!current()) return
        speak(pokemonName ? `Hello, ${pokemonName}! We found the way together.` : 'Hello, friend! We found the way together.')
        entry.greeted = true; this.save(); portrait.classList.remove('friend-wave'); void portrait.offsetWidth; portrait.classList.add('friend-wave')
        journal.hidden = false; this.buddy('Let’s remember this in our journal!')
      })
      const journal = document.createElement('button'); journal.className = 'discovery-primary'; journal.textContent = 'Open adventure journal'; journal.hidden = !entry.greeted
      journal.addEventListener('click', () => { if (current() && openDiscoveryJournal(entry)) { this.save(); this.show(entry) } })
      controls.append(hello, journal)
      this.buddy('We found the way together!')
    } else {
      const next = document.createElement('button'); next.className = 'discovery-primary'; next.textContent = destination.action
      next.addEventListener('click', () => { if (current()) this.next(entry) }); controls.append(next)
      const teaser = document.createElement('p'); teaser.className = 'discovery-teaser'; teaser.textContent = 'Tap the picture to hear what’s next.'
      this.root.append(teaser); this.buddy('A memory to keep. Where shall we go next?')
    }
    const camp = document.createElement('button'); camp.className = 'discovery-secondary'; camp.textContent = 'Back to camp'; camp.addEventListener('click', this.camp)
    controls.append(camp); this.root.append(status, retry, controls)
    const focus = this.root.querySelector('.footprint:not(:disabled), .discovery-primary')
    focus?.focus({ preventScroll: true })
    // Warm the artwork without putting the surprise in the visible or accessible UI.
    if (step === 'footprints') getPokemon(entry.slug).then(preloadArtwork).catch(() => {})
    else load()
  }

  history(entries, onSelect) {
    this.cancel(); this.root.dataset.step = 'history'
    const h = document.createElement('h1'); h.textContent = 'Adventure journal'; this.root.append(h)
    const list = document.createElement('div'); list.className = 'journal-list'
    if (!entries.length) { const p = document.createElement('p'); p.textContent = 'Your first memory is waiting at the end of the trail.'; list.append(p) }
    for (const entry of [...entries].reverse()) {
      const b = document.createElement('button'); b.className = 'journal-entry'
      b.textContent = `${entry.title} · ${entry.step === 'journal' ? 'Remember this adventure' : 'Discovery saved'}`
      b.addEventListener('click', () => onSelect(entry)); list.append(b)
    }
    const camp = document.createElement('button'); camp.className = 'discovery-secondary'; camp.textContent = 'Back to camp'; camp.addEventListener('click', this.camp)
    this.root.append(list, camp); this.buddy('All the places we have explored together.')
  }
}
