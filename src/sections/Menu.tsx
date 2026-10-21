import { Link } from 'react-router-dom'
import Personaje from '../components/Personaje'
import IconoSeccion from '../components/IconoSeccion'
import Corazones from '../components/Corazones'
import { SECCIONES } from '../data/secciones'
import '../styles/menu.css'
import BotonCerrarSesion from '../components/BotonCerrarSesion'

export default function Menu() {
  return (
    <main className="menu">
      <Corazones />
      <BotonCerrarSesion />
      <Link to="/" className="volver" aria-label="Volver a la portada">←</Link>
      <div className="menu__encabezado">
        <span className="menu__corazon">♥</span>
        <h1>Gracias por existir ♥</h1>
        <p className="menu__sub">Elige por dónde empezar</p>
      </div>

      <ul className="menu__rejilla">
        {SECCIONES.map((s) => (
          <li key={s.ruta}>
            <Link to={`/${s.ruta}`} className="tarjeta">
              <IconoSeccion nombre={s.icono} />
              <strong>{s.titulo}</strong>
              <span>{s.detalle}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/lya" className="menu__lya" aria-label="Cuidar a Lya">
        <div className="menu__lya-texto">
          <span className="menu__etiqueta">MI MASCOTITA</span>
          <strong>Tamagotchi Lya</strong>
          <span>Juega y dale mimos ♥</span>
        </div>
        <Personaje quien="lya" pose="reposo" ancho={110} animado />
      </Link>
    </main>
  )
}
