/**
 * Small speaker icon pinned to the top-right corner that flips the
 * app-wide sound flag.
 *
 * Per T6 this is intentionally stateless — the `on` boolean lives in
 * `App.jsx` so it persists across menu/game/results transitions. The
 * icon swaps between 🔇 (muted, default) and 🔊 (on). `aria-pressed`
 * exposes the toggled state to assistive tech.
 */
export default function SoundToggle({ on, onToggle }) {
  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' sound-toggle-on' : ''}`}
      data-testid="sound-toggle"
      data-sound-on={on ? 'true' : 'false'}
      aria-pressed={on ? 'true' : 'false'}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on — click to mute' : 'Sound off — click to enable'}
      onClick={onToggle}
    >
      <span className="sound-toggle-icon" aria-hidden="true">
        {on ? '🔊' : '🔇'}
      </span>
    </button>
  )
}
