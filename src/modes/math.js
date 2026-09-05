import { MATH_STAGES, mathItems, mathChoices } from '../../data/math/adventure.js'
import { mathJourney } from '../core/math-journey.js'
import { chooseAdaptive } from '../core/select.js'
import { speak } from '../core/speech.js'
import { ROSTER } from '../../data/roster.js'

export class MathMode {
  constructor(options) { Object.assign(this, options) }

  play() {
    const stage = mathJourney(this.state).stage
    const config = MATH_STAGES[stage]
    const item = chooseAdaptive(mathItems(stage), this.getProgress)
    const { elements, engine } = this
    let answered = false, counted = 0
    const seen = new Set()
    const question = stage === 0 ? 'How many berries?' : stage === 1 ? 'How many altogether?' : 'Make a group of 5.'
    elements.prompt.textContent = question
    elements.reveal.replaceChildren()
    elements.stage.className = 'stage math-stage'
    elements.stage.setAttribute('aria-busy', 'false')
    elements.stage.innerHTML = `<p class="math-chapter">${config.name} <span>· ${stage + 1} of 3</span></p>
      <div class="math-objects" aria-label="Berries to count"></div>
      <p class="math-equation">${stage === 0 ? 'Tap each berry to count.' : stage === 1 ? `${item.a} + ${item.b} = ?` : `${item.a} here. How many more?`}</p>
      <button class="listen math-listen" aria-label="Listen to the math mission"><span class="material-symbols-rounded" aria-hidden="true">volume_up</span><span>Listen</span></button>`
    const objects = elements.stage.querySelector('.math-objects')
    objects.classList.add(`math-layout-${stage}`)
    const hint = elements.stage.querySelector('.math-equation')
    const listen = elements.stage.querySelector('.listen')
    const say = () => speak(`${question} ${stage === 1 ? `${item.a} berries and ${item.b} more berries.` : stage === 2 ? `${item.a} berries are here. How many more make five?` : ''} ${config.mission}`)
    listen.addEventListener('click', () => { if (this.isCurrentRound() && !answered) say() })
    const group = (amount, empty = 0) => {
      const tray = document.createElement('div')
      tray.className = `berry-tray${empty ? ' five-tray' : ''}`
      if (stage === 0) tray.style.gridTemplateColumns = `repeat(${amount > 5 ? Math.ceil(amount / 2) : amount}, 1fr)`
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
          // In the missing-amount game, count only the empty spaces.
          if (stage === 2 && !isEmpty) { speak('This space already has a berry. Count the empty spaces.'); return }
          seen.add(berry); counted++
          berry.classList.add('counted'); berry.setAttribute('aria-pressed', 'true')
          const label = document.createElement('span'); label.className = 'berry-count'; label.textContent = counted
          berry.append(label)
          speak(String(counted))
        })
        tray.append(berry)
      }
      objects.append(tray)
    }
    if (stage === 0) group(item.total)
    if (stage === 1) {
      group(item.a)
      const plus = document.createElement('span'); plus.className = 'math-plus'; plus.textContent = '+'; objects.append(plus)
      group(item.b)
    }
    if (stage === 2) group(item.a, 5 - item.a)
    engine.render({
      options: mathChoices(item.answer), answerId: String(item.answer), labelFor: option => `Number ${option.display}`,
      onWrong: option => {
        if (!this.isCurrentRound() || answered) return
        this.onAttempt({ id: item.id, kind: item.kind, correct: false })
        const help = stage === 2 ? 'Tap each empty space, then try again.' : 'Tap each berry once, then try again.'
        elements.reveal.textContent = help
        speak(`You chose ${option.display}. ${help}`)
      },
      onCorrect: () => {
        if (!this.isCurrentRound() || answered) return
        answered = true
        // Count-along practice has a separate record; it does not certify independent mastery.
        this.onAttempt({ id: seen.size ? `math-help:${item.id}` : item.id, kind: seen.size ? 'math-help' : item.kind, correct: true })
        elements.prompt.textContent = config.success
        hint.textContent = stage === 0 ? `${item.total} berries!` : stage === 1 ? `${item.a} + ${item.b} = ${item.total}` : `${item.a} + ${item.answer} = 5`
        elements.reveal.textContent = 'You found the way!'
        objects.classList.add('math-solved')
        if (stage === 1) { objects.replaceChildren(); group(item.total) }
        if (stage === 2) objects.querySelectorAll('.empty-slot').forEach(slot => {
          slot.classList.remove('empty-slot')
          slot.innerHTML = '<img src="./assets/math/berry.png" alt="Berry added">'
        })
        speak(`${item.answer}. ${config.success}`)
        const letters = this.activeLetters()
        this.onCorrect({ caughtSlug: ROSTER[letters[Math.floor(Math.random() * letters.length)]].slug })
      },
    })
    listen.focus({ preventScroll: true })
  }
}
