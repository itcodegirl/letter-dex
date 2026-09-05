# Counting pilot and combined integration checks — 5 September 2026

## Status

Contract v1 is authorized for the narrow pilot by the current implementation
request. The laptop pilot found an engagement mismatch and speech defects;
round-by-round learning observations remain incomplete. Jenna clarified that the
available device is a **laptop**, so this session cannot validate physical Android
behavior. AR/PW, new curriculum, and world expansion remain frozen.

Build: merged main `552ff60`. Pilot branch: `docs/counting-evidence-pilot`.
User session: `http://127.0.0.1:4190/`; standard local static server, HTTP 200
verified. Software browser checks use a separate `localhost` origin so their
generated progress does not mix with the user's pilot save.

## Adult-led observations

| Check | Evidence / status |
| --- | --- |
| Device and browser | Laptop confirmed; browser/input details pending |
| Game opens; Listen is audible | Adult confirmed: "yes i can hear it. we need to change the voice" |
| Quantities, first choices, support and retries | No observations received yet |
| Counting strategy and prompt comprehension | Not established |
| Interest, continuation, stopping | Adult reported boredom, immediate answers, easy repetition, and insufficient Pokémon involvement; current challenge/engagement fit is not accepted |
| Camp, refresh, re-entry | Awaiting adult observation |
| Physical Android touch/audio/layout/performance | Not run |

Do not convert missing observations into passes or numerical learning results.
Use the [guide](counting-pilot-guide.md) to add actual round observations here.

## Corrections and limitations

| ID | Observed issue | Classification / next action | Retest |
| --- | --- | --- | --- |
| P-01 | User reported the game was not running and then clarified laptop use. Earlier tablet guidance was not applicable. | Setup correction: started current merged game locally and supplied its exact link. Keep localhost guidance explicitly laptop-only. | HTTP 200 verified; adult confirmed game audio works |
| P-02 | Adult requested a different voice after hearing Listen. | Audio preference correction requested; exact preference and replacement voice audition pending. Speech currently uses the browser default. | Open; require adult listening check after a separate voice correction |
| E-01 | Saved progress does not distinguish every retry or adult-assisted success from independent first responses. | Evidence limitation: use adult round notes under contract v1; do not infer independent mastery from aggregate saves. Any runtime correction is a separate scoped decision. | Source inspection; observational workaround ready |
| P-03 | Adult confirmed M/S were spelled as repeated letter names. | Corrected with local phoneme clips in [draft PR #15](https://github.com/itcodegirl/letter-brody/pull/15). | Adult confirmed the isolated M and S previews produce the intended hum/hiss; full in-quest and Android retests pending |
| P-04 | "He spotted them right away, the repetition was easy. There is not enough challenge and not enough Pokemon included" | Engagement/challenge mismatch. Compare a short sample of the existing addition/missing-amount activities, then scope a correction to the current slice. More repeated counting is not the default response. | Open; do not close the engagement gate |

The adult named Totodile as a pronunciation problem. PR #15 adds voice/pace
choices and a speech-only pronunciation hint; adult confirmation of the final
narration/Totodile quality is still pending. The isolated M/S check is the only
audio-quality correction explicitly accepted during this pilot.

On request, the game was opened at Berry Crossing with 4 of 8 saved progress.
Later navigation opened Bridge Builders at 0 of 8. These UI states are not a
record of independent learning performance. No individual answer sequence,
support denominator, or mastery conclusion is reconstructed from them.

A [bounded engagement review](pilot-engagement-review.md) captures camp and the
next math screen. It records proposed corrections without lifting the freeze.

## PRs #12 and #13

Both PRs were already merged when checked. Main includes PR #12 (next-adventure
journal previews, merge `6d38db0`) and PR #13 (earned Beacon Rescue light, merge
`552ff60`). GitHub returned no submitted reviews or review threads for either
PR. No review is attributed to Jenna beyond the recorded merge state, and no
additional merge or review was submitted on her behalf.

- [PR #12](https://github.com/itcodegirl/letter-brody/pull/12)
- [PR #13](https://github.com/itcodegirl/letter-brody/pull/13)
- `npm test`: all 24 tests passed on the combined merged build.
- Combined browser visual checks: pending; existing separate-PR screenshots
  are historical evidence, not a new combined verification.

## Release decision

Correct and repeat targeted checks. The adult-reported challenge and engagement
mismatch keeps the current slice from passing this pilot. Detailed learning
evidence and physical Android observations are also incomplete. Recheck the
audio corrections, compare challenge in the existing math stages, scope the
engagement correction, and record Jenna's decision before reopening expansion.
