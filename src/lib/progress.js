/**
 * Persistent progress tracking backed by localStorage.
 *
 * Shape stored under KEY:
 *   {
 *     roundsPlayed: number,
 *     totalFirstTryCorrect: number,
 *     bestByMode: { addition?: number, subtraction?: number, mixed?: number },
 *     unlockedMascots: string[]  // ids, in unlock order
 *   }
 *
 * Any parse or write failure degrades silently to in-memory defaults
 * so a disabled/quota-exhausted localStorage never crashes the game.
 */

const KEY = 'math-fun:v1'

// Order in which new mascots unlock — one per round played. First entry
// is the "starter friend" available immediately.
export const MASCOT_UNLOCK_ORDER = [
  'dog',
  'cat',
  'rabbit',
  'panda',
  'fox',
  'frog',
  'monkey',
  'koala',
  'pig',
  'lion',
]

const INITIAL = {
  roundsPlayed: 0,
  totalFirstTryCorrect: 0,
  bestByMode: {},
  unlockedMascots: [MASCOT_UNLOCK_ORDER[0]],
}

function safeStorage() {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage ?? null
  } catch {
    return null
  }
}

export function loadProgress() {
  const storage = safeStorage()
  if (!storage) return clone(INITIAL)
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return clone(INITIAL)
    const parsed = JSON.parse(raw)
    return {
      ...INITIAL,
      ...parsed,
      bestByMode: { ...INITIAL.bestByMode, ...(parsed.bestByMode || {}) },
      unlockedMascots:
        Array.isArray(parsed.unlockedMascots) && parsed.unlockedMascots.length
          ? parsed.unlockedMascots
          : clone(INITIAL.unlockedMascots),
    }
  } catch {
    return clone(INITIAL)
  }
}

export function saveProgress(progress) {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // quota / private mode — silently drop
  }
}

/**
 * Record a completed round and return { progress, newMascot } where
 * `newMascot` is the id just unlocked (or null if the collection is
 * already full).
 */
export function recordRound({ mode, firstTryCorrect, total }) {
  const progress = loadProgress()
  progress.roundsPlayed += 1
  progress.totalFirstTryCorrect += firstTryCorrect
  const prevBest = progress.bestByMode[mode] ?? -1
  if (firstTryCorrect > prevBest) progress.bestByMode[mode] = firstTryCorrect

  let newMascot = null
  const nextIdx = progress.unlockedMascots.length
  if (nextIdx < MASCOT_UNLOCK_ORDER.length) {
    newMascot = MASCOT_UNLOCK_ORDER[nextIdx]
    progress.unlockedMascots = [...progress.unlockedMascots, newMascot]
  }
  // `total` is part of the round contract but we don't store it.
  void total

  saveProgress(progress)
  return { progress, newMascot }
}

/**
 * Test helper — wipes stored progress so each test starts fresh.
 */
export function _resetProgressForTests() {
  const storage = safeStorage()
  if (storage) {
    try {
      storage.removeItem(KEY)
    } catch {
      // ignore
    }
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
