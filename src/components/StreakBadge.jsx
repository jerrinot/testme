/**
 * Floating "N in a row!" badge. Hidden until streak hits 2, then pops
 * on and re-pops every time the streak advances. Remounting on each
 * streak bump (keyed by value) re-plays the entrance animation
 * without requiring an imperative reset.
 */
export default function StreakBadge({ streak }) {
  if (streak < 2) return null
  // A few flavor tiers — the visual intensity ramps with the streak.
  let tier = 'warm'
  if (streak >= 8) tier = 'peak'
  else if (streak >= 5) tier = 'hot'
  return (
    <div
      key={streak}
      className={`streak-badge streak-badge-${tier}`}
      data-testid="streak-badge"
      data-streak={streak}
      role="status"
      aria-live="polite"
    >
      <span className="streak-flame" aria-hidden="true">🔥</span>
      <span className="streak-count">{streak} in a row!</span>
    </div>
  )
}
