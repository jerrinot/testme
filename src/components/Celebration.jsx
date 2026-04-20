/**
 * Celebration overlay — a pure-CSS burst of emoji flecks that fly
 * outward from the container centre. Used in two places:
 *
 *   - `kind="stars"` — short star-burst shown under the current
 *     question when the child clicks the correct answer.
 *   - `kind="confetti"` — longer, denser, multi-colour confetti shown
 *     on the results screen.
 *
 * Rendering is gated on `active` so we can cheaply leave the element
 * in the tree and just toggle it. When inactive it returns `null` so
 * no DOM churn happens.
 *
 * The visual work is done via CSS keyframes + per-piece custom
 * properties (`--angle`, `--distance`, `--delay`, `--hue`) so each
 * piece flies in a different direction with a different hue. See
 * `index.css` for the keyframe definitions.
 *
 * The overlay is `aria-hidden` — it's purely decorative, and duplicating
 * the score/feedback through screen readers would be noisy.
 */
const STAR_GLYPHS = ['⭐', '✨', '🌟', '💫']
const CONFETTI_GLYPHS = ['🎉', '🎊', '⭐', '✨', '💖', '🌟', '🎈', '🏆']

export default function Celebration({
  active,
  kind = 'stars',
  pieces,
  seed = 0,
}) {
  if (!active) return null

  const defaultPieces = kind === 'confetti' ? 36 : 16
  const count = pieces ?? defaultPieces
  const glyphs = kind === 'confetti' ? CONFETTI_GLYPHS : STAR_GLYPHS

  return (
    <div
      className={`celebration celebration-${kind}`}
      data-testid="celebration"
      data-kind={kind}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        // Scatter pieces evenly around 360° with a small per-piece
        // jitter so they don't look mechanical. `seed` lets the parent
        // re-randomize the pattern across activations if it wants to,
        // but it's fine to leave at 0.
        const angle = (360 / count) * i + ((seed * 37 + i * 13) % 40) - 20
        const distance =
          kind === 'confetti' ? 55 + ((i * 17 + seed) % 35) : 80 + ((i * 11) % 25)
        const delay = (i % 8) * 40
        const hue = (i * 47 + seed * 23) % 360
        const glyph = glyphs[i % glyphs.length]
        const style = {
          '--angle': `${angle}deg`,
          '--distance': `${distance}%`,
          '--delay': `${delay}ms`,
          '--hue': hue,
        }
        return (
          <span
            key={i}
            className="celebration-piece"
            data-testid="celebration-piece"
            style={style}
          >
            {glyph}
          </span>
        )
      })}
    </div>
  )
}
