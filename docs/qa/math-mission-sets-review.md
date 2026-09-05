# Longer math missions — 5 September 2026

## Scope and decision

Jenna selected all three mission designs for different parts of the challenges
and requested longer challenges and more sets after reporting that Brody found
the answers immediately and repetition too easy. This reopens the existing math
operations within 10 only. AR/PW, new worlds, new engines, later grades, and the
physical Android validation requirement remain unchanged.

The runtime links three eight-success missions into each 24-step adventure.
Eight still completes a saved quest and offers the existing footprints, greeting,
journal, and optional continuation. Set bookmarks preserve unfinished work;
reading progress and canonical fact history are separate. Pokémon participate
throughout the questions and the onscreen friend is added to the collection.

The new catalogue is reviewed separately in [PR #16](https://github.com/itcodegirl/letter-brody/pull/16).
It supplies Trail Team, River Rescue, and Beacon Champions, making nine missions
across three 24-step adventures. A set is an adaptive sample, not a promise to
show every fact or evidence of mastery.

## Corrections checked

| Finding | Correction | Evidence |
| --- | --- | --- |
| Little Pokémon involvement during questions | Large guide and recipient, tap-to-hear clues, success reactions, changing friends | Runtime PokéAPI portraits loaded in counting, bridge, and beacon views |
| Missing amounts exposed as immediately countable empty spaces | Present berries and target first; Count with me reveals spaces | Make-10 task with 3 berries had zero empty slots before help, seven after help |
| Retry success could count as an ordinary correct response | Future supported/retry successes use math-help records | Unit tests and a visible counting retry/help/correct sequence; parent view showed separate practice |
| Bridge repairs were underneath the answer controls | Size the math scene to the mission region | Revised tablet capture shows the repaired bridge between companions |
| Large berry groups touched the tray edge | Quantity-weighted tray widths and larger inner padding | 9+1 checked at 650×775, including all answer/help/navigation controls |
| Reopened checkpoints could show the next set's progress | Persist the completed set/stage on the discovery | Final beacon, journal, refresh, resume retained River Rescue 24 of 24 |

## Software validation

- Runtime with original catalogue: `npm test`, **47 passed**.
- Runtime with PR #16's catalogue: `npm test`, **53 passed**.
- Data-only PR: `npm test`, **40 passed**.
- Browser layouts: **834×1194**, **650×775**, and **1194×834**.
  Measured compact and landscape pages had no overflow. Compact berry targets
  were 64×64; answer buttons were 115×86; Listen/help/navigation were at least
  64 pixels high. Tablet and landscape controls remained visible.
- Exercised set selection, saved places, Listen, a wrong answer followed by
  count-along and correction, ordinary success, changing companions, beacon help,
  earned eighth-answer light, all three footprints, greeting, journal, refresh,
  checkpoint resume, next-set continuation, and navigation back to letters/camp.
- Reading's saved three steps remained three. Returning to letters removed the
  math viewport and controls. Returning to camp during feedback cancelled the
  pending transition.
- Reduced-motion emulation: a correct answer still advanced progress and the
  companion's celebration animation was `none`. Emulation was reset afterward.
- Normal browser console check returned no errors.

The browser checks used a separate local origin. Bridge and final-beacon states
were loaded through the real import control using synthetic QA fixtures; they
are not Brody's responses. Unit tests cover full 8/16/24/set-wrap progression;
the browser pass sampled those flows and did not play all 72 answers.

## Remaining pilot work

The software and responsive checks pass. Brody has not yet tested these new
sets; do not claim that the engagement mismatch is resolved or that longer play
improves learning. Repeat a short adult-led sample, recording first choices,
support, retries, interest, and requests to continue/stop. Physical Android
touch, speech, and performance remain untested. Adult answer cues remain
unobservable to the app, and older aggregate records are unchanged.

The original counting pilot remains incomplete. These changes preserve its
evidence limits rather than closing the broader release gate.
