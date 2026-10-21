type Props = {
  nombre: string
}

// Muestra el dibujo que representa cada parte del regalo.
export default function IconoSeccion({ nombre }: Props) {
  return <img className="icono-seccion" src={`/iconos/${nombre}.svg`} alt="" aria-hidden="true" />
}
