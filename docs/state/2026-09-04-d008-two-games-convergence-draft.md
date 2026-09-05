# Draft decision — which game ships, and what the other one is for

Written as a draft for `docs/DECISIONS.md` in `foundational-literacy-curriculum`, in that file's existing format. Nothing has been committed. The analysis above the record is working material; the record itself is what you'd paste.

---

## The problem is smaller than it looks

Before choosing, one correction to how I framed this earlier. I said you have "two game implementations of overlapping skills." The overlap is narrower than that.

`README.md` of the curriculum repo, "Curriculum Boundaries":

> The two strands remain distinct from letter sounds and phonics, uppercase and lowercase letter tracing, sight words, word reading, spelling, and formal handwriting.

And the progression doc, Strand A rule 4: *"Letter sounds, phonics, rapid naming, letter writing, and formal handwriting are outside this strand."* The game-mapping contract even ships a `boundaries` field reading `does_not_measure_phonics`.

So:

- **`letter-dex` today teaches letter *sounds* and decodable-word reading.** Both are explicitly outside the curriculum's two strands. There is no conflict at all between what `letter-dex` currently ships and what the curriculum currently governs.
- **`foundational-literacy-game` teaches AR-001** — receptive letter identification, "select a named letter from an array." That is letter *names*, a different skill.

The genuine collisions are only these four:

| # | Collision | Where |
|---|---|---|
| 1 | **Letter names.** `PLAN.md` phase 1a ("PK sweep: letter names, uppercase and lowercase, case match") is AR-001 and AR-002, already built once in the Grove | `PLAN.md` phase 1a vs `src/core/content.ts` |
| 2 | **Tracing.** `PLAN.md` phase 5 authors 52 letter stroke sets on a canvas. The PW strand requires *physical-material evidence*: "A screen, mouse, trackpad, or touchscreen may provide practice data but cannot independently establish these competencies" | `PLAN.md` phase 5 vs progression doc, Strand B preamble |
| 3 | **IP.** "this specification does not authorize use of Pokémon names, characters, artwork, music, trade dress, or other protected assets" | game-mapping v1 §Intellectual-Property Boundary |
| 4 | **Progress model.** One flat `{seen, correct, streak, mastered}` record per item vs. evidence observations with provenance and no automatic mastery decision | `src/core/progress.js` vs `evidence.ts` + D-005/D-006/D-007 |

Collisions 1 and 2 are roadmap items you have not built yet. Collision 3 only bites if the curriculum contract is applied to `letter-dex`. Collision 4 only bites if one record has to serve both purposes.

---

## Options

### A. Scope split — each game owns different strands

`letter-dex` keeps phonics, decoding, and math, stays Pokémon-themed, stays private. `foundational-literacy-game` owns AR (letter names) and PW (pre-writing). `PLAN.md` drops phase 1a and phase 5, or hands them across.

- **Cost:** two stacks, two progress stores, two things Brody opens. Small code cost, ongoing attention cost.
- **Resolves:** 1, 2, 3, 4 — by never letting them meet.
- **Leaves open:** how you see both strands' progress in one place.

### B. Converge onto `foundational-literacy-game`

Port the Choose engine, adaptive selector, roster, and word sets into TypeScript; evidence observations become the single record; Pokémon becomes a theme layer.

- **Cost: large, and larger than it looks.** D-002 requires research → progression → architecture → assessment → lesson design *before* game mapping. Phonics has none of that yet. Shipping the phonics content you already have under the curriculum contract means running the research pipeline for a third strand first.
- **Also:** the IP boundary would then apply to content that currently depends on Pokémon anchors.
- **Resolves:** everything, eventually. **Blocks:** everything, meanwhile.

### C. Converge onto `letter-dex`

Keep vanilla JS. Add a second, separate record type — an append-only evidence log alongside the existing item records, which is what D-007 actually asks for. Build AR-001/002 as a `letter-name` mode. Archive the Grove.

- **Cost: medium.** Schema v2 plus a migration; a new mode; an evidence log the assessment spec can read.
- **Keeps:** every line of shipped content, the adaptive selector, persistence, export/import.
- **Leaves open:** IP (fine while private and non-commercial), and the PW strand, which `letter-dex` cannot satisfy at all because PW mastery requires physical work samples.

### D. Different purposes, no convergence

`letter-dex` is the app Brody uses: private, Pokémon, phonics and math, ships. `foundational-literacy-curriculum` + `foundational-literacy-game` are the rigorous, original-IP, publishable track — a reference implementation and a portfolio artifact, not a second app for Brody. The curriculum informs `letter-dex`'s sequencing as guidance, and formally governs only AR and PW, which `letter-dex` defers.

- **Cost: lowest.** One active codebase. The Grove is frozen where it is.
- **Resolves:** 3 and 4 by keeping the two governance regimes apart. Resolves 1 and 2 by deferral, not by building.
- **Honest about:** this is roughly the state you are already in.

---

## Recommendation

**Option D, with one addition from C: a written scope line in `PLAN.md`.**

Reasoning, in the order that decided it:

1. **Brody uses one app.** `letter-dex` has 25 letters, 89 words, adaptive selection, persistence, a Pokédex, and a parent view. The Grove has three letters and forgets everything on reload. Only one of these is a thing a five-year-old can use tomorrow.
2. **The cheapest resolution is the one that stops the collision from happening.** Three of the four conflicts are roadmap items, not current defects. Deferring phase 1a and phase 5 costs nothing today and removes the conflict entirely.
3. **The Grove is worth keeping — as a different kind of object.** It is the cleanest code you have: framework-free core, five passing tests, and a UI that genuinely refuses to claim mastery. It is a demonstrable, original-IP, curriculum-governed artifact. That is portfolio material in a way a private Pokémon prototype can never be.
4. **Convergence costs more than either project is currently worth.** Option B needs a research pipeline for phonics before a single existing word set could ship under the contract. Option C needs a schema migration for a rule (D-007) that no shipped feature currently violates.

**What this means concretely**

- `PLAN.md` phase 1a is deferred and marked as belonging to the AR strand.
- `PLAN.md` phase 5 (letter tracing) is deferred; if it is ever built in `letter-dex`, it is labelled practice and never records mastery.
- `foundational-literacy-game` is frozen at its current commit until AR or PW is actually being taught. No new features.
- `letter-dex` continues: merge Phase 0, fix the session restart, deploy privately.
- The IP boundary question stays parked, because it only matters if something goes public.

**What would change this recommendation:** if you decide the curriculum track is the product — something CodeHerWay-adjacent, or a portfolio centrepiece — then B becomes right and `letter-dex` becomes the prototype that proved the interaction. That is a business decision, not a technical one, and it is yours.

---

## Draft record for `docs/DECISIONS.md`

```markdown
## D-008 — Two Implementations, Two Purposes

**Status:** Proposed

**Decision:**

`letter-dex` is the learner-facing application. It covers letter sounds, decodable word
reading, and mathematics, and is governed by its own `CLAUDE.md` and `PLAN.md`. It is not
governed by this curriculum's evidence, assessment, or intellectual-property rules, and it
does not carry Alphabet Recognition or Pre-Writing competencies.

`foundational-literacy-game` is the reference implementation of this curriculum. It covers
the AR and PW strands, is governed by `design/game-mapping/foundational-literacy-game-mapping-v1.md`,
and uses original intellectual property only. It is frozen at its current state until AR or
PW instruction is actively required.

Neither repository merges into the other. No progress record is shared between them.

**Reason:**

The two strands defined here exclude letter sounds, phonics, word reading, tracing, and
handwriting. `letter-dex`'s current content therefore falls entirely outside this
curriculum's scope, and applying this curriculum's evidence and IP rules to it would
constrain content that those rules were never written to govern. Convergence would require
completing the research-to-mapping sequence for a phonics strand before existing content
could ship, which is not warranted by present need.

**Scope consequences:**

1. Letter names and case matching (AR-001, AR-002) belong to the AR strand and are removed
   from the `letter-dex` roadmap.
2. Letter tracing belongs to the PW strand. Any tracing built in `letter-dex` is practice
   only and records no mastery, consistent with D-006.
3. The intellectual-property boundary in the game-mapping specification applies to
   `foundational-literacy-game` and to any public release. It does not apply to the private,
   non-commercial `letter-dex` prototype.
4. This decision is revisited if either the AR or PW strand enters active instruction, or if
   the curriculum track becomes a published product.
```
