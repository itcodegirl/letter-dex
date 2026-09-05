import test from 'node:test'
import assert from 'node:assert/strict'
import { mathItems, mathChoices } from '../data/math/adventure.js'
import { mathJourney, advanceMathJourney } from '../src/core/math-journey.js'
import { emptyProgress, exportProgress, importProgress, recordAttempt } from '../src/core/progress.js'

test('math quantities and answers agree, stay in range, and have distinct choices', () => {
  const ids = new Set()
  for (let stage = 0; stage < 3; stage++) for (const item of mathItems(stage)) {
    assert.ok(!ids.has(item.id)); ids.add(item.id)
    assert.ok(item.total >= 1 && item.total <= (stage ? 5 : 10))
    assert.equal(item.answer, stage === 2 ? 5 - item.a : item.total)
    if (stage === 1) assert.equal(item.a + item.b, item.total)
    for (const seed of [0, .3, .8, .99]) {
      const choices = mathChoices(item.answer, () => seed).map(x => Number(x.display))
      assert.equal(new Set(choices).size, 3)
      assert.ok(choices.includes(item.answer))
      assert.ok(choices.every(n => n >= 0 && n <= 10))
    }
  }
})

test('all three eight-step math stages persist without changing reading progress', () => {
  let state = emptyProgress()
  state.activeSession.correct = 3
  for (let stage = 0; stage < 3; stage++) {
    for (let step = 0; step < 8; step++) {
      assert.equal(mathJourney(state).stage, stage)
      assert.equal(advanceMathJourney(state), step === 7)
      state = importProgress(exportProgress(state))
      assert.equal(state.activeSession.correct, 3)
    }
    assert.equal(state.sessions.length, stage + 1)
  }
  assert.equal(mathJourney(state).stage, 0)
  assert.equal(mathJourney(state).correct, 0)
  assert.equal(state.sessions.reduce((sum, x) => sum + x.correct, 0), 24)
})

test('old saves and invalid math journey values safely start at the crossing', () => {
  for (const old of [undefined, {stage: 99, correct: -1}, {stage: '2', correct: NaN}]) {
    const state = emptyProgress(); state.mathJourney = old
    assert.equal(mathJourney(state).stage, 0)
    assert.equal(mathJourney(state).correct, 0)
  }
})

test('count-along help records practice without independent mastery', () => {
  const state = emptyProgress()
  for (let i = 0; i < 3; i++) recordAttempt(state, { id: 'math-help:math-count:6', kind: 'math-help', correct: true })
  assert.equal(state.items['math-help:math-count:6'].correct, 3)
  assert.equal(state.items['math-help:math-count:6'].mastered, false)
  assert.equal(state.items['math-count:6'], undefined)
})
