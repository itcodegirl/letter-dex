import test from 'node:test'
import assert from 'node:assert/strict'
import { mathAttempt } from '../src/modes/math.js'
import { emptyProgress, recordAttempt } from '../src/core/progress.js'

const item = { id: 'math-add:3+2', kind: 'math-add', a: 3, b: 2, total: 5, answer: 5 }

test('a first correct math choice keeps the existing two-correct scheduling rule', () => {
  const state = emptyProgress()
  assert.deepEqual(mathAttempt(item, true), { id: item.id, kind: item.kind, correct: true })
  recordAttempt(state, mathAttempt(item, true))
  assert.equal(state.items[item.id].mastered, false)
  recordAttempt(state, mathAttempt(item, true))
  assert.equal(state.items[item.id].mastered, true)
  assert.equal(state.items[item.id].streak, 2)
  assert.equal(state.items[`math-help:${item.id}`], undefined)
})

test('supported successes remain practice and do not change the ordinary fact record', () => {
  const state = emptyProgress()
  recordAttempt(state, mathAttempt(item, true))
  const before = { ...state.items[item.id] }
  for (let i = 0; i < 3; i++) recordAttempt(state, mathAttempt(item, true, true))
  assert.deepEqual(state.items[item.id], before)
  assert.equal(state.items[`math-help:${item.id}`].correct, 3)
  assert.equal(state.items[`math-help:${item.id}`].streak, 0)
  assert.equal(state.items[`math-help:${item.id}`].mastered, false)
  assert.equal(state.activeSession.correct, 0)
})

test('a successful retry records practice after the original unsuccessful choice', () => {
  const state = emptyProgress()
  recordAttempt(state, mathAttempt(item, false))
  recordAttempt(state, mathAttempt(item, true, true))
  assert.equal(state.items[item.id].seen, 1)
  assert.equal(state.items[item.id].correct, 0)
  assert.equal(state.items[item.id].mastered, false)
  assert.equal(state.items[`math-help:${item.id}`].seen, 1)
  assert.equal(state.items[`math-help:${item.id}`].correct, 1)
  assert.equal(state.items[`math-help:${item.id}`].mastered, false)
  assert.deepEqual(mathAttempt(item, false, true), { id: item.id, kind: item.kind, correct: false })
})
