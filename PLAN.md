# Letter Dex — PLAN.md

Status: **Phase 0 approved by Jenna on 2 Sep 2026. Later phases remain plan-only until approved.**
Last updated: 4 Sep 2026.

## Living Trail implementation slice (selected 5 Sep 2026)

### Math Adventure extension (selected 5 Sep 2026)

Jenna selected all three math designs: Berry Crossing (count 1–10), Bridge Builders
(picture addition within 5), and Beacon Rescue (missing amounts to make 5).
They use the existing Choose engine with countable berry groups. Each stage saves at
eight successes, offers optional continuation, and advances to the next stage.
Math journey progress is separate from reading. Count-along help is saved as practice,
not independent mastery. This is the selected math slice, not approval for tracing or later grades.

Jenna selected Living Trail with a Pokémon companion and asked to apply it directly to the game.
The slice layers a Three.js 0.180.0 renderer over the current Sounds and Words activities,
preserves curriculum data and mastery rules, and adds optional continuation after eight answers.
Companion artwork comes from PokéAPI at runtime and is independent of the answer.
Static-server delivery replaces the inconsistent file-protocol requirement for this slice.
The original slice did not approve later phases; the math extension above records the subsequent selection.

## Open questions (answer before phase 0 ships)

1. **Device.** Decided 4 Sep 2026: Android tablet (primary), laptop (secondary). Design for
   touch first; everything must also work with mouse and keyboard.
2. **Recorded sounds.** Decided: two voices, see "Recording plan" below. Still open: which device
   they're recorded on (phone voice memo is fine) and when.
3. **Letterforms.** What do *a* and *g* look like on his tracing app? Single-storey or double-storey
   decides the font for the whole game.

## Where Brody is (1 Sep 2026)

| Strand | Skill | Status |
|---|---|---|
| Letter sounds (K) | Letter A | 100% |
| Letter sounds (K) | Letter B | 88% |
| Read words s,a,t,p (K) | Blend two sounds | 84% |
| Read words s,a,t,p (K) | Segment to find sounds | 100% |
| Number sequence (K) | Count to 10 | 90% |
| Counting (K) | Count up to 5 objects | 95% |
| Number tracing (PK/K) | Trace 1, 2, 3 | 100% |

Everything else: not started. He is in kindergarten; PK content is a sweep to confirm the basics,
not a stage to spend time in.

## Sources

Two apps' curricula, captured in `docs/sources/brody-curriculum-reference-2026-09-04.md`; his
1 Sep 2026 baseline is `docs/sources/where-brody-is-2026-09-01.md`. PK and K overlap heavily
in both subjects; K is the superset and is the data spine. Grade 1–5 tiers are logged for
shape, not for near-term build. Letter names, case match, and letter tracing belong to the
foundational-literacy-curriculum strands (AR, PW) under its D-008 and are deferred here.

## Engines

Every buildable skill maps to one of five engines. New skills should map to an existing engine;
a sixth engine needs a plan-mode conversation.

| Engine | Interaction | Covers |
|---|---|---|
| **Choose** | Tap one of three | Letter sound, letter name, case match, sight word, blend-to-read, beginning/ending/middle sound, rhyme, number recognition, counting, subitizing, compare (groups, numbers, heights, weights), shapes, positional words, fact fluency |
| **Build** | Tap tiles in order, or swap/add one tile | Segment a word, add a sound to make a new word, magic-e, suffix rules, letter sequence, number sequence, patterns, compose/decompose, equations with a blank, compose shapes |
| **Sort** | Tap item, tap bucket | Color, size, type, shapes, even/odd |
| **Trace** | Finger on canvas, stroke order, tolerance | 26 uppercase, 26 lowercase, 10 digits |
| **Procedure** | Step-by-step column scaffold | Regrouping, long division, multi-digit multiplication |

## Primitives

| Primitive | First needed | Covers |
|---|---|---|
| Sprite grid | Phase 1 | Counting, subitizing, compare groups, add/subtract with pictures |
| Ten frame | K math | Number representations, compose/decompose within 5 and 10, relationship to 5/10, teen numbers as 1 ten + ones, make a 10 |
| Number line | Grade 1 math | Count on/back, missing addend, 10 more/less, skip counting, rounding, fractions, decimals |
| Base-ten blocks | Grade 1 math | Place value to 120 → 1,000 → multi-digit, regrouping animation |
| Grid / array | Grade 2 math | Equal groups, arrays, multiplication, area, perimeter, distributive property (Minecraft-block art) |
| Clock | Grade 1 math | Hours → half → quarter → 5 min → minute, elapsed time |
| Coins | Grade 1 math | Recognize, count, make amounts, change |
| Fraction strips | Grade 3 math | Unit fractions, compare, equivalent, mixed numbers |
| Ruler, protractor, plots | Grade 2–4 math | Measurement, angles, data |

## Data model

One record per item (letter, grapheme, word, number fact):
`{ id, kind, seen, correct, streak, lastSeen, mastered }`

- **Selection:** weight ∝ 1 / (streak + 1). Mastered at streak ≥ 2. Mastered items get a fixed
  ~20% share of every session for retention. Never 0%, never > 30%.
- **Unlocks:** sets unlock in curriculum order when the previous set's items are ≥ 80% mastered.
  Manual override in parent settings always works — the unlock is a default, not a lock.
- **Persistence:** `localStorage`, single versioned key, JSON export/import.
- **Parent view:** per-item accuracy grid, per-set mastery %, last-7-days activity.
- **Collection:** every correct answer in a word/number round catches a Pokémon from the active
  letter set. The Pokédex screen shows everything caught.

## PokéAPI usage (verified 2 Sep 2026)

- `/pokemon/{slug}` → `sprites.other['official-artwork'].front_default`, `height`, `weight`, `types`
- `/pokemon-species/{slug}` → `color` (10 values), `shape`
- Roster slugs for A–Z (minus X) all resolve. See `data/roster.js` and `data/roster-status.json`.
- Digraph/blend anchor candidates (verify slugs before use): Charmander *ch*, Shellder *sh*,
  Squirtle *squ*, Blastoise *bl*, Flareon *fl*, Clefairy *cl*, Slowpoke *sl*, Trapinch *tr*,
  Primeape *pr*, Grimer *gr*, Croagunk *cr*, Froakie *fr*, Whismur *wh*, Phanpy *ph*.

## Recording plan

`speechSynthesis` has no child voice and adds a schwa to consonants. Recorded audio replaces it in
phase 3, per `CLAUDE.md`. Two voices are split by what each does well.

**Jenna — pure sounds.** Consonants must be clipped with no vowel after them: *sss*, *t*, *mmm*,
not *suh*, *tuh*, *muh*. Vowels are short: *a* as in *apple*, *e* as in *egg*, *i* as in *ink*,
*o* as in *octopus*, *u* as in *umbrella*.

| Set | Clips | Files |
|---|---|---|
| Letters | 25 — every letter except x | `audio/sounds/a.mp3` … `audio/sounds/z.mp3` |
| x ending sound | 1 — *ks* | `audio/sounds/x.mp3` |
| K graphemes | 8 — *sh ch th wh ph ck ng qu* | `audio/sounds/sh.mp3` … |
| Decodable words (optional) | ~90 — the K word sets | `audio/words/sat.mp3` … |
| Spoken prompts | 4 | `audio/lines/prompt-letter.mp3` … |

**Brody — names, numbers, reactions.** Enthusiasm over accuracy.

| Set | Clips | Files |
|---|---|---|
| Pokémon names | 25 — the roster | `audio/names/abra.mp3` … |
| Numbers | 21 — zero through twenty | `audio/numbers/0.mp3` … `audio/numbers/20.mp3` |
| Reactions | 6 | `audio/lines/yes.mp3` … |
| Letter names | 26 | `audio/letternames/a.mp3` … |

Record in a quiet room with a phone about a hand's width away. One file per clip or a long take
with two-second pauses is acceptable. Mono `.mp3` or `.m4a` is fine; Safari does not play `.ogg`.
Missing clips fall back individually to `speechSynthesis`. Do not upload a child's voice to a
voice-cloning service.

---

## Build order

Each phase is one or more PRs. Acceptance criteria define done.

### Phase 0 — Foundation (approved)

- Repo at `~/projects/letter-dex`, structure per `CLAUDE.md`, `npm test` wired to `node:test`.
- Port the supplied `letter-dex.html` into modules: Choose engine, letters mode, words mode,
  roster, word sets.
- Grapheme model: words stored as grapheme arrays. Migrate existing word sets.
- Adaptive selector + progress store + JSON export/import.
- Pokédex collection screen. Session cap at 8 with badge.
- Parent view (accuracy grid).
- Deploy privately to Vercel after target-device and access decisions are answered.
- **Done when:** existing game works identically on the private deployed URL, progress survives a
  refresh, Pokédex fills, and all data tests pass.

### Phase 1 — Where he is (not approved)

**1a. PK sweep — letter names and case match deferred to the AR strand (curriculum D-008).**
Number recognition 1–10, count objects 1–10, number sequence to 10 (sprite grid). Trace
digits 1–10.

**1b. K sounds.** Letter Sounds sets 2–4, ending-sound round for X, revision spiral.

**1c. K words.** Read Words with s,a,t,p and m,i: segment (Build), beginning/ending/middle sound
(Choose), add-a-sound (Build), rhyme (Choose). Then remaining K word sets as data.

**1d. K math.** Ten frame. Compare groups and numbers. Compose/decompose within 5 and 10.
Add/subtract with pictures within 5, then 10. Sort by color/type/size using PokéAPI data. Compare
heights and weights. Shapes use original SVG.

### Phase 2 — Sight words (not approved)

- Sight-word mode: Choose, no segmenting, sight-word distractors.
- Letter sequence (Build). Mirror-pair unlock for b/d, p/q.

### Phase 3 — Recorded sound and original decodable books (not approved)

- Recorded audio replaces `speechSynthesis` per the recording plan, with per-clip fallback.
- One original book per K word set, using only its set and earlier words plus cleared sight words.
- Books unlock when their word set is ≥ 80% mastered.
- Simple SVG scenes and original characters; no third-party text.

### Phase 4 — Grade 1 reading and math (not approved)

- Reading: blends, ending blends, magic-e, vowel teams, bossy r, ck/ng, soft c/g, sight words.
- Math: number line, base-ten blocks, clock, coins, word-problem templates, fact fluency, ruler,
  bar/picture graphs, partition shapes.

### Phase 5 — Tracing letters (not approved; deferred to the PW strand, curriculum D-008)

- If ever built here it is practice only and records no mastery. Trace engine already exists
  from digits. Author 52 stroke sets to match his app's letterforms.

### Phase 6+ — Grade 2–5 (not approved)

- Reading: spelling strands only.
- Math: grid/array, area model, fraction strips, decimals, Procedure engine, protractor,
  coordinate plane, volume, and unit conversion.

## Product boundaries

- Reading stays focused on letter names, sounds, decoding, sight words, and spelling. Passage-based
  comprehension and grammar belong to a successor product.
- Math remains in Letter Dex through grade 5 using the listed primitives.

## Never

- Song lyrics or melodies. Third-party book text. Leveled readers.
- Nintendo, Mattel, or Mojang assets beyond what PokéAPI returns at runtime.
- Homophones and anagrams.
- A fail state, a visible timer he can lose to, or anything that makes stopping feel bad.

## Original books — table of contents

s,a,t,p,m,i · f,n,o,d,c,h · g,u,b,l,k,e · r,w,j,v,y,z,qu,x · ll,ss,ff,zz ·
sh,ch,th,wh,ph · nk,nd,lt,lf · magic-e · ow,ie,y,ue,ui,oo · bossy r · spl,str,squ ·
trigraphs · inflectional suffixes.
