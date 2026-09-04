# Letter Dex — CLAUDE.md

Learning game for Brody (5, kindergarten). Reading and math, PK through grade 5,
themed with Pokémon via PokéAPI. Built by Jenna (itcodegirl). This file is the
tiebreaker on any conflict. Read PLAN.md for scope and build order.

## Working agreement

- Plan mode first for any new engine or primitive. Data-only changes can go straight to a branch.
- One phase (or one sub-phase) per PR. Never change an engine and a data file in the same PR.
- Branch off main, commit, push, open PR — no confirmation needed. **Merge is Jenna's.**
- Commits authored as `itcodegirl <88835851+itcodegirl@users.noreply.github.com>`. No exceptions.
- No AI attribution anywhere GitHub-visible: no trailers, no tool names in commits, PR titles, or branches.
- Run `npm test` before every PR. A failing data test blocks the PR.

## Learning rules — do not "improve" these

1. **Anchors are chosen for sound, not fame.** The letter→Pokémon table in `data/roster.js` is
   authoritative. Charmander is not C (it's *ch*). Squirtle is not S (it's *squ*). Eevee is not E.
   The famous ones return as digraph and blend anchors later; don't move them earlier.
2. **A wrong answer is never punished.** No fail state, no score loss, no "wrong" sound, no
   streak reset shown to him. Shake, say what that one actually was, let him try again.
3. **Sound before name.** Letter-sound rounds speak `sound → Pokémon → "letter x"`, in that order.
   Leading with the name is what makes kids answer "pee" when asked for the sound.
4. **Lowercase is the default** for sounds and words. Uppercase is a mode, not the baseline.
5. **C and K never share a round** in sound mode — they make the same sound and one of them
   would be an unfair answer. **b/d and p/q never share a round** in name mode until the mirror-pair
   unlock is earned; after that they share rounds on purpose.
6. **X has no initial-sound round.** It gets an ending-sound round only (Onix, Vulpix, Snorlax).
   **Q is *qu*** — Quagsire gives the /kw/, which is what his curriculum teaches.
7. **Sight words are never segmented.** Reveal shows the whole word only. Distractors are other
   sight words, not phonetic near-misses.
8. **Decodable-word distractors are minimal pairs** — same length, most letters shared in
   position — so he has to decode, not guess by shape.
9. **Sessions end at 8 correct.** A badge, then done. Do not add "keep going," streak pressure,
   timers he can see, or anything that makes stopping feel like losing.
10. **Selection is adaptive.** Weighted toward low-streak items; two correct in a row marks an item
    mastered and drops its weight; ~20% of every session is mastered items for retention.
11. **The unit is the grapheme, not the letter.** Words are arrays of graphemes (`['sh','i','p']`),
    from phase 0. Blends, digraphs, vowel teams, magic-e, and second sounds are data, not rewrites.
12. **He picks the mode.** Mode switch is on the device face, kid-reachable, no parent gate.

## Content and IP

- Pokémon data and sprites come from PokéAPI only, at runtime, cached. No bundled Nintendo assets,
  no Pokémon art drawn by us, no logos. Names appear exactly as the API returns them.
- No Hot Wheels or Minecraft assets, names, or logos. Their *mechanics* are fair game
  (blocks on a grid, tracks, crafting) with original art.
- No song lyrics, no third-party book text, no leveled readers. Decodable books are original,
  written from the game's own word sets.
- Coins are original simplified drawings.

## Tech constraints

- Vanilla JS, ES modules, no framework, no bundler, no TypeScript. JSDoc types are welcome.
- Runtime dependencies: none. Dev dependencies: `node:test` only, unless a phase document adds one.
- Static site. Deploys as-is to Vercel. `index.html` at the root must work from `file://`.
- PokéAPI: one fetch per resource per session, cached in a `Map`; preload the next round's sprite.
  Sprite path is `sprites.other['official-artwork'].front_default`. PokéAPI asks for caching
  rather than enforcing a rate limit — behave as if the limit exists.
- Speech: `speechSynthesis` until recorded audio lands (phase 3). On iOS speech requires a prior
  user gesture — every round that speaks before he taps must open with a Listen button.
- Progress: `localStorage`, one key, versioned schema, JSON export/import in parent settings.
- Fonts: Nunito until the letterform question in PLAN.md is settled. If his tracing app uses a
  single-storey *a*, the font changes everywhere at once — never per-screen.

## Accessibility floor

- Touch targets ≥ 64px. Real `<button>` elements. `aria-live="polite"` on reveals.
- Visible `:focus-visible` on every interactive element. `prefers-reduced-motion` respected.
- No color-only meaning. Correct/incorrect is shape + sound + color.

## Structure

```text
index.html            device shell, mode switch, settings
src/
  engines/            choose.js  build.js  sort.js  trace.js  procedure.js
  primitives/         tenframe.js  numberline.js  basetens.js  clock.js  grid.js  ...
  core/               select.js (adaptive)  progress.js  speech.js  pokeapi.js
  modes/              one file per playable mode; wires an engine to a data set
data/
  roster.js           letter → Pokémon anchors (authoritative)
  graphemes.js        grapheme → sound, second sounds, anchor Pokémon
  reading/            letter sets, word sets, sight-word lists, by tier
  math/               number ranges, fact families, shapes, by tier
  books/              original decodable books
test/                 node:test — every data file has a test
docs/sources/         curriculum references and dated learner baselines (not loaded by the app)
```

## Tests that must exist and pass

- Every decodable word uses only graphemes unlocked at its tier (cumulative).
- No duplicate words within a tier; sight-word lists have no overlap with each other.
- Every roster slug resolves on PokéAPI (run manually, not in CI; cache the result in the repo).
- Every letter set that includes C also includes a rule keeping K out of its rounds, and vice versa.
- Adaptive selector never returns a mastered item more than 30% of the time, never 0%.
