import { ROSTER } from '../../data/roster.js'
import { LETTER_SETS } from '../../data/reading/letter-sets.js'
import { chooseAdaptive, chooseDistinct } from '../core/select.js'
import { getPokemon, preloadArtwork } from '../core/pokeapi.js'
import { speak } from '../core/speech.js'

function shuffled(items, random = Math.random) {
  return [...items].sort(() => random() - 0.5)
}

export class LettersMode {
  constructor({ state, elements, engine, getProgress, onAttempt, onCorrect, settings, isCurrentRound }) {
    this.state = state
    this.elements = elements
    this.engine = engine
    this.getProgress = getProgress
    this.onAttempt = onAttempt
    this.onCorrect = onCorrect
    this.settings = settings
    this.isCurrentRound = isCurrentRound
  }

  activeLetters() {
    if (this.settings.letterSet === 'all') return Object.keys(ROSTER)
    return LETTER_SETS[this.settings.letterSet]?.letters ?? LETTER_SETS[0].letters
  }

  display(letter) {
    return this.settings.letterCase === 'upper' ? letter : letter.toLowerCase()
  }

  async play() {
    const items = this.activeLetters().map((letter) => ({
      id: `letter-sound:${letter}`,
      letter,
      display: this.display(letter),
    }))
    const answer = chooseAdaptive(items, this.getProgress)
    this.answer = answer
    this.elements.prompt.textContent = 'Listen to find the next stone.'
    this.elements.reveal.replaceChildren()
    this.elements.stage.className = 'stage'
    this.elements.stage.setAttribute('aria-busy', 'false')
    this.engine.clear()

    let pokemon = null
    let answered = false
    getPokemon(ROSTER[answer.letter].slug).then(result => {
      if (!this.isCurrentRound()) return
      pokemon = result
      const image = this.elements.stage.querySelector('.encounter-pokemon')
      if (image && pokemon.artwork) {
        image.src = pokemon.artwork
        image.hidden = false
        if (answered) { image.classList.remove('is-mystery'); image.alt = `${pokemon.name} discovered` }
      }
    }).catch(() => {})

    if (!this.isCurrentRound()) return

    this.elements.stage.className = 'stage'
    this.elements.stage.setAttribute('aria-busy', 'false')
    this.elements.stage.innerHTML = `
      <div class="encounter">
        <img class="encounter-pokemon is-mystery" hidden alt="Mystery Pokémon">
        <button class="listen" type="button" aria-label="Listen to the letter sound">
          <span class="material-symbols-rounded" aria-hidden="true">volume_up</span>
          <span>Listen</span>
        </button>
      </div>`
    this.elements.stage.querySelector('img').onerror = event => { event.target.hidden = true }

    const clash = { C: 'K', K: 'C' }[answer.letter]
    const distractors = chooseDistinct(
      items,
      2,
      [answer.id, clash ? `letter-sound:${clash}` : ''],
    )
    const options = shuffled([answer, ...distractors])

    const renderChoices = () => {
      this.engine.render({
        options,
        answerId: answer.id,
        labelFor: (option) => `Letter ${option.letter}`,
        onWrong: (option) => {
          if (!this.isCurrentRound()) return
          this.onAttempt({ id: answer.id, kind: 'letter-sound', correct: false })
          this.elements.prompt.textContent = 'Listen, then try again.'
          this.elements.reveal.textContent = 'Try another stone. Tap Listen to hear the clue again.'
          speak(`That one says ${ROSTER[option.letter].sound}. Listen, then try again.`)
        },
        onCorrect: () => {
          if (!this.isCurrentRound()) return
          answered = true
          this.onAttempt({ id: answer.id, kind: 'letter-sound', correct: true })
          const name = pokemon?.name
          const image = this.elements.stage.querySelector('.encounter-pokemon')
          image.classList.remove('is-mystery')
          image.alt = name ? `${name} discovered` : 'Discovery artwork'
          this.elements.stage.classList.add('discovered')
          this.elements.prompt.textContent = name ? `You found ${name}!` : 'You raised a stone!'
          this.elements.reveal.innerHTML = `
            <div class="letter">${this.display(answer.letter)}</div>
            <div class="name">${name ?? 'A new path opens.'}</div>`
          speak(`${ROSTER[answer.letter].sound}. ${name ? `${name}. ` : ''}Letter ${answer.letter}.`)
          this.onCorrect()
        },
      })
    }

    renderChoices()
    const listen = this.elements.stage.querySelector('.listen')
    listen.focus({ preventScroll: true })
    listen.addEventListener('click', () => {
      if (!this.isCurrentRound() || answered) return
      speak(ROSTER[answer.letter].sound, { rate: 0.72 })
      this.elements.prompt.textContent = 'Which letter matches?'
    })

    const preloadLetter = items[Math.floor(Math.random() * items.length)].letter
    getPokemon(ROSTER[preloadLetter].slug).then(preloadArtwork).catch(() => {})
  }
}
