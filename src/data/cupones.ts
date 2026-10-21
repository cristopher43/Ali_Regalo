export type Cupon = {
  id: number
  titulo: string
  icono: string
  subtitulo: string
  descripcion: string
  categoria: string
}

export type CanjeCupon = {
  cupon_id: number
  canjeado_en: string
}

export const CUPONES: Cupon[] = [
  {
    id: 1,
    titulo: 'Besitos infinitos',
    icono: '💋',
    subtitulo: 'Sin límite para mi guagua',
    descripcion: 'Canjeable por todos los besitos que quiera mi guagua de su brocolito.',
    categoria: 'Afecto',
  },
  {
    id: 2,
    titulo: 'Abrazos apretaditos',
    icono: '🫂',
    subtitulo: 'De esos que curan todo',
    descripcion: 'Un abrazo largo para quedarnos juntitos y olvidarnos un ratito de todo lo demás.',
    categoria: 'Calma',
  },
  {
    id: 3,
    titulo: 'Una cita sorpresa',
    icono: '🌷',
    subtitulo: 'Plan secreto preparado por mí',
    descripcion: 'Tu brocolito prepara un panorama bonito para que tengamos otro recuerdo juntitos.',
    categoria: 'Aventura',
  },
  {
    id: 4,
    titulo: 'Tonteras de tu brocolito',
    icono: '🥦',
    subtitulo: 'Risas aseguradas',
    descripcion: 'Una sesión de bromas, tonteras y risas hasta conseguir esa sonrisa hermosa tuya.',
    categoria: 'Risas',
  },
  {
    id: 5,
    titulo: 'Un antojito para mi guagua',
    icono: '🍓',
    subtitulo: 'Lo que más se te antoje',
    descripcion: 'Un gustito rico elegido para regalonearte y sacarte una sonrisa.',
    categoria: 'Dulce',
  },
  {
    id: 6,
    titulo: 'Mimos sin apuro',
    icono: '🌙',
    subtitulo: 'Cero prisas, solo tú y yo',
    descripcion: 'Un ratito de cariño, abrazos y tranquilidad para disfrutar juntitos.',
    categoria: 'Tranquilidad',
  },
  {
    id: 7,
    titulo: 'Paseíto de los dos',
    icono: '🌼',
    subtitulo: 'Caminar de la mano',
    descripcion: 'Una salida elegida para compartir, conversar y crear otro recuerdo bonito.',
    categoria: 'Salida',
  },
  {
    id: 8,
    titulo: 'Una cartita de amor',
    icono: '💌',
    subtitulo: 'Palabras del corazón',
    descripcion: 'Una cartita escrita por tu brocolito, para decirte todas esas cositas bonitas que a veces cuesta expresar en persona.',
    categoria: 'Detalle',
  },
  {
    id: 9,
    titulo: 'Día de regaloneo real',
    icono: '👑',
    subtitulo: 'La reina de mi vida',
    descripcion: 'Un día para pensar en ti, regalonearte y hacerte sentir lo especial que eres para mí.',
    categoria: 'Especial',
  },
  {
    id: 10,
    titulo: 'Un vale por todo mi amor',
    icono: '❤️',
    subtitulo: 'Eterno y sincero',
    descripcion: 'Un recordatorio de que tienes un brocolito que te quiere muchísimo y que disfruta compartir su vida contigo.',
    categoria: 'Infinito',
  },
]
