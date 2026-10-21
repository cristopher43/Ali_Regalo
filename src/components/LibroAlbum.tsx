import { useState, useEffect } from 'react'
import type { Recuerdo } from '../data/recuerdo'
import { formatoFecha } from '../data/formatoFecha'

type Props = {
  recuerdos: Recuerdo[]
  alCerrar: () => void
}

export default function LibroAlbum({ recuerdos, alCerrar }: Props) {
  const [paginaActual, setPaginaActual] = useState(0)
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768)
  const [fotoZoom, setFotoZoom] = useState<Recuerdo | null>(null)
  const [animandoDir, setAnimandoDir] = useState<'next' | 'prev' | null>(null)

  useEffect(() => {
    const alRedimensionar = () => {
      setEsMovil(window.innerWidth < 768)
    }
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  // En móvil mostramos 1 foto por página, en escritorio 2 fotos (pliego abierto)
  const fotosPorHoja = esMovil ? 1 : 2
  const totalHojas = Math.max(1, Math.ceil(recuerdos.length / fotosPorHoja))

  const irSiguiente = () => {
    if (paginaActual < totalHojas - 1) {
      setAnimandoDir('next')
      setTimeout(() => {
        setPaginaActual((p) => p + 1)
        setAnimandoDir(null)
      }, 250)
    }
  }

  const irAnterior = () => {
    if (paginaActual > 0) {
      setAnimandoDir('prev')
      setTimeout(() => {
        setPaginaActual((p) => p - 1)
        setAnimandoDir(null)
      }, 250)
    }
  }

  // Atajos con teclado: flechas y Escape
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fotoZoom) setFotoZoom(null)
        else alCerrar()
      } else if (e.key === 'ArrowRight') {
        irSiguiente()
      } else if (e.key === 'ArrowLeft') {
        irAnterior()
      }
    }
    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [fotoZoom, paginaActual, totalHojas])

  const indiceInicial = paginaActual * fotosPorHoja
  const fotosEnPliego = recuerdos.slice(indiceInicial, indiceInicial + fotosPorHoja)

  return (
    <div className="libro-overlay" role="dialog" aria-modal="true" aria-label="Álbum de recuerdos físico">
      <div className="libro-barra-superior">
        <div className="libro-barra-titulo">
          <span className="libro-icono">📖</span>
          <div>
            <strong>Nuestro álbum de recuerdos</strong>
            <small>Hoja {paginaActual + 1} de {totalHojas} • {recuerdos.length} momentos</small>
          </div>
        </div>
        <button
          className="boton chico claro libro-btn-cerrar"
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar vista de álbum"
        >
          ✕ Cerrar
        </button>
      </div>

      <div className="libro-escenario">
        {recuerdos.length === 0 ? (
          <div className="libro-hoja libro-hoja--vacia">
            <div className="libro-cinta-washi libro-cinta-washi--top" />
            <span className="libro-emoji-vacio">📷</span>
            <h3>Aún no hay fotos en el álbum</h3>
            <p>Sube su primera fotito en la pestaña de páginas o mapa para verla aquí colocada con amor.</p>
          </div>
        ) : (
          <div className={`libro-pliego ${esMovil ? 'libro-pliego--movil' : 'libro-pliego--doble'} ${animandoDir ? `animando-${animandoDir}` : ''}`}>
            {/* Lomo decorativo en modo libro doble */}
            {!esMovil && <div className="libro-lomo" />}

            {/* Página izquierda */}
            <div className="libro-hoja libro-hoja--izquierda">
              <div className="libro-cinta-washi libro-cinta-washi--arriba-izq" />
              {fotosEnPliego[0] ? (
                <div className="libro-foto-marco" onClick={() => setFotoZoom(fotosEnPliego[0])}>
                  <div className="libro-foto-contenedor">
                    {fotosEnPliego[0].foto ? (
                      <img src={fotosEnPliego[0].foto} alt={fotosEnPliego[0].titulo} loading="lazy" />
                    ) : (
                      <div className="libro-foto-placeholder">📷 Sin foto</div>
                    )}
                    <span className="libro-zoom-pista">🔍 Toca para ampliar</span>
                  </div>
                  <div className="libro-nota">
                    <span className="libro-corazon">♥</span>
                    <h4 className="libro-nota-titulo">{fotosEnPliego[0].titulo}</h4>
                    <p className="libro-nota-fecha">
                      {formatoFecha(fotosEnPliego[0].fecha)} {fotosEnPliego[0].lugar && `• ${fotosEnPliego[0].lugar}`}
                    </p>
                    {fotosEnPliego[0].texto && <p className="libro-nota-texto">{fotosEnPliego[0].texto}</p>}
                  </div>
                </div>
              ) : (
                <div className="libro-hoja-en-blanco">
                  <p>Espacio reservado para más recuerdos juntos… 💕</p>
                </div>
              )}
              <span className="libro-numero-pagina">{paginaActual * fotosPorHoja + 1}</span>
            </div>

            {/* Página derecha (solo en escritorio) */}
            {!esMovil && (
              <div className="libro-hoja libro-hoja--derecha">
                <div className="libro-cinta-washi libro-cinta-washi--arriba-der" />
                {fotosEnPliego[1] ? (
                  <div className="libro-foto-marco" onClick={() => setFotoZoom(fotosEnPliego[1])}>
                    <div className="libro-foto-contenedor">
                      {fotosEnPliego[1].foto ? (
                        <img src={fotosEnPliego[1].foto} alt={fotosEnPliego[1].titulo} loading="lazy" />
                      ) : (
                        <div className="libro-foto-placeholder">📷 Sin foto</div>
                      )}
                      <span className="libro-zoom-pista">🔍 Toca para ampliar</span>
                    </div>
                    <div className="libro-nota">
                      <span className="libro-corazon">♥</span>
                      <h4 className="libro-nota-titulo">{fotosEnPliego[1].titulo}</h4>
                      <p className="libro-nota-fecha">
                        {formatoFecha(fotosEnPliego[1].fecha)} {fotosEnPliego[1].lugar && `• ${fotosEnPliego[1].lugar}`}
                      </p>
                      {fotosEnPliego[1].texto && <p className="libro-nota-texto">{fotosEnPliego[1].texto}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="libro-hoja-en-blanco">
                    <p>Espacio reservado para más recuerdos juntos… 💕</p>
                  </div>
                )}
                <span className="libro-numero-pagina">{paginaActual * fotosPorHoja + 2}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      {recuerdos.length > 0 && (
        <div className="libro-controles">
          <button
            className="boton chico claro libro-btn-nav"
            type="button"
            onClick={irAnterior}
            disabled={paginaActual === 0}
            aria-label="Página anterior"
          >
            ← Anterior
          </button>
          <span className="libro-indicador">
            Página {paginaActual + 1} de {totalHojas}
          </span>
          <button
            className="boton chico libro-btn-nav"
            type="button"
            onClick={irSiguiente}
            disabled={paginaActual >= totalHojas - 1}
            aria-label="Página siguiente"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de Zoom de Foto */}
      {fotoZoom && (
        <div className="libro-zoom-fondo" onClick={() => setFotoZoom(null)}>
          <div className="libro-zoom-caja" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-cerrar"
              type="button"
              onClick={() => setFotoZoom(null)}
              aria-label="Cerrar imagen ampliada"
            >
              ✕
            </button>
            <img src={fotoZoom.foto} alt={fotoZoom.titulo} className="libro-zoom-img" />
            <div className="libro-zoom-pie">
              <h3>{fotoZoom.titulo}</h3>
              <small>{formatoFecha(fotoZoom.fecha)} {fotoZoom.lugar && `• ${fotoZoom.lugar}`}</small>
              {fotoZoom.texto && <p>{fotoZoom.texto}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
