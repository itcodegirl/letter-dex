import test from 'node:test'
import assert from 'node:assert/strict'
import { MATH_SETS, MATH_STAGES, mathItems, mathChoices } from '../data/math/adventure.js'

test('the original math set keeps its stage names, item order, IDs, and values', () => {
  assert.deepEqual(MATH_STAGES.map(stage => stage.name), ['Berry Crossing', 'Bridge Builders', 'Beacon Rescue'])
  assert.deepEqual(mathItems(0), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(total => ({
    id: `math-count:${total}`, kind: 'math-count', total, answer: total,
  })))
  assert.deepEqual(mathItems(1), [
    [1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [4, 1],
  ].map(([a, b]) => ({ id: `math-add:${a}+${b}`, kind: 'math-add', a, b, total: a + b, answer: a + b })))
  assert.deepEqual(mathItems(2), [0, 1, 2, 3, 4].map(a => ({
    id: `math-missing:${a}+?=5`, kind: 'math-missing', a, total: 5, answer: 5 - a,
  })))
})

test('three named sets provide the selected counting, addition, and missing-amount ranges', () => {
  assert.deepEqual(MATH_SETS.map(set => [set.id, set.name]), [
    ['trail-team', 'Trail Team'], ['river-rescue', 'River Rescue'], ['beacon-champions', 'Beacon Champions'],
  ])
  assert.ok(MATH_SETS.every(set => typeof set.description === 'string' && set.description.length > 0))

  const expected = {
    'trail-team': { sizes: [10, 10, 5], totals: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 3, 4, 5], [5]] },
    'river-rescue': { sizes: [5, 35, 10], totals: [[6, 7, 8, 9, 10], [6, 7, 8, 9, 10], [10]] },
    'beacon-champions': { sizes: [5, 25, 35], totals: [[6, 7, 8, 9, 10], [6, 7, 8, 9, 10], [6, 7, 8, 9, 10]] },
  }
  for (const { id } of MATH_SETS) for (let stage = 0; stage < 3; stage++) {
    const items = mathItems(stage, id)
    assert.equal(items.length, expected[id].sizes[stage], `${id}, stage ${stage}`)
    assert.deepEqual([...new Set(items.map(item => item.total))].sort((a, b) => a - b), expected[id].totals[stage])
  }
})

test('Beacon Champions uses larger groups and missing amounts that require combining quantities', () => {
  assert.ok(mathItems(0, 'beacon-champions').every(item => item.total >= 6))
  assert.ok(mathItems(1, 'beacon-champions').every(item => item.a >= 2 && item.b >= 2))
  assert.ok(mathItems(2, 'beacon-champions').every(item => item.a >= 1 && item.answer < item.total))
  for (const total of [6, 7, 8, 9, 10]) {
    const missing = mathItems(2, 'beacon-champions').filter(item => item.total === total)
    assert.equal(missing.length, total - 1)
    assert.ok(missing.some(item => item.a === 1))
    assert.ok(missing.some(item => item.answer === 1))
  }
})

test('facts have unique IDs in each stage and keep the same identity across sets', () => {
  const knownFacts = new Map()
  let sharedFacts = 0
  for (const { id: setId } of MATH_SETS) for (let stage = 0; stage < 3; stage++) {
    const items = mathItems(stage, setId)
    assert.equal(new Set(items.map(item => item.id)).size, items.length, `${setId}, stage ${stage}`)
    for (const item of items) {
      assert.ok(Number.isInteger(item.total) && item.total >= 1 && item.total <= 10)
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer <= 10)
      if (stage === 0) {
        assert.equal(item.kind, 'math-count')
        assert.equal(item.id, `math-count:${item.total}`)
        assert.equal(item.answer, item.total)
      } else {
        assert.ok(Number.isInteger(item.a) && item.a >= 0)
        if (stage === 1) {
          assert.equal(item.kind, 'math-add')
          assert.ok(item.a > 0 && Number.isInteger(item.b) && item.b > 0)
          assert.equal(item.total, item.a + item.b)
          assert.equal(item.answer, item.total)
          assert.equal(item.id, `math-add:${item.a}+${item.b}`)
        } else {
          assert.equal(item.kind, 'math-missing')
          assert.ok(item.a < item.total)
          assert.equal(item.a + item.answer, item.total)
          assert.equal(item.id, `math-missing:${item.a}+?=${item.total}`)
        }
      }
      if (knownFacts.has(item.id)) {
        assert.deepEqual(item, knownFacts.get(item.id), `changed fact ${item.id}`)
        sharedFacts++
      } else knownFacts.set(item.id, item)
    }
  }
  assert.ok(sharedFacts > 0, 'sets share facts so prior practice remains attached to those facts')
})

test('every supported answer has three distinct in-range choices including the answer', () => {
  for (let answer = 0; answer <= 10; answer++) for (const seed of [0, .3, .8, .99]) {
    const choices = mathChoices(answer, () => seed)
    const values = choices.map(choice => Number(choice.display))
    assert.equal(choices.length, 3)
    assert.equal(new Set(values).size, 3)
    assert.ok(values.includes(answer), `missing answer ${answer}`)
    assert.ok(values.every(value => Number.isInteger(value) && value >= 0 && value <= 10))
    assert.ok(choices.every(choice => choice.id === choice.display))
  }
})

test('unknown or missing set IDs fall back to the original set', () => {
  for (const setId of [undefined, null, '', 'unknown', '__proto__', 'constructor', 0]) {
    for (let stage = 0; stage < 3; stage++) assert.deepEqual(mathItems(stage, setId), mathItems(stage, 'trail-team'))
  }
})
