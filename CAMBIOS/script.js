// --- SCRIPT: filtros, expandibles, trivias, feedback, media preview ---

function parseDateFrom(el) {
  const raw = el.dataset.date || "";
  if (!raw) return 0;
  const d = new Date(raw);
  if (!isNaN(d)) return d.getTime();
  const m = raw.match(/(19|20)\d{2}/);
  return m ? new Date(m[0] + "-01-01").getTime() : 0;
}

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

// Expandibles
document.addEventListener('click', (e) => {
  if (e.target.matches('.toggle')) {
    const card = e.target.closest('.card');
    const expanded = card.classList.toggle('expanded');
    e.target.setAttribute('aria-expanded', expanded);
    if (expanded) {
      const expandEl = card.querySelector('.expand');
      if (expandEl) expandEl.scrollTop = 0;
    }
  }
});

// Trivia buttons (works both for timeline-embedded quizzes and trivias section)
document.addEventListener('click', (e) => {
  if (e.target.matches('.quiz .q')) {
    const q = e.target.closest('.quiz');
    const answer = q.dataset.answer;
    const btn = e.target;
    const ok = btn.dataset.opt === answer;
    const result = q.querySelector('.q-result');
    result.textContent = ok ? '✅ ¡Correcto!' : '❌ Incorrecto';
    btn.style.outline = ok ? '2px solid rgba(34,197,94,.25)' : '2px solid rgba(239,68,68,.25)';
    setTimeout(() => btn.style.outline = '', 1400);
  }
});

// Media upload preview
function handleMediaInput(input){
  const container=input.closest('.card').querySelector('.media-player');
  container.innerHTML='';
  const file=input.files[0];
  if(!file) return;
  const url=URL.createObjectURL(file);
  if(file.type.startsWith('audio/')){
    const audio=document.createElement('audio');
    audio.controls=true; audio.src=url; container.appendChild(audio);
  }else if(file.type.startsWith('video/')){
    const video=document.createElement('video');
    video.controls=true; video.src=url; video.width="100%"; container.appendChild(video);
  }else if(file.type.startsWith('image/')){
    const img=document.createElement('img');
    img.src=url; img.style.maxWidth="100%"; container.appendChild(img);
  }
}

document.addEventListener('change', (e) => {
  if (e.target.matches('.media-input')) handleMediaInput(e.target);
});

// FAB mostrar tras scroll
const fab = document.getElementById('fab');
window.addEventListener('scroll', () => {
  const show = window.scrollY > 260;
  fab.classList.toggle('visible', show);
});

// Modal filtros
const modal = document.getElementById('modal');
const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
fab.addEventListener('click', openModal);
document.getElementById('close').addEventListener('click', closeModal);

// Apply filters logic
function applyFilters(selectedSet) {
  const items = document.querySelectorAll('.t-item');
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

document.getElementById('apply').addEventListener('click', () => {
  const picks = Array.from(modal.querySelectorAll('input[type="checkbox"]'))
    .filter(c => c.checked)
    .map(c => c.value);
  const allChecks = Array.from(modal.querySelectorAll('input[type="checkbox"]')).map(c => c.value);
  const allSelected = allChecks.every(v => picks.includes(v));
  const selectedSet = (picks.length === 0 || allSelected) ? new Set() : new Set(picks);
  applyFilters(selectedSet);
  closeModal();
});

document.getElementById('all').addEventListener('click', () => {
  modal.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  applyFilters(new Set());
  closeModal();
});

// TOP pills behavior (same filtering)
const pills=document.querySelectorAll('.pill-filter');
function applyFilters(selected){
  const items=document.querySelectorAll('.t-item');
  if(!selected.size){items.forEach(i=>i.classList.remove('hidden'));relayout();return;}
  items.forEach(i=>{
    const c=(i.dataset.color||'').toLowerCase();
    i.classList.toggle('hidden',!selected.has(c));
  });
  relayout();
}
let selected=new Set();
pills.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const val=btn.dataset.filter;
    if(val==='all'){selected.clear();pills.forEach(b=>b.classList.remove('active'));applyFilters(selected);return;}
    if(selected.has(val)){selected.delete(val);btn.classList.remove('active');}
    else{selected.add(val);btn.classList.add('active');}
    applyFilters(selected);
  });
});

// Feedback (like/estrellas/comentario)
const likeBtns = document.querySelectorAll('.like button');
const stars = Array.from(document.querySelectorAll('.star'));
let like = null, rating = 0, sent = false;

likeBtns.forEach(b => b.addEventListener('click', () => {
  if (sent) return; // no cambiar si ya enviado
  like = b.dataset.like;
  likeBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
}));

stars.forEach(s => s.addEventListener('click', () => {
  if (sent) return;
  rating = Number(s.dataset.star);
  stars.forEach((x, i) => x.textContent = (i < rating) ? '★' : '☆');
}));

function fireConfetti(options = {}) {
  const root = document.getElementById('confetti-root');
  const emojis = options.emojis || ['🤖','🎵','🧠','🎧','🔊'];
  const count = options.count || 36;
  const life = options.duration || 1800;
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

  setTimeout(()=> {
    created.forEach(el => el.remove());
  }, life + 500);
}

// Enviar feedback: guardar y bloquear cambios posteriores
document.getElementById('fb-send').addEventListener('click', () => {
  if (sent) return;
  const text = document.getElementById('fb-text').value.trim();
  const payload = { like, rating, text, ts: Date.now() };
  try {
    localStorage.setItem('ia-voz-feedback', JSON.stringify(payload));
  } catch(e) {
    console.warn('No se pudo guardar en localStorage', e);
  }

  // Ocultar form y mostrar mensaje de gracias
  const form = document.getElementById('fb-form');
  form.classList.add('hidden');

  const msg = document.getElementById('fb-msg');
  msg.textContent = '¡Gracias! Tu aporte quedó guardado localmente.';
  fireConfetti({ emojis: ['🤖','🎵','🧠','🎧','🔊'], count: 36, duration: 1800 });

  // bloquear interacciones posteriores
  sent = true;
  likeBtns.forEach(b => b.disabled = true);
  stars.forEach(s => { s.classList.add('locked'); s.style.pointerEvents = 'none'; });
});

// Limpiar (solo si no enviado)
document.getElementById('fb-clear').addEventListener('click', () => {
  if (sent) return; // no limpiar si ya enviado
  document.getElementById('fb-text').value = '';
  like = null; rating = 0;
  likeBtns.forEach(x => x.classList.remove('active'));
  stars.forEach(x => x.textContent = '☆');
  localStorage.removeItem('ia-voz-feedback');
  document.getElementById('fb-msg').textContent = '';
});

// Inicial: ordenar por fecha
relayout();
