import * as curriculum from '../../data/math/adventure.js'

const DEFAULT_SETS = [
  { id: 'trail-team', name: 'Trail Team', description: 'Count to 10 · add and make 5' },
]

// Runtime support can ship before the separate curriculum catalogue.
export function mathSets() {
  return Array.isArray(curriculum.MATH_SETS) && curriculum.MATH_SETS.length
    ? curriculum.MATH_SETS
    : DEFAULT_SETS
}

export function mathSet(id, catalog = mathSets()) {
  const available = catalog.length ? catalog : DEFAULT_SETS
  return available.find(set => set.id === id) ?? available[0]
}

export function mathSetItems(stage, setId) {
  return curriculum.mathItems(stage, mathSet(setId).id)
}
