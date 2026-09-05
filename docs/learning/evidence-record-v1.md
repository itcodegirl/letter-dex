# Evidence record v1

Status: proposed with [LD-001](../DECISIONS.md#ld-001--per-round-evidence-records-beside-the-scheduling-flag).
Applies to: every playable mode in Letter Dex (Sounds, Words, Math).
Authority: this repository's `CLAUDE.md` and `PLAN.md`. The vocabulary below is
borrowed from the foundational-literacy curriculum's assessment specification so
that adults reading either project see the same words; no record is shared
between the two projects and neither governs the other (D-008 there).

## Why a record exists

Today each item keeps one aggregate: `{ seen, correct, streak, lastSeen, mastered }`.
That aggregate cannot say whether a correct tap came first, after a wrong tap, after
count-along help, or before the clue was heard. The counting contract already lists
this as limitation E-01. The `mastered` flag is a scheduling signal for the adaptive
selector (rule 10) and stays exactly as it is. The record described here is added
beside it so that an export can be read as evidence.

## One record per round

A round is one item presented once. The round produces exactly one record, written
when the first answer tap happens or when the round ends without one.

```text
id             ev:<n>                 monotonic per save; never reused
competencyId   LS-001 | WR-001 | MA-001 | MA-002 | MA-003
itemId         letter-sound:S | word:sat | math-count:4 | ...   (unchanged ids)
mode           letters | words | math
sessionId      the quest's startedAt (reading) or the set cursor's startedAt (math)
taskVersion    letters-v1 | words-v1 | math-v1   bump when prompt, choice count,
               distractor rule, gating, or help changes
presentation   letters: { case, letterSet, choices: 3, distractors: 'set-random-no-ck' }
               words:   { wordSet, wordLength, choices: 3, distractors: 'minimal-pair' }
               math:    { setId, stage, choices: 3, distractors: 'adjacent-numbers' }
clueRequired   true for letters and words (the answer needs the spoken clue);
               false for math (the task is visible)
clueHeard      true when Listen (or a companion's "hear the mission") played before
               the first tap; only meaningful when clueRequired
replays        Listen presses before the first tap (0 or more)
response       option id of the FIRST tap, or null
result         correct | incorrect | no_response | not_assessable
promptLevel    independent | count_along | model
retries        taps after the first (never evidence)
selfCorrection true when a retry reached the target
eligible       true only when promptLevel = independent, result is correct or
               incorrect, and (clueHeard or not clueRequired)
access         null | unheard | audio_failed | left_round
observedAt     ISO timestamp of the first tap or of the round ending
assessorType   automated   (adult observations live on the pilot sheet, not here)
```

Rules:

- `result` describes the first tap only. Later taps change `retries` and
  `selfCorrection`, nothing else.
- `promptLevel` is `count_along` when any berry or empty space was tapped, or Count
  with me was pressed, before the first answer tap. It is `model` for a meet round
  (the introduction of an unseen item, when that exists). It is `independent` otherwise.
  The app cannot see an adult's cue; during a pilot the adult sheet decides.
- `not_assessable` is used when the clue could not be heard (audio failed before the
  first tap, or the first tap came before Listen in a clue-required mode) and when the
  learner left the round after starting help. It is never counted as an error.
- `no_response` is used when the learner left the round without tapping an answer and
  without starting help.
- Retries, count-along successes, model rounds, and inaccessible rounds stay in the
  log. They are visible history and never evidence.
- Records are appended to `evidence[]` in the existing schema v1 save. The array is
  capped at 5,000 records; the oldest are dropped and `evidenceDropped` counts them.
  Export carries the whole array. This cap is a design default, revisable through
  `docs/DECISIONS.md`.
- Nothing here changes selection, the streak flag, quests, rewards, discoveries, or
  the math journey. A record is written by `progress.js` and read by the parent view.

## Reported states

The parent view derives a state per item from eligible records only, using the
curriculum's five state names and its v1 sufficiency defaults. These are design
defaults for piloting, not validated thresholds.

| State | Rule |
|---|---|
| Not observed | no eligible record |
| Emerging | one eligible correct, or any supported success |
| Developing | two eligible corrects |
| Consolidating | three eligible corrects across at least two sessions, and no eligible incorrect among the last three eligible records |
| Generalized | not computed in v1 (would need a materially different presentation) |

An eligible incorrect never erases prior evidence. Two eligible incorrects among the
last three eligible records set a `review` flag beside the state. The word "mastery"
is reserved for Consolidating or better and is never applied to the streak flag.

The parent view shows, per item: state, eligible corrects over eligible rounds,
practice count (count-along and retry successes), replays, last eligible correct
date, and the streak flag labelled "scheduled as known".

## What the record cannot claim

- Adult prompting, pointing, or answer cues.
- The learner's strategy (counting, subitizing, guessing) unless observed by an adult.
- Retention beyond the recorded sessions, or transfer to paper, print, or speech.
- Letter names, letter sounds produced aloud, or decoding by blending (see the
  reading contract for what each mode does and does not measure).
- Anything about the learner's development. Records describe responses to tasks.

## Tests that must exist before the record ships

- A wrong tap followed by a correct tap on the same round produces one record with
  `result: incorrect`, `retries: 1`, `selfCorrection: true`, `eligible: true`.
- A correct tap after count-along produces `promptLevel: count_along`, `eligible: false`.
- A first tap before Listen in Sounds produces `result: not_assessable`, `access: unheard`.
- A model round produces `promptLevel: model`, `eligible: false`, and does not touch
  the item's streak or `mastered`.
- Export then import preserves `evidence[]`, `evidenceSeq`, and `evidenceDropped`.
- The state calculator returns the table above for constructed logs, including the
  two-session requirement and the review flag.
- The cap drops the oldest records and increments `evidenceDropped`.
- `normalizeProgress` accepts a v1 save without `evidence` and adds an empty array.
