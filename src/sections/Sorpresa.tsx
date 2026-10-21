import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import Corazones from '../components/Corazones'
import { MENSAJE_SORPRESA } from '../data/contenido'

export default function Sorpresa() {
  const [abierta, setAbierta] = useState(false)
  return (
    <Pantalla titulo={abierta ? '¡Sorpresa!' : 'Una última cosa…'} icono="sorpresa">
      {abierta && <Corazones />}
      <div className={`caja ${abierta ? 'abierta' : ''}`} aria-hidden="true"><b /><i /></div>
      {abierta ? (
        <>
          <p className="razon">{MENSAJE_SORPRESA}</p>
          <div className="par"><Personaje quien="pinguino" pose="mimos" ancho={100} animado /><Personaje quien="ranita" pose="mimos" ancho={90} animado /><Personaje quien="lya" pose="mimos" ancho={110} animado /></div>
          <Link to="/final" className="boton enlace">Seguir →</Link>
        </>
      ) : (
        <button className="boton" onClick={() => setAbierta(true)}>Abrir sorpresa</button>
      )}
    </Pantalla>
  )
}
