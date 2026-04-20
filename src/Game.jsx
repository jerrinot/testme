import { useMemo, useState } from 'react'
import Question from './Question.jsx'
import Mascot from './components/Mascot.jsx'
import { generateQuestion } from './lib/questions.js'

const TOTAL_QUESTIONS = 10

/**
 * Runs one 10-question round for the selected `mode`.
 *
 * Generates all questions up front so every round is a stable list;
 * tracks three pieces of state:
 *   - `index` — which question is on screen (0-based).
 *   - `firstTryCorrect` — how many questions the player got right on
 *     their very first click. Committed when we advance (not when a
 *     button is clicked), so it only counts the final, correct click.
 *   - `hadWrongThisQuestion` — whether a wrong answer was clicked for
 *     the current question; this is the gate for first-try credit.
 *     Resets when we advance.
 *
 * When the 10th correct click resolves, we call
 * `onFinish({ mode, firstTryCorrect, total })` instead of advancing;
 * the parent then transitions to the results screen.
 *
 * Props (beyond the obvious):
 *   - `total` — override the round length (used in tests).
 *   - `correctDelayMs` — forwarded to `Question`; tests pass 0 to
 *     skip the 700ms feedback delay.
 *   - `questions` — optional pre-built question list that skips
 *     generation. Intended for deterministic tests.
 */
export default function Game({
  mode,
  onFinish,
  onBackToMenu,
  total = TOTAL_QUESTIONS,
  correctDelayMs,
  questions: providedQuestions,
}) {
  const questions = useMemo(() => {
    if (providedQuestions) return providedQuestions
    const arr = []
    for (let i = 0; i < total; i++) {
      arr.push(generateQuestion(mode))
    }
    return arr
    // providedQuestions is treated as a fixed injection — changing it
    // mid-round is not expected, so it's intentionally excluded from
    // the dep list to avoid reshuffling partway through a round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, total])

  const [index, setIndex] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [hadWrongThisQuestion, setHadWrongThisQuestion] = useState(false)
  // Counter the Mascot keys off to restart its wiggle animation each
  // time a correct answer is clicked. Idle bounce runs continuously; a
  // bump here overlays a one-shot jump-wiggle.
  const [celebrateTick, setCelebrateTick] = useState(0)

  const handleCorrect = () => {
    const gotFirstTry = !hadWrongThisQuestion
    const nextFirstTry = firstTryCorrect + (gotFirstTry ? 1 : 0)
    const nextIndex = index + 1
    if (nextIndex >= total) {
      onFinish({ mode, firstTryCorrect: nextFirstTry, total })
      return
    }
    setFirstTryCorrect(nextFirstTry)
    setIndex(nextIndex)
    setHadWrongThisQuestion(false)
  }

  const handleWrong = () => {
    setHadWrongThisQuestion(true)
  }

  const handleCorrectClick = () => {
    setCelebrateTick((n) => n + 1)
  }

  const question = questions[index]

  return (
    <div className="game" data-testid="game-screen" data-mode={mode}>
      <Mascot celebrateTick={celebrateTick} />
      <Question
        // `key` forces a fresh Question instance per round position so
        // feedback state resets cleanly on advance.
        key={index}
        question={question}
        questionNumber={index + 1}
        total={total}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        onCorrectClick={handleCorrectClick}
        correctDelayMs={correctDelayMs}
      />
      <button type="button" className="back-link" onClick={onBackToMenu}>
        ← Back to menu
      </button>
    </div>
  )
}
