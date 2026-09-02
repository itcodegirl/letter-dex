export const STORAGE_KEY = 'letter-dex:v1'
export const SCHEMA_VERSION = 1

export function emptyProgress() {
  return {
    version: SCHEMA_VERSION,
    items: {},
    collection: {},
    sessions: [],
    activeSession: { correct: 0, startedAt: new Date().toISOString() },
    settings: { mode: 'letters', letterSet: 0, wordSet: 0, letterCase: 'lower', wordLength: 'any' },
  }
}

export function normalizeProgress(candidate) {
  if (!candidate || candidate.version !== SCHEMA_VERSION) return emptyProgress()
  const fallback = emptyProgress()
  return {
    ...fallback,
    ...candidate,
    items: candidate.items && typeof candidate.items === 'object' ? candidate.items : {},
    collection: candidate.collection && typeof candidate.collection === 'object' ? candidate.collection : {},
    sessions: Array.isArray(candidate.sessions) ? candidate.sessions : [],
    activeSession: { ...fallback.activeSession, ...candidate.activeSession },
    settings: { ...fallback.settings, ...candidate.settings },
  }
}

export function loadProgress(storage = globalThis.localStorage) {
  try {
    return normalizeProgress(JSON.parse(storage.getItem(STORAGE_KEY)))
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function getItemProgress(state, id, kind = 'unknown') {
  return state.items[id] ?? {
    id,
    kind,
    seen: 0,
    correct: 0,
    streak: 0,
    lastSeen: null,
    mastered: false,
  }
}

export function recordAttempt(state, { id, kind, correct, now = new Date() }) {
  const previous = getItemProgress(state, id, kind)
  const streak = correct ? previous.streak + 1 : 0
  state.items[id] = {
    ...previous,
    kind,
    seen: previous.seen + 1,
    correct: previous.correct + (correct ? 1 : 0),
    streak,
    lastSeen: now.toISOString(),
    mastered: streak >= 2 || previous.mastered,
  }
  return state.items[id]
}

export function recordCatch(state, slug, now = new Date()) {
  const previous = state.collection[slug] ?? { slug, count: 0, firstCaught: now.toISOString() }
  state.collection[slug] = { ...previous, count: previous.count + 1, lastCaught: now.toISOString() }
}

export function completeSession(state, now = new Date()) {
  state.sessions.push({
    startedAt: state.activeSession.startedAt,
    completedAt: now.toISOString(),
    correct: state.activeSession.correct,
  })
  state.activeSession = { correct: 0, startedAt: now.toISOString() }
}

export function importProgress(json) {
  const parsed = JSON.parse(json)
  if (parsed?.version !== SCHEMA_VERSION) throw new Error('Unsupported Letter Dex backup version')
  return normalizeProgress(parsed)
}

export function exportProgress(state) {
  return JSON.stringify(state, null, 2)
}
