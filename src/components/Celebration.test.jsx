import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Celebration from './Celebration.jsx'

describe('Celebration', () => {
  it('renders nothing when inactive', () => {
    const { container } = render(<Celebration active={false} />)
    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('celebration')).toBeNull()
  })

  it('renders a star-burst overlay with multiple pieces when active', () => {
    render(<Celebration active kind="stars" />)
    const overlay = screen.getByTestId('celebration')
    expect(overlay).toHaveAttribute('data-kind', 'stars')
    expect(overlay).toHaveClass('celebration-stars')
    const pieces = screen.getAllByTestId('celebration-piece')
    expect(pieces.length).toBeGreaterThanOrEqual(8)
  })

  it('renders the confetti variant with a distinct class and more pieces', () => {
    render(<Celebration active kind="confetti" />)
    const overlay = screen.getByTestId('celebration')
    expect(overlay).toHaveAttribute('data-kind', 'confetti')
    expect(overlay).toHaveClass('celebration-confetti')
    const pieces = screen.getAllByTestId('celebration-piece')
    expect(pieces.length).toBeGreaterThanOrEqual(24)
  })

  it('is aria-hidden so screen readers skip decorative pieces', () => {
    render(<Celebration active kind="stars" />)
    expect(screen.getByTestId('celebration')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('honours a custom `pieces` count', () => {
    render(<Celebration active kind="stars" pieces={5} />)
    const pieces = screen.getAllByTestId('celebration-piece')
    expect(pieces).toHaveLength(5)
  })

  it('sets the custom CSS properties each piece needs for its keyframes', () => {
    render(<Celebration active kind="stars" pieces={4} />)
    const pieces = screen.getAllByTestId('celebration-piece')
    for (const p of pieces) {
      // Each piece gets --angle / --distance / --delay so the keyframe
      // can spread the burst. We don't care about exact values; just
      // that the custom properties were wired through.
      expect(p.style.getPropertyValue('--angle')).not.toBe('')
      expect(p.style.getPropertyValue('--distance')).not.toBe('')
      expect(p.style.getPropertyValue('--delay')).not.toBe('')
    }
  })
})
