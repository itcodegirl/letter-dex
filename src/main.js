import { ROSTER } from '../data/roster.js'
import { LETTER_SETS } from '../data/reading/letter-sets.js'
import { WORD_SETS } from '../data/reading/word-sets.js'
import { ChooseEngine } from './engines/choose.js'
import {
  completeSession,
  exportProgress,
  getItemProgress,
  importProgress,
  loadProgress,
  recordAttempt,
  recordCatch,
  saveProgress,
} from './core/progress.js'
import { LettersMode } from './modes/letters.js'
import { WordsMode } from './modes/words.js'
import { renderParentView } from './ui/parent-view.js'
import { renderPokedex } from './ui/pokedex-view.js'
import { RoundLifecycle } from './core/round-lifecycle.js'
import { getPokemon } from './core/pokeapi.js'
import { speak } from './core/speech.js'

const SESSION_CAP = 8

function byId(id) {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Missing element #${id}`)
  return element
}

const elements = {
  appShell: byId('appShell'),
  prompt: byId('prompt'),
  stage: byId('stage'),
  reveal: byId('reveal'),
  keys: byId('keys'),
  meter: byId('meter'),
  count: byId('count'),
  badges: byId('badges'),
  playView: byId('playView'),
  pokedexView: byId('pokedexView'),
  sessionProgress: byId('sessionProgress'),
  lettersSettings: byId('lettersSettings'),
  wordsSettings: byId('wordsSettings'),
  letterPresets: byId('letterPresets'),
  wordPresets: byId('wordPresets'),
  caseToggle: byId('caseToggle'),
  lengthToggle: byId('lengthToggle'),
  parentView: byId('parentView'),
  exportButton: byId('exportButton'),
  importInput: byId('importInput'),
  backupStatus: byId('backupStatus'),
}

let state = loadProgress()
let mode = state.settings.mode === 'pokedex' ? 'letters' : state.settings.mode
let sessionEnded = false
let atCamp = true
let trail = null
const lifecycle = new RoundLifecycle()
const engine = new ChooseEngine(elements.keys)

function sceneStatus(unavailable) {
  byId('sceneStatus').textContent = unavailable ? 'Simple scenery active. Your adventure still works.' : ''
}
import('./render/trail.js').then(({ createTrail }) => {
  trail = createTrail(byId('world'), sceneStatus)
  trail.setProgress(state.activeSession.correct)
}).catch(() => sceneStatus(true))
window.addEventListener('pagehide', () => { trail?.dispose(); lifecycle.cancel() })
getPokemon('pikachu').then(pokemon => {
  const image = byId('buddyImage')
  image.alt = `${pokemon.name}, your companion`
  image.onload = () => { image.hidden = false }
  image.onerror = () => { image.hidden = true }
  image.src = pokemon.artwork
}).catch(() => {})

function persist() {
  byId('saveStatus').textContent = saveProgress(state) ? '' : 'Progress could not be saved. Ask a grown-up to export it.'
  renderParentView(elements.parentView, state)
}

function activeLetters() {
  if (state.settings.letterSet === 'all') return Object.keys(ROSTER)
  return LETTER_SETS[state.settings.letterSet]?.letters ?? LETTER_SETS[0].letters
}

function getProgress(id) {
  return getItemProgress(state, id)
}

function handleAttempt(attempt) {
  recordAttempt(state, attempt)
  if (!attempt.correct) byId('buddyLine').textContent = 'Listen again. We can try another stone.'
  persist()
}

function paintProgress(displayCount = state.activeSession.correct) {
  const bounded = Math.min(displayCount, SESSION_CAP)
  trail?.setProgress(bounded)
  elements.count.textContent = `${bounded} of ${SESSION_CAP}`
  elements.meter.replaceChildren()
  for (let index = 0; index < SESSION_CAP; index += 1) {
    const step = document.createElement('i')
    step.className = `trail-step${index < bounded ? ' complete' : ''}${index === bounded ? ' current' : ''}`
    elements.meter.append(step)
  }
  elements.badges.replaceChildren()
  for (let index = 0; index < Math.min(state.sessions.length, 8); index += 1) {
    const badge = document.createElement('i')
    badge.className = 'badge won'
    elements.badges.append(badge)
  }
}

function showSessionEnd() {
  lifecycle.cancel()
  sessionEnded = true
  engine.clear()
  elements.prompt.textContent = 'Quest complete!'
  elements.stage.className = 'stage finish'
  elements.stage.innerHTML = '<div class="earned-badge" aria-hidden="true">★</div>'
  elements.reveal.innerHTML = '<div class="all-done">Where to next?</div>'
  byId('questActions').hidden = false
  byId('nextAdventure').focus()
  byId('buddyLine').textContent = 'We found the way!'
  paintProgress(SESSION_CAP)
}

function startNewSession() {
  sessionEnded = false
  byId('questActions').hidden = true
  if (state.activeSession.correct >= SESSION_CAP) completeSession(state)
  persist()
  paintProgress()
}

function handleCorrect(roundId, { caughtSlug } = {}) {
  if (!lifecycle.accept(roundId)) return
  if (caughtSlug) recordCatch(state, caughtSlug)
  state.activeSession.correct += 1
  const completed = state.activeSession.correct >= SESSION_CAP
  paintProgress()

  if (completed) {
    sessionEnded = true
    completeSession(state)
    persist()
    lifecycle.after(roundId, 1900, showSessionEnd)
    return
  }

  persist()
  byId('buddyLine').textContent = state.activeSession.correct === 3 ? 'Look! The first beacon is glowing.' : state.activeSession.correct === 6 ? 'The clearing is just ahead!' : 'Another stone! Let’s explore.'
  lifecycle.after(roundId, 2600, () => playRound())
}

function createController(roundId) {
  const shared = {
    state,
    elements,
    engine,
    getProgress,
    onAttempt: attempt => { if (lifecycle.isCurrent(roundId)) handleAttempt(attempt) },
    onCorrect: result => handleCorrect(roundId, result),
    settings: { ...state.settings },
    isCurrentRound: () => lifecycle.isCurrent(roundId),
  }
  return mode === 'words'
    ? new WordsMode({ ...shared, activeLetters })
    : new LettersMode(shared)
}

function playRound() {
  if (sessionEnded || mode === 'pokedex' || atCamp) return
  const roundId = lifecycle.begin()
  globalThis.speechSynthesis?.cancel()
  byId('buddyLine').textContent = 'Listen to the clue. Find the next stone.'
  createController(roundId).play()
}

async function selectMode(nextMode) {
  lifecycle.cancel()
  globalThis.speechSynthesis?.cancel()
  atCamp = false
  byId('campView').hidden = true
  byId('grownSettings').hidden = true
  byId('questActions').hidden = true
  byId('buddy').hidden = nextMode === 'pokedex'
  byId('grownSettings').open = false
  mode = nextMode
  elements.appShell.dataset.activeMode = nextMode
  state.settings.mode = nextMode
  persist()

  document.querySelectorAll('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === nextMode
    button.classList.toggle('on', active)
    button.setAttribute('aria-pressed', String(active))
  })

  const collectionMode = nextMode === 'pokedex'
  elements.playView.hidden = collectionMode
  elements.pokedexView.hidden = !collectionMode
  elements.sessionProgress.hidden = collectionMode
  elements.lettersSettings.hidden = nextMode !== 'letters'
  elements.wordsSettings.hidden = nextMode !== 'words'

  if (collectionMode) {
    engine.clear()
    await renderPokedex(elements.pokedexView, state.collection)
  } else {
    if (sessionEnded) startNewSession()
    paintProgress()
    playRound('mode selected')
  }
  trail?.setActive(!collectionMode)
}

function showCamp() {
  lifecycle.cancel()
  globalThis.speechSynthesis?.cancel()
  atCamp = true
  engine.clear()
  elements.playView.hidden = true
  elements.pokedexView.hidden = true
  elements.sessionProgress.hidden = true
  byId('questActions').hidden = true
  byId('buddy').hidden = true
  byId('campView').hidden = false
  byId('grownSettings').hidden = false
  trail?.setActive(true)
  byId('startTrail').focus()
}
byId('homeButton').addEventListener('click', showCamp)
byId('backToCamp').addEventListener('click', showCamp)
byId('nextAdventure').addEventListener('click', () => { startNewSession(); selectMode(mode === 'pokedex' ? 'letters' : mode) })
byId('startTrail').addEventListener('click', () => selectMode('letters'))
byId('startWords').addEventListener('click', () => selectMode('words'))
byId('campListen').addEventListener('click', () => speak('Brody, a mystery is waiting across the stream. Choose a sound adventure or a word adventure.'))

function activateButtonGroup(root, attribute, value) {
  root.querySelectorAll('button').forEach((button) => {
    const active = String(button.dataset[attribute]) === String(value)
    button.classList.toggle('on', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function buildSettings() {
  elements.letterPresets.replaceChildren()
  ;[...LETTER_SETS.map((set, index) => ({ label: set.label, value: index })), { label: 'Everything', value: 'all' }]
    .forEach(({ label, value }, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.letterSet = String(value)
      button.textContent = label
      if (index > 0 && value !== 'all') {
        const previous = LETTER_SETS[index - 1]
        const mastered = previous.letters.filter((letter) => state.items[`letter-sound:${letter}`]?.mastered).length
        const percentage = Math.round((mastered / previous.letters.length) * 100)
        button.title = percentage >= 80 ? 'Recommended next set' : `Grown-up override · previous set ${percentage}%`
      }
      button.addEventListener('click', () => {
        state.settings.letterSet = value === 'all' ? 'all' : Number(value)
        activateButtonGroup(elements.letterPresets, 'letterSet', state.settings.letterSet)
        persist()
        if (mode === 'letters') playRound('letter set changed')
      })
      elements.letterPresets.append(button)
    })

  elements.wordPresets.replaceChildren()
  WORD_SETS.forEach((set, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.wordSet = String(index)
    button.textContent = set.label
    button.addEventListener('click', () => {
      state.settings.wordSet = index
      activateButtonGroup(elements.wordPresets, 'wordSet', index)
      persist()
      if (mode === 'words') playRound('word set changed')
    })
    elements.wordPresets.append(button)
  })

  activateButtonGroup(elements.letterPresets, 'letterSet', state.settings.letterSet)
  activateButtonGroup(elements.wordPresets, 'wordSet', state.settings.wordSet)
  activateButtonGroup(elements.caseToggle, 'case', state.settings.letterCase)
  activateButtonGroup(elements.lengthToggle, 'length', state.settings.wordLength)
}

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => selectMode(button.dataset.mode))
})

elements.caseToggle.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    state.settings.letterCase = button.dataset.case
    activateButtonGroup(elements.caseToggle, 'case', state.settings.letterCase)
    persist()
    if (mode === 'letters') playRound('letter case changed')
  })
})

elements.lengthToggle.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    state.settings.wordLength = button.dataset.length
    activateButtonGroup(elements.lengthToggle, 'length', state.settings.wordLength)
    persist()
    if (mode === 'words') playRound('word length changed')
  })
})

elements.exportButton.addEventListener('click', () => {
  const blob = new Blob([exportProgress(state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `letter-dex-progress-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  elements.backupStatus.textContent = 'Progress exported.'
})

elements.importInput.addEventListener('change', async () => {
  const file = elements.importInput.files?.[0]
  if (!file) return
  try {
    state = importProgress(await file.text())
    sessionEnded = false
    mode = state.settings.mode === 'pokedex' ? 'letters' : state.settings.mode
    persist()
    buildSettings()
    paintProgress()
    await selectMode(mode)
    elements.backupStatus.textContent = 'Progress imported.'
  } catch (error) {
    elements.backupStatus.textContent = error instanceof Error ? error.message : 'Could not import progress.'
  } finally {
    elements.importInput.value = ''
  }
})

buildSettings()
renderParentView(elements.parentView, state)
paintProgress()
showCamp()
