import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Results, { starsForScore } from './Results.jsx'

function renderResults(overrides = {}) {
  const props = {
    result: { mode: 'addition', firstTryCorrect: 7, total: 10 },
    mode: 'addition',
    onPlayAgain: vi.fn(),
    onBackToMenu: vi.fn(),
    ...overrides,
  }
  render(<Results {...props} />)
  return props
}

describe('starsForScore', () => {
  it.each([
    [0, 1],
    [1, 1],
    [5, 1],
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 3],
    [10, 3],
  ])('firstTryCorrect=%d → %d star(s)', (score, expected) => {
    expect(starsForScore(score)).toBe(expected)
  })
})

describe('Results', () => {
  it('shows the first-try count sentence with the supplied score', () => {
    renderResults({ result: { firstTryCorrect: 8, total: 10 } })
    expect(
      screen.getByText(/you got 8 out of 10 right on the first try/i),
    ).toBeInTheDocument()
  })

  it.each([
    [0, 1],
    [5, 1],
    [6, 2],
    [8, 2],
    [9, 3],
    [10, 3],
  ])('renders %d filled star(s) for a score of %d', (score, expectedStars) => {
    renderResults({ result: { firstTryCorrect: score, total: 10 } })
    const filled = screen
      .getAllByText('⭐')
      .filter((el) => el.dataset.filled === 'true')
    expect(filled).toHaveLength(expectedStars)
    const container = screen.getByRole('img', {
      name: new RegExp(`${expectedStars} out of 3 stars`, 'i'),
    })
    expect(container).toBeInTheDocument()
    expect(container.dataset.stars).toBe(String(expectedStars))
  })

  it('Play Again button calls onPlayAgain', async () => {
    const user = userEvent.setup()
    const { onPlayAgain, onBackToMenu } = renderResults()
    await user.click(screen.getByRole('button', { name: /play again/i }))
    expect(onPlayAgain).toHaveBeenCalledTimes(1)
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('Back to Menu button calls onBackToMenu', async () => {
    const user = userEvent.setup()
    const { onPlayAgain, onBackToMenu } = renderResults()
    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
    expect(onPlayAgain).not.toHaveBeenCalled()
  })

  it('renders safely when result is missing (defensive fallback)', () => {
    render(
      <Results
        result={null}
        mode={null}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />,
    )
    expect(
      screen.getByText(/you got 0 out of 10 right on the first try/i),
    ).toBeInTheDocument()
    // 0/10 is in the 0–5 band → 1 star.
    expect(
      screen.getByRole('img', { name: /1 out of 3 stars/i }),
    ).toBeInTheDocument()
  })
})
