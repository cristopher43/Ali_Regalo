import { useState } from 'react'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import { RAZONES } from '../data/contenido'

export default function Razones() {
  const [i, setI] = useState(0)
  const razon = RAZONES[i]

  return (
    <Pantalla titulo="10 razones por las que estoy con mi Ali ❤️" icono="razones">
      <div className="razon" aria-live="polite">
        <Personaje quien="ranita" pose="mimos" ancho={90} decorativo />
        <h3 className="razon__titulo">{razon.titulo}</h3>
        <p className="razon__texto">{razon.texto}</p>
        <small>{i + 1} de {RAZONES.length}</small>
      </div>
      <div className="par">
        <button className="boton chico" onClick={() => setI((i - 1 + RAZONES.length) % RAZONES.length)}>← Anterior</button>
        <button className="boton chico" onClick={() => setI((i + 1) % RAZONES.length)}>Siguiente →</button>
      </div>
      <footer className="razon__cierre">
        <p>Y si me preguntaran por qué estoy contigo, creo que no sabría resumirlo en una sola cosa. Es por tus ojitos, tu sonrisa, tus ocurrencias, tu forma de preocuparte por mí y hasta por la ternura que me da cuando me dices «mi guagua».</p>
        <strong>Porque eres tú, mi Ali hermosa, y yo soy muy feliz de ser tu brocolito. ❤️🥦</strong>
      </footer>
    </Pantalla>
  )
}
