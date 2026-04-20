import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Menu from './Menu.jsx'

describe('Menu', () => {
  it('renders a title and three mode buttons', () => {
    render(<Menu onSelectMode={() => {}} />)
    // Title
    expect(
      screen.getByRole('heading', { level: 1, name: /math fun/i }),
    ).toBeInTheDocument()
    // Three buttons
    expect(screen.getByRole('button', { name: /addition/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /subtraction/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mixed/i })).toBeInTheDocument()
  })

  it.each([
    ['addition', /addition/i],
    ['subtraction', /subtraction/i],
    ['mixed', /mixed/i],
  ])('clicking %s invokes onSelectMode with "%s"', async (mode, label) => {
    const onSelectMode = vi.fn()
    const user = userEvent.setup()
    render(<Menu onSelectMode={onSelectMode} />)
    await user.click(screen.getByRole('button', { name: label }))
    expect(onSelectMode).toHaveBeenCalledTimes(1)
    expect(onSelectMode).toHaveBeenCalledWith(mode)
  })
})
