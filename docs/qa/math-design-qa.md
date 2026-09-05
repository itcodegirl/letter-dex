# Math Adventure design QA

Scope: all three selected math interactions adapted into the existing Living Trail game, with its persistent mode navigation, runtime Pokémon companion, and moving 3D world. This is not a pixel-identical recreation of the concept scenery.

## Visual evidence

Source visual truth: the three selected images in `C:/Users/itcod/.codex/generated_images/01a06f76-cae2-7081-8a37-ffed7417a000/`:

- `exec-5ae46c69-3116-4411-86b2-a6bdf1ef9a20.png` — Berry Crossing
- `exec-f03283e2-ace2-4c05-8c98-883dc01c39cc.png` — Bridge Builders
- `exec-ab4586ab-2494-4649-b28e-7262020be431.png` — Beacon Rescue

Implementation: `docs/qa/math-counting.png`, `math-addition.png`, and `math-missing.png`.
Full-view side-by-side comparison: `docs/qa/math-comparison.png`.
Source rasters are 1048 × 1501; implementation screenshots are 834 × 1194 at the 834 × 1194 CSS tablet viewport. Comparison panels preserve aspect ratios at equal widths; no stretching. All comparisons show unanswered rounds. Quantities vary because the game selects practice items adaptively; progression and hover position also differ. This is an interaction/layout comparison, not a same-question pixel diff.

Focused regions were inspected in the full-size game captures: prompt, berry tray, five empty/occupied spaces, Listen, answer choices, and footer. The smaller combined sheet shows overall hierarchy.

## Findings and fixes

- P2 resolved: controls extended below a 944px-high window. Replaced fixed top padding with height-sensitive spacing. Tablet now measures 1194px document height at 1194px viewport height; the revised 1366 × 768 laptop view measures 768px document height.
- P2 resolved: math objects and prompts were too small relative to the selected designs. Increased tablet berries to 88px, widened counting and five-space trays, enlarged the prompt and Listen control, and used orderly rows for counting.
- P2 resolved: identical destinations weakened the three-stage distinction. Bridge Builders now constructs visible wooden sections; Beacon Rescue dims the scene and adds a destination beam with increasing light.

## Fidelity surfaces

- Typography: existing Nunito, rounded heavy prompt/answer text, readable chapter labels, no clipped mission text.
- Layout: world above and behind the prompt; interactive objects grouped centrally; equation/help line, replay, three large choices and progress below. Existing mode navigation is intentionally retained.
- Colors: forest green, cream and warm gold continue the selected visual family. Beacon Rescue uses darker exposure. Hover and focus have visible contrasting treatment.
- Assets: original generated berry and wood tray images are used in the live controls. Existing stone texture remains on answers. The companion uses PokéAPI artwork at runtime. Existing geometric scenery remains simpler than the illustrated references; the moving game world is retained instead of embedding a screenshot. Empty spaces use a standard Material Symbols icon for a clear touch target.
- Copy: all three named chapters, counting/addition/missing-amount prompts, replay, retries, stage-specific completion actions, and optional camp return are implemented.

## Interaction checks

- Played all 24 questions through all three completions and Explore again.
- Repeated Listen, recovered from an incorrect answer, and verified tapping one berry twice counts it once.
- Verified a correct missing-amount response fills all five spaces.
- Reloaded during Beacon Rescue; stage and 1-of-8 progress returned.
- Math persistence tests cover all stages, existing reading progress, old backups, and supported practice without independent mastery.
- Laptop berry controls measure 70 × 70; answers 110 × 94; Listen at least 68 × 75. Tablet controls are larger.
- Browser error log returned no errors.

## Remaining checks

Physical Android speech quality, touch comfort, and rendering performance remain unmeasured. The current 3D environment is visually simpler than the concept art; further environmental art is a separate polish pass.

final result: passed
