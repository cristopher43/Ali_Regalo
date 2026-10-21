import { useEffect, useState } from 'react'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import Corazones from '../components/Corazones'
import type { Pose } from '../data/personajes'

type Estado = 'feliz' | 'muyfeliz' | 'comiendo' | 'jugando' | 'durmiendo' | 'triste'
// Cada estado decide qué pose se dibuja y qué dice Lya.
const POSE: Record<Estado, Pose> = { feliz: 'reposo', muyfeliz: 'mimos', comiendo: 'comiendo', jugando: 'jugando', durmiendo: 'siesta', triste: 'preocupado' }
const DICE: Record<Estado, string> = { feliz: 'Miau ♥', muyfeliz: 'Purr purr ♥', comiendo: 'Ñam ñam…', jugando: '¡Atrapé la pluma!', durmiendo: 'Zzz…', triste: 'Te extrañé…' }
const ACCIONES: { texto: string; estado: Estado }[] = [
  { texto: 'Acariciar', estado: 'muyfeliz' }, { texto: 'Comida', estado: 'comiendo' },
  { texto: 'Jugar', estado: 'jugando' }, { texto: 'Dormir', estado: 'durmiendo' },
]
const DURACION_ACCION = 4 * 1000 // 4 segundos
const INTERVALO_ANIMO = 2 * 60 * 1000 // 2 minutos
const CLAVE_ANIMO = 'lya-animo'

function leerAnimo() {
  try {
    const guardado = Number(localStorage.getItem(CLAVE_ANIMO) ?? 0)
    return Number.isFinite(guardado) ? Math.max(0, Math.min(5, guardado)) : 0
  } catch {
    return 0
  }
}

export default function Lya() {
  // Parte preocupada: el ánimo empieza vacío y no se llena por sí solo.
  const [estado, setEstado] = useState<Estado>('feliz')
  const [animo, setAnimo] = useState(leerAnimo) // de 0 a 5 corazones

  // Cada botón usa esta función: cambia la pose y suma un corazón.
  const cuidar = (nuevaAccion: Estado) => {
    setEstado(nuevaAccion)
    setAnimo((actual) => Math.min(5, actual + 1))
  }

  // Después de una acción, Lya vuelve a su estado normal a los 4 segundos.
  useEffect(() => {
    if (estado === 'feliz') return
    const t = setTimeout(() => setEstado('feliz'), DURACION_ACCION)
    return () => clearTimeout(t)
  }, [estado])
  // Conserva el cariño ganado aunque salgamos de esta pantalla.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ANIMO, String(animo))
    } catch {
      // La mascota sigue funcionando aunque el navegador no permita guardar.
    }
  }, [animo])
  // Si no la cuidamos, pierde un corazón cada 2 minutos.
  useEffect(() => {
    const t = setInterval(() => setAnimo((actual) => Math.max(0, actual - 1)), INTERVALO_ANIMO)
    return () => clearInterval(t)
  }, [])

  const mostrado: Estado = estado === 'feliz' && animo === 0 ? 'triste' : estado // estado derivado
  return (
    <Pantalla titulo="Lya" clase="pantalla-lya">
      <section className="tamagotchi" aria-label="Tamagotchi de Lya">
        <p className="tamagotchi__etiqueta">TU MASCOTITA VIRTUAL</p>
        <h2>Lya te espera</h2>
        <div className="tamagotchi__animo">
          <span>Felicidad</span>
          <span className="animo" aria-label={`Ánimo ${animo} de 5`}>{'♥'.repeat(animo)}<span>{'♥'.repeat(5 - animo)}</span></span>
        </div>
        <div className="tamagotchi__pantalla">
          <span className="tamagotchi__estrella tamagotchi__estrella--una">✦</span>
          <span className="tamagotchi__estrella tamagotchi__estrella--dos">✧</span>
          <p className="burbuja" aria-live="polite">{DICE[mostrado]}</p>
          <Personaje quien="lya" pose={POSE[mostrado]} ancho={250} animado={mostrado === 'feliz'} />
          <p className="tamagotchi__ayuda">{mostrado === 'triste' ? 'Dale un poquito de cariño' : '¿Qué hacemos juntas hoy?'}</p>
        </div>
        <p className="tamagotchi__titulo-acciones">Elige una acción</p>
        <div className="tamagotchi__acciones">
          {ACCIONES.map((a) => (
            <button
              key={a.texto}
              type="button"
              className="tamagotchi__boton"
              onClick={() => cuidar(a.estado)}
            >
              <span aria-hidden="true">{a.estado === 'muyfeliz' ? '♡' : a.estado === 'comiendo' ? '♥' : a.estado === 'jugando' ? '✿' : '☾'}</span>
              {a.texto}
            </button>
          ))}
        </div>
        {mostrado === 'muyfeliz' && <Corazones />}
      </section>
    </Pantalla>
  )
}
