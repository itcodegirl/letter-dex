export class ChooseEngine {
  constructor(root) {
    this.root = root
    this.locked = false
  }

  clear() {
    this.root.replaceChildren()
    this.locked = false
  }

  render({ options, answerId, labelFor, className = '', onCorrect, onWrong }) {
    this.clear()
    options.forEach((option) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `key ${className}`.trim()
      button.textContent = option.display
      button.setAttribute('aria-label', labelFor(option))
      button.addEventListener('click', () => {
        if (this.locked) return
        if (option.id !== answerId) {
          button.classList.remove('wrong')
          void button.offsetWidth
          button.classList.add('wrong')
          onWrong(option, button)
          return
        }

        this.locked = true
        button.classList.add('right')
        this.root.querySelectorAll('button').forEach((key) => {
          key.disabled = true
        })
        onCorrect(option, button)
      })
      this.root.append(button)
    })
  }
}
