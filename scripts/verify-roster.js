import { writeFile } from 'node:fs/promises'
import { ROSTER } from '../data/roster.js'

const results = []

for (const [letter, anchor] of Object.entries(ROSTER)) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${anchor.slug}`)
    const data = response.ok ? await response.json() : null
    results.push({
      letter,
      slug: anchor.slug,
      status: response.status,
      resolved: response.ok && data?.name === anchor.slug,
      artwork: Boolean(data?.sprites?.other?.['official-artwork']?.front_default),
    })
  } catch (error) {
    results.push({
      letter,
      slug: anchor.slug,
      status: 0,
      resolved: false,
      artwork: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
  await new Promise((resolve) => setTimeout(resolve, 80))
}

const report = {
  checkedAt: new Date().toISOString(),
  endpoint: 'https://pokeapi.co/api/v2/pokemon/{slug}',
  results,
}

await writeFile(
  new URL('../data/roster-status.json', import.meta.url),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
)

const failed = results.filter((entry) => !entry.resolved || !entry.artwork)
console.log(`Verified ${results.length - failed.length}/${results.length} roster anchors.`)
if (failed.length) {
  console.error(failed)
  process.exitCode = 1
}
