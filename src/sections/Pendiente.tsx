import { Link, useParams } from 'react-router-dom'
import Personaje from '../components/Personaje'
import IconoSeccion from '../components/IconoSeccion'
import { SECCIONES } from '../data/secciones'

// Pantalla temporal para las secciones que aún no construimos.
export default function Pendiente() {
  const { seccion } = useParams()
  const s = SECCIONES.find((x) => x.ruta === seccion)
  return (
    <main className="menu pendiente">
      <Link to="/menu" className="volver" aria-label="Volver al menú">←</Link>
      <h1>{s ? s.titulo : 'Esta página no existe'}</h1>
      {s && <IconoSeccion nombre={s.icono} />}
      <Personaje quien="lya" pose="siesta" ancho={240} />
      <p className="menu__sub">{s ? `Lya la está preparando (Fase ${s.fase}).` : 'Vuelve al menú para seguir.'}</p>
    </main>
  )
}
