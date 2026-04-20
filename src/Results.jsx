import Celebration from './components/Celebration.jsx'
import { ANIMALS } from './components/Mascot.jsx'
import starUrl from './assets/star.png'

/**
 * Results screen shown after a 10-question round.
 *
 * Displays:
 *   - 1–3 star rating, derived purely from `firstTryCorrect`.
 *   - "You got X out of 10 right on the first try!" count sentence.
 *   - Two buttons: Play Again (same mode) and Back to Menu.
 *
 * `result` is the payload Game emitted via `onFinish`:
 *   `{ mode, firstTryCorrect, total }`.
 *
 * `mode` is also passed separately — App keeps it in its own state so
 * Play Again can relaunch without routing back through the menu; it's
 * used here only for display (kept implicit — the screen itself is
 * mode-agnostic).
 *
 * Play Again and Back to Menu are wired up by the parent. See the
 * note on `starsForScore` below for the rating cutoffs.
 */

const TOTAL_STARS = 3

/**
 * Pure helper: map first-try-correct count to a 1–3 star rating.
 *
 *   - 9–10 correct → 3 stars
 *   - 6–8  correct → 2 stars
 *   - 0–5  correct → 1 star
 *
 * Exported for unit testing and potential reuse.
 */
export function starsForScore(firstTryCorrect) {
  if (firstTryCorrect >= 9) return 3
  if (firstTryCorrect >= 6) return 2
  return 1
}

export default function Results({ result, onPlayAgain, onBackToMenu }) {
  // Defensive: if App ever renders Results without a result payload
  // (shouldn't happen in normal flow), fall back to zeros so the
  // screen still renders something reasonable instead of crashing.
  const firstTryCorrect = result?.firstTryCorrect ?? 0
  const total = result?.total ?? 10
  const stars = starsForScore(firstTryCorrect)
  const newMascotId = result?.newMascot
  const newMascot = newMascotId
    ? ANIMALS.find((a) => a.id === newMascotId)
    : null

  return (
    <div className="results">
      {/* Confetti burst shown whenever the results screen mounts. It's
          purely decorative, so aria-hidden is set by Celebration. */}
      <Celebration active kind="confetti" />
      <h2 className="results-title">Great job! 🎉</h2>

      <div
        className="results-stars"
        role="img"
        aria-label={`${stars} out of ${TOTAL_STARS} stars`}
        data-stars={stars}
      >
        {Array.from({ length: TOTAL_STARS }, (_, i) => {
          const filled = i < stars
          return (
            <span
              key={i}
              className={`star ${filled ? 'star-filled' : 'star-empty'}`}
              data-filled={filled ? 'true' : 'false'}
              aria-hidden="true"
            >
              <img className="star-image" src={starUrl} alt="" />
            </span>
          )
        })}
      </div>

      <p className="results-score">
        You got {firstTryCorrect} out of {total} right on the first try!
      </p>

      {newMascot && (
        <div className="new-friend" data-testid="new-friend" role="status">
          <img
            className="new-friend-image"
            src={newMascot.src}
            alt=""
            aria-hidden="true"
          />
          <div className="new-friend-text">
            <span className="new-friend-badge">New friend unlocked!</span>
            <span className="new-friend-name">
              Meet your {newMascot.id}!
            </span>
          </div>
        </div>
      )}

      <div className="results-buttons">
        <button
          type="button"
          className="results-button results-play-again"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        <button
          type="button"
          className="results-button results-back"
          onClick={onBackToMenu}
        >
          Back to Menu
        </button>
      </div>
    </div>
  )
}
