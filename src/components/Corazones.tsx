// Corazones que suben flotando. Solo decoran, por eso aria-hidden.
const POSICIONES = [8, 22, 38, 60, 76, 90]
const DIBUJOS = ['♥', '♡', '✦', '♥', '✧', '♡']

export default function Corazones() {
  return (
    <div className="corazones" aria-hidden="true">
      {POSICIONES.map((izq, i) => (
        <span key={izq} style={{ left: `${izq}%`, animationDelay: `${i * 1.1}s` }}>{DIBUJOS[i]}</span>
      ))}
    </div>
  )
}
