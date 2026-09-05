# Reading learning and evidence contract v1

Status: proposed, 5 September 2026, under Jenna's instruction to start the audit's
Critical action. Learning validation remains pending. This is an observation and
evidence contract for the existing Sounds and Words modes. It changes no learning
rule in `CLAUDE.md`, no selection threshold, no reward, and approves no later phase.
It is the reading counterpart of the
[counting contract](counting-evidence-contract-v1.md) and relies on the shared
[evidence record](evidence-record-v1.md).

## Competencies these modes can speak to

Letter Dex carries no Alphabet Recognition or Pre-Writing competency (D-008 in the
foundational-literacy curriculum). The identifiers below are this repository's own.

### LS-001 Receptive sound-to-grapheme identification

**The learner can** select the lowercase grapheme for a spoken single sound from three
alternatives drawn from the active letter set.

- **Mode:** Sounds. Prompt is the sound alone; the anchor Pokémon and the letter name
  are spoken only after a correct answer (rule 3).
- **Presentation dimensions:** letter set, displayed case (lowercase by default,
  uppercase as a setting), distractor rule (random from the set, C and K never
  together), whether the clue was heard and how many times.
- **Do not infer:** the letter name; producing the sound aloud; blending; anything
  about uppercase from a lowercase round or the reverse; retention beyond the log.
- **Expected errors (descriptive, never diagnostic):** tapping before listening;
  choosing a visually similar letter; choosing the letter whose name contains the
  sound (for example tapping *k* for /k/ when *c* is the target is not an error of
  sound knowledge, which is why C and K never share a round); losing the clue after a
  replay.
- **Valid evidence:** the first tap of a round in which the clue was heard. Until the
  keys are gated behind Listen (audit recommendation R2), a first tap before Listen is
  recorded as `not_assessable`.
- **Advancement:** stays with the adaptive selector inside the chosen set. A visible
  "next set ready" label may follow later; it is not part of this contract.
- **Remediation:** the meet round for unseen items (R3) is a model, not evidence.

### WR-001 Spoken-word-to-print matching

**The learner can** select the printed decodable word that matches a spoken word,
from three minimal-pair alternatives of the same length.

- **Mode:** Words. The whole word is spoken; the grapheme-by-grapheme reveal happens
  after a correct answer.
- **What it is not:** blending or decoding. The child hears the word before seeing
  print, so success can rest on the initial sound or word shape. Decoding from print
  (blend-to-read) is a separate future competency for the Build engine and gets its
  own identifier when it exists. The parent view must not label WR-001 as reading.
- **Presentation dimensions:** word set (cumulative), word-length setting, distractor
  rule (minimal pairs by shared position).
- **Do not infer:** decoding; segmenting; letter sounds for the graphemes in the word;
  sight-word knowledge.
- **Expected errors:** choosing the minimal pair that shares the first grapheme;
  choosing by length when the pool is thin; tapping before the word finished.
- **Valid evidence:** the first tap after Listen. The keys already render only after
  Listen, so `clueHeard` is true for every Words record.

Item ids do not change. `letter-sound:S` and `word:sat` keep their aggregate records;
the evidence record carries `competencyId` beside `itemId`.

## Evidence per round

See the [evidence record](evidence-record-v1.md). For reading the essential fields are
`response` (first tap), `result`, `clueHeard`, `replays`, `retries`, and `eligible`.
Replaying the clue before answering is allowed and recorded; it does not make the
response supported. A correct tap after a wrong tap is a retry: visible, never evidence.

## Game rewards and stored progress

Unchanged. Eight correct taps complete a quest whether or not the taps were first
responses (rule 9). Catches, badges, discoveries, and the journal are encouragement,
not assessment. Two consecutive recorded corrects still set the `mastered` scheduling
flag (rule 10); the flag is reported as "scheduled as known", never as mastery.

## Current limitations, inspected at `main` `ff98bdd`

- The save holds aggregates only; no per-round record exists yet.
- Sounds renders its keys before Listen (`src/modes/letters.js`), so an answer can be
  given unheard.
- Eleven consonant tokens in `data/roster.js` and `data/graphemes.js` carry a schwa in
  browser speech; only m, n, and s play recorded clips. A response to a schwa-bearing
  clue is still a response to that task; note the token in the pilot sheet.
- No meet round exists; an unseen item is quizzed first.
- Words measures matching, not decoding, as stated above.

## Adult-led pilot for Sounds

Adapt the [counting pilot guide](../qa/counting-pilot-guide.md). Record per round:
stage and target sound, whether Listen was pressed and how often, first choice and its
correctness, support (none, replay, adult explanation or cue), retries, strategy if
observable, access problems, and his words or actions. Questions the first Sounds
pilot answers: does he tap Listen unprompted; does he wait for the clue; after a miss
does he re-listen or tap the next stone; can he say what the meet round told him; does
he want to continue after eight; any audio, touch, or loading problem on the tablet.

## Validation and change gate

The record and its tests ship in a separate core pull request; the Sounds gate ships in
a separate mode pull request; the parent-view change ships after both. None of them
reopens curriculum, worlds, or engines. Physical Android checks and the adult-led
pilot remain required before any expansion decision, and Jenna records that decision.
