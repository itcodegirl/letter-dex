export const MASTERED_SHARE = 0.2

function weightedPick(items, getProgress, random) {
  const weighted = items.map((item) => {
    const streak = getProgress(item.id)?.streak ?? 0
    return { item, weight: 1 / (streak + 1) }
  })
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  let cursor = random() * total

  for (const entry of weighted) {
    cursor -= entry.weight
    if (cursor <= 0) return entry.item
  }
  return weighted.at(-1).item
}

export function chooseAdaptive(items, getProgress, random = Math.random) {
  if (!items.length) throw new Error('chooseAdaptive requires at least one item')

  const mastered = items.filter((item) => getProgress(item.id)?.mastered)
  const learning = items.filter((item) => !getProgress(item.id)?.mastered)

  if (!mastered.length) return weightedPick(learning, getProgress, random)
  if (!learning.length) return weightedPick(mastered, getProgress, random)

  const pool = random() < MASTERED_SHARE ? mastered : learning
  return weightedPick(pool, getProgress, random)
}

export function chooseDistinct(items, count, excludedIds = [], random = Math.random) {
  const candidates = items.filter((item) => !excludedIds.includes(item.id))
  const chosen = []
  while (candidates.length && chosen.length < count) {
    const index = Math.floor(random() * candidates.length)
    chosen.push(candidates.splice(index, 1)[0])
  }
  return chosen
}
