import test from 'node:test'
import assert from 'node:assert/strict'
import {
  completeSession,
  emptyProgress,
  exportProgress,
  importProgress,
  recordAttempt,
  recordCatch,
  saveProgress,
  loadProgress,
  STORAGE_KEY,
} from '../src/core/progress.js'

const when = new Date('2026-09-02T12:00:00.000Z')

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

test('two correct responses in a row mark an item mastered', () => {
  const state = emptyProgress()
  recordAttempt(state, { id: 'word:sat', kind: 'word', correct: true, now: when })
  assert.equal(state.items['word:sat'].mastered, false)
  recordAttempt(state, { id: 'word:sat', kind: 'word', correct: true, now: when })
  assert.equal(state.items['word:sat'].mastered, true)
})

test('an incorrect response is recorded without changing session score', () => {
  const state = emptyProgress()
  recordAttempt(state, { id: 'letter-sound:S', kind: 'letter-sound', correct: false, now: when })
  assert.equal(state.items['letter-sound:S'].seen, 1)
  assert.equal(state.items['letter-sound:S'].correct, 0)
  assert.equal(state.activeSession.correct, 0)
})

test('collection and completed sessions survive JSON export and import', () => {
  const state = emptyProgress()
  recordCatch(state, 'snorlax', when)
  state.activeSession.correct = 8
  completeSession(state, when)
  const restored = importProgress(exportProgress(state))
  assert.equal(restored.collection.snorlax.count, 1)
  assert.equal(restored.sessions[0].correct, 8)
})

test('the versioned local storage key round-trips', () => {
  const storage = memoryStorage()
  const state = emptyProgress()
  state.settings.mode = 'words'
  assert.equal(saveProgress(state, storage), true)
  assert.ok(storage.getItem(STORAGE_KEY))
  assert.equal(loadProgress(storage).settings.mode, 'words')
})
