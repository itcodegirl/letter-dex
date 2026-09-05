# Letter Dex

## Math adventure

Choose **Math adventure** at camp, or **Math** in the mode bar. Eight counting challenges
at Berry Crossing lead to eight picture-addition challenges in Bridge Builders and eight
missing-amount challenges in Beacon Rescue. Each stage offers a choice to continue or
return to camp. Tap berries (or empty spaces) once to count along; use Listen to repeat
the mission. Supported practice is recorded separately from independent math mastery.

The math route saves separately from reading progress in the existing local backup.
Correct math answers add Pokémon to the collection using the active letter roster.
The route uses original berry/tray art and the existing 3D scene; companion artwork is
still loaded from PokéAPI at runtime. Physical Android audio and performance remain a device check.

Letter Dex is a private family prototype for kindergarten reading practice. It
uses Pokémon sound anchors and artwork loaded at runtime from PokéAPI. It is not
affiliated with, sponsored by, or endorsed by Nintendo, The Pokémon Company, or
PokéAPI.

## Run

```powershell
npm start
```

Open `http://127.0.0.1:4173`. Three.js 0.180.0 is included locally with its MIT
license under `assets/vendor/`; no install or build step is needed. The app uses
vanilla JavaScript modules and requires an HTTP(S) server, not `file://`.

## Living Trail

Choose Sound adventure or Word adventure at camp. Listen to the clue and tap an
answer stone. Correct answers raise the route and move the camera toward the
clearing; a Pikachu companion offers encouragement. Pokémon artwork is fetched
at runtime. No Pokémon art is bundled.

Eight correct answers save one quest and award a badge. Choose Next adventure,
My Pokémon, or Back to camp. Leaving camp or changing modes preserves earned
progress. Learning items and collection/session rewards remain separate fields
in the existing save format. Saves are per browser and origin; use the grown-up
export/import controls to transfer them to a different device or host.

The renderer targets 30 frames per second with capped pixel density. Reduced
motion uses static camera/stone changes. If WebGL is unavailable, practice runs
over the existing camp artwork. If PokéAPI fails, questions remain playable.
This is not an offline-installable app or native Android package. Test audio and
performance on the actual tablet before relying on it for independent play.

Math remains a later curriculum phase; this slice uses the existing reading modes.

## Test

```powershell
npm test
```

The manual roster check is intentionally separate from the normal test suite:

```powershell
npm run verify:roster
```

That command makes one request per roster entry, spaces requests out, and caches
the result in `data/roster-status.json`. Normal tests never call PokéAPI.

## Phase 0

The approved foundation includes:

- modular Choose engine with letter-sound and decodable-word modes;
- words stored as grapheme arrays from the first commit;
- adaptive selection weighted toward low-streak items with 20% mastered-item retention;
- versioned `localStorage` progress plus JSON export and import;
- an eight-correct session ending with a badge;
- a Pokédex collection filled by correct word rounds;
- a grown-up view with per-item accuracy, set mastery, and seven-day activity;
- responsive, keyboard-accessible controls with reduced-motion support.

Progress stays on the device unless a grown-up explicitly exports the JSON file.
No child voice recordings are included in Phase 0.

## Structure

```text
index.html
styles.css
src/
  core/       adaptive selection, progress, speech, PokéAPI cache
  engines/    reusable interaction engines
  modes/      playable modes that wire engines to data
  ui/         Pokédex and grown-up views
data/
  reading/    ordered letter and grapheme-array word sets
test/         node:test data and state tests
```

PokéAPI is free to query under its fair-use policy, but API availability is not
a grant of Pokémon trademark or artwork rights. Keep this repository and any
preview deployment private unless rights are reviewed separately.
