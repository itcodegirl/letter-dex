let preferredVoice = () => ''
let preferredRate = () => 0.7
let reportError = () => {}
let generation = 0
let activeAudio = null
let finishSpeech = () => {}
let speechFinished = Promise.resolve()

export function whenSpeechEnds() { return speechFinished }

export function configureSpeech({ getVoiceURI, getRate = () => 0.7, onError = () => {} }) {
  preferredVoice = getVoiceURI
  preferredRate = getRate
  reportError = onError
}

export function availableVoices() {
  return globalThis.speechSynthesis?.getVoices() ?? []
}

export function cancelSpeech() {
  generation++
  finishSpeech()
  globalThis.speechSynthesis?.cancel()
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.removeAttribute('src')
    activeAudio = null
  }
}

function utteranceFor(text, { rate = 0.8, pitch = 1 }) {
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
  return utterance
}

export function speak(text, options = {}) {
  cancelSpeech()
  reportError('')
  const current = generation
  speechFinished = new Promise(resolve => { finishSpeech = resolve })
  const parts = text.split(/\b(mmm|nnn|sss)\b/gi).filter(part => /[a-z0-9]/i.test(part))
  const failed = () => {
    if (current !== generation) return
    cancelSpeech()
    reportError('Audio could not play. Tap Listen to retry, or ask a grown-up for help.')
  }
  function next() {
    if (current !== generation) return
    if (!parts.length) { finishSpeech(); return }
    const part = parts.shift()
    const sound = { mmm: 'm', nnn: 'n', sss: 's' }[part.toLowerCase()]
    if (sound) {
      if (typeof Audio === 'undefined') { failed(); return }
      const clip = new Audio(new URL(`../../assets/audio/sounds/${sound}.wav`, import.meta.url).href)
      activeAudio = clip
      clip.onended = () => { if (current === generation) activeAudio = null; next() }
      clip.onerror = failed
      // Preserve the recorded phoneme's pitch and duration at every speaking pace.
      try { clip.play().catch(failed) } catch { failed() }
    } else {
      if (!globalThis.speechSynthesis) { failed(); return }
      const utterance = utteranceFor(part, options)
      utterance.onend = next
      utterance.onerror = failed
      globalThis.speechSynthesis.speak(utterance)
    }
  }
  next()
  return speechFinished
}

export function speakWord(graphemes, graphemeData) {
  const sounds = graphemes.map((grapheme) => graphemeData[grapheme]?.sounds[0] ?? grapheme)
  speak(`${sounds.join('. ')}. ${graphemes.join('')}.`, { rate: 0.75 })
}
