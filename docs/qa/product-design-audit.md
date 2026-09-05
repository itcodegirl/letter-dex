# Living Trail product design audit

## Goal

Make the learning loop feel like an adventure for a five-year-old: hear a clue, choose a letter or word, move toward a visible destination, recover from mistakes, and decide where to go after the eighth success.

## Result

The implemented journey is ready for review on a laptop or Android tablet browser.

- **Camp:** opens with a mystery, a visible destination, and two large adventure choices. Grown-up controls stay collapsed and outside active play.
- **Active trail:** keeps the destination in view, gives the Listen control the strongest emphasis, uses three large stone choices, and moves the camera forward as stones are earned.
- **Retry:** identifies the selected sound through audio, keeps the answer hidden, and invites another choice without ending the round.
- **Completion:** replaces the old stopping message with a destination reveal and three useful choices: Next adventure, My Pokémon, and Back to camp.
- **Companion:** Pikachu artwork is requested from PokéAPI at runtime. The learning round remains usable when the API or image request is unavailable.

## Visual hierarchy and interaction

The child-facing hierarchy is consistent across the flow: mission or prompt, primary interaction, large choices, then progress. The 3D scenery stays behind the controls, and answer text uses high contrast against a warm stone surface. Progress is visible as both raised stones in the world and eight markers in the HUD.

The interface uses large touch targets, keyboard-focusable controls, spoken prompts, reduced-motion support, and a WebGL fallback. The prompt never displays the unanswered letter, and the companion's dialogue does not reveal it.

## Captures

- `camp.png` — adventure selection
- `after.png` — unanswered sound round
- `retry.png` — recoverable wrong answer
- `complete.png` — destination reached and next choices

## Verification

- Completed all eight sound rounds in the running browser.
- Confirmed one completion state and a continuing Next adventure path in browser playtesting.
- Confirmed retry messaging leaves all choices available.
- Confirmed 15 automated tests pass, including duplicate-award and stale-transition protection.
- Confirmed JavaScript syntax checks pass for the app, both learning modes, lifecycle, and Three.js trail.

## Remaining device check

The responsive layout has been checked at an Android-tablet-sized portrait viewport in browser emulation. Final audio volume, touch comfort, and rendering smoothness should be checked once on the intended physical tablet.
