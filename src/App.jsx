import { useState } from 'react'
import Menu from './Menu.jsx'
import Game from './Game.jsx'
import Results from './Results.jsx'
import Backdrop from './components/Backdrop.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import { loadProgress, recordRound } from './lib/progress.js'

/**
 * Top-level state machine for the math-practice app.
 *
 * Screens:
 *   - 'menu'    — pick a mode
 *   - 'game'    — play one round of 10 questions
 *   - 'results' — see score and replay controls
 *
 * `mode` is one of 'addition' | 'subtraction' | 'mixed' once a game has
 * started; it stays set across game → results so "Play Again" can reuse
 * the same mode without going through the menu.
 *
 * `roundId` increments every time a new round starts. It's used as a
 * `key` on the `<Game>` element to guarantee a full remount on Play
 * Again — this throws away the previous round's questions, progress,
 * and feedback state, which is the behavior PLAN.md T4 asks for.
 *
 * `soundOn` (T6) is lifted up here so the toggle survives screen
 * transitions within a session. Default is off per SPEC.md; we do not
 * persist to localStorage — reloading the tab starts silent.
 */
export default function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState(null)
  const [result, setResult] = useState(null)
  const [roundId, setRoundId] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  // Persistent progress — loaded once from localStorage, updated
  // imperatively on round completion. The whole object is treated as
  // immutable so `setProgress(next)` always re-renders dependents.
  const [progress, setProgress] = useState(() => loadProgress())

  const startGame = (selectedMode) => {
    setMode(selectedMode)
    setResult(null)
    setRoundId((n) => n + 1)
    setScreen('game')
  }

  const finishGame = (gameResult) => {
    // Persist the round; the library hands back the fresh progress
    // snapshot and the mascot (if any) that just got unlocked so the
    // Results screen can surface the "new friend!" moment.
    const { progress: nextProgress, newMascot } = recordRound(gameResult)
    setProgress(nextProgress)
    setResult({ ...gameResult, newMascot })
    setScreen('results')
  }

  const backToMenu = () => {
    setScreen('menu')
  }

  const playAgain = () => {
    // Restart the same mode with a fresh game. Bumping roundId
    // changes the Game component's `key`, which forces a clean
    // remount — new questions, progress=0, no stale feedback.
    setResult(null)
    setRoundId((n) => n + 1)
    setScreen('game')
  }

  const toggleSound = () => {
    setSoundOn((v) => !v)
  }

  return (
    <div className="app">
      <Backdrop />
      {/* Pinned corner toggle — lives outside the per-screen content
          so it renders on every screen and its `on` state survives
          every transition. */}
      <SoundToggle on={soundOn} onToggle={toggleSound} />
      {screen === 'menu' && (
        <Menu onSelectMode={startGame} progress={progress} />
      )}
      {screen === 'game' && (
        <Game
          key={roundId}
          mode={mode}
          soundOn={soundOn}
          unlockedMascots={progress.unlockedMascots}
          onFinish={finishGame}
          onBackToMenu={backToMenu}
        />
      )}
      {screen === 'results' && (
        <Results
          result={result}
          mode={mode}
          onPlayAgain={playAgain}
          onBackToMenu={backToMenu}
        />
      )}
    </div>
  )
}
