# Counting learning and evidence contract v1

Status: approved for the narrow pilot under Jenna's 5 September 2026 instruction
to implement the next three actions. Learning validation remains pending.
This is an observation contract for the selected Math Adventure slice, not a
change to the learning rules in `CLAUDE.md` or approval of later phases.

## Scope and claim

Use Berry Crossing to observe whether the player can determine the number of
objects and choose its numeral. Record quantities 1–5 as the primary observation
range; label 6–10 separately. The existing game still presents 1–10 adaptively.
Do not change its range or prolong play to force coverage. Report the quantities
actually encountered and leave unobserved quantities unknown.

A correct choice is evidence of a response to that displayed task. If the adult
sees one-to-one counting or hears a final total, record that separately. A choice
alone cannot establish the counting strategy, generalization, retention, or a
learning gain. Earlier learner baseline percentages are historical context,
not results from this pilot.

## Evidence per round

| Field | Record |
| --- | --- |
| Task | Stage, visible quantity or equation, number choices |
| First response | Selected number and correct/incorrect; none if no response |
| Support before first response | None; prompt replay; app count-along; adult explanation/model/answer cue; combinations |
| Retry | Subsequent choices and any support, kept separate from the first response |
| Strategy | Observable counting/pointing/final total, or unknown; no inferred strategy from success alone |
| Access | Audio, control, visual, or loading problem; accidental tap if observed |
| Experience | Short exact words or observable action, including requests to stop/continue |

An independent first response has no earlier answer attempt, app count-along,
adult answer cue, or model for that round. Replaying the same unanswered prompt
is allowed but must be recorded. If access prevents understanding or a reliable
selection, mark the round access-affected rather than treating it as a clean
learning error. Ambiguous observations stay unknown.

Supported successes and successes after retry are useful practice. They are
never reclassified as independent first-response evidence. Show counts with
their denominators and quantities; this small, adaptive sample has no pilot
mastery percentage or pass threshold for the child.

## Game rewards and stored progress

Eight correct answers complete a quest; count-along practice can earn route
progress and Pokémon discoveries. Rewards are encouragement, not an assessment.
Continue, return to camp, and stop remain valid choices without penalty.

Preserve the approved runtime rule: two consecutive recorded correct responses
mark an item `mastered` for adaptive selection. This is the app's existing
scheduling flag, not a validated statement of durable learning. Do not change
its threshold, unlock policy, or save schema in this documentation slice.

Current limitations, inspected at main `552ff60`:

- App count-along successes use separate `math-help` records that do not earn
  mastery. Other successes use the ordinary item record.
- The save contains aggregate attempts, not a round-by-round evidence log.
- A success after a wrong choice can still use the ordinary record if no berry
  help was tapped. The app also cannot detect an adult's answer cue.
- Therefore an exported save cannot reconstruct independent first responses.
  The adult observation sheet is the evidence source for this pilot.

Any later runtime change to support classification or progress reporting needs
a separately scoped decision and PR. Do not silently redefine existing saves.

## Validation and change gate

Use the [pilot guide](../qa/counting-pilot-guide.md) and dated results record.
Validate prompt comprehension, help and retry behavior, optional continuation,
and save/re-entry. Physical Android audio, touch, layout, and performance need
an actual Android session; laptop observations cannot close that requirement.

Log each correction with observed behavior, expected behavior, severity,
reproduction, owner/next action, and retest evidence. Distinguish product defects
from access/setup problems and learner observations. A short pilot can identify
usability problems; it cannot validate a whole curriculum or learning efficacy.

New curriculum, new worlds, and later engines remain deferred until the contract
and adult-led Android pilot have been reviewed, blocking corrections retested,
and Jenna records the decision to reopen expansion. AR/PW stays frozen under
D-008 unless a concrete blocking dependency is identified and explicitly scoped.
The selected Living Trail, three math stages, combined discovery, PokéAPI use,
and all approved `CLAUDE.md` rules remain in force. Merges remain Jenna's.
