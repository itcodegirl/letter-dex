import { availableVoices, speak } from '../core/speech.js'

export function createVoiceSettings({ select, pace, preview, status, getVoiceURI, getRate, onChange, onRateChange }) {
  function refresh() {
    const selected = getVoiceURI()
    const voices = availableVoices()
    select.replaceChildren(new Option('Browser default', ''))
    for (const voice of voices) {
      select.append(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI))
    }
    const missing = selected && !voices.some(voice => voice.voiceURI === selected)
    if (missing) select.append(new Option('Saved voice unavailable on this device', selected))
    select.value = selected
    const savedPace = Number(getRate())
    pace.value = String([0.6, 0.7, 0.8, 0.9].includes(savedPace) ? savedPace : 0.7)
    const supported = 'speechSynthesis' in globalThis
    select.disabled = !supported
    pace.disabled = !supported
    preview.disabled = !supported
    status.textContent = !supported ? 'Speech is unavailable in this browser.'
      : missing ? 'Using the browser default until the saved voice is available. Choose another voice to change it.'
      : voices.length ? 'Choose a voice, then try it. This choice applies to the whole game.'
      : 'Voice choices are loading. You can still try the browser default.'
  }
  select.addEventListener('change', () => {
    globalThis.speechSynthesis?.cancel()
    onChange(select.value)
    refresh()
  })
  pace.addEventListener('change', () => {
    globalThis.speechSynthesis?.cancel()
    onRateChange(Number(pace.value))
    refresh()
  })
  preview.addEventListener('click', () => speak('Let’s go on an adventure with Totodile! How many berries? One, two, three.'))
  globalThis.speechSynthesis?.addEventListener('voiceschanged', refresh)
  refresh()
  return { refresh }
}
