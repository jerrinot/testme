import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SoundToggle from './SoundToggle.jsx'

describe('SoundToggle', () => {
  it('renders the muted variant when on=false with a "turn sound on" label', () => {
    render(<SoundToggle on={false} onToggle={() => {}} />)
    const btn = screen.getByTestId('sound-toggle')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('data-sound-on', 'false')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn).toHaveAttribute('aria-label', 'Turn sound on')
    // Muted icon present (🔇); spoken-icon speaker (🔊) absent.
    expect(btn.textContent).toContain('🔇')
    expect(btn.textContent).not.toContain('🔊')
  })

  it('renders the on variant when on=true with a "turn sound off" label', () => {
    render(<SoundToggle on={true} onToggle={() => {}} />)
    const btn = screen.getByTestId('sound-toggle')
    expect(btn).toHaveAttribute('data-sound-on', 'true')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveAttribute('aria-label', 'Turn sound off')
    expect(btn).toHaveClass('sound-toggle-on')
    expect(btn.textContent).toContain('🔊')
  })

  it('invokes onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<SoundToggle on={false} onToggle={onToggle} />)
    await user.click(screen.getByTestId('sound-toggle'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
