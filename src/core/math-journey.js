import { mathSet, mathSets } from './math-sets.js'

const STAGES = 3
const CHECKPOINT = 8
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value))

function cursor(value, now, fallback = {}) {
  const old = isRecord(value) ? value : {}
  const number = (key, valid) => valid(old[key]) ? old[key] : valid(fallback[key]) ? fallback[key] : 0
  return {
    stage: number('stage', n => Number.isInteger(n) && n >= 0 && n < STAGES),
    correct: number('correct', n => Number.isInteger(n) && n >= 0 && n < CHECKPOINT),
    startedAt: validDate(old.startedAt) ? old.startedAt : validDate(fallback.startedAt) ? fallback.startedAt : now.toISOString(),
    runs: number('runs', n => Number.isSafeInteger(n) && n >= 0),
  }
}

function activate(state, setId, saved, bookmarks) {
  bookmarks[setId] = saved
  state.mathJourney = { setId, ...saved, bookmarks }
  return state.mathJourney
}

export function mathJourney(state, catalog = mathSets(), now = new Date()) {
  const old = isRecord(state.mathJourney) ? state.mathJourney : {}
  const set = mathSet(old.setId, catalog)
  const bookmarks = Object.fromEntries(
    Object.entries(isRecord(old.bookmarks) ? old.bookmarks : {})
      .map(([id, saved]) => [id, cursor(saved, now)]),
  )
  // Legacy saves belong to the original set. An unavailable set cannot overwrite
  // another set's saved place; its bookmark survives until its catalogue returns.
  const current = old.setId === undefined || old.setId === set.id ? old : {}
  return activate(state, set.id, cursor(current, now, bookmarks[set.id]), bookmarks)
}

export function selectMathSet(state, id, catalog = mathSets()) {
  const journey = mathJourney(state, catalog)
  const set = mathSet(id, catalog)
  if (set.id === journey.setId) return journey
  const saved = journey.bookmarks[set.id] ?? cursor({}, new Date())
  return activate(state, set.id, saved, journey.bookmarks)
}

// This describes the active expedition, not independent learning evidence.
export function mathExpeditionProgress(state, catalog = mathSets()) {
  const journey = mathJourney(state, catalog)
  return journey.stage * CHECKPOINT + journey.correct
}

export function advanceMathJourney(state, now = new Date(), catalog = mathSets()) {
  const journey = mathJourney(state, catalog, now)
  journey.correct++
  if (journey.correct < CHECKPOINT) {
    journey.bookmarks[journey.setId] = cursor(journey, now)
    return false
  }
  state.sessions.push({
    kind: 'math', setId: journey.setId, stage: journey.stage, correct: CHECKPOINT,
    startedAt: journey.startedAt, completedAt: now.toISOString(),
  })
  const finishedSet = journey.stage === STAGES - 1
  const saved = {
    stage: finishedSet ? 0 : journey.stage + 1,
    correct: 0,
    startedAt: now.toISOString(),
    runs: journey.runs + (finishedSet ? 1 : 0),
  }
  journey.bookmarks[journey.setId] = saved
  if (!finishedSet) {
    activate(state, journey.setId, saved, journey.bookmarks)
  } else {
    const available = catalog.length ? catalog : [mathSet()]
    const index = available.findIndex(set => set.id === journey.setId)
    const next = available[(index + 1) % available.length]
    activate(state, next.id, journey.bookmarks[next.id] ?? cursor({}, now), journey.bookmarks)
  }
  return true
}
