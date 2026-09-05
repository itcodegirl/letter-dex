export function mathJourney(state) {
  const old = state.mathJourney ?? {}
  state.mathJourney = {
    stage: Number.isInteger(old.stage) && old.stage >= 0 && old.stage < 3 ? old.stage : 0,
    correct: Number.isInteger(old.correct) && old.correct >= 0 && old.correct < 8 ? old.correct : 0,
    startedAt: typeof old.startedAt === 'string' ? old.startedAt : new Date().toISOString(),
  }
  return state.mathJourney
}

export function advanceMathJourney(state, now = new Date()) {
  const journey = mathJourney(state)
  journey.correct++
  if (journey.correct < 8) return false
  state.sessions.push({ kind: 'math', stage: journey.stage, correct: 8, startedAt: journey.startedAt, completedAt: now.toISOString() })
  state.mathJourney = { stage: (journey.stage + 1) % 3, correct: 0, startedAt: now.toISOString() }
  return true
}
