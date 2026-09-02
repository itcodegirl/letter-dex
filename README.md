# Letter Dex

Letter Dex is a private family prototype for kindergarten reading practice. It
uses Pokémon sound anchors and artwork loaded at runtime from PokéAPI. It is not
affiliated with, sponsored by, or endorsed by Nintendo, The Pokémon Company, or
PokéAPI.

## Run

```powershell
npm start
```

Open `http://127.0.0.1:4173`. The project has no runtime dependencies, framework,
bundler, or TypeScript build step.

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
