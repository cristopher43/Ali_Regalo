import { useEffect, useRef, useState } from 'react'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import Corazones from '../components/Corazones'
import type { Pose } from '../data/personajes'

type Estado = 'feliz' | 'muyfeliz' | 'comiendo' | 'jugando' | 'durmiendo' | 'triste'
const POSE: Record<Estado, Pose> = {
  feliz: 'reposo',
  muyfeliz: 'mimos',
  comiendo: 'comiendo',
  jugando: 'jugando',
  durmiendo: 'siesta',
  triste: 'preocupado',
}
const DICE: Record<Estado, string> = {
  feliz: 'Miau ♥',
  muyfeliz: 'Purr purr ♥',
  comiendo: 'Ñam ñam…',
  jugando: '¡Atrapé la pluma!',
  durmiendo: 'Zzz…',
  triste: 'Te extrañé…',
}
const ACCIONES: { texto: string; estado: Estado; icono: string; sonido: string }[] = [
  { texto: 'Acariciar', estado: 'muyfeliz', icono: '♡', sonido: '/sounds/purr.wav' },
  { texto: 'Comida', estado: 'comiendo', icono: '♥', sonido: '/sounds/happy.wav' },
  { texto: 'Jugar', estado: 'jugando', icono: '✿', sonido: '/sounds/meow.wav' },
  { texto: 'Dormir', estado: 'durmiendo', icono: '☾', sonido: '/sounds/purr.wav' },
]

const DURACION_ACCION = 4 * 1000 // 4 segundos
// Deterioro 25% más rápido: antes 120s (2 min), ahora 90s (1.5 min)
const INTERVALO_ANIMO_MS = 90 * 1000
const CLAVE_ANIMO = 'lya-animo'
const CLAVE_TIMESTAMP = 'lya-animo-timestamp'
const CLAVE_SONIDO = 'lya-sonido-activo'

function leerAnimo(): number {
  try {
    const ahora = Date.now()
    const guardado = Number(localStorage.getItem(CLAVE_ANIMO) ?? 3)
    const animoBase = Number.isFinite(guardado) ? Math.max(0, Math.min(5, guardado)) : 3
    const ultimoTiempo = Number(localStorage.getItem(CLAVE_TIMESTAMP) ?? ahora)

    // Si pasó tiempo mientras el navegador estuvo cerrado, calcular deterioro
    if (ultimoTiempo && ahora > ultimoTiempo) {
      const segundosPasados = (ahora - ultimoTiempo) / 1000
      const perdidos = Math.floor(segundosPasados / 90) // 1 corazón cada 90s (25% más dinámico)
      if (perdidos > 0) {
        const nuevoAnimo = Math.max(0, animoBase - perdidos)
        localStorage.setItem(CLAVE_ANIMO, String(nuevoAnimo))
        localStorage.setItem(CLAVE_TIMESTAMP, String(ahora - (segundosPasados % 90) * 1000))
        return nuevoAnimo
      }
    }
    return animoBase
  } catch {
    return 3
  }
}

function leerPreferenciaSonido(): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE_SONIDO)
    return guardado !== null ? guardado === 'true' : true
  } catch {
    return true
  }
}

export default function Lya() {
  const [estado, setEstado] = useState<Estado>('feliz')
  const [animo, setAnimo] = useState(leerAnimo)
  const [sonidoActivo, setSonidoActivo] = useState(leerPreferenciaSonido)
  const [efectoVisual, setEfectoVisual] = useState<'corazones' | 'estrellas' | 'ronroneo' | null>(null)
  const ultimoSonidoAlertaRef = useRef<number>(0)

  // Reproductor de sonido seguro
  const reproducirSonido = (ruta: string, volumen = 0.5) => {
    if (!sonidoActivo) return
    try {
      const audio = new Audio(ruta)
      audio.volume = volumen
      void audio.play().catch(() => {
        // Los navegadores bloquean audio antes de la primera interacción
      })
    } catch {
      // Ignorar errores de audio
    }
  }

  const alternarSonido = () => {
    const nuevo = !sonidoActivo
    setSonidoActivo(nuevo)
    try {
      localStorage.setItem(CLAVE_SONIDO, String(nuevo))
    } catch {
      // Silencioso
    }
    if (nuevo) {
      reproducirSonido('/sounds/baby_meow.wav', 0.4)
    }
  }

  // Cada botón usa esta función: cambia la pose, suma un corazón y reproduce sonido
  const cuidar = (accion: typeof ACCIONES[0]) => {
    const animoAnterior = animo
    const nuevoAnimo = Math.min(5, animo + 1)
    setEstado(accion.estado)
    setAnimo(nuevoAnimo)

    // Efectos visuales kawaii
    if (accion.estado === 'muyfeliz') {
      setEfectoVisual('ronroneo')
    } else if (accion.estado === 'comiendo' || accion.estado === 'jugando') {
      setEfectoVisual('estrellas')
    }

    // Efecto de sonido según la acción
    if (nuevoAnimo === 5 && animoAnterior < 5) {
      // Celebración si alcanza el máximo de felicidad
      reproducirSonido('/sounds/celebration.wav', 0.45)
    } else {
      reproducirSonido(accion.sonido, 0.45)
    }
  }

  // Después de una acción, Lya vuelve a su estado normal a los 4 segundos
  useEffect(() => {
    if (estado === 'feliz') return
    const t = setTimeout(() => {
      setEstado('feliz')
      setEfectoVisual(null)
    }, DURACION_ACCION)
    return () => clearTimeout(t)
  }, [estado])

  // Guarda ánimo y marca de tiempo
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ANIMO, String(animo))
      localStorage.setItem(CLAVE_TIMESTAMP, String(Date.now()))
    } catch {
      // Silencioso
    }
  }, [animo])

  // Intervalo de deterioro: 25% más rápido (90 segundos = 1.5 minutos)
  useEffect(() => {
    const t = setInterval(() => {
      setAnimo((actual) => {
        const nuevo = Math.max(0, actual - 1)
        if (nuevo === 0) {
          const ahora = Date.now()
          // Límite de aviso: máximo 1 vez cada 45 segundos para no ser molesto
          if (ahora - ultimoSonidoAlertaRef.current > 45000) {
            ultimoSonidoAlertaRef.current = ahora
            reproducirSonido('/sounds/sad.wav', 0.35)
          }
        }
        return nuevo
      })
    }, INTERVALO_ANIMO_MS)
    return () => clearInterval(t)
  }, [sonidoActivo])

  const mostrado: Estado = estado === 'feliz' && animo === 0 ? 'triste' : estado

  return (
    <Pantalla titulo="Lya" clase="pantalla-lya">
      <section className="tamagotchi" aria-label="Tamagotchi de Lya">
        <div className="tamagotchi__barra-superior">
          <p className="tamagotchi__etiqueta">TU MASCOTITA VIRTUAL</p>
          <button
            type="button"
            className={`tamagotchi__btn-sonido ${sonidoActivo ? 'activo' : 'silenciado'}`}
            onClick={alternarSonido}
            aria-label={sonidoActivo ? 'Silenciar sonidos de Lya' : 'Activar sonidos kawaii de Lya'}
            title={sonidoActivo ? 'Silenciar sonidos' : 'Activar sonidos kawaii'}
          >
            {sonidoActivo ? '🔊 Sonido: ON' : '🔇 Sonido: OFF'}
          </button>
        </div>

        <h2>Lya te espera</h2>

        <div className="tamagotchi__animo">
          <span>Felicidad</span>
          <span className="animo" aria-label={`Ánimo ${animo} de 5`}>
            {'♥'.repeat(animo)}
            <span>{'♥'.repeat(5 - animo)}</span>
          </span>
        </div>

        <div className={`tamagotchi__pantalla ${efectoVisual ? `efecto-${efectoVisual}` : ''}`}>
          <span className="tamagotchi__estrella tamagotchi__estrella--una">✦</span>
          <span className="tamagotchi__estrella tamagotchi__estrella--dos">✧</span>

          {efectoVisual === 'ronroneo' && (
            <div className="tamagotchi__ondas-ronroneo" aria-hidden="true">
              <span>〰</span><span>〰</span>
            </div>
          )}

          <p className="burbuja" aria-live="polite">{DICE[mostrado]}</p>

          <Personaje
            quien="lya"
            pose={POSE[mostrado]}
            ancho={250}
            animado={mostrado === 'feliz' || mostrado === 'muyfeliz'}
          />

          <p className="tamagotchi__ayuda">
            {mostrado === 'triste'
              ? 'Lya tiene hambre o extraña tus mimos 😿'
              : animo === 5
              ? '¡Lya está completamente feliz contigo! ✨'
              : '¿Qué hacemos juntas hoy?'}
          </p>
        </div>

        <p className="tamagotchi__titulo-acciones">Elige una acción</p>
        <div className="tamagotchi__acciones">
          {ACCIONES.map((a) => (
            <button
              key={a.texto}
              type="button"
              className="tamagotchi__boton"
              onClick={() => cuidar(a)}
            >
              <span aria-hidden="true">{a.icono}</span>
              {a.texto}
            </button>
          ))}
        </div>

        {mostrado === 'muyfeliz' && <Corazones />}
      </section>
    </Pantalla>
  )
}
