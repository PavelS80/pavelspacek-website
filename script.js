/* ============================================================
   PAVEL ŠPAČEK — THE LOCATION ARCHIVE
   Data + rendering · v3
   ============================================================ */

const A = 'assets/';
const yt = id => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

/* ---- Complete IMDb record — 52 credits (nm1623179) ----
   Roles exactly as credited on IMDb. One row per title,
   series shown with year range. Sorted by most recent year. */
const credits = [
  // — 2025
  { t: 'FUBAR', y: 2023, ey: 2025, studio: 'Netflix', role: 'location manager · Prague unit', type: 'tv', img: A+'fubar.jpg', yt: 'vJlfAp7ZCAY', tt: 'tt13064902' },
  { t: 'FBI: International', y: 2021, ey: 2025, studio: 'CBS · Universal Television', role: 'location manager', type: 'tv', img: A+'fbi-international.jpg', yt: 'Ss717FniM9I', tt: 'tt14449470' },
  { t: 'Štěstíčku naproti', y: 2025, studio: 'Oneplay · Voyo', role: 'supervising location manager', type: 'tv', img: A+'stesticku-naproti.jpg', yt: 'LoEC0Xc8-S0', tt: 'tt39300922' },
  { t: 'Franz', y: 2025, studio: 'X-Filme · Bioscop', role: 'locations', type: 'feature', img: A+'franz.jpg', yt: 'f78r0tpG5fg', tt: 'tt17070412' },
  { t: 'Live a Little', o: 'Leva lite', y: 2025, studio: 'Film i Väst · Amarcord', role: 'location manager: Czech Republic', type: 'feature', img: A+'live-a-little.jpg', yt: '8y1DHBLoMQw', tt: 'tt32357858' },
  { t: 'Die Frau ohne Gesicht', y: 2025, studio: 'ARTE · Lailaps Films', role: 'location manager', type: 'tv', img: A+'die-frau-ohne-gesicht.jpg', tt: 'tt38585456' },
  // — 2024
  { t: 'Nosferatu', y: 2024, studio: 'Focus Features', role: 'location manager', type: 'feature', img: A+'nosferatu.jpg', yt: 'nulvWqYUM8k', tt: 'tt5040012' },
  { t: 'Hořký svět', y: 2022, ey: 2024, studio: 'Prima', role: 'supervising location manager', type: 'tv', img: A+'horky-svet.jpg', yt: 'ihgZS8vc7cM', tt: 'tt21848944' },
  { t: 'Zrádci', y: 2024, studio: 'Prima', role: 'supervising location manager', type: 'tv', img: A+'zradci-prima.jpg', yt: 'vZv7nVQiF8E', tt: 'tt33321873' },
  { t: 'Hrdina', y: 2024, studio: 'Prima · Oneplay', role: 'supervising location manager', type: 'tv', img: A+'hrdina.jpg', yt: 'K9iny-JqPL8', tt: 'tt33101555' },
  { t: 'Amerikánka', y: 2024, studio: 'Bioscop · PFX', role: 'location scout', type: 'feature', img: A+'amerikanka.jpg', yt: 'GmMzuwOtczQ', tt: 'tt33499451' },
  // — 2023
  { t: 'Wonka', y: 2023, studio: 'Warner Bros.', role: 'location manager: sfx still shoot', type: 'feature', img: A+'wonka.jpg', yt: 'otNh9bTjXWg', tt: 'tt6166392' },
  { t: 'Das Boot', y: 2018, ey: 2023, studio: 'Sky · Bavaria Fiction', role: 'supervising location manager · all seasons S1–S4', type: 'tv', img: A+'das-boot-3.jpg', yt: '6FlNemUn78U', tt: 'tt5830254' },
  { t: 'Jack Ryan', y: 2018, ey: 2023, studio: 'Amazon Prime Video', role: 'location manager', type: 'tv', img: A+'jack-ryan.jpg', yt: '1KsyZF590NM', tt: 'tt5057054' },
  { t: 'Hunters', y: 2020, ey: 2023, studio: 'Amazon Prime Video', role: 'supervising location manager', type: 'tv', img: A+'hunters.jpg', yt: 'vHE3HViq8r8', tt: 'tt7456722' },
  { t: 'Los Farad', y: 2023, studio: 'Amazon Prime Video', role: 'supervising location manager', type: 'tv', img: A+'los-farad.jpg', yt: '1Lb333Lmaqs', tt: 'tt21278506' },
  { t: 'Die Saat — Tödliche Macht', y: 2023, studio: 'Sky · ARD', role: 'supervising location manager', type: 'tv', img: A+'die-saat.jpg', yt: 'TAd93upmJIs', tt: 'tt20220254' },
  { t: 'Bod obnovy', o: 'Restore Point', y: 2023, studio: 'Film Kolektiv', role: 'locations', type: 'feature', img: A+'restore-point.jpg', yt: 'JewqVAvzJnA', tt: 'tt9362492' },
  { t: 'Bratři', o: 'Brothers', y: 2023, studio: 'FilmBrigade · Česká televize', role: 'supervising location manager', type: 'feature', img: A+'bratri.jpg', yt: '_ycEQ65wAbY', tt: 'tt14232442' },
  { t: "John Carpenter's Suburban Screams", y: 2023, studio: 'Peacock', role: 'location scout', type: 'tv', img: A+'suburban-screams.jpg', yt: 'a9cRV4_Qgew', tt: 'tt29120536' },
  // — 2022
  { t: 'Iveta', y: 2022, studio: 'Voyo · TV Nova', role: 'supervising location manager', type: 'tv', img: A+'iveta.jpg', yt: 'fCWr9mpZvB8', tt: 'tt17053832' },
  { t: 'Sedm schodů k moci', y: 2022, studio: 'Prima · Unit Sofa', role: 'supervising location manager', type: 'tv', img: A+'sedm-schodu-k-moci.jpg', yt: 'ZyAneVp7G_U', tt: 'tt20880752' },
  { t: 'Grand Prix', y: 2022, studio: 'Offside MEN · Česká televize', role: 'supervising location manager', type: 'feature', img: A+'grand-prix.jpg', yt: 'NdToBcJhFyg', tt: 'tt14401508' },
  { t: 'Spolu', y: 2022, studio: 'Bontonfilm', role: 'supervising location manager', type: 'feature', img: A+'spolu.jpg', yt: 'Hof4Ji9XwpI', tt: 'tt22037196' },
  { t: 'Běžná selhání', o: 'Ordinary Failures', y: 2022, studio: 'Xova Film · HBO Europe', role: 'supervising location manager', type: 'feature', img: A+'bezna-selhani.jpg', yt: 'ALo8__vC3X0', tt: 'tt13844844' },
  { t: 'Pánský klub', y: 2022, studio: 'Punk Film · Bontonfilm', role: 'supervising location manager', type: 'feature', img: A+'pansky-klub.jpg', yt: 'kXe0Yi82JH8', tt: 'tt13678280' },
  { t: 'Vyšehrad: Fylm', y: 2022, studio: 'Obbod', role: 'supervising location manager', type: 'feature', img: A+'vysehrad.jpg', yt: '_2URNiAouqE', tt: 'tt13086670' },
  { t: 'Poslední závod', y: 2022, studio: 'Punk Film', role: 'location coordinator', type: 'feature', img: A+'posledni-zavod.jpg', yt: 'qlOO0yljKso', tt: 'tt13275560' },
  // — 2021
  { t: "If I Can't Have Love, I Want Power", y: 2021, studio: 'IMAX · HBO Max', role: 'location manager', type: 'feature', img: A+'if-i-cant-have-love.jpg', yt: 'eM7luZ-00RI', tt: 'tt15141288' },
  { t: 'Večírek', y: 2021, studio: 'Falcon', role: 'location coordinator', type: 'feature', img: A+'vecirek.jpg', yt: 'inOmWd0R-vE', tt: 'tt12883212' },
  // — 2020
  { t: 'Zrádci', o: 'The Traitors', y: 2019, ey: 2020, studio: 'Česká televize', role: 'supervising location manager', type: 'tv', img: A+'zradci.jpg', tt: 'tt10720694' },
  { t: 'Erotica 2022', y: 2020, studio: 'Netflix', role: '2nd production manager: locations', type: 'feature', img: A+'erotica-2022.jpg', yt: 'llthIvsbP8Q', tt: 'tt10399674' },
  { t: 'Chlap na střídačku', y: 2020, studio: 'Bohemia Motion Pictures', role: 'key assistant location manager', type: 'feature', img: A+'chlap-na-stridacku.jpg', yt: 'dEcgilolTxI', tt: 'tt10681656' },
  // — 2019
  { t: 'Bride of Istanbul', o: 'İstanbullu Gelin', y: 2017, ey: 2019, studio: 'Star TV', role: 'location coordinator', type: 'tv', img: A+'bride-of-istanbul.jpg', yt: 'QOBHCfrQJtc', tt: 'tt6462806' },
  // — 2018
  { t: '12 Monkeys', y: 2015, ey: 2018, studio: 'Syfy · Atlas Entertainment', role: 'location manager', type: 'tv', img: A+'12-monkeys.jpg', yt: 'AQEN9V8r6TM', tt: 'tt3148266' },
  { t: 'The Rookie', y: 2018, studio: 'ABC', role: 'locations', type: 'tv', img: A+'the-rookie.jpg', yt: '8BPlx6eK1vc', tt: 'tt7587890' },
  { t: 'Toman', y: 2018, studio: 'Total HelpArt · Česká televize', role: 'location coordinator', type: 'feature', img: A+'toman.jpg', yt: 'LF6ANdT4Iro', tt: 'tt6283474' },
  { t: 'Čertí brko', o: 'The Magic Quill', y: 2018, studio: 'Česká televize · Punk Film', role: 'location coordinator', type: 'feature', img: A+'certi-brko.jpg', yt: 'Zoamf7DPxVw', tt: 'tt7028140' },
  // — 2017
  { t: 'Interlude in Prague', y: 2017, studio: 'Stillking Films', role: 'supervising location manager', type: 'feature', img: A+'interlude-prague.jpg', yt: 'uQR4nan5neM', tt: 'tt5540194' },
  { t: 'Jab Harry Met Sejal', y: 2017, studio: 'Red Chillies Entertainment', role: 'location manager', type: 'feature', img: A+'jab-harry-met-sejal.jpg', yt: 'Ej2IYqyMzA4', tt: 'tt5997666' },
  // — 2016
  { t: 'Polda', y: 2016, studio: 'Prima', role: 'supervising location manager', type: 'tv', img: A+'polda.jpg', yt: 'aFSRE9DG5nE', tt: 'tt6315016' },
  // — 2015
  { t: 'Child 44', y: 2015, studio: 'Lionsgate · Summit', role: 'location manager', type: 'feature', img: A+'child-44.jpg', yt: 'Uia6y9SRsj4', tt: 'tt1014763' },
  { t: 'Sedmero krkavců', o: 'The Seven Ravens', y: 2015, studio: 'Attack Film', role: 'locations scout', type: 'feature', img: A+'sedmero-krkavcu.jpg', yt: 'QsbFDXz6dk8', tt: 'tt3037336' },
  // — 2013
  { t: 'Strach', o: 'Little Secret', y: 2013, studio: 'Stillking Films', role: 'location manager', type: 'short', img: A+'little-secret.jpg', tt: 'tt2979030' },
  // — 2012
  { t: 'Manipulations', y: 2012, studio: 'Sirena Film · AB Productions', role: 'location manager', type: 'tv', img: A+'manipulations.jpg', tt: 'tt2294727' },
  // — 2011
  { t: 'Mission: Impossible — Ghost Protocol', y: 2011, studio: 'Paramount Pictures', role: 'assistant location manager: Prague', type: 'feature', img: A+'mission-impossible.jpg', yt: 'HPB7fV7f_f8', tt: 'tt1229238' },
  { t: 'Rockstar', y: 2011, studio: 'Eros International', role: 'location manager', type: 'feature', img: A+'rockstar.jpg', yt: 'bD5FShPZdpw', tt: 'tt1839596' },
  // — 2010
  { t: 'Nodame Cantabile: The Movie II', y: 2010, studio: 'Fuji TV', role: 'location manager', type: 'feature', img: A+'nodame-cantabile.jpg', yt: 'SQTCm37Vkso', tt: 'tt1337673' },
  // — 2006
  { t: 'The Illusionist', y: 2006, studio: 'Yari Film Group', role: 'locations scout', type: 'feature', img: A+'illusionist.jpg', yt: 'zuFGKcOSUfM', tt: 'tt0443543' },
  // — 2005
  { t: 'Příběhy obyčejného šílenství', y: 2005, studio: 'Negativ', role: 'production manager', type: 'feature', img: A+'pribehy-silenstvi.jpg', yt: 'haR12FFoOOM', tt: 'tt0408120' },
  // — 2004
  { t: 'Mistři', y: 2004, studio: 'Negativ · Česká televize', role: 'production manager', type: 'feature', img: A+'mistri.jpg', tt: 'tt0403310' },
  // — 2003
  { t: 'Želary', y: 2003, studio: 'Barrandov · ALEF Film', role: 'location manager', type: 'feature', img: A+'zelary.jpg', yt: 'z9MYQlU2V1s', tt: 'tt0288330' },
];

/* ---- Featured — priority files (wide cards use trailer stills) ---- */
const featured = [
  { t: 'Nosferatu', y: '2024', studio: 'Focus Features', dir: 'Robert Eggers', yt: 'nulvWqYUM8k', img: yt('nulvWqYUM8k'), fb: A+'nosferatu.jpg' },
  { t: 'Mission: Impossible — Ghost Protocol', y: '2011', studio: 'Paramount', dir: 'Brad Bird', yt: 'HPB7fV7f_f8', img: yt('HPB7fV7f_f8'), fb: A+'mission-impossible.jpg' },
  { t: '12 Monkeys', y: '2015–2018', studio: 'Syfy', dir: 'series', yt: 'AQEN9V8r6TM', img: A+'12-monkeys.jpg', fb: yt('AQEN9V8r6TM') },
  { t: 'Jack Ryan', y: '2018–2023', studio: 'Amazon Prime Video', dir: 'series', yt: '1KsyZF590NM', img: A+'jack-ryan.jpg', fb: yt('1KsyZF590NM') },
  { t: 'Das Boot', y: '2018–2023 · S1–S4', studio: 'Sky', dir: 'series', yt: '6FlNemUn78U', img: A+'das-boot-3.jpg', fb: yt('6FlNemUn78U') },
  { t: 'Child 44', y: '2015', studio: 'Lionsgate', dir: 'Daniel Espinosa', yt: 'Uia6y9SRsj4', img: A+'child-44.jpg', fb: yt('Uia6y9SRsj4') },
  { t: 'FUBAR', y: '2023–2025', studio: 'Netflix', dir: 'series', yt: 'vJlfAp7ZCAY', img: A+'fubar.jpg', fb: yt('vJlfAp7ZCAY') },
  { t: 'Hunters', y: '2020–2023', studio: 'Amazon Prime Video', dir: 'series', yt: 'vHE3HViq8r8', img: A+'hunters.jpg', fb: yt('vHE3HViq8r8') },
  { t: 'FBI: International', y: '2021–2025', studio: 'CBS', dir: 'series', yt: 'Ss717FniM9I', img: A+'fbi-international.jpg', fb: yt('Ss717FniM9I') },
  { t: "If I Can't Have Love, I Want Power", y: '2021', studio: 'IMAX · HBO Max', dir: 'Colin Tilley', yt: 'eM7luZ-00RI', img: A+'if-i-cant-have-love.jpg', fb: yt('eM7luZ-00RI') },
  { t: 'Jab Harry Met Sejal', y: '2017', studio: 'Red Chillies', dir: 'Imtiaz Ali', yt: 'Ej2IYqyMzA4', img: A+'jab-harry-met-sejal.jpg', fb: yt('Ej2IYqyMzA4') },
  { t: 'Bod obnovy', y: '2023', studio: 'Film Kolektiv', dir: 'Robert Hloz', yt: 'JewqVAvzJnA', img: A+'restore-point.jpg', fb: yt('JewqVAvzJnA') },
  { t: 'Iveta', y: '2022', studio: 'Voyo · TV Nova', dir: 'series', yt: 'fCWr9mpZvB8', img: A+'iveta.jpg', fb: yt('fCWr9mpZvB8') },
  { t: 'The Rookie', y: '2018', studio: 'ABC', dir: 'series', yt: '8BPlx6eK1vc', img: A+'the-rookie.jpg', fb: yt('8BPlx6eK1vc') },
  { t: 'Franz', y: '2025', studio: 'X-Filme · Bioscop', dir: 'Agnieszka Holland', yt: 'f78r0tpG5fg', img: A+'franz.jpg', fb: yt('f78r0tpG5fg') },
  { t: 'Bratři', y: '2023', studio: 'FilmBrigade · Česká televize', dir: 'Tomáš Mašín', yt: '_ycEQ65wAbY', img: A+'bratri.jpg', fb: yt('_ycEQ65wAbY') },
  { t: 'Zrádci', y: '2024', studio: 'Prima', dir: 'series', yt: 'vZv7nVQiF8E', img: A+'zradci-prima.jpg', fb: yt('vZv7nVQiF8E') },
  { t: 'Vyšehrad: Fylm', y: '2022', studio: 'Obbod', dir: 'Martin Kopp', yt: '_2URNiAouqE', img: A+'vysehrad.jpg', fb: yt('_2URNiAouqE') },
  { t: 'Los Farad', y: '2023', studio: 'Amazon Prime Video', dir: 'series', yt: '1Lb333Lmaqs', img: A+'los-farad.jpg', fb: yt('1Lb333Lmaqs') },
  { t: 'Želary', y: '2003', studio: 'Barrandov · ALEF Film', dir: 'Ondřej Trojan', yt: 'z9MYQlU2V1s', img: A+'zelary.jpg', fb: yt('z9MYQlU2V1s') },
];

/* ---- Hero contact sheet ---- */
const sheetFrames = [
  { yt: 'nulvWqYUM8k', t: 'Nosferatu', circled: true },
  { yt: 'HPB7fV7f_f8', t: 'Mission: Impossible' },
  { yt: 'Uia6y9SRsj4', t: 'Child 44' },
  { yt: '1KsyZF590NM', t: 'Jack Ryan' },
  { yt: '6FlNemUn78U', t: 'Das Boot' },
];

/* ---- Studio ticker ---- */
const studios = [
  'FOCUS FEATURES', 'WARNER BROS.', 'PARAMOUNT', 'NETFLIX', 'AMAZON PRIME VIDEO',
  'HBO MAX', 'SKY', 'LIONSGATE', 'CBS', 'ABC', 'SYFY', 'PEACOCK', 'IMAX',
  'RED CHILLIES', 'EROS INTERNATIONAL', 'ARTE', 'FUJI TV', 'STAR TV',
  'ČESKÁ TELEVIZE', 'PRIMA', 'VOYO',
];

/* ============================================================
   RENDERING
   ============================================================ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* Current year in header/footer */
const NOW = new Date().getFullYear();
['yearNow', 'yearNow2', 'yearNow3'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.textContent = NOW;
});

/* Make a non-button element keyboard-operable */
function makePlayable(el, label, fn) {
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', label);
  el.addEventListener('click', fn);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  });
}

/* --- Contact sheet --- */
const sheetEl = document.getElementById('contactSheet');
sheetFrames.forEach((f, i) => {
  const d = document.createElement('div');
  d.className = 'sheet__frame' + (f.circled ? ' sheet__frame--circled' : '');
  d.innerHTML = `
    <img src="${yt(f.yt)}" alt="${esc(f.t)}" loading="eager"
         onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${f.yt}/hqdefault.jpg'" />
    <span class="sheet__num">FR·${String((i + 1) * 12).padStart(3, '0')}</span>`;
  makePlayable(d, `Play trailer: ${f.t}`, () => openModal(f.yt, f.t, ''));
  sheetEl.appendChild(d);
});

/* Edge-print on the contact sheet rail */
const edge = document.createElement('span');
edge.className = 'sheet__edgeprint mono';
edge.setAttribute('aria-hidden', 'true');
edge.textContent = 'PŠ ARCH 35 · 0042+07';
sheetEl.appendChild(edge);

/* --- Ticker --- */
const tick = document.getElementById('tickerTrack');
tick.innerHTML = [...studios, ...studios]
  .map(s => `<span>${s}</span><span class="tick-dot">●</span>`).join('');

/* --- Featured --- */
const featuredGrid = document.getElementById('featuredGrid');
featured.forEach((f, i) => {
  const card = document.createElement('article');
  card.className = `pfile reveal reveal-d${(i % 6) + 1}`;
  card.innerHTML = `
    <img src="${f.img}" alt="${esc(f.t)}" loading="lazy" onerror="this.onerror=null;this.src='${f.fb}'" />
    <div class="pfile__shade"></div>
    <span class="pfile__tag">PRIORITY · ${String(i + 1).padStart(2, '0')}</span>
    <span class="pfile__play" aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 14 14"><polygon points="2,1 2,13 13,7" fill="currentColor"/></svg>
    </span>
    <div class="pfile__body">
      <h3 class="pfile__title">${esc(f.t)}</h3>
      <div class="pfile__meta"><b>${esc(f.studio)}</b>${f.dir !== 'series' ? `<span>dir. ${esc(f.dir)}</span>` : '<span>TV series</span>'}</div>
    </div>`;
  makePlayable(card, `Play trailer: ${f.t}`, () => openModal(f.yt, f.t, f.studio));
  featuredGrid.appendChild(card);
});

/* --- Archive index --- */
const tableEl = document.getElementById('indexTable');
const peek = document.getElementById('peek');
const peekImg = document.getElementById('peekImg');
const finePointer = window.matchMedia('(pointer: fine)').matches;

const typeLabel = c => c.type === 'tv' ? 'TV' : c.type === 'short' ? 'SHORT' : 'FILM';

/* Header count derived from the data itself */
const countEl = document.getElementById('indexCount');
if (countEl) countEl.textContent = credits.length;

function renderIndex(filter = 'all') {
  peek.classList.remove('on');
  tableEl.innerHTML = '';
  const list = credits.filter(c => filter === 'all' || (filter === 'tv' ? c.type === 'tv' : c.type !== 'tv'));

  list.forEach(c => {
    const row = document.createElement('div');
    row.className = 'irow';
    const no = credits.length - credits.indexOf(c);
    row.innerHTML = `
      <span class="irow__no">FILE ${String(no).padStart(3, '0')}</span>
      <span class="irow__thumb">${c.img ? `<img src="${c.img}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />` : ''}</span>
      <span class="irow__title">${esc(c.t)}${c.o ? `<em>${esc(c.o)}</em>` : ''}</span>
      <span class="irow__studio">${esc(c.studio)}</span>
      <span class="irow__role">${esc(c.role)}</span>
      <span class="irow__type">${typeLabel(c)}</span>
      <span class="irow__actions">
        ${c.yt ? '<button class="irow__btn irow__btn--play" aria-label="Play trailer">▶ PLAY</button>' : ''}
        <a class="irow__btn" href="https://www.imdb.com/title/${c.tt}/" target="_blank" rel="noopener">IMDb</a>
      </span>`;

    if (c.yt) {
      row.addEventListener('click', e => {
        if (!e.target.closest('a')) openModal(c.yt, c.t, `${c.studio} · ${c.role}`);
      });
    } else {
      row.style.cursor = 'default';
    }

    if (finePointer && c.img) {
      row.addEventListener('mouseenter', () => { peekImg.src = c.img; peek.classList.add('on'); });
      row.addEventListener('mouseleave', () => peek.classList.remove('on'));
      row.addEventListener('mousemove', e => {
        const w = 168, h = 252, m = 22;
        let x = e.clientX + m, yPos = e.clientY - h / 2;
        if (x + w > window.innerWidth - 12) x = e.clientX - w - m;
        yPos = Math.max(12, Math.min(yPos, window.innerHeight - h - 12));
        peek.style.left = x + 'px';
        peek.style.top = yPos + 'px';
      });
    }

    tableEl.appendChild(row);
  });
}
renderIndex();

document.querySelectorAll('.ifilter').forEach(btn => {
  btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ifilter').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderIndex(btn.dataset.filter);
  });
});

/* ============================================================
   MODAL
   ============================================================ */
const modal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalPlayer');
const modalCaption = document.getElementById('modalCaption');
const modalCloseBtn = document.getElementById('modalClose');
let lastFocused = null;

function openModal(videoId, title, meta) {
  lastFocused = document.activeElement;
  modalPlayer.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
            title="${esc(title)} — trailer"
            allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  modalCaption.innerHTML = `
    <span class="modal__caption-title">${esc(title)}</span>
    <span>${esc(meta)}</span>`;
  modal.classList.add('is-open');
  modal.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  modalCloseBtn.focus();
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  modalPlayer.innerHTML = '';
  document.body.style.overflow = '';
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

modalCloseBtn.addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (!modal.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const focusables = [modalCloseBtn, modalPlayer.querySelector('iframe')].filter(Boolean);
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
});

/* ============================================================
   NAV + MOBILE MENU
   ============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

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
   CONTACT FORM — opens the visitor's mail client, no backend
   ============================================================ */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.currentTarget;
  const name = f.name.value.trim();
  const email = f.email.value.trim();
  const msg = f.message.value.trim();
  const subject = encodeURIComponent(`Project inquiry — ${name}`);
  const body = encodeURIComponent(`${msg}\n\n—\n${name}\n${email}`);
  window.location.href = `mailto:pavel@filmhunters.cz?subject=${subject}&body=${body}`;
});

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
const sections = [
  ['.sec-head', 'reveal'],
  ['.sec-lede', 'reveal reveal-d1'],
  ['.about__photo', 'reveal'],
  ['.about__title', 'reveal'],
  ['.about__text p', 'reveal'],
  ['.stat', 'reveal'],
  ['.op', 'reveal'],
  ['.contact__form', 'reveal'],
  ['.contact__info', 'reveal reveal-d2'],
];
sections.forEach(([sel, cls]) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    cls.split(' ').forEach(c => el.classList.add(c));
    if (!cls.includes('-d')) el.classList.add(`reveal-d${(i % 4) + 1}`);
  });
});

if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in-view'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}
