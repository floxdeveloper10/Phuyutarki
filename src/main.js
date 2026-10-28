import './style.css';
import {
  createIcons, MountainSnow, Menu, X, ArrowRight, CirclePlay, ChevronDown, ChevronLeft, ChevronRight,
  User, Users, Wifi, Coffee, Heart, ShowerHead, Flame, Mountain, ThermometerSnowflake, MapPin, Star,
  Phone, Mail, CalendarCheck, Receipt, Images, MessageCircle, Navigation, CircleHelp, Plus, Check,
} from 'lucide';
import { CONFIG, ROOMS, ZONE_PHOTOS, CATEGORIES, EXTRAS } from './config.js';
import { T, LANGS, LOCALES, LOCAL_CURRENCY } from './i18n.js';

/* =========================================================
   UTILIDADES
   ========================================================= */
const ICONS = {
  MountainSnow, Menu, X, ArrowRight, CirclePlay, ChevronDown, ChevronLeft, ChevronRight,
  User, Users, Wifi, Coffee, Heart, ShowerHead, Flame, Mountain, ThermometerSnowflake, MapPin, Star,
  Phone, Mail, CalendarCheck, Receipt, Images, MessageCircle, Navigation, CircleHelp, Plus, Check,
};
const renderIcons = () => createIcons({ icons: ICONS });

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const lockScroll = (on) => { document.body.style.overflow = on ? 'hidden' : ''; };

const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* modo privado */ } },
};

// Fechas en hora local (toISOString usaría UTC y en Perú, de noche, daría "mañana")
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const nightsBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);

/* =========================================================
   IDIOMAS
   ========================================================= */
function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  const saved = storage.get('lang');
  if (LANGS.includes(saved)) return saved;
  for (const l of navigator.languages || [navigator.language || 'es']) {
    const code = l.slice(0, 2).toLowerCase();
    if (LANGS.includes(code)) return code;
  }
  return 'es';
}

let lang = detectLang();
const listeners = [];
const onLangChange = (fn) => listeners.push(fn);

function t(key, vars) {
  let s = T[lang][key] ?? T.es[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

function applyI18n(root = document) {
  $$('[data-i18n]', root).forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-attr]', root).forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
}

function setLang(next) {
  lang = next;
  storage.set('lang', next);
  document.documentElement.lang = next === 'pt' ? 'pt-BR' : next;
  document.title = t('meta.title');
  $('meta[name="description"]').setAttribute('content', t('meta.description'));
  $$('.lang-btn').forEach((b) => {
    const on = b.dataset.lang === next;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  applyI18n();
  listeners.forEach((fn) => fn(next));
}

const money = (amount, currency = 'USD') =>
  new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 0 : 0 }).format(amount);

/* =========================================================
   TIPO DE CAMBIO (referencial)
   ========================================================= */
let rates = { ...CONFIG.fallbackRates };
async function loadRates() {
  const cached = storage.get('rates');
  if (cached) {
    try {
      const { at, data } = JSON.parse(cached);
      if (Date.now() - at < 12 * 3600e3) { rates = data; return; }
    } catch { /* ignorar */ }
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: ctrl.signal });
    clearTimeout(timer);
    const json = await res.json();
    if (json?.rates?.PEN && json?.rates?.BRL) {
      rates = { PEN: json.rates.PEN, BRL: json.rates.BRL };
      storage.set('rates', JSON.stringify({ at: Date.now(), data: rates }));
    }
  } catch { /* se usan los valores de respaldo */ }
}

/* =========================================================
   VISOR DE IMÁGENES
   ========================================================= */
const Lightbox = (() => {
  const lb = $('#lightbox'), img = $('#lb-img'), cap = $('#lb-caption'), counter = $('#lb-counter');
  const prevBtn = $('#lb-prev'), nextBtn = $('#lb-next'), closeBtn = $('#lb-close');
  let items = [], idx = 0, lastFocus = null, x0 = null;

  function render() {
    const it = items[idx];
    const label = it.label();
    img.src = it.src; img.alt = label;
    cap.textContent = label;
    const multi = items.length > 1;
    counter.textContent = multi ? `${idx + 1} / ${items.length}` : '';
    prevBtn.classList.toggle('hidden', !multi);
    nextBtn.classList.toggle('hidden', !multi);
    if (multi) [1, -1].forEach((d) => { new Image().src = items[(idx + d + items.length) % items.length].src; });
  }
  const isOpen = () => !lb.classList.contains('hidden');
  function open(list, start = 0) {
    items = list; idx = start; lastFocus = document.activeElement;
    render();
    lb.classList.remove('hidden'); lb.classList.add('flex');
    lockScroll(true); closeBtn.focus();
  }
  function close() {
    lb.classList.add('hidden'); lb.classList.remove('flex');
    img.removeAttribute('src'); lockScroll(false);
    lastFocus?.focus();
  }
  const go = (d) => { idx = (idx + d + items.length) % items.length; render(); };

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    if (items.length > 1 && e.key === 'ArrowLeft') go(-1);
    if (items.length > 1 && e.key === 'ArrowRight') go(1);
  });
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null || items.length < 2) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
  onLangChange(() => { if (isOpen()) render(); });
  return { open };
})();

/* =========================================================
   CARRUSEL (flechas, puntos, swipe y autoplay inteligente)
   ========================================================= */
function setupCarousel(root, items) {
  const track = $('.carousel-track', root);
  const slides = [...track.children];
  const dotsWrap = $('.dots', root);
  const prev = $('.prev-btn', root), next = $('.next-btn', root);
  let i = 0, timer = null, visible = false, hovering = false;
  let x0 = null, y0 = 0, dx = 0, moved = false;

  track.addEventListener('click', () => { if (moved) { moved = false; return; } Lightbox.open(items, i); });

  if (slides.length < 2) { prev.remove(); next.remove(); dotsWrap.remove(); return; }

  dotsWrap.innerHTML = slides.map(() => '<button type="button" class="dot"></button>').join('');
  const dots = [...dotsWrap.children];
  const labelDots = () => dots.forEach((d, k) => d.setAttribute('aria-label', `${t('rooms.goto')} ${k + 1}`));
  labelDots();
  onLangChange(labelDots);

  function go(n, user = false) {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
    if (user) start();
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() {
    stop();
    if (!reduceMotion && visible && !hovering && !document.hidden) timer = setInterval(() => go(i + 1), 4500);
  }

  prev.addEventListener('click', (e) => { e.stopPropagation(); go(i - 1, true); });
  next.addEventListener('click', (e) => { e.stopPropagation(); go(i + 1, true); });
  dots.forEach((d, k) => d.addEventListener('click', (e) => { e.stopPropagation(); go(k, true); }));
  root.addEventListener('mouseenter', () => { hovering = true; stop(); });
  root.addEventListener('mouseleave', () => { hovering = false; start(); });
  document.addEventListener('visibilitychange', start);
  // Solo avanza si está en pantalla (ahorra batería en celular)
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }, { threshold: 0.3 }).observe(root);

  track.addEventListener('touchstart', (e) => {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = 0; moved = false;
    track.classList.add('dragging'); stop();
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (x0 === null) return;
    const cx = e.touches[0].clientX - x0;
    if (Math.abs(cx) > Math.abs(e.touches[0].clientY - y0)) {
      dx = cx;
      track.style.transform = `translateX(calc(-${i * 100}% + ${dx}px))`;
    }
  }, { passive: true });
  track.addEventListener('touchend', () => {
    track.classList.remove('dragging');
    moved = Math.abs(dx) > 10;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), true); else go(i, true);
    x0 = null;
  });

  go(0);
}

/* =========================================================
   HABITACIONES
   ========================================================= */
function renderRooms() {
  const badgeClass = {
    premium: 'bg-puyu-dark/80 border border-ice-accent/40 text-ice-light',
    popular: 'bg-ice-accent text-puyu-dark font-bold',
  };
  const arrow = 'absolute top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white transition-opacity hover:bg-ice-accent hover:text-puyu-dark z-10 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/slider:opacity-100 focus-visible:opacity-100';

  $('#rooms-grid').innerHTML = ROOMS.map((r, n) => `
    <article class="glass-card lift rounded-2xl overflow-hidden group reveal flex flex-col" style="transition-delay:${n * 100}ms">
      <div class="carousel relative h-56 sm:h-64 overflow-hidden group/slider" data-room="${r.id}">
        <div class="carousel-track">
          ${r.photos.map((src, i) => `<img src="${src}" data-i18n-attr="alt:rooms.${r.id}.name" alt="" ${i ? 'loading="lazy"' : ''} decoding="async" draggable="false">`).join('')}
        </div>
        <button type="button" class="prev-btn left-2 ${arrow}" data-i18n-attr="aria-label:rooms.prev" aria-label=""><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
        <button type="button" class="next-btn right-2 ${arrow}" data-i18n-attr="aria-label:rooms.next" aria-label=""><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
        <div class="dots absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"></div>
        ${r.badge ? `<span data-i18n="badge.${r.badge}" class="absolute top-4 right-4 px-3 py-1 rounded text-xs tracking-wider z-10 ${badgeClass[r.badge]}"></span>` : ''}
        <span class="absolute top-4 left-4 bg-black/55 rounded-full px-2.5 py-1 text-xs flex items-center gap-1 z-10 pointer-events-none">
          <i data-lucide="images" class="w-3.5 h-3.5"></i> ${r.photos.length}
        </span>
      </div>
      <div class="p-6 md:p-8 flex flex-col flex-1">
        <h3 data-i18n="rooms.${r.id}.name" class="font-serif text-2xl mb-2 text-white group-hover:text-ice-accent transition-colors"></h3>
        <p data-i18n="rooms.${r.id}.desc" class="text-gray-400 text-sm mb-6 leading-relaxed"></p>
        <div class="flex flex-wrap gap-x-4 gap-y-2 mb-6">
          ${r.features.map(([icon, key]) => `<span class="text-xs flex items-center gap-1.5 text-gray-300"><i data-lucide="${icon}" class="w-3.5 h-3.5 text-ice-accent"></i> <span data-i18n="${key}"></span></span>`).join('')}
        </div>
        <div class="mt-auto flex justify-between items-center gap-3 pt-6 border-t border-white/10">
          <div>
            <span class="text-2xl font-serif text-ice-light">US$${r.price}</span>
            <span data-i18n="rooms.night" class="text-xs text-gray-500"></span>
            <span class="js-local-price block text-xs text-gray-500 mt-0.5" data-usd="${r.price}"></span>
          </div>
          <button type="button" data-book="${r.id}" data-i18n="rooms.book" class="shrink-0 px-5 py-2.5 rounded-full bg-ice-accent text-puyu-dark text-sm font-bold uppercase tracking-wide hover:bg-white transition-colors"></button>
        </div>
      </div>
    </article>`).join('');

  $$('.carousel[data-room]').forEach((el) => {
    const room = ROOMS.find((r) => r.id === el.dataset.room);
    setupCarousel(el, room.photos.map((src, i) => ({ src, label: () => `${t(`rooms.${room.id}.name`)} – ${t('rooms.photo')} ${i + 1}` })));
  });
}

function updateLocalPrices() {
  const cur = LOCAL_CURRENCY[lang];
  $$('.js-local-price').forEach((el) => {
    el.textContent = cur ? `≈ ${money(Number(el.dataset.usd) * rates[cur], cur)}` : '';
  });
}

/* =========================================================
   GALERÍA CON FILTROS
   ========================================================= */
const GALLERY = [
  ...ROOMS.flatMap((r) => r.photos.map((src, i) => ({ src, cat: 'habitaciones', key: `rooms.${r.id}.name`, n: i + 1 }))),
  ...ZONE_PHOTOS.map((p) => ({ src: p.src, cat: p.cat, key: `gallery.${p.alt}` })),
];
const galleryLabel = (g) => (g.n ? `${t(g.key)} – ${t('rooms.photo')} ${g.n}` : t(g.key));

const Gallery = (() => {
  const grid = $('#gallery-grid'), filters = $('#gallery-filters');
  let current = [];

  filters.innerHTML = CATEGORIES.map((c) => {
    const count = c === 'todas' ? GALLERY.length : GALLERY.filter((g) => g.cat === c).length;
    return `<button type="button" role="tab" data-filter="${c}" class="filter-btn shrink-0 px-4 py-2 rounded-full border border-white/20 text-sm whitespace-nowrap hover:border-ice-accent transition-colors"><span data-i18n="cat.${c}"></span> <span class="opacity-60">${count}</span></button>`;
  }).join('');

  function show(cat) {
    current = cat === 'todas' ? GALLERY : GALLERY.filter((g) => g.cat === cat);
    grid.innerHTML = current.map((g, k) => `
      <button type="button" class="gallery-item group relative mb-3 md:mb-4 block w-full overflow-hidden rounded-xl bg-white/5 break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-ice-accent" data-index="${k}">
        <img src="${g.src}" alt="" loading="lazy" decoding="async" class="block w-full h-auto aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105">
        <span class="js-cap pointer-events-none absolute inset-x-0 bottom-0 p-3 text-left text-xs md:text-sm bg-gradient-to-t from-black/75 to-transparent transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"></span>
      </button>`).join('');
    translate();
    $$('.filter-btn', filters).forEach((b) => {
      const on = b.dataset.filter === cat;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
  }
  // Mientras carga, cada foto ocupa un espacio 4:3; luego toma su forma real
  grid.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') e.target.classList.remove('aspect-[4/3]', 'object-cover');
  }, true);

  function translate() {
    $$('.gallery-item', grid).forEach((btn) => {
      const g = current[+btn.dataset.index];
      const label = galleryLabel(g);
      $('img', btn).alt = label;
      $('.js-cap', btn).textContent = label;
      btn.setAttribute('aria-label', `${t('gal.enlarge')}: ${label}`);
    });
  }

  filters.addEventListener('click', (e) => { const b = e.target.closest('.filter-btn'); if (b) show(b.dataset.filter); });
  grid.addEventListener('click', (e) => {
    const it = e.target.closest('.gallery-item');
    if (it) Lightbox.open(current.map((g) => ({ src: g.src, label: () => galleryLabel(g) })), +it.dataset.index);
  });
  $$('[data-goto-filter]').forEach((a) => a.addEventListener('click', () => show(a.dataset.gotoFilter)));
  onLangChange(translate);

  show('todas');
  return { show };
})();

/* =========================================================
   FORMULARIO DE RESERVA → WhatsApp
   ========================================================= */
(function booking() {
  const form = $('#booking-form');
  const fRoom = form.elements.habitacion, fGuests = form.elements.huespedes;
  const fIn = form.elements.llegada, fOut = form.elements.salida;
  const fName = form.elements.nombre, fNotes = form.elements.comentarios;
  const errBox = $('#form-error');
  const today = toISO(new Date());
  const getRoom = () => ROOMS.find((r) => r.id === fRoom.value) || ROOMS[0];
  let lastError = null;

  $('#extras').innerHTML = EXTRAS.map((x) => `
    <label class="chip relative"><input type="checkbox" name="extras" value="${x}"><span><i data-lucide="plus" class="w-3.5 h-3.5"></i><span data-i18n="extras.${x}"></span></span></label>`).join('');

  fIn.min = today;
  fOut.min = addDays(today, 1);

  function fillRooms() {
    const keep = fRoom.value;
    fRoom.innerHTML = ROOMS.map((r) => `<option value="${r.id}">${t(`rooms.${r.id}.name`)} — US$${r.price}</option>`).join('');
    if (keep) fRoom.value = keep;
  }
  // roomChanged: al cambiar de habitación se propone su capacidad completa
  function fillGuests(roomChanged = false) {
    const r = getRoom(), prev = +fGuests.value || r.capacity;
    fGuests.innerHTML = Array.from({ length: r.capacity }, (_, k) =>
      `<option value="${k + 1}">${k + 1} ${t(k ? 'unit.persons' : 'unit.person')}</option>`).join('');
    fGuests.value = String(roomChanged ? r.capacity : Math.min(prev, r.capacity));
  }
  const nights = () => (fIn.value && fOut.value ? nightsBetween(fIn.value, fOut.value) : 0);
  const fmtShort = () => new Intl.DateTimeFormat(LOCALES[lang], { day: 'numeric', month: 'short' });
  const fmtLong = () => new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  function updateSummary() {
    const r = getRoom(), n = nights();
    const cur = LOCAL_CURRENCY[lang];
    $('#s-room').textContent = t(`rooms.${r.id}.name`);
    $('#s-price').textContent = `US$${r.price}`;
    $('#s-guests').textContent = fGuests.options[fGuests.selectedIndex]?.text || '—';
    $('#s-dates').textContent = n > 0 ? `${fmtShort().format(parseISO(fIn.value))} → ${fmtShort().format(parseISO(fOut.value))}` : t('book.pickDates');
    $('#s-nights').textContent = n > 0 ? `${n} ${t(n === 1 ? 'unit.night' : 'unit.nights')}` : '—';
    $('#s-total').textContent = n > 0 ? `US$${n * r.price}` : '—';
    const local = $('#s-local');
    const showLocal = n > 0 && cur;
    local.classList.toggle('hidden', !showLocal);
    local.textContent = showLocal ? `≈ ${money(n * r.price * rates[cur], cur)}` : '';
    $('#s-local-note').classList.toggle('hidden', !showLocal);
  }

  function showError(key, field) {
    lastError = key;
    errBox.textContent = t(key); errBox.classList.remove('hidden');
    $$('.field', form).forEach((f) => f.classList.remove('invalid'));
    if (field) { field.classList.add('invalid'); field.focus({ preventScroll: true }); }
  }
  function clearError() {
    lastError = null;
    errBox.classList.add('hidden');
    $$('.field', form).forEach((f) => f.classList.remove('invalid'));
  }
  function validate() {
    if (!fIn.value) return ['err.checkin', fIn];
    if (!fOut.value) return ['err.checkout', fOut];
    if (fIn.value < today) return ['err.past', fIn];
    if (nights() < 1) return ['err.order', fOut];
    if (!fName.value.trim()) return ['err.name', fName];
    return null;
  }

  fRoom.addEventListener('change', () => { fillGuests(true); updateSummary(); });
  fGuests.addEventListener('change', updateSummary);
  fIn.addEventListener('change', () => {
    if (fIn.value) {
      fOut.min = addDays(fIn.value, 1);
      if (!fOut.value || fOut.value <= fIn.value) fOut.value = addDays(fIn.value, 1);
    }
    clearError(); updateSummary();
  });
  fOut.addEventListener('change', () => { clearError(); updateSummary(); });
  fName.addEventListener('input', () => { if (lastError) clearError(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { showError(...err); return; }
    const r = getRoom(), n = nights(), cur = LOCAL_CURRENCY[lang];
    const extras = $$('input[name="extras"]:checked', form).map((c) => t(`extras.${c.value}`));
    let total = `US$${n * r.price}`;
    if (cur) total += ` (≈ ${money(n * r.price * rates[cur], cur)})`;
    const lines = [
      t('msg.greeting'),
      `• ${t('msg.room')}: ${t(`rooms.${r.id}.name`)}`,
      `• ${t('msg.checkin')}: ${fmtLong().format(parseISO(fIn.value))}`,
      `• ${t('msg.checkout')}: ${fmtLong().format(parseISO(fOut.value))}`,
      `• ${t('msg.nights')}: ${n}`,
      `• ${t('msg.guests')}: ${fGuests.value}`,
      `• ${t('msg.total')}: ${total}`,
      `• ${t('msg.name')}: ${fName.value.trim()}`,
    ];
    if (extras.length) lines.push(`• ${t('msg.extras')}: ${extras.join(', ')}`);
    if (fNotes.value.trim()) lines.push(`• ${t('msg.notes')}: ${fNotes.value.trim()}`);
    lines.push('', t('msg.question'));
    if (lang !== 'es') lines.push(`(${t('msg.lang')})`);
    const url = waLink(lines.join('\n'));
    const w = window.open(url, '_blank');
    if (!w) location.href = url; // si el navegador bloquea la pestaña nueva
  });

  // Botones "Reservar" de cada habitación: preseleccionan y bajan al formulario
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    fRoom.value = b.dataset.book;
    fillGuests(true); updateSummary();
    $('#reservar').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    form.classList.remove('flash'); void form.offsetWidth; form.classList.add('flash');
  });

  onLangChange(() => {
    fillRooms(); fillGuests(); updateSummary();
    if (lastError) errBox.textContent = t(lastError);
  });
  window.addEventListener('rates-ready', updateSummary);

  fillRooms(); fillGuests();
})();

/* =========================================================
   CÓMO LLEGAR + PREGUNTAS FRECUENTES
   ========================================================= */
function renderFaq() {
  const items = ['book', 'prices', 'pay'];
  if (CONFIG.checkIn && CONFIG.checkOut) items.push('hours');
  items.push('altitude', 'clothes', 'arrive');
  $('#faq').innerHTML = items.map((k, i) => `
    <details class="glass-card rounded-xl group/faq" ${i === 0 ? 'open' : ''}>
      <summary class="flex items-center justify-between gap-4 px-5 py-4 font-semibold">
        <span>${t(`faq.${k}.q`)}</span>
        <i data-lucide="plus" class="faq-icon w-5 h-5 text-ice-accent shrink-0 transition-transform"></i>
      </summary>
      <p class="px-5 pb-5 text-gray-400 text-sm leading-relaxed">${t(`faq.${k}.a`, { in: CONFIG.checkIn, out: CONFIG.checkOut })}</p>
    </details>`).join('');
  renderIcons();
}

/* =========================================================
   CONTACTO, ENLACES Y REDES
   ========================================================= */
function setupLinks() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
  $('#maps-link').href = mapsUrl;
  $('#map-frame').src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapsQuery)}&output=embed`;
  $('#video-link').href = CONFIG.videoUrl;
  $('#phone-link').href = `tel:+${CONFIG.whatsapp}`;
  $('#mail-link').href = `mailto:${CONFIG.email}`;
  $$('.js-phone').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('.js-email').forEach((el) => { el.textContent = CONFIG.email; });
  $$('.js-address').forEach((el) => { el.textContent = CONFIG.address; });
  $('#year').textContent = new Date().getFullYear();

  const updateWa = () => {
    const info = waLink(t('msg.info'));
    $('#wa-float').href = info;
    $('#wa-bar').href = info;
    $('#route-link').href = waLink(t('info.routeMsg'));
  };
  updateWa();
  onLangChange(updateWa);

  const SOCIAL_SVG = {
    tiktok: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    facebook: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    instagram: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  };
  const names = { tiktok: 'TikTok', facebook: 'Facebook', instagram: 'Instagram' };
  $('#social').innerHTML = Object.entries(CONFIG.social)
    .filter(([, url]) => url)
    .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${names[k]}" class="w-10 h-10 rounded-full bg-white/5 hover:bg-ice-accent hover:text-puyu-dark flex items-center justify-center transition-all border border-white/10">${SOCIAL_SVG[k]}</a>`)
    .join('');
}

/* =========================================================
   NAVEGACIÓN, MENÚ MÓVIL Y BARRA INFERIOR
   ========================================================= */
function setupNav() {
  const navbar = $('#navbar');
  const bar = $('#mobile-bar');
  const hero = $('#inicio');
  let inBooking = false;

  const onScroll = () => {
    const s = window.scrollY > 50;
    navbar.classList.toggle('glass', s);
    navbar.classList.toggle('shadow-lg', s);
    navbar.classList.toggle('py-2.5', s);
    navbar.classList.toggle('py-4', !s);
    navbar.classList.toggle('md:py-5', !s);
    const pastHero = window.scrollY > hero.offsetHeight * 0.6;
    bar.classList.toggle('show', pastHero && !inBooking);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  new IntersectionObserver(([en]) => { inBooking = en.isIntersecting; onScroll(); }, { threshold: 0.15 }).observe($('#reservar'));
  onScroll();

  const menu = $('#mobile-menu'), btn = $('#menu-btn');
  const setMenu = (open) => {
    menu.classList.toggle('translate-x-full', !open);
    menu.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    lockScroll(open);
  };
  btn.addEventListener('click', () => setMenu(true));
  $('#close-menu').addEventListener('click', () => setMenu(false));
  $$('.mobile-link').forEach((l) => l.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') setMenu(false); });

  $$('.lang-btn').forEach((b) => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }));
}

function setupReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('active'); obs.unobserve(en.target); } });
  }, { threshold: 0.1 });
  $$('.reveal').forEach((el) => obs.observe(el));
}

// Nieve: menos copos en celular, pausa con la pestaña oculta y respeta "reducir movimiento"
function setupSnow() {
  if (reduceMotion) return;
  const box = $('#snow-container');
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const max = mobile ? 18 : 40;
  setInterval(() => {
    if (document.hidden || box.childElementCount >= max) return;
    const f = document.createElement('div');
    f.className = 'snowflake';
    f.textContent = '•';
    f.style.left = `${Math.random() * 100}vw`;
    f.style.fontSize = `${Math.random() * 10 + 8}px`;
    f.style.opacity = (Math.random() * 0.6 + 0.2).toFixed(2);
    f.style.animationDuration = `${Math.random() * 4 + 4}s`;
    f.addEventListener('animationend', () => f.remove());
    box.appendChild(f);
  }, mobile ? 450 : 220);
}

/* =========================================================
   INICIO
   ========================================================= */
renderRooms();
setupLinks();
setupNav();
onLangChange(() => { renderFaq(); updateLocalPrices(); });
setLang(lang);
renderIcons();
setupReveal();
setupSnow();
loadRates().then(() => { updateLocalPrices(); window.dispatchEvent(new Event('rates-ready')); });
