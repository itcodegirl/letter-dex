import test from 'node:test'
import assert from 'node:assert/strict'
import { GRAPHEMES, wordFromGraphemes } from '../data/graphemes.js'
import { ROSTER, ROSTER_LETTERS } from '../data/roster.js'
import { LETTER_SETS } from '../data/reading/letter-sets.js'
import { WORD_SETS } from '../data/reading/word-sets.js'

test('the sound-anchor roster covers every letter except x', () => {
  assert.equal(ROSTER_LETTERS.length, 25)
  assert.equal(ROSTER.X, undefined)
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWYZ') {
    assert.ok(ROSTER[letter], `missing roster entry for ${letter}`)
  }
})

test('letter sets never place c and k in the same sound round', () => {
  for (const set of LETTER_SETS) {
    assert.equal(set.letters.includes('C') && set.letters.includes('K'), false, set.id)
  }
})

test('every decodable word uses only graphemes unlocked cumulatively', () => {
  const unlocked = new Set()
  for (const set of WORD_SETS) {
    set.unlockedGraphemes.forEach((grapheme) => unlocked.add(grapheme))
    for (const word of set.words) {
      for (const grapheme of word) {
        assert.ok(GRAPHEMES[grapheme], `${wordFromGraphemes(word)} uses unknown grapheme ${grapheme}`)
        assert.ok(unlocked.has(grapheme), `${wordFromGraphemes(word)} uses ${grapheme} before unlock`)
      }
    }
  }
})

test('word tiers contain no duplicates', () => {
  const seen = new Set()
  for (const set of WORD_SETS) {
    for (const graphemes of set.words) {
      const word = wordFromGraphemes(graphemes)
      assert.equal(seen.has(word), false, `duplicate word: ${word}`)
      seen.add(word)
    }
  }
})
