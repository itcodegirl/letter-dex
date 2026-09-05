export const MATH_STAGES = [
  { name: 'Berry Crossing', skill: 'Count berries', mission: 'Count the berries to raise a stepping stone.', success: 'A new stone! The crossing is opening.', next: 'Build the bridge' },
  { name: 'Bridge Builders', skill: 'Add groups', mission: 'Bring the groups together to repair the bridge.', success: 'Another plank! The bridge is growing.', next: 'Rescue the beacon' },
  { name: 'Beacon Rescue', skill: 'Find the missing amount', mission: 'Fill the empty spaces to light the beacon.', success: 'More light! The beacon is waking up.', next: 'Explore again' },
]

export function mathItems(stage) {
  if (stage === 0) return Array.from({ length: 10 }, (_, i) => ({ id: `math-count:${i + 1}`, kind: 'math-count', total: i + 1, answer: i + 1 }))
  if (stage === 1) {
    const items = []
    for (let a = 1; a < 5; a++) for (let b = 1; a + b <= 5; b++) {
      items.push({ id: `math-add:${a}+${b}`, kind: 'math-add', a, b, total: a + b, answer: a + b })
    }
    return items
  }
  return Array.from({ length: 5 }, (_, a) => ({ id: `math-missing:${a}+?=5`, kind: 'math-missing', a, total: 5, answer: 5 - a }))
}

export function mathChoices(answer, random = Math.random) {
  const low = Math.max(0, Math.min(answer - 1, 8))
  const values = [low, low + 1, low + 2]
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]
  }
  return values.map(n => ({ id: String(n), display: String(n) }))
}
