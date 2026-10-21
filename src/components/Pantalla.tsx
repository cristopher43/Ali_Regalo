import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Corazones from './Corazones'
import IconoSeccion from './IconoSeccion'
import BotonCerrarSesion from './BotonCerrarSesion'

// Marco común de cada sección: botón volver + título. Así no lo repetimos 8 veces.
export default function Pantalla({ titulo, children, clase = '', icono }: { titulo: string; children: ReactNode; clase?: string; icono?: string }) {
  return (
    <main className={`menu ${clase}`}>
      <Corazones />
      <BotonCerrarSesion />
      <Link to="/menu" className="volver" aria-label="Volver al menú">←</Link>
      {icono && <IconoSeccion nombre={icono} />}
      <h1>{titulo}</h1>
      {children}
    </main>
  )
}
