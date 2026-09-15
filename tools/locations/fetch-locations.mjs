#!/usr/bin/env node
/* ============================================================
   FETCH-LOCATIONS — staví reálnou databázi lokací CZ/SK
   ------------------------------------------------------------
   Zdroje:  OpenStreetMap (Overpass API)  — souřadnice, tagy, správce
            Wikidata (SPARQL)             — názvy, fotky, web, památková ochrana

   Bez API klíčů, bez závislostí, zdarma. Node 18+.

   Použití:
     node fetch-locations.mjs --motiv hrad,mlyn
     node fetch-locations.mjs --all --zeme CZ
     node fetch-locations.mjs --all --no-wikidata --out ../../data

   Výstup:  data/locations.json  ·  locations.geojson  ·  locations.csv

   Každý záznam nese odkaz na OSM, Wikidata a Mapy.cz, takže se
   dá ověřit kliknutím. Skóre a film-friendly zůstávají prázdné —
   ty patří člověku nebo scoutingu, ne generátoru.
   ============================================================ */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOTIVY, MOTIV_KEYS } from './motivy.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const UA = 'pavelspacek-location-research/1.0 (https://www.pavelspacek.com; pavel@filmhunters.cz)';
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const WDQS = 'https://query.wikidata.org/sparql';

const PRAHA = [50.0755, 14.4378];
const BRATISLAVA = [48.1486, 17.1077];

/* ---------- CLI ---------- */
const argv = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = argv.indexOf(`--${n}`);
  if (i === -1) return d;
  const v = argv[i + 1];
  return !v || v.startsWith('--') ? true : v;
};
const has = n => argv.includes(`--${n}`);

if (has('help') || argv.length === 0) {
  console.log(`
  fetch-locations — databáze filmových lokací CZ/SK z OSM + Wikidata

    --motiv <a,b>    motivy k stažení: ${MOTIV_KEYS.join(', ')}
    --all            všechny motivy
    --zeme <CZ|SK>   omezit na jednu zemi (výchozí obě)
    --out <dir>      kam zapsat (výchozí ../../data)
    --no-wikidata    přeskočit obohacení z Wikidat (rychlejší)
    --limit <n>      max záznamů na motiv
    --dry-run        vypíše dotazy, nic nestahuje
    --fixture <f>    načte uloženou Overpass odpověď místo sítě (offline test)
`);
  process.exit(0);
}

const MOTIVY_RUN = has('all') ? MOTIV_KEYS : String(flag('motiv', '')).split(',').map(s => s.trim()).filter(Boolean);
if (!MOTIVY_RUN.length) { console.error('Chybí --motiv nebo --all. Nápověda: --help'); process.exit(1); }
const neznamy = MOTIVY_RUN.filter(m => !MOTIVY[m]);
if (neznamy.length) { console.error(`Neznámý motiv: ${neznamy.join(', ')}`); process.exit(1); }

const ZEME = flag('zeme') ? [String(flag('zeme')).toUpperCase()] : ['CZ', 'SK'];
const OUT = resolve(HERE, String(flag('out', '../../data')));
const LIMIT = Number(flag('limit', 0)) || 0;
const DRY = has('dry-run');
const USE_WD = !has('no-wikidata');
const FIXTURE = flag('fixture') && flag('fixture') !== true ? String(flag('fixture')) : null;

/* ---------- pomocné ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function haversine([aLat, aLon], [bLat, bLon]) {
  const R = 6371, rad = d => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat), dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

async function request(url, opts = {}, pokusy = 3) {
  for (let i = 0; i < pokusy; i++) {
    try {
      const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
      if (res.status === 429 || res.status === 504) throw new Error(`HTTP ${res.status} (server zahlcen)`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      const cekat = 2 ** i * 5;
      if (i === pokusy - 1) throw e;
      console.warn(`   ! ${e.message} — zkouším znovu za ${cekat}s`);
      await sleep(cekat * 1000);
    }
  }
}

/* ---------- Overpass ---------- */
function overpassQL(motiv, zeme) {
  const dotazy = MOTIVY[motiv].q.map(q => `  ${q}(area.a);`).join('\n');
  return `[out:json][timeout:300];\narea["ISO3166-1"="${zeme}"][admin_level=2]->.a;\n(\n${dotazy}\n);\nout center tags;`;
}

async function stahniMotiv(motiv, zeme) {
  const ql = overpassQL(motiv, zeme);

  if (FIXTURE) { // offline běh nad uloženou odpovědí — ladění presetů bez zátěže Overpassu
    const data = JSON.parse(await readFile(resolve(process.cwd(), FIXTURE), 'utf-8'));
    return data.elements || [];
  }
  if (DRY) { console.log(`\n--- ${motiv} / ${zeme} ---\n${ql}`); return []; }

  let posledni;
  for (const endpoint of OVERPASS) {
    try {
      const data = await request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: ql }),
      });
      return data.elements || [];
    } catch (e) { posledni = e; console.warn(`   ! ${endpoint} selhal: ${e.message}`); }
  }
  throw posledni;
}

/* ---------- Wikidata ---------- */
async function obohat(qids) {
  if (!USE_WD || !qids.length) return new Map();
  const out = new Map();
  for (let i = 0; i < qids.length; i += 150) {
    const davka = qids.slice(i, i + 150);
    const sparql = `
SELECT ?item ?itemLabel ?enLabel ?img ?web ?kulturniPamatka WHERE {
  VALUES ?item { ${davka.map(q => `wd:${q}`).join(' ')} }
  OPTIONAL { ?item wdt:P18 ?img }
  OPTIONAL { ?item wdt:P856 ?web }
  OPTIONAL { ?item wdt:P4075 ?kulturniPamatka }
  OPTIONAL { ?item rdfs:label ?enLabel FILTER(LANG(?enLabel)="en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "cs,sk,en". }
}`;
    try {
      const data = await request(`${WDQS}?format=json&query=${encodeURIComponent(sparql)}`, {
        headers: { Accept: 'application/sparql-results+json' },
      });
      for (const b of data.results.bindings) {
        const qid = b.item.value.split('/').pop();
        out.set(qid, {
          nazev_wd: b.itemLabel?.value || null,
          nazev_en: b.enLabel?.value || null,
          foto: b.img?.value || null,
          web: b.web?.value || null,
          ref_uskp: b.kulturniPamatka?.value || null,
        });
      }
      console.log(`   wikidata: ${Math.min(i + 150, qids.length)}/${qids.length}`);
    } catch (e) { console.warn(`   ! wikidata dávka selhala: ${e.message}`); }
    await sleep(1200);
  }
  return out;
}

/* ---------- normalizace ---------- */
// OSM tag má tvar "cs:Dolský mlýn" — jazyk je součástí hodnoty
function wikiUrl(tag) {
  if (!tag) return null;
  const m = /^([a-z-]+):(.+)$/.exec(tag);
  const [jazyk, titul] = m ? [m[1], m[2]] : ['cs', tag];
  return `https://${jazyk}.wikipedia.org/wiki/${encodeURIComponent(titul.replace(/ /g, '_'))}`;
}

function zaznam(el, motiv, wd, zemeKod) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;

  const qid = t.wikidata || null;
  const w = qid && wd.get(qid) ? wd.get(qid) : {};
  const nazev = t['name:cs'] || t.name || t['name:sk'] || w.nazev_wd;
  if (!nazev) return null;

  return {
    id: `${el.type}/${el.id}`,
    nazev,
    nazev_en: w.nazev_en || t['name:en'] || null,
    motiv,
    motiv_label: MOTIVY[motiv].label,
    zeme: zemeKod,
    region: t['addr:region'] || t['addr:state'] || null,
    obec: t['addr:city'] || t['addr:village'] || null,
    lat: +lat.toFixed(6),
    lon: +lon.toFixed(6),
    km_praha_vzdusne: haversine([lat, lon], PRAHA),
    km_bratislava_vzdusne: haversine([lat, lon], BRATISLAVA),
    sprava: t.operator || t.owner || null,
    web: t.website || t['contact:website'] || w.web || null,
    pristup: t.access || null,
    stav_objektu: t.ruins === 'yes' ? 'zřícenina' : t.building === 'ruins' ? 'zřícenina' : null,
    pamatkova_ochrana: { ref_npu: t['ref:npu'] || w.ref_uskp || null, heritage: t.heritage || null },
    zdroje: {
      osm: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      mapy: `https://mapy.com/zakladni?x=${lon}&y=${lat}&z=17`,
      wikidata: qid ? `https://www.wikidata.org/wiki/${qid}` : null,
      wikipedia: wikiUrl(t.wikipedia),
      foto: w.foto || null,
    },
    // vyplňuje člověk nebo scouting — generátor sem nic nevymýšlí
    skore: { vis: null, prak: null, aut: null, dost: null, risk: null, total: null },
    film_friendly: null,
    kontakt: null,
    poznamka: null,
    stav_zaznamu: 'neoveřeno',
  };
}

/* ---------- výstupy ---------- */
const csvEsc = v => {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function zapis(zaznamy) {
  await mkdir(OUT, { recursive: true });

  await writeFile(join(OUT, 'locations.json'), JSON.stringify({
    generovano: new Date().toISOString(),
    zdroje: ['OpenStreetMap (ODbL)', USE_WD ? 'Wikidata (CC0)' : null].filter(Boolean),
    pocet: zaznamy.length,
    upozorneni: 'Vzdálenosti jsou vzdušnou čarou, ne po silnici. Každý záznam je nutné ověřit scoutingem.',
    lokace: zaznamy,
  }, null, 2));

  await writeFile(join(OUT, 'locations.geojson'), JSON.stringify({
    type: 'FeatureCollection',
    features: zaznamy.map(z => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [z.lon, z.lat] },
      properties: { id: z.id, nazev: z.nazev, motiv: z.motiv, km_praha: z.km_praha_vzdusne, osm: z.zdroje.osm },
    })),
  }));

  const sloupce = ['nazev', 'nazev_en', 'motiv', 'zeme', 'obec', 'lat', 'lon', 'km_praha_vzdusne', 'km_bratislava_vzdusne', 'sprava', 'web', 'stav_objektu'];
  const csv = [sloupce.join(';'), ...zaznamy.map(z => sloupce.map(s => csvEsc(z[s])).join(';'))].join('\n');
  await writeFile(join(OUT, 'locations.csv'), '﻿' + csv);
}

/* ---------- main ---------- */
const vse = [];
const prehled = [];

for (const motiv of MOTIVY_RUN) {
  process.stdout.write(`\n▸ ${motiv} — ${MOTIVY[motiv].label}\n`);
  const elementy = [];
  for (const zeme of ZEME) {
    const cast = await stahniMotiv(motiv, zeme);
    if (!DRY) console.log(`   OSM ${zeme}: ${cast.length} objektů`);
    elementy.push(...cast.map(e => ({ ...e, _zeme: zeme })));
    if (!DRY) await sleep(3000); // Overpass je sdílená služba zdarma — nezahlcovat
  }
  if (DRY) continue;

  const qids = [...new Set(elementy.map(e => e.tags?.wikidata).filter(Boolean))];
  const wd = await obohat(qids);

  let zaznamy = elementy.map(e => zaznam(e, motiv, wd, e._zeme)).filter(Boolean);
  zaznamy.sort((a, b) => a.km_praha_vzdusne - b.km_praha_vzdusne);
  if (LIMIT) zaznamy = zaznamy.slice(0, LIMIT);

  console.log(`   použitelných (má název + souřadnice): ${zaznamy.length}`);
  prehled.push([motiv, elementy.length, zaznamy.length, qids.length]);
  vse.push(...zaznamy);
}

if (DRY) { console.log('\n--dry-run: nic nestaženo, nic nezapsáno.'); process.exit(0); }

const unikatni = [...new Map(vse.map(z => [z.id, z])).values()];
await zapis(unikatni);

console.log(`\n${'motiv'.padEnd(12)} ${'OSM'.padStart(6)} ${'použito'.padStart(8)} ${'wikidata'.padStart(9)}`);
for (const [m, a, b, c] of prehled) console.log(`${m.padEnd(12)} ${String(a).padStart(6)} ${String(b).padStart(8)} ${String(c).padStart(9)}`);
console.log(`\n✓ ${unikatni.length} lokací → ${OUT}/locations.{json,geojson,csv}`);
console.log('  Nulový nebo podezřele nízký počet = špatný OSM preset, ne prázdná realita. Uprav motivy.mjs.');
