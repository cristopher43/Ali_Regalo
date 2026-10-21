import { useNavigate } from 'react-router-dom'
import Personaje from '../components/Personaje'
import Corazones from '../components/Corazones'
import '../styles/portada.css'

export default function Portada() {
  const irA = useNavigate()
  return (
    <main className="portada">
      <Corazones />
      <p className="portada__dedicatoria">Para mi persona favorita del mundo…</p>
      <h1 className="portada__nombre">Ali <span>♥</span></h1>

      <div className="portada__escena">
        <Personaje quien="pinguino" pose="reposo" ancho={150} animado />
        <Personaje quien="ranita" pose="reposo" ancho={140} animado className="retraso" />
        <img
          src="/lya-recuerdos/lya-portada.webp"
          alt=""
          aria-hidden="true"
          className="portada__lya animado"
          width="125"
          fetchPriority="high"
        />
      </div>

      <div className="portada__sello">Un lugarcito hecho con mucho amor</div>
      <button className="boton" onClick={() => irA('/menu')}>Comenzar →</button>
      <p className="portada__nota">Toca el botón para abrir nuestro diario</p>
    </main>
  )
}
