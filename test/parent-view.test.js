import test from 'node:test'
import assert from 'node:assert/strict'
import { renderParentView } from '../src/ui/parent-view.js'
import { mathSets, mathSetItems } from '../src/core/math-sets.js'
import { MATH_STAGES } from '../data/math/adventure.js'
import { emptyProgress, recordAttempt } from '../src/core/progress.js'

function mathRows(state) {
  const root = { innerHTML: '' }
  renderParentView(root, state)
  return new Map([...root.innerHTML.matchAll(/<span>(Math · [^<]+)<\/span><meter min="0" max="100" value="(\d+)"/g)]
    .map(([, label, value]) => [label, Number(value)]))
}

test('each math set and skill has readiness without counting supported practice', () => {
  const state = emptyProgress()
  for (const set of mathSets()) for (let stage = 0; stage < MATH_STAGES.length; stage++) {
    for (const item of mathSetItems(stage, set.id)) {
      for (let i = 0; i < 2; i++) recordAttempt(state, { id: `math-help:${item.id}`, kind: 'math-help', correct: true })
    }
  }
  const rows = mathRows(state)
  assert.equal(rows.size, mathSets().length * MATH_STAGES.length)
  for (const set of mathSets()) for (const stage of MATH_STAGES) {
    assert.equal(rows.get(`Math · ${set.name} · ${stage.skill}`), 0)
  }
})

test('readiness uses the canonical facts belonging to each set', () => {
  const state = emptyProgress()
  const fact = mathSetItems(1, mathSets()[0].id)[0]
  for (let i = 0; i < 2; i++) recordAttempt(state, { id: fact.id, kind: fact.kind, correct: true })
  const rows = mathRows(state)
  for (const set of mathSets()) {
    const additions = mathSetItems(1, set.id)
    const expected = additions.some(item => item.id === fact.id) ? Math.round(100 / additions.length) : 0
    assert.equal(rows.get(`Math · ${set.name} · ${MATH_STAGES[1].skill}`), expected)
    assert.equal(rows.get(`Math · ${set.name} · ${MATH_STAGES[0].skill}`), 0)
    assert.equal(rows.get(`Math · ${set.name} · ${MATH_STAGES[2].skill}`), 0)
  }
})
