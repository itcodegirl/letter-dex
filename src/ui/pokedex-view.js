import { getPokemon } from '../core/pokeapi.js'
import { mountPokemonPortrait } from './pokemon-portrait.js'

const portraits = new WeakMap()

export function disposePokedex(root) {
  portraits.get(root)?.forEach(portrait => portrait.destroy())
  portraits.delete(root)
}

export async function renderPokedex(root, collection, isCurrent = () => true) {
  disposePokedex(root)
  const caught = Object.values(collection).sort((a, b) => a.slug.localeCompare(b.slug))
  if (!caught.length) {
    root.innerHTML = `
      <div class="empty-dex">
        <span aria-hidden="true">◇</span>
        <h2>Your Letter Dex is waiting</h2>
        <p>Finish a sound adventure, or play words and math to meet your first Pokémon.</p>
      </div>`
    return
  }

  root.innerHTML = '<p class="loading-copy">Opening the Letter Dex…</p>'
  const pokemonBySlug = new Map()
  const cards = await Promise.all(caught.map(async (entry) => {
    try {
      const pokemon = await getPokemon(entry.slug)
      pokemonBySlug.set(entry.slug, pokemon)
      return `<article class="dex-card">
        <img data-pokemon="${entry.slug}" src="${pokemon.artwork ?? ''}" alt="${pokemon.name}">
        <strong>${pokemon.name}</strong>
        <span>Caught ${entry.count}×</span>
      </article>`
    } catch {
      return `<article class="dex-card missing"><strong>${entry.slug}</strong><span>Caught ${entry.count}×</span></article>`
    }
  }))
  if (isCurrent()) {
    root.innerHTML = `<div class="dex-grid">${cards.join('')}</div>`
    portraits.set(root, [...root.querySelectorAll('img[data-pokemon]')].map(image =>
      mountPokemonPortrait(image, pokemonBySlug.get(image.dataset.pokemon), {
        onLoad: () => { image.hidden = false },
        onError: () => { image.hidden = true },
      })))
  }
}
