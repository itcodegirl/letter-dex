import test from 'node:test'
import assert from 'node:assert/strict'
import { configureSpeech, speak, speakWord } from '../src/core/speech.js'
import { emptyProgress, exportProgress, importProgress } from '../src/core/progress.js'

function speechHarness(run) {
  const oldSynth = Object.getOwnPropertyDescriptor(globalThis, 'speechSynthesis')
  const oldUtterance = Object.getOwnPropertyDescriptor(globalThis, 'SpeechSynthesisUtterance')
  const spoken = [], events = []
  let voices = []
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
  globalThis.speechSynthesis = {
    getVoices: () => voices,
    cancel: () => events.push('cancel'),
    speak: utterance => { events.push('speak'); spoken.push(utterance) },
  }
  try { run({ spoken, events, setVoices: value => { voices = value } }) }
  finally {
    if (oldSynth) Object.defineProperty(globalThis, 'speechSynthesis', oldSynth)
    else delete globalThis.speechSynthesis
    if (oldUtterance) Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', oldUtterance)
    else delete globalThis.SpeechSynthesisUtterance
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
    speakWord(['s', 'a', 't'], { s: { sounds: ['sss'] }, a: { sounds: ['a'] }, t: { sounds: ['t'] } })
    assert.ok(Math.abs(spoken[0].rate - 0.7) < 0.0001)
    assert.ok(spoken[1].rate < spoken[0].rate)
    assert.equal(spoken[1].text, 'sss. a. t. sat.')
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
