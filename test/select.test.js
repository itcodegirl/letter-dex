import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseAdaptive, MASTERED_SHARE } from '../src/core/select.js'

function lcg(seed = 42) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 2 ** 32
  }
}

test('mastered retention share is fixed below the thirty-percent ceiling', () => {
  assert.equal(MASTERED_SHARE, 0.2)
  assert.ok(MASTERED_SHARE > 0)
  assert.ok(MASTERED_SHARE <= 0.3)
})

test('adaptive selection returns mastered items for retention without dominating', () => {
  const items = [
    { id: 'learning-a' },
    { id: 'learning-b' },
    { id: 'mastered-a' },
  ]
  const progress = {
    'learning-a': { streak: 0, mastered: false },
    'learning-b': { streak: 1, mastered: false },
    'mastered-a': { streak: 2, mastered: true },
  }
  const random = lcg()
  let masteredPicks = 0
  const trials = 10_000

  for (let index = 0; index < trials; index += 1) {
    if (chooseAdaptive(items, (id) => progress[id], random).id === 'mastered-a') masteredPicks += 1
  }

  const share = masteredPicks / trials
  assert.ok(share > 0.17, `mastered share was too low: ${share}`)
  assert.ok(share < 0.23, `mastered share was too high: ${share}`)
})

test('lower-streak learning items receive more weight', () => {
  const items = [{ id: 'new' }, { id: 'practiced' }]
  const progress = {
    new: { streak: 0, mastered: false },
    practiced: { streak: 1, mastered: false },
  }
  const random = lcg(9)
  let newPicks = 0
  for (let index = 0; index < 5_000; index += 1) {
    if (chooseAdaptive(items, (id) => progress[id], random).id === 'new') newPicks += 1
  }
  assert.ok(newPicks > 3_000)
})
