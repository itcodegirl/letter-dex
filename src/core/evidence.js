// One evidence record per round, kept beside the scheduling flag.
// Specification: docs/learning/evidence-record-v1.md (LD-001).

export const EVIDENCE_CAP = 5000
export const RESULTS = Object.freeze(['correct', 'incorrect', 'no_response', 'not_assessable'])
export const PROMPT_LEVELS = Object.freeze(['independent', 'count_along', 'model'])
export const STATES = Object.freeze(['Not observed', 'Emerging', 'Developing', 'Consolidating', 'Generalized'])

/**
 * @typedef {object} RoundSpec
 * @property {string} competencyId  LS-001 | WR-001 | MA-001 | MA-002 | MA-003
 * @property {string} itemId        existing item id, e.g. letter-sound:S
 * @property {'letters'|'words'|'math'} mode
 * @property {string} sessionId
 * @property {string} taskVersion
 * @property {object} presentation
 * @property {boolean} clueRequired
 */

/** Start tracking one round. Modes call the marker functions as things happen. */
export function startRound(spec) {
  return {
    ...spec,
    clueRequired: Boolean(spec.clueRequired),
    clueHeard: false,
    replays: 0,
    response: null,
    result: null,
    promptLevel: 'independent',
    retries: 0,
    selfCorrection: false,
    access: null,
    answered: false,
  }
}

/** The clue played to completion before any answer tap. */
export function markHeard(round) {
  if (round.answered) return round
  if (round.clueHeard) round.replays += 1
  round.clueHeard = true
  return round
}

/** Count-along, Count with me, or any other app-side support before the first tap. */
export function markSupported(round) {
  if (!round.answered && round.promptLevel !== 'model') round.promptLevel = 'count_along'
  return round
}

/** The round is an introduction (meet round). It never becomes evidence. */
export function markModel(round) {
  if (!round.answered) round.promptLevel = 'model'
  return round
}

/** The clue could not play before the first tap. */
export function markAudioFailed(round) {
  if (!round.answered) round.access = 'audio_failed'
  return round
}

/** An answer tap. The first one is the response; later ones are retries. */
export function markAnswer(round, optionId, correct) {
  if (round.answered) {
    round.retries += 1
    if (correct) round.selfCorrection = true
    return round
  }
  round.answered = true
  round.response = optionId
  if (round.clueRequired && !round.clueHeard) {
    round.result = 'not_assessable'
    round.access = round.access ?? 'unheard'
  } else if (round.access === 'audio_failed') {
    round.result = 'not_assessable'
  } else {
    round.result = correct ? 'correct' : 'incorrect'
  }
  return round
}

/** The learner navigated away. Only matters when no answer was given. */
export function markLeft(round) {
  if (round.answered) return round
  round.answered = true
  round.result = round.promptLevel === 'count_along' ? 'not_assessable' : 'no_response'
  round.access = 'left_round'
  return round
}

export function isEligible(record) {
  return record.promptLevel === 'independent'
    && (record.result === 'correct' || record.result === 'incorrect')
    && (record.clueHeard || !record.clueRequired)
}

/** Produce the stored record for a finished round. */
export function finishRound(round, now = new Date()) {
  if (!round.answered) markLeft(round)
  const { answered, ...fields } = round
  const record = { ...fields, assessorType: 'automated', observedAt: now.toISOString() }
  record.eligible = isEligible(record)
  return record
}

export function validateRecord(record) {
  if (!record || typeof record !== 'object') throw new Error('evidence record must be an object')
  for (const key of ['competencyId', 'itemId', 'mode', 'sessionId', 'taskVersion']) {
    if (typeof record[key] !== 'string' || !record[key]) throw new Error(`evidence record needs ${key}`)
  }
  if (!RESULTS.includes(record.result)) throw new Error(`invalid evidence result: ${record.result}`)
  if (!PROMPT_LEVELS.includes(record.promptLevel)) throw new Error(`invalid prompt level: ${record.promptLevel}`)
  return record
}

/**
 * Derive the reported state for one item from its records.
 * Eligible records are the only evidence; supported and retried successes count as practice.
 */
export function itemEvidenceState(records, itemId) {
  const mine = records.filter(record => record.itemId === itemId)
  const eligible = mine.filter(record => record.eligible)
  const corrects = eligible.filter(record => record.result === 'correct')
  const sessions = new Set(corrects.map(record => record.sessionId))
  const lastThree = eligible.slice(-3)
  const recentIncorrect = lastThree.filter(record => record.result === 'incorrect').length
  const practice = mine.filter(record =>
    (record.promptLevel === 'count_along' && record.result === 'correct') || record.selfCorrection,
  ).length
  const replays = mine.reduce((sum, record) => sum + (record.replays || 0), 0)
  const lastEligibleCorrectAt = corrects.at(-1)?.observedAt ?? null

  let state = 'Not observed'
  if (corrects.length >= 3 && sessions.size >= 2 && recentIncorrect === 0) state = 'Consolidating'
  else if (corrects.length >= 2) state = 'Developing'
  else if (corrects.length >= 1 || practice > 0) state = 'Emerging'

  return {
    itemId,
    state,
    eligibleCorrect: corrects.length,
    eligibleRounds: eligible.length,
    practice,
    replays,
    sessions: sessions.size,
    lastEligibleCorrectAt,
    review: recentIncorrect >= 2,
  }
}

/** States for every item that has at least one record. */
export function evidenceSummary(records) {
  const ids = [...new Set(records.map(record => record.itemId))]
  return Object.fromEntries(ids.map(itemId => [itemId, itemEvidenceState(records, itemId)]))
}
