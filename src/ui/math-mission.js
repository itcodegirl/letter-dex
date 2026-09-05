import { getPokemon } from '../core/pokeapi.js'
import { speak } from '../core/speech.js'
import { mountPokemonPortrait } from './pokemon-portrait.js'

const MISSIONS = [
  {
    name: 'Berry Delivery Crew',
    objective: 'Bring the berry pack!',
    request: 'Count a pack for me!',
    clue: 'Count the berries. Choose the number for this pack.',
    success: answer => `${answer} berries delivered!`,
    friends: ['bulbasaur', 'chikorita', 'eevee', 'piplup'],
  },
  {
    name: 'Bridge Crew',
    objective: 'Help them cross!',
    request: 'Bring the groups together.',
    clue: 'Bring both groups together. How many berries altogether?',
    success: () => 'Another bridge plank in place!',
    friends: ['totodile', 'mudkip', 'piplup', 'bulbasaur'],
  },
  {
    name: 'Beacon Partners',
    objective: 'Light the way together!',
    request: 'Help me fill the pack.',
    clue: 'Some berries are already here. Look at how many we need. Find how many more.',
    success: () => 'The beacon glows a little brighter!',
    friends: ['piplup', 'eevee', 'chikorita', 'totodile'],
  },
]

const activeMissions = new WeakMap()

export function mathMissionFor(stage) {
  return MISSIONS[stage] ?? MISSIONS[0]
}

/**
 * Place this root before the question screen, over the existing 3D route.
 * Companions describe the mission; only the Choose engine accepts an answer.
 */
export function createMathMission(root, { stage = 0, correct = 0, setName = '', isCurrentRound = () => true } = {}) {
  const mission = mathMissionFor(stage)
  const friendIndex = Math.floor(Math.max(0, Number(correct) || 0) / 3) % mission.friends.length
  const caughtSlug = mission.friends[friendIndex]
  const token = {}
  activeMissions.set(root, token)
  let complete = false
  const portraits = []
  const current = () => activeMissions.get(root) === token && isCurrentRound()
  const canListen = () => current() && !complete
  root.className = 'math-mission'
  root.dataset.mission = String(stage)
  root.setAttribute('aria-label', mission.name)
  root.innerHTML = `<div class="math-mission-heading">
      <span class="material-symbols-rounded" aria-hidden="true">explore</span>
      <div><h2 class="math-mission-objective"></h2><p class="math-mission-title"></p></div>
    </div>
    <div class="math-mission-companion math-mission-guide"></div>
    <div class="math-mission-companion math-mission-friend">
      <p class="math-mission-request" aria-live="polite"></p>
    </div>`
  root.querySelector('.math-mission-objective').textContent = mission.objective
  root.querySelector('.math-mission-title').textContent = `${mission.name}${setName ? ` · ${setName}` : ''}`
  const request = root.querySelector('.math-mission-request')
  request.textContent = mission.request

  const guide = addCompanion(root.querySelector('.math-mission-guide'), 'pikachu', 'Your guide', () => {
    speak(`${mission.objective} ${mission.clue}`)
  })
  const friend = addCompanion(root.querySelector('.math-mission-friend'), caughtSlug, 'Your friend', () => {
    speak(mission.clue)
  })

  function addCompanion(container, slug, placeholder, listen) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'math-mission-pokemon'
    button.setAttribute('aria-label', `${placeholder}. Hear the mission.`)
    button.setAttribute('aria-busy', 'true')
    button.innerHTML = `<span class="math-mission-portrait">
        <span class="math-mission-placeholder material-symbols-rounded" aria-hidden="true">explore</span>
      </span>
      <span class="math-mission-name"></span>
      <span class="math-mission-tap"><span class="material-symbols-rounded" aria-hidden="true">volume_up</span>Tap to listen</span>`
    button.querySelector('.math-mission-name').textContent = placeholder
    button.addEventListener('click', () => {
      if (!canListen()) return
      const portrait = button.querySelector('.math-mission-portrait')
      portrait.classList.remove('mission-listening')
      void portrait.offsetWidth
      portrait.classList.add('mission-listening')
      listen()
    })
    container.append(button)
    const ready = getPokemon(slug).then(pokemon => {
      if (!current()) return
      button.setAttribute('aria-busy', 'false')
      button.setAttribute('aria-label', `${pokemon.name}. Hear the mission.`)
      button.querySelector('.math-mission-name').textContent = pokemon.name
      if (!pokemon.artwork) return
      const portrait = button.querySelector('.math-mission-portrait')
      const image = document.createElement('img')
      image.alt = ''
      image.decoding = 'async'
      portrait.append(image)
      portraits.push(mountPokemonPortrait(image, pokemon, {
        onLoad: () => { if (current()) { image.hidden = false; portrait.classList.add('has-artwork') } },
        onError: () => {
          if (!current()) return
          image.hidden = true
          portrait.classList.remove('has-artwork')
        },
      }))
    }).catch(() => {
      if (!current()) return
      // The instruction and tap target remain usable when a portrait cannot load.
      button.setAttribute('aria-busy', 'false')
    })
    return { button, ready }
  }

  return {
    caughtSlug,
    mission,
    ready: Promise.all([guide.ready, friend.ready]),
    celebrate(answer) {
      if (!current() || complete) return
      complete = true
      root.querySelectorAll('.mission-listening').forEach(portrait => portrait.classList.remove('mission-listening'))
      root.classList.add('is-complete')
      request.textContent = mission.success(answer)
      guide.button.disabled = true
      friend.button.disabled = true
    },
    destroy() {
      if (activeMissions.get(root) === token) activeMissions.delete(root)
      portraits.forEach(portrait => portrait.destroy())
    },
  }
}
