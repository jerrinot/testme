/**
 * Home screen. Three large mode buttons; tapping one calls
 * `onSelectMode(mode)` which transitions the app to the game screen.
 */
const MODE_BUTTONS = [
  { mode: 'addition', label: 'Addition', emoji: '➕' },
  { mode: 'subtraction', label: 'Subtraction', emoji: '➖' },
  { mode: 'mixed', label: 'Mixed', emoji: '🔀' },
]

export default function Menu({ onSelectMode }) {
  return (
    <div className="menu">
      <h1 className="menu-title">Math Fun! 🐾</h1>
      <p className="menu-subtitle">Pick a game to start practicing!</p>
      <div className="menu-buttons">
        {MODE_BUTTONS.map(({ mode, label, emoji }) => (
          <button
            key={mode}
            type="button"
            className={`mode-button mode-${mode}`}
            onClick={() => onSelectMode(mode)}
          >
            <span className="mode-emoji" aria-hidden="true">
              {emoji}
            </span>
            <span className="mode-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
