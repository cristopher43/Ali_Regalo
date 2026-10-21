export type Quien = 'pinguino' | 'ranita' | 'lya'
export type Pose = 'reposo' | 'caminando' | 'comiendo' | 'siesta' | 'jugando' | 'preocupado' | 'mimos' | 'primerplano'

export const NOMBRES: Record<Quien, string> = { pinguino: 'Pingüino', ranita: 'Ranita', lya: 'Lya' }

// La ruta de cada imagen: /personajes/<quien>/<pose>.webp (carpeta public/personajes)
export const imagenDe = (quien: Quien, pose: Pose) => `/personajes/${quien}/${pose}.webp`
