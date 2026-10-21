# Guía: compartir el regalo entre los dos

La página puede funcionar sin configurar nada, guardando los recuerdos solo en el navegador. Para compartir fotos, recuerdos y fechas entre dos teléfonos, hay que conectarla una vez a Supabase.

## 1. Crear la base compartida

1. Crea una cuenta gratuita en [Supabase](https://supabase.com/) y un proyecto nuevo. Elige una contraseña segura para la base y una región cercana a Chile.
2. En el proyecto, abre **Authentication → Users** y crea las dos cuentas, una para cada uno. No agregaremos un botón de registro público en la página.
3. En la lista de usuarios, copia el **User UID** de cada cuenta. Son dos identificadores largos; el primero será el tuyo y el segundo el de Ali.
4. Abre **SQL Editor → New query**. Copia todo el contenido de `supabase/setup.sql`.
5. Antes de ejecutar la consulta, al final del archivo reemplaza los dos textos `REEMPLAZA-ESTE-UUID...` por los User UID que copiaste. Conserva las comillas simples. Ejecuta la consulta una sola vez.

Ese archivo crea las tablas privadas para recuerdos y fechas, permite acceso solo a los dos User UID, prepara el almacenamiento privado de fotos y activa la actualización en vivo.

## 2. Conectar la página

1. En Supabase abre **Project Settings → API** (o la sección **API Keys**).
2. Copia el **Project URL** y la **Publishable key**. La clave publicable está hecha para usarse en el navegador; no uses la `service_role` ni una `secret`.
3. En la carpeta del proyecto, crea una copia de `.env.example` llamada `.env.local`.
4. En `.env.local`, reemplaza los valores de ejemplo:

   ```text
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu_clave
   ```

5. Guarda el archivo y vuelve a iniciar la página. Cuando veas la pantalla de acceso, prueba las dos cuentas.

Si tienen recuerdos anteriores en este navegador, entra a **Álbum** y **Fechas especiales** y usa el botón de copiar al espacio compartido. La copia conserva los datos locales y se puede reintentar sin crear duplicados.

## 3. Publicar gratis

La opción preparada para este proyecto es **Vercel Hobby** para la página y **Supabase Free** para las cuentas, la base y las fotos.

1. Sube la carpeta del proyecto a un repositorio **privado** de GitHub.
2. Entra a [Vercel](https://vercel.com/), importa ese repositorio y conserva los valores de compilación detectados automáticamente por Vite.
3. Antes de publicar, en las variables del proyecto de Vercel agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los mismos valores de Supabase.
4. Publica. Vercel te dará un enlace `*.vercel.app` que ambos pueden abrir desde el teléfono.

Vercel Hobby es gratis para proyectos personales. Supabase Free incluye 500 MB de base y 1 GB para fotos; puede pausar proyectos con poca actividad durante una semana, y se pueden reactivar desde el panel.

## Qué queda compartido

- Fotos, texto, fecha, lugar y ubicación de cada recuerdo.
- Fechas especiales.
- Al crear, editar o borrar desde un teléfono, el otro verá el cambio sin tener que volver a agregarlo.
- Cada persona entra con su propia cuenta. La página no permite registrarse públicamente.

La carta, canción y decoración son parte del sitio y se ven para cualquiera que tenga el enlace; los recuerdos, fechas y fotos que ustedes agreguen quedan detrás del acceso de las dos cuentas.
