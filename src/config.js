/* =========================================================
   CONFIGURACIÓN DEL LODGE
   Aquí se editan precios, fotos, contacto y redes.
   Los textos de cada idioma están en src/i18n.js
   ========================================================= */

export const CONFIG = {
  name: 'Puyutarki Lodge',
  whatsapp: '51929272103',          // sin "+" ni espacios
  phoneDisplay: '+51 929 272 103',
  email: 'ccusjosealex@gmail.com',  // TODO: idealmente un correo del lodge
  address: 'Km 145 Carretera Interoceánica, Marcapata, Cusco',
  mapsQuery: 'Marcapata, Cusco, Perú',

  // Redes: deja '' para ocultar el ícono
  social: {
    tiktok: 'https://www.tiktok.com/@flox_clips',
    facebook: '',
    instagram: '',
  },
  videoUrl: 'https://www.tiktok.com/@flox_clips', // botón "Ver video" del inicio

  // Horarios: si los dejas vacíos, no se muestran en la web
  checkIn: '',   // ej. '14:00'
  checkOut: '',  // ej. '11:00'

  // Tipo de cambio de respaldo (1 USD = X). La web intenta traer el valor
  // actualizado al abrirse; si no puede, usa estos.
  fallbackRates: { PEN: 3.43, BRL: 5.35 },
};

// Precios en dólares (USD) por noche. Nombres y descripciones van en i18n.js
export const ROOMS = [
  {
    id: 'simple',
    price: 30,
    capacity: 1,
    badge: null,
    features: [['user', 'f_1person'], ['wifi', 'f_wifi'], ['coffee', 'f_breakfast']],
    // TODO: agregar una 3.ª foto distinta
    photos: [
      'https://i.postimg.cc/FsGSKHJt/Whats-App-Image-2025-12-12-at-4-10-33-PM.jpg',
      'https://i.postimg.cc/rFqWcrsC/Whats_App_Image_2025_12_12_at_4_07_22_PM_(1).jpg',
    ],
  },
  {
    id: 'matrimonial',
    price: 60,
    capacity: 2,
    badge: 'premium',
    features: [['heart', 'f_couples'], ['shower-head', 'f_bath'], ['flame', 'f_heating']],
    photos: [
      'https://i.postimg.cc/jS57nYzV/Whats-App-Image-2025-12-12-at-4-10-34-PM.jpg',
      'https://i.postimg.cc/pXkjdL5c/Whats_App_Image_2025_12_12_at_4_10_33_PM_(1).jpg',
      'https://i.postimg.cc/13tqV1ph/Whats_App_Image_2025_12_12_at_4_10_35_PM.jpg',
    ],
  },
  {
    id: 'doble',
    price: 50,
    capacity: 2,
    badge: 'popular',
    features: [['users', 'f_2beds'], ['shower-head', 'f_bath'], ['mountain', 'f_view']],
    photos: [
      'https://i.postimg.cc/RVGt0ZnB/Whats-App-Image-2025-12-12-at-4-10-34-PM-(1).jpg',
      'https://i.postimg.cc/c4T3JLtf/Whats_App_Image_2025_12_12_at_4_07_22_PM.jpg',
      'https://i.postimg.cc/CLJ8KxnG/Whats_App_Image_2025_12_12_at_4_07_22_PM_(2).jpg',
    ],
  },
];

// Fotos de la zona. "alt" es la clave del texto en i18n.js (gallery.*)
export const ZONE_PHOTOS = [
  { src: 'https://i.postimg.cc/66V0KwWV/20250720_134615.jpg', alt: 'thermal', cat: 'termales' },
  { src: 'https://i.postimg.cc/1R0HSPmf/20250728_153530.jpg', alt: 'landscape', cat: 'marcapata' },
  // TODO: las dos siguientes son de terceros (La República / Yale). Reemplazar por fotos propias.
  { src: 'https://imgmedia.larepublica.pe/640x377/larepublica/original/2021/12/30/61cd8d8332f6022f1643fd6f.webp', alt: 'town', cat: 'marcapata' },
  { src: 'https://mavcor.yale.edu/sites/default/files/_con7721_small_1.jpg', alt: 'church', cat: 'marcapata' },
  { src: 'https://i.postimg.cc/q7rXt5ML/20250807_081303.jpg', alt: 'glacier1', cat: 'glaciares' },
  { src: 'https://i.postimg.cc/2j9wHG2W/20250807_082027.jpg', alt: 'glacier2', cat: 'glaciares' },
  { src: 'https://i.postimg.cc/Y0v1Kcb6/20250807_082141.jpg', alt: 'glacier3', cat: 'glaciares' },
  { src: 'https://i.postimg.cc/bJ8Chvtf/20250807_081229.jpg', alt: 'glacier4', cat: 'glaciares' },
  { src: 'https://i.postimg.cc/R0wsytqL/20250807_081224.jpg', alt: 'glacier5', cat: 'glaciares' },
];

export const CATEGORIES = ['todas', 'habitaciones', 'termales', 'marcapata', 'glaciares'];

// Intereses que el huésped puede marcar en el formulario (se envían en el mensaje)
export const EXTRAS = ['trekking', 'thermal', 'transfer', 'dinner'];
