//Script.js - comportamiento de filtros, expandibles, trivias, feedback + confetti

//Utilidades fechas
function parseDateFrom(el) {
  const raw = el.dataset.date || "";
  // intentar YYYY-MM-DD o YYYY
  if (!raw) return 0;
  const d = new Date(raw);
  if (!isNaN(d)) return d.getTime();
  // fallback: intentar extraer primer año de un string tipo "2007–2012"
  const m = raw.match(/(19|20)\d{2}/);
  return m ? new Date(m[0] + "-01-01").getTime() : 0;
}

//Ordenar y relayout
function relayout() {
  const container = document.querySelector('.timeline');
  const items = Array.from(container.querySelectorAll('.t-item')).filter(i => !i.classList.contains('hidden'));
  items.sort((a, b) => parseDateFrom(a) - parseDateFrom(b));
  items.forEach((el, idx) => {
    el.classList.remove('left', 'right');
    el.classList.add(idx % 2 === 0 ? 'left' : 'right');
    container.appendChild(el);
  });
}

//Expandibles 
document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.target.closest('.card');
    const expanded = card.classList.toggle('expanded');
    e.target.setAttribute('aria-expanded', expanded);
    // si expandiste, forzar que el expand tenga scroll si mucho contenido
    if (expanded) {
      const expandEl = card.querySelector('.expand');
      if (expandEl) expandEl.scrollTop = 0;
    }
  });
});

//Trivia 
document.querySelectorAll('.quiz').forEach(q => {
  const answer = q.dataset.answer;
  q.querySelectorAll('.q').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.opt === answer;
      const result = q.querySelector('.q-result');
      result.textContent = ok ? '✅ ¡Correcto!' : '❌ Incorrecto';
      // pequeño highlight
      btn.style.outline = ok ? '2px solid rgba(34,197,94,.25)' : '2px solid rgba(239,68,68,.25)';
      setTimeout(() => btn.style.outline = '', 1400);
    });
  });
});

//FAB mostrar tras scroll
const fab = document.getElementById('fab');
window.addEventListener('scroll', () => {
  const show = window.scrollY > 260;
  fab.classList.toggle('visible', show);
});

//Modal filtros
const modal = document.getElementById('modal');
const openModal = () => modal.classList.add('open');
const closeModal = () => modal.classList.remove('open');
fab.addEventListener('click', openModal);
document.getElementById('close').addEventListener('click', closeModal);

//Aplicar filtros: Muestra si data-color está en el conjunto (OR lógico)
function applyFilters(selectedSet) {
  const items = document.querySelectorAll('.t-item');
  //Si no hay selección -> mostrar todo
  if (!selectedSet || selectedSet.size === 0) {
    items.forEach(i => i.classList.remove('hidden'));
    relayout();
    return;
  }
  items.forEach(i => {
    const color = (i.dataset.color || '').toLowerCase();
    if (selectedSet.has(color)) i.classList.remove('hidden');
    else i.classList.add('hidden');
  });
  relayout();
}

//Recoger checks y aplicar
document.getElementById('apply').addEventListener('click', () => {
  const picks = Array.from(modal.querySelectorAll('input[type="checkbox"]'))
    .filter(c => c.checked)
    .map(c => c.value);
  //Si todos seleccionados => tratar como "todos" (mostrar todo)
  const allChecks = Array.from(modal.querySelectorAll('input[type="checkbox"]')).map(c => c.value);
  const allSelected = allChecks.every(v => picks.includes(v));
  const selectedSet = (picks.length === 0 || allSelected) ? new Set() : new Set(picks);
  applyFilters(selectedSet);
  closeModal();
});

// "Todos" button
document.getElementById('all').addEventListener('click', () => {
  modal.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  applyFilters(new Set());
  closeModal();
});

//Feedback (like/estrellas/comentario)
const likeBtns = document.querySelectorAll('.like button');
const stars = Array.from(document.querySelectorAll('.star'));
let like = null, rating = 0;

//Like
likeBtns.forEach(b => b.addEventListener('click', () => {
  like = b.dataset.like;
  likeBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
}));

//Stars
stars.forEach(s => s.addEventListener('click', () => {
  rating = Number(s.dataset.star);
  stars.forEach((x, i) => x.textContent = (i < rating) ? '★' : '☆');
}));

//Confetti: emojis
function fireConfetti(options = {}) {
  //Opciones
  const root = document.getElementById('confetti-root');
  const emojis = options.emojis || ['🤖','🎵','🧠','🎧','🔊'];
  const count = options.count || 36;
  const life = options.duration || 1800; // ms
  const created = [];

  for (let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'confetti-emoji';
    el.style.position = 'absolute';
    el.style.left = (50 + (Math.random()*120 - 60)) + '%';
    el.style.top = Math.random()*30 + '%';
    el.style.fontSize = (12 + Math.random()*22) + 'px';
    el.style.opacity = 0.95;
    el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
    el.style.willChange = 'transform,opacity';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    root.appendChild(el);
    created.push(el);

    //Animación simple
    const dx = (Math.random()*160 - 80);
    const dy = (200 + Math.random()*240);
    const rot = (Math.random()*720 - 360);
    el.animate([
      { transform: `translate(0px, 0px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0.05 }
    ], {
      duration: life + Math.random()*400,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      iterations: 1
    });
  }

  //Limpiar luego de un tiempo
  setTimeout(()=> {
    created.forEach(el => el.remove());
  }, life + 500);
}

//Enviar feedback
document.getElementById('fb-send').addEventListener('click', () => {
  const text = document.getElementById('fb-text').value.trim();
  const payload = { like, rating, text, ts: Date.now() };
  try {
    localStorage.setItem('ia-voz-feedback', JSON.stringify(payload));
  } catch(e) {
    console.warn('No se pudo guardar en localStorage', e);
  }

  //Ocultar form y mostrar mensaje de gracias
  const form = document.getElementById('fb-form');
  form.classList.add('hidden');

  const msg = document.getElementById('fb-msg');
  msg.textContent = '¡Gracias! Tu aporte quedó guardado localmente.';
  //Efecto confetti con emojis temáticos
  fireConfetti({ emojis: ['🤖','🎵','🧠','🎧','🔊'], count: 36, duration: 1800 });

  //Dejar el mensaje visible y no mostrar más el textarea ni botones (Arreglado creo)
});

//Limpiar
document.getElementById('fb-clear').addEventListener('click', () => {
  document.getElementById('fb-text').value = '';
  like = null; rating = 0;
  likeBtns.forEach(x => x.classList.remove('active'));
  stars.forEach(x => x.textContent = '☆');
  localStorage.removeItem('ia-voz-feedback');
  document.getElementById('fb-msg').textContent = '';
});

//Inicial: ordenar por fecha y quitar hidden por si acaso ----
relayout();

// Para debuguear! Descomentar la siguiente línea:
// console.log('Timeline items:', document.querySelectorAll('.t-item').length);

