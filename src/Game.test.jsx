import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Game from './Game.jsx'

// Deterministic round: every question has answer=5 and choices
// [1, 2, 3, 5]. Because each Question remounts when the round index
// changes, reusing the same shape across questions is fine.
function makeQuestions(n = 10) {
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push({
      a: 3,
      b: 2,
      op: '+',
      answer: 5,
      choices: [1, 2, 3, 5],
    })
  }
  return arr
}

function renderGame(overrides = {}) {
  const props = {
    mode: 'addition',
    onFinish: vi.fn(),
    onBackToMenu: vi.fn(),
    questions: makeQuestions(),
    correctDelayMs: 0,
    ...overrides,
  }
  render(<Game {...props} />)
  return props
}

async function answerCorrectly(user) {
  await user.click(screen.getByRole('button', { name: '5' }))
}

describe('Game', () => {
  it('renders the first question with "Question 1 / 10"', () => {
    renderGame()
    expect(screen.getByText(/question 1 \/ 10/i)).toBeInTheDocument()
    expect(screen.getByTestId('game-screen')).toHaveAttribute(
      'data-mode',
      'addition',
    )
  })

  it('wrong answers do not advance and do not call onFinish', async () => {
    const user = userEvent.setup()
    const { onFinish } = renderGame()
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByText(/question 1 \/ 10/i)).toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('correct answer advances to the next question', async () => {
    const user = userEvent.setup()
    const { onFinish } = renderGame()
    await answerCorrectly(user)
    await waitFor(() =>
      expect(screen.getByText(/question 2 \/ 10/i)).toBeInTheDocument(),
    )
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('finishes after 10 correct answers and reports firstTryCorrect=10', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    renderGame({ mode: 'mixed', onFinish })

    for (let i = 1; i <= 10; i++) {
      await waitFor(() =>
        expect(
          screen.getByText(new RegExp(`question ${i} / 10`, 'i')),
        ).toBeInTheDocument(),
      )
      await answerCorrectly(user)
    }
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
    expect(onFinish).toHaveBeenCalledWith({
      mode: 'mixed',
      firstTryCorrect: 10,
      total: 10,
    })
  })

  it('wrong-before-correct on a question does not count toward first-try', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    renderGame({ onFinish })

    // Q1: wrong then right → no first-try credit.
    await user.click(screen.getByRole('button', { name: '1' }))
    await answerCorrectly(user)
    await waitFor(() =>
      expect(screen.getByText(/question 2 \/ 10/i)).toBeInTheDocument(),
    )
    // Q2..Q10: clean first-try correct.
    for (let i = 2; i <= 10; i++) {
      await answerCorrectly(user)
      if (i < 10) {
        await waitFor(() =>
          expect(
            screen.getByText(new RegExp(`question ${i + 1} / 10`, 'i')),
          ).toBeInTheDocument(),
        )
      }
    }
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
    expect(onFinish).toHaveBeenCalledWith({
      mode: 'addition',
      firstTryCorrect: 9,
      total: 10,
    })
  })

  it('multiple wrong answers on one question still only lose a single first-try credit', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    renderGame({ onFinish })

    // Q1: three wrongs then right.
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    await answerCorrectly(user)
    await waitFor(() =>
      expect(screen.getByText(/question 2 \/ 10/i)).toBeInTheDocument(),
    )
    for (let i = 2; i <= 10; i++) {
      await answerCorrectly(user)
      if (i < 10) {
        await waitFor(() =>
          expect(
            screen.getByText(new RegExp(`question ${i + 1} / 10`, 'i')),
          ).toBeInTheDocument(),
        )
      }
    }
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
    expect(onFinish).toHaveBeenCalledWith({
      mode: 'addition',
      firstTryCorrect: 9,
      total: 10,
    })
  })

  it('back-to-menu button calls onBackToMenu', async () => {
    const user = userEvent.setup()
    const onBackToMenu = vi.fn()
    renderGame({ onBackToMenu })
    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('generates real questions with a matching answer when no override is provided', async () => {
    // With no `questions` prop we hit the real `generateQuestion`
    // path. Parse the rendered equation and click the button whose
    // label equals the computed answer — proves end-to-end wiring.
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(
      <Game
        mode="addition"
        onFinish={onFinish}
        onBackToMenu={vi.fn()}
        correctDelayMs={0}
      />,
    )
    const equation = screen.getByTestId('equation').textContent
    const m = /(\d+)\s*([+-])\s*(\d+)/.exec(equation)
    expect(m).not.toBeNull()
    const [, aStr, op, bStr] = m
    const a = Number(aStr)
    const b = Number(bStr)
    const answer = op === '+' ? a + b : a - b
    await user.click(screen.getByRole('button', { name: String(answer) }))
    await waitFor(() =>
      expect(screen.getByText(/question 2 \/ 10/i)).toBeInTheDocument(),
    )
  })
})
