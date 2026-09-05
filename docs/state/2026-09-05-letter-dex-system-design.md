# Letter Dex — System Design

**Scope:** the architecture Letter Dex needs to carry `PLAN.md` from where it is (one engine, two skills, 89 words) to where it points (five engines, nine primitives, reading and maths, PK–grade 5).
**Status:** design only. `PLAN.md` approves Phase 0 and nothing after it; nothing here is a licence to build. `CLAUDE.md` is the tiebreaker on every conflict.
**Baseline:** `main` at `e4b0f67`, verified 4 Sep 2026.
**Date:** 5 September 2026.

---

## 1. Requirements

### Functional

| # | Requirement | Source | Today |
|---|---|---|---|
| F1 | Present a learning round, take an answer, record the outcome, advance | `PLAN.md` §Engines | Built (Choose only) |
| F2 | Five interaction engines: Choose, Build, Sort, Trace, Procedure | `PLAN.md` §Engines | 1 of 5 |
| F3 | Nine maths primitives (sprite grid, ten frame, number line, base-ten, grid/array, clock, coins, fraction strips, measurement) | `PLAN.md` §Primitives | 0 of 9 |
| F4 | Adaptive item selection weighted to low streak, 20 % mastered retention | `PLAN.md` §Data model | Built, tested |
| F5 | Per-item progress, mastery, set unlocks, parent view | `PLAN.md` §Data model | Built (mastery is permanent — see §4.2) |
| F6 | Pokémon collection as the reward loop | `PLAN.md` §Data model | Built |
| F7 | Recorded audio replaces `speechSynthesis`, per-clip fallback | `PLAN.md` §Phase 3 | Not built |
| F8 | Original decodable books, unlocked at 80 % set mastery | `PLAN.md` §Phase 3 | Not built |
| F9 | Reading through spelling; maths through grade 5 | `PLAN.md` §Product boundaries | Reading only, K only |

### Non-functional

| # | Requirement | Value | Why it is what it is |
|---|---|---|---|
| N1 | Concurrent users | **1** | One child. Peak request rate ≈ 0.02 rps (one round per ~10 s). There is no scaling problem to solve here, and pretending otherwise would add cost for nothing |
| N2 | Round-start latency | **< 1 s** from previous answer | Today a PokéAPI round-trip sits inside that budget (`letters.js:49` awaits before rendering options) |
| N3 | Availability | **Works offline after first load** | The device is an Android tablet on home wifi. Uptime of a static host is not the risk; a dropped connection mid-session is |
| N4 | Durability | **Progress must survive months** | Losing his streak is not a data incident, it is a motivation incident. `localStorage` is evictable and manual export is the only backup |
| N5 | Cost | **$0/month** | No backend, no accounts, no telemetry |
| N6 | Privacy | **No child data leaves the device** | Hard constraint. It is the reason there is no server, not a shortcut around building one |
| N7 | IP boundary | **No Pokémon asset is stored in the repo or the build** | `CLAUDE.md` §Content and IP, `NOTICE.md`. Runtime PokéAPI only |
| N8 | Maintainability | **A solo, part-time developer must be able to re-enter it after two weeks away** | This is the binding constraint on every decision below, more than performance or scale |
| N9 | Stack | Vanilla JS, ES modules, no framework, no bundler, no TypeScript, zero runtime deps, `node:test` only | `CLAUDE.md` §Tech constraints |
| N10 | Accessibility floor | ≥64 px targets, real `<button>`, `aria-live` reveals, visible focus, `prefers-reduced-motion`, no colour-only meaning | `CLAUDE.md` §Accessibility floor |

### Constraints worth naming as constraints

- **One developer, learning as she goes.** An abstraction that is clever but opaque costs more than the duplication it removes.
- **Content volume is the growth axis, not traffic.** Estimated end state: ~1 500 reading items + ~3 500 maths items ≈ **5 000 items**, across ~100 skills. Everything in §3 is shaped by that number, not by users.
- **No build step.** Whatever ships must run as authored, from a static host.

### The central tension

> **N7 (no stored Pokémon assets) directly contradicts N3 (works offline).**

The obvious offline fix — bundle 25 sprites — is forbidden. §3.4 resolves this: cache in the *browser's* cache, not in the repository. A service-worker cache holds content the browser fetched at runtime, which is what an HTTP cache already does; nothing is redistributed and nothing enters the repo or the deployment. That resolution is what makes the rest of the offline design legal.

---

## 2. High-Level Design

```
                    ┌──────────────────────────────────────┐
                    │  index.html   shell · nav · a11y      │
                    └───────────────────┬──────────────────┘
                                        │
                    ┌───────────────────▼──────────────────┐
                    │  main.js   composition root           │
                    │  ┌──────────────┬──────────────────┐  │
                    │  │  session     │  settings +      │  │
                    │  │  controller  │  view router     │  │
                    │  └──────┬───────┴────────┬─────────┘  │
                    └─────────┼────────────────┼────────────┘
                              │                │
              ┌───────────────▼──────┐   ┌─────▼─────────────┐
              │  skill registry      │   │  views            │
              │  (skills are DATA)   │   │  pokedex · parent │
              └───────────┬──────────┘   └───────────────────┘
                          │  round spec
        ┌─────────────────▼──────────────────────────────┐
        │  engines/          choose  build  sort  trace  procedure
        │  primitives/       tenframe  numberline  grid  clock ...
        └─────────────────┬──────────────────────────────┘
                          │
        ┌─────────────────▼──────────────────────────────┐
        │  core/                                          │
        │   select    rules     progress    storage       │
        │   audio     content   (ports, all injectable)   │
        └─────────────────┬──────────────────────────────┘
                          │
        ┌─────────────────▼──────────────────────────────┐
        │  data/   roster · graphemes · reading/ · math/ · books/
        └─────────────────────────────────────────────────┘

   external:   PokéAPI (JSON + artwork)      Google Fonts
               ── both behind core/content, both cached by the service worker
```

Four boundaries do the work. Three of them already exist in some form.

**Existing and healthy:** `core/select.js` and `core/progress.js` take their randomness and their storage as injected arguments. That is why they have twelve real tests. Every new port below copies that shape deliberately.

**The one structural change: a skill is data, not a file.**

Today a playable skill is a hand-written module (`src/modes/letters.js`, `src/modes/words.js`) and `CLAUDE.md` describes exactly that: "one file per playable mode". At two skills this is the right call — it is obvious, greppable, and nothing is hidden. At the ~100 skills `PLAN.md` implies it is 100 files that each re-derive item lists, distractor rules and reveal markup, and every learning-rule change becomes a 100-file edit.

The proposal is not to replace those files today. It is to move, at the third Choose-based skill, to:

```js
// data/skills/reading.js  — a skill descriptor
{
  id: 'reading.beginning-sound',
  engine: 'choose',
  kind: 'beginning-sound',
  items: { from: 'words', tier: 'current' },
  prompt: { say: 'word' },              // audio spec, resolved by core/audio
  options: { count: 3, from: 'graphemes', rule: 'initial-of-item' },
  constraints: ['no-c-k-together'],
  reveal: { style: 'anchor' }
}
```

and one engine contract:

```js
// every engine implements exactly this
engine.play({ round, host }) -> Promise<Outcome>

round   = { promptSpec, options | targets | strokes, answerId, revealSpec, meta }
Outcome = { itemId, kind, correct: boolean, attempts: number }
host    = { elements, audio, content, isCurrentRound }
```

The session controller then never learns what a skill is about. It picks a skill, asks the registry for a round, hands it to an engine, records the `Outcome`, advances. Adding "middle sound" or "compare two groups" becomes a descriptor plus a dataset — not a module.

**Second change: learning rules become named, testable functions.**

`CLAUDE.md`'s twelve rules are pedagogy, and four of them are currently enforced inline inside a mode — the C/K guard is an object literal at `letters.js:71`, minimal-pair ranking is a sort comparator at `words.js:36-49`. Neither has a test. Moving them to `core/rules.js` as pure functions over a candidate option set:

```js
rules.noCKTogether(options, answer)        -> options
rules.minimalPairs(candidates, answer, 2)  -> options
rules.noMirrorPairs(options, answer, unlocks)
rules.sightWordDistractorsOnly(candidates)
```

makes them unit-testable against `CLAUDE.md` line by line, and makes them reusable by every engine rather than by the one mode that happens to contain them. **This is the change that turns the learning rules from documentation into something CI can hold you to.**

---

## 3. Deep Dive

### 3.1 Data model

Current schema (v1) per item:

```js
{ id, kind, seen, correct, streak, lastSeen, mastered: boolean }
```

Proposed schema v2:

```js
{
  version: 2,
  learner:    { id: 'brody' },
  items: {
    'reading.letter-sound:S': {
      id, strand: 'reading', kind: 'letter-sound',
      seen, correct, streak, bestStreak,
      firstSeen, lastSeen,
      masteredAt: '2026-09-04T…' | null,
      lapses: 0
    }
  },
  events:     [ { t, itemId, skillId, correct, attempts } ],   // append-only, capped
  collection: { [slug]: { count, firstCaught, lastCaught } },
  sessions:   [ { startedAt, completedAt, correct, skillIds } ],
  unlocks:    { [setId]: 'locked' | 'recommended' | 'open' },
  settings:   { … }
}
```

Four deliberate changes:

1. **`mastered: boolean` → `masteredAt: timestamp | null` plus `lapses`.** Today `progress.js:68` reads `mastered: streak >= 2 || previous.mastered` — once true, never false. A forgotten item stays inside the 20 %-capped retention pool and is therefore practised *less* exactly when it needs practice more. Mastery becomes derived: `isMastered = masteredAt !== null && lapses < 2`, with `lapses` incremented on a miss after mastery. Rule 2 still holds — the demotion is invisible to him; it only changes what the selector offers.
2. **`events` as an append-only, capped log.** The parent view's seven-day activity is currently reconstructed from `sessions` only. A bounded ring (last ~2 000 events, ≈ 200 KB) gives real per-day and per-skill history, and it is the shape the D-008 draft's Option C describes if an evidence log is ever needed. Capped so it cannot grow into the storage ceiling.
3. **Strand-prefixed item ids** — `reading.letter-sound:S`, `math.count:5`. The current `kind:key` scheme does not collide, but it has no strand segment, so a parent view that wants "reading vs maths" has to consult a lookup table. Adding the prefix costs nothing now and costs a migration later.
4. **`unlocks` as explicit state.** Today unlock status is recomputed on every settings render and surfaces only as a `title` tooltip (`main.js:192-197`). Making it state lets the UI show a recommendation, and keeps `CLAUDE.md`'s "the unlock is a default, not a lock" — the grown-up override just writes `'open'`.

**Migration is not optional, and it is a live hazard.** `progress.js:16` reads:

```js
if (!candidate || candidate.version !== SCHEMA_VERSION) return emptyProgress()
```

Bumping `SCHEMA_VERSION` to 2 without a migration **silently deletes Brody's progress on next load** — no error, no prompt, an empty Pokédex. The v2 work must land as: `migrate(state)` with a v1→v2 case (`mastered: true` → `masteredAt: lastSeen`, `lapses: 0`, ids re-prefixed), a test that runs a real v1 export through it, and an automatic pre-migration export written to the grown-up panel before anything is written back.

### 3.2 Storage

| Option | Durability | Cost | Verdict |
|---|---|---|---|
| `localStorage` (today) | Evictable under storage pressure; cleared by "clear site data"; ~5 MB origin quota | Zero | Fine for size (5 000 items ≈ 600 KB), weak on N4 |
| IndexedDB + `navigator.storage.persist()` | Survives eviction pressure once granted; same origin-local privacy | Small — async API, one wrapper | **Recommended** |
| Any server-side sync | Strong | Violates N5 and N6 | Rejected |

`progress.js` already takes `storage` as an injected parameter and its tests use an in-memory stub — the seam exists. Swap the implementation behind `core/storage.js` in the **same** change as the v2 migration, so there is one migration event rather than two. Keep JSON export/import as the user-visible backup, and add a "last exported N days ago" nudge in the grown-up panel; an unbacked-up store is the one failure mode with no technical mitigation.

### 3.3 Selection and scheduling

Keep `chooseAdaptive` — weight ∝ 1/(streak+1), fixed ~20 % mastered share — it is tested against 10 000 draws and it satisfies `CLAUDE.md` rule 10. Two additions once items number in the thousands:

- **Scope before you weight.** Selection must run over the *active tier's* items, not all 5 000. The skill descriptor's `items: { from, tier }` is what bounds the pool.
- **Spacing, not just weighting.** Add a "not seen in the last N rounds" filter so the same item cannot appear twice in a six-round session by chance. Cheap, and it removes the most visible randomness artefact for a child.

Not recommended: a full SM-2/Leitner scheduler. Interval-based review assumes daily sessions and a learner who tolerates being tested on old material. For a five-year-old on an irregular schedule, streak-weighted selection with a retention share is closer to right and far easier to reason about.

### 3.4 Content layer, offline and the IP boundary

```
core/content.js

  getAnchor(slug)
      ├─ 1. in-memory Map           (exists today, caches the promise — correct)
      ├─ 2. Cache Storage           (service worker, artwork + JSON)
      ├─ 3. network                 (PokéAPI)
      └─ 4. degrade                 (silhouette placeholder, round still playable)
```

Service worker plan:

- **Precache** the app shell: `index.html`, `styles.css`, all `src/**`, all `data/**`, the background image. Versioned cache name (`letter-dex-shell-v{n}`), no `skipWaiting` — a new version activates on the next full load, so a mid-session swap can never happen.
- **Runtime cache** PokéAPI JSON: stale-while-revalidate, no expiry (a Pokémon's height does not change).
- **Runtime cache** artwork: cache-first, LRU-capped at ~60 entries (~10 MB).
- **Update signal:** a single line in the grown-up panel — "A new version is ready, reload to use it." No auto-reload, ever, mid-round.

Why this is inside N7: the service worker stores what the browser already fetched, in the browser's own cache, on one private device. Nothing is added to the repository, the git history, or the deployed bundle. It is the same class of storage as the HTTP cache the browser maintains regardless.

**Independently of caching, take the fetch off the critical path.** Today the letters round awaits the anchor before rendering any options, so a failed fetch produces a round with no options and a sentence a non-reader cannot act on. The Pokémon is the *reward*, not the question — the round should build from local data, render immediately, and let the artwork arrive late or not at all. That single change fixes the offline dead-end, removes the network round-trip from N2's latency budget, and is smaller than the service worker.

### 3.5 Audio layer

```
core/audio.js

  say({ kind: 'sound', key: 's' })
      ├─ manifest lookup → data/audio-manifest.json → play <audio>
      └─ miss → speechSynthesis(fallbackText)
```

`PLAN.md` §Recording plan already specifies the clip inventory and per-clip fallback. Building the port **now**, while there are two skills, means Phase 3 is a data drop — record 25 files, add 25 manifest entries — instead of a refactor that touches every mode written between now and then. Cost today: about thirty lines and one indirection. Cost of deferring: every mode written in the meantime calls `speak()` directly and has to be rewritten.

This also carries the largest pedagogical debt in the system. `speechSynthesis` cannot say /b/ without a schwa, so `data/roster.js` encodes the compromise directly (`B: 'buh'`, `P: 'puh'`) — the exact habit `CLAUDE.md` rule 3 exists to prevent. Every day on synthetic speech is a day of teaching /buh/.

### 3.6 External contracts

There is no Letter Dex API. The only external contract is PokéAPI:

| Endpoint | Fields relied on | Needed by |
|---|---|---|
| `GET /api/v2/pokemon/{slug}` | `sprites.other['official-artwork'].front_default`, `height`, `weight`, `types[].type.name` | letters, words, Pokédex (built) |
| `GET /api/v2/pokemon-species/{slug}` | `color`, `shape` | Sort engine, Phase 1d (not built) |

`scripts/verify-roster.js` already checks that all 25 slugs resolve and have artwork — re-verified live on 4 Sep, 25/25. It does **not** assert the shape of the other fields. Extend it to assert every field in the table above, so an upstream change is caught by a manual command rather than by a child staring at a broken screen. Rate discipline stays as it is: one request per resource per session, cached, 80 ms spacing in the verifier.

### 3.7 Error handling

| Failure | Today | Design |
|---|---|---|
| PokéAPI unreachable | Letters round dead-ends with an error string, 0 options | Round renders from local data; artwork degrades to silhouette; retry once in the background |
| Artwork 404 | `img` renders broken | `onerror` → silhouette placeholder |
| `speechSynthesis` absent | Silent no-op (`speech.js:2`) | Same, plus a visible text prompt so the round is still answerable |
| Storage write fails (quota, private mode) | `saveProgress` returns `false`, **ignored by every caller** | Surface once in the grown-up panel: "Progress is not being saved on this device" |
| Stale round paints over a new one | Guarded in letters (`isCurrentRound`), **not** in words — which receives the guard at `main.js:132` and never uses it | Move the guard into the engine contract so no engine can forget it |
| Corrupt import file | `importProgress` throws, message shown | Keep; add a pre-import auto-export |

---

## 4. Scale and Reliability

### 4.1 Load estimation

The only number that matters is content volume.

| Axis | Now | Projected end state |
|---|---|---|
| Skills | 2 | ~100 (5 engines × 2 subjects × 7 tiers) |
| Items | 25 letters + 89 words = **114** | ~1 500 reading + ~3 500 maths ≈ **5 000** |
| Progress record | ~120 B/item → ~14 KB | ~600 KB |
| Events log (capped 2 000) | — | ~200 KB |
| Total client storage | ~15 KB | **~800 KB** against a ~5 MB quota |
| Requests per session | ≤ 8 PokéAPI + shell | Same — the roster does not grow with content |

Storage is not the risk at that size; the *uncapped* event log would have been, which is why it is capped by design. Rendering is: the grown-up view rebuilds its entire per-item grid via `innerHTML` on **every answer** (`main.js:59-62`), so it is O(items) per round — 114 nodes today, 5 000 later, behind a closed `<details>`. Render it on open, not on write.

### 4.2 Reliability

Horizontal scaling, failover, redundancy and load balancing have no place in this system and adding them would be a mistake. With one user and a static host, reliability means exactly four things:

1. **The round survives a bad network** — §3.4.
2. **The progress survives the browser** — §3.2, plus export discipline.
3. **A schema change survives the data** — §3.1 migration, which is currently a silent-wipe hazard.
4. **A learning rule survives a refactor** — §2 rules module plus tests, because today the four runtime rules are untested.

### 4.3 Monitoring

There is no telemetry and there should be none — N6 forbids it and one user does not generate a signal worth collecting. **The grown-up view is the monitoring system.** What it lacks is an error surface: a single line that says when saving failed, when the last export was, and when content could not be fetched. Three sentences of UI replace an entire observability stack here.

---

## 5. Trade-off Analysis

| # | Decision | Chosen | Alternative | Trade-off |
|---|---|---|---|---|
| 1 | Framework | **None** (hold `CLAUDE.md`) | React/Svelte | Keeps the stack learnable and dependency-free, which matters more than ergonomics for a solo part-time build. Cost: no component model, so the skill registry has to carry the abstraction a framework would have supplied. Accepted deliberately |
| 2 | Skill representation | **Data descriptors + engine contract**, adopted at the third Choose skill | One file per mode forever | File-per-mode is more readable at 2 skills and unmaintainable at 100. Introducing the registry too early is worse than too late — it is abstraction over one example. Threshold: the third Choose-based skill |
| 3 | Offline | **Service worker cache** | Bundle sprites (violates N7); accept online-only (violates N3) | Resolves the central tension. Cost: a service worker is the most complex thing in this proposal and the classic source of stale-shell bugs. Mitigated by versioned caches and no `skipWaiting` |
| 4 | Storage | **IndexedDB + persist()**, behind the existing port | Stay on `localStorage` | Buys durability against eviction for one wrapper's worth of code. Cost: async API touches every caller — which is why it should ride along with the v2 migration rather than land separately |
| 5 | Mastery | **Decays after lapses** | Permanent (today) | Pedagogically honest: a forgotten item should come back. Cost: more state, and it must stay invisible to him per rule 2 |
| 6 | Scheduling | **Streak weighting + spacing filter** | SM-2 / Leitner intervals | Interval systems assume regular sessions and a learner who tolerates review. Neither holds. Cost: less optimal long-term retention, which recorded audio and book unlocks will matter more for anyway |
| 7 | Repos | **Two, no shared code or store** (D-008 Option D) | Converge onto one | Already drafted and already acted on in `PLAN.md`. Design consequence: no shared package, no shared progress schema, and the curriculum contract governs AR/PW only |
| 8 | `file://` support | **Amend the constraint** | Engineer around ESM CORS | ES modules cannot load from `file://` — reproduced in Chromium at `e4b0f67` — and a service worker cannot run there either. The requirement behind the rule was "works without a deploy"; `npm start` plus an offline-capable deploy satisfies that better. This needs Jenna's call, since it edits `CLAUDE.md` |
| 9 | Build step | **Still none** | Bundler for the growing module count | ~100 skill descriptors are data, not modules; HTTP/2 handles the request count. Revisit only if first-paint on the tablet measurably suffers |

---

## 6. Sequenced Adoption

Nothing here is approved. Ordering reflects dependency and risk, not eagerness.

| Order | Work | Depends on | Effort |
|---|---|---|---|
| 0 | Close Phase 0: session restart, private deploy, non-colour feedback | — | Small |
| 1 | Take the PokéAPI fetch off the round's critical path | 0 | Small |
| 2 | `core/audio.js` port + manifest (empty manifest, all fallback) | — | Small |
| 3 | Schema v2 + migration + IndexedDB, one change, with a pre-migration export | 0 | Medium |
| 4 | `core/rules.js` + tests for the four runtime learning rules | — | Medium |
| 5 | Service worker: shell precache, then runtime caches | 1, deploy | Medium |
| 6 | Skill registry + engine contract, retrofitting the two existing modes | 4 | Medium |
| 7 | Build engine (segmenting, add-a-sound, number sequence) | 6 | Large |
| 8 | Sprite grid + ten frame primitives; maths datasets | 6, 7 | Large |
| 9 | Recorded audio drop | 2 | Medium (mostly recording) |

Items 1–5 are all independently useful even if the registry (6) is never built. That is intentional — none of them is a bet on the rest of the design.

---

## 7. What I Would Revisit

- **A second learner.** `learner.id` exists in the v2 schema as a namespace hook so this is a storage-key change, not a schema change. Revisit if it ever becomes real; do not build multi-profile UI on spec.
- **Books.** A decodable book is not a round — no answer, no item, no outcome. The session controller needs a non-round activity slot before Phase 3, and that is a genuine addition to the engine contract, not a variation on it.
- **Public release.** Would invalidate N7's current resolution entirely: PokéAPI artwork would have to be replaced by original art. Keeping every anchor lookup behind `core/content.js` means that is a swap of one module rather than a rewrite. That is the main reason the port is worth having.
- **Trace and Procedure engines.** Both break the `{options, answerId}` round shape — one takes a stroke path, one takes a sequence of intermediate states. The engine contract in §2 should be validated against a paper sketch of Trace *before* the registry is built, or it will be designed around Choose and Build only.
- **Bundling.** Revisit if measured first paint on the target tablet regresses. Not before, and not on principle.
- **The 2.4 MB background.** It is 94 % of the repository. Compressing it is the cheapest performance work available and does not need any of this design.

---

## 8. Open Questions for Jenna

1. **`file://`** — amend the `CLAUDE.md` constraint to "runs from `npm start` and works offline after first load", or keep it and drop service workers? (§5 row 8.) This one gates the offline design.
2. **Mastery decay** — should a mastered item be demoted after misses, or stay mastered forever? Pedagogy call, not a technical one.
3. **Skill registry threshold** — adopt at the third Choose skill, or write beginning/ending/middle-sound as three more mode files first and convert later?
4. **Letterforms** (`PLAN.md` open question 3, still open) — unrelated to this design, but it gets more expensive with every screen added.

---

*Design document, `e4b0f67` baseline. No code was changed. Every claim about current behaviour was verified by running the repository on 4 Sep 2026; every claim about future behaviour is a proposal.*
