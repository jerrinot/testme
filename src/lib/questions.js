// Pure question-generation helpers for the math-practice app.
//
// All numbers stay within [0, 20]. Subtraction results are always non-negative.
// Every question has 4 choices: the correct answer plus 3 distinct distractors.

export const MIN = 0
export const MAX = 20

/**
 * Uniform random integer in [min, max] (inclusive).
 * Exposed as a module default; callers can pass their own `rng` for tests.
 */
function defaultRng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a single question.
 *
 * @param {'addition' | 'subtraction' | 'mixed'} mode
 * @param {(min: number, max: number) => number} [rng] - integer RNG in [min, max]
 * @returns {{ a: number, b: number, op: '+'|'-', answer: number, choices: number[] }}
 */
export function generateQuestion(mode, rng = defaultRng) {
  let op
  if (mode === 'addition') {
    op = '+'
  } else if (mode === 'subtraction') {
    op = '-'
  } else if (mode === 'mixed') {
    op = rng(0, 1) === 0 ? '+' : '-'
  } else {
    throw new Error(`Unknown mode: ${mode}`)
  }

  let a, b, answer
  if (op === '+') {
    // a, b in [0, 20], a + b <= 20
    a = rng(MIN, MAX)
    b = rng(MIN, MAX - a)
    answer = a + b
  } else {
    // a in [0, 20], b in [0, a]
    a = rng(MIN, MAX)
    b = rng(MIN, a)
    answer = a - b
  }

  const distractors = generateDistractors(answer, rng)
  const choices = shuffle([answer, ...distractors], rng)
  return { a, b, op, answer, choices }
}

/**
 * Generate 3 distractor values for a given correct answer.
 *
 * Rules:
 *  - 3 distinct values, all in [0, 20]
 *  - None equal to `correct`
 *  - Favor near-neighbors (±1, ±2); widen to ±3, ±4, ... if needed
 *  - Order is randomized
 *
 * @param {number} correct
 * @param {(min: number, max: number) => number} [rng]
 * @returns {number[]} array of length 3
 */
export function generateDistractors(correct, rng = defaultRng) {
  // Preferred offsets: nearest neighbors first, expanding outward.
  const preferredOffsets = [-1, 1, -2, 2]
  const fallbackOffsets = [-3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10]

  const pool = []
  const seen = new Set([correct])

  const addOffset = (off) => {
    const v = correct + off
    if (v < MIN || v > MAX) return
    if (seen.has(v)) return
    seen.add(v)
    pool.push(v)
  }

  for (const off of preferredOffsets) addOffset(off)
  for (const off of fallbackOffsets) {
    if (pool.length >= 3) break
    addOffset(off)
  }

  // Final safety net: if for some reason we still have < 3 candidates
  // (e.g. a future change to MIN/MAX made the universe too small),
  // fill from any remaining value in [MIN, MAX].
  if (pool.length < 3) {
    for (let v = MIN; v <= MAX && pool.length < 3; v++) {
      if (!seen.has(v)) {
        seen.add(v)
        pool.push(v)
      }
    }
  }

  // We prefer nearest neighbors: the first 4 entries are ±1/±2
  // (whichever were in range). Pick 3 from the pool, preferring the
  // front but still randomizing order for display.
  const shuffled = shuffle(pool.slice(), rng)

  // Favor the preferred-offset entries: keep the first up-to-4 (the near
  // neighbors that survived clamping) ahead of fallback entries when
  // selecting, then shuffle just the chosen 3.
  const nearCount = Math.min(4, pool.length)
  const near = pool.slice(0, nearCount)
  const far = pool.slice(nearCount)

  // Pick from `near` first; top up from `far` if `near` has fewer than 3.
  const chosen = []
  const nearShuffled = shuffle(near.slice(), rng)
  for (const v of nearShuffled) {
    if (chosen.length >= 3) break
    chosen.push(v)
  }
  if (chosen.length < 3) {
    const farShuffled = shuffle(far.slice(), rng)
    for (const v of farShuffled) {
      if (chosen.length >= 3) break
      chosen.push(v)
    }
  }

  return shuffle(chosen, rng)
}

/**
 * Fisher–Yates shuffle, in-place, returns the same array.
 */
function shuffle(arr, rng = defaultRng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng(0, i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
