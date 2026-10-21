import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Coordenadas } from '../data/recuerdo'

const CENTRO_INICIAL: [number, number] = [-33.45, -70.67]
const ICONO_CORAZON = L.divIcon({
  className: 'pin-recuerdo-marco',
  html: '<span class="pin-recuerdo">♥</span>',
  iconSize: [38, 42],
  iconAnchor: [19, 21],
})

type Props = {
  alElegir: (punto: Coordenadas) => void
  puntoActual?: Coordenadas | null
}

export default function SelectorMapa({ alElegir, puntoActual = null }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const marcadorRef = useRef<L.Marker | null>(null)
  const alElegirRef = useRef(alElegir)
  const [puntoElegido, setPuntoElegido] = useState<Coordenadas | null>(null)
  const [mapaListo, setMapaListo] = useState(false)

  useEffect(() => {
    alElegirRef.current = alElegir
  }, [alElegir])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !mapaListo) return

    if (!puntoActual) {
      marcadorRef.current?.remove()
      marcadorRef.current = null
      setPuntoElegido(null)
      return
    }

    const posicion = L.latLng(puntoActual.lat, puntoActual.lng)
    if (marcadorRef.current) {
      marcadorRef.current.setLatLng(posicion)
    } else {
      marcadorRef.current = L.marker(posicion, { icon: ICONO_CORAZON }).addTo(mapa)
    }
    mapa.setView(posicion, 15)
    setPuntoElegido(puntoActual)
  }, [mapaListo, puntoActual])

  useEffect(() => {
    if (!contenedorRef.current) return

    const mapa = L.map(contenedorRef.current).setView(CENTRO_INICIAL, 12)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa)

    const elegirPunto = (evento: L.LeafletMouseEvent) => {
      const punto = { lat: evento.latlng.lat, lng: evento.latlng.lng }
      setPuntoElegido(punto)
      alElegirRef.current(punto)

      if (marcadorRef.current) {
        marcadorRef.current.setLatLng(evento.latlng)
      } else {
        marcadorRef.current = L.marker(evento.latlng, { icon: ICONO_CORAZON }).addTo(mapa)
      }
    }

    mapa.on('click', elegirPunto)
    mapaRef.current = mapa
    const ajuste = window.setTimeout(() => {
      mapa.invalidateSize()
      setMapaListo(true)
    }, 100)

    return () => {
      window.clearTimeout(ajuste)
      mapa.off('click', elegirPunto)
      mapa.remove()
      mapaRef.current = null
      marcadorRef.current = null
    }
  }, [])

  return (
    <div className="selector-mapa-contenedor">
      <p>Toca el mapa donde ocurrió el recuerdo. Puedes acercar y mover el mapa.</p>
      <div ref={contenedorRef} className="mapa-selector" aria-label="Toca para elegir el lugar del recuerdo" />
      {puntoElegido && (
        <small className="selector-mapa-coordenadas">
          Punto elegido: {puntoElegido.lat.toFixed(5)}, {puntoElegido.lng.toFixed(5)}
        </small>
      )}
    </div>
  )
}
