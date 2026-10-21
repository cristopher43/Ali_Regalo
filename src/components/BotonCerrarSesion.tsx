import { supabaseConfigurado } from '../data/supabase'
import { useSesionCompartida } from '../data/SesionCompartida'

export default function BotonCerrarSesion() {
  const { salir } = useSesionCompartida()
  if (!supabaseConfigurado) return null
  return <button className="sesion__cerrar" type="button" onClick={() => void salir()}>Salir</button>
}
