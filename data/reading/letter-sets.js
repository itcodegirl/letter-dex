export const LETTER_SETS = Object.freeze([
  { id: 'letters-1', label: 'Set 1', letters: ['S', 'A', 'T', 'P', 'M', 'I'] },
  { id: 'letters-2', label: 'Set 2', letters: ['F', 'N', 'O', 'D', 'C', 'H'] },
  { id: 'letters-3', label: 'Set 3', letters: ['G', 'U', 'B', 'L', 'K', 'E'] },
  { id: 'letters-4', label: 'Set 4', letters: ['R', 'W', 'J', 'V', 'Y', 'Z', 'Q'] },
])

export function cumulativeLetters(setIndex) {
  return LETTER_SETS.slice(0, setIndex + 1).flatMap((set) => set.letters)
}
