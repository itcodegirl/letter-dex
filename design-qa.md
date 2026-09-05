# Destination celebration design QA

Scope: the three selected designs combined sequentially in the existing game:
footprints, Pokémon greeting, then adventure journal. This adapts Living Trail with
runtime API artwork and an illustrated overlay over the paused 3D trail. Concept
characters and scenery are not reproduced pixel for pixel.

## Visual evidence

Selected source images under `C:/Users/itcod/.codex/generated_images/01a06f76-cae2-7081-8a37-ffed7417a000/`:

- Footprints: `exec-a7ae984e-b1de-4632-ab75-f25d446f5e7a.png`
- Greeting: `exec-85b43dec-991b-4825-aba6-51a4ad057861.png`
- Journal: `exec-508d45c6-7f4f-4221-8679-6d6e8a765595.png`

Implementation captures: `docs/qa/discovery-footprints.png`,
`docs/qa/discovery-meet.png`, `docs/qa/discovery-journal.png`, and
`docs/qa/discovery-laptop.png`.

Sources are 1048 × 1501; tablet captures are 834 × 1194 at the same CSS size.
The local comparison artifact `outputs/product-design/discovery-comparison.png`
outside this repository places each selected design beside its matching game state,
scaled proportionally without stretching. It was opened and inspected alongside
full-size captures. Focused inspection covered footprint labels, greeting controls,
book page content, and the next-route action. Species and new/known status depend on
the saved encounter. The greeting screenshot shows the known-friend heading. The
footprints and greeting captures were taken after the offline test; the final journal
capture verifies companion recovery.

## Findings and fixes

- P2 resolved: the initial journal overflowed a 1366 × 768 laptop viewport.
  A smaller landscape book and tighter spacing now give document height 768px.
- P2 resolved: failed requests stayed cached and prevented retry. Failed requests
  now clear their cache entry; successful requests remain cached.
- P2 resolved: the companion remained absent after the offline test. Entering a
  discovery now retries its image request. The final tablet capture confirms it loaded.
- P2 resolved: selecting an unfinished discovery from history could bypass the
  footprints and greeting. History now resumes its saved step; finished entries replay.

## Fidelity and accessibility

- Typography: existing Nunito, rounded heavy headings, comfortable line height,
  legible button labels, no clipped text. API names retain their returned spelling.
- Layout: large numbered footprint stones; prominent encounter with greeting below;
  live journal content aligned inside two cream pages, with next destination below.
  Rounded green secondary controls and elevated gold primary controls remain consistent.
- Color: forest green, cream, and gold carry across all three screens. Text labels use
  dark backing over scenery; completion adds a check icon, not just color.
- Assets: original clearing and transparent book share a warm forest palette. Their
  proportions are preserved. The runtime API creature art intentionally differs from
  the rendered concept characters. Material Symbols provide standard footprint/check
  icons. Book overlays remain within the blank page regions.
- Copy: footprints, Say hello, saved memory, and next destination follow the selected
  sequence. Known species get an honest returning-friend heading.

Controls are real buttons with focus styling and minimum 64px height. Journal Hear
name measured 127 × 64px on laptop. Tablet document height equals its 1194px viewport.
Reduced motion makes the greeting animation effectively static.

## Behavior verified

- Completed Beacon Rescue and Berry Crossing into their discoveries.
- Followed footprints sequentially; returned to camp, refreshed, and resumed at step 2.
- Greeted repeatedly, opened the journal, heard the name, and continued to a new quest.
- Reopened earlier memories through the camp journal.
- Blocked Pokémon requests: saved encounter, retry, camp, and continuation stayed usable.
  Restored the connection and retried successfully; removed network emulation afterward.
- Normal browser logs were free of errors before the intentional network failure.
- Unit tests cover encounter uniqueness, step ordering, export/import resume, greeting
  gating, unchanged collection rewards, old saves, repeated species, and request retry.
- Full suite: 22 tests passed.

## Remaining checks

Physical Android speech quality, touch comfort, and performance remain unmeasured.
The celebration uses illustrated scenery and 2D API artwork; the journey retains its
existing 3D renderer. Phone-sized layouts are outside the tested scope.
Previous Math Adventure QA is retained at `docs/qa/math-design-qa.md`.

final result: passed
