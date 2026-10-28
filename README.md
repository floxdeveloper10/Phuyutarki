# Puyutarki Lodge – sitio web

Sitio en HTML + JavaScript con Tailwind CSS (compilado con Vite), en español, portugués e inglés.

## Estructura

```
index.html        → estructura de la página
src/config.js     → precios, fotos, WhatsApp, redes, horarios  ← lo que más vas a editar
src/i18n.js       → todos los textos en ES / PT / EN
src/main.js       → lógica (reservas, galería, idiomas, carruseles)
src/style.css     → colores y estilos propios
public/favicon.svg
```

## Probar en tu computadora

Necesitas Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que aparece (por ejemplo http://localhost:5173).

## Publicar en Vercel

**Opción A – con GitHub (recomendada, se actualiza sola en cada cambio):**

1. Sube esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`).
2. En vercel.com → *Add New… → Project* → importa el repositorio.
3. Vercel detecta Vite automáticamente (Build: `npm run build`, Output: `dist`). Pulsa *Deploy*.

**Opción B – desde la terminal:**

```bash
npm install -g vercel
vercel          # la primera vez
vercel --prod   # para publicar
```

## Cambios frecuentes

- **Precios / capacidad / fotos de habitaciones:** `ROOMS` en `src/config.js`.
- **Fotos de la galería:** `ZONE_PHOTOS` en `src/config.js` (el texto de cada foto va en `src/i18n.js`, claves `gallery.*`).
- **Horario de check-in/out:** `checkIn` y `checkOut` en `src/config.js`. Si están vacíos no se muestran.
- **Redes sociales:** `social` en `src/config.js`. Si un enlace está vacío, su ícono no aparece.
- **Textos:** `src/i18n.js` (cambiar en los tres idiomas).

## Enlace directo por idioma

Para compartir con turistas brasileños: `https://tu-dominio/?lang=pt` (también `?lang=en` o `?lang=es`).
Si no se indica, la web usa el idioma del celular del visitante.

## Pendientes

- Reemplazar las imágenes de terceros (marcadas con `TODO`) por fotos propias.
- Agregar una tercera foto a la Habitación Simple.
- Completar horarios de check-in/out y enlaces de Facebook / Instagram.
- Hacer revisar los textos en portugués e inglés por un hablante nativo.
