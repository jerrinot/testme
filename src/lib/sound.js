/*
 * Minimal Web Audio API wrapper for the optional sound feedback.
 *
 * We synthesize tones with oscillators instead of shipping audio
 * assets (SPEC.md § "Visual / UX details — Sound" explicitly allows
 * this).
 *
 * Design notes:
 *   - The AudioContext is created lazily on first play. Many browsers
 *     block `new AudioContext()` until a user gesture; since the very
 *     first tone happens as a direct reaction to a click that's fine.
 *   - A single context is reused across plays. Each tone allocates
 *     fresh Oscillator + Gain nodes (that's just how the Web Audio
 *     API works — nodes are one-shot).
 *   - If the environment has no AudioContext at all (jsdom, very old
 *     browsers) every play function quietly no-ops.
 *   - Envelopes use an attack ramp to ~20ms and an exponential decay
 *     to avoid the click you get from abrupt start/stop on an
 *     oscillator.
 *
 * The public surface is just `playTone(kind)` where kind is
 * 'correct' or 'wrong'. Components import that and nothing else.
 */

let audioCtx = null

function getAudioContext() {
  if (audioCtx) return audioCtx
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  try {
    audioCtx = new Ctor()
  } catch {
    audioCtx = null
  }
  return audioCtx
}

/**
 * Test-only hook: clears the cached context so a fresh one is created
 * on the next play. Never called by production code.
 */
export function _resetAudioContextForTests() {
  audioCtx = null
}

function scheduleNote(ctx, { freq, startOffsetSec, durationMs, peakGain, type = 'sine' }) {
  const start = ctx.currentTime + startOffsetSec
  const end = start + durationMs / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  // Small tail past `end` so the exponential ramp lands cleanly.
  osc.stop(end + 0.03)
}

function resumeIfSuspended(ctx) {
  // Some browsers suspend the context until a user gesture; calling
  // resume after the first click wakes it up. Guarded because not all
  // contexts expose `state`/`resume` (older Safari).
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    // Fire-and-forget: we don't need to await.
    ctx.resume().catch(() => {})
  }
}

/**
 * Cheerful three-note ascending arpeggio (C5 → E5 → G5). Triangle
 * waves are warm/soft — less shrill than pure sines at these pitches.
 */
export function playCorrectTone() {
  const ctx = getAudioContext()
  if (!ctx) return
  resumeIfSuspended(ctx)
  scheduleNote(ctx, { freq: 523.25, startOffsetSec: 0.0, durationMs: 110, peakGain: 0.18, type: 'triangle' })
  scheduleNote(ctx, { freq: 659.25, startOffsetSec: 0.08, durationMs: 110, peakGain: 0.18, type: 'triangle' })
  scheduleNote(ctx, { freq: 783.99, startOffsetSec: 0.16, durationMs: 200, peakGain: 0.22, type: 'triangle' })
}

/**
 * Soft, low "oops" — one short sine tone around A3 with a quick
 * downward glide. Intentionally quieter than the correct tone.
 */
export function playWrongTone() {
  const ctx = getAudioContext()
  if (!ctx) return
  resumeIfSuspended(ctx)
  const start = ctx.currentTime
  const end = start + 0.28
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, start)
  // Small downward glide for a gentle "wah" rather than a beep.
  osc.frequency.exponentialRampToValueAtTime(165, end)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(end + 0.03)
}

/**
 * Dispatch by `kind`. Unknown kinds are ignored so a caller can't
 * crash this module by passing a typo.
 */
export function playTone(kind) {
  if (kind === 'correct') playCorrectTone()
  else if (kind === 'wrong') playWrongTone()
}
