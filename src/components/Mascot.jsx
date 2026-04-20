import { useMemo } from 'react'

/**
 * Animal-emoji mascot for the game screen.
 *
 * The emoji list matches SPEC.md. `Mascot` picks one animal per mount:
 * because `Game` uses a `key={roundId}` to remount on Play Again, this
 * naturally rotates the mascot from round to round without any extra
 * bookkeeping here.
 *
 * Props:
 *   - `animal` (optional) — force a specific emoji; used in tests and
 *     storybook-style previews.
 *   - `celebrateTick` (optional) — a counter the parent increments
 *     whenever a correct answer is clicked. Each increment re-keys the
 *     inner `.mascot-body` so the one-shot wiggle keyframe restarts
 *     from frame 0. The idle bounce animation is always on.
 */
const ANIMALS = ['🐶', '🐱', '🦁', '🐰', '🐼', '🦊', '🐸', '🐵', '🐨', '🐷']

export default function Mascot({ animal, celebrateTick = 0 }) {
  // Pick once per mount so the mascot doesn't swap on every re-render.
  // Parent remounts (via `key`) to rotate between rounds.
  const chosen = useMemo(() => {
    if (animal) return animal
    const idx = Math.floor(Math.random() * ANIMALS.length)
    return ANIMALS[idx]
    // `animal` is the only real input; we want a stable pick otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animal])

  const celebrating = celebrateTick > 0

  return (
    <div
      className="mascot"
      data-testid="mascot"
      data-animal={chosen}
      role="img"
      aria-label="Friendly animal mascot"
    >
      <div
        // Remounting on every new celebrate tick restarts the finite
        // wiggle keyframe. The infinite idle bounce lives on the same
        // class and keeps running uninterrupted across remounts because
        // the browser resumes it at time 0 instantly.
        key={celebrateTick}
        className={`mascot-body${celebrating ? ' mascot-celebrating' : ''}`}
      >
        <span className="mascot-emoji" aria-hidden="true">
          {chosen}
        </span>
      </div>
    </div>
  )
}

export { ANIMALS }
