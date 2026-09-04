import { LETTER_SETS } from '../../data/reading/letter-sets.js'
import { WORD_SETS } from '../../data/reading/word-sets.js'

function accuracy(item) {
  return item.seen ? Math.round((item.correct / item.seen) * 100) : 0
}

function masteryFor(ids, state) {
  if (!ids.length) return 0
  const mastered = ids.filter((id) => state.items[id]?.mastered).length
  return Math.round((mastered / ids.length) * 100)
}

export function renderParentView(root, state) {
  const items = Object.values(state.items).sort((a, b) => a.id.localeCompare(b.id))
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentSessions = state.sessions.filter((session) => Date.parse(session.completedAt) >= sevenDaysAgo)
  const recentCorrect = recentSessions.reduce((sum, session) => sum + session.correct, 0)

  const setRows = [
    ...LETTER_SETS.map((set) => ({
      label: `Letters · ${set.label}`,
      percentage: masteryFor(set.letters.map((letter) => `letter-sound:${letter}`), state),
    })),
    ...WORD_SETS.map((set, index) => ({
      label: `Words · ${set.label}`,
      percentage: masteryFor(
        WORD_SETS.slice(0, index + 1).flatMap((entry) => entry.words.map((word) => `word:${word.join('')}`)),
        state,
      ),
    })),
  ]

  root.innerHTML = `
    <div class="parent-summary">
      <article><strong>${items.length}</strong><span>items seen</span></article>
      <article><strong>${recentSessions.length}</strong><span>sessions · 7 days</span></article>
      <article><strong>${recentCorrect}</strong><span>correct · 7 days</span></article>
    </div>
    <h3>Set readiness</h3>
    <div class="set-readiness">
      ${setRows.map((row) => `
        <div><span>${row.label}</span><meter min="0" max="100" value="${row.percentage}">${row.percentage}%</meter><b>${row.percentage}%</b></div>
      `).join('')}
    </div>
    <h3>Per-item accuracy</h3>
    <div class="accuracy-grid">
      ${items.length ? items.map((item) => `
        <div class="accuracy-item ${item.mastered ? 'mastered' : ''}">
          <strong>${item.id.split(':')[1]}</strong>
          <span>${accuracy(item)}%</span>
          <small>${item.correct}/${item.seen}</small>
        </div>
      `).join('') : '<p class="empty-state">No answers recorded yet.</p>'}
    </div>`
}
