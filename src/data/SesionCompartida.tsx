import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigurado } from './supabase'

type Sesion = {
  usuario: User | null
  lista: boolean
  entrar: (correo: string, clave: string) => Promise<string | null>
  salir: () => Promise<void>
}

const ContextoSesion = createContext<Sesion | null>(null)

export function SesionCompartida({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [lista, setLista] = useState(!supabaseConfigurado)

  useEffect(() => {
    if (!supabase) return
    let activa = true
    void supabase.auth.getSession().then(({ data }) => {
      if (activa) {
        setUsuario(data.session?.user ?? null)
        setLista(true)
      }
    })
    const { data: escucha } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUsuario(sesion?.user ?? null)
      setLista(true)
    })
    return () => {
      activa = false
      escucha.subscription.unsubscribe()
    }
  }, [])

  async function entrar(correo: string, clave: string) {
    if (!supabase) return 'La conexión compartida aún no está configurada.'
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave })
    return error?.message ?? null
  }

  async function salir() {
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <ContextoSesion.Provider value={{ usuario, lista, entrar, salir }}>
      {children}
    </ContextoSesion.Provider>
  )
}

export function useSesionCompartida() {
  const sesion = useContext(ContextoSesion)
  if (!sesion) throw new Error('La sesión compartida debe estar dentro de SesionCompartida.')
  return sesion
}
