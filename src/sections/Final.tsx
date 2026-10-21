import { Link } from 'react-router-dom'
import Personaje from '../components/Personaje'
import IconoSeccion from '../components/IconoSeccion'

export default function Final() {
  return (
    <main className="noche">
      <IconoSeccion nombre="final" />
      <p>Gracias por estar…</p>
      <h1>Te amo, Ali <span>♥</span></h1>
      <div className="par">
        <Personaje quien="pinguino" pose="siesta" ancho={120} />
        <Personaje quien="ranita" pose="siesta" ancho={110} />
        <img
          className="personaje lya-recuerdo lya-recuerdo--final"
          src="/lya-recuerdos/lya-corazones.png"
          alt="Lya te manda muchos corazones"
          width="130"
          loading="lazy"
        />
      </div>
      <Link to="/" className="boton enlace claro">Volver al inicio</Link>
    </main>
  )
}
