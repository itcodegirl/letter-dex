import test from 'node:test'
import assert from 'node:assert/strict'
import { getPokemon, clearPokemonCache } from '../src/core/pokeapi.js'

test('PokéAPI supplies animation separately from the original still artwork and caches both', async () => {
  clearPokemonCache()
  let calls = 0
  const fetcher = async () => {
    calls++
    return { ok: true, json: async () => ({ name: 'pikachu', sprites: {
      front_default: 'still-sprite.png',
      other: { 'official-artwork': { front_default: 'art.png' }, showdown: { front_default: 'moving.gif' } },
    } }) }
  }
  const pokemon = await getPokemon('pikachu', fetcher)
  assert.equal(pokemon.artwork, 'art.png')
  assert.equal(pokemon.animatedArtwork, 'moving.gif')
  assert.equal(await getPokemon('pikachu', fetcher), pokemon)
  assert.equal(calls, 1)
  clearPokemonCache()
})

test('older animated sprites are a fallback and missing animations remain supported', async () => {
  for (const sprites of [
    { front_default: 'still.png', versions: { 'generation-v': { 'black-white': { animated: { front_default: 'older.gif' } } } } },
    { front_default: 'still.png' },
    {},
  ]) {
    clearPokemonCache()
    const pokemon = await getPokemon('friend', async () => ({ ok: true, json: async () => ({ name: 'friend', sprites }) }))
    assert.equal(pokemon.animatedArtwork, sprites.versions ? 'older.gif' : null)
    assert.equal(pokemon.artwork, sprites.front_default)
  }
  clearPokemonCache()
})
