import test from 'node:test'
import assert from 'node:assert/strict'
import { renderPokedex } from '../src/ui/pokedex-view.js'
import { clearPokemonCache } from '../src/core/pokeapi.js'

test('a late Pokédex request cannot replace a newer view after navigation', async t => {
  clearPokemonCache()
  let resolveRequest
  const request = new Promise(resolve => { resolveRequest = resolve })
  t.mock.method(globalThis, 'fetch', () => request)
  const root = { innerHTML: '' }
  let current = true
  const render = renderPokedex(root, { abra: { slug: 'abra', count: 1 } }, () => current)
  assert.match(root.innerHTML, /Opening/)
  current = false
  root.innerHTML = 'A newer collection view'
  resolveRequest({ ok: true, json: async () => ({ name: 'abra', sprites: {} }) })
  await render
  assert.equal(root.innerHTML, 'A newer collection view')
  clearPokemonCache()
})

test('the active Pokédex still displays its fetched collection', async t => {
  clearPokemonCache()
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true, json: async () => ({ name: 'abra', sprites: { front_default: 'abra.png' } }),
  }))
  const root = { innerHTML: '' }
  await renderPokedex(root, { abra: { slug: 'abra', count: 2 } })
  assert.match(root.innerHTML, /abra.png/)
  assert.match(root.innerHTML, /Caught 2×/)
  clearPokemonCache()
})
