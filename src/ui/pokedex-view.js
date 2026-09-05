import { getPokemon } from '../core/pokeapi.js'

export async function renderPokedex(root, collection, isCurrent = () => true) {
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
  if (isCurrent()) root.innerHTML = `<div class="dex-grid">${cards.join('')}</div>`
}
