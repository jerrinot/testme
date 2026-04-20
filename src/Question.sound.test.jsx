import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the sound module so we can observe the call surface without
// actually depending on Web Audio APIs (which jsdom does not
// implement). The factory is hoisted by vitest above the imports.
vi.mock('./lib/sound.js', () => ({
  playTone: vi.fn(),
}))

import Question from './Question.jsx'
import { playTone } from './lib/sound.js'

const sampleQuestion = {
  a: 2,
  b: 3,
  op: '+',
  answer: 5,
  choices: [3, 4, 5, 6],
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

describe('Question — sound toggle integration', () => {
  beforeEach(() => {
    playTone.mockClear()
  })

  it('does not play any tone when soundOn is false (the default)', async () => {
    const user = userEvent.setup()
    renderQuestion({ soundOn: false })
    await user.click(screen.getByRole('button', { name: '5' })) // correct
    expect(playTone).not.toHaveBeenCalled()
    // Render a fresh Question to try a wrong answer on a clean
    // (non-locked) component.
    render(
      <Question
        question={sampleQuestion}
        questionNumber={1}
        total={10}
        onCorrect={vi.fn()}
        onWrong={vi.fn()}
        correctDelayMs={0}
        soundOn={false}
      />,
    )
    // Two instances are mounted now, so match on the wrong-answer
    // buttons via getAllByRole and click the first of each.
    await user.click(screen.getAllByRole('button', { name: '3' })[0])
    expect(playTone).not.toHaveBeenCalled()
  })

  it('plays the correct tone on a right answer when soundOn is true', async () => {
    const user = userEvent.setup()
    renderQuestion({ soundOn: true })
    await user.click(screen.getByRole('button', { name: '5' }))
    expect(playTone).toHaveBeenCalledTimes(1)
    expect(playTone).toHaveBeenCalledWith('correct')
  })

  it('plays the wrong tone on each wrong click when soundOn is true', async () => {
    const user = userEvent.setup()
    renderQuestion({ soundOn: true })
    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: '4' }))
    expect(playTone).toHaveBeenCalledTimes(2)
    expect(playTone).toHaveBeenNthCalledWith(1, 'wrong')
    expect(playTone).toHaveBeenNthCalledWith(2, 'wrong')
  })
})
