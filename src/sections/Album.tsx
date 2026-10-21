import { useEffect, useRef, useState } from 'react'
import { gps } from 'exifr'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import IconoSeccion from '../components/IconoSeccion'
import MapaRecuerdos from '../components/MapaRecuerdos'
import SelectorMapa from '../components/SelectorMapa'
import LibroAlbum from '../components/LibroAlbum'
import type { Coordenadas, Identificador, Recuerdo } from '../data/recuerdo'
import { buscarLugarEnChile } from '../data/buscarLugar'
import { formatoFecha } from '../data/formatoFecha'
import { supabaseConfigurado } from '../data/supabase'
import { cargarRecuerdosCompartidos, eliminarRecuerdoCompartido, escucharCambios, guardarRecuerdoCompartido, recuerdosGuardadosEnEsteNavegador } from '../data/datosCompartidos'

const CLAVE = 'recuerdos-ali'

function leerRecuerdos(): Recuerdo[] {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(guardados) ? guardados as Recuerdo[] : []
  } catch {
    return []
  }
}

// Achica la foto a 700px para que no ocupe tanto espacio.
function achicar(archivo: File): Promise<string> {
  return new Promise((ok, error) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onerror = () => {
      URL.revokeObjectURL(url)
      error(new Error('No se pudo abrir la imagen.'))
    }
    img.onload = () => {
      URL.revokeObjectURL(url)
      const k = Math.min(1, 700 / img.width), c = document.createElement('canvas')
      c.width = img.width * k; c.height = img.height * k
      const contexto = c.getContext('2d')
      if (!contexto) {
        error(new Error('No se pudo procesar la imagen.'))
        return
      }
      contexto.drawImage(img, 0, 0, c.width, c.height)
      ok(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = url
  })
}

export default function Album() {
  // Por ahora se guardan en este celular (localStorage). Más adelante irán a internet.
  const [lista, setLista] = useState<Recuerdo[]>(supabaseConfigurado ? [] : leerRecuerdos)
  const [cargandoNube, setCargandoNube] = useState(supabaseConfigurado)
  const [importando, setImportando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<Identificador | null>(null)
  const [foto, setFoto] = useState('')
  const [estadoFoto, setEstadoFoto] = useState('')
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [texto, setTexto] = useState('')
  const [lugar, setLugar] = useState('')
  const [buscandoLugar, setBuscandoLugar] = useState(false)
  const [estadoBusquedaLugar, setEstadoBusquedaLugar] = useState('')
  const [errorGuardado, setErrorGuardado] = useState('')
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null)
  const [vista, setVista] = useState<'paginas' | 'mapa'>('paginas')
  const [mostrarLibro, setMostrarLibro] = useState(false)
  const [recuerdoElegido, setRecuerdoElegido] = useState<Identificador | null>(null)
  const [recuerdoPorUbicar, setRecuerdoPorUbicar] = useState<Identificador | null>(null)
  const [opcionesAbiertasId, setOpcionesAbiertasId] = useState<Identificador | null>(null)
  const formularioRef = useRef<HTMLFormElement>(null)
  const recuerdosEnMapa = lista.filter((r) => r.coordenadas && Number.isFinite(r.coordenadas.lat) && Number.isFinite(r.coordenadas.lng))
  const recuerdosSinUbicacion = lista.filter((r) => !r.coordenadas)
  const recuerdoActivo = recuerdosEnMapa.find((r) => r.id === recuerdoElegido) ?? recuerdosEnMapa[0]
  const recuerdosLocales = recuerdosGuardadosEnEsteNavegador()

  useEffect(() => {
    if (!supabaseConfigurado) return
    let activa = true
    const recargar = async () => {
      try {
        const compartidos = await cargarRecuerdosCompartidos()
        if (activa) setLista(compartidos)
      } catch {
        if (activa) setErrorGuardado('No se pudieron cargar los recuerdos compartidos. Revisa que la configuración de Supabase esté lista.')
      } finally {
        if (activa) setCargandoNube(false)
      }
    }
    void recargar()
    const dejarDeEscuchar = escucharCambios('recuerdos', () => { void recargar() })
    return () => { activa = false; dejarDeEscuchar() }
  }, [])

  // Al abrir el formulario desde cualquier parte del álbum, lo llevamos a la vista.
  useEffect(() => {
    if (abierto) {
      formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [abierto])

  function irAlFormulario() {
    formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function limpiarFormulario() {
    setAbierto(false)
    setEditandoId(null)
    setFoto('')
    setEstadoFoto('')
    setTitulo('')
    setFecha('')
    setTexto('')
    setLugar('')
    setEstadoBusquedaLugar('')
    setCoordenadas(null)
  }

  function editarRecuerdo(recuerdo: Recuerdo) {
    setOpcionesAbiertasId(null)
    setEditandoId(recuerdo.id)
    setFoto('')
    setTitulo(recuerdo.titulo)
    setFecha(recuerdo.fecha)
    setTexto(recuerdo.texto)
    setLugar(recuerdo.lugar)
    setCoordenadas(recuerdo.coordenadas ?? null)
    setEstadoFoto('')
    setEstadoBusquedaLugar('')
    setAbierto(true)
  }

  async function eliminarRecuerdo(recuerdo: Recuerdo) {
    if (!window.confirm(`¿Quieres borrar el recuerdo «${recuerdo.titulo}»?`)) return
    if (supabaseConfigurado) {
      try {
        await eliminarRecuerdoCompartido(recuerdo)
        setLista((actual) => actual.filter((r) => r.id !== recuerdo.id))
        setErrorGuardado('')
      } catch {
        setErrorGuardado('No se pudo borrar. Comprueba la conexión e inténtalo de nuevo.')
      }
    } else {
      guardarLista(lista.filter((r) => r.id !== recuerdo.id))
    }
    setOpcionesAbiertasId(null)
    if (recuerdoElegido === recuerdo.id) setRecuerdoElegido(null)
  }

  async function buscarLugar() {
    if (!lugar.trim()) {
      setEstadoBusquedaLugar('Escribe el nombre del lugar que quieres buscar.')
      return
    }

    setBuscandoLugar(true)
    setEstadoBusquedaLugar('Buscando en Chile…')
    try {
      const encontrado = await buscarLugarEnChile(lugar)
      if (!encontrado) {
        setEstadoBusquedaLugar('No encontré ese lugar. Prueba agregando la comuna o ciudad.')
        return
      }

      setLugar(encontrado.nombre)
      setCoordenadas(encontrado.coordenadas)
      setEstadoBusquedaLugar(`Encontré ${encontrado.nombre} y marqué el punto en el mapa.`)
    } catch {
      setEstadoBusquedaLugar('No se pudo buscar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setBuscandoLugar(false)
    }
  }

  function guardarLista(nuevaLista: Recuerdo[]) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevaLista))
      setLista(nuevaLista)
      setErrorGuardado('')
      return true
    } catch {
      setErrorGuardado('No se pudo guardar. El navegador puede estar sin espacio; prueba con menos fotos.')
      return false
    }
  }

  async function guardarPuntoDeRecuerdo(id: Identificador, punto: Coordenadas) {
    const nuevaLista = lista.map((r) => r.id === id ? { ...r, coordenadas: punto } : r)
    if (supabaseConfigurado) {
      const cambiado = nuevaLista.find((r) => r.id === id)
      if (!cambiado) return
      try {
        const guardado = await guardarRecuerdoCompartido(cambiado)
        setLista((actual) => actual.map((r) => r.id === id ? guardado : r))
        setRecuerdoPorUbicar(null)
      } catch {
        setErrorGuardado('No se pudo guardar la ubicación compartida. Intenta de nuevo.')
      }
    } else if (guardarLista(nuevaLista)) setRecuerdoPorUbicar(null)
  }

  async function cargarFoto(archivo: File) {
    try {
      setEstadoFoto('Revisando si la foto tiene ubicación…')
      setFoto(await achicar(archivo))

      // Leemos el GPS del archivo original, antes de que la compresión quite sus metadatos.
      const gpsFoto = await gps(archivo).catch(() => undefined)
      if (gpsFoto && Number.isFinite(gpsFoto.latitude) && Number.isFinite(gpsFoto.longitude)) {
        setCoordenadas({ lat: gpsFoto.latitude, lng: gpsFoto.longitude })
        setEstadoFoto('¡Encontré la ubicación de la foto! Ya puse el pin en el mapa.')
      } else {
        setEstadoFoto('Esta foto no guarda ubicación GPS. Puedes elegir el punto tocando el mapa.')
      }
    } catch {
      setEstadoFoto('No pude abrir esa foto. Prueba con otra imagen.')
    }
  }

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const anterior = lista.find((r) => r.id === editandoId)
    const nuevo: Recuerdo = {
      id: editandoId ?? (supabaseConfigurado ? '' : Date.now()),
      foto: foto || anterior?.foto || '',
      fotoPath: anterior?.fotoPath,
      fecha,
      titulo,
      texto,
      lugar,
      ...(coordenadas ? { coordenadas } : {}),
    }
    if (supabaseConfigurado) {
      try {
        const guardado = await guardarRecuerdoCompartido(nuevo)
        setLista((actual) => anterior
          ? actual.map((r) => r.id === editandoId ? guardado : r)
          : [guardado, ...actual])
        setErrorGuardado('')
      } catch {
        setErrorGuardado('No se pudo guardar el recuerdo. Comprueba tu conexión e inténtalo de nuevo.')
        return
      }
    } else {
      const nuevaLista = anterior
        ? lista.map((r) => r.id === editandoId ? nuevo : r)
        : [nuevo, ...lista]
      if (!guardarLista(nuevaLista)) return
    }
    limpiarFormulario()
  }

  async function importarRecuerdosDeEsteNavegador() {
    if (recuerdosLocales.length === 0) return
    setImportando(true)
    setErrorGuardado('')
    try {
      for (const recuerdo of recuerdosLocales) {
        await guardarRecuerdoCompartido(recuerdo, `recuerdo:${recuerdo.id}`)
      }
      setLista(await cargarRecuerdosCompartidos())
    } catch {
      setErrorGuardado('La importación se interrumpió. Puedes volver a intentarlo; los recuerdos ya copiados no se duplicarán.')
    } finally {
      setImportando(false)
    }
  }
  return (
    <Pantalla titulo="Nuestro álbum" icono="album" clase="pantalla-album">
      <p className="menu__sub">{lista.length} recuerdos guardados</p>
      <small className="album__nota">{supabaseConfigurado ? 'Compartido en privado entre sus dos cuentas.' : 'Se guarda en este navegador por ahora.'}</small>
      {supabaseConfigurado && recuerdosLocales.length > 0 && (
        <aside className="importar-local">
          <p>Encontré {recuerdosLocales.length} recuerdo(s) guardado(s) en este navegador. Pueden importarse al álbum compartido.</p>
          <button className="boton chico claro" type="button" onClick={() => void importarRecuerdosDeEsteNavegador()} disabled={importando}>
            {importando ? 'Copiando recuerdos…' : 'Copiar mis recuerdos al espacio compartido'}
          </button>
        </aside>
      )}
      {errorGuardado && <p className="aviso" role="alert">{errorGuardado}</p>}
      {cargandoNube && <p role="status">Cargando nuestros recuerdos…</p>}
      <div className="album__pestanas" aria-label="Forma de ver los recuerdos">
        <button className={vista === 'paginas' ? 'activa' : ''} onClick={() => setVista('paginas')} type="button">
          📋 Polaroids
        </button>
        <button className={vista === 'mapa' ? 'activa' : ''} onClick={() => setVista('mapa')} type="button">
          📍 Mapa
        </button>
        <button className="album__btn-libro" onClick={() => setMostrarLibro(true)} type="button">
          📖 Ver como álbum
        </button>
      </div>
      {lista.length === 0 && !cargandoNube && vista === 'paginas' && (
        <div className="album__vacio">
          <IconoSeccion nombre="album" />
          <div>
            <h2>Un álbum para nosotros</h2>
            <p>Aquí guardaremos nuestras fotos y recuerdos favoritos.</p>
          </div>
          <img
            src="/lya-recuerdos/lya-camara.png"
            alt="Lya con su cámara de fotos"
            width="86"
            className="album__vacio-lya"
          />
        </div>
      )}
      {vista === 'paginas' ? (
        <div className="polaroids">
          {lista.map((r, i) => (
            <figure key={r.id} className="polaroid" style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
              {r.foto && <img src={r.foto} alt={r.titulo} />}
              <figcaption>
                <strong>{r.titulo}</strong>
                <small>{formatoFecha(r.fecha)} {r.lugar && `· ${r.lugar}`}</small>
                <span>{r.texto}</span>
                <div className="opciones-tarjeta">
                  <button
                    className="opciones-tarjeta__boton"
                    type="button"
                    aria-expanded={opcionesAbiertasId === r.id}
                    aria-label={`Opciones para ${r.titulo}`}
                    onClick={() => setOpcionesAbiertasId(opcionesAbiertasId === r.id ? null : r.id)}
                  >
                    ⋯ Opciones
                  </button>
                  {opcionesAbiertasId === r.id && (
                    <div className="opciones-tarjeta__menu">
                      <button className="boton chico claro" type="button" onClick={() => editarRecuerdo(r)}>Editar</button>
                      <button className="boton chico claro" type="button" onClick={() => void eliminarRecuerdo(r)}>Borrar</button>
                    </div>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <section className="album__mapa" aria-label="Mapa interactivo de nuestros recuerdos">
          <MapaRecuerdos recuerdos={lista} elegidoId={recuerdoElegido} alElegir={setRecuerdoElegido} />
          {recuerdoActivo && (
            <article className="mapa__recuerdo">
              {recuerdoActivo.foto && <img src={recuerdoActivo.foto} alt={recuerdoActivo.titulo} />}
              <div>
                <small>📍 {recuerdoActivo.lugar} · {recuerdoActivo.fecha}</small>
                <h2>{recuerdoActivo.titulo}</h2>
                <p>{recuerdoActivo.texto}</p>
              </div>
            </article>
          )}
          {recuerdosSinUbicacion.length > 0 && (
            <div className="mapa__pendientes">
              <h2>Recuerdos por ubicar</h2>
              <p>Los recuerdos antiguos no tienen coordenadas todavía. Puedes marcar el punto en el mapa.</p>
              {recuerdosSinUbicacion.map((r) => (
                <div className="mapa__pendiente" key={r.id}>
                  <strong>{r.titulo}</strong>
                  {recuerdoPorUbicar === r.id ? (
                    <SelectorMapa key={r.id} alElegir={(punto) => guardarPuntoDeRecuerdo(r.id, punto)} />
                  ) : (
                    <button className="boton chico claro" onClick={() => setRecuerdoPorUbicar(r.id)} type="button">
                      📍 Agregar ubicación
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      {abierto ? (
        <form ref={formularioRef} className="formulario" onSubmit={guardar}>
          <h2>{editandoId === null ? 'Agregar un recuerdo' : 'Editar recuerdo'}</h2>
          <label htmlFor="foto-recuerdo">Foto</label>
          <input id="foto-recuerdo" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && cargarFoto(e.target.files[0])} />
          {editandoId !== null && !foto && lista.find((r) => r.id === editandoId)?.foto && <small>Si no eliges otra foto, conservaremos la que ya tiene.</small>}
          {estadoFoto && <small role="status">{estadoFoto}</small>}
          <label htmlFor="titulo-recuerdo">Título</label>
          <input id="titulo-recuerdo" name="titulo" placeholder="Ej.: Nuestra primera cita" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          <label htmlFor="fecha-recuerdo">Fecha</label>
          <input id="fecha-recuerdo" name="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          <div className="album__buscar-lugar">
            <label htmlFor="lugar-recuerdo">Lugar (puedes buscarlo)</label>
            <div className="album__buscar-lugar-fila">
              <input
                id="lugar-recuerdo"
                name="lugar"
                placeholder="Ej.: Estadio Nacional"
                value={lugar}
                onChange={(evento) => {
                  setLugar(evento.target.value)
                  setEstadoBusquedaLugar('')
                }}
                autoComplete="off"
              />
              <button className="boton chico claro" type="button" onClick={() => void buscarLugar()} disabled={buscandoLugar}>
                {buscandoLugar ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            {estadoBusquedaLugar && <small className="mapa-busqueda__estado" role="status">{estadoBusquedaLugar}</small>}
          </div>
          <SelectorMapa alElegir={setCoordenadas} puntoActual={coordenadas} />
          <label htmlFor="texto-recuerdo">¿Qué pasó ese día?</label>
          <textarea id="texto-recuerdo" name="texto" placeholder="Escribe un detalle para recordarlo" rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="boton chico" type="submit">{editandoId === null ? 'Guardar recuerdo' : 'Guardar cambios'}</button>
          <button className="boton chico claro" type="button" onClick={limpiarFormulario}>Cancelar</button>
        </form>
      ) : null}
      <div className="album__barra-accion">
        <button
          className="boton"
          type="button"
          onClick={() => abierto ? irAlFormulario() : (limpiarFormulario(), setAbierto(true))}
        >
          {abierto ? '↓ Ir al formulario' : '+ Agregar recuerdo'}
        </button>
      </div>

      {mostrarLibro && (
        <LibroAlbum recuerdos={lista} alCerrar={() => setMostrarLibro(false)} />
      )}
    </Pantalla>
  )
}
