import { useEffect, useState } from 'react'
import type { Coordenadas } from '../data/recuerdo'

type Sugerencia = {
  texto: string
  coordenadas: Coordenadas
}

type LugarPhoton = {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    street?: string
    district?: string
    city?: string
    county?: string
    state?: string
    country?: string
  }
}

type RespuestaPhoton = { features: LugarPhoton[] }

type Props = {
  valor: string
  alEscribir: (texto: string) => void
  alElegir: (sugerencia: Sugerencia) => void
}

export default function AutocompleteLugar({ valor, alEscribir, alElegir }: Props) {
  const [consulta, setConsulta] = useState('')
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [estado, setEstado] = useState('')

  useEffect(() => {
    const texto = consulta.trim()
    if (texto.length < 3) {
      setSugerencias([])
      setEstado('')
      return
    }

    const cancelar = new AbortController()
    const espera = window.setTimeout(async () => {
      setEstado('Buscando lugares…')
      try {
        // Photon no acepta "es" en su servidor público; "default" usa el nombre local del lugar.
        const direccion = `https://photon.komoot.io/api/?q=${encodeURIComponent(texto)}&lang=default&limit=5&countrycode=CL`
        const respuesta = await fetch(direccion, { signal: cancelar.signal })
        if (!respuesta.ok) throw new Error('No se pudo buscar el lugar')

        const datos = await respuesta.json() as RespuestaPhoton
        const opciones = datos.features.map((lugar) => {
          const p = lugar.properties
          const partes = [p.name, p.street, p.district, p.city, p.county, p.state, p.country]
            .filter((parte): parte is string => Boolean(parte))
          return {
            texto: [...new Set(partes)].join(', ') || 'Lugar sin nombre',
            coordenadas: {
              lat: lugar.geometry.coordinates[1],
              lng: lugar.geometry.coordinates[0],
            },
          }
        })
        setSugerencias(opciones)
        setEstado(opciones.length ? '' : 'No encontré sugerencias. Puedes marcarlo en el mapa.')
      } catch {
        if (!cancelar.signal.aborted) {
          setSugerencias([])
          setEstado('No se pudieron cargar sugerencias. Puedes marcarlo en el mapa.')
        }
      }
    }, 450)

    return () => {
      window.clearTimeout(espera)
      cancelar.abort()
    }
  }, [consulta])

  function elegir(sugerencia: Sugerencia) {
    alElegir(sugerencia)
    setConsulta('')
    setSugerencias([])
    setEstado('')
  }

  return (
    <div className="autocomplete-lugar">
      <label htmlFor="lugar-recuerdo">Lugar (opcional)</label>
      <input
        id="lugar-recuerdo"
        name="lugar"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="sugerencias-lugares"
        aria-expanded={sugerencias.length > 0}
        aria-haspopup="listbox"
        onChange={(evento) => {
          alEscribir(evento.target.value)
          setConsulta(evento.target.value)
        }}
        placeholder="Escribe un café, parque o dirección…"
        type="text"
        value={valor}
      />
      {sugerencias.length > 0 && (
        <ul id="sugerencias-lugares" className="autocomplete-lugar__lista" aria-label="Lugares sugeridos" role="listbox">
          {sugerencias.map((sugerencia, i) => (
            <li key={`${sugerencia.texto}-${i}`}>
              <button role="option" aria-selected="false" type="button" onMouseDown={(evento) => evento.preventDefault()} onClick={() => elegir(sugerencia)}>
                📍 {sugerencia.texto}
              </button>
            </li>
          ))}
        </ul>
      )}
      {estado && <small className="autocomplete-lugar__estado" role="status">{estado}</small>}
    </div>
  )
}
