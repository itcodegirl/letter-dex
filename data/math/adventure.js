export const MATH_STAGES = [
  { name: 'Berry Crossing', skill: 'Count berries', mission: 'Count the berries to raise a stepping stone.', success: 'A new stone! The crossing is opening.', next: 'Build the bridge' },
  { name: 'Bridge Builders', skill: 'Add groups', mission: 'Bring the groups together to repair the bridge.', success: 'Another plank! The bridge is growing.', next: 'Rescue the beacon' },
  { name: 'Beacon Rescue', skill: 'Find the missing amount', mission: 'Fill the empty spaces to light the beacon.', success: 'More light! The beacon is waking up.', next: 'Explore again' },
]

export const MATH_SETS = [
  { id: 'trail-team', name: 'Trail Team', description: 'Count to 10, add within 5, and find what makes 5.' },
  { id: 'river-rescue', name: 'River Rescue', description: 'Count 6–10, add to 6–10, and find what makes 10.' },
  { id: 'beacon-champions', name: 'Beacon Champions', description: 'Count 6–10, combine larger groups, and find missing amounts to make 6–10.' },
]

const SET_RANGES = {
  'trail-team': { countMin: 1, addMin: 2, addMax: 5, addendMin: 1, missingMin: 0, missingTotals: [5] },
  'river-rescue': { countMin: 6, addMin: 6, addMax: 10, addendMin: 1, missingMin: 0, missingTotals: [10] },
  'beacon-champions': { countMin: 6, addMin: 6, addMax: 10, addendMin: 2, missingMin: 1, missingTotals: [6, 7, 8, 9, 10] },
}

export function mathItems(stage, setId = 'trail-team') {
  const set = MATH_SETS.find(candidate => candidate.id === setId) || MATH_SETS[0]
  const range = SET_RANGES[set.id]
  if (stage === 0) return Array.from({ length: 11 - range.countMin }, (_, i) => {
    const total = range.countMin + i
    return { id: `math-count:${total}`, kind: 'math-count', total, answer: total }
  })
  if (stage === 1) {
    const items = []
    for (let a = range.addendMin; a < range.addMax; a++) for (let b = range.addendMin; a + b <= range.addMax; b++) {
      if (a + b < range.addMin) continue
      items.push({ id: `math-add:${a}+${b}`, kind: 'math-add', a, b, total: a + b, answer: a + b })
    }
    return items
  }
  return range.missingTotals.flatMap(total => Array.from({ length: total - range.missingMin }, (_, i) => {
    const a = range.missingMin + i
    return { id: `math-missing:${a}+?=${total}`, kind: 'math-missing', a, total, answer: total - a }
  }))
}

export function mathChoices(answer, random = Math.random) {
  const low = Math.max(0, Math.min(answer - 1, 8))
  const values = [low, low + 1, low + 2]
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]
  }
  return values.map(n => ({ id: String(n), display: String(n) }))
}
