# Brody Projects — Addendum: the three connected repositories

**Prepared:** 4 Sep 2026, after `letter-dex`, `foundational-literacy-curriculum`, and `foundational-literacy-game` were connected from the machine `codeherway`.
**Relationship to the earlier report:** this supersedes the "inspection limits" section of *Letter Dex — Current Project State Report* and corrects two things in it. Everything else in that report still stands; all 12 tests still pass against the local working tree.

**How each claim was checked:** Git state, file contents, and diffs read directly on your machine. The Phaser project's install, tests, typecheck, build, and browser run were executed on a clean copy in the cloud container, because the `node_modules` on your machine is a Windows install and cannot execute through the Linux bridge. Nothing was modified in any of the three folders.

---

## 1. Corrections to the earlier report

**1.1 The repository I analysed is not the only remote.** Your local `letter-dex` folder tracks `github.com/itcodegirl/letter-dex.git`. You gave me `github.com/itcodegirl/letter-brody.git`. Both clone cleanly and both contain the *same three commits* — `7617117`, `e311d5b`, `1301890` — so the code analysis is unaffected. But two remotes now hold the same history under different names, and only one can be canonical. **Fact:** local `origin` = `letter-dex`. **Recommendation:** decide which one is real and delete or archive the other before either accumulates commits the other lacks.

**1.2 There is substantial uncommitted work.** The earlier report said the working tree was invisible to me. It is not empty. On branch `phase0/runtime`, 6 tracked files are modified and 4 paths are untracked. Details in §2.

**1.3 What that WIP already fixes.** Report finding #6 — "letters mode offers no way to hear anything before answering" — **is fixed** in your uncommitted work. A Listen button now sits on the encounter and speaks `ROSTER[letter].sound`, and the Pokémon renders as a silhouette until the answer is right. My earlier finding described the committed branch, which is still accurate for what is pushed.

---

## 2. `letter-dex` — uncommitted work in detail

Branch `phase0/runtime`, 240 insertions / 695 deletions across 6 files, plus 4 untracked paths. Nothing staged, no stashes. This is a campsite visual redesign plus two behaviour changes.

| File | Change | Assessment |
|---|---|---|
| `styles.css` | Full restyle: campsite background image, cream/ink palette, trail-map progress. 803 lines changed, net −695 | Substantially tighter than the old sheet |
| `index.html` | Camp header replaces the Pokédex lid/lamps; Material Symbols icon font added; `#meter` becomes a container for 8 trail steps; `aria-busy` on the stage; shell gets `data-active-mode` | The `data-active-mode` rename fixes a real event-bubbling bug your own QA doc records as P1 |
| `src/modes/letters.js` | Mystery-silhouette encounter, a repeatable **Listen** button speaking the letter sound, reveal-on-correct, `isCurrentRound()` guard so a slow PokéAPI response can't paint over a newer round, softer retry copy | The strongest change in the set. The stale-round guard is a real bug fix, not polish |
| `src/main.js` | `roundSequence` counter feeding that guard; trail-step meter; only *earned* badges render | Sound |
| `src/modes/words.js` | Inline SVG speaker icon replaced by a Material Symbols glyph | **Regression risk — see below** |
| `scripts/serve.js` | `.png` MIME type added | Needed by the new background |

**Untracked paths**

- `assets/camp/campsite-background.png` — referenced by `styles.css:34`. The redesign does not render without it.
- `design-qa.md` (63 lines) — a visual-QA record comparing the implementation to a Codex-generated design PNG. Concludes "final result: passed".
- `PLAN1.md` (228 lines) — **a superseded 1 Sep copy of `PLAN.md`.** It says "plan mode, nothing builds until Jenna approves", puts recorded audio in phase 2 rather than phase 3, and says "Deploy to Vercel" where the tracked plan says deploy *privately*. Two plan files with different phase numbering in one working tree is exactly how a future session follows the wrong one.
- `CHAT-ARTIFACT-INVENTORY.md` (80 lines) — this is the **curriculum repository's** `docs/CHAT-ARTIFACT-INVENTORY.md`, sitting in the game repo. It describes `research/`, `docs/DECISIONS.md`, and curriculum chats — none of which exist here.

**Findings**

| Severity | Finding | Evidence |
|---|---|---|
| **High** | Report finding #3 survives the redesign, despite `design-qa.md` claiming otherwise. `styles.css:77` is `.key.wrong { animation: gentle-nudge 320ms ease; }` — motion only — and `styles.css:168` forces `animation-duration: .01ms !important` under `prefers-reduced-motion`. `.key.right` (line 76) is colour only. `design-qa.md` asserts choices "retain shape feedback independent of color"; the CSS does not implement that | `styles.css:76-79, 167-169` |
| **High** | The Critical session-restart defect is **not** fixed. `sessionEnded` is still never cleared; no "Play again" control was added | `src/main.js` diff |
| **Medium** | Words mode's Listen icon now depends on a second Google Fonts request (Material Symbols). If that font is blocked or the device is offline, the button renders the literal text `volume_up`. The inline SVG it replaced had no such dependency | `src/modes/words.js` diff, `index.html:13` |
| **Medium** | All of this is uncommitted and unpushed — a day of design work living on one laptop with no backup | `git status` |
| **Low** | `playRound('completed answer')` and three similar calls pass an argument `function playRound()` does not accept | `src/main.js` diff |
| **Low** | Per your own `CLAUDE.md` ("one phase or sub-phase per PR"), a visual redesign layered directly onto the unmerged Phase 0 PR branch mixes two reviews into one | working agreement vs. branch state |

**Verified:** `node --test` in the working tree → **12/12 pass**. So the WIP breaks nothing that is tested.

---

## 3. `foundational-literacy-curriculum` — documentation repository

- Remote `github.com/itcodegirl/foundational-literacy-curriculum.git`. `main` at `43c9731` (merge of PR #1 from `codex/complete-foundational-literacy-v1`), 3 commits, local `main` in sync with `origin/main`.
- 19 markdown artifacts across `research/`, `research/completed/`, `research/prompts/`, `curriculum/` (alphabet-recognition, pre-writing, developmental-progression, lesson-design), `assessments/`, `design/game-mapping/`, `docs/`.
- **`git status` shows all 19 files modified — this is line-endings only.** `git diff --ignore-cr-at-eol` is empty; the content is identical to `HEAD`. The files were rewritten with CRLF on Windows.
- **Recommendation (Small):** add a `.gitattributes` with `* text=auto eol=lf` and re-normalise once. Otherwise every session opens on a repo that looks like it has 5,000 changed lines, and a real edit will be invisible inside that noise. This is the single highest-value five-minute fix across all three repos.
- Content status per its own docs: research reconciliation, developmental progression, both strand specs, assessment spec, lesson framework, and game mapping v1 are all marked complete/approved. Open items are recorded honestly inside them (mastery thresholds are piloting defaults per D-005, several claims flagged as needing primary-source verification, cross-case matching unresolved).
- The three `research/prompts/*.md` files a previous inventory called missing **do exist** in the repo.

---

## 4. `foundational-literacy-game` — the second game

This is a separate, working browser game I had not seen before. It is not a plan; it runs.

- Remote `github.com/itcodegirl/foundational-literacy-game.git`. `main` at `f4cc206` (merge of PR #1 from `codex/ar-001-letterlight-grove`), 3 commits, in sync. Working tree diffs are **CRLF-only** here too.
- **Stack:** TypeScript ~6.0, Vite ^8.2, Vitest ^4.1, Phaser ^4.2. Strict-ish tsconfig (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `noEmit`). `package-lock.json` present.
- **What it is:** "Letterlight Grove", a vertical slice of curriculum competency **AR-001** — given a letter *name*, pick the matching uppercase letter. One supported practice round, then three independent probes, then either completion or a supportive review. Content is three hard-coded letters (M, S, A) in `src/core/content.ts`, explicitly labelled "a small prototype sample, not a universal instructional sequence".
- **Architecture:** `src/core/` is framework-free and testable (`learning-session.ts`, `evidence.ts`, `content.ts`, `reward-store.ts`, `types.ts`); `src/game/` is Phaser presentation; `src/ui/` builds the DOM shell. The Phaser canvas is `aria-hidden="true"` and every interaction also exists as a real DOM button — the game layer is decorative, the DOM is the product.

**Verification (run on a clean copy in the cloud container)**

| Check | Command | Result | Evidence |
|---|---|---|---|
| Install | `npm ci` | **Pass** | From the committed lockfile |
| Tests | `npx vitest run` | **Pass — 5/5** | 1 file, 368 ms |
| Type check | `npx tsc --noEmit` | **Pass** | Exit 0 (also passes on your machine) |
| Build | `npx vite build` | **Pass** | `dist/assets/index-*.js` **1,390.91 kB** (gzip 363.37 kB) — over Vite's 500 kB chunk warning; that is Phaser |
| Runtime smoke | headless Chromium on the built bundle | **Pass** | Full flow: practice → 3 probes → "Grove restored"; 3 observations listed; "No mastery decision" held throughout; 1 grove light awarded; **zero console errors** |
| Persistence | reload after completing | **FAIL — nothing persists** | `localStorage` is empty; after reload the phase resets to "Listen & look", observations 0, lights 0 |
| Tests on your machine | `npx vitest run` in the folder | **Could not run** | `node_modules` is a Windows install (`@rolldown/binding-win32-x64-msvc`, `lightningcss-win32-x64-msvc`). Run it in PowerShell, not through this bridge |

**Findings**

| Severity | Finding | Evidence | Impact |
|---|---|---|---|
| **High** | No persistence of any kind. Evidence observations and rewards live in instance memory only | verified reload; no storage code in `src/core/` | An evidence-collecting product that forgets every observation cannot support the curriculum's own mastery-review rules. This is the gap that decides whether the slice becomes a product |
| **Medium** | Observation ids come from a module-level counter in `evidence.ts` that resets each page load | `src/core/evidence.ts:3` | Harmless today; guarantees id collisions the moment persistence lands |
| **Medium** | 1.39 MB of JavaScript for a three-letter round, entirely Phaser, whose canvas is `aria-hidden` and carries no required interaction | build output, `src/ui/app-shell.ts` | Worth asking what Phaser is buying before the next slice |
| **Low** | The global `keydown` handler returns early when focus is on a button, so after clicking a choice, Enter re-activates that button instead of confirming | `src/main.ts:127-140` | Keyboard path works via number keys; the Enter shortcut is inconsistent |
| **Low** | `restartButton` calls `window.location.reload()` rather than resetting session state | `src/main.ts:114` | Fine while nothing persists; becomes wrong when it does |

**What it does well, verifiably:** it honours the curriculum boundaries its `AGENTS.md` sets. Supported practice creates no observation (tested). Only *confirmed* independent choices create one (tested). Rewards are a separate module that never reads evidence (tested). The adult panel never renders a mastery claim — it holds "No mastery decision" across the whole run. That is exactly D-006 and D-007 implemented, not just described.

---

## 5. The picture across all three

You have **two working game implementations of overlapping skills for the same child**, sharing no code, no data, no progress store, and no competency vocabulary.

| | `letter-dex` | `foundational-literacy-game` |
|---|---|---|
| Skill | Letter **sounds** → letter; decodable word reading | Letter **names** → uppercase letter (AR-001) |
| Content | 25 letters, 89 words, 6 tiers | 3 letters, 1 round type |
| Stack | Vanilla JS, no deps, no build | TypeScript, Phaser, Vite, Vitest |
| Progress | `localStorage`, versioned, export/import, adaptive selection | None — in memory only |
| Learning model | `{seen, correct, streak, mastered}` per item; mastery at streak ≥ 2 | Evidence observations with provenance; mastery decisions explicitly withheld |
| Theme | Pokémon via PokéAPI | Original grove, no third-party IP |
| Status | Phase 0 complete on an unmerged branch + uncommitted redesign | One slice merged to `main`, runs, no persistence |
| Health | 🟡 Yellow | 🟡 Yellow |

**The unresolved decision, stated plainly:** the curriculum repo's `design/game-mapping/foundational-literacy-game-mapping-v1.md` says it "does not authorize use of Pokémon names, characters, artwork, music, trade dress", and D-007 requires curriculum evidence to stay separate from game state. `letter-dex` is built on Pokémon anchors and stores learning and game progress in one record. `foundational-literacy-game` satisfies the curriculum contract and has almost no content. Neither is wrong; they answer different questions. But nothing in any of the three repos says which one Brody actually uses, or whether the other is a reference implementation, and that ambiguity is now costing you two codebases' worth of maintenance.

---

## 6. Recommended next steps, revised

**Next session**

1. **Commit the `letter-dex` redesign** to a branch off `phase0/runtime` and push it. It is unbacked-up work. (Small) — decide first whether `PLAN1.md` and the stray `CHAT-ARTIFACT-INVENTORY.md` go in the commit; my recommendation is to delete `PLAN1.md` and move the inventory copy back to the curriculum repo.
2. **Add `.gitattributes` (`* text=auto eol=lf`) to both `foundational-literacy-*` repos and re-normalise.** (Small) Stops 19 and 16 phantom-modified files respectively.
3. **Fix the session-restart defect** in `letter-dex` — still the one thing blocking unattended use. (Small)
4. **Give wrong answers a shape signal** in the new `letter-dex` CSS, and correct `design-qa.md`, which currently claims a property the stylesheet does not have. (Small)

**Next milestone**

5. **Write the convergence decision** — one page, in `docs/DECISIONS.md` in the curriculum repo, naming which game ships, what the other is for, and how (or whether) `letter-dex`'s item records map to AR-001-style observations. Everything else in both games' roadmaps depends on this answer. (Medium, mostly thinking)
6. **Persistence in `foundational-literacy-game`**, if it is the one that continues — versioned storage, stable observation ids, and an export path the assessment spec can consume. (Medium)
7. **Merge and deploy Phase 0 of `letter-dex`**, per the earlier report's §9 items 5–7, if that is the one that continues.

**Note on canonical remotes:** resolve `letter-dex` vs `letter-brody` before item 1, or the redesign lands on whichever remote you happen to push to.
