export const GRAPHEMES = Object.freeze({
  a: { sounds: ['ah'] },
  b: { sounds: ['buh'] },
  c: { sounds: ['kuh'] },
  d: { sounds: ['duh'] },
  e: { sounds: ['eh'] },
  f: { sounds: ['ff'] },
  g: { sounds: ['guh'] },
  h: { sounds: ['huh'] },
  i: { sounds: ['ih'] },
  j: { sounds: ['juh'] },
  k: { sounds: ['kuh'] },
  l: { sounds: ['lll'] },
  m: { sounds: ['mmm'] },
  n: { sounds: ['nnn'] },
  o: { sounds: ['aw'] },
  p: { sounds: ['puh'] },
  qu: { sounds: ['kwuh'] },
  r: { sounds: ['rrr'] },
  s: { sounds: ['sss'] },
  t: { sounds: ['tuh'] },
  u: { sounds: ['uh'] },
  v: { sounds: ['vvv'] },
  w: { sounds: ['wuh'] },
  x: { sounds: ['ks'], position: 'ending' },
  y: { sounds: ['yuh'] },
  z: { sounds: ['zzz'] },
})

export function wordFromGraphemes(graphemes) {
  return graphemes.join('')
}
