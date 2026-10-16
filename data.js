/* Site data (16 Oct 2026, from the V6 Archive Showreel variant).
   credits: 54 titles (52 on IMDb + Kluci + Spálená hora, pending: true = Pavel's IMDb credit not filed yet).
   featured: the 20 hand-picked titles + Kluci (isNew). Fields: t title, o alt title, y/ey years,
   studio, role (exact IMDb credit), type feature|tv|short, img poster, yt YouTube trailer id, tt IMDb id. */
const A = 'assets/';
/* Clean 1280x720 frames grabbed from the trailers (no burned-in "OFFICIAL TRAILER" text or channel logos).
   Any trailer without a local still falls back to the YouTube thumbnail. */
const STILLS = new Set(['nulvWqYUM8k', 'HPB7fV7f_f8', 'Uia6y9SRsj4', '1KsyZF590NM', '6FlNemUn78U', 'AQEN9V8r6TM', 'Ss717FniM9I']);
const still = id => STILLS.has(id) ? `assets/stills/${id}.jpg` : null;
const yt = id => still(id) || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

/* ---- Complete IMDb record — 52 credits (nm1623179) ----
   Roles exactly as credited on IMDb. One row per title,
   series shown with year range. Sorted by most recent year. */
const credits = [
  // — 2026 · pending: title is on IMDb, Pavel's credit not filed yet
  { t: 'Kluci to vidí jinak než holky', o: "Don't You Know It's Different for Girls (working title)", y: 2026, studio: 'Lucky Man Films', role: 'locations', type: 'feature', img: A+'kluci-holky.jpg', yt: 'ubqQPxmJcJQ', tt: 'tt43663737', pending: true },
  // — 2026 · series wrapped in 2026 (FILM HUNTERS for FilmBrigade), not on IMDb yet: tt is a local key, no IMDb link until the title exists there
  { t: 'Spálená hora', y: 2026, studio: 'FilmBrigade', role: 'locations', type: 'tv', img: A+'spalena-hora.jpg', tt: 'sh-2026', pending: true },
  // — 2025
  { t: 'FUBAR', y: 2023, ey: 2025, studio: 'Netflix', role: 'location manager · Prague unit', type: 'tv', img: A+'fubar.jpg', yt: 'vJlfAp7ZCAY', tt: 'tt13064902' },
  { t: 'FBI: International', y: 2021, ey: 2025, studio: 'CBS · Universal Television', role: 'location manager', type: 'tv', img: A+'fbi-international.jpg', yt: 'Ss717FniM9I', tt: 'tt14449470' },
  { t: 'Štěstíčku naproti', y: 2025, studio: 'Oneplay · Voyo', role: 'supervising location manager', type: 'tv', img: A+'stesticku-naproti.jpg', yt: 'LoEC0Xc8-S0', tt: 'tt39300922' },
  { t: 'Franz', y: 2025, studio: 'X-Filme · Bioscop', role: 'locations', type: 'feature', img: A+'franz.jpg', yt: 'f78r0tpG5fg', tt: 'tt17070412' },
  { t: 'Live a Little', o: 'Leva lite · Trochu života (CZ, in cinemas 16 Jul 2026)', y: 2025, studio: 'Film i Väst · Amarcord', role: 'location manager: Czech Republic', type: 'feature', img: A+'live-a-little.jpg', yt: '8y1DHBLoMQw', tt: 'tt32357858' },
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
  { t: 'Kluci to vidí jinak než holky', y: '2026', studio: 'Lucky Man Films', dir: 'David Ondříček', yt: 'ubqQPxmJcJQ', img: A+'kluci-holky.jpg', fb: yt('ubqQPxmJcJQ'), isNew: true },
  { t: 'Spálená hora', y: '2026', studio: 'FilmBrigade', dir: 'series', img: A+'spalena-hora.jpg', isNew: true },
  { t: 'Live a Little', y: '2025', studio: 'Film i Väst · Amarcord', dir: 'Fanny Ovesen', yt: '8y1DHBLoMQw', img: A+'live-a-little.jpg', fb: yt('8y1DHBLoMQw'), isNew: true },
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
  'ČESKÁ TELEVIZE', 'PRIMA', 'VOYO', 'LUCKY MAN FILMS',
];


const profile = {
  name: 'Pavel Špaček', honorific: 'MgA.', role: 'Location Manager', city: 'Prague', territory: 'Czech Republic · Slovakia',
  since: 2001, years: '25+', productions: '500+', imdbId: 'nm1623179',
  email: 'pavel@filmhunters.cz', phone: '+420 608 966 700', company: 'FILM HUNTERS', companyUrl: 'https://filmhunters.cz',
  education: 'MgA., FAMU Prague', lmgi: true, // LMGI member — confirmed in Pavel's personal profile
  portrait: A+'pavel-portrait.jpg',
  tagline: 'I find the places where films happen.',
  about: ['Since 2001 — Czech and Slovak features, Hollywood studio pictures, Bollywood musicals, German, Turkish and Japanese productions.',
          'Need locations in Czech Republic or Slovakia? We can start with a conversation.'],
  services: [
    ['Location scouting', 'Script breakdown, creative consultation, location selection.'],
    ['Permits & authority liaison', 'Permits, contracts, municipalities, police, monument care.'],
    ['On-set location management', 'Base camp, set protection, logistics, restoration.'],
    ['The archive — CZ & SK', '25 years of scouting, catalogued. A curated selection for any brief within days.'],
  ],
};
