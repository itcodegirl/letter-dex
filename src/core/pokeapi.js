const API_ROOT = 'https://pokeapi.co/api/v2'
const resourceCache = new Map()

export async function getPokemon(slug, fetcher = globalThis.fetch) {
  if (resourceCache.has(slug)) return resourceCache.get(slug)
  const request = fetcher(`${API_ROOT}/pokemon/${slug}`).then(async (response) => {
    if (!response.ok) throw new Error(`PokéAPI returned ${response.status} for ${slug}`)
    const data = await response.json()
    return {
      slug,
      name: data.name,
      artwork: data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default,
      height: data.height,
      weight: data.weight,
      types: data.types?.map((entry) => entry.type.name) ?? [],
    }
  })
  resourceCache.set(slug, request)
  return request
}

export function preloadArtwork(pokemon) {
  if (!pokemon?.artwork || typeof Image === 'undefined') return
  const image = new Image()
  image.src = pokemon.artwork
}

export function clearPokemonCache() {
  resourceCache.clear()
}
