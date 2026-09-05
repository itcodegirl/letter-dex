import test from 'node:test'
import assert from 'node:assert/strict'
import { configureSpeech, speak, speakWord, cancelSpeech } from '../src/core/speech.js'
import { emptyProgress, exportProgress, importProgress } from '../src/core/progress.js'

function speechHarness(run) {
  const oldSynth = Object.getOwnPropertyDescriptor(globalThis, 'speechSynthesis')
  const oldUtterance = Object.getOwnPropertyDescriptor(globalThis, 'SpeechSynthesisUtterance')
  const oldAudio = Object.getOwnPropertyDescriptor(globalThis, 'Audio')
  const spoken = [], events = []
  const clips = []
  let voices = []
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
  globalThis.speechSynthesis = {
    getVoices: () => voices,
    cancel: () => events.push('cancel'),
    speak: utterance => { events.push('speak'); spoken.push(utterance) },
  }
  globalThis.Audio = class {
    constructor(src) { this.src = src; clips.push(this) }
    play() { this.played = true; return Promise.resolve() }
    pause() { this.paused = true }
    removeAttribute() {}
  }
  try { run({ spoken, events, clips, setVoices: value => { voices = value } }) }
  finally {
    cancelSpeech()
    if (oldSynth) Object.defineProperty(globalThis, 'speechSynthesis', oldSynth)
    else delete globalThis.speechSynthesis
    if (oldUtterance) Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', oldUtterance)
    else delete globalThis.SpeechSynthesisUtterance
    if (oldAudio) Object.defineProperty(globalThis, 'Audio', oldAudio)
    else delete globalThis.Audio
    configureSpeech({ getVoiceURI: () => '' })
  }
}

test('saved voice survives backup and is selected when delayed voices become available', () => {
  const state = emptyProgress()
  state.settings.speechVoice = 'voice-zira'
  state.settings.speechRate = 0.6
  const restored = importProgress(exportProgress(state))
  speechHarness(({ spoken, events, setVoices }) => {
    configureSpeech({ getVoiceURI: () => restored.settings.speechVoice, getRate: () => restored.settings.speechRate })
    speak('How many berries?')
    assert.equal(spoken[0].voice, undefined)
    const voice = { voiceURI: 'voice-zira', lang: 'en-US' }
    setVoices([voice])
    speak('Try again.')
    assert.equal(spoken[1].voice, voice)
    assert.equal(spoken[1].lang, 'en-US')
    assert.equal(spoken[1].rate, 0.6)
    assert.equal(spoken[1].pitch, 1)
    assert.deepEqual(events, ['cancel', 'speak', 'cancel', 'speak'])
    setVoices([])
    speak('Next adventure.')
    assert.equal(spoken[2].voice, undefined)
  })
})

test('gentle fallback also slows segmented words while preserving the prompt order', () => {
  speechHarness(({ spoken }) => {
    configureSpeech({ getVoiceURI: () => '', getRate: () => 99 })
    speak('How many berries?')
    speakWord(['t', 'a', 't'], { a: { sounds: ['a'] }, t: { sounds: ['t'] } })
    assert.ok(Math.abs(spoken[0].rate - 0.7) < 0.0001)
    assert.ok(spoken[1].rate < spoken[0].rate)
    assert.equal(spoken[1].text, 't. a. t. tat.')
  })
})

test('recorded M and S clues precede names without spelling out repeated letters', () => {
  speechHarness(({ spoken, clips }) => {
    speak('mmm. Mudkip. Letter M.')
    assert.equal(spoken.length, 0)
    assert.match(clips[0].src, /\/assets\/audio\/sounds\/m\.wav$/)
    assert.equal(clips[0].played, true)
    clips[0].onended()
    assert.equal(spoken[0].text, '. Mudkip. Letter M.')
    speak('sss')
    assert.match(clips[1].src, /\/s\.wav$/)
    clips[1].onended()
    assert.equal(spoken.length, 1)
  })
})

test('N uses its recorded sound in clues and feedback while its letter name remains speech', () => {
  speechHarness(({ spoken, clips }) => {
    speak('NNN')
    assert.match(clips[0].src, /\/assets\/audio\/sounds\/n\.wav$/)
    clips[0].onended()
    assert.equal(spoken.length, 0)
    speak('That one says nnn. Listen, then try again.')
    assert.equal(spoken[0].text, 'That one says ')
    spoken[0].onend()
    assert.match(clips[1].src, /\/n\.wav$/)
    clips[1].onended()
    assert.equal(spoken[1].text, '. Listen, then try again.')
    speak('Letter N.')
    assert.equal(spoken[2].text, 'Letter N.')
  })
})

test('new speech and navigation cancel a phoneme and reject its late continuation', () => {
  speechHarness(({ spoken, clips }) => {
    speak('mmm. Mudkip. Letter M.')
    speak('How many berries?')
    assert.equal(clips[0].paused, true)
    clips[0].onended()
    assert.deepEqual(spoken.map(item => item.text), ['How many berries?'])
    speak('sss. Sandshrew. Letter S.')
    cancelSpeech()
    clips[1].onended()
    assert.equal(clips[1].paused, true)
    assert.equal(spoken.length, 1)
  })
})

test('failed phoneme reports an access problem without falling back to repeated names', () => {
  speechHarness(({ spoken, clips }) => {
    const messages = []
    configureSpeech({ getVoiceURI: () => '', onError: text => messages.push(text) })
    speak('mmm. Mudkip. Letter M.')
    clips[0].onerror()
    assert.match(messages.at(-1), /Audio could not play/)
    clips[0].onended()
    assert.equal(spoken.length, 0)
    speak('sss')
    assert.equal(messages.at(-1), '')
    assert.equal(clips.length, 2)
  })
})

test('segmented words sequence phoneme clips and speech before the whole word', () => {
  speechHarness(({ spoken, clips }) => {
    speakWord(['m', 'a', 'n'], { m: { sounds: ['mmm'] }, a: { sounds: ['ah'] }, n: { sounds: ['nnn'] } })
    clips[0].onended()
    assert.equal(spoken[0].text, '. ah. ')
    spoken[0].onend()
    assert.match(clips[1].src, /\/n\.wav$/)
    clips[1].onended()
    assert.equal(spoken[1].text, '. man.')
  })
})

test('Totodile hint changes speech only and leaves other words intact', () => {
  speechHarness(({ spoken }) => {
    const source = 'Hello, Totodile! totodile is here. totodiles.'
    speak(source)
    assert.equal(source, 'Hello, Totodile! totodile is here. totodiles.')
    assert.equal(spoken[0].text, 'Hello, Toe toe dial! Toe toe dial is here. totodiles.')
  })
})
