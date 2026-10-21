import { NOMBRES, imagenDe } from '../data/personajes'
import type { Pose, Quien } from '../data/personajes'

type Props = {
  quien: Quien
  pose?: Pose
  ancho?: number
  animado?: boolean // vaivén suave
  decorativo?: boolean // si solo adorna, los lectores de pantalla lo ignoran
  className?: string
}

// Un solo componente para mostrar a cualquier personaje en cualquier pose.
// Lo usaremos en la portada, el menú, la decoración y el Tamagotchi de Lya.
export default function Personaje({ quien, pose = 'reposo', ancho = 150, animado = false, decorativo = false, className = '' }: Props) {
  return (
    <img
      src={imagenDe(quien, pose)}
      alt={decorativo ? '' : NOMBRES[quien]}
      aria-hidden={decorativo || undefined}
      width={ancho}
      className={`personaje ${animado ? 'animado' : ''} ${className}`}
    />
  )
}
