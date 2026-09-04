const g = (text) => [...text]

export const WORD_SETS = Object.freeze([
  {
    id: 'words-satp',
    label: 's a t p',
    unlockedGraphemes: ['s', 'a', 't', 'p'],
    words: ['at', 'as', 'sat', 'pat', 'tap', 'sap'].map(g),
  },
  {
    id: 'words-mi',
    label: 'm i',
    unlockedGraphemes: ['m', 'i'],
    words: ['am', 'it', 'is', 'sit', 'pit', 'tip', 'sip', 'mat', 'map', 'tam'].map(g),
  },
  {
    id: 'words-fno',
    label: 'f n o',
    unlockedGraphemes: ['f', 'n', 'o'],
    words: ['an', 'on', 'if', 'fan', 'fat', 'fit', 'fin', 'nap', 'tan', 'tin', 'pin', 'pan', 'man', 'not', 'top', 'pot', 'mop'].map(g),
  },
  {
    id: 'words-dch',
    label: 'd c h',
    unlockedGraphemes: ['d', 'c', 'h'],
    words: ['dad', 'did', 'dot', 'dip', 'cat', 'cot', 'cap', 'can', 'hat', 'hit', 'hot', 'hop', 'hid', 'had'].map(g),
  },
  {
    id: 'words-gub',
    label: 'g u b',
    unlockedGraphemes: ['g', 'u', 'b'],
    words: ['up', 'us', 'gap', 'got', 'gum', 'bag', 'big', 'bat', 'bin', 'bus', 'bug', 'but', 'cub', 'cup', 'cut', 'hug', 'hut', 'mud', 'mug', 'nut', 'sun', 'tub', 'dug', 'dig'].map(g),
  },
  {
    id: 'words-lke',
    label: 'l k e',
    unlockedGraphemes: ['l', 'k', 'e'],
    words: ['leg', 'let', 'lip', 'lot', 'lid', 'log', 'kid', 'kit', 'pet', 'pen', 'peg', 'ten', 'net', 'men', 'hen', 'bed', 'bet', 'get'].map(g),
  },
])

export function cumulativeWords(setIndex) {
  return WORD_SETS.slice(0, setIndex + 1).flatMap((set) => set.words)
}
