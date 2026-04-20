import { useState } from 'react'
import Menu from './Menu.jsx'
import Game from './Game.jsx'
import Results from './Results.jsx'

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
 */
export default function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState(null)
  const [result, setResult] = useState(null)
  const [roundId, setRoundId] = useState(0)

  const startGame = (selectedMode) => {
    setMode(selectedMode)
    setResult(null)
    setRoundId((n) => n + 1)
    setScreen('game')
  }

  const finishGame = (gameResult) => {
    setResult(gameResult)
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

  return (
    <div className="app">
      {screen === 'menu' && <Menu onSelectMode={startGame} />}
      {screen === 'game' && (
        <Game
          key={roundId}
          mode={mode}
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
