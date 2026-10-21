export type Coordenadas = {
  lat: number
  lng: number
}

export type Identificador = number | string

export type Recuerdo = {
  id: Identificador
  foto: string
  fecha: string
  titulo: string
  texto: string
  lugar: string
  // En la nube guardamos la ruta privada de la foto, además de su vista temporal.
  fotoPath?: string
  // Es opcional para que los recuerdos guardados antes sigan funcionando.
  coordenadas?: Coordenadas
}
