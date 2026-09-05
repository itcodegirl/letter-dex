import test from 'node:test'
import assert from 'node:assert/strict'
import { RoundLifecycle } from '../src/core/round-lifecycle.js'
import { emptyProgress, completeSession } from '../src/core/progress.js'

test('an accepted answer cannot award a second stone or a duplicate session', () => {
  const lifecycle = new RoundLifecycle()
  const state = emptyProgress()
  for (let i = 0; i < 8; i++) {
    const id = lifecycle.begin()
    for (let attempt = 0; attempt < 2; attempt++) {
      if (lifecycle.accept(id)) state.activeSession.correct++
    }
  }
  assert.equal(state.activeSession.correct, 8)
  completeSession(state)
  assert.equal(state.sessions.length, 1)
  assert.equal(state.activeSession.correct, 0)
  assert.equal(lifecycle.accept(lifecycle.sequence), false)
  assert.equal(lifecycle.accept(lifecycle.begin()), true)
})

test('navigation rejects an old network completion and cancels delayed transitions', async () => {
  const lifecycle = new RoundLifecycle()
  const old = lifecycle.begin()
  let changed = false
  lifecycle.after(old, 5, () => { changed = true })
  const current = lifecycle.begin()
  assert.equal(lifecycle.accept(old), false)
  await new Promise(resolve => setTimeout(resolve, 15))
  assert.equal(changed, false)
  assert.equal(lifecycle.isCurrent(current), true)
})

test('a current transition runs once, and leaving completion invalidates late artwork', async () => {
  const lifecycle = new RoundLifecycle()
  const id = lifecycle.begin()
  let transitions = 0
  lifecycle.after(id, 1, () => { transitions++; lifecycle.cancel() })
  await new Promise(resolve => setTimeout(resolve, 10))
  assert.equal(transitions, 1)
  assert.equal(lifecycle.isCurrent(id), false)
  assert.equal(lifecycle.timers.size, 0)
})
