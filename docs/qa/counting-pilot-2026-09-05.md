# Counting pilot and combined integration checks — 5 September 2026

## Status

Contract v1 is authorized for the narrow pilot by the current implementation
request. Adult-led learning observations are pending. Jenna clarified that the
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
| Interest, continuation, stopping | Not established |
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

Insufficient adult/device evidence to close the pilot. Complete the laptop
observations, then the physical Android checks, document any corrections and
retests, and record Jenna's decision before reopening expansion.
