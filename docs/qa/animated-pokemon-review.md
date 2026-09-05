# Animated Pokémon review — 5 Sep 2026

Jenna requested Pokémon animation in the existing game. This presentation slice
adds runtime animated sprites to the trail companion, math crew, earned letter
and word encounters, discovery/journal, and visible collection cards. Tapping a
math partner triggers a short listening reaction; existing success and greeting
reactions remain. Curriculum, attempt classification, and saved progress are unchanged.

## Sources and behavior

The existing cached Pokémon resource now retains both still artwork and the
returned Showdown animated sprite, with the generation-V animated field as
fallback. Runtime responses were checked for pikachu, bulbasaur, chikorita,
eevee, piplup, totodile, and mudkip. No Pokémon assets are bundled.
See [PokéAPI's Pokémon resource](https://pokeapi.co/docs/v2#pokemon).

These are animated pixel sprites, displayed crisply within the existing portrait
bounds. They are not new rigged 3D models. Reduced motion, inactive mystery
portraits, offscreen surfaces, and background pages use still artwork. A failed
animated image falls back to still artwork; a failed still preserves each view's
existing missing-picture behavior. Listeners and image requests are disposed on
round changes/navigation, with a fresh view on back/forward-cache restoration.

## Verification

- 57 tests pass for this runtime branch; 63 pass with the challenge data from PR #16.
- New automated checks cover sprite selection/cache, initial and changed reduced
  motion, background/foreground, offscreen activation, unrevealed clues, missing
  animation, animation failure, terminal still failure, stale callbacks, cleanup,
  and rebinding the persistent companion.
- Browser checks used a separate local origin, without importing or resetting
  Brody's saved game. Pikachu and Bulbasaur animated in Berry Delivery; Totodile
  animated in Bridge Crew. A 1 + 3 answer completed correctly and advanced one
  step. The collection displayed animated caught Pokémon. Eevee animated during
  greeting and the journal opened with the earned checkpoint intact.
- Reduced-motion emulation changed the math sprites to official still artwork;
  normal animation returned when the emulation was cleared. An unanswered letter
  encounter remained hidden, with generic alt text and still artwork.
- Visual fit checked at 834×1194 and 650×775; the compact page had no horizontal
  overflow. Consecutive captures showed different sprite poses within unchanged
  portrait bounds. Normal browser console returned no errors.
- Temporary motion and viewport overrides were cleared after checks.

Physical Android performance and Brody's response to the animation remain to be
checked. No claim about learning gains or challenge fit follows from these tests.
This change depends on the mission runtime in PR #18; additional sets remain
separate in PR #16. Merges remain Jenna's.
