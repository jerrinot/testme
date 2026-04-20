/**
 * Chunky dot-row progress indicator. One dot per question; the dots
 * before `current` are "done", `current` itself pulses, and later
 * dots sit faded. Screen readers get a text announcement via the
 * sibling visually-hidden span in Question.jsx — this is decorative.
 */
export default function ProgressBar({ current, total }) {
  return (
    <div className="progress-bar" aria-hidden="true" data-testid="progress-bar">
      {Array.from({ length: total }, (_, i) => {
        let state = 'upcoming'
        if (i < current - 1) state = 'done'
        else if (i === current - 1) state = 'current'
        return (
          <span
            key={i}
            className={`progress-dot progress-dot-${state}`}
            data-state={state}
          />
        )
      })}
    </div>
  )
}
