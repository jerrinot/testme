import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Vitest doesn't enable jest-style globals by default, so RTL's
// automatic cleanup hook never fires. Wire it up explicitly so each
// test starts with an empty DOM.
afterEach(() => {
  cleanup()
})
