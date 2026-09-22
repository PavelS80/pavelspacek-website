# Zdroje fotek pro scouting — třívrstvý model

Jak k lokaci z longlistu sehnat reálné fotky, místo halucinovaných URL.
Pořadí vrstev je podle poměru výtěžnost / námaha. Vždy začni vrstvou 1.

| Vrstva | Zdroje | Jde skriptem? | Licence | Confidence místa |
|---|---|---|---|---|
| 1. API | Wikidata, Wikimedia Commons | ano (`fetch_commons_photos.py`) | volná, autor v CSV | high (EXIF geotag) / medium |
| 2. Web | turistika.cz, denik.cz, weby správců | částečně (přímá URL obrázků) | jen reference | medium |
| 3. Chrome | Mapy.cz, Instagram, Facebook, Rajče, Google Maps | ne — login / JS | jen reference | high (geotag/panorama) |

---

## Vrstva 1 — Wikidata + Commons (API)

Páteř. Wikidata dají GPS a odkaz na Commons kategorii, Commons dají fotky
ve scoutovacím rozlišení i s autorem a licencí.

```bash
python3 scripts/fetch_commons_photos.py "Hrad Bouzov" --out ./fotky/bouzov
python3 scripts/fetch_commons_photos.py --qid Q940492 --limit 40 --width 2560
python3 scripts/fetch_commons_photos.py "Pernštejn" --dry-run   # jen výpis
```

Skript sám: najde entitu → vezme P625 (GPS), P373 (Commons kategorie), P18
(hlavní foto) → projde kategorii i podkategorie → odfiltruje znaky, mapy,
plány, SVG/PDF a malé soubory → stáhne největší originály jako thumbnail
zadané šířky → zapíše `photos.csv` a `chrome_tier.md`.

**Musí běžet v Cowork / Claude Code s přístupem na síť.** Z chatového okna
Commons jen čteš přes vyhledávání, stahovat nelze.

Pokrytí podle motivu (confidence medium — odhad z testu, ne měření):

- **Hrady, zámky, zříceniny** — výborné. Bouzov: 293 souborů, originály až
  6016×4000 px, samostatná kategorie interiérů, i 360° panorama okolí.
- **Historická města / podhradí** — velmi dobré, ale kategorie jsou
  na úrovni města; zanoř `--depth 2` a filtruj podle názvu.
- **Skanzeny, technické památky, mlýny se jménem** — střídavé.
- **Lesy, potoky, cesty, krajina** — slabé. Kategorie jsou na úrovni CHKO,
  ne konkrétního úseku. Sem patří vrstva 3.
- **Prázdné domy, opuštěné objekty, industriál bez jména** — Commons je
  nemá prakticky vůbec. Vrstva 3 je jediná cesta.

Když Wikidata nemají P373, skript to napíše a vygeneruje jen `chrome_tier.md`.

## Vrstva 2 — český web

Levné doplnění tam, kde Commons nemá "odkud to fotit".

- **turistika.cz** — články s fotogalerií, často letecké záběry a tip na
  vyhlídkový bod nad lokací. Přesně to, co Commons nemá.
- **denik.cz/tag/<lokalita>** — regionální deníky. Stránka vypisuje přímé
  URL fotek z `g.denik.cz`, takže jdou stáhnout i bez prohlížeče. Silné na
  akce (historické slavnosti, rekonstrukce) a na aktuální stav.
- **Web správce** — NPÚ, obec, soukromý majitel, Lesy ČR, ŠOP SR.
  Nejspolehlivější na interiéry a na otevírací dobu / sezónnost.

Místo v titulku článku = `confidence_mista: medium`, ne high.

## Vrstva 3 — Chrome (přihlášený, na vlastním počítači)

**Nejde spustit v cloudu ani v chatu.** Vyžaduje tvůj Chrome s tvým
přihlášením — tedy Cowork s připojeným počítačem, nebo terminál u tebe.

Tři cesty, od nejjednodušší:

```bash
# A) Konzole prohlížeče — nic se neinstaluje
#    Otevři stránku, proscrolluj, F12 → Console → "allow pasting" →
#    vlož console_harvest.js → scoutSave()  → stáhne urls.json
python3 chrome_scout.py --urls urls.json --out ./fotky/bouzov \
    --slug bouzov --confidence high

# B) Živě v Chrome s tvým profilem (pip install playwright)
#    Ty klikáš a scrolluješ, Enter v terminálu sebere, co je na stránce
python3 chrome_scout.py --live --slug bouzov --out ./fotky/bouzov \
    --start-url "https://www.instagram.com/explore/locations/..."

# C) Mapy.cz — bez přihlášení, plně automatické
python3 chrome_scout.py --mapy 49.70417,16.89111 --slug bouzov --out ./fotky/bouzov
```

**Asistovaný sběr, ne crawler.** Skript nikdy sám nescrolluje, neklikne ani
se nepřihlašuje — sbírá jen to, co máš právě načtené na obrazovce. Je to
vědomé: automatizovaný průchod IG/FB je proti podmínkám služby a vede
k dočasnému omezení účtu. Heslo se skriptu nikdy nedostane do ruky,
protože se používá už přihlášený profil.

**URL z IG/FB CDN jsou podepsané a vyprší** (řádově hodiny) — stahuj hned.
403 nebo 410 při stahování znamená vypršelý podpis, ne chybu skriptu:
seber URL znovu.

Pořadí zdrojů podle výtěžnosti:

1. **Mapy.cz → Panorama** — příjezdovka, podhradí, parkování, šířka cesty.
   Nenahraditelné pro produkční posouzení přístupu. Vrstva Letecká + historická
   letecká (50. léta) ukáže, co v okolí přibylo. GPS je v URL → `high`.
2. **Instagram → místo, ne hashtag** — geotag, řadit podle nejnovějších.
   Dá aktuální stav, sezónu, davy, lešení. → `high`.
3. **Facebook** — oficiální stránka správce + místní obecní skupina, filtr
   Fotky. Jediný zdroj pro akce a probíhající rekonstrukce. → `high`.
4. **Rajče (rajce.idnes.cz)** — alba nejsou indexovaná v Google, hledat
   přímo na webu. Silné na interiéry z prohlídkových tras, které na Commons
   chybí. Preferuj alba s rokem v názvu. → `medium`.
5. **Google Maps → fotky návštěvníků** — řadit podle nejnovějších; parkování,
   přístup, zázemí.

## Ukládání

Do složky lokace:

```
<slug>_commons_01.jpg      z vrstvy 1
<slug>_mapy_pano_01.png    screenshot z vrstvy 3
photos.csv                 jeden řádek na fotku
chrome_tier.md             checklist, co ještě projít ručně
```

`photos.csv` sloupce:

```
soubor, zdroj, titul, page_url, direct_url, full_url, autor, licence,
datum, px, lat, lon, confidence_mista, motiv, poznamka
```

`motiv` doplň ručně podle 15 master motivů skillu — to je to, co pak váže
fotku na scénu v decku.

## Pravidla

- **confidence_mista: high** jen když GPS sedí na fotku (EXIF geotag,
  Mapy.cz panorama se souřadnicí v URL, IG/FB geotag). Když je GPS zděděná
  z Wikidat entity, je to `medium` — skript to tak i zapisuje.
- **Do klientského decku jen vrstva 1.** Commons fotky mají licenci
  ve `photos.csv` a použijí se s uvedením autora. Fotky z IG / FB / Rajče /
  Google Maps jsou **interní scoutovací reference** — bez svolení autora
  do decku nepatří.
- **Nikdy nevymýšlet URL.** Když vrstva 1 nic nevrátí a vrstva 3 ještě
  neproběhla, napiš do karty "fotky: ověřit scoutingem" + konkrétní krok,
  ne odhadnutý odkaz.
- **Rate limit** — skript už řeší (0,2 s mezi dotazy, dávky po 50, User-Agent).
  Neparalelizovat.
