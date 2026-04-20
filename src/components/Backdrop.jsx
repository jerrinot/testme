import backdropUrl from '../assets/backdrop.png'

export default function Backdrop() {
  return (
    <div className="visual-backdrop" aria-hidden="true">
      <img className="visual-backdrop-image" src={backdropUrl} alt="" />
    </div>
  )
}
