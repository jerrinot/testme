import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Replace the real Game with a deterministic stub so we can drive the
// full menu → game → results → (play again | back to menu) flow
// through App without having to play an actual 10-question round.
// Every render of this stub bumps a module-scoped mount counter so a
// test can tell whether Play Again triggered a fresh remount (it
// should: App uses a `key` prop tied to `roundId`).
//
// `vi.mock` is hoisted above the imports, so the mock factory can't
// close over module-scope variables. We stash the counter on a
// dynamically-created global that both the factory and the tests can
// read.
vi.mock('./Game.jsx', () => {
  globalThis.__gameMountCount = 0
  return {
    default: function MockGame({ mode, onFinish, onBackToMenu }) {
      globalThis.__gameMountCount += 1
      const instanceId = globalThis.__gameMountCount
      return (
        <div
          data-testid="game-screen"
          data-mode={mode}
          data-instance={instanceId}
        >
          <span data-testid="mount-id">{instanceId}</span>
          <button
            type="button"
            onClick={() =>
              onFinish({ mode, firstTryCorrect: 7, total: 10 })
            }
          >
            finish-round
          </button>
          <button type="button" onClick={onBackToMenu}>
            game-back-to-menu
          </button>
        </div>
      )
    },
  }
})

import App from './App.jsx'

describe('App — results screen integration', () => {
  it('finishing a round transitions to the results screen with the score', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /addition/i }))
    await user.click(screen.getByRole('button', { name: /finish-round/i }))

    // Game is gone; results shows the first-try score sentence.
    expect(screen.queryByTestId('game-screen')).toBeNull()
    expect(
      screen.getByText(/you got 7 out of 10 right on the first try/i),
    ).toBeInTheDocument()
    // 7 is in the 6–8 band → 2 stars.
    expect(
      screen.getByRole('img', { name: /2 out of 3 stars/i }),
    ).toBeInTheDocument()
  })

  it('Play Again restarts the same mode with a fresh Game instance', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /subtraction/i }))
    const firstMount = Number(screen.getByTestId('mount-id').textContent)

    await user.click(screen.getByRole('button', { name: /finish-round/i }))
    await user.click(screen.getByRole('button', { name: /^play again$/i }))

    // Back on the game screen, same mode.
    const gameScreen = screen.getByTestId('game-screen')
    expect(gameScreen).toHaveAttribute('data-mode', 'subtraction')
    // A different instance id proves the Game was remounted (not just
    // re-rendered), which is what clears round state.
    const secondMount = Number(screen.getByTestId('mount-id').textContent)
    expect(secondMount).toBeGreaterThan(firstMount)
  })

  it('Back to Menu from the results screen returns to the menu', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /mixed/i }))
    await user.click(screen.getByRole('button', { name: /finish-round/i }))

    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('game-screen')).toBeNull()
  })
})
