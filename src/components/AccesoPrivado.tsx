import { useState, type ReactNode, type FormEvent } from 'react'
import { supabaseConfigurado } from '../data/supabase'
import { useSesionCompartida } from '../data/SesionCompartida'
import Personaje from './Personaje'

export default function AccesoPrivado({ children }: { children: ReactNode }) {
  const { usuario, lista, entrar } = useSesionCompartida()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (!supabaseConfigurado || (lista && usuario)) return children
  if (!lista) return <main className="acceso"><p>Abriendo nuestro espacio…</p></main>

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setCargando(true)
    setError('')
    const mensaje = await entrar(correo.trim(), clave)
    if (mensaje) setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
    setCargando(false)
  }

  return (
    <main className="acceso">
      <section className="acceso__tarjeta">
        <Personaje quien="lya" pose="mimos" ancho={130} />
        <p className="acceso__etiqueta">UN ESPACIO SOLO PARA NOSOTROS</p>
        <h1>Nuestros recuerdos ♥</h1>
        <p>Entra con la cuenta que te preparamos para ver y agregar recuerdos juntos.</p>
        <form onSubmit={enviar}>
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
          {error && <p className="acceso__error" role="alert">{error}</p>}
          <button className="boton" type="submit" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </section>
    </main>
  )
}
