import type { Coordenadas } from './recuerdo'

export type LugarEncontrado = {
  coordenadas: Coordenadas
  nombre: string
}

type ResultadoNominatim = {
  lat: string
  lon: string
  name?: string
  display_name: string
}

const resultadosGuardados = new Map<string, LugarEncontrado | null>()
let ultimaBusqueda = 0

// Busca solo cuando la persona aprieta el botón; no consulta por cada letra escrita.
export async function buscarLugarEnChile(consulta: string): Promise<LugarEncontrado | null> {
  const texto = consulta.trim()
  if (!texto) return null

  const clave = texto.toLocaleLowerCase('es-CL')
  if (resultadosGuardados.has(clave)) return resultadosGuardados.get(clave) ?? null

  // El servicio gratuito pide no hacer más de una búsqueda por segundo.
  const espera = Math.max(0, 1100 - (Date.now() - ultimaBusqueda))
  if (espera) await new Promise((resolver) => window.setTimeout(resolver, espera))
  ultimaBusqueda = Date.now()

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${texto}, Chile`)
  url.searchParams.set('countrycodes', 'cl')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('accept-language', 'es')

  const respuesta = await fetch(url)
  if (!respuesta.ok) throw new Error('No se pudo conectar con la búsqueda de lugares.')

  const resultados = await respuesta.json() as ResultadoNominatim[]
  const primero = resultados[0]
  if (!primero) {
    resultadosGuardados.set(clave, null)
    return null
  }

  const lugar = {
    coordenadas: { lat: Number(primero.lat), lng: Number(primero.lon) },
    nombre: primero.name || primero.display_name.split(',').slice(0, 2).join(', '),
  }
  resultadosGuardados.set(clave, lugar)
  return lugar
}
