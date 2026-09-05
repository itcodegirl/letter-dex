let preferredVoice = () => ''
let preferredRate = () => 0.7

export function configureSpeech({ getVoiceURI, getRate = () => 0.7 }) {
  preferredVoice = getVoiceURI
  preferredRate = getRate
}

export function availableVoices() {
  return globalThis.speechSynthesis?.getVoices() ?? []
}

export function speak(text, { rate = 0.8, pitch = 1 } = {}) {
  if (!('speechSynthesis' in globalThis)) return
  globalThis.speechSynthesis.cancel()
  // Speech-only pronunciation hint; displayed names and roster slugs stay intact.
  const utterance = new SpeechSynthesisUtterance(text.replace(/\btotodile\b/gi, 'Toe toe dial'))
  const voice = availableVoices().find(candidate => candidate.voiceURI === preferredVoice())
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  }
  const pace = Number(preferredRate())
  const safePace = [0.6, 0.7, 0.8, 0.9].includes(pace) ? pace : 0.7
  utterance.rate = rate * safePace / 0.8
  utterance.pitch = pitch
  globalThis.speechSynthesis.speak(utterance)
}

export function speakWord(graphemes, graphemeData) {
  const sounds = graphemes.map((grapheme) => graphemeData[grapheme]?.sounds[0] ?? grapheme)
  speak(`${sounds.join('. ')}. ${graphemes.join('')}.`, { rate: 0.75 })
}
