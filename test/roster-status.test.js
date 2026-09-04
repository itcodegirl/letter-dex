import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ROSTER_LETTERS } from '../data/roster.js'

test('the cached manual PokéAPI roster verification is complete', async () => {
  const report = JSON.parse(await readFile(new URL('../data/roster-status.json', import.meta.url), 'utf8'))
  assert.equal(report.results.length, ROSTER_LETTERS.length)
  for (const entry of report.results) {
    assert.equal(entry.resolved, true, `${entry.slug} did not resolve`)
    assert.equal(entry.artwork, true, `${entry.slug} had no official artwork`)
  }
})
