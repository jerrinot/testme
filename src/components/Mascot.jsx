import { useMemo } from 'react'
import dogUrl from '../assets/mascots/dog.png'
import catUrl from '../assets/mascots/cat.png'
import lionUrl from '../assets/mascots/lion.png'
import rabbitUrl from '../assets/mascots/rabbit.png'
import pandaUrl from '../assets/mascots/panda.png'
import foxUrl from '../assets/mascots/fox.png'
import frogUrl from '../assets/mascots/frog.png'
import monkeyUrl from '../assets/mascots/monkey.png'
import koalaUrl from '../assets/mascots/koala.png'
import pigUrl from '../assets/mascots/pig.png'

const ANIMALS = [
  { id: 'dog', src: dogUrl },
  { id: 'cat', src: catUrl },
  { id: 'lion', src: lionUrl },
  { id: 'rabbit', src: rabbitUrl },
  { id: 'panda', src: pandaUrl },
  { id: 'fox', src: foxUrl },
  { id: 'frog', src: frogUrl },
  { id: 'monkey', src: monkeyUrl },
  { id: 'koala', src: koalaUrl },
  { id: 'pig', src: pigUrl },
]

export default function Mascot({ animal, celebrateTick = 0 }) {
  const chosen = useMemo(() => {
    if (animal) return ANIMALS.find((a) => a.id === animal) ?? ANIMALS[0]
    const idx = Math.floor(Math.random() * ANIMALS.length)
    return ANIMALS[idx]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animal])

  const celebrating = celebrateTick > 0

  return (
    <div
      className="mascot"
      data-testid="mascot"
      data-animal={chosen.id}
      role="img"
      aria-label="Friendly animal mascot"
    >
      <div
        key={celebrateTick}
        className={`mascot-body${celebrating ? ' mascot-celebrating' : ''}`}
      >
        <img className="mascot-image" src={chosen.src} alt="" />
      </div>
    </div>
  )
}

export { ANIMALS }
