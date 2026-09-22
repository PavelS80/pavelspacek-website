# Katalog zdrojů — kde hledat lokace a fotky CZ/SK

⚠️ **no web verification** — tenhle katalog vznikl bez možnosti weby ověřit
(egress policy session blokovala i Wikimedia). URL vzory u zdrojů označených
`ověřit` jsou z paměti, ne ze živého ověření. Než se na odkaz v decku odvoláš,
otevři ho. Nikdy nelep do decku URL konkrétní fotky, které jsi neviděl.

Sloupec **Licence**: `volná` = jde do klientského decku s uvedením autora ·
`reference` = jen interní scouting, do decku bez svolení autora ne.

---

## Vrstva 1 — strojově čitelné, volné licence

### Wikidata
`https://www.wikidata.org/wiki/Q940492` · API `/w/api.php`

Páteř identifikace. Dá **GPS (P625)**, odkaz na **Commons kategorii (P373)**,
hlavní foto (P18), správní zařazení (P131). Bez GPS nezačínej — váže se na ni
všechno ostatní (Mapy.cz, Google Maps, výpočet vzdálenosti od Prahy/Bratislavy).

Hledání: `action=wbsearchentities&search=Hrad+Bouzov&language=cs`
Licence: **volná** (CC0 na data) · Confidence GPS: **high**

### Wikimedia Commons
`https://commons.wikimedia.org/wiki/Category:Bouzov_Castle`

Jediný zdroj s **volnou licencí a scoutovacím rozlišením** (běžně 4000–6000 px).
Kategorie mají podkategorie — interiéry bývají zvlášť. Občas i 360° panoramata.

Automatizuje `scripts/fetch_commons_photos.py`.
Licence: **volná**, autor a licence jdou do `photos.csv` · Confidence: **high**
při EXIF geotagu, jinak medium.

**Pokrytí podle motivu** (odhad, confidence medium):
hrady a zámky výborné · historická města velmi dobré (zanoř `--depth 2`) ·
mlýny a skanzeny střídavé · lesy, potoky, cesty slabé (kategorie jsou na úrovni
CHKO) · prázdné domy a industriál bez jména prakticky nula.

---

## Vrstva 2 — český a slovenský web

### hrady.cz — `ověřit`
Rozsáhlá databáze hradů, zámků a zřícenin s uživatelskými galeriemi a popisem
přístupu. Silné na **zříceniny a méně známé objekty**, které Commons nemá.
Licence: **reference** · Confidence místa: high (objekt má vlastní stránku)

### turistika.cz
Články s fotogaleriemi, často **letecké záběry a tip na vyhlídkový bod** nad
lokací — přesně to, co Commons nemá a co scout potřebuje ("odkud to fotit").
Hledání: fulltext na webu podle jména lokace.
Licence: **reference** · Confidence: medium

### denik.cz — regionální deníky
`https://www.denik.cz/tag/<lokalita>.html` — `ověřit` přesný tvar tagu.

Nečekaně dobrý **stahovatelný** zdroj: stránka vypisuje přímé URL obrázků
z `g.denik.cz`, takže jdou stáhnout i bez prohlížeče. Silné na akce
(historické slavnosti, festivaly), rekonstrukce a aktuální stav.
Licence: **reference** · Confidence: medium (místo z titulku článku)

### kudyznudy.cz — `ověřit`
CzechTourism. Oficiální fotky, otevírací doba, sezónnost, přístupnost.
Licence: **reference** · Confidence: high

### zanikleobce.cz — `ověřit`
Zaniklé obce, opuštěné a zbořené objekty, historické srovnávací fotky.
**Jediný systematický zdroj pro motiv "prázdný dům / opuštěný objekt"**, kde
Commons i Instagram selhávají.
Licence: **reference** · Confidence: high

### Weby správců
- **NPÚ** `https://www.npu.cz` — státní hrady a zámky ČR. Nejspolehlivější na
  interiéry, otevírací dobu a **koho oslovit ohledně natáčení**.
- **Pamiatkový úrad SR** `https://www.pamiatky.sk` — `ověřit`
- **Lesy ČR**, **ŠOP SR** — správci lesních a chráněných ploch.
- **Obecní weby** — u lokací mimo NPÚ často jediný kontakt.

Licence: **reference** (na dotaz často dají tiskové fotky) · Confidence: high

### Film commissions
- **Czech Film Commission** `https://www.filmcommission.cz` — má vlastní
  databázi lokací a kontakty na majitele. `ověřit` aktuální adresu databáze.
- **Slovak Film Commission** — `ověřit`

Nejcennější ne kvůli fotkám, ale kvůli **film-friendly track recordu
a kontaktům**. Confidence: high

---

## Vrstva 3 — Chrome s přihlášením

**Nejde v cloudu ani v chatu.** Vyžaduje prohlížeč uživatele s jeho účty.
Nástroje: `scripts/chrome_scout.py`, `scripts/console_harvest.js`.
Pravidla a postup: `references/foto_zdroje.md`.

Pořadí podle výtěžnosti:

### 1. Mapy.cz — Panorama + letecká
`https://mapy.cz/zakladni?pano=1&x=<lon>&y=<lat>&z=17`
`https://mapy.cz/zakladni?base=ophoto&x=<lon>&y=<lat>&z=17`
**Pozor: `x` je zeměpisná délka, `y` šířka** — opačně, než se čeká.

Nenahraditelné pro produkci: **příjezdová cesta, šířka silnice, parkování,
podhradí z úrovně očí**. Historickou leteckou (50. léta) přepni ve vrstvách
v UI — id vrstvy nehádej.

Bez přihlášení, plně automatizovatelné: `chrome_scout.py --mapy <lat>,<lon>`
Licence: **reference** (screenshot) · Confidence: **high** (souřadnice v URL)

### 2. Instagram — místo, ne hashtag
Hledat název lokace a zvolit **místo (geotag)**, ne hashtag. Řadit podle
nejnovějších.

Dá to, co žádný jiný zdroj: **aktuální stav, sezóna, davy, lešení,
rekonstrukce**. Hashtag míchá lokace dohromady — geotag ne.
Licence: **reference** · Confidence: **high** (geotag)

### 3. Facebook
Oficiální stránka správce (NPÚ / obec / majitel) + **místní obecní skupina**,
filtr Fotky. Jediný zdroj pro akce, interiéry a probíhající rekonstrukce.
Obecní skupiny mají fotky, které nikde jinde nejsou.
Licence: **reference** · Confidence: high

### 4. Rajče — `https://www.rajce.idnes.cz`
Alba **nejsou indexovaná v Google** — hledat přímo na webu. Silné na
**interiéry z prohlídkových tras**, které na Commons chybí. Preferuj alba
s rokem v názvu.
Licence: **reference** · Confidence: medium

### 5. Google Maps — fotky návštěvníků
`https://www.google.com/maps/search/?api=1&query=<lat>,<lon>`
Řadit podle nejnovějších. Dobré na **parkování, přístup, zázemí, toalety** —
produkční věci, co nikdo nefotí hezky.
Licence: **reference** · Confidence: high

---

## Pořadí, když je málo času

1. Wikidata → GPS a Commons kategorie (1 minuta, skriptem)
2. `fetch_commons_photos.py` → 20–30 fotek s volnou licencí
3. Mapy.cz panorama → příjezd a měřítko (skriptem, bez přihlášení)
4. Instagram geotag → aktuální stav a sezóna (ručně, 5 minut)
5. Zbytek jen když lokace postoupí do shortlistu

První tři kroky jsou automatické a dají 80 % toho, co scout potřebuje pro
rozhodnutí "jet se tam podívat, nebo ne".
