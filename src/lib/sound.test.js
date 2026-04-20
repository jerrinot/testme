import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  playTone,
  playCorrectTone,
  playWrongTone,
  _resetAudioContextForTests,
} from './sound.js'

describe('lib/sound', () => {
  afterEach(() => {
    _resetAudioContextForTests()
    // Clean up any fake AudioContext we attached for a test.
    if ('AudioContext' in window) {
      // Only delete ones we set; jsdom doesn't ship one by default, so
      // this is always safe here.
      delete window.AudioContext
    }
    if ('webkitAudioContext' in window) {
      delete window.webkitAudioContext
    }
    vi.restoreAllMocks()
  })

  it('playTone is safe to call when no AudioContext is available (jsdom default)', () => {
    // jsdom has no Web Audio API — these must be silent no-ops, not
    // throws. The UI layer relies on this so that merely importing
    // the module in tests is harmless.
    expect(() => playTone('correct')).not.toThrow()
    expect(() => playTone('wrong')).not.toThrow()
    expect(() => playTone('whatever')).not.toThrow()
  })

  it('playCorrectTone schedules oscillator + gain nodes through a fake AudioContext', () => {
    const osc = {
      type: null,
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
    const ctx = {
      currentTime: 0,
      state: 'running',
      destination: { fake: true },
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      resume: vi.fn(),
    }
    window.AudioContext = vi.fn(() => ctx)

    playCorrectTone()

    // Three ascending notes → three oscillator+gain pairs.
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3)
    expect(ctx.createGain).toHaveBeenCalledTimes(3)
    expect(osc.start).toHaveBeenCalledTimes(3)
    expect(osc.stop).toHaveBeenCalledTimes(3)
  })

  it('playWrongTone schedules exactly one oscillator with a downward frequency glide', () => {
    const osc = {
      type: null,
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
    const ctx = {
      currentTime: 0,
      state: 'running',
      destination: { fake: true },
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      resume: vi.fn(),
    }
    window.AudioContext = vi.fn(() => ctx)

    playWrongTone()

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1)
    expect(ctx.createGain).toHaveBeenCalledTimes(1)
    // Starting higher than ending — gentle downward glide.
    const [[startFreq]] = osc.frequency.setValueAtTime.mock.calls
    const [[endFreq]] = osc.frequency.exponentialRampToValueAtTime.mock.calls
    expect(startFreq).toBeGreaterThan(endFreq)
    expect(osc.start).toHaveBeenCalledTimes(1)
    expect(osc.stop).toHaveBeenCalledTimes(1)
  })

  it('resumes a suspended AudioContext before scheduling', () => {
    const ctx = {
      currentTime: 0,
      state: 'suspended',
      destination: {},
      createOscillator: () => ({
        type: null,
        frequency: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
      }),
      resume: vi.fn(() => Promise.resolve()),
    }
    window.AudioContext = vi.fn(() => ctx)

    playTone('correct')
    expect(ctx.resume).toHaveBeenCalled()
  })
})
