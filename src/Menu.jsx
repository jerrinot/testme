import Collection from './components/Collection.jsx'

/**
 * Home screen. Three large mode buttons plus a friends shelf that
 * grows as you play rounds. Tapping a mode calls `onSelectMode(mode)`.
 */
const MODE_BUTTONS = [
  { mode: 'addition', label: 'Addition', emoji: '➕' },
  { mode: 'subtraction', label: 'Subtraction', emoji: '➖' },
  { mode: 'mixed', label: 'Mixed', emoji: '🔀' },
]

export default function Menu({ onSelectMode, progress }) {
  const unlocked = progress?.unlockedMascots ?? []
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
      <Collection unlocked={unlocked} />
    </div>
  )
}
