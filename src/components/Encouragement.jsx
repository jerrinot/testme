/**
 * Short encouragement toast shown after a correct answer. The parent
 * drives it by providing `tick` (a counter) and `message`; remounting
 * via `key={tick}` restarts the pop + fade animation each time.
 *
 * `tick === 0` means nothing to show yet (fresh round), so we bail.
 */
export default function Encouragement({ tick, message }) {
  if (!tick || !message) return null
  return (
    <div
      key={tick}
      className="encouragement"
      data-testid="encouragement"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

const STREAK_MILESTONES = {
  3: 'On fire! 🔥',
  5: 'Amazing! ⭐',
  7: 'Unstoppable! 💫',
  10: 'PERFECT! 🏆',
}

const GENERIC_PRAISE = [
  'Nice!',
  'Great job!',
  'Awesome!',
  'You got it!',
  'Well done!',
  'Yes!',
]

/**
 * Pick the message for the moment. Streak milestones beat the
 * halfway-point beat beats the generic praise pool. Keeping the
 * selector here means Game just passes in the pieces and gets a
 * string back without having to know the rules.
 */
export function pickEncouragement({ streak, questionNumber, total, tick }) {
  if (STREAK_MILESTONES[streak]) return STREAK_MILESTONES[streak]
  if (questionNumber === Math.floor(total / 2)) return 'Halfway there! 🙌'
  if (questionNumber === total) return 'Last one! 💪'
  // Rotate through the praise pool deterministically by tick so the
  // same message doesn't land twice in a row.
  return GENERIC_PRAISE[(tick - 1) % GENERIC_PRAISE.length]
}
