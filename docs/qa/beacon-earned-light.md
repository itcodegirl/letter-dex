# Beacon Rescue: earned light

Resolved: the rescue quest displayed its full sky beam at zero successes.
The destination now starts without emissive light, gains glow with each success,
and reveals the beam only at eight. Other chapters retain their existing lighting.
The renderer derives appearance from quest progress; it does not award or store
learning progress.

## Browser playtest

Used a separate local origin and save, leaving the main game's progress intact.

- Played eight counting rounds and eight bridge rounds to reach Beacon Rescue.
- At zero successes, captured the original premature beam and the corrected state:
  `beacon-before-zero.png` and `beacon-after-zero.png`, both 960 × 600.
  The question regenerated after reload; the quest and zero-progress state match.
- Chose an incorrect answer and confirmed the quest remained at zero with a retry.
- Earned four successes, reloaded, and resumed at four with the glow restored.
  Evidence: `beacon-halfway.png` and `beacon-resumed-portrait.png`.
- Compared `beacon-seven.png` and `beacon-earned.png` together at 834 × 1194.
  The seven-success view has a glowing arch but no beam; the eighth-success view
  has the full beam. The latter was captured during the existing success reveal.
- Followed all three footprints, greeted the encounter, opened the journal, and
  continued to Berry Crossing at zero. Its normal chapter lighting returned and
  the beam was hidden (`beacon-next-crossing.png`).
- Browser error log: empty. Full suite: 24 tests passed.

No UI layout or motion timing changed. Physical Android performance and reduced-
motion device settings were not remeasured in this pass.

Result: passed.
