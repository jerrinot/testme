import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Mascot, { ANIMALS } from './Mascot.jsx'

describe('Mascot', () => {
  it('renders a mascot element with role=img and an aria-label', () => {
    render(<Mascot animal="🦊" />)
    const mascot = screen.getByRole('img', { name: /mascot/i })
    expect(mascot).toBeInTheDocument()
    expect(mascot).toHaveAttribute('data-animal', '🦊')
    expect(mascot).toHaveTextContent('🦊')
  })

  it('picks one of the SPEC animals when no `animal` prop is given', () => {
    render(<Mascot />)
    const mascot = screen.getByTestId('mascot')
    const chosen = mascot.getAttribute('data-animal')
    expect(ANIMALS).toContain(chosen)
  })

  it('stays on the same animal across re-renders when `animal` is fixed', () => {
    const { rerender } = render(<Mascot animal="🐼" />)
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-animal', '🐼')
    rerender(<Mascot animal="🐼" celebrateTick={2} />)
    expect(screen.getByTestId('mascot')).toHaveAttribute('data-animal', '🐼')
  })

  it('applies the celebrating class when celebrateTick is non-zero', () => {
    const { container, rerender } = render(
      <Mascot animal="🐨" celebrateTick={0} />,
    )
    const bodyIdle = container.querySelector('.mascot-body')
    expect(bodyIdle).not.toBeNull()
    expect(bodyIdle.classList.contains('mascot-celebrating')).toBe(false)

    rerender(<Mascot animal="🐨" celebrateTick={1} />)
    const bodyCelebrating = container.querySelector('.mascot-body')
    expect(bodyCelebrating.classList.contains('mascot-celebrating')).toBe(true)
  })

  it('exports the SPEC.md animal list (10 emoji)', () => {
    // Sanity check: if someone trims the list, this test flags it
    // immediately rather than silently shrinking rotation variety.
    expect(ANIMALS).toHaveLength(10)
    for (const a of ['🐶', '🐱', '🦁', '🐰', '🐼', '🦊', '🐸', '🐵', '🐨', '🐷']) {
      expect(ANIMALS).toContain(a)
    }
  })
})
