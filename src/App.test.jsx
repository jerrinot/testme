import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('App screen state machine', () => {
  it('starts on the menu screen', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    // Game screen should not be mounted yet.
    expect(screen.queryByTestId('game-screen')).toBeNull()
  })

  it.each([
    ['addition', /addition/i],
    ['subtraction', /subtraction/i],
    ['mixed', /mixed/i],
  ])(
    'clicking %s transitions to the game screen for that mode',
    async (mode, buttonLabel) => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: buttonLabel }))
      const gameScreen = screen.getByTestId('game-screen')
      expect(gameScreen).toBeInTheDocument()
      expect(gameScreen).toHaveAttribute('data-mode', mode)
      // Menu title should be gone.
      expect(
        screen.queryByRole('heading', { level: 1, name: /math fun/i }),
      ).toBeNull()
    },
  )

  it('back-to-menu link returns to the menu', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /addition/i }))
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('game-screen')).toBeNull()
  })

  it('back-to-menu then a different mode launches the new mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /addition/i }))
    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    await user.click(screen.getByRole('button', { name: /subtraction/i }))
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-mode',
      'subtraction',
    )
  })
})
