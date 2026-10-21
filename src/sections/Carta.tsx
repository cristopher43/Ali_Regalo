import Pantalla from '../components/Pantalla'
import { CARTA } from '../data/contenido'

export default function Carta() {
  return (
    <Pantalla titulo="Mi carta para ti" icono="carta">
      <article className="hoja">
        <h2>{CARTA.saludo}</h2>
        {CARTA.parrafos.map((p) => <p key={p}>{p}</p>)}
        <p className="firma">Con todo mi amor,<br /><strong>{CARTA.firma}</strong></p>
      </article>
      <img
        className="lya-recuerdo lya-recuerdo--carta"
        src="/lya-recuerdos/lya-rosa.png"
        alt="Lya te ofrece una rosa"
        width="170"
        loading="lazy"
      />
    </Pantalla>
  )
}
