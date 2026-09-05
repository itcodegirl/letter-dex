import test from 'node:test'
import assert from 'node:assert/strict'
import {
  EVIDENCE_CAP,
  evidenceSummary,
  finishRound,
  itemEvidenceState,
  markAnswer,
  markAudioFailed,
  markHeard,
  markLeft,
  markModel,
  markSupported,
  startRound,
} from '../src/core/evidence.js'
import {
  emptyProgress,
  exportProgress,
  importProgress,
  normalizeProgress,
  recordAttempt,
  recordEvidence,
} from '../src/core/progress.js'

const when = new Date('2026-09-06T09:00:00.000Z')
const later = new Date('2026-09-07T09:00:00.000Z')

function sounds(sessionId = 'quest-1') {
  return startRound({
    competencyId: 'LS-001', itemId: 'letter-sound:S', mode: 'letters', sessionId, taskVersion: 'letters-v1',
    presentation: { case: 'lower', letterSet: 0, choices: 3, distractors: 'set-random-no-ck' }, clueRequired: true,
  })
}

function counting(sessionId = 'set-1') {
  return startRound({
    competencyId: 'MA-001', itemId: 'math-count:4', mode: 'math', sessionId, taskVersion: 'math-v1',
    presentation: { setId: 'trail-team', stage: 0, choices: 3, distractors: 'adjacent-numbers' }, clueRequired: false,
  })
}

function record(round, now = when) {
  return finishRound(round, now)
}

test('a wrong tap followed by a correct tap is one incorrect, eligible record with a retry', () => {
  const round = markHeard(sounds())
  markAnswer(round, 'letter-sound:T', false)
  markAnswer(round, 'letter-sound:S', true)
  const stored = record(round)
  assert.equal(stored.result, 'incorrect')
  assert.equal(stored.response, 'letter-sound:T')
  assert.equal(stored.retries, 1)
  assert.equal(stored.selfCorrection, true)
  assert.equal(stored.eligible, true)
  assert.equal(stored.promptLevel, 'independent')
  assert.equal(stored.assessorType, 'automated')
  assert.equal(stored.observedAt, when.toISOString())
  assert.equal('answered' in stored, false)
})

test('a correct tap after count-along is supported practice, not evidence', () => {
  const round = markSupported(counting())
  markAnswer(round, '4', true)
  const stored = record(round)
  assert.equal(stored.result, 'correct')
  assert.equal(stored.promptLevel, 'count_along')
  assert.equal(stored.eligible, false)
})

test('a first tap before Listen in Sounds is not assessable and never an error', () => {
  const round = sounds()
  markAnswer(round, 'letter-sound:S', true)
  const stored = record(round)
  assert.equal(stored.result, 'not_assessable')
  assert.equal(stored.access, 'unheard')
  assert.equal(stored.clueHeard, false)
  assert.equal(stored.eligible, false)
  assert.equal(itemEvidenceState([stored], 'letter-sound:S').state, 'Not observed')
})

test('replaying the clue before answering stays independent and is counted', () => {
  const round = sounds()
  markHeard(round); markHeard(round); markHeard(round)
  markAnswer(round, 'letter-sound:S', true)
  const stored = record(round)
  assert.equal(stored.clueHeard, true)
  assert.equal(stored.replays, 2)
  assert.equal(stored.eligible, true)
  markHeard(round)
  assert.equal(round.replays, 2, 'listening after the answer changes nothing')
})

test('math rounds need no clue to be eligible', () => {
  const round = counting()
  markAnswer(round, '4', true)
  assert.equal(record(round).eligible, true)
})

test('a model round is never evidence and does not touch the item aggregate or its flag', () => {
  const state = emptyProgress()
  const round = markModel(markHeard(sounds()))
  markSupported(round)
  markAnswer(round, 'letter-sound:S', true)
  const stored = recordEvidence(state, record(round), when)
  assert.equal(stored.promptLevel, 'model')
  assert.equal(stored.eligible, false)
  assert.deepEqual(state.items, {})
  recordAttempt(state, { id: 'letter-sound:S', kind: 'letter-sound', correct: true, now: when })
  assert.equal(state.items['letter-sound:S'].mastered, false)
  assert.equal(state.evidence.length, 1)
})

test('audio failure and leaving the round are recorded as access problems', () => {
  const failed = markAudioFailed(sounds())
  markAnswer(failed, 'letter-sound:S', true)
  assert.equal(record(failed).result, 'not_assessable')
  assert.equal(record(failed).access, 'audio_failed')

  const left = markHeard(sounds())
  const leftRecord = record(markLeft(left))
  assert.equal(leftRecord.result, 'no_response')
  assert.equal(leftRecord.access, 'left_round')
  assert.equal(leftRecord.response, null)

  const leftAfterHelp = markSupported(counting())
  assert.equal(record(leftAfterHelp).result, 'not_assessable')
  assert.equal(record(leftAfterHelp).access, 'left_round')
})

test('records are stored with monotonic ids and survive export and import', () => {
  const state = emptyProgress()
  const first = recordEvidence(state, record(markAnswer(markHeard(sounds()), 'letter-sound:S', true)), when)
  const second = recordEvidence(state, record(markAnswer(counting(), '3', false)), later)
  assert.equal(first.id, 'ev:1')
  assert.equal(second.id, 'ev:2')
  assert.equal(second.observedAt, when.toISOString(), 'finishRound stamps the time; recordEvidence keeps it')
  state.evidenceDropped = 3
  const restored = importProgress(exportProgress(state))
  assert.deepEqual(restored.evidence, state.evidence)
  assert.equal(restored.evidenceSeq, 2)
  assert.equal(restored.evidenceDropped, 3)
  assert.equal(recordEvidence(restored, record(markAnswer(counting(), '4', true))).id, 'ev:3')
})

test('records are validated before storage', () => {
  const state = emptyProgress()
  assert.throws(() => recordEvidence(state, { ...record(markAnswer(counting(), '4', true)), result: 'maybe' }), /invalid evidence result/)
  assert.throws(() => recordEvidence(state, { ...record(markAnswer(counting(), '4', true)), promptLevel: 'adult' }), /invalid prompt level/)
  assert.throws(() => recordEvidence(state, { ...record(markAnswer(counting(), '4', true)), itemId: '' }), /needs itemId/)
  assert.equal(state.evidence.length, 0)
})

test('the cap drops the oldest records and counts them', () => {
  const state = emptyProgress()
  for (let i = 0; i < EVIDENCE_CAP + 2; i++) recordEvidence(state, record(markAnswer(counting(), '4', true)), when)
  assert.equal(state.evidence.length, EVIDENCE_CAP)
  assert.equal(state.evidenceDropped, 2)
  assert.equal(state.evidence[0].id, 'ev:3')
  assert.equal(state.evidence.at(-1).id, `ev:${EVIDENCE_CAP + 2}`)
})

test('older saves without evidence normalize to an empty log and derive the sequence from ids', () => {
  const plain = normalizeProgress({ version: 1, items: {}, collection: {}, sessions: [] })
  assert.deepEqual(plain.evidence, [])
  assert.equal(plain.evidenceSeq, 0)
  assert.equal(plain.evidenceDropped, 0)

  const partial = normalizeProgress({ version: 1, evidence: [{ id: 'ev:7', itemId: 'word:sat' }, null, 'junk'] })
  assert.equal(partial.evidence.length, 1)
  assert.equal(partial.evidenceSeq, 7)
  assert.equal(recordEvidence(partial, record(markAnswer(counting(), '4', true))).id, 'ev:8')
})

test('states follow the v1 sufficiency defaults and an error never erases evidence', () => {
  const rounds = []
  const eligibleCorrect = (session) => rounds.push(record(markAnswer(markHeard(sounds(session)), 'letter-sound:S', true)))
  const eligibleWrong = (session) => rounds.push(record(markAnswer(markHeard(sounds(session)), 'letter-sound:T', false)))
  const supported = () => { const r = markSupported(markHeard(sounds())); markAnswer(r, 'letter-sound:S', true); rounds.push(record(r)) }

  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').state, 'Not observed')
  supported()
  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').state, 'Emerging')
  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').practice, 1)
  eligibleCorrect('quest-1')
  eligibleCorrect('quest-1')
  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').state, 'Developing')
  eligibleCorrect('quest-1')
  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').state, 'Developing', 'three corrects in one session are not consolidating')
  eligibleCorrect('quest-2')
  const consolidating = itemEvidenceState(rounds, 'letter-sound:S')
  assert.equal(consolidating.state, 'Consolidating')
  assert.equal(consolidating.eligibleCorrect, 4)
  assert.equal(consolidating.eligibleRounds, 4)
  assert.equal(consolidating.sessions, 2)
  assert.equal(consolidating.review, false)
  eligibleWrong('quest-3')
  const afterError = itemEvidenceState(rounds, 'letter-sound:S')
  assert.equal(afterError.state, 'Developing', 'a recent error withholds consolidating without erasing corrects')
  assert.equal(afterError.eligibleCorrect, 4)
  assert.equal(afterError.review, false)
  eligibleWrong('quest-3')
  assert.equal(itemEvidenceState(rounds, 'letter-sound:S').review, true)
  assert.equal(itemEvidenceState(rounds, 'letter-sound:T').state, 'Not observed')
  const summary = evidenceSummary(rounds)
  assert.deepEqual(Object.keys(summary), ['letter-sound:S'])
  assert.equal(summary['letter-sound:S'].lastEligibleCorrectAt, when.toISOString())
})
