# Letter Dex decision log

Durable product, learning, and architecture decisions for this repository, in the
`LD-NNN` form suggested by ADR-001. `CLAUDE.md` remains the tiebreaker; a decision
here that conflicts with it is a request to change `CLAUDE.md`, not an override.
Routine task notes do not belong here. Earlier decisions were recorded as dated lines
in `PLAN.md` and stay there.

---

## LD-001 — Per-round evidence records beside the scheduling flag

**Status:** Proposed (accepted when this pull request merges)

**Decision:**

Letter Dex adds an append-only `evidence[]` array to its schema v1 save, one record
per round, as specified in [`docs/learning/evidence-record-v1.md`](learning/evidence-record-v1.md).
Records carry the first response, its result, the prompt level (independent,
count-along, model), whether the clue was heard, replays, retries, and an eligibility
flag. The adaptive selector, the two-correct `mastered` flag, quests, rewards,
discoveries, and the math journey are unchanged.

The parent view derives per-item states from eligible records using the five state
names and v1 sufficiency defaults of the foundational-literacy curriculum's
developmental progression (Not observed, Emerging, Developing, Consolidating,
Generalized). The `mastered` flag is shown as "scheduled as known" and is never
labelled mastery.

**Reason:**

The counting contract's limitation E-01 and the 5 September audit both show that
aggregate item counts cannot separate an independent first response from a retry,
a count-along success, or an unheard tap, and that the sticky `mastered` flag is
reachable by elimination. The sibling curriculum project already defines an evidence
record and state vocabulary, and its reference game already implements the
supported-versus-independent split. Borrowing the shape and the words is cheaper and
clearer than inventing a second vocabulary.

**Boundaries:**

1. No record is shared with `foundational-literacy-curriculum` or
   `foundational-literacy-game`, and neither repository governs this one (their D-008).
2. Competency identifiers used here (`LS-001`, `WR-001`, `MA-001` to `MA-003`) are
   local to Letter Dex and do not claim curriculum status.
3. The evidence record does not change the intellectual-property posture; Letter Dex
   remains a private prototype.
4. Sufficiency counts (one, two, three across two sessions) and the 5,000-record cap
   are piloting defaults. Changing them is a new decision here, not a code edit.

**Consequences:**

- Core: `progress.js` gains an evidence writer and a state calculator, with tests
  listed in the record specification. `normalizeProgress` must accept saves without
  `evidence`.
- Modes: Sounds gates its keys behind Listen so that a first tap is always heard
  (audit R2). Words already does. Math reports count-along and retry through the
  record instead of only through the `math-help` aggregate.
- Parent view: adds state, eligible counts, practice counts, and the review flag;
  relabels the flag.
- Pull requests: the record and calculator (core), the Sounds gate (mode), and the
  parent view (ui) ship separately, per the working agreement.

**Revisit when:** the adult-led pilots show the defaults misclassify his responses;
a meet round or a Build-engine decoding mode changes what a round is; or the
curriculum project revises its state names.

---

## LD-002 — Static server delivery; `file://` unsupported

**Status:** Accepted 5 September 2026 (recorded retroactively)

**Decision:** Option A of [ADR-001](state/2026-09-05-adr-001-app-delivery-and-file-protocol.md).
`CLAUDE.md` §Tech constraints now reads that the app runs from any static server,
that ES modules require a server, and that `file://` is unsupported. This keeps ES
modules, `node:test` without tooling, and the Phase 0 port, and it unblocks a service
worker later.

**Open items from ADR-001:** a delivery smoke test that loads the app over HTTP and
asserts the option buttons render (its action item 6), and a reachable host for the
tablet.
