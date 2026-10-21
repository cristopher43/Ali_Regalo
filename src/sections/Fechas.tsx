import { useEffect, useRef, useState } from 'react'
import Pantalla from '../components/Pantalla'
import Personaje from '../components/Personaje'
import { FECHAS } from '../data/contenido'
import { formatoFecha } from '../data/formatoFecha'
import { supabaseConfigurado } from '../data/supabase'
import { cargarFechasCompartidas, eliminarFechaCompartida, escucharCambios, fechasGuardadasEnEsteNavegador, guardarFechaCompartida, type FechaImportante } from '../data/datosCompartidos'

const CLAVE = 'fechas-importantes-ali'

function leerFechas(): FechaImportante[] {
  const guardadas = localStorage.getItem(CLAVE)
  if (guardadas) {
    try {
      return JSON.parse(guardadas) as FechaImportante[]
    } catch {
      // Si el dato del navegador se dañó, mostramos las fechas iniciales.
    }
  }

  return FECHAS.map((fecha, indice) => ({ ...fecha, id: indice + 1 }))
}

export default function Fechas() {
  const [fechas, setFechas] = useState<FechaImportante[]>(supabaseConfigurado ? [] : leerFechas)
  const [cargandoNube, setCargandoNube] = useState(supabaseConfigurado)
  const [importando, setImportando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<FechaImportante['id'] | null>(null)
  const [fecha, setFecha] = useState('')
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [opcionesAbiertasId, setOpcionesAbiertasId] = useState<FechaImportante['id'] | null>(null)
  const [errorGuardado, setErrorGuardado] = useState('')
  const formularioRef = useRef<HTMLFormElement>(null)
  const fechasLocales = fechasGuardadasEnEsteNavegador()

  useEffect(() => {
    if (!supabaseConfigurado) return
    let activa = true
    const recargar = async () => {
      try {
        const compartidas = await cargarFechasCompartidas()
        if (activa) setFechas(compartidas)
      } catch {
        if (activa) setErrorGuardado('No se pudieron cargar las fechas compartidas. Revisa que la configuración de Supabase esté lista.')
      } finally {
        if (activa) setCargandoNube(false)
      }
    }
    void recargar()
    const dejarDeEscuchar = escucharCambios('fechas_importantes', () => { void recargar() })
    return () => { activa = false; dejarDeEscuchar() }
  }, [])

  useEffect(() => {
    if (abierto) formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [abierto])

  function guardarLista(nuevasFechas: FechaImportante[]) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevasFechas))
      setFechas(nuevasFechas)
      setErrorGuardado('')
      return true
    } catch {
      setErrorGuardado('No se pudo guardar. Revisa el espacio disponible en este navegador.')
      return false
    }
  }

  function limpiarFormulario() {
    setAbierto(false)
    setEditandoId(null)
    setFecha('')
    setTitulo('')
    setTexto('')
  }

  function abrirFormulario() {
    limpiarFormulario()
    setAbierto(true)
  }

  function editarFecha(fechaElegida: FechaImportante) {
    setOpcionesAbiertasId(null)
    setEditandoId(fechaElegida.id)
    setFecha(/^\d{4}-\d{2}-\d{2}$/.test(fechaElegida.fecha) ? fechaElegida.fecha : '')
    setTitulo(fechaElegida.titulo)
    setTexto(fechaElegida.texto)
    setAbierto(true)
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const nuevaFecha: FechaImportante = {
      id: editandoId ?? (supabaseConfigurado ? '' : Date.now()),
      fecha,
      titulo,
      texto,
    }
    if (supabaseConfigurado) {
      try {
        const guardada = await guardarFechaCompartida(nuevaFecha)
        setFechas((actual) => editandoId === null
          ? [...actual, guardada].sort((a, b) => a.fecha.localeCompare(b.fecha))
          : actual.map((f) => f.id === editandoId ? guardada : f))
        setErrorGuardado('')
      } catch {
        setErrorGuardado('No se pudo guardar la fecha. Comprueba tu conexión e inténtalo de nuevo.')
        return
      }
    } else {
      const listaActualizada = editandoId === null
        ? [...fechas, nuevaFecha]
        : fechas.map((f) => f.id === editandoId ? nuevaFecha : f)
      if (!guardarLista(listaActualizada)) return
    }
    limpiarFormulario()
  }

  async function eliminarFecha(fechaElegida: FechaImportante) {
    if (!window.confirm(`¿Quieres borrar la fecha «${fechaElegida.titulo}»?`)) return
    if (supabaseConfigurado) {
      try {
        await eliminarFechaCompartida(fechaElegida.id)
        setFechas((actual) => actual.filter((f) => f.id !== fechaElegida.id))
        setOpcionesAbiertasId(null)
      } catch {
        setErrorGuardado('No se pudo borrar la fecha. Comprueba tu conexión e inténtalo de nuevo.')
      }
    } else if (guardarLista(fechas.filter((f) => f.id !== fechaElegida.id))) setOpcionesAbiertasId(null)
  }

  async function importarFechasDeEsteNavegador() {
    if (fechasLocales.length === 0) return
    setImportando(true)
    setErrorGuardado('')
    try {
      for (const fechaLocal of fechasLocales) {
        await guardarFechaCompartida(fechaLocal, `fecha:${fechaLocal.id}`)
      }
      setFechas(await cargarFechasCompartidas())
    } catch {
      setErrorGuardado('La importación se interrumpió. Puedes volver a intentarlo; las fechas ya copiadas no se duplicarán.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <Pantalla titulo="Fechas especiales" icono="fechas" clase="pantalla-fechas">
      <p className="menu__sub">Guarda los días que siempre quieres recordar.</p>
      <small className="fechas__nota">{supabaseConfigurado ? 'Compartidas en privado entre sus dos cuentas.' : 'Tus fechas se guardan en este navegador por ahora.'}</small>
      {supabaseConfigurado && fechasLocales.length > 0 && (
        <aside className="importar-local">
          <p>Encontré {fechasLocales.length} fecha(s) guardada(s) en este navegador. Pueden importarse al calendario compartido.</p>
          <button className="boton chico claro" type="button" onClick={() => void importarFechasDeEsteNavegador()} disabled={importando}>
            {importando ? 'Copiando fechas…' : 'Copiar mis fechas al espacio compartido'}
          </button>
        </aside>
      )}
      {errorGuardado && <p className="aviso" role="alert">{errorGuardado}</p>}
      {cargandoNube && <p role="status">Cargando nuestras fechas…</p>}
      <ol className="linea">
        {fechas.map((f) => (
          <li key={f.id}>
            <small>{formatoFecha(f.fecha)}</small>
            <strong>{f.titulo}</strong>
            <span>{f.texto}</span>
            <div className="opciones-tarjeta">
              <button
                className="opciones-tarjeta__boton"
                type="button"
                aria-expanded={opcionesAbiertasId === f.id}
                aria-label={`Opciones para ${f.titulo}`}
                onClick={() => setOpcionesAbiertasId(opcionesAbiertasId === f.id ? null : f.id)}
              >
                ⋯ Opciones
              </button>
              {opcionesAbiertasId === f.id && (
                <div className="opciones-tarjeta__menu">
                  <button className="boton chico claro" type="button" onClick={() => editarFecha(f)}>Editar</button>
                  <button className="boton chico claro" type="button" onClick={() => void eliminarFecha(f)}>Borrar</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {fechas.length === 0 && <p>Aún no hay fechas guardadas. Agrega una para comenzar.</p>}
      {abierto && (
        <form ref={formularioRef} className="formulario" onSubmit={guardar}>
          <h2>{editandoId === null ? 'Agregar una fecha' : 'Editar fecha'}</h2>
          <label htmlFor="fecha-importante">Día importante</label>
          <input id="fecha-importante" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          <label htmlFor="titulo-fecha">¿Qué celebramos?</label>
          <input id="titulo-fecha" placeholder="Ej.: Nuestra primera cita" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          <label htmlFor="texto-fecha">Un detalle para recordar</label>
          <textarea id="texto-fecha" placeholder="Escribe una frase cortita" rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <button className="boton chico" type="submit">{editandoId === null ? 'Guardar fecha' : 'Guardar cambios'}</button>
          <button className="boton chico claro" type="button" onClick={limpiarFormulario}>Cancelar</button>
        </form>
      )}
      <Personaje quien="lya" pose="siesta" ancho={180} />
      <div className="fechas__barra-accion">
        <button className="boton" type="button" onClick={() => abierto ? formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) : abrirFormulario()}>
          {abierto ? '↓ Ir al formulario' : '+ Agregar fecha importante'}
        </button>
      </div>
    </Pantalla>
  )
}
