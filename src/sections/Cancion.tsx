import { useEffect, useRef, useState } from 'react'
import Pantalla from '../components/Pantalla'
import { LETRA_SINCRONIZADA } from '../data/letraCancion'

const POSES_LYA = [
  '/lya-recuerdos/lya-baile.png',
  '/lya-recuerdos/lya-flores.png',
  '/lya-recuerdos/lya-musica.webp',
  '/lya-recuerdos/lya-cancion.webp',
]

function mostrarTiempo(segundos: number) {
  const tiempo = Number.isFinite(segundos) ? Math.floor(segundos) : 0
  const minutos = Math.floor(tiempo / 60)
  const segundosRestantes = String(tiempo % 60).padStart(2, '0')
  return `${minutos}:${segundosRestantes}`
}

export default function Cancion() {
  const audio = useRef<HTMLAudioElement>(null)
  const contenedorLetraRef = useRef<HTMLDivElement>(null)
  const [suena, setSuena] = useState(false)
  const [avance, setAvance] = useState(0)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [error, setError] = useState(false)
  const [verLetra, setVerLetra] = useState(true)

  // Encontrar qué línea de la letra corresponde al segundo actual
  const indiceActivo = LETRA_SINCRONIZADA.reduce((acc, linea, i) => {
    return tiempoActual >= linea.tiempo ? i : acc
  }, 0)

  // Bucle de sincronización de alta precisión (60fps) usando requestAnimationFrame
  useEffect(() => {
    let animId: number
    const actualizar = () => {
      if (audio.current && !audio.current.paused) {
        const t = audio.current.currentTime
        const d = audio.current.duration || 1
        setTiempoActual(t)
        setAvance((t / d) * 100)
      }
      animId = requestAnimationFrame(actualizar)
    }
    animId = requestAnimationFrame(actualizar)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Auto-scroll suave para mantener la línea activa a la vista
  useEffect(() => {
    if (!verLetra || !contenedorLetraRef.current) return
    const elActivo = contenedorLetraRef.current.querySelector('.letra-linea.activa')
    if (elActivo) {
      elActivo.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [indiceActivo, verLetra])

  async function alternar() {
    const reproductor = audio.current
    if (!reproductor) return

    if (suena) {
      reproductor.pause()
      setSuena(false)
      return
    }

    try {
      await reproductor.play()
      setError(false)
      setSuena(true)
    } catch {
      setError(true)
      setSuena(false)
    }
  }

  return (
    <Pantalla titulo="Nuestra canción" icono="cancion">
      <div className={`disco ${suena ? 'gira' : ''}`} aria-hidden="true">
        <span>♥</span>
      </div>

      <h2>Cómplice Eterno</h2>
      <p className="menu__sub">Glup!</p>

      <div className="cancion__control">
        <span>{mostrarTiempo(tiempoActual)}</span>
        <input
          className="barra"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={avance}
          disabled={!duracion}
          aria-label="Adelantar o retroceder la canción"
          onChange={(evento) => {
            const nuevoAvance = Number(evento.target.value)
            setAvance(nuevoAvance)
            if (audio.current && duracion > 0) {
              const nuevoTiempo = (nuevoAvance / 100) * duracion
              audio.current.currentTime = nuevoTiempo
              setTiempoActual(nuevoTiempo)
            }
          }}
        />
        <span>{mostrarTiempo(duracion)}</span>
      </div>

      <div className="par">
        <button className="boton" type="button" onClick={alternar}>
          {suena ? '⏸ Pausar' : '▶ Reproducir'}
        </button>
        <button
          className="boton claro"
          type="button"
          onClick={() => setVerLetra(!verLetra)}
        >
          {verLetra ? 'Ocultar letra' : '🎤 Letra karaoke'}
        </button>
      </div>

      {verLetra && (
        <article className="cancion__karaoke" aria-label="Letra karaoke sincronizada">
          <header className="cancion__karaoke-cabecera">
            <span className="cancion__karaoke-tag">🎤 Letra en tiempo real</span>
          </header>
          <div className="cancion__karaoke-lista" ref={contenedorLetraRef}>
            {LETRA_SINCRONIZADA.map((linea, index) => {
              const esActiva = index === indiceActivo
              const yaPaso = index < indiceActivo

              return (
                <p
                  key={index}
                  className={`letra-linea ${esActiva ? 'activa' : yaPaso ? 'pasada' : 'futura'}`}
                  onClick={() => {
                    if (audio.current) {
                      audio.current.currentTime = linea.tiempo
                      setTiempoActual(linea.tiempo)
                    }
                  }}
                  title="Toca para saltar a esta parte"
                >
                  {linea.texto}
                </p>
              )
            })}
          </div>
        </article>
      )}

      {error && (
        <p className="aviso" role="alert">
          No se pudo reproducir la canción. Revisa el archivo MP3 en public/musica.
        </p>
      )}

      <div className="lya-escenario">
        {POSES_LYA.map((pose, indice) => (
          <img
            key={pose}
            src={pose}
            alt=""
            aria-hidden="true"
            className={`lya-recuerdo lya-baila lya-baila--${indice + 1} ${suena ? 'animado' : ''}`}
            loading="lazy"
          />
        ))}
        {suena && (
          <>
            <span className="lya-decoracion lya-decoracion--corazon-uno" aria-hidden="true">♥</span>
            <span className="lya-decoracion lya-decoracion--corazon-dos" aria-hidden="true">♥</span>
            <span className="lya-decoracion lya-decoracion--brillo-uno" aria-hidden="true">✦</span>
            <span className="lya-decoracion lya-decoracion--brillo-dos" aria-hidden="true">✧</span>
          </>
        )}
      </div>

      <p className="lya-mensaje" aria-live="polite">
        {suena
          ? '¡Lya está bailando contigo en todas sus poses! ♥'
          : 'Pon la canción para ver bailar a Lya'}
      </p>

      <audio
        ref={audio}
        src="/musica/complice-eterno.mp3"
        preload="metadata"
        onError={() => {
          setError(true)
          setSuena(false)
        }}
        onLoadedMetadata={(evento) => {
          setDuracion(evento.currentTarget.duration)
        }}
        onTimeUpdate={(evento) => {
          const reproductor = evento.currentTarget
          const porcentaje =
            (reproductor.currentTime / (reproductor.duration || 1)) * 100
          setTiempoActual(reproductor.currentTime)
          setAvance(porcentaje)
        }}
        onEnded={() => setSuena(false)}
      />
    </Pantalla>
  )
}
