import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Mascot, { ANIMALS } from './Mascot.jsx'

describe('Mascot', () => {
  it('renders a mascot element with role=img and an aria-label', () => {
    render(<Mascot animal="fox" />)
    const mascot = screen.getByRole('img', { name: /mascot/i })
    expect(mascot).toBeInTheDocument()
    expect(mascot).toHaveAttribute('data-animal', 'fox')
  })

  it('renders an <img> with the matching asset src', () => {
    const { container } = render(<Mascot animal="panda" />)
    const img = container.querySelector('.mascot-image')
    expect(img).not.toBeNull()
    expect(img.getAttribute('src')).toMatch(/panda/)
  })

  it('picks one of the known animals when no `animal` prop is given', () => {
    render(<Mascot />)
    const chosen = screen.getByTestId('mascot').getAttribute('data-animal')
    expect(ANIMALS.map((a) => a.id)).toContain(chosen)
  })

  it('stays on the same animal across re-renders when `animal` is fixed', () => {
    const { rerender } = render(<Mascot animal="panda" />)
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-animal', 'panda')
    rerender(<Mascot animal="panda" celebrateTick={2} />)
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-animal', 'panda')
  })

  it('applies the celebrating class when celebrateTick is non-zero', () => {
    const { container, rerender } = render(
      <Mascot animal="koala" celebrateTick={0} />,
    )
    const bodyIdle = container.querySelector('.mascot-body')
    expect(bodyIdle).not.toBeNull()
    expect(bodyIdle.classList.contains('mascot-celebrating')).toBe(false)

    rerender(<Mascot animal="koala" celebrateTick={1} />)
    const bodyCelebrating = container.querySelector('.mascot-body')
    expect(bodyCelebrating.classList.contains('mascot-celebrating')).toBe(true)
  })

  it('exports the full 10-animal rotation', () => {
    expect(ANIMALS).toHaveLength(10)
    for (const id of [
      'dog', 'cat', 'lion', 'rabbit', 'panda',
      'fox', 'frog', 'monkey', 'koala', 'pig',
    ]) {
      expect(ANIMALS.find((a) => a.id === id)).toBeDefined()
    }
  })
})
