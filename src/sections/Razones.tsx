import { useState } from 'react'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import { RAZONES } from '../data/contenido'

export default function Razones() {
  const [i, setI] = useState(0) // useState: la página "recuerda" qué razón mostramos
  return (
    <Pantalla titulo="Razones por las que te amo" icono="razones">
      <div className="razon" aria-live="polite">
        <Personaje quien="ranita" pose="mimos" ancho={90} decorativo />
        <p>{RAZONES[i]}</p>
        <small>{i + 1} de {RAZONES.length}</small>
      </div>
      <div className="par">
        <button className="boton chico" onClick={() => setI((i - 1 + RAZONES.length) % RAZONES.length)}>← Anterior</button>
        <button className="boton chico" onClick={() => setI((i + 1) % RAZONES.length)}>Siguiente →</button>
      </div>
    </Pantalla>
  )
}
