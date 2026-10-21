import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pantalla from '../components/Pantalla'
import Corazones from '../components/Corazones'
import { CUPONES, type Cupon } from '../data/cupones'
import { cargarCuponesCanjeados, registrarCanjeCupon, escucharCambios } from '../data/datosCompartidos'
import { supabaseConfigurado } from '../data/supabase'
import { useSesionCompartida } from '../data/SesionCompartida'

function formatearFecha(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Canjeado'
  }
}

export default function Sorpresa() {
  const { usuario } = useSesionCompartida()
  const [descubierto, setDescubierto] = useState(false)
  const [canjes, setCanjes] = useState<Record<number, string>>({})
  const [cargando, setCargando] = useState(supabaseConfigurado)
  const [error, setError] = useState('')
  const [cuponSeleccionado, setCuponSeleccionado] = useState<Cupon | null>(null)
  const [confirmandoCupon, setConfirmandoCupon] = useState<Cupon | null>(null)
  const [procesandoCanje, setProcesandoCanje] = useState(false)
  const [animandoCanjeId, setAnimandoCanjeId] = useState<number | null>(null)
  const [mensajeExito, setMensajeExito] = useState('')

  const cantidadCanjeados = Object.keys(canjes).length
  const todosCanjeados = cantidadCanjeados === CUPONES.length

  useEffect(() => {
    if (!supabaseConfigurado) {
      setError('La base de datos compartida no está configurada.')
      setCargando(false)
      return
    }

    let activa = true
    const cargar = async () => {
      try {
        const mapa = await cargarCuponesCanjeados()
        if (activa) {
          setCanjes(mapa)
          setError('')
        }
      } catch {
        if (activa) {
          setError('No pudimos cargar los cupones compartidos. Si es la primera vez, ejecuta el SQL de cupones en Supabase.')
        }
      } finally {
        if (activa) setCargando(false)
      }
    }

    void cargar()
    const dejarEscuchar = escucharCambios('cupones_canjeados', () => {
      void cargar()
    })

    return () => {
      activa = false
      dejarEscuchar()
    }
  }, [])

  const confirmarCanje = async () => {
    if (!confirmandoCupon || procesandoCanje) return
    if (!supabaseConfigurado || !usuario) {
      setError('Debes tener tu sesión activa para registrar el canje en la nube.')
      return
    }

    setProcesandoCanje(true)
    setError('')
    try {
      const cuponId = confirmandoCupon.id
      const fecha = await registrarCanjeCupon(cuponId)
      setCanjes((prev) => ({ ...prev, [cuponId]: fecha }))
      setAnimandoCanjeId(cuponId)
      setMensajeExito(`¡Cuponcito «${confirmandoCupon.titulo}» canjeado con éxito! Tu brocolito ya lo sabe 🥦💗`)
      setConfirmandoCupon(null)
      setTimeout(() => {
        setAnimandoCanjeId(null)
      }, 3500)
    } catch {
      setError('No se pudo registrar el canje. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setProcesandoCanje(false)
    }
  }

  // Pantalla de Bienvenida (antes de "Descubrir mis cupones")
  if (!descubierto && !todosCanjeados) {
    return (
      <Pantalla titulo="Una cajita de cupones para mi Ali 💌" icono="sorpresa" clase="pantalla-cupones">
        <section className="cupones-bienvenida">
          <div className="cupones-bienvenida__ilustracion">
            <img
              src="/personajes/brocolito.png"
              alt="Brocolito con amor"
              className="brocolito-avatar animado"
              width="130"
            />
          </div>
          <h2 className="cupones-bienvenida__titulo">Un regalito para mi Ali 💗</h2>
          <p className="cupones-bienvenida__mensaje">
            Mi Ali hermosa, te preparé unos cuponcitos que puedes canjear conmigo cuando quieras.
            Hay algunos para regalonearte, otros para hacerte reír y uno que otro regalito especial de tu brocolito.
            ¿Los descubrimos, mi guagua? 🥦❤️
          </p>
          <button
            className="boton cupones-bienvenida__boton"
            type="button"
            onClick={() => setDescubierto(true)}
          >
            Descubrir mis cupones ✨
          </button>
        </section>
      </Pantalla>
    )
  }

  // Pantalla especial cuando los 10 cupones están canjeados en Supabase
  if (todosCanjeados && !cargando) {
    return (
      <Pantalla titulo="Una cajita de cupones para mi Ali 💌" icono="sorpresa" clase="pantalla-cupones">
        <Corazones />
        <section className="cupones-completados" aria-live="polite">
          <div className="cupones-completados__tarjeta">
            <img
              src="/personajes/brocolito.png"
              alt="Tu brocolito feliz"
              className="brocolito-avatar animado"
              width="140"
            />
            <h2>¡Todos los cuponcitos encontraron su momento! ❤️</h2>
            <p className="cupones-completados__mensaje">
              Mi Ali hermosa, ojalá cada uno de estos cuponcitos nos regale un ratito bonito juntos.
              No necesito grandes cosas para ser feliz contigo; muchas veces me basta con tenerte cerquita,
              escucharte reír y poder ser tu brocolito. Te quiero muchísimo, mi guagua. 🥦💗
            </p>
            <p className="cupones-completados__firma">Con amor, tu brocolito.</p>
            <div className="cupones-completados__acciones">
              <button
                className="boton chico claro"
                type="button"
                onClick={() => setDescubierto(true)}
              >
                Ver mis 10 cupones canjeados 📜
              </button>
              <Link to="/final" className="boton chico enlace">
                Ver mensaje final nocturno ✨
              </Link>
            </div>
          </div>
        </section>
      </Pantalla>
    )
  }

  return (
    <Pantalla titulo="Una cajita de cupones para mi Ali 💌" icono="sorpresa" clase="pantalla-cupones">
      {animandoCanjeId !== null && <Corazones />}

      <header className="cupones-header">
        <div className="cupones-progreso">
          <div className="cupones-progreso__info">
            <span className="cupones-progreso__texto">
              Has canjeado <strong>{cantidadCanjeados}</strong> de <strong>{CUPONES.length}</strong> cuponcitos 💗
            </span>
            <span className="cupones-progreso__porcentaje">
              {Math.round((cantidadCanjeados / CUPONES.length) * 100)}%
            </span>
          </div>
          <div className="cupones-progreso__barra" role="progressbar" aria-valuenow={cantidadCanjeados} aria-valuemin={0} aria-valuemax={CUPONES.length}>
            <div
              className="cupones-progreso__relleno"
              style={{ width: `${(cantidadCanjeados / CUPONES.length) * 100}%` }}
            />
          </div>
        </div>

        {mensajeExito && (
          <aside className="cupones-aviso-exito" role="status">
            {mensajeExito}
          </aside>
        )}

        {error && (
          <aside className="aviso" role="alert">
            {error}
          </aside>
        )}
      </header>

      {cargando ? (
        <p className="cupones-cargando" role="status">Abriendo la cajita de cupones de tu brocolito…</p>
      ) : (
        <section className="cupones-cuadricula" aria-label="Colección de cupones">
          {CUPONES.map((c) => {
            const canjeadoFecha = canjes[c.id]
            const estaCanjeado = Boolean(canjeadoFecha)
            const esElAnimado = animandoCanjeId === c.id

            return (
              <article
                key={c.id}
                className={`cupon-tarjeta ${estaCanjeado ? 'canjeado' : 'disponible'} ${esElAnimado ? 'animando' : ''}`}
                onClick={() => setCuponSeleccionado(c)}
              >
                <div className="cupon-tarjeta__borde-recortado" />
                <div className="cupon-tarjeta__cabecera">
                  <span className="cupon-tarjeta__icono" aria-hidden="true">{c.icono}</span>
                  <span className="cupon-tarjeta__estado">
                    {estaCanjeado ? '✓ Canjeado' : 'Disponible'}
                  </span>
                </div>
                <div className="cupon-tarjeta__cuerpo">
                  <small className="cupon-tarjeta__cat">{c.categoria}</small>
                  <h3 className="cupon-tarjeta__titulo">{c.titulo}</h3>
                  <p className="cupon-tarjeta__sub">{c.subtitulo}</p>
                </div>
                <div className="cupon-tarjeta__pie">
                  {estaCanjeado ? (
                    <span className="cupon-tarjeta__fecha">
                      {formatearFecha(canjeadoFecha)}
                    </span>
                  ) : (
                    <button
                      className="boton chico cupon-tarjeta__btn-canjear"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmandoCupon(c)
                      }}
                    >
                      Canjear cuponcito 💌
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* Modal para ver detalles completos del cupón */}
      {cuponSeleccionado && (
        <div className="modal-fondo" onClick={() => setCuponSeleccionado(null)} role="dialog" aria-modal="true">
          <div className="modal-contenido cupon-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-cerrar"
              type="button"
              onClick={() => setCuponSeleccionado(null)}
              aria-label="Cerrar cupón"
            >
              ✕
            </button>
            <div className="cupon-modal__icono" aria-hidden="true">{cuponSeleccionado.icono}</div>
            <span className={`cupon-modal__badge ${canjes[cuponSeleccionado.id] ? 'canjeado' : 'disponible'}`}>
              {canjes[cuponSeleccionado.id] ? '✓ Ya canjeado con amor' : 'Cupón activo'}
            </span>
            <h3 className="cupon-modal__titulo">{cuponSeleccionado.titulo}</h3>
            <p className="cupon-modal__subtitulo">{cuponSeleccionado.subtitulo}</p>
            <div className="cupon-modal__caja-descripcion">
              <p className="cupon-modal__descripcion">{cuponSeleccionado.descripcion}</p>
            </div>

            {canjes[cuponSeleccionado.id] ? (
              <p className="cupon-modal__registro">
                Canjeado el {formatearFecha(canjes[cuponSeleccionado.id])}
              </p>
            ) : (
              <button
                className="boton cupon-modal__btn"
                type="button"
                onClick={() => {
                  const seleccionado = cuponSeleccionado
                  setCuponSeleccionado(null)
                  setConfirmandoCupon(seleccionado)
                }}
              >
                Canjear este cupón ahora 💌
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación de canje */}
      {confirmandoCupon && (
        <div className="modal-fondo" onClick={() => !procesandoCanje && setConfirmandoCupon(null)} role="dialog" aria-modal="true">
          <div className="modal-contenido modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <img
              src="/personajes/brocolito.png"
              alt="Brocolito esperando"
              className="brocolito-modal"
              width="90"
            />
            <h3 className="modal-confirmacion__pregunta">
              ¿Quieres canjear este cuponcito, mi Ali hermosa? 🥹💗
            </h3>
            <p className="modal-confirmacion__cupon-nombre">
              <strong>{confirmandoCupon.icono} {confirmandoCupon.titulo}</strong>
            </p>
            <p className="modal-confirmacion__texto">
              «{confirmandoCupon.descripcion}»
            </p>
            <div className="modal-confirmacion__acciones">
              <button
                className="boton"
                type="button"
                onClick={() => void confirmarCanje()}
                disabled={procesandoCanje}
              >
                {procesandoCanje ? 'Canjeando…' : 'Sí, quiero canjearlo ❤️'}
              </button>
              <button
                className="boton claro"
                type="button"
                onClick={() => setConfirmandoCupon(null)}
                disabled={procesandoCanje}
              >
                Todavía no
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="cupones-pie">
        <Link to="/final" className="boton chico enlace claro">
          Ir al mensaje final nocturno →
        </Link>
      </footer>
    </Pantalla>
  )
}
