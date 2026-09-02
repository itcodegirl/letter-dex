export function speak(text, { rate = 0.8, pitch = 1.1 } = {}) {
  if (!('speechSynthesis' in globalThis)) return
  globalThis.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = pitch
  globalThis.speechSynthesis.speak(utterance)
}

export function speakWord(graphemes, graphemeData) {
  const sounds = graphemes.map((grapheme) => graphemeData[grapheme]?.sounds[0] ?? grapheme)
  speak(`${sounds.join('. ')}. ${graphemes.join('')}.`, { rate: 0.75 })
}
