import { Route, Routes } from 'react-router-dom'
import Portada from './sections/Portada'
import Menu from './sections/Menu'
import Pendiente from './sections/Pendiente'
import Carta from './sections/Carta'
import Album from './sections/Album'
import Cancion from './sections/Cancion'
import Razones from './sections/Razones'
import Fechas from './sections/Fechas'
import Sorpresa from './sections/Sorpresa'
import Final from './sections/Final'
import Lya from './sections/Lya'
import AccesoPrivado from './components/AccesoPrivado'

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Portada />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/carta" element={<Carta />} />
      <Route path="/album" element={<Album />} />
      <Route path="/cancion" element={<Cancion />} />
      <Route path="/razones" element={<Razones />} />
      <Route path="/fechas" element={<Fechas />} />
      <Route path="/sorpresa" element={<Sorpresa />} />
      <Route path="/final" element={<Final />} />
      <Route path="/lya" element={<Lya />} />
      <Route path="/:seccion" element={<Pendiente />} />
    </Routes>
  )
}

// App solo decide QUÉ pantalla se muestra según la URL.
export default function App() {
  return <AccesoPrivado><Rutas /></AccesoPrivado>
}
