/**
 * Placeholder game screen.
 *
 * T2 only wires up screen transitions: this just shows which mode was
 * picked and offers a back-to-menu link. T3 replaces this with real
 * round logic and the Question component.
 */
const MODE_LABELS = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  mixed: 'Mixed',
}

export default function Game({ mode, onBackToMenu /* , onFinish */ }) {
  const label = MODE_LABELS[mode] ?? 'Unknown mode'
  return (
    <div className="game game-placeholder">
      <h2>Game: {label}</h2>
      <p>Game screen coming soon. (mode: {String(mode)})</p>
      <button type="button" className="back-link" onClick={onBackToMenu}>
        ← Back to menu
      </button>
    </div>
  )
}
