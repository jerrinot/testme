/**
 * Placeholder results screen.
 *
 * T4 fills in the real star rating and replay UX. T2 ships a stub so
 * the App state machine has a concrete component to render for the
 * 'results' screen.
 */
export default function Results({ result, mode, onPlayAgain, onBackToMenu }) {
  return (
    <div className="results results-placeholder">
      <h2>Results</h2>
      <p>Results screen coming soon.</p>
      {result && (
        <p>
          Score: {result.firstTryCorrect} / {result.total} (mode: {String(mode)})
        </p>
      )}
      <div className="results-buttons">
        <button type="button" onClick={onPlayAgain}>
          Play Again
        </button>
        <button type="button" onClick={onBackToMenu}>
          Back to Menu
        </button>
      </div>
    </div>
  )
}
