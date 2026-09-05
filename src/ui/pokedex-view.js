import { getPokemon } from '../core/pokeapi.js'

export async function renderPokedex(root, collection) {
  const caught = Object.values(collection).sort((a, b) => a.slug.localeCompare(b.slug))
  if (!caught.length) {
    root.innerHTML = `
      <div class="empty-dex">
        <span aria-hidden="true">◇</span>
        <h2>Your Letter Dex is waiting</h2>
        <p>Read words to catch your first Pokémon.</p>
      </div>`
    return
  }

  root.innerHTML = '<p class="loading-copy">Opening the Letter Dex…</p>'
  const cards = await Promise.all(caught.map(async (entry) => {
    try {
      const pokemon = await getPokemon(entry.slug)
      return `<article class="dex-card">
        <img src="${pokemon.artwork}" alt="${pokemon.name}">
        <strong>${pokemon.name}</strong>
        <span>Caught ${entry.count}×</span>
      </article>`
    } catch {
      return `<article class="dex-card missing"><strong>${entry.slug}</strong><span>Caught ${entry.count}×</span></article>`
    }
  }))
  root.innerHTML = `<div class="dex-grid">${cards.join('')}</div>`
}
