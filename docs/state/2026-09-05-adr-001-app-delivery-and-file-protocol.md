# ADR-001: Application delivery and the `file://` requirement

**Status:** Proposed
**Date:** 5 September 2026
**Deciders:** Jenna — this edits `CLAUDE.md`, which is the tiebreaker document
**Baseline:** `main` at `e4b0f67`

---

## Context

`CLAUDE.md` §Tech constraints says:

> Static site. Deploys as-is to Vercel. `index.html` at the root must work from `file://`.

**It does not work from `file://`, and has not since 2 September.** Reproduced in Chromium 141 at `e4b0f67`:

```
Access to script at 'file:///…/src/main.js' from origin 'null'
has been blocked by CORS policy: Cross origin requests are only
supported for protocol schemes: chrome, chrome-untrusted, data, http, https.
```

The page loads, styles apply, and then stops at "Loading…" with zero interactive elements.

The cause is Phase 0 itself. Commit `1301890` ("port Letter Dex into Phase 0 modules") converted the original single `letter-dex.html` into ES modules, which is exactly what `PLAN.md` Phase 0 asked for and what was approved. ES modules are fetched under CORS rules; `file://` pages have an opaque origin (`null`) that no CORS policy can satisfy. So the approved work and the written constraint have been in conflict for three days, and nothing surfaced it because nothing tests it.

Three further facts, measured today rather than assumed:

| Behaviour from `file://` | Result |
|---|---|
| `<script type="module" src>` | **Blocked** (CORS, origin `null`) |
| `<script src>` (classic, non-module) | **Works** — both files executed, globals set |
| `<link rel="stylesheet">` | **Works** — computed background applied |
| `fetch('./local-file')` | **Blocked** — `Failed to fetch` |
| `fetch('https://pokeapi.co/…')` | **Not verified** — no egress to PokéAPI from the test browser. PokéAPI sends `Access-Control-Allow-Origin: *`, which does match a `null` origin, so it *probably* works — but this is an inference, not a measurement |

And the forcing constraint: the offline capability proposed in the system design (works on the tablet after first load) needs a **service worker**, and service workers require a secure context. `file://` is not one. **`file://` support and offline support are mutually exclusive at the mechanism level.** This is not a preference — it is why this decision gates the caching work.

**What the constraint was probably for** — inference, and Jenna is the authority on it. Its neighbours in `CLAUDE.md` are "Static site. Deploys as-is to Vercel," which reads as *no build step, no server dependency, it's just files*. A second plausible motive is a fallback: if the deploy is down or unpaid, Brody can still play. Both motives are worth honouring; the question is whether `file://` is the right way to honour them.

---

## Decision

Amend the `CLAUDE.md` constraint to:

> Static site, no build step. Runs from any static file server — `npm start` locally, a private static deploy remotely. Works offline after first load. `file://` is not supported.

and drop the `file://` requirement.

---

## Options Considered

### Option A: Amend the constraint (recommended)

| Dimension | Assessment |
|---|---|
| Complexity | **Low** — one line in `CLAUDE.md`, one line in `README.md` |
| Cost | Effectively zero; nothing in the code changes |
| Fit at ~100 skills | **Good** — no ceiling introduced |
| Team familiarity | High — `npm start` is already the documented workflow |

**Pros**
- Unblocks the service worker, and with it the offline requirement that actually matters on the tablet.
- Keeps ES modules, which keeps `node:test` able to import `data/` and `src/core/` directly — the twelve passing tests exist *because* of ESM.
- Keeps Phase 0's approved deliverable intact.
- One artifact. Nothing to keep in sync.
- Honours the real intent (no build step, just files) — a static server is still just files.

**Cons**
- You cannot double-click `index.html` to look at the app. You need `npm start` or the deploy.
- Any machine used to develop needs Node. (It already does — `npm test` is required before every PR.)
- The very first load on a new device needs a network connection.

---

### Option B: Restore `file://` by reverting to classic scripts and globals

Drop `type="module"`, drop `import`/`export`, hang everything off a namespace object. Verified above: classic scripts do execute from `file://`.

| Dimension | Assessment |
|---|---|
| Complexity | **High** — rewrites every file in `src/` and `data/` |
| Cost | High, and paid twice — once now, once again if ESM ever returns |
| Fit at ~100 skills | **Poor** — a global namespace with ~100 skill descriptors and 5 engines has no module boundaries at all |
| Team familiarity | Mixed — globals are simpler to read, harder to reason about at scale |

**Pros**
- Genuinely restores `file://` for the app shell, measured, not guessed.
- No build step, consistent with "just files".

**Cons**
- **It breaks the test suite.** `node:test` imports `../data/roster.js` and `../src/core/progress.js` as ES modules. Without ESM those twelve tests need a shim or a rewrite — sacrificing the strongest asset in the repository to satisfy a line of documentation.
- **It breaks a different `CLAUDE.md` constraint** — "Vanilla JS, **ES modules**, no framework". It fixes one rule by violating another.
- **It still doesn't give offline** — no service worker, and `fetch()` of a local file is blocked, so `roster-status.json` and the planned `audio-manifest.json` would have to become `.js` files.
- It reverses Phase 0's approved port back toward the single-file original.

---

### Option C: Restore `file://` with a generated single-file build

Keep the modular source; add a script that inlines all JS, CSS and the background into one `letter-dex.html`.

| Dimension | Assessment |
|---|---|
| Complexity | **Medium** — the inliner is maybe 60 lines, but it is a build step |
| Cost | Ongoing — every change means regenerating, and the generated file must be committed to be useful |
| Fit at ~100 skills | **Poor** — inlining 5 000 items and a 2.4 MB background into one HTML file |
| Team familiarity | Low — hand-rolled bundlers are the least fun code to debug |

**Pros**
- Source stays modular and testable; `file://` works from the artifact.
- Produces a genuinely portable single file you could hand to someone.

**Cons**
- **It is a bundler**, which `CLAUDE.md` forbids — a hand-rolled one with worse ergonomics than the tools it replaces.
- **Two artifacts that must stay in sync.** This repository has already lost to drift twice: `PLAN1.md` sat beside `PLAN.md` with different phase numbering, and `design-qa.md` still asserts shape feedback that `styles.css` does not implement. A generated duplicate of the entire app is a much bigger version of the same failure.
- Still no service worker, still no `fetch()`.

---

### Option D: Do nothing — leave the document and the code in conflict

| Dimension | Assessment |
|---|---|
| Complexity | None |
| Cost | Zero today; compounding later |
| Fit at ~100 skills | N/A |
| Team familiarity | N/A |

**Pros**
- Free. No decision to make.

**Cons**
- A future session — or you, in three weeks — reads `CLAUDE.md`, believes `file://` works, and plans around a capability that does not exist. That is precisely the failure already logged twice in this repository.
- It blocks the offline work indefinitely, because nobody can tell whether the service worker is allowed.
- An authoritative document that is wrong in one place is harder to trust everywhere.

---

## Trade-off Analysis

The framing that decides this is not "modules versus classic scripts". It is **which fallback actually protects a play session.**

`file://` protects against *the deploy being unreachable* — but only on a machine that has the repository checked out, which means the laptop, not the tablet. And what it would deliver there is an app that cannot cache anything and whose PokéAPI access is unverified.

A service worker protects against *the network being unreachable* on the device Brody actually uses, which is the realistic failure: a tablet on home wifi, mid-session. It costs about the same to maintain. Only one of the two helps where the problem occurs.

The second consideration is evidential. `file://` has been broken since 2 September and nobody noticed until it was tested. That is not proof it has no value, but it is real evidence about how much it is used relative to what it costs to restore.

The third is the test suite. Option B trades twelve passing tests — which is most of what makes this repository trustworthy — for a delivery mode nobody has used in three days. That trade is not close.

Options B and C also share a defect that is easy to miss: **neither delivers offline.** They restore a way to *open* the app without a server; they do not make it work without a network, which is the requirement that prompted the question.

---

## Consequences

**What becomes easier**
- The service worker is unblocked, and with it genuine offline play on the tablet.
- `CLAUDE.md` becomes true again, which is the whole point of it being the tiebreaker.
- ES modules, `node:test` without tooling, and the Phase 0 port all stand as approved.
- One artifact, one source of truth, nothing to keep in sync.

**What becomes harder**
- Looking at the app requires `npm start` or the deployed URL. No double-click.
- A new device needs one online session before it can go offline.
- The private Vercel deploy moves from "nice to have" to "the way Brody reaches the app" — which raises the stakes on deployment protection and on remembering to renew it.

**What we will need to revisit**
- If the app is ever handed to someone without Node or a server — a grandparent's laptop, say — Option C returns as a genuine question, and the answer might be a one-off export rather than a standing build step.
- If a public release ever happens, the IP posture changes and the whole content layer is redesigned; this decision is not affected, but the caching one is.
- If the deploy proves unreliable in practice, revisit the fallback question with real evidence rather than a hypothetical.

---

## Action Items

1. [ ] **Jenna decides.** A, B, C or D. Nothing below happens until this is answered.
2. [ ] Edit `CLAUDE.md` §Tech constraints — replace the `file://` sentence with the wording in **Decision**.
3. [ ] Add one line to `README.md` §Run: the app needs `npm start` or the deployed URL; opening `index.html` directly will not work.
4. [ ] Decide where decisions live in this repo. The curriculum repo uses a single `docs/DECISIONS.md` with `D-NNN` records. Matching that convention here (`LD-001`) is probably better than introducing a second one — the ADR template is a format, not a commitment.
5. [ ] Only after 1–3: begin the service worker work (item 5 in the system design's adoption sequence).
6. [ ] Add a smoke test that loads the app from `http://127.0.0.1:4173` and asserts three option buttons render, so that a delivery regression fails a test instead of surviving three days.

---

*Every claim about current behaviour was measured against `e4b0f67` on 5 September 2026, except the PokéAPI-from-`file://` case, which is explicitly marked unverified. No code was changed.*
