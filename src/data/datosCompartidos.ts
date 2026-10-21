import type { Coordenadas, Identificador, Recuerdo } from './recuerdo'
import { supabase } from './supabase'

const BUCKET = 'recuerdos-pareja'

export type FechaImportante = {
  id: Identificador
  fecha: string
  titulo: string
  texto: string
}

type FilaRecuerdo = {
  id: string
  fecha: string
  titulo: string
  texto: string
  lugar: string
  foto_path: string | null
  latitud: number | null
  longitud: number | null
}

function requerirSupabase() {
  if (!supabase) throw new Error('Primero debemos conectar la base compartida.')
  return supabase
}

async function direccionFoto(ruta: string | null) {
  if (!ruta) return ''
  const { data, error } = await requerirSupabase().storage.from(BUCKET).createSignedUrl(ruta, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

async function convertirRecuerdo(fila: FilaRecuerdo): Promise<Recuerdo> {
  const coordenadas: Coordenadas | undefined = fila.latitud !== null && fila.longitud !== null
    ? { lat: fila.latitud, lng: fila.longitud }
    : undefined
  return {
    id: fila.id,
    foto: await direccionFoto(fila.foto_path),
    fotoPath: fila.foto_path ?? undefined,
    fecha: fila.fecha,
    titulo: fila.titulo,
    texto: fila.texto,
    lugar: fila.lugar,
    ...(coordenadas ? { coordenadas } : {}),
  }
}

export async function cargarRecuerdosCompartidos() {
  const { data, error } = await requerirSupabase().from('recuerdos').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return Promise.all((data as FilaRecuerdo[]).map(convertirRecuerdo))
}

async function guardarFoto(foto: string, rutaExistente?: string, rutaMigrada?: string) {
  if (!foto.startsWith('data:')) return rutaExistente ?? null
  const archivo = await fetch(foto).then((respuesta) => respuesta.blob())
  const ruta = rutaMigrada ?? `fotos/${crypto.randomUUID()}.jpg`
  const { error } = await requerirSupabase().storage.from(BUCKET).upload(ruta, archivo, {
    contentType: 'image/jpeg',
    upsert: Boolean(rutaMigrada),
  })
  if (error) throw error
  return ruta
}

export async function guardarRecuerdoCompartido(recuerdo: Recuerdo, origenLocal?: string) {
  const cliente = requerirSupabase()
  const rutaAnterior = recuerdo.fotoPath
  const foto_path = await guardarFoto(
    recuerdo.foto,
    rutaAnterior,
    origenLocal ? `migrados/${origenLocal.replace(':', '-')}.jpg` : undefined,
  )
  const fila = {
    fecha: recuerdo.fecha,
    titulo: recuerdo.titulo,
    texto: recuerdo.texto,
    lugar: recuerdo.lugar,
    foto_path,
    latitud: recuerdo.coordenadas?.lat ?? null,
    longitud: recuerdo.coordenadas?.lng ?? null,
    ...(origenLocal ? { origen_local: origenLocal } : {}),
  }

  const resultado = typeof recuerdo.id === 'string' && recuerdo.id
    ? await cliente.from('recuerdos').update(fila).eq('id', recuerdo.id).select('*').single()
    : origenLocal
      ? await cliente.from('recuerdos').upsert(fila, { onConflict: 'origen_local' }).select('*').single()
      : await cliente.from('recuerdos').insert(fila).select('*').single()

  if (resultado.error) {
    if (foto_path && foto_path !== rutaAnterior && !origenLocal) {
      await cliente.storage.from(BUCKET).remove([foto_path])
    }
    throw resultado.error
  }

  if (rutaAnterior && foto_path !== rutaAnterior) {
    await cliente.storage.from(BUCKET).remove([rutaAnterior])
  }
  return convertirRecuerdo(resultado.data as FilaRecuerdo)
}

export async function eliminarRecuerdoCompartido(recuerdo: Recuerdo) {
  const cliente = requerirSupabase()
  const { error } = await cliente.from('recuerdos').delete().eq('id', recuerdo.id)
  if (error) throw error
  if (recuerdo.fotoPath) await cliente.storage.from(BUCKET).remove([recuerdo.fotoPath])
}

export async function cargarFechasCompartidas() {
  const { data, error } = await requerirSupabase().from('fechas_importantes').select('*').order('fecha', { ascending: true })
  if (error) throw error
  return data as FechaImportante[]
}

export async function guardarFechaCompartida(fecha: FechaImportante, origenLocal?: string) {
  const cliente = requerirSupabase()
  const fila = {
    fecha: fecha.fecha,
    titulo: fecha.titulo,
    texto: fecha.texto,
    ...(origenLocal ? { origen_local: origenLocal } : {}),
  }
  const resultado = typeof fecha.id === 'string' && fecha.id
    ? await cliente.from('fechas_importantes').update(fila).eq('id', fecha.id).select('*').single()
    : origenLocal
      ? await cliente.from('fechas_importantes').upsert(fila, { onConflict: 'origen_local' }).select('*').single()
      : await cliente.from('fechas_importantes').insert(fila).select('*').single()
  if (resultado.error) throw resultado.error
  return resultado.data as FechaImportante
}

export async function eliminarFechaCompartida(id: Identificador) {
  const { error } = await requerirSupabase().from('fechas_importantes').delete().eq('id', id)
  if (error) throw error
}

export function escucharCambios(tabla: 'recuerdos' | 'fechas_importantes', alCambiar: () => void) {
  const cliente = supabase
  if (!cliente) return () => {}
  const canal = cliente.channel(`cambios-${tabla}-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, alCambiar)
    .subscribe()
  return () => { void cliente.removeChannel(canal) }
}

export function recuerdosGuardadosEnEsteNavegador(): Recuerdo[] {
  try {
    const valor = JSON.parse(localStorage.getItem('recuerdos-ali') ?? '[]')
    return Array.isArray(valor) ? valor as Recuerdo[] : []
  } catch { return [] }
}

export function fechasGuardadasEnEsteNavegador(): FechaImportante[] {
  try {
    const valor = JSON.parse(localStorage.getItem('fechas-importantes-ali') ?? '[]')
    return Array.isArray(valor) ? valor as FechaImportante[] : []
  } catch { return [] }
}
