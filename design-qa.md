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
- Full suite: 24 tests passed.

## Follow-up tablet and navigation pass

- P2 resolved: at 600 × 960, the companion covered the journal's name and Hear name
  control. Portrait journal layouts now place the companion in a horizontal row above
  the book. The companion ends at y279 and the book starts at y301 on the compact
  tablet; at 834 × 1194 the book starts at y311. Neither overlaps.
- P2 resolved: 960 × 600 landscape required scrolling to reach the continuation
  controls. Compact landscape spacing and a 400px book now keep document height at
  600px. Hear name remains 127 × 64px. The portrait document remains 960px high.
- P2 resolved: returning from a loading Pokédex could later pause the active trail.
  Scene activation now occurs when navigation begins, and obsolete collection loads
  cannot overwrite a newer view. Regression tests cover deferred and active loads.
- Browser check: held seven Pokémon requests, switched from Pokédex to Math,
  restored networking, and completed an addition answer. Math advanced to 1 of 8.
- Browser check: unanswered sound round has empty reveal text, hidden answer artwork,
  and a companion line containing no answer letter.
- Evidence: `docs/qa/discovery-compact-tablet.png`,
  `docs/qa/discovery-compact-landscape.png`, and refreshed `discovery-journal.png`.
  The refreshed reference/game comparison was inspected after the layout fixes.
- Temporary viewport and request interception overrides were removed; browser error
  log was empty at the end of this pass.

## Remaining checks

### Compact tablet math playthrough

The next playtest covered the actual learning rounds at 600 × 960 and 960 × 600,
in addition to the discovery screens. P2 resolved: the 88px berries stacked into tall
addition groups at 600px width, producing 1033px document height. Compact portrait
trays now use 70px targets and two-column groups where needed; document height is 960px.
P2 resolved: landscape math produced 693px document height at 600px viewport height.
Listen now sits beside the trays in compact landscape, with 64px berry targets and
tighter vertical spacing; document height is 600px. The 1 + 4 group fits on one row.

Played the remaining Bridge Builders questions, its footprints/greeting/journal,
all eight Beacon Rescue questions, and its discovery through Explore again. The game
returned to Berry Crossing at 0 of 8. Also exercised an incorrect addition answer and
count-along help on an empty space. No forced stop or lost progress occurred. Counting,
addition, and missing-amount layouts were inspected; browser error log was empty.

Evidence: `docs/qa/math-compact-counting.png`, `math-compact-addition.png`,
`math-compact-beacon.png`, and `math-compact-landscape.png`. These are responsive
adaptations of the selected Math Adventure designs; larger tablet/laptop layouts
are preserved by the scoped breakpoints. Temporary viewport overrides were removed.

Physical Android speech quality, touch comfort, and performance remain unmeasured.
The celebration uses illustrated scenery and 2D API artwork; the journey retains its
existing 3D renderer. Phone-sized layouts are outside the tested scope.
Previous Math Adventure QA is retained at `docs/qa/math-design-qa.md`.

## Concealed discovery follow-up

P2 resolved: the encounter was fully visible before the first footprint under the
heading “Who is hiding here?” The footprint view now contains no encounter image or
name in its visible or accessible UI. Artwork is preloaded off-screen; the third
footprint opens the existing greeting view. Companion copy changes as each step is
completed. No new visual assets or curriculum changes were needed.

Compared the audit's `outputs/product-design/adventure-audit/03-footprints.png`
outside the repository with `docs/qa/discovery-concealed.png`. Both are 834 × 1194
captures before the first footprint. The full-view comparison at
`outputs/product-design/discovery-surprise-comparison.png` also includes
`docs/qa/discovery-final-reveal.png` after footprint three. Images were scaled
proportionally and inspected together. The pre-fix and isolated test sessions have
different encountered species; this is a layout/state comparison, not a species diff.
Typography, background crop, gold/green controls, and footprint placement are retained.

Browser checks in an isolated origin: completed a counting quest; verified zero
encounter images before the final tap; completed footprint one, returned to camp,
reloaded and resumed at footprint two; completed footprint two without revealing the
encounter; verified the creature image and name after footprint three; greeted and
opened the journal. Browser error log was empty. The main game's quest progress was
not used for this playtest. Full suite: 24 tests passed.

## Camp choice follow-up

P2 resolved: camp duplicated the adventure decision in top tabs and large buttons.
Camp now uses its three large buttons as the only mode chooser. Existing Material
Symbols (ear and book) and the original berry asset provide visual cues. Hear the
mission explains those cues. A My Pokémon button preserves direct collection access;
the mode bar and Camp button return during play, collection, and discovery as appropriate.

Before/after evidence: `docs/qa/camp-before-choices.png` and `camp-clear-choices.png`,
both 834 × 1194 captures at the corresponding CSS viewport. They were inspected
together in the local `outputs/product-design/camp-choices-comparison.png` outside
this repository, proportionally resized without stretching. The before view has no
focus outline; the after view shows keyboard focus on Sound adventure. The scenery,
Nunito typography, rounded buttons, and green/gold palette are retained. Changes are
limited to choice hierarchy, visual cues, and responsive spacing.

Compact tablet checks: 600 × 960 document height is 960px; adventure buttons measure
143px tall. An initial 960 × 600 landscape view overflowed to 697px; tighter spacing,
a single-line heading, and three columns now fit within 600px. Evidence is in
`docs/qa/camp-compact-choices.png` and `camp-landscape-choices.png`.

Browser verification: entered sounds with Enter; opened words and math from camp;
verified the in-game mode bar; opened My Pokémon, the journal, and grown-up settings;
returned to camp from each. Math remained at Bridge Builders, 0 of 8. Mission replay
was activated; physical-device speech quality and comprehension were not measured.
Browser error log was empty. The full 24-test suite passes. Viewport override reset.

final result: passed
