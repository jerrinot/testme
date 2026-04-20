import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Question from './Question.jsx'

// Distinct choices so role queries aren't ambiguous.
const sampleQuestion = {
  a: 7,
  b: 5,
  op: '+',
  answer: 12,
  choices: [10, 12, 13, 14],
}

function renderQuestion(overrides = {}) {
  const props = {
    question: sampleQuestion,
    questionNumber: 1,
    total: 10,
    onCorrect: vi.fn(),
    onWrong: vi.fn(),
    correctDelayMs: 0,
    ...overrides,
  }
  render(<Question {...props} />)
  return props
}

describe('Question', () => {
  it('renders progress, equation, and all four choice buttons', () => {
    renderQuestion()
    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument()
    const bar = screen.getByTestId('progress-bar')
    const dots = bar.querySelectorAll('.progress-dot')
    expect(dots).toHaveLength(10)
    expect(dots[0].dataset.state).toBe('current')
    const equation = screen.getByTestId('equation')
    expect(equation).toHaveTextContent('7')
    expect(equation).toHaveTextContent('+')
    expect(equation).toHaveTextContent('5')
    expect(equation).toHaveTextContent('?')
    for (const v of [10, 12, 13, 14]) {
      expect(
        screen.getByRole('button', { name: String(v) }),
      ).toBeInTheDocument()
    }
  })

  it('calls onCorrect after the delay when the correct choice is clicked', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    renderQuestion({ onCorrect, onWrong, correctDelayMs: 0 })

    await user.click(screen.getByRole('button', { name: '12' }))
    // Correct styling applied immediately.
    expect(screen.getByRole('button', { name: '12' })).toHaveClass(
      'choice-correct',
    )
    await waitFor(() => expect(onCorrect).toHaveBeenCalledTimes(1))
    expect(onWrong).not.toHaveBeenCalled()
  })

  it('delays calling onCorrect by roughly the configured amount', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    renderQuestion({ onCorrect, correctDelayMs: 80 })

    const start = Date.now()
    await user.click(screen.getByRole('button', { name: '12' }))
    // Not called synchronously on click.
    expect(onCorrect).not.toHaveBeenCalled()
    await waitFor(() => expect(onCorrect).toHaveBeenCalledTimes(1))
    const elapsed = Date.now() - start
    // Allow generous slack for a loaded CI; we just want to prove
    // there *was* a delay and it fired afterward.
    expect(elapsed).toBeGreaterThanOrEqual(60)
  })

  it('calls onWrong immediately when a wrong choice is clicked, and allows retry', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    renderQuestion({ onCorrect, onWrong, correctDelayMs: 0 })

    await user.click(screen.getByRole('button', { name: '10' }))
    expect(onWrong).toHaveBeenCalledTimes(1)
    expect(onCorrect).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '10' })).toHaveClass(
      'choice-wrong',
    )

    // Retry with a different wrong choice.
    await user.click(screen.getByRole('button', { name: '13' }))
    expect(onWrong).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: '13' })).toHaveClass(
      'choice-wrong',
    )
    // Previous wrong feedback moves on — we track "last clicked".
    expect(screen.getByRole('button', { name: '10' })).not.toHaveClass(
      'choice-wrong',
    )

    // Finally the right one — onCorrect fires.
    await user.click(screen.getByRole('button', { name: '12' }))
    await waitFor(() => expect(onCorrect).toHaveBeenCalledTimes(1))
  })

  it('locks further clicks after the correct answer is selected', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    // Long enough that we can click again within the window before
    // onCorrect is dispatched.
    renderQuestion({ onCorrect, onWrong, correctDelayMs: 200 })

    await user.click(screen.getByRole('button', { name: '12' }))
    // While waiting to advance, further wrong clicks are ignored.
    await user.click(screen.getByRole('button', { name: '10' }))
    expect(onWrong).not.toHaveBeenCalled()
    // The only highlighted button is still the correct one.
    expect(screen.getByRole('button', { name: '10' })).not.toHaveClass(
      'choice-wrong',
    )
    expect(screen.getByRole('button', { name: '12' })).toHaveClass(
      'choice-correct',
    )

    // Eventually the delayed onCorrect fires.
    await waitFor(() => expect(onCorrect).toHaveBeenCalledTimes(1))
  })
})
