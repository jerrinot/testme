import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Replace Game with a deterministic stub that also exposes the
// `soundOn` prop as a data attribute so we can assert it flowed down
// from App through to Game.
vi.mock('./Game.jsx', () => ({
  default: function MockGame({ mode, soundOn, onFinish, onBackToMenu }) {
    return (
      <div
        data-testid="game-screen"
        data-mode={mode}
        data-sound-on={soundOn ? 'true' : 'false'}
      >
        <button
          type="button"
          onClick={() => onFinish({ mode, firstTryCorrect: 8, total: 10 })}
        >
          finish-round
        </button>
        <button type="button" onClick={onBackToMenu}>
          game-back-to-menu
        </button>
      </div>
    )
  },
}))

import App from './App.jsx'

describe('App — sound toggle (T6)', () => {
  it('defaults to sound off', () => {
    render(<App />)
    const toggle = screen.getByTestId('sound-toggle')
    expect(toggle).toHaveAttribute('data-sound-on', 'false')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking the toggle flips sound on, and another click flips it back off', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByTestId('sound-toggle')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-sound-on', 'true')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('data-sound-on', 'false')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('sound-on state survives menu → game → results → play again → back to menu', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Turn sound on from the menu screen.
    await user.click(screen.getByTestId('sound-toggle'))
    expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
      'data-sound-on',
      'true',
    )

    // Enter a round; Game should receive soundOn=true via props.
    await user.click(screen.getByRole('button', { name: /addition/i }))
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-sound-on',
      'true',
    )
    // Toggle still shows on while on the game screen.
    expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
      'data-sound-on',
      'true',
    )

    // Finish round → results screen. Toggle still on.
    await user.click(screen.getByRole('button', { name: /finish-round/i }))
    expect(
      screen.getByText(/you got 8 out of 10 right on the first try/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
      'data-sound-on',
      'true',
    )

    // Play Again → back on a fresh game; soundOn still propagates.
    await user.click(screen.getByRole('button', { name: /^play again$/i }))
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-sound-on',
      'true',
    )

    // Back to menu → toggle state unchanged.
    await user.click(screen.getByRole('button', { name: /game-back-to-menu/i }))
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('sound-toggle')).toHaveAttribute(
      'data-sound-on',
      'true',
    )
  })

  it('toggling off mid-game is reflected in the Game prop', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Turn on, start a round, then turn off without leaving the round.
    await user.click(screen.getByTestId('sound-toggle'))
    await user.click(screen.getByRole('button', { name: /subtraction/i }))
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-sound-on',
      'true',
    )

    await user.click(screen.getByTestId('sound-toggle'))
    // Same Game instance should now see soundOn=false.
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-sound-on',
      'false',
    )
  })
})
