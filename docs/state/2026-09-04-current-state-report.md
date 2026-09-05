# Letter Dex — Current Project State Report

**Repository:** `~/projects/letter-dex` on `codeherway` · branch `main` at `e4b0f67` (identical to `origin/main`)
**Remote:** `https://github.com/itcodegirl/letter-brody.git`
**Report date:** 4 September 2026, 23:42 UTC
**Method:** the working tree, `.git` objects and refs were copied to a Linux workspace and inspected with real `git`, `node --test`, `node --check`, the project's own dev server, and a headless Chromium run of the app. The user's repository was not modified; the only file written back is this report. Prior session notes (in the gitignored local notes folder) were read but every claim below was re-derived from the repository itself.

Legend for claims: **Fact** = observed in the repo or in a command's output. **Inference** = reasoning from those observations. **Recommendation** = my judgement.

---

## 1. Executive Snapshot

Letter Dex is a private, single-learner web app that teaches kindergarten letter–sound correspondence and decodable-word reading, using Pokémon fetched at runtime from PokéAPI as the reward and memory hook. It exists to give one specific five-year-old (Brody) a reason to *want* to practise phonics, and to replace commercial learning apps whose sequencing and tone his parent does not control. The audience is exactly one child plus one adult; it is not a product, and `NOTICE.md` explicitly forbids public deployment without a rights review.

It is a **working prototype at the end of an approved Phase 0** — past concept, not yet an MVP, because the phase's own acceptance criteria ("existing game works identically on the private deployed URL, progress survives a refresh, Pokédex fills, and all data tests pass") are met on three of four points and blocked on the fourth: nothing is deployed. What works, verified by driving the real app in a browser: both playable modes (letter-sound and decodable words), the adaptive selector, the Listen control, wrong-answer retry without punishment, the eight-correct session cap with a badge, `localStorage` persistence across reload, JSON export/import, the Pokédex collection screen, and the grown-up progress view. What is incomplete: there is no way to start a second session without reloading the page; the app is unusable offline or from `file://`; letter *names*, tracing, sight words, recorded audio, decodable books and the entire maths half exist only as plan text.

It is ready for **its one user**, on a laptop or tablet, over `http://` with a live connection, sitting next to an adult — and not ready for anything wider than that.

**Overall health: 🟡 Yellow — usable, important work remains.**

Evidence for the rating: 12/12 automated tests pass (`npm test`); all 20 tracked `.js` files parse and every DOM-free module imports cleanly; the dev server serves every asset (200s for `/`, `/styles.css`, `/src/main.js`, `/data/roster.js`, the 2.4 MB background; 404 for a missing path and for two traversal attempts); a headless Chromium run played eight consecutive rounds to the badge, caught a Pokémon in words mode, and reloaded with progress intact, with **zero console errors**. Against that: the session cannot be restarted in-app (`src/main.js:54,96` — `sessionEnded` is set and never cleared), `file://` loading is broken by CORS (a stated `CLAUDE.md` constraint, reproduced below), letters mode dead-ends on any network failure with no cache, and the wrong-answer signal is animation-only and is suppressed under `prefers-reduced-motion`, which contradicts the project's own accessibility floor. None of these block play today; all of them block "done".

---

## 2. Current Capabilities

| Capability | Status | Where | Evidence / note |
|---|---|---|---|
| Letter-sound round (Choose, 3 options) | **Complete and verified** | `src/modes/letters.js`, `src/engines/choose.js` | Browser run: prompt "Listen to the sound.", 3 keys at 154×154 px, `aria-label="Letter A"` etc. |
| Repeatable Listen control speaking the anchor sound | **Complete and verified** | `letters.js:64-67,107-111` | Clicked twice, prompt advanced to "Which letter matches?" |
| Silhouette-until-correct reveal | **Complete and verified** | `letters.js:63,92-96`, `styles.css` `.is-mystery` | `class="encounter-pokemon is-mystery"` before answer; removed on correct |
| Sound → name → letter speech order (rule 3) | **Implemented but not verified audibly** | `letters.js:100` | Code emits `"{sound}. {Name}. Letter {X}."`; speech output not machine-checkable |
| Wrong answer: no fail state, names the tapped letter, retry allowed | **Complete and verified** | `choose.js:22-28`, `letters.js:84-88` | Browser run: prompt became "Listen, then try again.", same encounter kept, count unchanged |
| Decodable-word round (listen → choose from 3) | **Complete and verified** | `src/modes/words.js` | Browser run: options `["at","as","tap"]`, correct answer advanced count 1→2 |
| Minimal-pair distractors for words (rule 8) | **Implemented but not verified** | `words.js:36-49` | Ranking is length-penalty minus shared positions; no test covers it |
| Catch a Pokémon on a correct word round | **Complete and verified** | `words.js:95-104`, `progress.js:73` | `localStorage` after run: `{"abra":{"count":1,…}}` |
| Adaptive selection, weight ∝ 1/(streak+1), 20 % mastered retention | **Complete and verified** | `src/core/select.js` | 3 tests, 15 000 sampled draws, mastered share 0.17–0.23 |
| Mastery at streak ≥ 2 | **Complete and verified** | `progress.js:58-71`, `test/progress.test.js` | |
| Versioned `localStorage` persistence | **Complete and verified** | `progress.js:1-44` | Key `letter-dex:v1`; count survived reload in the browser run |
| JSON export / import with version guard | **Implemented but not verified end-to-end** | `progress.js:87-94`, `main.js:250-278` | Unit-tested round-trip passes; the file-picker path was not exercised in the browser |
| Eight-correct session cap + badge | **Complete and verified** | `main.js:20,95-121` | Browser run reached "8 of 8", keys cleared, "Badge earned!", 1 badge rendered, 1 session recorded |
| Pokédex collection screen | **Complete and verified** | `src/ui/pokedex-view.js` | Empty state and a populated card ("Abra · Caught 1×") both rendered |
| Grown-up view: per-item accuracy, set mastery, 7-day activity | **Complete and verified** | `src/ui/parent-view.js` | Rendered with meters for all 4 letter sets and 6 word sets |
| Letter-set / word-set / case / word-length settings | **Implemented but not verified** | `main.js:184-248`, `index.html:51-71` | Wired and rendered; only the defaults were exercised in the browser run |
| 80 %-mastery unlock recommendation | **Partially implemented** | `main.js:192-197` | Advisory only — it writes a `title` tooltip. PLAN's "sets unlock in curriculum order" is not enforced anywhere, by design ("the unlock is a default, not a lock"), but there is also no visible recommendation in the UI, only a hover title |
| C/K never share a sound round | **Complete and verified (data) / implemented but untested (runtime)** | `letter-sets.js`, `letters.js:71-76` | A test asserts no set contains both; the runtime distractor guard for the "Everything" set has no test |
| X excluded from initial-sound rounds; Q is *qu* | **Complete and verified** | `data/roster.js`, `data/graphemes.js:25` | `test/data.test.js` asserts 25 anchors and `ROSTER.X === undefined` |
| PokéAPI fetch + in-memory cache + artwork preload | **Implemented, partially verified** | `src/core/pokeapi.js` | Cache is a `Map` of promises (correct — dedupes in-flight calls). `letters.js:113` preloads a **random** letter, not the next round's, so the preload rarely helps |
| Roster verification script + cached result | **Complete and verified** | `scripts/verify-roster.js`, `data/roster-status.json` | Re-run live today: "Verified 25/25 roster anchors" — only the timestamp differed from the cached file |
| Static dev server | **Complete and verified** | `scripts/serve.js` | Serves html/css/js/json/png/svg; 404s on miss and on `../` traversal |
| Speech via `speechSynthesis` | **Implemented but not verified** | `src/core/speech.js` | Cannot be asserted headlessly; correctly guarded by `'speechSynthesis' in globalThis` |
| Restart a session without reloading | **Broken / missing** | `main.js:54,96` | `sessionEnded = true` is never reset except by a progress import |
| Works from `file://` (stated constraint) | **Broken** | `index.html:94` | Reproduced: `Access to script at 'file:///…/src/main.js' from origin 'null' has been blocked by CORS policy` |
| Offline / network-failure behaviour | **Broken (letters mode)** | `letters.js:48-55` | With PokéAPI unreachable the round ends at "Could not reach PokéAPI." with no options and no auto-retry |
| Non-colour correct/incorrect feedback | **Partially implemented** | `styles.css:76-77,167-169` | `.key.right` is colour-only; `.key.wrong` is motion-only and is neutralised by `prefers-reduced-motion` |
| Letter *names*, case match | **Planned only — deferred** | `PLAN.md` §Phase 1a | Handed to the AR strand of the curriculum repo per the D-008 draft |
| Letter tracing | **Planned only — deferred** | `PLAN.md` §Phase 5 | Handed to the PW strand |
| Sight words, letter sequence, mirror-pair unlock | **Planned only** | `PLAN.md` §Phase 2 | |
| Recorded audio (Jenna + Brody), original decodable books | **Planned only** | `PLAN.md` §Phase 3 | No `audio/` or `data/books/` directory exists |
| All maths (ten frame, number line, base-ten, clock, coins…) | **Planned only** | `PLAN.md` §Phases 1d, 4, 6+ | No `data/math/` or `src/primitives/` directory exists |
| Build, Sort, Trace, Procedure engines | **Planned only** | `PLAN.md` §Engines | Only `src/engines/choose.js` exists |
| Deployment (private Vercel) | **Planned only** | `PLAN.md` §Phase 0 last bullet | No `vercel.json`, no `.vercel/`, no CI |

---

## 3. Repository and Architecture Map

| File or directory | Responsibility | Current status | Important notes |
|---|---|---|---|
| `index.html` | Single entry point: device shell, mode nav, play view, Pokédex view, session meter, grown-up `<details>` panel | Working over `http://` | 96 lines. Loads two Google Fonts stylesheets (Nunito, Material Symbols) — the only third-party runtime dependency besides PokéAPI. Fails under `file://` |
| `src/main.js` | Composition root: element lookup, mode switching, session counting, settings UI, export/import wiring | Working; holds the restart defect | 283 lines. `byId()` throws on a missing element, so a template/JS drift fails loudly — good. `playRound()` is called with a string argument it does not declare (4 sites) |
| `src/engines/choose.js` | The only implemented engine: renders N option buttons, locks after a correct answer, delegates outcomes | Complete for its scope | 40 lines. Also the place a "shape" feedback class would belong |
| `src/modes/letters.js` | Letter-sound round: pick item → fetch anchor → silhouette + Listen → choices → reveal | Working | Owns the C/K clash guard and the stale-round guard |
| `src/modes/words.js` | Decodable-word round: Listen → three word options → grapheme reveal → catch | Working | Receives `isCurrentRound` from `main.js` but never uses it |
| `src/core/select.js` | Adaptive selection and distractor sampling | Complete, tested | Pure, injectable `random` — the reason it is testable |
| `src/core/progress.js` | Schema v1 state, normalise, load/save, attempts, catches, sessions, export/import | Complete, tested | Storage is injectable, so tests use an in-memory stub |
| `src/core/pokeapi.js` | PokéAPI client, promise cache, artwork preload | Working | Caches the *promise*, so concurrent calls for one slug make one request |
| `src/core/speech.js` | `speechSynthesis` wrapper; word segmenting readback | Working (unverifiable headlessly) | Phase 3 replaces this with recorded clips |
| `src/ui/parent-view.js` | Grown-up dashboard: totals, per-set mastery meters, per-item accuracy grid | Working | Rebuilt on every `persist()` — see performance note in §7 |
| `src/ui/pokedex-view.js` | Collection grid, empty state, per-card PokéAPI lookup | Working | |
| `data/roster.js` | **Authoritative** letter → Pokémon anchor + spoken sound, 25 letters (no X) | Complete, tested, frozen object | Every slug's name begins with its letter, which the reveal markup in `letters.js:99` silently depends on |
| `data/graphemes.js` | 26 graphemes → sounds; `wordFromGraphemes()` | Complete | `x` carries `position: 'ending'`, which nothing reads yet |
| `data/reading/letter-sets.js` | 4 ordered letter sets covering all 25 roster letters | Complete, tested | |
| `data/reading/word-sets.js` | 6 cumulative decodable sets, 89 words, stored as grapheme arrays | Complete, tested | The `g = (text) => [...text]` helper splits per character and **cannot** express a digraph — see §7 |
| `data/roster-status.json` | Cached manual PokéAPI verification, 25 entries | Current | Re-verified live today, 25/25 |
| `scripts/serve.js` | Zero-dependency static dev server on 127.0.0.1:4173 | Working | |
| `scripts/verify-roster.js` | Manual, rate-spaced PokéAPI check; rewrites the cache; exits 1 on failure | Working | Deliberately outside `npm test` |
| `test/` (4 files, 12 tests) | Data integrity, progress/persistence, adaptive selection, roster cache | All passing | `node:test`, no runner dependency |
| `styles.css` | Whole visual system: campsite scene, keys, trail meter, Pokédex, parent view, 3 media queries | Working | 169 lines, dense one-line rules |
| `assets/camp/campsite-background.png` | Full-bleed background | Present, **2.4 MB** | Committed as-is; no responsive or compressed variant |
| `CLAUDE.md` | Authoritative rules: working agreement, 12 learning rules, IP, tech constraints, a11y floor, structure | Current | The tiebreaker document |
| `PLAN.md` | Scope, engines, primitives, data model, recording plan, phases 0–6 | Current (updated 4 Sep) | Phase 0 approved; everything later is plan-only |
| `AGENTS.md` | Short contributor pointer to `CLAUDE.md`/`PLAN.md` | Current | |
| `README.md` | Run/test instructions, Phase 0 summary, structure, IP caution | Current | PowerShell-flavoured commands |
| `NOTICE.md` | Prototype/IP notice | Current | |
| `design-qa.md` | Visual QA record for the Companion Camp restyle | Current, **partly inaccurate** | See §7: its "shape feedback independent of color" claim is not implemented |
| `docs/sources/*.md` | Curriculum reference (38 KB) and the 1 Sep learner baseline | Current, not loaded by the app | |
| `docs/state/` | Directory for dated state reports | **Was empty** before this file | |
| `robots.txt` | `Disallow: /` | Current | Belt-and-braces alongside the `noindex` meta |
| `.gitignore` | Ignores `node_modules/`, `.vercel/`, `coverage/`, `tmp/`, and the local notes folder | Current | |
| Local notes folder (gitignored) | Two untracked session artefacts (state addendum, D-008 draft) | Untracked by design | Deliberately gitignored; contains the pending D-008 decision text |

Not in the repository at all, despite appearing in `CLAUDE.md`'s structure block: `src/primitives/`, `data/math/`, `data/books/`, `audio/`, and the `build`/`sort`/`trace`/`procedure` engines. **Fact**, not a defect — that block describes the target shape.

---

## 4. Current Technical State

- **Languages / frameworks:** vanilla JavaScript, ES modules, no framework, no bundler, no TypeScript, no JSX. HTML5 + CSS3 (custom properties, `clamp()`, `dvh`, `env(safe-area-inset-*)`, `@media (orientation)` and `prefers-reduced-motion`).
- **Package manager:** npm. `package.json` declares `"private": true`, `"type": "module"`, and three scripts: `start`, `test`, `verify:roster`. **There are zero dependencies and zero devDependencies, and no `package-lock.json`** — `npm ls --all` prints an empty tree. That is intentional per `CLAUDE.md` ("Runtime dependencies: none. Dev dependencies: `node:test` only"). Consequence: `npm ci` cannot be used, and nothing pins a Node version (`node -v` in this workspace: v22.22.2; the code uses `Array.prototype.at`, top-level `await` in a script, and `node:test`, so Node ≥ 18 is required — **inference**, undeclared).
- **Important "dependencies" (all external services, none installed):** PokéAPI (`https://pokeapi.co/api/v2/pokemon/{slug}`) and Google Fonts (Nunito + Material Symbols Rounded).
- **Database / storage:** none server-side. Client `localStorage`, one key `letter-dex:v1`, `SCHEMA_VERSION = 1`, JSON export/import as the backup path. No IndexedDB, no service worker, no cache storage.
- **Authentication / authorization:** **none, anywhere.** There is no user model, no login, and no parent gate — deliberate (`CLAUDE.md` rule 12: the mode switch is kid-reachable with no parent gate). The grown-up panel is a plain `<details>` element. Privacy protection is that all data stays on the device.
- **Hosting / deployment target:** private Vercel static deploy, planned, **not configured**. No `vercel.json`, no `.vercel/`, no GitHub Actions, no CI of any kind.
- **Environment variables:** exactly one, and it is optional — `PORT`, read in `scripts/serve.js:5`, default `4173`, controlling the local dev server port. No secrets exist in the repository and none are needed; PokéAPI requires no key.
- **External services:** PokéAPI (runtime data + artwork; the project self-imposes caching in place of a rate limit) and Google Fonts (typography and the Material Symbols icon glyphs).
- **Supported commands** — all verified in this session:
  - `npm test` → `node --test` → 12 tests, 12 pass, ~0.6 s.
  - `npm start` → `node scripts/serve.js` → `http://127.0.0.1:4173`.
  - `npm run verify:roster` → live PokéAPI check, rewrites `data/roster-status.json`, exits 1 on any failure. **Not idempotent in git terms**: it always rewrites `checkedAt`, so it dirties the working tree even when nothing changed.
  - There is **no** build, lint, format, or typecheck command, and no config for one (`.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `.editorconfig`, `.gitattributes` are all absent).

**Configuration inconsistencies found:**

1. **Fact — remote naming.** Local `origin` is `github.com/itcodegirl/letter-brody.git`. A note written earlier the same day records `origin` as `github.com/itcodegirl/letter-dex.git`; `.git/config` has been modified since (its mtime is the newest in `.git`). Two remotes are known to hold this history under different names and neither is marked canonical.
2. **Fact — `CLAUDE.md` vs reality.** The structure block lists directories that do not exist (`src/primitives/`, `data/math/`, `data/books/`) — harmless as a target, but a reader cannot tell target from state.
3. **Fact — `CLAUDE.md` vs reality.** "`index.html` at the root must work from `file://`" is not satisfied (see §5).
4. **Fact — README commands are PowerShell-fenced** (```powershell) while the stated working environment is WSL2 Ubuntu. The commands themselves are shell-agnostic.
5. **Fact — no `.gitattributes`.** This repo is currently clean (working tree is LF and matches the index), but the sibling curriculum repo has already suffered a whole-repo CRLF rewrite. A one-line `* text=auto eol=lf` would inoculate this one.
6. **Fact — no engine/Node version declared** in `package.json`.

No secret values were found and none are reported.

---

## 5. Verification Results

| Check | Command | Result | Evidence or failure |
|---|---|---|---|
| Dependency install | `npm ls --all` | **Pass (nothing to install)** | `letter-dex@0.1.0` with an empty dependency tree; no lockfile by design |
| Build | — | **Not applicable** | No build step exists; static site by constraint |
| Type checking | — | **Could not run** | No TypeScript, no `tsconfig.json`, no `checkJs`; nothing to typecheck |
| Linting | — | **Could not run** | No ESLint/Prettier config or dependency in the repo |
| Syntax check | `for f in $(git ls-files '*.js'); do node --check "$f"; done` | **Pass** | All 20 tracked `.js` files parse |
| Module load | dynamic `import()` of all 13 DOM-free modules | **Pass** | All 13 import without error under Node |
| Automated tests | `npm test` | **Pass — 12/12** | `# pass 12 # fail 0 # duration_ms 627` |
| Dev server startup | `npm start` | **Pass** | "Letter Dex is running at http://127.0.0.1:4173" |
| Asset serving | `curl` on `/`, `/styles.css`, `/src/main.js`, `/data/roster.js`, `/assets/camp/campsite-background.png` | **Pass** | 200 with correct MIME for each; `/nope.js` → 404 |
| Path traversal | `curl --path-as-is '…/../etc/passwd'` | **Pass (blocked)** | 404 both with and without curl path normalisation |
| App smoke test (letters) | headless Chromium at `http://127.0.0.1:4173`, PokéAPI stubbed | **Pass** | Silhouette + Listen + 3 keys at 154×154 px with `aria-label`s; wrong answer → "Listen, then try again." and the count held; correct answer → reveal "s Snorlax", all keys disabled, "1 of 8", auto-advance to a new round |
| App smoke test (words) | same session | **Pass** | Listen → `["at","as","tap"]` → correct → count 2/8 → `collection.abra.count === 1` in `localStorage` |
| Session cap and badge | same session, 8 rounds | **Pass** | Round 8 → "8 of 8", "Badge earned!", 0 keys, 1 badge, `sessions.length === 1` |
| Persistence across reload | `page.reload()` | **Pass** | Count still "2 of 8" after reload; `letter-dex:v1` present |
| Console cleanliness | Chromium console + `pageerror` | **Pass** | 0 errors, 0 page errors in the stubbed run |
| Pokédex + grown-up view | same session | **Pass** | Empty state, then "Abra · Caught 1×"; parent view rendered all 10 set meters |
| Live PokéAPI roster check | `npm run verify:roster` (run against a **copy**, reverted) | **Pass** | "Verified 25/25 roster anchors"; only `checkedAt` differed from the committed cache |
| **`file://` load (a `CLAUDE.md` constraint)** | headless Chromium at `file:///…/index.html` | **FAIL** | Console: `Access to script at 'file:///…/src/main.js' from origin 'null' has been blocked by CORS policy`. Page stays at "Loading…", 0 keys |
| **Offline / PokéAPI unreachable** | headless Chromium, no stub, egress blocked | **FAIL (letters mode)** | 3× `net::ERR_CONNECTION_RESET`; prompt "Could not reach PokéAPI.", 0 options, no retry. Words mode still rendered its Listen control and 3 choices |
| Accessibility: reduced motion | static reading of `styles.css:76-77,167-169` | **Fail (partial)** | Correct = colour only; wrong = animation only, and animation is forced to `.01ms` under `prefers-reduced-motion` |
| Colour-contrast audit | — | **Not run** | Needs a real contrast tool against the background image; not attempted |
| Real-device / touch test | — | **Not run** | The target Android tablet is not reachable from this session |
| Speech output | — | **Not verifiable** | `speechSynthesis` produces no inspectable artefact headlessly |
| iOS gesture requirement | code reading only | **Consistent, unverified** | Nothing speaks before a tap in either mode, which satisfies the rule; not tested on iOS |

Nothing in this report claims a feature works because its code exists; every "verified" row above is backed by a command's output.

---

## 6. Git and Work-in-Progress State

- **Current branch:** `main` at `e4b0f67`, tracking `origin/main` at the same SHA — **up to date, nothing to push, nothing to pull**.
- **Working tree:** `git status` → **clean**. No modified files, no staged changes, no stashes, no untracked files other than the gitignored local notes folder (2 markdown artefacts) and the previously empty `docs/state/` directory.
- **All commits are correctly authored** as `itcodegirl <88835851+itcodegirl@users.noreply.github.com>`, and no commit message contains AI attribution or a tool name — both `CLAUDE.md` rules hold across the whole history.

Commit history (all of it — 8 commits):

```
e4b0f67  2026-09-04 20:48  Merge docs/sources-and-d008: curriculum sources, D-008 deferrals   (main, origin/main)
d35d779  2026-09-04 20:48  Merge phase0/runtime: Phase 0 runtime and Companion Camp restyle
39f639b  2026-09-04 20:35  Defer letter names and tracing per D-008; record sources and device in PLAN.md
3ce8eae  2026-09-04 20:24  Add curriculum sources and baseline, defer letter names and tracing per D-008, remove PLAN1.md
95f3f82  2026-09-04 19:56  Companion Camp restyle: campsite backdrop, repeatable Listen, silhouette reveal, stale-round guard
1301890  2026-09-02 22:56  feat: port Letter Dex into Phase 0 modules
7617117  2026-09-02 22:56  docs: establish Letter Dex project rules
e311d5b  2026-09-02 22:56  feat: add Phase 0 data and progress foundation
```

- **Branches:** `main`; `docs/sources-and-d008` (`39f639b`, merged, pushed); `phase0/data-foundation` (`e311d5b`, merged, pushed); `phase0/runtime` (`95f3f82`, merged into `main` via `d35d779`; its remote counterpart still sits one commit behind at `1301890`). **Inference:** all three feature branches are fully contained in `main` and are safe to delete locally and on the remote — but branch deletion is a confirm-first action, so nothing was done.
- **Partially completed work:** none in the tree. The entire Companion Camp restyle described in yesterday's addendum as "uncommitted, unpushed, one laptop, no backup" has since been committed, merged and pushed. The superseded `PLAN1.md` and the stray `CHAT-ARTIFACT-INVENTORY.md` were removed. **That risk is closed.**
- **TODO / FIXME / HACK / placeholder markers:** a case-insensitive grep for `TODO|FIXME|HACK|XXX|placeholder|stub|not implemented|coming soon` across all `.js`, `.html`, `.css` and `.json` files returns **nothing**. Incomplete work lives in `PLAN.md`, not in code comments.
- **Abandoned or duplicated implementations:**
  - `activeLetters()` is implemented **twice**, identically — `main.js:64-67` and `letters.js:23-26`. `main.js` passes its copy into `WordsMode` while `LettersMode` uses its own. Two copies of one rule.
  - `shuffled()` is implemented **twice** — `letters.js:7-9` (accepts an injectable `random`) and `words.js:8-10` (hard-codes `Math.random`). Both use the `sort(() => r - 0.5)` idiom, which is a biased shuffle, not a uniform one.
  - `WordsMode` is handed `isCurrentRound` by `main.js:132` and never destructures or uses it; only `LettersMode` has the stale-round guard.
  - `playRound()` takes no parameters but is called with a descriptive string at four sites (`main.js:120,172,202,217,237,246`). Dead arguments — harmless, misleading.
  - `data/graphemes.js` marks `x` with `position: 'ending'`; no code reads that field yet.
  - No abandoned files, no dead modules, no commented-out blocks.

**No user changes existed to preserve, and none were altered.** The only write to the repository is this file.

---

## 7. Quality and Risk Assessment

### Verified problems

| # | Severity | Issue | Evidence | Affected | Likely impact |
|---|---|---|---|---|---|
| 1 | **Critical** | A finished session cannot be restarted without reloading the page | `main.js:54` (`sessionEnded = false` at load), `main.js:96` (set `true`), and `selectMode` at `main.js:169-170` re-shows the end screen. No control anywhere clears it | `src/main.js` | After the badge, every mode tap returns to "All done for now." A five-year-old who wants a second round has to ask an adult to reload. This is the single most likely thing to end a play session badly |
| 2 | **High** | The app does not run from `file://`, which `CLAUDE.md` requires | Reproduced in Chromium: ES-module CORS block from `origin 'null'` | `index.html:94` and every `src/*.js` import | The stated fallback for "no server available" does not exist. Any plan that assumes double-clicking `index.html` works is wrong |
| 3 | **High** | Letters mode dead-ends on any PokéAPI failure; there is no cached artwork and no retry | `letters.js:48-55`; observed live with egress blocked | `src/modes/letters.js`, `src/core/pokeapi.js` | On a flaky tablet connection the primary mode shows an error string a non-reader cannot act on ("Check the connection, then tap Letters to retry"). The mode is 100 % network-dependent for content it could cache |
| 4 | **High** | Correct/incorrect feedback is not perceivable without colour or motion, contradicting the project's own accessibility floor | `styles.css:76` (`.key.right` = green fill only), `:77` (`.key.wrong` = animation only), `:167-169` (reduced-motion forces `animation-duration: .01ms`) | `styles.css`, `src/engines/choose.js` | A reduced-motion user gets **no visual wrong-answer signal at all**. `CLAUDE.md`: "No color-only meaning. Correct/incorrect is shape + sound + color" |
| 5 | **High** | `design-qa.md` asserts a property the code does not have | `design-qa.md:26` ("retain shape feedback independent of color") vs `styles.css:76-77` | `design-qa.md` | A signed-off QA document that overstates conformance is worse than no document — the next session will trust it |
| 6 | **Medium** | Mastery is permanent: once `mastered` is true it is never revoked, even after repeated wrong answers | `progress.js:68` — `mastered: streak >= 2 \|\| previous.mastered` | `src/core/progress.js`, `src/core/select.js` | A forgotten item stays inside the 20 %-capped mastered pool and is practised *less* precisely when it needs practice more. Two lucky guesses in a row permanently reclassify an item |
| 7 | **Medium** | The word-set authoring helper cannot express a digraph, contradicting learning rule 11 | `word-sets.js:1` — `const g = (text) => [...text]` spreads *characters*, so `g('ship')` yields `['s','h','i','p']`, never `['sh','i','p']` | `data/reading/word-sets.js` | The first `sh`/`ch`/`th` word set will silently produce wrong graphemes unless the author remembers not to use the helper. No test catches it today because no multi-character grapheme is in use |
| 8 | **Medium** | A 2.4 MB uncompressed PNG background loads on first paint | `assets/camp/campsite-background.png`, referenced at `styles.css:34` | assets, `styles.css` | ~94 % of the repository's 2.6 MB. On tablet cellular or slow Wi-Fi this is the dominant load cost; it is also the whole visual identity, so it cannot simply be dropped |
| 9 | **Medium** | The interface depends on two Google Fonts requests; the icon font failing degrades to literal text | `index.html:12-13`; `index.html:27-29`, `letters.js:65`, `words.js:68` render `<span class="material-symbols-rounded">volume_up</span>` | `index.html`, both modes | Offline or with fonts blocked, the Listen and nav buttons read `volume_up`, `hearing`, `spellcheck`, `menu_book`. Non-fatal, confusing for a child, and avoidable with an inline SVG |
| 10 | **Medium** | The whole grown-up view is re-rendered via `innerHTML` on every single answer | `main.js:59-62` (`persist()` calls `renderParentView`) | `src/ui/parent-view.js` | Grows linearly with the number of items seen while sitting behind a closed `<details>`. Cheap now, quietly wasteful later |
| 11 | **Low** | Duplicated `activeLetters()` and `shuffled()` implementations | §6 | `main.js`, `letters.js`, `words.js` | Two places to change one rule; the two `shuffled()` copies already differ in testability |
| 12 | **Low** | `sort(() => random() - 0.5)` is a biased shuffle | `letters.js:8`, `words.js:9` | both modes | Option order is not uniformly random; a child could learn a positional habit. Fisher–Yates is three lines |
| 13 | **Low** | Untrusted-ish API strings are interpolated into `innerHTML` | `letters.js:61-68,97-99`, `words.js:100`, `pokedex-view.js:19-25` | UI modules | PokéAPI is a trusted, well-formed source, so exploitation is implausible; it is still an unescaped template pattern that will be copied into a less trusted context later |
| 14 | **Low** | Dev server prefix check uses `startsWith(root)` without a separator | `serve.js:20` | `scripts/serve.js` | A sibling directory whose name extends the repo's could be served. Bound to `127.0.0.1` and dev-only, so impact is minimal |
| 15 | **Low** | `playRound()` called with an argument it does not accept, at six sites | `main.js:120,172,202,217,237,246` | `src/main.js` | Reads as if the reason is recorded somewhere. It is discarded |
| 16 | **Low** | `npm run verify:roster` always dirties the working tree | `verify-roster.js:31` writes a fresh `checkedAt` | `data/roster-status.json` | Every manual verification produces a one-line diff to discard or commit |

### Risks that need further investigation

- **Colour contrast has not been measured.** Cream keys and white-on-red controls sit on a photographic background; `design-qa.md` asserts "strong cream/ink contrast" but no tool output backs it. **Recommendation:** run an axe/Lighthouse pass on the deployed URL.
- **No real-device testing.** The decided target is an Android tablet (`PLAN.md` open question 1). Touch behaviour, `100dvh`, `env(safe-area-inset-*)`, and Chrome-on-Android's speech voices are all unverified there.
- **`speechSynthesis` quality is the central pedagogical risk and is untested.** `PLAN.md` already concedes it "adds a schwa to consonants"; the roster encodes that compromise directly (`B: 'buh'`, `P: 'puh'`). A child taught /buh/ instead of /b/ learns the exact habit rule 3 was written to prevent. Phase 3 fixes it; until then every letter round carries it.
- **Test coverage is real but narrow.** 12 tests cover data integrity, the progress reducer and the selector — the pure core. **Zero tests cover** `choose.js`, either mode, either view, `pokeapi.js`, `speech.js`, or `serve.js`, and none of the runtime learning rules (the C/K distractor guard, minimal-pair ranking, the session cap, the stale-round guard). Every defect above numbered 1–4 lives in that untested half. **Inference:** the suite's clean record is not evidence about the parts that broke.
- **Documentation drift is now a measurable pattern.** `CLAUDE.md`'s structure block, `design-qa.md`'s a11y claim, the README's `file://`-adjacent promise, and yesterday's superseded addendum are four documents describing a state the code is not in. The repo has more prose than code (`PLAN.md` + `CLAUDE.md` ≈ 16 KB against ~1 440 lines of source).
- **Deployment readiness is low but the gap is small.** A static site with no build step and no secrets is close to trivial to deploy; what is missing is a decision (`PLAN.md` calls for *private* deployment and `NOTICE.md` forbids a public one) and Vercel deployment protection, not engineering.
- **IP posture is coherent while private.** Runtime-only PokéAPI, no bundled Nintendo assets, `robots.txt` `Disallow`, `noindex` meta, `NOTICE.md`, and a `private: true` package. The D-008 draft is explicit that this holds only while the project stays private and non-commercial.

---

## 8. Open Items and Blockers

### Must fix before Phase 0 can be called done

1. **Session restart** (bug, Critical) — `sessionEnded` is a one-way latch. Needs a kid-reachable "Play again" control, or an automatic reset when a mode is chosen after the badge.
2. **Private Vercel deployment** (missing functionality) — the last unmet Phase 0 acceptance criterion. No `vercel.json`, no project, no deployment protection. Blocked on nothing technical; it is a decision plus 30 minutes.
3. **Non-colour, non-motion answer feedback** (bug, High) — required by `CLAUDE.md`'s accessibility floor and currently absent under reduced motion.
4. **`file://` support or an explicit constraint change** (integration, High) — either serve the modules differently, inline them, or amend `CLAUDE.md`. Today the document and the code disagree.
5. **Correct `design-qa.md`** (documentation, High) — remove or qualify the shape-feedback claim so the next session is not misled by a "passed" QA record.

### Should fix soon

6. **PokéAPI resilience** (High) — cache artwork (or ship a small local fallback set), auto-retry, and give letters mode a playable degraded state instead of an error string.
7. **Mastery decay** (Medium) — decide whether `mastered` can be lost; if yes, revoke it after *n* misses. This is a product decision as much as a code change.
8. **Digraph-safe word authoring** (Medium) — replace or supplement `g()` with a splitter that knows the grapheme inventory, plus a test asserting a known digraph word segments correctly.
9. **Background image weight** (Medium) — compress and/or ship WebP with a PNG fallback; 2.4 MB is a tablet-first cost.
10. **Icon-font fallback** (Medium) — inline SVGs for the four glyphs so the Listen button never reads `volume_up`.
11. **Tests for the untested half** (missing tests) — at minimum: the C/K runtime distractor guard, minimal-pair distractor ranking, the 8-correct cap and reset, and the stale-round guard. A DOM harness (`jsdom` or Playwright) is the only new tooling this needs, and `CLAUDE.md` requires a phase document to add a dev dependency.
12. **Delete the three merged branches** locally and on the remote (technical debt) — confirm first.
13. **Decide the canonical remote** (unresolved decision) — `letter-brody` vs `letter-dex`; two remotes hold this history and only one should.

### Optional improvements

14. Deduplicate `activeLetters()` and `shuffled()`; make the shuffle uniform (Fisher–Yates); use or remove the unused `isCurrentRound` in `WordsMode`; drop the dead `playRound()` arguments.
15. Add `.gitattributes` (`* text=auto eol=lf`) before Windows line endings become a problem here as they already have in the sibling repo.
16. Declare `"engines": { "node": ">=18" }` in `package.json`.
17. Add an `unlocked`/`recommended` visual cue for sets rather than a hover `title`.
18. Escape or template-bind API strings instead of `innerHTML` interpolation.
19. Reconcile `CLAUDE.md`'s structure block with what exists (mark target directories as target).

### Unresolved product decisions (from `PLAN.md` and the local notes folder)

20. **Letterforms** — single- vs double-storey *a* and *g* in Brody's tracing app decides the font for the entire game. `PLAN.md` open question 3, still open, and it blocks nothing today but gets more expensive with every screen.
21. **D-008** — the two-games scope split is a **draft** (now `docs/state/2026-09-04-d008-two-games-convergence-draft.md`), not yet written to the curriculum repo's `DECISIONS.md`. `PLAN.md` already acts on it (phases 1a and 5 are deferred), so the code has adopted a decision that is not recorded. Recommendation in that draft: Option D.
22. **Recording logistics** — device and date for Jenna's and Brody's clips. Phase 3.
23. **Whether tracing is ever built here** at all, given the PW strand requires physical work samples.

---

## 9. Recommended Next Steps

### Next session

**1. Fix the session restart.** Priority: Critical. Action: clear `sessionEnded` and reset the round state when a mode button is pressed after the badge, or add an explicit "Play again" button on the end screen (kid-reachable, no parent gate, `≥64 px`). Reason: it is the only defect a five-year-old hits every single time he finishes. Dependencies: none. Expected outcome: a second session starts from within the app. Effort: **Small**. Done when: an automated round-trip plays to 8, taps play-again, and reaches "1 of 8" with `activeSession.correct === 1`, plus a test asserting the reset.

**2. Add non-colour, non-motion answer feedback.** Priority: High. Action: add a persistent shape/glyph state to `.key.right` and `.key.wrong` (a check/cross mark or border treatment) rendered by `choose.js`, and make it survive `prefers-reduced-motion`. Reason: `CLAUDE.md`'s accessibility floor, and the reduced-motion path currently shows nothing. Dependencies: none. Expected outcome: correctness is perceivable with colour and motion both disabled. Effort: **Small**. Done when: a reduced-motion Chromium run shows a distinguishable wrong state, and `design-qa.md` is corrected in the same PR.

**3. Correct `design-qa.md`.** Priority: High. Action: amend the shape-feedback line and the "no actionable P0/P1/P2 remain" conclusion to match §7 above. Reason: a false "passed" is a trap for the next session. Dependencies: item 2 (fix and re-verify together). Effort: **Small**. Done when: every checklist line in that file is traceable to something reproducible.

**4. Deploy privately to Vercel.** Priority: High. Action: create the project from the canonical remote, enable deployment protection (password or SSO), confirm `robots.txt` and the `noindex` meta are served, and record the URL in `README.md`. Reason: it is the last open Phase 0 acceptance criterion, and it is what makes the game reachable from the tablet rather than a laptop terminal. Dependencies: decide the canonical remote (item 13 of §8) first. Expected outcome: Phase 0 closes. Effort: **Small–Medium**. Done when: the deployed URL requires auth, plays a full round on the target tablet, and progress survives a reload there.

Sequencing note: 1–3 are one PR each per `CLAUDE.md` ("one phase or sub-phase per PR"); 1 and 2 both touch runtime, so keep them separate from any data change.

### Next milestone (close Phase 0, open Phase 1)

**5. PokéAPI resilience.** Priority: High. Action: persist fetched artwork URLs (and optionally the images) alongside progress; on failure fall back to a cached anchor or a neutral silhouette so the round is still playable; auto-retry once. Reason: the primary mode currently has a hard network dependency on a tablet that will not always be online. Dependencies: none. Effort: **Medium**. Done when: with the network disabled, a letter round still renders three options and accepts an answer.

**6. Resolve letterforms, then set the font once.** Priority: High. Action: look at the tracing app, pick the font, change it in `styles.css` in one commit. Reason: `PLAN.md` says the font changes everywhere at once and never per screen; the cost grows with every screen added. Dependencies: a five-minute observation. Effort: **Small**. Done when: `PLAN.md` open question 3 is answered in writing and the font matches.

**7. Test the untested half.** Priority: High. Action: add a DOM-level harness and cover the C/K runtime guard, minimal-pair ranking, the session cap and restart, and the stale-round guard. Reason: every defect in §7 numbered 1–4 sits outside current coverage. Dependencies: `CLAUDE.md` requires a phase document to add a dev dependency — write that first. Effort: **Medium**. Done when: `npm test` fails if any of those four behaviours regresses.

**8. Record the D-008 decision.** Priority: Medium. Action: paste the drafted record into the curriculum repo's `docs/DECISIONS.md` and mark it Accepted (or amend it). Reason: `PLAN.md` has already been changed on the strength of an unrecorded draft. Dependencies: Jenna's call. Effort: **Small**. Done when: the decision exists where a future session will look for it.

**9. Weight and fallback pass.** Priority: Medium. Action: compress the background, add the WebP/PNG pair, inline the four icon glyphs, keep Nunito. Reason: first paint on a tablet and graceful degradation offline. Dependencies: none. Effort: **Small–Medium**. Done when: the largest asset is under ~400 KB and every control is legible with external fonts blocked.

**10. Phase 1b — K letter sounds sets 2–4 and the X ending-sound round.** Priority: Medium. Action: data-first, per `CLAUDE.md` (data and engine changes in separate PRs). Reason: it is the next approved-in-plan learning content and it is where Brody actually is. Dependencies: items 1–4. Effort: **Medium**. Done when: the ending-sound round exists for X and every new set passes the cumulative-grapheme test.

### Longer-term

**11. Digraph-safe grapheme authoring** before the `sh/ch/th` sets (Medium effort) — a splitter that consults `GRAPHEMES` plus a test, otherwise rule 11 breaks silently the first time it matters.

**12. Mastery decay and the evidence question** (Medium) — permanent mastery is a genuine pedagogical bug, and the D-008 draft's Option C describes an append-only evidence log as the eventual shape. Decide the model before schema v2, not during it.

**13. Recorded audio, Phase 3** (Large) — the highest-value learning change in the plan. `speechSynthesis` teaching /buh/ for /b/ is the compromise the whole roster currently encodes.

**14. The second engine, and the maths half** (Large) — Build first (segmenting, add-a-sound, number sequence), then the sprite grid and ten frame. Everything in `PLAN.md` phases 1d and beyond depends on those two.

**15. Repository hygiene** (Small) — delete merged branches, settle the canonical remote, add `.gitattributes` and `engines`, and reconcile `CLAUDE.md`'s structure block.

---

## 10. Final Handoff

- **Current project stage:** working prototype at the end of an approved Phase 0 — past concept and prototype-of-one-file, short of MVP because it is not deployed and cannot restart a session.
- **Overall health:** 🟡 **Yellow.** It runs, it is tested where it is tested, the working tree is clean and fully pushed, and it plays end to end. It is held back by one Critical usability defect, three High-severity gaps against its own written rules, and an unmet deployment criterion.
- **Percentage complete (estimate, not a measurement):** **Phase 0 ≈ 85 %** — every listed deliverable exists and works except the deployment, with the restart defect counting against "works identically". **The product as scoped in `PLAN.md` (reading and maths, PK–grade 5) ≈ 5 %** — one of five engines, none of nine primitives, no maths at all, and 89 words against a plan that runs to grade 5.
- **Strongest part:** the pure core — `src/core/select.js` and `src/core/progress.js`, with the data files behind them. Injectable randomness and injectable storage make them genuinely testable, and their 12 tests actually assert behaviour (a 10 000-draw statistical check on the 20 % retention share, not a smoke test). The data layer is disciplined in the same way: `roster.js` is frozen, holds the sound-not-fame rule, and every anchor still resolves live on PokéAPI today, 25/25.
- **Biggest current risk:** **the untested half is where the defects are.** Both modes, the engine, both views and the API client have zero coverage, and that is precisely where the session-restart latch, the `file://` breakage, the offline dead end and the reduced-motion gap all live. A green `npm test` is currently evidence about the core and nothing else — and the one document that reviewed the rest, `design-qa.md`, records a "passed" that does not hold.
- **Best first task for the next session:** fix the session restart (§9 item 1). It is Small, it is the defect Brody meets every time he finishes, and it is the last thing standing between the current build and "he can use this on his own for twenty minutes".
- **Before continuing, a developer must know:**
  1. `CLAUDE.md` is the tiebreaker, and its 12 learning rules are pedagogy, not preferences — the anchors are chosen for sound rather than fame, and "improving" `data/roster.js` breaks the teaching.
  2. `main` is clean and pushed at `e4b0f67`; the three feature branches are all merged into it. Nothing is in flight.
  3. Branch off `main`, one phase or sub-phase per PR, never engine and data in the same PR, `npm test` before every PR — and **merging is Jenna's**, always.
  4. Commits are authored `itcodegirl <88835851+itcodegirl@users.noreply.github.com>` with no AI attribution anywhere GitHub-visible. The whole history complies; keep it that way.
  5. There are no dependencies, no lockfile, no build, no lint and no CI. Adding a dev dependency requires a phase document per `CLAUDE.md`.
  6. `npm run verify:roster` hits the live API and always rewrites `checkedAt` — expect a one-line diff and do not commit it casually.
  7. The app needs an `http://` origin and a live connection; `file://` does not work and letters mode has no offline path.
  8. Two remotes hold this history (`letter-brody`, `letter-dex`) and the canonical one has not been chosen. Local `origin` is `letter-brody`.
  9. `docs/sources/` is reference material the app never loads; the 1 Sep baseline is a record, not a live counter — add a new dated file rather than editing it.
  10. `PLAN.md` phases 1a and 5 are deferred to the curriculum repo's AR and PW strands on the strength of a **draft** decision (now `docs/state/2026-09-04-d008-two-games-convergence-draft.md`) that has not yet been recorded in `docs/DECISIONS.md` there.

---

*Prepared by inspecting the repository at `e4b0f67` with git, `node --test`, `node --check`, the project's own dev server and a headless Chromium session. No repository file other than this report was created or modified, and no commit was made.*
