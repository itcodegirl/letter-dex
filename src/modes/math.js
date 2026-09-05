import { mathChoices } from '../../data/math/adventure.js'
import { mathJourney } from '../core/math-journey.js'
import { mathSet, mathSetItems } from '../core/math-sets.js'
import { chooseAdaptive } from '../core/select.js'
import { speak } from '../core/speech.js'
import { createMathMission } from '../ui/math-mission.js'

// Help and successful retries advance the adventure, without certifying a fact.
export function mathAttempt(item, correct, supported = false) {
  return { id: correct && supported ? `math-help:${item.id}` : item.id,
    kind: correct && supported ? 'math-help' : item.kind, correct }
}

export class MathMode {
  constructor(options) { Object.assign(this, options) }

  play() {
    const journey = mathJourney(this.state)
    const stage = journey.stage
    const set = mathSet(journey.setId)
    const item = chooseAdaptive(mathSetItems(stage, set.id), this.getProgress)
    const { elements, engine } = this
    let answered = false, counted = 0, helped = false, retried = false
    const seen = new Set()
    const mission = createMathMission(elements.mathMission, {
      stage, correct: journey.correct, setName: set.name, isCurrentRound: this.isCurrentRound,
    })
    const question = stage === 0 ? 'How many berries?' : stage === 1 ? 'How many altogether?' : `How many more make ${item.total}?`
    elements.prompt.textContent = question
    elements.reveal.replaceChildren()
    elements.stage.className = 'stage math-stage'
    elements.stage.setAttribute('aria-busy', 'false')
    elements.stage.innerHTML = `<div class="math-objects" aria-label="Berries for the mission"></div>
      <div class="math-clue"><p class="math-equation"></p>
      <button type="button" class="listen math-listen" aria-label="Listen to the math mission"><span class="material-symbols-rounded" aria-hidden="true">volume_up</span><span>Listen</span></button></div>`
    const objects = elements.stage.querySelector('.math-objects')
    objects.classList.add(`math-layout-${stage}`)
    const hint = elements.stage.querySelector('.math-equation')
    const listen = elements.stage.querySelector('.listen')
    hint.textContent = stage === 0 ? 'Count the pack for our friend.' : stage === 1 ? `${item.a} + ${item.b} = ?` : `${item.a} here · We need ${item.total}`
    const say = () => speak(stage === 0 ? 'How many berries are in this pack? Count them for our friend.' : stage === 1 ? `${item.a} berries and ${item.b} more berries. How many altogether?` : `${item.a} berries are here. Our friend needs ${item.total}. How many more?`)
    listen.addEventListener('click', () => { if (this.isCurrentRound() && !answered) say() })
    const help = elements.mathHelp
    help.hidden = false
    help.disabled = false
    help.setAttribute('aria-pressed', 'false')
    help.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">pan_tool</span><span>Count with me</span>'

    const group = (amount, empty = 0) => {
      const tray = document.createElement('div')
      tray.className = 'berry-tray'
      tray.dataset.amount = String(amount + empty)
      tray.style.setProperty('--pack-weight', String(Math.max(1, amount + empty)))
      tray.style.setProperty('--pack-min', `${Math.min(3, Math.max(1, amount + empty)) * 64 + 48}px`)
      if (!amount && !empty) {
        const zero = document.createElement('span'); zero.className = 'empty-pack'; zero.textContent = 'No berries yet'; tray.append(zero)
      }
      for (let i = 0; i < amount + empty; i++) {
        const isEmpty = i >= amount
        const berry = document.createElement('button')
        berry.type = 'button'
        berry.className = isEmpty ? 'berry empty-slot' : 'berry'
        berry.setAttribute('aria-label', isEmpty ? 'Count this empty space' : 'Count this berry')
        berry.setAttribute('aria-pressed', 'false')
        berry.innerHTML = isEmpty ? '<span class="material-symbols-rounded" aria-hidden="true">radio_button_unchecked</span>' : '<img src="./assets/math/berry.png" alt="">'
        berry.addEventListener('click', () => {
          if (!this.isCurrentRound() || answered || seen.has(berry)) return
          if (stage === 2 && !isEmpty) {
            revealHelp()
            speak('These berries are already here. Tap each empty space to find how many more.')
            return
          }
          helped = true
          seen.add(berry); counted++
          help.setAttribute('aria-pressed', 'true')
          berry.classList.add('counted'); berry.setAttribute('aria-pressed', 'true')
          const label = document.createElement('span'); label.className = 'berry-count'; label.textContent = counted
          berry.append(label)
          speak(String(counted))
        })
        tray.append(berry)
      }
      objects.append(tray)
    }
    const revealHelp = () => {
      if (!this.isCurrentRound() || answered) return
      helped = true
      help.setAttribute('aria-pressed', 'true')
      if (stage === 2 && !objects.querySelector('.empty-slot')) {
        objects.replaceChildren(); group(item.a, item.total - item.a)
      }
      elements.reveal.textContent = stage === 2 ? 'Tap each empty space once.' : 'Tap each berry once.'
      objects.classList.add('math-help-active')
    }
    // This shared button survives between rounds.
    help.onclick = () => {
      revealHelp()
      if (this.isCurrentRound() && !answered) speak(stage === 2 ? 'Tap each empty space once. Then choose how many more.' : 'Tap each berry once. Then choose how many.')
    }
    if (stage === 0) group(item.total)
    if (stage === 1) {
      group(item.a)
      const plus = document.createElement('span'); plus.className = 'math-plus'; plus.textContent = '+'; objects.append(plus)
      group(item.b)
    }
    if (stage === 2) group(item.a)
    engine.render({
      options: mathChoices(item.answer), answerId: String(item.answer), labelFor: option => `Number ${option.display}`,
      onWrong: option => {
        if (!this.isCurrentRound() || answered) return
        retried = true
        this.onAttempt(mathAttempt(item, false))
        elements.reveal.textContent = 'Try another pack, or count with me.'
        speak(`You chose ${option.display}. We can try again. Tap Count with me if you want help.`)
      },
      onCorrect: () => {
        if (!this.isCurrentRound() || answered) return
        answered = true
        help.disabled = true
        listen.disabled = true
        this.onAttempt(mathAttempt(item, true, helped || retried))
        const success = ['The berry pack is on its way!', 'Another plank! The bridge is growing.', 'More light! The beacon is waking up.'][stage]
        elements.prompt.textContent = success
        hint.textContent = stage === 0 ? `${item.total} berries delivered!` : stage === 1 ? `${item.a} + ${item.b} = ${item.total}` : `${item.a} + ${item.answer} = ${item.total}`
        elements.reveal.textContent = 'You and your Pokémon found the way!'
        objects.classList.add('math-solved')
        if (stage > 0) { objects.replaceChildren(); group(item.total) }
        objects.querySelectorAll('button').forEach(button => { button.disabled = true })
        mission.celebrate(item.answer)
        speak(`${item.answer}. ${success}`)
        this.onCorrect({ caughtSlug: mission.caughtSlug })
      },
    })
    listen.focus({ preventScroll: true })
  }
}
