import { GRAPHEMES, wordFromGraphemes } from '../../data/graphemes.js'
import { ROSTER } from '../../data/roster.js'
import { cumulativeWords } from '../../data/reading/word-sets.js'
import { chooseAdaptive } from '../core/select.js'
import { getPokemon } from '../core/pokeapi.js'
import { speak, speakWord } from '../core/speech.js'

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function sharedPositions(a, b) {
  return a.filter((grapheme, index) => grapheme === b[index]).length
}

export class WordsMode {
  constructor({ state, elements, engine, getProgress, onAttempt, onCorrect, settings, activeLetters }) {
    this.state = state
    this.elements = elements
    this.engine = engine
    this.getProgress = getProgress
    this.onAttempt = onAttempt
    this.onCorrect = onCorrect
    this.settings = settings
    this.activeLetters = activeLetters
  }

  items() {
    return cumulativeWords(this.settings.wordSet)
      .map((graphemes) => {
        const word = wordFromGraphemes(graphemes)
        return { id: `word:${word}`, word, graphemes, display: word }
      })
  }

  distractors(answer, allItems) {
    return allItems
      .filter((item) => item.id !== answer.id)
      .sort((a, b) => {
        const lengthPenaltyA = Math.abs(a.graphemes.length - answer.graphemes.length) * 10
        const lengthPenaltyB = Math.abs(b.graphemes.length - answer.graphemes.length) * 10
        return (
          lengthPenaltyA - sharedPositions(a.graphemes, answer.graphemes)
          - (lengthPenaltyB - sharedPositions(b.graphemes, answer.graphemes))
          || Math.random() - 0.5
        )
      })
      .slice(0, 2)
  }

  play() {
    const items = this.items()
    const requestedLength = this.settings.wordLength === 'any'
      ? null
      : Number(this.settings.wordLength)
    const answerPool = items.filter((item) => requestedLength === null || item.graphemes.length === requestedLength)
    const answer = chooseAdaptive(answerPool.length ? answerPool : items, this.getProgress)
    this.answer = answer
    this.elements.prompt.textContent = 'Tap to hear the word'
    this.elements.reveal.replaceChildren()
    this.engine.clear()

    const listen = document.createElement('button')
    listen.className = 'listen'
    listen.type = 'button'
    listen.setAttribute('aria-label', 'Hear the word')
    listen.innerHTML = `
      <span class="material-symbols-rounded" aria-hidden="true">volume_up</span>
      Listen`
    this.elements.stage.className = 'stage'
    this.elements.stage.replaceChildren(listen)

    listen.addEventListener('click', () => {
      speak(answer.word, { rate: 0.85 })
      this.elements.prompt.textContent = 'Which one is it?'
      this.engine.render({
        options: shuffled([answer, ...this.distractors(answer, items)]),
        answerId: answer.id,
        className: 'word',
        labelFor: (option) => `Word ${option.word}`,
        onWrong: (option) => {
          this.onAttempt({ id: answer.id, kind: 'word', correct: false })
          speak(`That says ${option.word}. Try again.`)
        },
        onCorrect: async () => {
          this.onAttempt({ id: answer.id, kind: 'word', correct: true })
          this.elements.prompt.textContent = 'You read it.'
          this.elements.reveal.innerHTML = `
            <div class="word">${answer.graphemes.map((part) => `<span>${part}</span>`).join('')}</div>`
          this.elements.reveal.querySelectorAll('span').forEach((span, index) => {
            window.setTimeout(() => span.classList.add('lit'), 350 * index)
          })
          speakWord(answer.graphemes, GRAPHEMES)

          const letters = this.activeLetters()
          const letter = letters[Math.floor(Math.random() * letters.length)]
          const slug = ROSTER[letter].slug
          try {
            const pokemon = await getPokemon(slug)
            this.elements.stage.innerHTML = `<img src="${pokemon.artwork}" alt="${pokemon.name} caught">`
          } catch {
            this.elements.stage.textContent = 'Caught!'
          }
          this.onCorrect({ caughtSlug: slug })
        },
      })
    }, { once: true })
  }
}
