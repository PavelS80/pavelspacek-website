/* ============================================================
   PAVEL ŠPAČEK — THE LOCATION ARCHIVE · Archive Showreel (V6)
   Rendering only. All data comes from the data.js globals:
   credits, featured, studios, profile, A, still, yt.
   Each block below is self-contained so it can be lifted into
   a single-file build without touching the data layer.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const ytHq = id => still(id) || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const isPoster = src => typeof src === 'string' && src.startsWith(A);
  const imdbTitle = tt => `https://www.imdb.com/title/${encodeURIComponent(tt)}/`;
  const imdbName = `https://www.imdb.com/name/${profile.imdbId}/`;
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byTT = Object.fromEntries(credits.map(c => [c.tt, c]));
  const metaLine = c => `${c.studio} · ${c.role}${c.pending ? ' · IMDb credit pending' : ''}`;

  /* Image with fallback chain */
  function imgTag(src, fallbacks, alt, eager, cls) {
    const chain = fallbacks.filter(Boolean);
    const onerr = chain.length
      ? `onerror="var f=JSON.parse(this.dataset.fb||'[]');if(f.length){this.src=f.shift();this.dataset.fb=JSON.stringify(f);}else{this.onerror=null;}"`
      : '';
    return `<img${cls ? ` class="${cls}"` : ''} src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'loading="eager"' : 'loading="lazy"'} decoding="async" data-fb='${esc(JSON.stringify(chain))}' ${onerr} />`;
  }

  /* ============================================================
     PROFILE-DRIVEN TEXT
     ============================================================ */
  const NOW = new Date().getFullYear();
  ['yearNow', 'yearNow3'].forEach(id => { const el = $(id); if (el) el.textContent = NOW; });
  document.querySelectorAll('[data-p]').forEach(el => {
    const v = profile[el.dataset.p];
    if (v != null) el.textContent = v;
  });
  const imdbCount = credits.filter(c => !c.pending).length;
  document.querySelectorAll('[data-imdb-count]').forEach(el => { el.textContent = imdbCount; });
  $('indexCount').textContent = credits.length;
  $('aboutText').innerHTML = profile.about.map(p => `<p>${esc(p)}</p>`).join('');
  $('heroMail').href = `mailto:${profile.email}`;
  $('heroImdb').href = imdbName;
  $('heroCompany').href = profile.companyUrl;
  $('cEmail').href = `mailto:${profile.email}`;
  $('cEmail').textContent = profile.email;
  $('cPhone').href = `tel:${profile.phone.replace(/\s/g, '')}`;
  $('cPhone').textContent = profile.phone;

  /* ============================================================
     TRAILER MODAL (shared by reel, poster rows and index)
     ============================================================ */
  const modal = $('videoModal');
  const modalPlayer = $('modalPlayer');
  const modalCaption = $('modalCaption');
  const modalCloseBtn = $('modalClose');
  let lastFocused = null;
  let onModalChange = () => {};

  function openModal(videoId, title, meta, opener) {
    if (!videoId) return;
    lastFocused = opener || document.activeElement;
    peek.classList.remove('on');
    modalPlayer.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
              title="${esc(title)} — trailer"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    modalCaption.innerHTML = `<span class="modal__caption-title">${esc(title)}</span><span class="modal__caption-meta">${esc(meta)}</span>`;
    modal.classList.add('is-open');
    modal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    onModalChange(true);
    modalCloseBtn.focus();
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalPlayer.innerHTML = '';
    document.body.style.overflow = '';
    onModalChange(false);
    if (lastFocused && document.contains(lastFocused) && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }
  const openCredit = (c, opener) => c && c.yt && openModal(c.yt, c.t, metaLine(c), opener);

  modalCloseBtn.addEventListener('click', closeModal);
  $('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      const f = [modalCloseBtn, modalPlayer.querySelector('iframe')].filter(Boolean);
      const first = f[0], last = f[f.length - 1];
      if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ============================================================
     HERO REEL — one background player, reused for every title.
     Only titles credited exactly "location manager", so the
     caption "{role} — {title}" is literally true.
     ============================================================ */
  const REEL_TITLES = ['Nosferatu', 'Jack Ryan', 'Child 44', '12 Monkeys', 'FBI: International'];
  const reel = REEL_TITLES
    .map(t => credits.find(c => c.t === t && c.role === 'location manager' && c.yt))
    .filter(Boolean);
  const DUR = 13000;
  // Each trailer starts at the moment its clean still was taken, so still -> video is seamless
  // and the reel skips rating cards and studio logos at the top of the trailers.
  const START = { nulvWqYUM8k: 28, '1KsyZF590NM': 90, Uia6y9SRsj4: 102, AQEN9V8r6TM: 7, Ss717FniM9I: 66 };
  const heroEl = $('hero');
  const stage = $('heroStage');
  const sheetEl = $('contactSheet');
  const captionEl = $('reelCaption');
  const posEl = $('reelPos');
  const pauseBtn = $('reelPause');
  const params = new URLSearchParams(location.search);
  const saveData = navigator.connection && navigator.connection.saveData;
  const headless = /HeadlessChrome/.test(navigator.userAgent) || navigator.webdriver;
  const videoOK = () => window.matchMedia('(min-width: 900px)').matches && !reduced && !saveData && !headless && !params.has('still');

  heroEl.style.setProperty('--dur', `${DUR / 1000}s`);
  if (videoOK()) heroEl.classList.add('has-video');

  // Stills underneath (clean frames from assets/stills via still(), YouTube thumb as fallback)
  stage.innerHTML = reel.map((c, i) => `
    <div class="slide" data-i="${i}">
      ${imgTag(still(c.yt) || yt(c.yt), [ytHq(c.yt), `https://img.youtube.com/vi/${c.yt}/hqdefault.jpg`], '', i === 0, 'slide__img')}
    </div>`).join('');
  const slides = [...stage.children];

  // Contact sheet = the reel controller
  const CIRCLE = '<svg class="sheet__circle" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M20 9 C 40 1, 82 2, 93 20 C 101 35, 84 54, 52 56 C 22 58, 3 47, 5 30 C 6 17, 22 7, 44 5 C 52 4.5, 60 5, 66 6.5"/></svg>';
  sheetEl.innerHTML = '<div class="sheet__strip">' + reel.map((c, i) => `
    <button class="sheet__frame" type="button" data-i="${i}" aria-pressed="false" aria-label="Show ${esc(c.t)} in the reel">
      ${imgTag(still(c.yt) || yt(c.yt), [ytHq(c.yt)], '', true)}
      <span class="sheet__num mono">FR·${pad((i + 1) * 12, 3)}</span>
      <span class="sheet__title mono">${esc(c.t)}</span>
      <span class="sheet__bar" aria-hidden="true"><span></span></span>
      ${CIRCLE}
    </button>`).join('') + '</div><span class="sheet__edgeprint mono" aria-hidden="true">PŠ ARCH 35 · 0042+07</span>';
  const frames = [...sheetEl.querySelectorAll('.sheet__frame')];

  let cur = -1;
  let timer = null, remaining = DUR, startedAt = 0;
  const holds = new Set();                 // reasons the reel is paused: user | modal | hidden | offscreen
  const isHeld = () => holds.size > 0;

  /* ---- single background player ---- */
  const YT_ORIGIN = /^https:\/\/www\.youtube(-nocookie)?\.com$/;
  let player = null, playerReady = false, loadedId = null, awaitingFresh = true, swapT = null, fbT = null, fbUsed = false;

  function srcFor(id) {
    const q = new URLSearchParams({
      autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: id, playsinline: 1, rel: 0, start: START[id] || 0,
      modestbranding: 1, iv_load_policy: 3, disablekb: 1, fs: 0, enablejsapi: 1, origin: location.origin,
    });
    return `https://www.youtube-nocookie.com/embed/${id}?${q}`;
  }
  function post(func, args = []) {
    if (player && player.contentWindow) {
      try { player.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*'); } catch (_) {}
    }
  }
  function handshake() {
    let n = 0;
    const ping = setInterval(() => {
      try { player.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'reel', channel: 'widget' }), '*'); } catch (_) {}
      if (++n > 12 || playerReady) clearInterval(ping);
    }, 400);
  }
  function setSrc(id) {
    playerReady = false;
    awaitingFresh = true;
    player.classList.remove('is-live');
    player.src = srcFor(id);
  }
  function armFallback(i) {
    clearTimeout(fbT);
    if (fbUsed) return;
    // If the API swap does not report "playing" in time, reload the one iframe with the new id.
    fbT = setTimeout(() => {
      if (cur === i && player && !player.classList.contains('is-live') && !isHeld()) { fbUsed = true; setSrc(reel[i].yt); }
    }, 5000);
  }
  function cueVideo(i) {
    if (!videoOK()) return;
    const id = reel[i].yt;
    clearTimeout(swapT);
    if (!player) {
      player = document.createElement('iframe');
      player.className = 'slide__video';
      player.title = 'Background trailer reel';
      player.allow = 'autoplay; encrypted-media';
      player.tabIndex = -1;
      player.setAttribute('aria-hidden', 'true');
      player.addEventListener('load', handshake);
      stage.appendChild(player);
      loadedId = id;
      setSrc(id);
      armFallback(i);
      return;
    }
    if (loadedId === id && player.classList.contains('is-live')) return;
    awaitingFresh = true;
    player.classList.remove('is-live');      // video fades out to the incoming still
    swapT = setTimeout(() => {
      loadedId = id;
      if (playerReady) { post('loadVideoById', [{ videoId: id, startSeconds: START[id] || 0 }]); post('mute'); }
      else setSrc(id);
      armFallback(i);
    }, 700);
  }

  window.addEventListener('message', e => {
    if (!player || e.source !== player.contentWindow || !YT_ORIGIN.test(e.origin)) return;
    let d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (_) { return; }
    if (!d) return;
    if (d.event === 'onReady' || d.event === 'initialDelivery' || d.event === 'infoDelivery') playerReady = true;
    if (d.event === 'onError') { player.classList.remove('is-live'); return; }
    const info = d.info || {};
    const vid = info.videoData && info.videoData.video_id;
    if (vid && vid !== loadedId) return;
    const state = d.event === 'onStateChange' ? d.info : info.playerState;
    if (state == null) return;
    if (state !== 1) awaitingFresh = false;
    if (state === 1 && !awaitingFresh && !isHeld()) { player.classList.add('is-live'); clearTimeout(fbT); fbUsed = false; }
    if (state === 1 && isHeld()) post('pauseVideo');
    if (state === 0 && !isHeld()) go(cur + 1);
  });

  /* ---- timeline ---- */
  function schedule() {
    clearTimeout(timer);
    if (isHeld() || reduced) return;
    startedAt = performance.now();
    timer = setTimeout(() => go(cur + 1), remaining);
  }
  function halt() {
    clearTimeout(timer);
    if (startedAt) { remaining = Math.max(400, remaining - (performance.now() - startedAt)); startedAt = 0; }
  }
  function go(i) {
    cur = (i + reel.length) % reel.length;
    const c = reel[cur];
    slides.forEach((s, k) => s.classList.toggle('is-active', k === cur));
    frames.forEach((f, k) => {
      const on = k === cur;
      f.classList.toggle('is-active', on);
      f.classList.toggle('is-done', k < cur);
      f.setAttribute('aria-pressed', String(on));
      if (on) f.setAttribute('aria-current', 'true'); else f.removeAttribute('aria-current');
      const bar = f.querySelector('.sheet__bar span');
      bar.replaceWith(bar.cloneNode());   // restart the progress fill
    });
    // keep the active frame in view when the strip scrolls (narrow screens)
    const strip = sheetEl.firstElementChild, fr = frames[cur];
    if (strip.scrollWidth > strip.clientWidth + 2) {
      strip.scrollTo({ left: fr.offsetLeft - (strip.clientWidth - fr.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    }
    captionEl.innerHTML = `<span class="cap">${esc(c.role)}</span> — <b>${esc(c.t)}</b>`;
    posEl.textContent = `${pad(cur + 1)} / ${pad(reel.length)}`;
    remaining = DUR; startedAt = 0;
    cueVideo(cur);
    schedule();
  }
  function hold(reason) {
    const was = isHeld();
    holds.add(reason);
    if (!was) { halt(); heroEl.classList.add('is-paused'); post('pauseVideo'); }
  }
  function release(reason) {
    if (!holds.delete(reason) || isHeld()) return;
    heroEl.classList.remove('is-paused');
    post('playVideo');
    schedule();
  }
  function setUserPause(on) {
    on ? hold('user') : release('user');
    pauseBtn.setAttribute('aria-pressed', String(on));
    pauseBtn.textContent = on ? 'PLAY REEL' : 'PAUSE REEL';
  }

  sheetEl.addEventListener('click', e => {
    const f = e.target.closest('.sheet__frame');
    if (!f) return;
    if (holds.has('user')) setUserPause(false);
    go(Number(f.dataset.i));
  });
  sheetEl.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const k = frames.indexOf(document.activeElement);
    if (k < 0) return;
    e.preventDefault();
    frames[(k + (e.key === 'ArrowRight' ? 1 : -1) + frames.length) % frames.length].focus();
  });
  $('reelSound').addEventListener('click', e => openCredit(reel[cur], e.currentTarget));
  pauseBtn.addEventListener('click', () => setUserPause(!holds.has('user')));
  if (reduced) { pauseBtn.hidden = true; }

  onModalChange = open => (open ? hold('modal') : release('modal'));
  document.addEventListener('visibilitychange', () => (document.hidden ? hold('hidden') : release('hidden')));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => (en.isIntersecting ? release('offscreen') : hold('offscreen')), { threshold: 0.12 }).observe(heroEl);
  }
  if (reel.length) go(0);

  /* ============================================================
     STUDIO TICKER
     ============================================================ */
  $('tickerTrack').innerHTML = [...studios, ...studios]
    .map(s => `<span>${esc(s)}</span><span class="tick-dot">●</span>`).join('');

  /* ============================================================
     PRIORITY FILES — three drawers of posters
     ============================================================ */
  const fileNo = c => pad(credits.length - credits.indexOf(c), 3);
  // featured -> matching credit (title + start year) for the exact role, studio and type
  const creditFor = f => credits.find(c => c.t === f.t && c.y === parseInt(f.y, 10));
  const selected = featured.map(f => {
    const c = creditFor(f);
    if (!c) return null;
    return { c, poster: isPoster(f.img) ? f.img : (isPoster(f.fb) ? f.fb : c.img), isNew: !!f.isNew };
  }).filter(Boolean);
  const features = credits.filter(c => c.type === 'feature' || c.type === 'short');
  const series = credits.filter(c => c.type === 'tv');

  function pcard({ c, poster, isNew }, i, tag) {
    const stampEl = isNew ? '<span class="stamp stamp--red pcard__stamp pcard__stamp--new">NEW</span>'
      : c.pending ? '<span class="stamp stamp--red pcard__stamp">CREDIT PENDING</span>' : '';
    const cue = c.yt ? '<span class="pcard__cue">▶ PLAY TRAILER</span>' : '<span class="pcard__cue pcard__cue--imdb">IMDb ↗</span>';
    const inner = `
      <span class="pcard__poster">
        ${imgTag(poster || c.img, c.yt ? [ytHq(c.yt)] : [], '', i < 7)}
        <span class="pcard__tag mono">${tag}</span>
        ${stampEl}
        <span class="pcard__over">
          <span class="pcard__studio mono">${esc(c.studio)}</span>
          <span class="pcard__role mono">${esc(c.role)}</span>
          ${c.pending ? '<span class="pcard__note mono">IMDb credit pending</span>' : ''}
          ${cue}
        </span>
      </span>
      <span class="pcard__title">${esc(c.t)}</span>
      <span class="pcard__sub mono">${esc(c.role)}</span>`;
    const label = `${c.t} — ${c.role}, ${c.studio}${c.pending ? ', IMDb credit pending' : ''}. ${c.yt ? 'Play trailer' : 'Open on IMDb'}`;
    return c.yt
      ? `<li><button class="pcard${isNew ? ' pcard--new' : ''}" type="button" data-tt="${esc(c.tt)}" aria-label="${esc(label)}">${inner}</button></li>`
      : `<li><a class="pcard" href="${imdbTitle(c.tt)}" target="_blank" rel="noopener" aria-label="${esc(label)}">${inner}</a></li>`;
  }

  $('rowSelected').innerHTML = selected.map((x, i) => pcard(x, i, `PRIORITY · ${pad(i + 1)}`)).join('');
  $('rowFeatures').innerHTML = features.map((c, i) => pcard({ c, poster: c.img }, i, `FILE ${fileNo(c)}`)).join('');
  $('rowSeries').innerHTML = series.map((c, i) => pcard({ c, poster: c.img }, i, `FILE ${fileNo(c)}`)).join('');
  $('selCount').textContent = `${selected.length} FILES`;
  $('featCount').textContent = `${features.length} FILES`;
  $('serCount').textContent = `${series.length} FILES`;

  document.querySelectorAll('.drawer').forEach(row => {
    const track = row.querySelector('.drawer__track');
    const [prev, next] = row.querySelectorAll('.drawer__btn');
    const update = () => {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    [prev, next].forEach(b => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    track.addEventListener('click', e => {
      const b = e.target.closest('button[data-tt]');
      if (b) openCredit(byTT[b.dataset.tt], b);
    });
  });

  /* ============================================================
     INDEX OF PRODUCTIONS — search + filter + inline file card
     ============================================================ */
  const tableEl = $('indexTable');
  const statusEl = $('indexStatus');
  const searchEl = $('indexSearch');
  const peek = $('peek');
  const peekImg = $('peekImg');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const typeLabel = c => c.type === 'tv' ? 'TV' : c.type === 'short' ? 'SHORT' : 'FILM';
  const typeLong = c => c.type === 'tv' ? 'TV / streaming series' : c.type === 'short' ? 'Short film' : 'Feature film';
  const state = { filter: 'all', q: '', open: null };

  function fileCard(c, id) {
    return `
      <div class="ifile" id="${id}" role="region" aria-label="${esc(c.t)} — file card">
        <div class="ifile__poster">${c.img ? imgTag(c.img, c.yt ? [ytHq(c.yt)] : [], `${c.t} — poster`, false) : ''}</div>
        <div class="ifile__body">
          <div class="ifile__head mono">
            <span>FILE ${fileNo(c)} · ${typeLabel(c)}</span>
            ${c.pending ? '<span class="stamp stamp--red ifile__stamp">IMDb CREDIT PENDING</span>' : '<span class="stamp stamp--gold ifile__stamp">ON RECORD</span>'}
          </div>
          <h3 class="ifile__title">${esc(c.t)}</h3>
          ${c.o ? `<p class="ifile__orig">${esc(c.o)}</p>` : ''}
          <dl class="ifile__meta mono">
            <div><dt>STUDIO</dt><dd>${esc(c.studio)}</dd></div>
            <div><dt>ROLE</dt><dd class="ifile__role">${esc(c.role)}</dd></div>
            <div><dt>FORMAT</dt><dd>${typeLong(c)}</dd></div>
            ${c.pending ? '<div><dt>NOTE</dt><dd>Title is on IMDb; the credit under this name is not filed yet.</dd></div>' : ''}
          </dl>
          <div class="ifile__actions mono">
            ${c.yt ? '<button class="ibtn ibtn--solid" type="button" data-play>▶ PLAY TRAILER</button>' : '<span class="ibtn ibtn--off">NO TRAILER ON FILE</span>'}
            <a class="ibtn" href="${imdbTitle(c.tt)}" target="_blank" rel="noopener">IMDb ↗</a>
          </div>
        </div>
      </div>`;
  }

  function toggleRow(c, viaKeyboard) {
    state.open = state.open === c ? null : c;
    renderIndex();
    if (viaKeyboard) {
      const row = [...tableEl.querySelectorAll('.irow')].find(r => r.getAttribute('aria-controls') === `ifile-${c.tt}`);
      if (row) row.focus({ preventScroll: true });
    }
  }

  function renderIndex() {
    peek.classList.remove('on');
    const q = norm(state.q.trim());
    const list = credits.filter(c => {
      const okType = state.filter === 'all' || (state.filter === 'tv' ? c.type === 'tv' : c.type !== 'tv');
      if (!okType) return false;
      if (!q) return true;
      return norm([c.t, c.o, c.studio, c.role].join(' ')).includes(q);
    });
    if (state.open && !list.includes(state.open)) state.open = null;

    statusEl.textContent = `SHOWING ${list.length} OF ${credits.length}`;
    tableEl.innerHTML = '';
    if (!list.length) {
      tableEl.innerHTML = `<p class="index__empty mono">NO FILES MATCH “${esc(state.q.trim())}”.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(c => {
      const open = state.open === c;
      const cardId = `ifile-${c.tt}`;
      const row = document.createElement('div');
      row.className = 'irow' + (open ? ' is-open' : '') + (c.pending ? ' irow--pending' : '');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', String(open));
      row.setAttribute('aria-controls', cardId);
      row.innerHTML = `
        <span class="irow__no">FILE ${fileNo(c)}</span>
        <span class="irow__thumb">${c.img ? `<img src="${esc(c.img)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />` : ''}</span>
        <span class="irow__title">${esc(c.t)}${c.o ? `<em>${esc(c.o)}</em>` : ''}${c.pending ? '<span class="irow__flag mono">IMDb CREDIT PENDING</span>' : ''}</span>
        <span class="irow__studio">${esc(c.studio)}</span>
        <span class="irow__role">${esc(c.role)}</span>
        <span class="irow__type">${typeLabel(c)}</span>
        <span class="irow__actions">
          ${c.yt ? '<button class="irow__btn irow__btn--play" type="button" data-play aria-label="Play trailer">▶ PLAY</button>' : ''}
          <span class="irow__toggle mono" aria-hidden="true">${open ? '−' : '+'}</span>
        </span>`;

      row.addEventListener('click', e => {
        if (e.target.closest('[data-play]')) { e.stopPropagation(); openCredit(c, e.target.closest('[data-play]')); return; }
        if (e.target.closest('a')) return;
        toggleRow(c);
      });
      row.addEventListener('keydown', e => {
        if (e.target !== row) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRow(c, true); }
      });
      if (finePointer && c.img && !open) {
        row.addEventListener('mouseenter', () => { peekImg.src = c.img; peek.classList.add('on'); });
        row.addEventListener('mouseleave', () => peek.classList.remove('on'));
        row.addEventListener('mousemove', e => {
          const w = 168, h = 252, m = 22;
          let x = e.clientX + m, y = e.clientY - h / 2;
          if (x + w > window.innerWidth - 12) x = e.clientX - w - m;
          y = Math.max(12, Math.min(y, window.innerHeight - h - 12));
          peek.style.left = x + 'px';
          peek.style.top = y + 'px';
        });
      }
      frag.appendChild(row);

      if (open) {
        const wrap = document.createElement('div');
        wrap.innerHTML = fileCard(c, cardId);
        const card = wrap.firstElementChild;
        const play = card.querySelector('[data-play]');
        if (play) play.addEventListener('click', () => openCredit(c, play));
        frag.appendChild(card);
      }
    });
    tableEl.appendChild(frag);
  }
  renderIndex();

  document.querySelectorAll('.ifilter').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ifilter').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      state.filter = btn.dataset.filter;
      renderIndex();
    });
  });
  searchEl.addEventListener('input', () => { state.q = searchEl.value; renderIndex(); });

  /* ============================================================
     FIELD OPERATIONS
     ============================================================ */
  const CODES = ['SCT', 'PRM', 'MGT', 'ARC'];
  $('servicesGrid').innerHTML = profile.services.map(([h, p], i) => `
    <div class="op">
      <div class="op__head mono"><span class="op__phase">PHASE ${pad(i + 1)}</span><span class="op__code">${CODES[i] || ''}</span></div>
      <h3>${esc(h)}</h3>
      <p>${esc(p)}</p>
    </div>`).join('');

  /* ============================================================
     NAV + MOBILE MENU
     ============================================================ */
  const nav = $('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('burger');
  const mobileMenu = $('mobileMenu');
  mobileMenu.inert = true;
  function setMobileMenu(open) {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', () => setMobileMenu(!mobileMenu.classList.contains('is-open')));
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => setMobileMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMobileMenu(false);
  });

  /* ============================================================
     CONTACT FORM — opens the visitor's mail client
     ============================================================ */
  $('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.elements.name.value.trim();
    const email = f.elements.email.value.trim();
    const msg = f.elements.message.value.trim();
    const subject = encodeURIComponent(`Project inquiry — ${name}`);
    const body = encodeURIComponent(`${msg}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  });

  /* ============================================================
     REVEAL — progressive enhancement only. Content is visible by
     default; elements below the fold get a gentle rise when they
     enter. A safety timer reveals everything.
     ============================================================ */
  (function reveal() {
    if (!('IntersectionObserver' in window) || reduced) return;
    const targets = document.querySelectorAll('.sec-head, .sec-lede, .about__grid, .stat, .drawer, .op, .contact__grid');
    const vh = window.innerHeight;
    const pending = [];
    targets.forEach(el => {
      if (el.getBoundingClientRect().top > vh * 1.05) { el.classList.add('pre-reveal'); pending.push(el); }
    });
    if (!pending.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in-view'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    pending.forEach(el => obs.observe(el));
    setTimeout(() => pending.forEach(el => el.classList.add('in-view')), 2500);
  })();
})();
