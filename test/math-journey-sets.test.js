import test from 'node:test'
import assert from 'node:assert/strict'
import { mathItems } from '../data/math/adventure.js'
import { mathSet, mathSets, mathSetItems } from '../src/core/math-sets.js'
import { mathJourney, selectMathSet, advanceMathJourney, mathExpeditionProgress } from '../src/core/math-journey.js'
import { emptyProgress, exportProgress, importProgress } from '../src/core/progress.js'

const catalog = [
  { id: 'trail-team', name: 'Trail Team' },
  { id: 'river-rescue', name: 'River Rescue' },
  { id: 'beacon-champions', name: 'Beacon Champions' },
]
const when = new Date('2026-09-05T12:00:00.000Z')
const later = new Date('2026-09-05T12:30:00.000Z')

test('set helpers support the original curriculum and fall back to its first set', () => {
  assert.equal(mathSets()[0].id, 'trail-team')
  assert.equal(mathSet('missing').id, mathSets()[0].id)
  assert.equal(mathSet('river-rescue', catalog).name, 'River Rescue')
  for (let stage = 0; stage < 3; stage++) {
    assert.deepEqual(mathSetItems(stage, 'trail-team'), mathItems(stage, 'trail-team'))
  }
})

test('a legacy math save keeps its unfinished mission through migration and backup', () => {
  const state = emptyProgress()
  state.activeSession.correct = 3
  state.mathJourney = { stage: 1, correct: 6, startedAt: when.toISOString() }
  const migrated = mathJourney(state, catalog)
  assert.deepEqual(migrated.bookmarks['trail-team'], {
    stage: 1, correct: 6, startedAt: when.toISOString(), runs: 0,
  })
  assert.equal(migrated.setId, 'trail-team')
  assert.equal(mathExpeditionProgress(state, catalog), 14)
  const restored = importProgress(exportProgress(state))
  assert.deepEqual(mathJourney(restored, catalog), migrated)
  assert.equal(restored.activeSession.correct, 3)
  assert.equal(restored.sessions.length, 0)
})

test('switching sets restores each unfinished mission without rewarding or changing reading', () => {
  let state = emptyProgress()
  state.activeSession.correct = 5
  for (let i = 0; i < 11; i++) advanceMathJourney(state, when, catalog)
  selectMathSet(state, 'river-rescue', catalog)
  for (let i = 0; i < 4; i++) advanceMathJourney(state, later, catalog)
  state = importProgress(exportProgress(state))
  let journey = selectMathSet(state, 'trail-team', catalog)
  assert.equal(journey.stage, 1)
  assert.equal(journey.correct, 3)
  assert.equal(journey.startedAt, when.toISOString())
  journey = selectMathSet(state, 'river-rescue', catalog)
  assert.equal(journey.stage, 0)
  assert.equal(journey.correct, 4)
  assert.equal(state.activeSession.correct, 5)
  assert.equal(state.sessions.length, 1)
  for (let i = 0; i < 10; i++) mathJourney(state, catalog)
  assert.equal(state.sessions.length, 1)
  assert.equal(state.collection && Object.keys(state.collection).length, 0)
})

test('three missions save at 8, 16, and 24 then each set advances and wraps', () => {
  let state = emptyProgress()
  for (const set of catalog) {
    for (let correct = 1; correct <= 24; correct++) {
      assert.equal(mathJourney(state, catalog).setId, set.id)
      assert.equal(advanceMathJourney(state, when, catalog), correct % 8 === 0)
      state = importProgress(exportProgress(state))
      if (correct < 24) assert.equal(mathExpeditionProgress(state, catalog), correct)
    }
    assert.equal(state.mathJourney.bookmarks[set.id].runs, 1)
  }
  assert.equal(state.sessions.length, 9)
  assert.deepEqual(state.sessions.map(session => session.stage), [0, 1, 2, 0, 1, 2, 0, 1, 2])
  assert.deepEqual(state.sessions.map(session => session.setId), catalog.flatMap(set => [set.id, set.id, set.id]))
  assert.equal(state.sessions.reduce((sum, session) => sum + session.correct, 0), 72)
  assert.equal(mathJourney(state, catalog).setId, 'trail-team')
  assert.equal(mathExpeditionProgress(state, catalog), 0)
  assert.equal(mathJourney(state, catalog).runs, 1)
})

test('finishing one set resumes the next set without erasing its unfinished mission', () => {
  const state = emptyProgress()
  selectMathSet(state, 'river-rescue', catalog)
  for (let i = 0; i < 13; i++) advanceMathJourney(state, when, catalog)
  selectMathSet(state, 'trail-team', catalog)
  for (let i = 0; i < 24; i++) advanceMathJourney(state, later, catalog)
  const journey = mathJourney(state, catalog)
  assert.equal(journey.setId, 'river-rescue')
  assert.equal(journey.stage, 1)
  assert.equal(journey.correct, 5)
  assert.equal(journey.startedAt, when.toISOString())
  assert.equal(journey.runs, 0)
  assert.equal(journey.bookmarks['trail-team'].runs, 1)
  assert.equal(state.sessions.length, 4)
})

test('invalid fields normalize safely and an unavailable set cannot overwrite another bookmark', () => {
  const state = emptyProgress()
  state.mathJourney = {
    setId: 'removed-set', stage: 2, correct: 7,
    bookmarks: {
      'trail-team': { stage: 1, correct: 4, startedAt: when.toISOString(), runs: 2 },
      'river-rescue': { stage: 99, correct: -1, startedAt: 'invalid', runs: Infinity },
      'removed-set': { stage: 2, correct: 7, startedAt: when.toISOString(), runs: 0 },
    },
  }
  const journey = mathJourney(state, catalog, when)
  assert.equal(journey.setId, 'trail-team')
  assert.equal(journey.stage, 1)
  assert.equal(journey.correct, 4)
  assert.equal(journey.runs, 2)
  assert.deepEqual(journey.bookmarks['river-rescue'], { stage: 0, correct: 0, startedAt: when.toISOString(), runs: 0 })
  assert.equal(journey.bookmarks['removed-set'].correct, 7)
  assert.equal(selectMathSet(state, 'not-a-set', catalog).correct, 4)
  for (const invalid of [null, [], 'invalid', { stage: 3, correct: 8, runs: -1, startedAt: '' }]) {
    state.mathJourney = invalid
    const safe = mathJourney(state, catalog, when)
    assert.equal(safe.stage, 0)
    assert.equal(safe.correct, 0)
    assert.equal(safe.runs, 0)
    assert.equal(safe.startedAt, when.toISOString())
  }
  assert.equal(state.sessions.length, 0)
})
