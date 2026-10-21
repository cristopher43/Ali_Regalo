import type { Pose, Quien } from './personajes'

export type Seccion = { ruta: string; titulo: string; detalle: string; fase: number; quien: Quien; pose: Pose; icono: string }

// Si agregas una sección nueva, solo se añade una línea aquí.
export const SECCIONES: Seccion[] = [
  { ruta: 'carta', titulo: 'Carta', detalle: 'Para leer despacito', fase: 4, quien: 'pinguino', pose: 'mimos', icono: 'carta' },
  { ruta: 'album', titulo: 'Nuestro álbum', detalle: 'Instantes eternos', fase: 5, quien: 'lya', pose: 'primerplano', icono: 'album' },
  { ruta: 'cancion', titulo: 'Nuestra canción', detalle: 'Melodía de los dos', fase: 4, quien: 'pinguino', pose: 'caminando', icono: 'cancion' },
  { ruta: 'razones', titulo: 'Razones', detalle: 'Por qué te amo', fase: 4, quien: 'ranita', pose: 'mimos', icono: 'razones' },
  { ruta: 'fechas', titulo: 'Fechas especiales', detalle: 'Días inolvidables', fase: 4, quien: 'lya', pose: 'reposo', icono: 'fechas' },
  { ruta: 'sorpresa', titulo: 'Sorpresa final', detalle: 'Solo para ti', fase: 4, quien: 'lya', pose: 'jugando', icono: 'sorpresa' },
]
