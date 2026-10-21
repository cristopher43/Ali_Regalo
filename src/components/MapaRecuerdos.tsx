import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Identificador, Recuerdo } from '../data/recuerdo'

const CENTRO_INICIAL: [number, number] = [-33.45, -70.67]

const ICONO_CORAZON = L.divIcon({
  className: 'pin-recuerdo-marco',
  html: '<span class="pin-recuerdo">♥</span>',
  iconSize: [38, 42],
  iconAnchor: [19, 21],
})

type Props = {
  recuerdos: Recuerdo[]
  elegidoId: Identificador | null
  alElegir: (id: Identificador) => void
}

export default function MapaRecuerdos({ recuerdos, elegidoId, alElegir }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const pinesRef = useRef<L.LayerGroup | null>(null)
  const ubicacionRef = useRef<L.CircleMarker | null>(null)
  const [inicializado, setInicializado] = useState(false)
  const [estadoGps, setEstadoGps] = useState('')

  useEffect(() => {
    if (!contenedorRef.current) return

    const mapa = L.map(contenedorRef.current).setView(CENTRO_INICIAL, 12)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa)

    mapaRef.current = mapa
    pinesRef.current = L.layerGroup().addTo(mapa)
    const ajuste = window.setTimeout(() => {
      mapa.invalidateSize()
      setInicializado(true)
    }, 100)

    return () => {
      window.clearTimeout(ajuste)
      mapa.remove()
      mapaRef.current = null
      pinesRef.current = null
      ubicacionRef.current = null
    }
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    const pines = pinesRef.current
    if (!inicializado || !mapa || !pines) return

    pines.clearLayers()
    const recuerdosConPunto = recuerdos.filter((r) => r.coordenadas)

    recuerdosConPunto.forEach((recuerdo) => {
      const punto = recuerdo.coordenadas
      if (!punto) return

      const pin = L.marker([punto.lat, punto.lng], { icon: ICONO_CORAZON })
      const etiqueta = document.createElement('span')
      etiqueta.textContent = recuerdo.lugar || recuerdo.titulo
      pin.bindTooltip(etiqueta)
      pin.on('click', () => alElegir(recuerdo.id))
      pin.addTo(pines)
    })

    const activo = recuerdosConPunto.find((r) => r.id === elegidoId)
    if (activo?.coordenadas) {
      mapa.panTo([activo.coordenadas.lat, activo.coordenadas.lng], { animate: true })
    } else if (recuerdosConPunto.length > 1) {
      const puntos = recuerdosConPunto
        .filter((r) => r.coordenadas)
        .map((r) => [r.coordenadas!.lat, r.coordenadas!.lng] as [number, number])
      mapa.fitBounds(puntos, { padding: [30, 30], maxZoom: 14 })
    } else if (recuerdosConPunto[0]?.coordenadas) {
      mapa.setView([recuerdosConPunto[0].coordenadas.lat, recuerdosConPunto[0].coordenadas.lng], 14)
    } else {
      mapa.setView(CENTRO_INICIAL, 12)
    }
  }, [alElegir, elegidoId, inicializado, recuerdos])

  function centrarEnMiUbicacion() {
    if (!navigator.geolocation) {
      setEstadoGps('Este navegador no permite obtener la ubicación.')
      return
    }

    setEstadoGps('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapa = mapaRef.current
        if (!mapa) return
        const punto: [number, number] = [coords.latitude, coords.longitude]
        if (!ubicacionRef.current) {
          ubicacionRef.current = L.circleMarker(punto, {
            radius: 9,
            color: '#ffffff',
            weight: 4,
            fillColor: '#6a9ee8',
            fillOpacity: 1,
          }).addTo(mapa)
        } else {
          ubicacionRef.current.setLatLng(punto)
        }
        mapa.setView(punto, 15, { animate: true })
        setEstadoGps('Ubicación actual encontrada')
      },
      () => setEstadoGps('No se pudo obtener la ubicación. Revisa el permiso del navegador.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="mapa-real-contenedor">
      <div className="mapa-real-acciones">
        <span>{recuerdos.filter((r) => r.coordenadas).length} recuerdos ubicados</span>
        <button className="boton chico claro" onClick={centrarEnMiUbicacion} type="button">
          ◎ Mi ubicación
        </button>
      </div>
      <div ref={contenedorRef} className="mapa-real" aria-label="Mapa interactivo de OpenStreetMap" />
      {estadoGps && <p className="mapa-real-mensaje" role="status">{estadoGps}</p>}
      {recuerdos.every((r) => !r.coordenadas) && (
        <p className="mapa-real-ayuda">Todavía no hay recuerdos ubicados. Al agregar uno, podrás elegir su punto en el mapa.</p>
      )}
      <p className="mapa-real-creditos">© OpenStreetMap contributors</p>
    </div>
  )
}
