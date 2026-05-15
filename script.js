/* ============================================
   PAVEL ŠPAČEK — v2 LUXURY EDITION
   ============================================ */

// ---- Featured projects — filmhunters.cz posters + YouTube trailers ----
const featured = [
  {
    title: 'Nosferatu',
    year: 2024,
    studio: 'Focus Features',
    director: 'Robert Eggers',
    type: 'Feature',
    trailerId: 'nulvWqYUM8k',
    img: 'https://www.filmhunters.cz/images/projects/nosferatu.jpg',
  },
  {
    title: 'Mission: Impossible — Ghost Protocol',
    year: 2011,
    studio: 'Paramount Pictures',
    director: 'Brad Bird',
    type: 'Feature',
    trailerId: 'HPB7fV7f_f8',
    img: 'https://www.filmhunters.cz/images/projects/mission-impossible.jpg',
  },
  {
    title: 'Das Boot',
    year: 2018,
    studio: 'Sky',
    director: 'Andreas Prochaska',
    type: 'TV / Streaming',
    trailerId: '6FlNemUn78U',
    img: 'https://www.filmhunters.cz/images/projects/das-boot.jpg',
  },
  {
    title: 'Child 44',
    year: 2015,
    studio: 'Lionsgate',
    director: 'Daniel Espinosa',
    type: 'Feature',
    trailerId: 'ENS3ucnMSdY',
    img: 'https://www.filmhunters.cz/images/projects/child-44.jpg',
  },
  {
    title: 'The Rookie',
    year: 2018,
    studio: 'ABC',
    director: 'Alexi Hawley',
    type: 'TV / Streaming',
    trailerId: 'lApwGz6q3pE',
    img: 'https://www.filmhunters.cz/images/projects/the-rookie.jpg',
  },
];

// ---- Full credits list — všechny ověřené produkční práce ----
const A = 'assets/';
const credits = [
  // 2025
  { title: 'FUBAR', year: 2025, studio: 'Netflix', type: 'tv', trailerId: 'vJlfAp7ZCAY', imdb: 'tt13064902', localImg: A+'fubar.jpg', badge: 'S2' },
  { title: 'Štěstíčku naproti', year: 2025, studio: 'Oneplay', type: 'tv', trailerId: 'LoEC0Xc8-S0', imdb: 'tt39300922', localImg: A+'stesticku-naproti.jpg' },
  { title: 'Franz', year: 2025, studio: 'HBO / Bioscop', type: 'feature', trailerId: 'WFPrlEa294Q', imdb: 'tt17070412', localImg: A+'franz.jpg' },
  // 2024
  { title: 'Nosferatu', year: 2024, studio: 'Focus Features', type: 'feature', trailerId: 'r-CKgbGNLgU', imdb: 'tt5040012', localImg: A+'nosferatu.jpg' },
  { title: 'Hrdina', year: 2024, studio: 'Prima · Oneplay', type: 'tv', imdb: 'tt33101555', localImg: A+'hrdina.jpg' },
  { title: 'Zrádci', year: 2024, studio: 'Prima', type: 'tv', trailerId: 'vZv7nVQiF8E', imdb: 'tt33321873', localImg: A+'zradci-prima.jpg' },
  // 2023
  { title: 'Die Saat — Tödliche Macht', year: 2023, studio: 'Sky', type: 'tv', trailerId: 'TAd93upmJIs', imdb: 'tt20220254' },
  { title: 'Hunters', year: 2023, studio: 'Amazon Prime Video', type: 'tv', trailerId: 'yHNZxAuhLDo', imdb: 'tt7456722', localImg: A+'hunters.jpg', badge: 'S2' },
  { title: 'FUBAR', year: 2023, studio: 'Netflix', type: 'tv', trailerId: 'YJKzjhBswR0', imdb: 'tt13064902', localImg: A+'fubar.jpg', badge: 'S1' },
  { title: 'Los Farad', year: 2023, studio: 'Amazon Prime Video', type: 'tv', trailerId: '1Lb333Lmaqs', imdb: 'tt21278506', localImg: A+'los-farad.jpg' },
  { title: 'Bratři', year: 2023, studio: 'Czech Feature', type: 'feature', trailerId: '_ycEQ65wAbY', imdb: 'tt14232442', localImg: A+'bratri.jpg' },
  { title: 'Spolu', year: 2023, studio: 'Czech Feature', type: 'feature', trailerId: 'Hof4Ji9XwpI', imdb: 'tt22037196', localImg: A+'spolu.jpg' },
  // 2022
  { title: 'Das Boot', year: 2022, studio: 'Sky / Bavaria Fiction', type: 'tv', trailerId: '6FlNemUn78U', imdb: 'tt5830254', localImg: A+'das-boot-3.jpg', badge: 'S3' },
  { title: 'Běžná selhání', year: 2022, studio: 'HBO Europe', type: 'feature', trailerId: 'ALo8__vC3X0', imdb: 'tt13844844', localImg: A+'bezna-selhani.jpg' },
  { title: 'Grand Prix', year: 2022, studio: 'Czech Feature', type: 'feature', trailerId: 'NdToBcJhFyg', imdb: 'tt14401508', localImg: A+'grand-prix.jpg' },
  { title: 'Jack Ryan', year: 2022, studio: 'Amazon Prime Video', type: 'tv', trailerId: '1KsyZF590NM', imdb: 'tt5057054', localImg: A+'jack-ryan.jpg', badge: 'S3' },
  { title: 'Vyšehrad: Fylm', year: 2022, studio: 'Czech Feature', type: 'feature', trailerId: '_2URNiAouqE', imdb: 'tt13086670', localImg: A+'vysehrad.jpg' },
  { title: 'Poslední závod', year: 2022, studio: 'Czech Feature', type: 'feature', trailerId: 'qlOO0yljKso', imdb: 'tt13275560', localImg: A+'posledni-zavod.jpg' },
  // 2020
  { title: 'Das Boot', year: 2020, studio: 'Sky / Bavaria Fiction', type: 'tv', trailerId: '6FlNemUn78U', imdb: 'tt5830254', localImg: A+'das-boot-3.jpg', badge: 'S2' },
  // 2019
  { title: 'Zrádci', year: 2019, studio: 'Prima', type: 'tv', imdb: 'tt10720694', localImg: A+'zradci-prima.jpg', badge: 'S1' },
  // 2018
  { title: 'Das Boot', year: 2018, studio: 'Sky / Bavaria Fiction', type: 'tv', trailerId: '6FlNemUn78U', imdb: 'tt5830254', localImg: A+'das-boot-3.jpg', badge: 'S1' },
  { title: 'The Rookie', year: 2018, studio: 'ABC', type: 'tv', trailerId: '_HgC1TN8FVk', imdb: 'tt7587890', localImg: A+'the-rookie.jpg' },
  { title: 'Toman', year: 2018, studio: 'Czech Feature', type: 'feature', trailerId: 'LF6ANdT4Iro', imdb: 'tt6283474', localImg: A+'toman.jpg' },
  { title: 'Čertí brko', year: 2018, studio: 'Czech Feature', type: 'feature', trailerId: 'Zoamf7DPxVw', imdb: 'tt7028140', localImg: A+'certi-brko.jpg' },
  // 2017
  { title: 'Interlude in Prague', year: 2017, studio: 'Stillking Films', type: 'feature', trailerId: 'uQR4nan5neM', imdb: 'tt5540194', localImg: A+'interlude-prague.jpg' },
  { title: 'Jab Harry Met Sejal', year: 2017, studio: 'Dharma Productions', type: 'feature', trailerId: 'Ej2IYqyMzA4', imdb: 'tt5997666', localImg: A+'jab-harry-met-sejal.jpg' },
  // 2016
  { title: 'Polda', year: 2016, studio: 'Prima', type: 'tv', trailerId: 'aFSRE9DG5nE', imdb: 'tt6315016', localImg: A+'polda.jpg' },
  // 2015
  { title: 'Child 44', year: 2015, studio: 'Lionsgate', type: 'feature', trailerId: 'Uia6y9SRsj4', imdb: 'tt1014763', localImg: A+'child-44.jpg' },
  { title: 'Sedmero krkavců', year: 2015, studio: 'Czech Feature', type: 'feature', trailerId: 'QsbFDXz6dk8', imdb: 'tt3037336', localImg: A+'sedmero-krkavcu.jpg' },
  // 2011
  { title: 'Mission: Impossible — Ghost Protocol', year: 2011, studio: 'Paramount Pictures', type: 'feature', trailerId: 'HPB7fV7f_f8', imdb: 'tt1229238', localImg: A+'mission-impossible.jpg' },
  { title: 'Rockstar', year: 2011, studio: 'UTV Motion Pictures', type: 'feature', trailerId: 'bD5FShPZdpw', imdb: 'tt1839596', localImg: A+'rockstar.jpg' },
  // 2006
  { title: 'The Illusionist', year: 2006, studio: 'Yari Film Group', type: 'feature', trailerId: 'zuFGKcOSUfM', imdb: 'tt0443543', localImg: A+'illusionist.jpg' },
  // 2005
  { title: 'Příběhy obyčejného šílenství', year: 2005, studio: 'Czech Feature', type: 'feature', trailerId: 'haR12FFoOOM', imdb: 'tt0408120', localImg: 'https://m.media-amazon.com/images/M/MV5BN2VjNTYxODYtNzJlOS00NjY1LTg4YjItYThmYjM0MjVmYzAyXkEyXkFqcGc@._V1_SX600.jpg' },
  // 2004
  { title: 'Mistři', year: 2004, studio: 'Czech Feature', type: 'feature', imdb: 'tt0403310', localImg: 'https://m.media-amazon.com/images/M/MV5BOGFlMDMzNzItNzhkYy00ZTY1LWJiNGUtNWU5ZjFmNjI5NDQ1XkEyXkFqcGc@._V1_SX600.jpg' },
  // 2003
  { title: 'Želary', year: 2003, studio: 'Barrandov / Czech Film', type: 'feature', trailerId: 'z9MYQlU2V1s', imdb: 'tt0288330', localImg: A+'zelary.jpg' },
];

// ============================================
// 3D TILT EFFECT — shared helper
// ============================================
function addTilt(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================
// FEATURED SHOWREEL
// ============================================
const featuredGrid = document.getElementById('featuredGrid');

featured.forEach((f, i) => {
  const card = document.createElement('article');
  card.className = 'featured__card reveal reveal--up reveal-delay-' + ((i % 6) + 1);
  card.dataset.trailer = f.trailerId;
  card.dataset.title = f.title;
  card.dataset.meta = `${f.studio} · ${f.year} · dir. ${f.director}`;
  card.innerHTML = `
    <img src="${f.img}"
         class="featured__thumb"
         alt="${f.title}"
         onerror="this.src='https://img.youtube.com/vi/${f.trailerId}/maxresdefault.jpg'" />
    <div class="featured__overlay"></div>
    <div class="featured__play" aria-label="Play trailer">
      <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="2,1 2,13 13,7" fill="currentColor"/></svg>
    </div>
    <div class="featured__body">
      <span class="featured__type">${f.type}</span>
      <h3 class="featured__title">${f.title}</h3>
      <div class="featured__meta">
        <span>${f.studio}</span>
        <span>${f.year}</span>
        <span>${f.director}</span>
      </div>
    </div>
  `;
  card.addEventListener('click', () => openModal(f.trailerId, f.title, `${f.studio} · ${f.year} · dir. ${f.director}`));
  featuredGrid.appendChild(card);
});

// Tilt na featured kartách
addTilt('.featured__card');

// ============================================
// CREDITS GRID
// ============================================
const grid = document.getElementById('creditsGrid');

function renderCredits(filter = 'all') {
  grid.innerHTML = '';
  grid.className = 'credits__grid';
  const filtered = filter === 'all' ? credits : credits.filter(c => c.type === filter);

  filtered.forEach((c, i) => {
    const card = document.createElement('article');
    card.className = 'pcard zoom-frame';
    card.style.animationDelay = (i * 0.04) + 's';

    const ytThumb = c.trailerId ? `https://img.youtube.com/vi/${c.trailerId}/maxresdefault.jpg` : '';
    const imgSrc = c.localImg || ytThumb || '';

    const trailerBtn = c.trailerId
      ? `<button class="pcard__play" aria-label="Play trailer">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
         </button>`
      : '';

    const imdbBtn = c.imdb
      ? `<a class="pcard__imdb" href="https://www.imdb.com/title/${c.imdb}/" target="_blank" rel="noopener" onclick="event.stopPropagation()">IMDb ↗</a>`
      : '';

    const badgeHtml = c.badge
      ? `<span class="pcard__badge">${c.badge}</span>`
      : '';

    card.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" alt="${c.title}" loading="lazy" onerror="this.style.display='none'"/>` : ''}
      <div class="pcard__gradient"></div>
      <div class="pcard__top">
        <span class="pcard__num">${String(i + 1).padStart(2, '0')} / ${String(filtered.length).padStart(2, '0')}</span>
        <div class="pcard__btns">${badgeHtml}${trailerBtn}${imdbBtn}</div>
      </div>
      <div class="pcard__body">
        <span class="pcard__type">${c.type === 'tv' ? 'TV · Streaming' : 'Feature Film'}</span>
        <h3 class="pcard__title">${c.title}</h3>
        <div class="pcard__meta">
          <span>${c.studio}</span>
          <span class="pcard__dot">·</span>
          <span>${c.year}</span>
        </div>
      </div>
    `;

    if (c.trailerId) {
      card.querySelector('.pcard__play')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(c.trailerId, c.title, `${c.studio} · ${c.year}`);
      });
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) openModal(c.trailerId, c.title, `${c.studio} · ${c.year}`);
      });
    }

    // 3D tilt + moving spotlight
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const tx = (x - 0.5) * 14;
      const ty = (y - 0.5) * -14;
      card.style.transform = `perspective(900px) rotateY(${tx}deg) rotateX(${ty}deg) scale(1.03)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    grid.appendChild(card);
  });
}

renderCredits();

// ---- Filter buttons ----
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCredits(btn.dataset.filter);
  });
});

// ============================================
// MODAL VIDEO PLAYER
// ============================================
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');
const modalCaption = document.getElementById('modalCaption');

function openModal(videoId, title, meta) {
  modalPlayer.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
      title="${title} — trailer"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen></iframe>
  `;
  modalCaption.innerHTML = `
    <span class="modal__caption-title">${title}</span>
    <span class="modal__caption-meta">${meta}</span>
  `;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  modalPlayer.innerHTML = '';
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

// ---- Play featured reel: cycles through featured trailers ----
let reelIndex = 0;

function playReelAt(index) {
  const f = featured[index % featured.length];
  reelIndex = index % featured.length;
  const meta = `${f.studio} · ${f.year} · dir. ${f.director}`;
  modalCaption.innerHTML = `
    <span class="modal__caption-title">${f.title}</span>
    <div class="modal__caption-controls">
      <button class="modal__reel-btn" id="reelPrev" aria-label="Previous">← Prev</button>
      <span class="modal__caption-meta">${meta}</span>
      <button class="modal__reel-btn" id="reelNext" aria-label="Next">Next →</button>
    </div>
  `;
  modalPlayer.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${f.trailerId}?autoplay=1&rel=0&modestbranding=1"
      title="${f.title} — trailer"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen></iframe>
  `;
  document.getElementById('reelPrev')?.addEventListener('click', () => playReelAt(reelIndex - 1));
  document.getElementById('reelNext')?.addEventListener('click', () => playReelAt(reelIndex + 1));
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('playAll').addEventListener('click', () => playReelAt(0));

// ============================================
// STICKY NAV
// ============================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ============================================
// REVEAL ON SCROLL
// ============================================
let observer;
function observeReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  }
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el => observer.observe(el));
}

// Přidat reveal třídy na statické elementy s direction variantami
document.querySelectorAll('.about__title').forEach(el => {
  el.classList.add('reveal', 'reveal--left');
});

document.querySelectorAll('.about__text p').forEach((el, i) => {
  el.classList.add('reveal', 'reveal--up', 'reveal-delay-' + ((i % 6) + 1));
});

document.querySelectorAll('.stat').forEach((el, i) => {
  el.classList.add('reveal', 'reveal--scale', 'reveal-delay-' + ((i % 6) + 1));
});

document.querySelectorAll('.service').forEach((el, i) => {
  const direction = i % 2 === 0 ? 'reveal--left' : 'reveal--right';
  el.classList.add('reveal', direction, 'reveal-delay-' + ((i % 6) + 1));
});

document.querySelectorAll('.section__title, .section__lede').forEach((el, i) => {
  el.classList.add('reveal', 'reveal--up', 'reveal-delay-' + ((i % 2) + 1));
});

document.querySelectorAll('.contact__title').forEach(el => {
  el.classList.add('reveal', 'reveal--up');
});

document.querySelectorAll('.contact__form').forEach(el => {
  el.classList.add('reveal', 'reveal--left');
});

document.querySelectorAll('.contact__info').forEach(el => {
  el.classList.add('reveal', 'reveal--right');
});

document.querySelectorAll('.avatar').forEach(el => {
  el.classList.add('reveal', 'reveal--scale');
});

observeReveal();

// ============================================
// BURGER MENU — fullscreen overlay
// ============================================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

function openMobileMenu() {
  mobileMenu.classList.add('is-open');
  mobileMenu.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  burger.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  burger.setAttribute('aria-expanded', 'false');
}

burger?.addEventListener('click', () => {
  if (mobileMenu.classList.contains('is-open')) closeMobileMenu();
  else openMobileMenu();
});

document.querySelectorAll('[data-close]').forEach(el =>
  el.addEventListener('click', closeMobileMenu)
);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMobileMenu();
});

// ============================================
// CONTACT FORM — success state
// ============================================
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const success = document.getElementById('formSuccess');
  form.querySelectorAll('input, textarea').forEach(el => el.value = '');
  success.classList.add('visible');
  setTimeout(() => success.classList.remove('visible'), 6000);
});

// ============================================
// FILM STRIP — celluloid scroll
// ============================================
const stripReel = document.getElementById('filmstripReel');
if (stripReel) {
  const stripProjects = [
    { title: 'Nosferatu',               img: FH+'nosferatu.jpg',         fb: 'https://img.youtube.com/vi/nulvWqYUM8k/maxresdefault.jpg' },
    { title: 'Mission: Impossible',     img: FH+'mission-impossible.jpg', fb: 'https://img.youtube.com/vi/HPB7fV7f_f8/maxresdefault.jpg' },
    { title: 'Jack Ryan',               img: FH+'jack-ryan.jpg',          fb: 'https://img.youtube.com/vi/1KsyZF590NM/maxresdefault.jpg' },
    { title: 'Das Boot',                img: FH+'das-boot.jpg',           fb: 'https://img.youtube.com/vi/6FlNemUn78U/maxresdefault.jpg' },
    { title: 'Child 44',                img: FH+'child-44.jpg',           fb: 'https://img.youtube.com/vi/ENS3ucnMSdY/maxresdefault.jpg' },
    { title: 'The Rookie',              img: FH+'the-rookie.jpg',         fb: 'https://img.youtube.com/vi/lApwGz6q3pE/maxresdefault.jpg' },
    { title: 'Fubar',                   img: FH+'fubar.jpg',              fb: '' },
    { title: 'Los Farad',               img: FH+'los-farad.jpg',          fb: '' },
    { title: 'Vyšehrad',                img: FH+'vysehrad.jpg',           fb: '' },
    { title: 'Zelary',                  img: FH+'zelary.jpg',             fb: '' },
  ];
  // Duplicate for seamless infinite loop
  [...stripProjects, ...stripProjects].forEach((p, i) => {
    const frame = document.createElement('div');
    frame.className = 'filmstrip__frame';
    frame.innerHTML = `
      <img src="${p.img}" alt="${p.title}" loading="lazy"
           onerror="${p.fb ? `this.src='${p.fb}'` : `this.closest('.filmstrip__frame').style.display='none'`}" />
      <span class="filmstrip__frame-num">FR·${String((i % stripProjects.length) * 24 + 1).padStart(3,'0')}</span>
    `;
    stripReel.appendChild(frame);
  });
}
