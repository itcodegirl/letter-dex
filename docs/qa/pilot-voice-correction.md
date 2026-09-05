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

The adult subsequently confirmed that M and S were spoken as repeated letter
names ("em, em, em" and "s, s, s"). This is a confirmed sound-clue defect, not
a request to switch to letter-name instruction.

M and S now use locally bundled phoneme clips in Listen, feedback, and segmented
words. Clips and narration play in order, preserving sound before name. New
speech or navigation cancels both; late callbacks cannot resume an old clue.
A failed clip shows an audio access message rather than falling back to the
known incorrect repeated letters. Parent settings offers separate sound previews.
Sources, adaptations, and CC BY-SA 3.0 credits are in
`assets/audio/sounds/ATTRIBUTION.md`. The adult confirmed both isolated clips
produce the intended hum/hiss without repeated letter names: "yes i do".

Correct-answer transitions also wait for speech to finish after the existing
minimum reveal delay, with a 15-second fallback for missing audio-end events.
This prevents the slower pace from cutting off feedback; navigation still wins.

This is a narrow correction to reported speech defects. It does not add new
learning content or worlds, or approve the broader recorded-voice phase. AR/PW
and the expansion gate stay frozen. Other phonemes still rely on browser speech
and have not been validated by this correction.

## Verification

- All 33 tests pass, including delayed/unavailable voice fallback, voice and pace
  backup round-trip, cancellation before replacement speech, gentle defaults,
  segmented-word order, and the Totodile speech substitution. Phoneme tests cover
  clip-before-name sequencing, cancel/late-callback handling, failure without
  incorrect synthesized fallback, and mixed clip/speech word segments. Timing
  tests cover slow and quick speech, missing end events, and leaving the round.
- Separate browser origin: selected Microsoft Zira and Slower, refreshed, and
  confirmed both selections persisted. The browser exposed David, Mark, and Zira.
- Inspected actual laptop UI and keyboard focus. Voice and pace selects plus the
  sample button meet the 64px minimum height. Evidence: `pilot-voice-settings.png`.
- Browser error log was empty. No programmatic claim is made about naturalness
  or pronunciation from these checks.

Adult retest requested: refresh, choose Zira with Gentle or Slower, press Try
voice, and report clarity, comfort, and Totodile pronunciation. Result pending.
Adult retest of Try m sound and Try s sound: passed on the laptop. Full in-quest
sound feedback and other phonemes still need listening checks.
Physical Android audition and child comprehension remain pending. The laptop
pilot remains open; successful unit tests do not close those checks.
