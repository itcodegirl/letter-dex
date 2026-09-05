import test from 'node:test'
import assert from 'node:assert/strict'
import { createDiscovery, followFootprint, openDiscoveryJournal, pendingDiscovery, finishDiscovery } from '../src/core/discoveries.js'
import { emptyProgress, recordCatch, completeSession, exportProgress, importProgress } from '../src/core/progress.js'
import { getPokemon, clearPokemonCache } from '../src/core/pokeapi.js'

test('one completed quest has one resumable encounter without duplicate collection rewards', () => {
  let state = emptyProgress()
  state.activeSession.correct = 8; recordCatch(state, 'abra'); completeSession(state)
  const details = { slug:'abra', mode:'math', title:'Berry Crossing', isNew:true }
  let entry = createDiscovery(state, details)
  assert.equal(createDiscovery(state, details), entry)
  assert.equal(state.discoveries.length, 1)
  assert.equal(followFootprint(entry, 1), false)
  assert.equal(followFootprint(entry, 0), true)
  assert.equal(followFootprint(entry, 0), false)
  state = importProgress(exportProgress(state)); entry = pendingDiscovery(state)
  assert.equal(entry.footprints, 1)
  followFootprint(entry, 1); followFootprint(entry, 2)
  assert.equal(entry.step, 'meet')
  assert.equal(openDiscoveryJournal(entry), false)
  entry.greeted = true
  assert.equal(openDiscoveryJournal(entry), true)
  assert.equal(openDiscoveryJournal(entry), false)
  assert.equal(state.collection.abra.count, 1)
  assert.equal(state.sessions.length, 1)
  finishDiscovery(state, 'other-id'); assert.equal(pendingDiscovery(state), entry)
  finishDiscovery(state, entry.id); assert.equal(pendingDiscovery(state), null)
  assert.equal(state.discoveries[0].step, 'journal')
})

test('old backups have no pending discovery and repeating a species keeps separate memories', () => {
  const state = emptyProgress()
  assert.equal(pendingDiscovery(state), null)
  for(let i=0;i<2;i++) { state.activeSession.correct=8; completeSession(state); createDiscovery(state,{slug:'abra',isNew:i===0}) }
  assert.equal(state.discoveries.length, 2)
  assert.equal(state.discoveries[1].isNew, false)
})

test('failed Pokémon requests can retry while successful requests remain cached', async () => {
  clearPokemonCache()
  await assert.rejects(getPokemon('abra', async()=>{throw new Error('offline')}))
  let calls=0
  const fetcher=async()=>{ calls++; return {ok:true,json:async()=>({name:'abra',sprites:{front_default:'image.png'}})} }
  assert.equal((await getPokemon('abra',fetcher)).name,'abra')
  await getPokemon('abra',fetcher)
  assert.equal(calls,1)
  clearPokemonCache()
})

test('math memories keep their completed checkpoint through backup and later set changes', () => {
  const state = emptyProgress()
  state.sessions.push({ kind: 'math', setId: 'trail-team', stage: 2, correct: 8, completedAt: '2026-09-05T12:00:00.000Z' })
  state.mathJourney = { setId: 'river-rescue', stage: 0, correct: 0 }
  const checkpoint = { setId: 'trail-team', stage: 2 }
  const details = { slug: 'totodile', mode: 'math', checkpoint }
  const entry = createDiscovery(state, details)
  checkpoint.setId = 'river-rescue'
  checkpoint.stage = 0
  state.mathJourney.correct = 5
  assert.deepEqual(entry.checkpoint, { setId: 'trail-team', stage: 2 })
  const restored = importProgress(exportProgress(state))
  assert.deepEqual(pendingDiscovery(restored).checkpoint, { setId: 'trail-team', stage: 2 })
  assert.equal(createDiscovery(state, details), entry)
  assert.equal(state.discoveries.length, 1)
  assert.equal(state.sessions.length, 1)
})

test('legacy and invalid discovery checkpoints are omitted without affecting the reward', () => {
  for (const details of [
    { mode: 'math' },
    { mode: 'math', checkpoint: null },
    { mode: 'math', checkpoint: { setId: '', stage: 0 } },
    { mode: 'math', checkpoint: { setId: 'bad set', stage: 0 } },
    { mode: 'math', checkpoint: { setId: 'trail-team', stage: '2' } },
    { mode: 'math', checkpoint: { setId: 'trail-team', stage: -1 } },
    { mode: 'math', checkpoint: { setId: 'trail-team', stage: 3 } },
    { mode: 'words', checkpoint: { setId: 'trail-team', stage: 0 } },
  ]) {
    const state = emptyProgress()
    state.activeSession.correct = 8
    recordCatch(state, 'abra')
    completeSession(state)
    const entry = createDiscovery(state, { slug: 'abra', ...details })
    assert.equal(Object.hasOwn(entry, 'checkpoint'), false)
    assert.equal(pendingDiscovery(state), entry)
    assert.equal(state.collection.abra.count, 1)
    assert.equal(state.sessions.length, 1)
  }
})
