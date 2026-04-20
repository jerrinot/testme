import { useMemo, useState } from 'react'
import Question from './Question.jsx'
import Mascot, { ANIMALS } from './components/Mascot.jsx'
import StreakBadge from './components/StreakBadge.jsx'
import Encouragement, { pickEncouragement } from './components/Encouragement.jsx'
import { generateQuestion } from './lib/questions.js'
import { playAnimal } from './lib/sound.js'

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
  soundOn = false,
  unlockedMascots,
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
  // Consecutive first-try corrects. Reset whenever a wrong answer is
  // clicked; a correct that arrives *after* a wrong on the same
  // question also doesn't count (same rule as firstTryCorrect).
  const [streak, setStreak] = useState(0)
  // Encouragement toast — tick drives the remount, message is the
  // text currently floating. Keeping them together lets the component
  // stay pure.
  const [encourage, setEncourage] = useState({ tick: 0, message: null })
  // Pick the mascot once per round so Game and Mascot agree on the
  // animal — Game needs the id to play the matching sound clip when
  // the child clicks correct. Pull from the unlocked list so a fresh
  // player only meets friends they've earned.
  const animal = useMemo(() => {
    const pool =
      unlockedMascots && unlockedMascots.length
        ? unlockedMascots
        : ANIMALS.map((a) => a.id)
    return pool[Math.floor(Math.random() * pool.length)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Streak breaks on the first wrong click of a question; further
    // wrong clicks don't matter because the streak is already 0.
    setStreak(0)
  }

  const handleCorrectClick = () => {
    setCelebrateTick((n) => n + 1)
    // Encouragement + streak ride on first-try corrects only. A late
    // correct (after a wrong on the same question) still bumps the
    // celebration tick but doesn't reward a streak.
    if (!hadWrongThisQuestion) {
      const nextStreak = streak + 1
      const nextTick = encourage.tick + 1
      setStreak(nextStreak)
      setEncourage({
        tick: nextTick,
        message: pickEncouragement({
          streak: nextStreak,
          questionNumber: index + 1,
          total,
          tick: nextTick,
        }),
      })
    }
    if (soundOn) {
      // Layered on top of the Question's own "correct" chime; the
      // animal clip is the flavor, the chime is the guaranteed signal.
      playAnimal(animal)
    }
  }

  const question = questions[index]

  return (
    <div className="game" data-testid="game-screen" data-mode={mode}>
      <StreakBadge streak={streak} />
      <Mascot animal={animal} celebrateTick={celebrateTick} />
      <Encouragement tick={encourage.tick} message={encourage.message} />
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
        soundOn={soundOn}
        correctDelayMs={correctDelayMs}
      />
      <button type="button" className="back-link" onClick={onBackToMenu}>
        ← Back to menu
      </button>
    </div>
  )
}
