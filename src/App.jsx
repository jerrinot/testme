import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Math Fun! 🐾</h1>
      <p>Vite + React scaffold is ready.</p>
      <button onClick={() => setCount((c) => c + 1)}>
        count is {count}
      </button>
    </div>
  )
}
