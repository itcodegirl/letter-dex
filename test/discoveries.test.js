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
