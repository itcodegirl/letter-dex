# Letter Dex project audit, 5 September 2026

**Scope:** `letter-brody` `main` at `9b261c3`; `foundational-literacy-curriculum` `main` at `61ba597`; `foundational-literacy-game` `main` at `f4cc206`; five prior analysis documents, committed with this audit under `docs/state/` (listed in §2).
**Method:** every source, data, test, and documentation file in the three repositories was read; `npm test` was run on `letter-brody` (34/34 pass); GitHub issues (none) and pull requests #1–#15 were reviewed; the prior documents were read and each of their findings was re-checked against current `main`. A parallel cross-check pass with adversarial verification was run over the curriculum documents and the prior reports; only findings that survived verification, or that I confirmed in code myself, appear here.
**Status:** audit and remediation review only. No code or data changed. Merge remains Jenna's.

---

## 1. Executive summary

**Health: Orange, significant risk.** Two things are true at once. The curriculum track (`foundational-literacy-curriculum`) has completed its research, reconciliation, developmental progression, assessment specification, lesson framework, and game mapping with unusual honesty about evidence grades, and its reference game (`foundational-literacy-game`, "Letterlight Grove") implements the evidence rules it describes. And the app Brody plays (`letter-dex`) is, by an accepted decision (D-008), outside that governance: its learner model cannot separate independent responses from guesses or supported answers, its `mastered` flag is reachable by elimination and never clears, and eleven of its twenty-five letter sounds are stored as schwa-bearing speech tokens. The 5 September pilot surfaced the cost: counting was too easy for him and the speech modelled the wrong sounds.

**Current stage:** letter-dex is in implementation of selected slices under a self-imposed expansion freeze. The curriculum track is at "game mapping approved, implementation frozen". The reference game is a merged vertical slice with no persistence, frozen by decision.

**Strengths:** the twelve learning rules in `CLAUDE.md` and their enforcement in code; the grapheme-array data model with cumulative tests; the curriculum track's evidence discipline (states, sufficiency defaults, `not_assessable`, screening is not mastery); the reference game's refusal to claim mastery; scope and intellectual-property discipline across all three repositories.

**Risks:** (1) letter-dex reports a scheduling flag as mastery; (2) letter-dex has no instruction step, so untaught letters are quizzed; (3) schwa in the sound tokens undermines blending; (4) the Android tablet has never run the app and there is no host it can reach; (5) the only valid-evidence implementation in the project (the Grove) forgets every observation on reload, and the app that persists data records the wrong things.

**On the right path?** Yes, provided the next work is evidence and instruction in letter-dex, not new worlds. The freeze in `PLAN.md` is correct. This audit gives it an exit condition and names the pattern letter-dex can borrow from the curriculum track without merging repositories or sharing records.

## 2. Evidence reviewed

**letter-brody:** `CLAUDE.md`, `PLAN.md`, `README.md`, `AGENTS.md`, `NOTICE.md`, `design-qa.md`, `docs/learning/counting-evidence-contract-v1.md`, all of `docs/qa/` and `docs/sources/`, all of `src/`, `data/`, `test/`, `scripts/`, `index.html`, five stylesheets, `assets/` sizes, `package.json`, PRs #1–#15.

**foundational-literacy-curriculum:** `README.md`, `AGENTS.md`, `docs/DECISIONS.md` (D-001 to D-008), `docs/CHAT-ARTIFACT-INVENTORY.md`, `curriculum/developmental-progression/foundational-literacy-developmental-progression-v1.md`, `assessments/foundational-literacy-assessment-specification-v1.md`, both strand specifications, `curriculum/lesson-design/foundational-literacy-lesson-framework-v1.md`, `design/game-mapping/foundational-literacy-game-mapping-v1.md`, `research/completed/research-02-reconciliation-audit.md` (approved), the 01A, 02A and 03A reports, the retained duplicate reconciliation, `research/foundational-literacy-developmental-research.md`. The three research prompts were not read in full; they are inputs, not findings.

**foundational-literacy-game:** `README.md`, `AGENTS.md`, `package.json`, all of `src/core/`, `src/main.ts`, `src/ui/app-shell.ts`; `src/game/` and styles by summary.

**Prior analysis documents (now in `docs/state/`):** `2026-09-04-current-state-report.md`, `2026-09-04-three-repositories-addendum.md`, `2026-09-04-d008-two-games-convergence-draft.md` (since accepted verbatim as D-008), `2026-09-05-letter-dex-system-design.md` (design only), `2026-09-05-adr-001-app-delivery-and-file-protocol.md` (proposed; Option A is in effect). Thirteen further uploaded files were byte-identical to files already in the repositories.

**Not available:** the local `C:\Users\itcod\projects\letter-dex` working tree itself. Every uploaded source and test file from it matched `main`, so no uncommitted code was audited.

## 3. Current project state

### Confirmed (implemented or authoritative)

- letter-dex: rules 1–12 in `CLAUDE.md`; 25 sound anchors (`data/roster.js`); grapheme unit (`data/graphemes.js`); letter sets 1–4; six cumulative word sets (89 words); the Choose engine; adaptive selection with weight 1/(streak+1), mastered at streak ≥ 2, 20% mastered share (`src/core/select.js`, `progress.js:68`); progress schema v1 in one `localStorage` key with JSON export/import; quests of 8 correct with discovery (footprints → meet → journal) and optional continuation; Living Trail Three.js r180 scene with WebGL fallback; three math stages; Pokédex; parent view; voice and pace settings; local m/n/s clips; 34 passing tests; counting evidence contract v1; pilot guide and 5 Sep results; Android tablet primary, laptop secondary; private family prototype (`NOTICE.md`, `robots.txt`, `noindex`).
- Curriculum track: D-001 two independent strands; D-002 research before lesson design; D-003 approved reconciled evidence base; D-004 compact competency model AR-001, AR-002, PW-001..003; D-005 transparent evidence-sufficiency defaults for piloting; D-006 physical evidence required for PW mastery; D-007 curriculum state separate from game state; D-008 two implementations, two purposes. Progression v1 (five learning states: Not observed, Emerging, Developing, Consolidating, Generalized), assessment spec v1 (15-field evidence record, controlled `prompt_level`, `result` including `not_assessable`, `assessor_type`, `physical_evidence`), both strand specs, lesson framework v1, game mapping v1 (event types, content-selection contract, acceptance tests, IP boundary), reconciliation audit approved 2 Sep.
- Reference game: AR-001 slice with instruction → supported practice → three independent probes → review or complete; observations carry `competencyId`, `roundId`, `target`, `response`, `correct`, `promptLevel`, `eligibleForFutureMasteryReview`, `observedAt` (`src/core/types.ts`); supported practice creates no observation; rewards in a separate store; adult view fixed at "No mastery decision"; five passing tests; no persistence.
- ADR-001 Option A is in effect: `CLAUDE.md` now says ES modules require a server and `file://` is unsupported.

### Planned (documented, not built)

- letter-dex Phases 1–6 (all marked not approved); the recording plan; the ending-sound round for X; Build, Sort, Trace, Procedure engines and all primitives; original books; the 80% set recommendation (exists only as a tooltip, `main.js:366-371`).
- System design (5 Sep): schema v2 with `masteredAt` and `lapses`, an `events` log, strand-prefixed ids, `unlocks` state; IndexedDB; service worker; `core/audio.js` port; `core/rules.js`; skill registry at the third Choose skill. Status: design only, nothing adopted.
- ADR-001 action items 4 (a decisions file for letter-dex, `LD-NNN` convention) and 6 (a delivery smoke test).

### Proposed (explored, not adopted)

- Engagement review recommendations (visible Pokémon purpose, adult-selectable math start stage, tray/bubble overlap fix). Digraph and blend anchor candidates in `PLAN.md`.

### Unresolved

- Letterforms and font; recording device and timing; voice choice (P-02); engagement mismatch (P-04); any physical Android observation; a host the tablet can reach; mastery decay (system design open question 2); skill-registry threshold (question 3, now reached: letters, words and math are three Choose-based skills).

### Contradictory (details in §12)

- `CLAUDE.md` rule 5 (name mode, b/d and p/q mirror-pair unlock) vs D-008 consequence 1, which removes letter names from letter-dex.
- `PLAN.md` Phase 2 "Letter sequence (Build)" vs the curriculum boundary: alphabet sequence is Strand A territory and is excluded as mastery there; it was not deferred with Phase 1a.
- `PLAN.md` and the counting contract say "AR/PW remains frozen under D-008"; D-008 freezes the reference game, and says letter-dex does not carry AR/PW.
- `PLAN.md` "sets unlock … when ≥ 80% mastered" vs a tooltip-only recommendation; and the curriculum's reconciled finding that no universal percentage rule is evidence-supported.
- `CLAUDE.md` rule 6 present tense ("X gets an ending-sound round") vs no such round; X absent from every set.
- Recording plan "no schwa" vs sound tokens `buh kuh duh guh huh juh puh tuh wuh yuh kwuh` in `data/roster.js` and `data/graphemes.js`.
- Phase 0 done criterion (private deployed URL) vs no deployment.

### Missing

- In letter-dex: competency definitions with observable behaviours, expected errors, and mastery criteria for sounds, words, and counting (the curriculum track has them for AR and PW only); an evidence contract for the reading modes; per-round evidence in the save; a decisions file; a child playtest protocol for Sounds and Words; a reachable host; continuous integration.
- In the reference game: persistence of any kind; stable observation ids.
- In the curriculum track: a child playtest plan (the game mapping's acceptance tests are engineering tests, not a learner session).

## 4. Audit scorecard

| Area | letter-dex | Curriculum track (AR/PW) | Risk to the project | Notes |
|---|---|---|---|---|
| Research foundation | Needs Work | Strong | Medium | Curriculum track grades evidence and carries unresolved items honestly; letter-dex's rules are unlabelled and its sources are two apps' skill lists. |
| Developmental progression | Acceptable | Strong | Low | SATPMI order is common practice; progression v1 is a dependency graph, not an age ladder. |
| Curriculum architecture | Needs Work | Strong | Medium | letter-dex has data, not competencies; Words mode targets a different skill than its curriculum row. |
| Assessment architecture | High Risk | Strong (spec) | High | letter-dex: elimination-reachable, sticky mastery. Curriculum: spec exists; nothing persists it. |
| Learner model | Needs Work | Strong (spec) | High | `{seen, correct, streak, lastSeen, mastered}` vs a 15-field evidence record with `not_assessable`. |
| Learning experience | Needs Work | Acceptable | Medium | letter-dex has no modelling step; the lesson framework defines one. |
| Game mapping | Acceptable | Strong | Medium | letter-dex rewards are separate from mastery but catches are random; math stage doubles as curriculum progression. |
| Core game loop | Acceptable | Not Yet Applicable | Low | Understood by the child; six extra taps per quest end. |
| Progression | Needs Work | Acceptable | Medium | Math cycles on completion; set choice manual; Grove has no progression by design. |
| UX | Acceptable | Acceptable | Medium | letter-dex camp is text-heavy; Sounds keys tappable before Listen. Grove: keyboard Enter quirk, reload restart. |
| Accessibility | Acceptable | Acceptable | Low | Both use real buttons, live regions, reduced motion. letter-dex wrong-answer signal vanishes under reduced motion. |
| Technical architecture | Acceptable | Acceptable | Low | Vanilla and small vs TypeScript, Phaser (1.39 MB) for three letters. |
| Testing | Acceptable | Acceptable | Medium | 34 and 5 tests; no CI anywhere; letter-dex modes untested. |
| Scope control | Strong | Strong | Low | Freeze declared; D-008 recorded; no accounts or cloud. |
| Vertical slice readiness | Blocked | Complete (as slice) | High | letter-dex's evidence chain steps 3–5 are invalid; Grove's steps 1–2 and 6–7 are thin (three letters, no reward meaning). |

## 5. Curriculum audit

### Development sequence status

| Phase | letter-dex | Curriculum track |
|---|---|---|
| Research | Drafted (two apps' exports, `CLAUDE.md` rules) | Complete (three runs, reconciled, approved D-003) |
| Source reconciliation | Drafted (PK/K overlap, K as spine) | Complete |
| Developmental progression | Drafted (set order, baseline) | Approved (progression v1, 2 Sep) |
| Curriculum architecture | Drafted (data files are the spec) | Approved (D-004 compact model, strand specs) |
| Assessment specification | Drafted for counting only; Not Started for reading | Approved (assessment spec v1) |
| Learning experience design | Premature (built, QA'd after) | Approved (lesson framework v1) |
| Game mapping | Premature (Living Trail, discoveries, math selected and built 5 Sep) | Approved (game mapping v1) |
| Product / UX design | In Development | In Development (Grove UI) |
| Technical architecture | In Development | In Development (Grove core/game/ui split) |
| Implementation | In Development (slices beyond approved phases by selection) | Complete for one slice; frozen (D-008) |
| Testing and validation | In Development (unit tests good; pilot begun; Android blocked) | Drafted (5 unit tests; no learner test) |
| Expansion | Blocked, correctly | Blocked, correctly |

**Implementation driving requirements (letter-dex):** the 8-correct quest and the streak ≥ 2 flag came from the original single-file prototype, and the counting contract now instructs that they must not change. Contract v1's limitations section (E-01) describes what the save cannot prove, written after the math stages shipped. In the curriculum track the sequence was respected: research → reconciliation → progression → assessment → lesson framework → game mapping → one slice.

### Strand A: Alphabet recognition and letter names

Owned by the curriculum track. The strand spec, progression v1, assessment spec and lesson framework together define, for AR-001 and AR-002: the competency statement, required prerequisite (an accessible response mode only), typical task progression, evidence dimensions, do-not-infer list, assessment method with safeguards, common errors (descriptive, not diagnostic), advancement, remediation, spiral review, evidence strength, instructional bands, item-selection rules, and a minimum assessment set. Recognition vs recall, upper vs lower, sequence vs identity, name vs sound, exposure vs proficiency, practice vs mastery are all distinguished explicitly. The one thing the strand leaves open, and says so, is whether receptive and expressive evidence should ever be scored as separate competencies (reconciliation Part X).

What letter-dex does with Strand A: nothing, by D-008. Its Sounds mode speaks "Letter S" after the sound and the anchor name (`letters.js:106`). That is exposure, not assessment, and the research supports it: names bootstrap sounds and teaching names with sounds beats sounds alone (02A Key Finding 3). Two letter-dex artefacts still refer to Strand A content and need annotation: `CLAUDE.md` rule 5 (a name mode and mirror-pair unlock letter-dex will not have) and `PLAN.md` Phase 2 "Letter sequence (Build)".

### Strand B: Pre-writing and fine-motor foundations

Owned by the curriculum track. PW-001..003 define physical-evidence-only mastery (D-006), response conditions (trace, imitate, copy, independent) as evidence conditions rather than results, observation-only factors (grasp, posture, hand preference), and the digital boundary: a screen may demonstrate, prompt, pace and log practice but may not certify physical control. Motor proficiency vs academic proficiency, physical vs touchscreen, tracing vs independent formation, pre-writing strokes vs letter formation, and visual-motor integration vs letter knowledge are all separated with citations.

What letter-dex does with Strand B: nothing built. `PLAN.md` Phase 5 tracing is deferred and labelled practice-only, consistent with D-006 and D-008 consequence 2. `PLAN.md` Phase 1a still lists "Trace digits 1–10" without that label. Berry tapping in math is an interface gesture and is not recorded as a motor competency. No finding.

### Integrity issues in letter-dex

1. **Words mode measures listen-and-match, not blend-to-read.** `words.js:79` speaks the whole word; the child picks it from three printed minimal pairs. The curriculum row it stands in for is "Blend two/three letter sounds to read". A child can succeed on initial sound alone, and `word:sat` will read as decoding in the parent view. Rename the competency now (`word-match:`), redesign toward blending with the Build engine in Phase 1c. Priority P1.
2. **Sound tokens encode the schwa for eleven letters.** `roster.js` and `graphemes.js` use `buh kuh duh guh huh juh puh tuh wuh yuh kwuh`; the recording plan forbids exactly that, and `speakWord` blends "buh. ah. tuh. bat". The system design (§3.5) and the 4 Sep state report both flagged it. Only recorded clips fix stops; the m/n/s clip path in `speech.js` already exists. Record the Set 1 clips (a, t, p, i) first. Priority P1, P0 for the vertical slice.
3. **Berry Crossing compounds counting with numeral identification** (`math.js:17,65`). Number recognition is "not started" in the baseline. Contract v1 words the claim carefully. Keep the round; add a numeral-recognition item type in Phase 1a. Priority P2.
4. **Phase 2 "Letter sequence" is Strand A content.** Alphabet order is excluded as mastery in the curriculum track (reconciliation Part XI.4) and letter-dex carries no AR competencies (D-008). Defer it with Phase 1a or relabel it as exposure only. Priority P2.
5. **Set 4 omits X and no ending-sound round exists.** Rule 6 is written in the present tense. Priority P2 (Phase 1b); doc fix now.
6. **`as`, `is`, `us` end in /z/ or /s/ inconsistently with the `s` token.** Minor. Priority P3.
7. **Terminology drift.** Session = quest = adventure; "Set readiness" = share of items with the scheduling flag; "mastered" is both the selector flag and the parent-facing label. Fix in the evidence contract. Priority P2.

### Research and evidence grading

The curriculum track grades honestly. 01A uses Strong / Moderate / Emerging / Practice-Based / Uncertain; 02A and 03A tag every paragraph as research finding, professional practice, researcher interpretation, curriculum recommendation, or unresolved; the reconciliation uses Strong / Moderate / Limited / Emerging and lists weak claims (Part VIII) and unresolved questions (Part X). Screening cut-points are repeatedly separated from mastery. The progression v1 says its thresholds are "curriculum-design defaults for piloting, not research-derived universal thresholds" (D-005). Nothing found presents a correlation, benchmark, single paper, or practice as fact.

letter-dex's rules, graded in the same vocabulary:

| Rule | Grade | Support or conflict |
|---|---|---|
| 3 sound before name; pure sounds, no schwa | Strong for the no-schwa requirement (synthetic phonics practice); the sound→name order is a project decision that fits 02A's "names bootstrap sounds" without letting names pre-empt sounds | Supported; the data tokens violate it |
| 4 lowercase default | Common practice; curriculum finds no case gate either way (Moderate) | Neutral |
| SATPMI set order | Common practice; curriculum says any letter order is a curriculum-design judgement, not a developmental fact | Label as a design judgement |
| 5 C/K never share a sound round | Project decision; consistent with "do not place highly confusable alternatives together until each identity is known" (AR strand spec rule 3) | Supported by analogy |
| 5 b/d, p/q in name mode | Belongs to Strand A; curriculum treats reversals as normal to about age 7 and observational only | Annotate as AR-strand |
| 2 wrong answers never punished, say what it was | Expert recommendation, moderate evidence; matches the game mapping's error-handling rules | Supported |
| 8 minimal-pair distractors | Moderate (visual confusability affects difficulty); curriculum's distractor-class idea | Supported |
| 10 mastered at 2 in a row; 20% retention; weight 1/(streak+1) | Project decision. The curriculum's own default requires two independent opportunities for Developing and three across two sessions for Consolidating; a single or double success never reaches Consolidating | Conflicts as a mastery claim; fine as a scheduler |
| 80% set recommendation | Project decision; reconciliation Part XI.10 and 01A Part VIII say no universal percentage rule is supported | Conflicts as a rule; acceptable as a labelled heuristic |
| 9 quests of 8 | Project decision (attention span heuristic) | Neutral |
| 11 grapheme unit | Strong practice basis for synthetic phonics | Supported |
| Baseline percentages from the school app | Historical context only (contract v1 already says so) | Neutral |

Recommendation: add an evidence-grade column to the rules, or a `docs/learning/rules-evidence.md`, so a future contributor can tell rule 10 from rule 3. P2.

## 6. Assessment and learner model audit

**Can the project answer the six questions?**

| Question | letter-dex today | Curriculum track / Grove |
|---|---|---|
| What does he know? | Per-item `correct/seen` and a sticky flag; nothing per round | Per-observation record; five states derived by rule; the Grove shows observations but never a state |
| How confidently? | No: one flag, no counts of independent successes, no dates | By design: sufficiency defaults count independent opportunities across sessions and conditions |
| What evidence? | Aggregates; the contract admits an export cannot reconstruct first responses (`letters.js:88,96`, `words.js:90,97`, `math.js:69,78`) | Every state must link to source observations (assessment spec) |
| What next? | Adaptive within the chosen set; set change manual; math stage cycles on 8 correct | Lesson framework adaptive table; strand spec item-selection rules |
| If he struggles? | Same item again with spoken feedback; no scaffold escalation | Prompted success repeated with weaker prompt; conceptual error reduces set; interface error changes response mode without lowering mastery |
| After mastery? | 20% retention; the flag never clears (`progress.js:68`) | Errors do not erase prior evidence; repeated independent errors trigger review and a fresh probe |

**Findings (letter-dex)**

- **A1 Mastery reachable by elimination.** Wrong taps reset streak (`progress.js:60`) but the correct tap on the same round increments it; "wrong, right" then "right" next encounter → mastered. With three keys a first-try guess succeeds one time in three. The parent view then paints the item gold. P0 for assessment.
- **A2 Mastery is sticky.** `mastered: … || previous.mastered`. Retention failures never surface. Raised in the 4 Sep report (#6) and the system design (§3.1). P1.
- **A3 Keys are tappable before Listen in Sounds mode** (`letters.js:112`). Words already gates (`words.js:81-83`). P0 for the slice.
- **A4 Every wrong tap is an attempt** (`progress.js:63`); the confusion target is discarded. P1.
- **A5 Count-along is the only support flag**, and a helped success hides the ordinary record (`math.js:78`). P1.
- **A6 Version mismatch wipes progress** (`progress.js:16`); undeclared fields survive only via spread. Raised in the system design (§3.1). P1.
- **A7 Strands do not inherit mastery.** Ids are namespaced; the math journey is separate; tested at `math-adventure.test.js:23-38`. Correct.

**Findings (reference game)**

- **G1 No persistence.** Observations and rewards live in memory; reload resets everything. Raised in the 4 Sep addendum; verified (no storage code in `src/`). Not a defect while frozen; the deciding gap if it ever continues.
- **G2 Observation ids from a module counter** (`evidence.ts:3`) will collide the moment persistence lands.
- **G3 Evidence record is a subset of the spec.** `EvidenceObservation` lacks `session_id`, `task_version`, `presentation_condition`, `response_mode`, `self_correction`, `assessor_type`, `physical_evidence`, `accommodations`, and `result` has no `not_assessable`. Acceptable for a slice; the spec says these are required per observation.
- **G4 Uppercase-only content** vs the progression rule that cases are taught and assessed concurrently. Prototype content, labelled as such.

**Recommended learner model for letter-dex (additive, v1-compatible, under letter-dex governance)**

Keep rule 10's streak flag as the scheduling signal. Add an `evidence` array of per-round records, written by `progress.js` only, using the assessment spec's vocabulary where it applies:

```
{ id, itemId, kind, mode, roundId, sessionId, taskVersion,
  response,            // first tap
  result,              // correct | incorrect | no_response | not_assessable (audio failed, navigation)
  promptLevel,         // independent | replay | count_along | adult_unknown
  retries,             // later taps, never evidence
  selfCorrection,      // boolean
  observedAt }
```

Report in the parent view: independent first-try successes over rounds per item, last independent success date, a separate practice count, and the state vocabulary Not observed / Emerging / Developing / Consolidating with the curriculum's default counts (one success → Emerging; two independent → Developing; three across two sessions in mixed review → Consolidating). Reserve the word "mastery" for Consolidating or better. This shares vocabulary and shape with the curriculum track; it shares no records and does not put letter-dex under that track's IP or approval rules. Record it as `LD-001` in a new `docs/DECISIONS.md` in letter-dex (ADR-001 action item 4).

## 7. Learning experience audit

| Element | Sounds | Words | Math | Lesson framework requires |
|---|---|---|---|---|
| Objective | implicit (sound → grapheme) | implicit (spoken word → print) | explicit per stage | one primary competency and content target |
| Prerequisite / access check | none | none | none | access check first |
| Introduction / modelling | none before the question; anchor revealed after | segmented reveal after | mission text; count-along | explicit model producing no evidence |
| Guided / supported practice | none | none | count-along (good) | supported practice with fading prompts |
| Independent practice | yes | yes | yes | independent opportunity only when no help was given |
| Feedback | says what the tapped letter says | says the tapped word | says the number chosen plus help | neutral on first error |
| Error handling | retry, no penalty | retry | retry | reduce set or remodel on conceptual error |
| Assessment | conflated with practice | conflated | separated only by count-along | prompted never scored as independent |
| Remediation | none | none | none | adaptive table |
| Advancement | manual set | manual set | automatic cycle | from evidence, not map order |

The loop is "tap the right stone → stone rises → repeat" with unusually good error feedback and no first meeting. Brody's baseline for S, T, P, M, I is "not started"; the app quizzes letters he has not been taught and teaches them only through wrong-answer feedback. The Grove already models the fix: instruction → supported practice → independent probe. For letter-dex, when an item has `seen === 0`, run a **meet round** (show the letter, play the sound, reveal the anchor, say "sss. Snorlax. Letter S", one tap to continue), record nothing, then quiz. High impact, low effort (`letters.js` only). P1.

Other: prompts are text-only and never auto-spoken (iOS gesture rule respected). Words' Listen gate is right; keep it. Math `0 here. How many more?` reads oddly but is a legitimate item.

## 8. Game design and mapping audit

| Mechanic | Type | Learning connection | Risk | Recommendation |
|---|---|---|---|---|
| 8-correct quest | Progression | none (pacing) | none | Keep (approved) |
| Living Trail 3D scene (~703 KB JS, ~300 meshes) | Motivational | none; mirrors the meter | tablet perf unmeasured | Keep; Needs Validation on Android; do not extend |
| Companion Pikachu | Narrative | generic lines | pilot: "not enough Pokémon" | Modify: react to the task and answer |
| Anchor reveal after a sound answer | Educational | strong (rule 1) | none | Keep; extend into the meet round |
| Catch on every words/math correct, random from the letter set | Motivational | negative: anchors as loot unrelated to the item | dilutes the sound → Pokémon pairing | Modify: word's first-grapheme anchor; math from a non-anchor pool |
| Catch once per sounds quest (8th letter) | Motivational | weak | density inconsistent with words (8×) | Modify with the above |
| Discovery: footprints → meet → journal | Reward / narrative | none | six extra taps per quest | Keep (selected); single-tap skip on replay |
| Badges (session count) | Cosmetic | none | none | Keep |
| Math destinations and stage cycle (`math-journey.js:16`) | Progression | the same value drives item selection | game progression is curriculum progression, which the game mapping forbids ("never the same value") | Modify: adult-selectable start; mastery-aware next stage later |
| Manual set selection with 80% tooltip | Progression | intended unlock | invisible on touch | Modify: visible label |
| Mode bar on the device face | Exploration | rule 12 | none | Keep |
| Grove lights (reference game) | Cosmetic | none, by design | none | Keep; frozen |

**Mapping chain** (competency → objective → interaction → mechanic → feedback → evidence → state → consequence): in letter-dex links 1–5 exist, link 6 is aggregate-only, link 7 updates a flag, link 8 is invisible to the child and manual for the adult. In the Grove links 3–6 are valid and links 1–2 and 7–8 are thin by design. Competencies without interactions in letter-dex: number recognition and number sequence to 10 (where Brody is active), ending sounds.

**Core loop:** confirmed from code, screenshots and the pilot. Understandable and short. Unnecessary for the proof: the 3D scene, three-screen discovery, three math stages. Selected decisions; keep them out of the evidence pathway.

**Rewards:** never awarded for wrong taps; not manipulative; do not claim mastery in words. Guessing is not discouraged in Sounds because keys precede Listen (A3).

**Engagement:** the pilot reports under-stimulation (counting too easy) and too little Pokémon presence. The fix is challenge fit (start stage, meet round, Set 1 sounds), not more effects.

## 9. UX and accessibility audit

| Screen | Purpose | Primary action | Load | Clarity issue | Recommendation |
|---|---|---|---|---|---|
| Camp | choose adventure | one of three large buttons | high reading load (h1, eyebrow, copy, six buttons, settings summary) | Math nav button has no icon; grown-up panel is an unguarded `<details>` | Improve: cut copy; minimal two-tap gate |
| Sounds round | hear sound, pick stone | Listen then key | low | keys tappable before Listen | Improve: gate keys on Listen |
| Words round | hear word, pick print | Listen | low | none | Keep |
| Math round | count or add, pick numeral | berries then key | medium | tray overlaps the companion bubble in one viewport | Improve overlap |
| Discovery ×3 | celebrate | footprints, hello, journal | low each | none | Keep; skip on replay |
| Pokédex | collection | browse | low | no speech, no focus set | Improve later |
| Grown-up settings | parent | selects | high | import replaces state | Improve: gate |
| Grove (reference) | AR-001 probe | choose then confirm | low | Enter re-activates the focused button instead of confirming; restart reloads the page | Note only; frozen |

**Child-centred:** in rounds the four questions (what do I do, what happened, did I succeed, what next) are answered by speech and shape; at camp and in discovery they rely on text the child cannot read plus one "Hear" button.

**Accessibility (letter-dex):** real buttons; `aria-pressed`; `aria-live` on reveal and statuses; focus moved on view change; targets ≥ 64 px (berries hit exactly 64 with zero gap on small screens, `math.css:52-53`); reduced motion respected; canvas `aria-hidden`. Gaps: `#prompt` is not a live region though it carries the Words wrong-answer text; `#sceneStatus` lacks `role="status"`; meter, badges and mastered tiles are colour-only; under reduced motion the wrong-answer shake becomes invisible (`styles.css:84,174-176`), leaving sound and text but no shape, which the 4 Sep report flagged as High and which is still open; Nunito and Material Symbols load from Google Fonts, and if the icon font fails the buttons show literal words such as "hearing". The correct-answer glyph the 4 Sep report asked for now exists (`trail.css:45`).

**Accessibility (Grove):** DOM buttons mirror the canvas; every prompt has text; sound and motion toggles; number-key selection. Meets the game mapping's list for a selection task.

Fine-motor accommodation vs competency change: not applicable yet; PW says digital is practice only.

## 10. Technical architecture audit

**letter-dex.** Vanilla ES modules, one engine, data separated from modes, tests on data and core. Architecture supports the curriculum rather than dictating it. `main.js` is a 478-line shell that owns navigation, session, settings, import and discovery wiring; state is mutated by modes, the discovery view and the math journey, and `persist()` is called ad hoc. Undeclared save fields survive only by object spread (A6). Duplications and magic numbers: `activeLetters` in `main.js:146` and `letters.js:23`; quest length 8 in `main.js:30` and three literals in `math-journey.js`; stage count 3 in three places; footprints 3 in core and view; pace list in two files; the C/K rule inside a mode (`letters.js:73`); math questions split between `data/math/adventure.js` and `math.js:17,24,80`; journal strings in `main.js:140`; `playRound` called with an argument it ignores at five sites; the word-set helper `g` (`word-sets.js:1`) splits characters and cannot express a digraph, which rule 11 will need at the first `sh` set (4 Sep report #7, still open); `letters.js:121` preloads a random letter's artwork rather than the next round's. Low cost individually; one tidy PR later.

Against the system design's sequenced adoption: item 0 (close Phase 0) is partly done (session restart fixed in PR #3; private deploy not done; non-colour feedback done for correct, not for wrong); item 1 (fetch off the critical path) is done (`letters.js:48` no longer awaits); item 2 (audio port) exists in narrow form (`speech.js` clip path for m/n/s); items 3–6 (schema v2, rules module, service worker, registry) not started. Three Choose-based skills now exist, which is the design's own threshold for deciding on the registry.

**Reference game.** `src/core/` is framework-free and tested; `src/game/` is Phaser presentation; `src/ui/` is DOM. The Phaser bundle is 1.39 MB for three letters and a canvas that carries no required interaction (4 Sep addendum). No persistence (G1), counter ids (G2). Fine for a frozen slice.

**Curriculum vs presentation separation.** In letter-dex: competency (none written), activity (mode files), presentation (modes plus UI), assessment (`progress.js`), reward (`main.js` plus discoveries). Assessment and reward are separate fields inside one save blob. The missing piece is a competency and evidence description, not a refactor. In the curriculum track the separation is the design's central rule (D-007, game mapping architecture boundary) and the Grove honours it (separate `RewardStore`, tested).

**Complexity.** Three.js: current need ambience; cost unmeasured tablet performance and a 2.7 MB stone texture; keep, validate once, freeze scope. Phaser: same question in the Grove; moot while frozen. Discovery state machine: fine. Nothing else exists that might someday be useful.

**Performance.** letter-dex ships about 19 MB of PNG at 1536×1024 and above with no compression; the camp background alone is 2.4 MB (4 Sep report #8, still open). Convert to WebP or JPEG at display size. PokéAPI use is compliant with its caching request.

**Testing.** letter-dex: 34 tests over data rules, selector bounds, progress round-trip, lifecycle, speech sequencing, discoveries, math data. Untested: `choose.js`, all modes, `main.js`, parent view, the C/K runtime exclusion, and the elimination-to-mastery path (a design bug, not a test gap). Grove: 5 tests, all on the evidence rules. No continuous integration in any of the three repositories; `npm test` before a PR is a convention only.

**Repository hygiene.** letter-dex has no `.gitattributes`, no `engines` field, no lockfile (by design). The curriculum repo added `.gitattributes` (`* text=auto eol=lf`) on 4 Sep. The game repo has none. `npm run verify:roster` rewrites `checkedAt` on every run.

**Deployment.** None evidenced for letter-dex; `scripts/serve.js` binds `127.0.0.1`, so the tablet cannot reach it. This blocks the standing Android gate.

## 11. Dependency and sequence audit

| Work item | Depends on | Status | Risk if started early |
|---|---|---|---|
| Parent "Set readiness" and mastery labels | letter-dex evidence contract | Missing | reports a scheduling flag as mastery (happening now) |
| Math stage progression | counting and number competency definition | Missing | gates by completion and loops (happening now) |
| Words mode as decoding | blend-to-read competency definition | Missing | measures matching (happening now) |
| Meet round and Set 1 clips | recording device and time | Unresolved | none if scoped to Set 1 |
| Android validation | reachable host | Missing | the gate cannot close |
| Adaptive cross-set routing | learner model with evidence | Missing | arbitrary routing; do not start |
| Schema v2 / IndexedDB / service worker (system design 3–5) | migration path (A6) and ADR-001 (done) | Design only | silent wipe of progress if version bumps first |
| Skill registry (system design 6) | rules module and the third Choose skill | Threshold reached | premature abstraction if built before the evidence layer |
| Any new world or curriculum in letter-dex | pilot review and Jenna's decision | Frozen | rework (freeze is correct) |
| Grove persistence | a decision that the Grove continues | Frozen (D-008) | wasted work unless AR instruction is required |
| Phase 1a number recognition | sprite grid primitive plan | Not started | none; it is where Brody is |

## 12. Drift, contradiction and scope audit

**Drift**

- Game ahead of assessment in letter-dex: thirteen of fifteen PRs were opened on 5 Sep and built the trail, math stages, discoveries, journal and beacon; the evidence contract came last and documents limits. Corrective: the next PRs are evidence and instruction.
- Docs describing desired state as present: `CLAUDE.md` structure block (five engines, primitives), rule 6, the `PLAN.md` unlock rule. Corrective: mark as planned or implement the visible recommendation.
- Visual polish before instruction: 19 MB of art and a 3D scene, no meet round. Corrective: meet round before any new art.
- Assessment threshold protected by docs because it is implemented ("do not change its threshold"). Corrective: keep the flag as scheduling; add evidence beside it.
- The system design's own adoption order was not followed: items 3–5 were skipped and new world features were built instead. Corrective: no new features until items 0 and 3 close.

**Contradictions**

| Source A | Source B | Conflict | Consequence | Resolution |
|---|---|---|---|---|
| `CLAUDE.md` rule 5 (name mode, mirror-pair unlock) | D-008 consequence 1; `PLAN.md` line 79 | rule governs a mode letter-dex will not have | contributors plan around a deferred competency | annotate rule 5 as AR-strand; keep the C/K half |
| `PLAN.md` Phase 2 "Letter sequence (Build)" | curriculum README boundaries; reconciliation XI.4; D-008 | alphabet sequence is Strand A and excluded as mastery | Phase 2 re-imports a deferred strand | defer with 1a or relabel exposure-only |
| `PLAN.md` line 17 and contract v1 line 83 "AR/PW remains frozen under D-008" | D-008 text | D-008 freezes the reference game; letter-dex simply carries no AR/PW | wording implies the strands are paused | reword: "AR/PW belong to the curriculum track; the Grove is frozen" |
| `PLAN.md` unlock at ≥ 80% mastered | `main.js:366-371` tooltip; reconciliation XI.10 | no unlock exists; no universal percentage is evidence-supported | adult chooses blind on touch; a heuristic reads as a rule | document as "manual, with visible recommendation"; label the 80% as a design heuristic |
| `CLAUDE.md` rule 6 | `letter-sets.js` | X untaught; no ending round | Set 4 incomplete | reword to "will get"; Phase 1b |
| Recording plan (no schwa) | `graphemes.js`, `roster.js` | data carries the schwa | wrong model in every consonant except m, n, s | Set 1 clips now; phoneme id separate from TTS hint |
| Phase 0 done criterion (deployed URL) | no deployment | Phase 0 not actually done | Android gate blocked | decide hosting now |
| `PLAN.md` Phase 1a "Trace digits 1–10" | D-008 consequence 2; PW digital boundary | digit tracing on screen must be practice-only | risk of recording it as mastery | label practice-only in 1a as Phase 5 does |
| 4 Sep addendum: two remotes (`letter-dex`, `letter-brody`) | Jenna, 5 Sep: `letter-dex` was renamed to `letter-brody` | resolved; one remote | none | note the rename in README |
| Math stage drives item selection (`math.js:11`) | game mapping "curriculum state and game progression are never the same value" | not governing letter-dex, but the principle is violated | completion implies stage mastery | adult start stage (R8) |

**Scope**

- Current: evidence validity, meet round, Set 1 clips, host for the tablet, pilot retest.
- Next: Phase 1a number recognition and sequence (where he is), Phase 1b remaining sets plus the X ending round, Words relabel and redesign.
- Later: Build engine, sight words, full recorded audio, books; schema v2 and IndexedDB; service worker (ADR-001 unblocked it).
- Expansion: grades 1–5, primitives, Procedure engine; the Grove only if AR instruction is required (D-008 §4).
- Out of scope, correctly absent everywhere: accounts, cloud, multiplayer, monetisation, AI tutor, cosmetics and inventory.

**Intellectual property by distribution context.** Private prototype (current): compliant; PokéAPI at runtime only, `NOTICE.md`, `noindex`, D-008 consequence 3 exempts letter-dex from the game-mapping IP boundary while private and non-commercial. Portfolio: the Grove is the portfolio artefact by design (original art, curriculum-governed); letter-dex would need the child's name stripped from `main.js:348`, `index.html:40`, `PLAN.md` and docs, and a rights review. Public or commercial: the game-mapping IP boundary applies in full; letter-dex's anchor layer would have to be replaced; the m/n/s clips are CC BY-SA 3.0 (share-alike). Nothing blocks the family prototype.

## 13. Vertical slice readiness

Proposed slice: **Sound adventure, Set 1 (s a t p m i)**. It is the product's core idea, Brody has A at 100% and the rest not started, and the pilot showed counting is too easy for him.

Proof chain and what must change:

1. competency: "given the sound, select the lowercase grapheme": write it down, one page, in the curriculum track's format (statement, prerequisite, evidence dimensions, do-not-infer, common errors, advancement, remediation).
2. objective and interaction: exist.
3. encounter: exists (stone plus anchor reveal); add the meet round.
4. assessment event: gate keys on Listen; record first response and support.
5. learner-state update: evidence array beside the streak flag.
6. reward: exists.
7. progression consequence: visible "next set ready" label instead of a tooltip.
8. child understands and enjoys: adapt the counting pilot protocol to sounds.

The Grove already proves steps 3–5 in isolation; letter-dex proves 1–2 and 6–7. The slice borrows the Grove's session pattern (instruction → supported practice → independent probe → review) as guidance under letter-dex's own rules.

Not required for the slice (built, leave in place, do not extend): 3D trail, discovery ceremony, math stages, voice settings.

**Questions the first sounds playtest must answer** (adapting `docs/qa/counting-pilot-guide.md`): does he tap Listen unprompted; does he wait for the clue before choosing; after a miss, does he re-listen or tap the next stone; can he say what the meet round told him ("what does Snorlax say?"); does he want to continue after eight, and what does he think the footprints and journal are for; any audio, touch or loading problem on the tablet; what he says or does, verbatim.

**Testing timing:** before implementing the slice, unit tests for the evidence writer and the Listen gate; during the slice, one adult-led tablet session with round-level notes; before expansion, CI, the C/K runtime guard test, mode-level DOM smoke tests, and ADR-001's delivery smoke test.

## 14. Top strengths

1. `CLAUDE.md` rules are pedagogically sound and enforced in code (sound → name order `letters.js:106`, C/K exclusion `letters.js:73`, minimal pairs `words.js:37-50`, no punishment), and the research in the curriculum track supports the ones it can speak to.
2. The grapheme-array data model with cumulative-unlock and duplicate tests from the first commit.
3. The curriculum track's evidence discipline: graded findings, listed weak claims, states derived by transparent defaults, screening separated from mastery, digital separated from physical.
4. The reference game's honesty in code: supported practice creates no observation, rewards never read evidence, the adult view holds "No mastery decision"; all tested.
5. Scope and IP discipline in all three repositories: freeze declared, D-008 recorded, runtime PokéAPI only, static stack, no backend, no accounts.

## 15. Top risks

1. letter-dex's `mastered` is reachable by elimination and never cleared, surfaced as "Set readiness".
2. No instruction step in letter-dex; untaught letters are quizzed.
3. Schwa in eleven sound tokens; blending models the wrong sounds.
4. The Android target has never run the app; no reachable host; 19 MB of art.
5. The project's only valid-evidence implementation forgets everything on reload, and the implementation that persists records aggregates that cannot be interpreted; Words mode and the math cycle measure or gate the wrong thing.

## 16. Recommended improvements

| # | Recommendation | Priority | Complexity | Phase | Prior mention |
|---|---|---|---|---|---|
| R1 | Reading evidence contract (Sounds, Words) plus an additive per-round `evidence` array in save v1 using the assessment spec's vocabulary; record as `LD-001` | P0 | Medium | Before Assessment | system design §3.1 `events`; D-008 draft option C |
| R2 | Gate Sounds keys behind Listen; only the first tap is the response | P0 | Low | Immediate | new |
| R3 | Meet round for unseen items | P1 | Low | Before slice testing | lesson framework "explicit model" |
| R4 | Set 1 recorded clips (a, t, p, i) via the existing clip path; phoneme id separate from TTS hint | P1 | Low–Medium | Before slice testing | 4 Sep report §7 risk; system design §3.5 |
| R5 | Parent view: independent vs practice, curriculum state names; stop labelling the flag "readiness" | P1 | Low | Before slice testing | new |
| R6 | A host the tablet can reach (LAN bind, or private deploy with protection) | P1 | Low | Immediate | 4 Sep report §9.4 |
| R7 | Save migration path; never wipe on version mismatch | P1 | Low | Before R1 lands | system design §3.1 |
| R8 | Adult-selectable math start stage; no automatic loop to counting | P2 | Low | Before next pilot | engagement review |
| R9 | Words mode: relabel now; redesign toward blending with Build | P2 | High | Phase 1c | new |
| R10 | Catch linkage: word's first-grapheme anchor; math from a non-anchor pool | P2 | Low | Before mapping new content | new |
| R11 | Asset optimisation to WebP/JPEG at display size | P2 | Low | Before Android test | 4 Sep report #8; system design §7 |
| R12 | CI running `node --test`; tests for the C/K runtime guard and first-response recording; ADR-001 smoke test | P2 | Low | Before Expansion | 4 Sep report §9.7; ADR-001 item 6 |
| R13 | Doc reconciliation: rules 5 and 6, Phase 2 letter sequence, Phase 1a tracing label, "AR/PW frozen" wording, unlock rule, structure block, Phase 0 criterion, evidence grades; `docs/DECISIONS.md` with `LD-001` | P2 | Low | Immediate | ADR-001 item 4 |
| R14 | Accessibility: `#prompt` live region; `#sceneStatus` role; non-colour marks on meter and badges; wrong-answer glyph under reduced motion | P2 | Low | Before UX polish | 4 Sep report #4 (partly fixed) |
| R15 | Digraph-aware word helper before the first `sh` set | P2 | Low | Before Phase 1c data | 4 Sep report #7 |
| R16 | Camp copy reduction; minimal grown-up gate | P3 | Low | Before UX polish | new |
| R17 | Self-host Nunito and the icon glyphs | P3 | Low | Later | 4 Sep report #9 |
| R18 | Magic-number and string consolidation; dead `playRound` arguments; preload the next round | P3 | Low | Later | 4 Sep report #11, #15 |
| R19 | Phase 1a number recognition and sequence | P2 | Medium | Next (after slice) | 4 Sep report §9.10 |
| R20 | Grove: persistence and stable ids, only if D-008 §4 triggers | P4 | Medium | Later | 4 Sep addendum |

**Impact and effort.** High impact, low effort: R2, R3, R5, R6, R8, R10, R13. High impact, high effort: R1, R4 (Jenna's recording time), R9, R19. Low impact, low effort: R11, R12, R14, R15, R17, R18. Low impact, high effort: none identified; do not build cross-set routing, the skill registry, or a content pipeline yet.

### P0 and P1 detail

**R1 Reading evidence contract and evidence array.** Current: aggregates only. Problem: independent first responses cannot be separated from retries or supported answers; the flag is misreported. Recommended: `docs/learning/reading-evidence-contract-v1.md` mirroring counting v1, plus the additive `evidence[]` in §6 written by `progress.js` only, plus `docs/DECISIONS.md` with `LD-001` recording the vocabulary borrowed from the curriculum track and the fact that no record is shared. Reason: keeps rule 10 and rewards untouched while making exports reconstructable. Depends on R2, R5, R7. Done when an exported save lists, for every round, first response, result, prompt level, retries and time, and a test proves a wrong-then-right round is stored as non-independent.

**R2 Gate keys on Listen.** Current: `letters.js:112` renders keys before Listen. Recommended: render keys on the first Listen as Words does; Listen stays repeatable. Done when a Sounds round cannot be answered before Listen and a test asserts it.

**R3 Meet round.** Current: no modelling before the first quiz. Recommended: when `seen === 0`, show letter plus sound plus anchor with one Continue tap; not recorded as evidence. Done when Brody's first encounter with S is a meeting, not a question.

**R4 Set 1 clips.** Current: m, n, s clips; the rest TTS with schwa. Recommended: Jenna records a, t, p, i, short and clipped, per the recording plan; wire through the existing `speech.js` clip path; tests like the m/n/s ones. Done when all six Set 1 sounds play as clips and an adult audition passes on the laptop and tablet.

**R5 Parent view separation.** Current: "Set readiness" equals the share of items flagged. Recommended: per item, independent first-try successes over rounds, practice count, last independent success, and the state name; keep the flag but label it "scheduled as known". Done when a parent cannot read practice as mastery.

**R6 Host.** Current: `127.0.0.1` only. Recommended: bind `serve.js` to the LAN behind a flag and document the tablet URL, or deploy privately with access control (ADR-001 notes the deploy becomes the way Brody reaches the app). Done when the tablet opens the game and one pilot session is recorded on it.

**R7 Migration.** Current: version mismatch wipes (`progress.js:16`). Recommended: `normalizeProgress` upgrades known older versions and preserves unknown ones under a backup key; a pre-migration export. Done when a v1 save loads under v2 with tests.

## 17. Remediation plan

- **Immediate:** R2, R6, R13.
- **Before Assessment:** R1 (contract and `LD-001`), R7.
- **Before Game Mapping (of any new content):** R10; the math competency note (§5 issue 3); the Words relabel (first half of R9).
- **Before UX Design (polish):** R14, R16.
- **Before Implementation (of the slice):** the evidence array design agreed; PR split per `CLAUDE.md` (data PR for clips, core PR for evidence, mode PR for gating and the meet round, docs PR for the contract and decisions file).
- **Before Vertical Slice Testing:** R3, R4, R5, R11, the sounds pilot protocol.
- **Before Expansion:** R8, R9, R12, R15, R19, and Jenna's recorded decision to lift the freeze; R20 only if D-008 §4 triggers.

## 18. Decision register

| Decision | Current evidence | Options | Recommendation | Timing |
|---|---|---|---|---|
| Meaning of "mastered" in letter-dex | streak ≥ 2 flag, sticky | keep as scheduling flag and add an evidence criterion; or change the flag | keep the flag; adopt the curriculum's default counts (two independent → Developing; three across two sessions → Consolidating) as the reported states | Decide Now |
| Evidence storage | aggregates | additive `evidence[]` under v1; or v2 with migration | additive under v1 with migration groundwork (R7) | Before Assessment |
| Where letter-dex decisions live | `PLAN.md` dated lines | `docs/DECISIONS.md` with `LD-NNN`; ADR files | `docs/DECISIONS.md`, `LD-001` first (ADR-001 item 4) | Decide Now |
| Hosting for the tablet | localhost only | LAN bind; private deploy with protection | LAN bind first; private deploy when away from home | Decide Now |
| Vertical slice | math counting piloted | Sounds Set 1; Bridge Builders | Sounds Set 1 | Decide Now |
| Words mode competency | listen and match | relabel; redesign to blending | relabel now; redesign in 1c | Before Game Mapping |
| Math start stage and loop | cycles | adult start; mastery-aware next | adult start now | Before next pilot |
| Catch linkage | random from the letter set | first-grapheme anchor; non-anchor pool for math | as stated | Before Game Mapping |
| Mastery decay (system design Q2) | flag never clears | sticky; lapses counter; derived from evidence states | derived from evidence states once R1 lands | Before Assessment |
| Skill registry (system design Q3) | three Choose skills exist | build now; write beginning/ending/middle-sound as modes first | defer until the evidence layer and rules module exist | Before Expansion |
| Letterforms and font (Q4) | Nunito, double-storey a | keep; switch when the tracing app is known | keep until Strand B work makes it concrete | Before Expansion |
| Recording device and time | undecided | phone voice memo | phone; Set 1 only now | Before slice testing |
| Grown-up gate | none | none; long-press; two-tap | two-tap or long-press, no PIN | Before UX |
| Canonical remote | `letter-dex` was renamed to `letter-brody`; one remote (Jenna, 5 Sep) | none | note the rename in README | Decided 5 Sep |
| Commit the prior analysis documents | committed to `docs/state/` with this audit | none | done | Decided 5 Sep |
| Distribution context | private | private; portfolio (Grove); public | private for letter-dex; the Grove is the portfolio artefact | Later |
| Grove freeze exit | D-008 §4 | unfreeze when AR instruction is required | keep frozen; persistence first if it ever continues | Later |

## 19. Next three actions

🔴 **Critical: make letter-dex's evidence valid.** Write the reading evidence contract, gate Sounds keys behind Listen, and add the additive per-round evidence array with first-response, result and prompt-level fields, using the curriculum track's vocabulary and the Grove's supported-versus-independent split as the pattern; record the choice as `LD-001`. Why now: every downstream claim (parent view, pilot, unlock recommendation) rests on it, the counting contract already admits the gap, and the pattern is already designed and tested in the sibling repositories. Deliverables: `docs/learning/reading-evidence-contract-v1.md`, `docs/DECISIONS.md`, the `progress.js` evidence writer, the Sounds gate, tests. Done when an exported save reconstructs independent versus supported responses for every round and Sounds cannot be answered unheard.

🟡 **Important: stand up the Sound Set 1 slice and test it on the tablet.** Meet round, four recorded clips, parent-view separation, a LAN-reachable host, asset shrink, the sounds pilot protocol; then one adult-led session with Brody on the Android tablet. Why next: it turns the product's core idea into a proof and closes the standing Android gate. Done when one recorded tablet session has round-level observations and Jenna records proceed or correct-and-repeat.

⚪ **Later: retarget Words and math progression.** Words toward blend-to-read (Build engine, plan mode first); adult start stage for math; Phase 1a number recognition. Why wait: both depend on the evidence layer and the slice result. Prerequisite: slice reviewed, freeze decision recorded. Done when the Words competency label matches what is measured and math no longer loops to counting by default.

## 20. Final recommendation

**Complete remediation first.** Keep the freeze on new worlds and curriculum in letter-dex and keep the Grove frozen. Do the Critical action, then the Sound Set 1 slice and its tablet pilot, then decide on expansion from that evidence.

**What should not change:** D-001 through D-008 and the curriculum track's sequence; the twelve learning rules and their code enforcement; the grapheme-array data model and cumulative tests; the anchor roster (sound over fame); no-punishment feedback that says what the tapped thing was; the separation of rewards from assessment and of math state from reading state; the private IP posture and runtime-only PokéAPI; the vanilla static stack with no backend; the kid-reachable mode bar; the 64 px floor and reduced-motion support; the one-phase-per-PR and engine-versus-data PR rule; the selected Living Trail, discovery and math designs as motivational layers. Rule 10's streak flag stays as the scheduler; this audit asks only that it stop being reported as mastery, and that letter-dex borrow the vocabulary its sibling already wrote.

## Appendix A. Prior findings, re-checked on `main` at `9b261c3`

| Prior finding | Source | Status now |
|---|---|---|
| Session cannot restart without reload | 4 Sep report #1 (Critical) | Fixed (PR #3; `main.js:197-204`) |
| Does not run from `file://` | 4 Sep report #2; ADR-001 | Resolved by amending `CLAUDE.md` (ADR-001 Option A) |
| Letters mode dead-ends on PokéAPI failure | 4 Sep report #3 | Fixed: options render before the fetch resolves (`letters.js:48-59`) |
| Correct/incorrect feedback colour- or motion-only | 4 Sep report #4 | Half fixed: ✓ glyph on correct (`trail.css:45`); wrong still motion-only under reduced motion |
| `design-qa.md` overstated shape feedback | 4 Sep report #5 | Superseded: file rewritten for Living Trail; current claim (check icon on completion) is true |
| Mastery permanent | 4 Sep report #6; system design §3.1 | Open |
| Digraph-blind `g()` helper | 4 Sep report #7 | Open (`word-sets.js:1`) |
| 2.4 MB background | 4 Sep report #8; system design §7 | Open; now 19 MB of assets in total |
| Icon-font dependency | 4 Sep report #9; addendum | Open |
| Parent view re-rendered on every answer | 4 Sep report #10 | Open (`main.js:103`) |
| Duplicate `activeLetters`, `shuffled`; biased shuffle; dead `playRound` args | 4 Sep report #11, #12, #15 | Open |
| `innerHTML` interpolation of API strings | 4 Sep report #13 | Open, low risk |
| `verify:roster` dirties the tree | 4 Sep report #16 | Open |
| Two remotes | addendum §1.1 | Resolved: `letter-dex` was renamed to `letter-brody` (Jenna, 5 Sep) |
| `PLAN1.md` and stray inventory file | addendum §2 | Fixed (removed 4 Sep) |
| Curriculum repo CRLF | addendum §3 | Fixed (`.gitattributes` 4 Sep) |
| Game repo CRLF, no persistence, counter ids, 1.39 MB bundle, Enter quirk, reload restart | addendum §4 | Open; frozen by D-008 |
| D-008 unrecorded | 4 Sep report §8 item 21 | Fixed (accepted in `DECISIONS.md`) |
| Schema wipe on version bump | system design §3.1 | Open (`progress.js:16`) |
| Schwa in sound tokens | system design §3.5; 4 Sep report §7 | Open |
| Runtime learning rules untested | system design §2; 4 Sep report | Open |
| Decisions file for letter-dex; delivery smoke test | ADR-001 items 4, 6 | Open |
