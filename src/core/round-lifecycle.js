// Invalidates timers and async completions when the learner navigates away.
export class RoundLifecycle {
  constructor() { this.sequence = 0; this.timers = new Set(); this.accepted = false }
  cancel() {
    this.sequence += 1
    for (const timer of this.timers) clearTimeout(timer)
    this.timers.clear()
    this.accepted = false
  }
  begin() { this.cancel(); return this.sequence }
  isCurrent(id) { return id === this.sequence }
  accept(id) {
    if (!this.isCurrent(id) || this.accepted) return false
    this.accepted = true
    return true
  }
  after(id, delay, callback) {
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      if (this.isCurrent(id)) callback()
    }, delay)
    this.timers.add(timer)
  }
}
