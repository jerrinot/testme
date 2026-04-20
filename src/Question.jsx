import { useEffect, useRef, useState } from 'react'

const DEFAULT_CORRECT_DELAY_MS = 700

/**
 * One question: progress line, equation, and a 2x2 grid of 4 answer
 * buttons.
 *
 * Click handling:
 *   - Correct answer: button gets `choice-correct` styling, further
 *     input is locked, and `onCorrect` fires after `correctDelayMs` ms
 *     so the child can see the feedback before the next question
 *     swaps in.
 *   - Wrong answer: button gets `choice-wrong` styling, `onWrong`
 *     fires immediately so the parent can record a mistake for
 *     first-try tracking, and the player can keep trying.
 *
 * `question` matches the shape returned by `generateQuestion` in
 * `lib/questions.js`: `{ a, b, op, answer, choices }`.
 *
 * Feedback lives in local state so it resets automatically when the
 * parent swaps the question by changing this component's `key`.
 */
export default function Question({
  question,
  questionNumber,
  total,
  onCorrect,
  onWrong,
  correctDelayMs = DEFAULT_CORRECT_DELAY_MS,
}) {
  // `feedback` is { value, kind } where kind ∈ {'correct', 'wrong'}.
  // It reflects the most recent click; `value` identifies which
  // button to paint.
  const [feedback, setFeedback] = useState(null)
  // Pending "advance on correct" timer — we clear it on unmount so a
  // rapid back-to-menu can't fire `onCorrect` after the component is
  // already gone.
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const locked = feedback?.kind === 'correct'

  const handleClick = (choice) => {
    // Once the right answer has been registered we're waiting to
    // advance; ignore any further clicks (including wrong ones).
    if (locked) return
    if (choice === question.answer) {
      setFeedback({ value: choice, kind: 'correct' })
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        onCorrect()
      }, correctDelayMs)
    } else {
      setFeedback({ value: choice, kind: 'wrong' })
      onWrong()
    }
  }

  const { a, b, op, choices } = question

  return (
    <div className="question">
      <div className="question-progress">
        Question {questionNumber} / {total}
      </div>
      <div className="equation" data-testid="equation">
        <span className="equation-a">{a}</span>{' '}
        <span className="equation-op">{op}</span>{' '}
        <span className="equation-b">{b}</span> ={' '}
        <span className="equation-answer">?</span>
      </div>
      <div className="choices">
        {choices.map((choice, idx) => {
          const highlighted = feedback && feedback.value === choice
          let cls = 'choice'
          if (highlighted) {
            cls += feedback.kind === 'correct' ? ' choice-correct' : ' choice-wrong'
          }
          return (
            <button
              key={idx}
              type="button"
              className={cls}
              onClick={() => handleClick(choice)}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
