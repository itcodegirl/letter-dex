# Pilot correction: voice, pace, and Totodile

The adult confirmed laptop game audio worked, then reported that the voice was
robotic, spoke too quickly, and mispronounced words. The specific example given
was Totodile. These are adult pilot observations, not a completed learning test.

## Correction

- Grown-up settings now offers the browser's available voices and four speaking
  paces, with an explicit Try voice button. Changing a choice does not interrupt
  the quest or award learning progress; it stops any ongoing speech.
- Default speech uses Gentle pace (0.7 instead of 0.8) and normal pitch (1 instead
  of 1.1). Existing slower word prompts retain their relative speed difference.
- Voice and pace persist in the existing settings/backup object. Import refreshes
  the controls. A missing saved voice falls back to the browser default and is
  identified in settings; delayed voice availability refreshes the choices.
- Totodile has a speech-only spelling hint, `Toe toe dial`, targeting the
  `TOE-toe-dyle` pronunciation listed in the
  [Serebii pronunciation guide](https://www.serebii.net/pokemon/pronunciation/gen2pokemon.shtml).
  Displayed names, PokéAPI slugs, sound anchors, and curriculum data are unchanged.
  The spelling hint's actual sound still needs adult audition on each device.

This is a narrow correction to existing speech. It does not add recorded audio,
new learning content, or worlds. AR/PW and the broader expansion gate stay frozen.

## Verification

- All 27 tests pass, including delayed/unavailable voice fallback, voice and pace
  backup round-trip, cancellation before replacement speech, gentle defaults,
  segmented-word order, and the Totodile speech substitution.
- Separate browser origin: selected Microsoft Zira and Slower, refreshed, and
  confirmed both selections persisted. The browser exposed David, Mark, and Zira.
- Inspected actual laptop UI and keyboard focus. Voice and pace selects plus the
  sample button meet the 64px minimum height. Evidence: `pilot-voice-settings.png`.
- Browser error log was empty. No programmatic claim is made about naturalness
  or pronunciation from these checks.

Adult retest requested: refresh, choose Zira with Gentle or Slower, press Try
voice, and report clarity, comfort, and Totodile pronunciation. Result pending.
The adult subsequently reported "The voice keep say 'MMM' for M." Clarification
is pending: a continuous /m/ is intended in Sound adventure, while repeated
letter names would be a synthesis defect. Do not replace a sound clue with the
letter name or alter the authoritative roster without resolving the observation.
Physical Android audition and child comprehension remain pending. The laptop
pilot remains open; successful unit tests do not close those checks.
