import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Esta clave puede usarse en el navegador si protegemos las tablas con políticas RLS.
export const supabase = url && clavePublica ? createClient(url, clavePublica) : null

export const supabaseConfigurado = Boolean(supabase)
