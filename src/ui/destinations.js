import { MATH_STAGES } from '../../data/math/adventure.js'
import { mathMissionFor } from './math-mission.js'

const routes = [
  { image: 'crossing', invitation: 'Look at those stepping stones! Count the berries with me to open a way across the stream.', action: 'Explore the crossing' },
  { image: 'bridge', invitation: 'Look! The bridge has missing planks. Let’s bring berry groups together to build a way across!', action: 'Build the bridge' },
  { image: 'beacon', invitation: 'The beacon needs our help! Find the missing berries with me to light the way through the forest.', action: 'Rescue the beacon' },
]

// Use the live journey stage, including when an older memory is reopened.
export function destinationFor(mode, stage = 0, setName = '') {
  if (mode === 'math') return { ...routes[stage], title: setName ? `${setName} · ${mathMissionFor(stage).name}` : MATH_STAGES[stage].name }
  return {
    image: 'crossing',
    title: mode === 'words' ? 'Word trail' : 'Sound trail',
    invitation: mode === 'words'
      ? 'Another trail is waiting! Read the words with me to raise the stones and discover who is over there.'
      : 'Another trail is waiting! Listen for the sounds with me to raise the stones and discover who is over there.',
    action: 'Explore the next trail',
  }
}
