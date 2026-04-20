import { describe, it, expect } from 'vitest'
import { generateQuestion, generateDistractors, MIN, MAX } from './questions.js'

const MODES = ['addition', 'subtraction', 'mixed']

describe('generateQuestion — range constraints', () => {
  for (const mode of MODES) {
    it(`1000 ${mode} questions all respect 0..20 and shape`, () => {
      for (let i = 0; i < 1000; i++) {
        const q = generateQuestion(mode)

        expect(q).toEqual(
          expect.objectContaining({
            a: expect.any(Number),
            b: expect.any(Number),
            op: expect.stringMatching(/^[+-]$/),
            answer: expect.any(Number),
            choices: expect.any(Array),
          }),
        )

        expect(q.a).toBeGreaterThanOrEqual(MIN)
        expect(q.a).toBeLessThanOrEqual(MAX)
        expect(q.b).toBeGreaterThanOrEqual(MIN)
        expect(q.b).toBeLessThanOrEqual(MAX)

        // Mode consistency
        if (mode === 'addition') expect(q.op).toBe('+')
        if (mode === 'subtraction') expect(q.op).toBe('-')

        // Answer matches op and is within 0..20
        const expected = q.op === '+' ? q.a + q.b : q.a - q.b
        expect(q.answer).toBe(expected)
        expect(q.answer).toBeGreaterThanOrEqual(MIN)
        expect(q.answer).toBeLessThanOrEqual(MAX)

        // Subtraction must be non-negative
        if (q.op === '-') {
          expect(q.a).toBeGreaterThanOrEqual(q.b)
          expect(q.answer).toBeGreaterThanOrEqual(0)
        }

        // Addition must not exceed 20
        if (q.op === '+') {
          expect(q.a + q.b).toBeLessThanOrEqual(MAX)
        }

        // Choices: 4 distinct values in [0, 20], including the answer.
        expect(q.choices).toHaveLength(4)
        const choiceSet = new Set(q.choices)
        expect(choiceSet.size).toBe(4)
        expect(choiceSet.has(q.answer)).toBe(true)
        for (const c of q.choices) {
          expect(c).toBeGreaterThanOrEqual(MIN)
          expect(c).toBeLessThanOrEqual(MAX)
          expect(Number.isInteger(c)).toBe(true)
        }
      }
    })
  }

  it('throws on unknown mode', () => {
    expect(() => generateQuestion('multiplication')).toThrow()
  })
})

describe('generateDistractors — rules', () => {
  it('returns 3 distinct values in [0,20], none equal to correct, for every correct in 0..20', () => {
    for (let correct = MIN; correct <= MAX; correct++) {
      // Run many trials per correct value so we catch any RNG path.
      for (let trial = 0; trial < 100; trial++) {
        const d = generateDistractors(correct)
        expect(d).toHaveLength(3)
        const s = new Set(d)
        expect(s.size).toBe(3)
        expect(s.has(correct)).toBe(false)
        for (const v of d) {
          expect(v).toBeGreaterThanOrEqual(MIN)
          expect(v).toBeLessThanOrEqual(MAX)
          expect(Number.isInteger(v)).toBe(true)
        }
      }
    }
  })

  it('favors ±1/±2 neighbors when they are all in range', () => {
    // For a "middle" correct value (e.g. 10), all four near neighbors
    // {8, 9, 11, 12} are in [0, 20]; distractors should be drawn
    // exclusively from that set.
    const nearSet = new Set([8, 9, 11, 12])
    for (let trial = 0; trial < 200; trial++) {
      const d = generateDistractors(10)
      for (const v of d) {
        expect(nearSet.has(v)).toBe(true)
      }
    }
  })

  it('falls back to wider offsets when clamping removes near neighbors', () => {
    // correct=0: near neighbors are -1, 1, -2, 2 — only 1 and 2 are in range.
    // Needs to fall back to 3 (and possibly 4, 5...) to produce 3 distractors.
    for (let trial = 0; trial < 200; trial++) {
      const d = generateDistractors(0)
      expect(d).toHaveLength(3)
      const s = new Set(d)
      expect(s.size).toBe(3)
      expect(s.has(0)).toBe(false)
      // 1 and 2 should always be selected (they are the only in-range near
      // neighbors), and the third must come from a wider offset.
      expect(s.has(1)).toBe(true)
      expect(s.has(2)).toBe(true)
    }
  })

  it('falls back at the upper boundary', () => {
    // correct=20: near neighbors 19, 21, 18, 22 — only 19 and 18 are in range.
    for (let trial = 0; trial < 200; trial++) {
      const d = generateDistractors(20)
      expect(d).toHaveLength(3)
      const s = new Set(d)
      expect(s.size).toBe(3)
      expect(s.has(20)).toBe(false)
      expect(s.has(19)).toBe(true)
      expect(s.has(18)).toBe(true)
    }
  })
})
