export function discoveries(state) {
  if (!Array.isArray(state.discoveries)) state.discoveries = []
  return state.discoveries
}

// Rewards belong to answer completion. This record only presents that saved reward.
export function createDiscovery(state, details) {
  const session = state.sessions.at(-1)
  const id = `${state.sessions.length}:${session?.completedAt}`
  const existing = discoveries(state).find(entry => entry.id === id)
  if (existing) return existing
  const { checkpoint, ...metadata } = details
  const validCheckpoint = details.mode === 'math'
    && typeof checkpoint?.setId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(checkpoint.setId)
    && Number.isInteger(checkpoint.stage) && checkpoint.stage >= 0 && checkpoint.stage < 3
  const snapshot = validCheckpoint ? { checkpoint: { setId: checkpoint.setId, stage: checkpoint.stage } } : {}
  const entry = { ...metadata, ...snapshot, id, step: 'footprints', footprints: 0, greeted: false, createdAt: session?.completedAt }
  state.discoveries.push(entry)
  state.pendingDiscoveryId = id
  return entry
}

export function pendingDiscovery(state) {
  return discoveries(state).find(entry => entry.id === state.pendingDiscoveryId) ?? null
}

export function followFootprint(entry, index) {
  if (entry.step !== 'footprints' || index !== entry.footprints || index >= 3) return false
  entry.footprints++
  if (entry.footprints === 3) entry.step = 'meet'
  return true
}

export function openDiscoveryJournal(entry) {
  if (entry.step !== 'meet' || !entry.greeted) return false
  entry.step = 'journal'
  return true
}

export function finishDiscovery(state, id) {
  if (state.pendingDiscoveryId === id) state.pendingDiscoveryId = null
}
