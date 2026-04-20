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
 */
export default function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState(null)
  // `result` is populated by the Game screen when a round ends; T2
  // ships a placeholder Results screen so the state machine compiles.
  const [result, setResult] = useState(null)

  const startGame = (selectedMode) => {
    setMode(selectedMode)
    setResult(null)
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
    // Restart the same mode with a fresh game.
    setResult(null)
    setScreen('game')
  }

  return (
    <div className="app">
      {screen === 'menu' && <Menu onSelectMode={startGame} />}
      {screen === 'game' && (
        <Game mode={mode} onFinish={finishGame} onBackToMenu={backToMenu} />
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
