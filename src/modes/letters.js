import { ROSTER } from '../../data/roster.js'
import { LETTER_SETS } from '../../data/reading/letter-sets.js'
import { chooseAdaptive, chooseDistinct } from '../core/select.js'
import { getPokemon, preloadArtwork } from '../core/pokeapi.js'
import { speak } from '../core/speech.js'

function shuffled(items, random = Math.random) {
  return [...items].sort(() => random() - 0.5)
}

export class LettersMode {
  constructor({ state, elements, engine, getProgress, onAttempt, onCorrect, settings }) {
    this.state = state
    this.elements = elements
    this.engine = engine
    this.getProgress = getProgress
    this.onAttempt = onAttempt
    this.onCorrect = onCorrect
    this.settings = settings
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
    this.elements.prompt.textContent = 'Loading…'
    this.elements.reveal.replaceChildren()
    this.elements.stage.className = 'stage thinking'
    this.elements.stage.textContent = '● ● ●'
    this.engine.clear()

    let pokemon
    try {
      pokemon = await getPokemon(ROSTER[answer.letter].slug)
    } catch {
      this.elements.prompt.textContent = 'Could not reach PokéAPI.'
      this.elements.stage.textContent = 'Check the connection, then tap Letters to retry.'
      return
    }

    this.elements.stage.className = 'stage'
    this.elements.stage.innerHTML = `<img src="${pokemon.artwork}" alt="${pokemon.name}, the sound anchor">`
    this.elements.prompt.textContent = 'Which letter does it start with?'

    const clash = { C: 'K', K: 'C' }[answer.letter]
    const distractors = chooseDistinct(
      items,
      2,
      [answer.id, clash ? `letter-sound:${clash}` : ''],
    )
    const options = shuffled([answer, ...distractors])

    this.engine.render({
      options,
      answerId: answer.id,
      labelFor: (option) => `Letter ${option.letter}`,
      onWrong: (option) => {
        this.onAttempt({ id: answer.id, kind: 'letter-sound', correct: false })
        speak(`That one is ${option.letter}. Try again.`)
      },
      onCorrect: () => {
        this.onAttempt({ id: answer.id, kind: 'letter-sound', correct: true })
        const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1)
        this.elements.prompt.textContent = 'Yes.'
        this.elements.reveal.innerHTML = `
          <div class="letter">${this.display(answer.letter)}</div>
          <div class="name"><b>${answer.letter}</b>${name.slice(1)}</div>`
        speak(`${ROSTER[answer.letter].sound}. ${name}. Letter ${answer.letter}.`)
        this.onCorrect()
      },
    })

    const preloadLetter = items[Math.floor(Math.random() * items.length)].letter
    getPokemon(ROSTER[preloadLetter].slug).then(preloadArtwork).catch(() => {})
  }
}
