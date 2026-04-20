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
    // Game placeholder should not be visible.
    expect(screen.queryByText(/game:/i)).toBeNull()
  })

  it.each([
    ['addition', /addition/i, /game: addition/i],
    ['subtraction', /subtraction/i, /game: subtraction/i],
    ['mixed', /mixed/i, /game: mixed/i],
  ])(
    'clicking %s transitions to the game screen for that mode',
    async (_mode, buttonLabel, headingText) => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: buttonLabel }))
      expect(
        screen.getByRole('heading', { level: 2, name: headingText }),
      ).toBeInTheDocument()
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
    expect(
      screen.getByRole('heading', { level: 2, name: /game: addition/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/game:/i)).toBeNull()
  })

  it('back-to-menu then a different mode launches the new mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /addition/i }))
    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    await user.click(screen.getByRole('button', { name: /subtraction/i }))
    expect(
      screen.getByRole('heading', { level: 2, name: /game: subtraction/i }),
    ).toBeInTheDocument()
  })
})
