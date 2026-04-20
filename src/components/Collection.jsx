import { ANIMALS } from './Mascot.jsx'
import { MASCOT_UNLOCK_ORDER } from '../lib/progress.js'

/**
 * "Friends shelf" shown on the home screen. Every mascot in the
 * unlock order gets a slot; unlocked ones show the full portrait,
 * locked ones show a faded silhouette with a lock glyph.
 *
 * The shelf is purely informational — it doesn't accept clicks. If
 * we later add "pick your friend", this is where that lives.
 */
export default function Collection({ unlocked }) {
  const unlockedSet = new Set(unlocked)
  const unlockedCount = unlockedSet.size
  const total = MASCOT_UNLOCK_ORDER.length
  return (
    <div className="collection" data-testid="collection">
      <div className="collection-header">
        <span className="collection-title">Your friends</span>
        <span className="collection-count">
          {unlockedCount} / {total}
        </span>
      </div>
      <div className="collection-shelf">
        {MASCOT_UNLOCK_ORDER.map((id) => {
          const animal = ANIMALS.find((a) => a.id === id)
          const isUnlocked = unlockedSet.has(id)
          return (
            <div
              key={id}
              className={`collection-slot${
                isUnlocked ? ' collection-slot-unlocked' : ' collection-slot-locked'
              }`}
              data-animal={id}
              data-locked={isUnlocked ? 'false' : 'true'}
              title={isUnlocked ? id : 'Locked — play another round to unlock!'}
            >
              <img
                className="collection-slot-image"
                src={animal?.src}
                alt={isUnlocked ? id : ''}
                aria-hidden={isUnlocked ? 'false' : 'true'}
              />
              {!isUnlocked && (
                <span className="collection-slot-lock" aria-hidden="true">
                  🔒
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
