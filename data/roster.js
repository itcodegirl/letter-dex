/**
 * Authoritative sound-anchor roster. Do not substitute more famous Pokémon:
 * each anchor is selected for its initial sound.
 */
export const ROSTER = Object.freeze({
  A: { slug: 'abra', sound: 'ah' },
  B: { slug: 'bulbasaur', sound: 'buh' },
  C: { slug: 'cubone', sound: 'kuh' },
  D: { slug: 'diglett', sound: 'duh' },
  E: { slug: 'ekans', sound: 'eh' },
  F: { slug: 'fearow', sound: 'ff' },
  G: { slug: 'gengar', sound: 'guh' },
  H: { slug: 'haunter', sound: 'huh' },
  I: { slug: 'ivysaur', sound: 'ih' },
  J: { slug: 'jigglypuff', sound: 'juh' },
  K: { slug: 'koffing', sound: 'kuh' },
  L: { slug: 'lapras', sound: 'lll' },
  M: { slug: 'mudkip', sound: 'mmm' },
  N: { slug: 'nidoking', sound: 'nnn' },
  O: { slug: 'oddish', sound: 'aw' },
  P: { slug: 'pikachu', sound: 'puh' },
  Q: { slug: 'quagsire', sound: 'kwuh' },
  R: { slug: 'rattata', sound: 'rrr' },
  S: { slug: 'snorlax', sound: 'sss' },
  T: { slug: 'totodile', sound: 'tuh' },
  U: { slug: 'umbreon', sound: 'uh' },
  V: { slug: 'vulpix', sound: 'vvv' },
  W: { slug: 'weedle', sound: 'wuh' },
  Y: { slug: 'yamper', sound: 'yuh' },
  Z: { slug: 'zubat', sound: 'zzz' },
})

export const ROSTER_LETTERS = Object.freeze(Object.keys(ROSTER))
