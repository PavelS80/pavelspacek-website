# Plán: Location Search — databáze + internet

**Autor podkladu:** Claude Code · **Datum:** 2026-09-18 · **Stav:** návrh k schválení
**Zadavatel:** Pavel Špaček / FILM HUNTERS s.r.o.

---

## 1. Cíl a hranice

**Cíl.** Postavit vyhledávací systém pro location scouting v ČR/SR, který z textové
nebo obrazové reference najde **nové, dosud nepoužité lokace** — a to ze dvou zdrojů:
(a) vlastní databáze, (b) internet. Výstup musí být filmařsky použitelný, ne
"hezké obrázky".

**Hranice (co systém NEDĚLÁ).**
- Nenahrazuje fyzický scout. Vrací kandidáty k prověření, ne potvrzené lokace.
- Neobchází technická ochranná opatření webů (žádná rotace proxy, žádné
  podvrhování fingerprintu, žádné obcházení CAPTCHA). Důvod v §8.
- Negeneruje fotky. Pouze nachází, hodnotí a eviduje cizí fotky s licenční stopou.

---

## 2. Diagnóza současného stavu

Prošel jsem `~/.claude/skills/synced/.../location-research-czsk/`. Co jsem našel:

| # | Nález | Závažnost |
|---|---|---|
| 1 | `SKILL.md` odkazuje na `references/podhradi.md`, `hrad.md`, `mlyn.md`, `les_potok.md`, `cesta_krajina.md` — **ani jeden z těchto souborů neexistuje**. Reálně existuje jen `lokace_database.md`. | **Vysoká** — skill posílá model na neexistující soubory |
| 2 | Příklad *Oblazy mlýn* ve `scoring_rubric.md` má Total 7.2 a je označen **TOP**, ale rubrika definuje TOP jako ≥ 8.0. Podle vlastní definice je to **WILDCARD**. | Střední — rozporuplný příklad kazí kalibraci |
| 3 | `SKILL.md` volá `mcp__cowork__present_files`. Tento nástroj v Claude Code session neexistuje (je jen v Cowork). | Střední — v Claude Code skill na konci selže |
| 4 | Váhy rubriky (30/25/20/10/15) a vzorec `(Vis×3 + Prak×2.5 + Aut×2 + Dost×1 + Risk×1.5)/10` **sedí** — ověřeno přepočtem obou příkladů. | OK |
| 5 | Žádný samostatný "web search skill" v synced skills **není**. Co existuje, jsou vestavěné nástroje `WebSearch` / `WebFetch`. | Upřesnění zadání |

**Body 1–3 opravím jako první věc, nezávisle na zbytku plánu.**

---

## 3. Architektura: tři komponenty, ne dvě

Navrhoval jsi dva skilly (databáze / internet). Souhlasím s rozdělením, ale
přidávám třetí, sdílenou vrstvu — a to z jednoho konkrétního důvodu:

> Celá hodnota systému stojí na tom, že lokace nalezená v databázi a lokace
> nalezená na internetu jsou **srovnatelné jedním skóre**. Pokud bude rubrika
> a fotografický standard existovat ve dvou kopiích, do tří měsíců se rozejdou
> a shortlist přestane dávat smysl.

```
skills/
├─ location-core/          ← SDÍLENÝ ZÁKLAD (žádný vlastní workflow)
│   ├─ scoring_rubric.md      5+1 dimenzí, vzorec, štítky
│   ├─ photo_standard.md      co je dobrá fotka (§6) + exempláře
│   ├─ karta_lokace.md        schéma karty + JSON schema
│   ├─ html_template.md       deck šablona
│   └─ source_policy.md       licenční tiery (§8)
│
├─ location-db/            ← SKILL 1: z databáze (offline, rychlý)
│   └─ lokace_database.md     + chybějící motivové soubory
│
└─ location-web/           ← SKILL 2: z internetu (online, pomalý)
    ├─ sources.md             katalog zdrojů (§5)
    ├─ query_playbook.md      jak se ptát (§7)
    └─ harvest/               skripty: fetch, dedup, grade
```

**Technická poznámka k sdílení.** Synced skills z claude.ai se rozbalují vedle
sebe do jedné složky, takže `../location-core/references/…` funguje — ale je to
křehké (stačí, že se nesynchronizuje jeden skill). Proto navrhuji:

- **Zdroj pravdy = tento git repo** (`skills/`), verzovaný.
- Malý build skript vyrenderuje **self-contained** složky skillů (core se
  zkopíruje do obou). Žádné cross-skill odkazy za běhu.
- Jedna změna rubriky → `npm run build:skills` → oba skilly aktuální.

---

## 4. Prohlížeč: Safari vs Chrome — verdikt

Ptal ses, co je pro mě snazší. Odpověď je jednoznačná a stojí na faktech
ověřených v tomto prostředí:

| Varianta | Kde běží | Jak to řídím | Přihlášení | Verdikt |
|---|---|---|---|---|
| **Chromium + Playwright** | tento cloud kontejner | plně skriptovatelné, paralelní, levné | ❌ žádné, datacentrové IP | **Hlavní dráha (A)** |
| **Claude in Chrome** (rozšíření) | tvůj Mac, tvůj reálný Chrome | poloautomaticky, po jednom tabu | ✅ tvoje reálné účty, domácí IP | **Doplňková dráha (B)** |
| **Safari** | jen macOS | ❌ nemám pro něj žádný ovladač ani rozšíření; šlo by jen přes computer-use (screenshot + klikání) | ✅ | **Nepoužívat** |

**Safari vynech.** Není to preference, je to technické omezení: Safari nemá
rozšíření Claude ani driver, který bych mohl řídit. Jediná cesta by bylo slepé
klikání do screenshotů — nejpomalejší a nejkřehčí varianta ze všech.

Ověřeno v tomto kontejneru: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`,
`chromium-1194` + `chromium_headless_shell-1194` nainstalované, Node v22.22.2,
Python 3.11.15. (Pillow a imagehash zatím chybí — doinstalovat pro §6.)

### Dvoudráhový návrh

- **Dráha A — cloud Chromium (80 % objemu).** Otevřený web, veřejná API,
  realitní portály, filmové kanceláře, NPÚ, Mapy.com, Wikimedia, prázdné domy.
  Běží na pozadí, paralelně, klidně v noci, i jako týdenní cron.
- **Dráha B — tvůj přihlášený Chrome (20 % objemu, ale vysoká hodnota).**
  Instagram, Facebook skupiny, Airbnb, Booking, členské sekce. Rychlostí
  člověka, dávkově, když sedíš u Macu. Není to scraping — je to asistované
  procházení: ty jsi přihlášený uživatel, já čtu, co je na obrazovce, a ukládám
  odkazy a metadata.

---

## 5. Zdroje — katalog

Tvůj seznam beru celý. Doplňuji o to, co mi v něm chybělo — a tam je podle mě
největší okamžitý zisk (řádky označené ⭐).

### Tier 0 — location libraries a filmové databáze ⭐ (doplněno 2026-09-18)

Tohle je kategorie, kterou jsem v první verzi plánu podcenil. Jsou to weby
postavené přímo pro natáčení — ne realitní inzeráty, ne turistické fotky.

**A. Location agentury / libraries** — majitel už *souhlasil s natáčením*.
Fotky jsou dělané záměrně jako lokační: široké, čtou prostor, s praktickými údaji
(výška stropu, proud, parkování). Přesně to, co rubrika v §6 chce.

| Web | Co má |
|---|---|
| `locationworks.com` | podle vlastního tvrzení nejstarší agentura na světě a první online library; jeden z nejrozsáhlejších katalogů |
| `1st-option.com` | Londýn + UK, luxusní lokace, multi-service |
| `shootfactory.co.uk` | Londýn + UK, velké portfolio |
| `lavishlocations.com` | 1 500+ lokací UK |
| `locationsdirect.co`, `filmlocations.co.uk` | další UK library |
| **CZ:** Lokacni.cz, Czech Film Locations, Finders | viz Tier 1 |
| Giggster, Peerspace, Splacer | marketplace model, roste i v EU |

**Proč je to lepší než reality:** u realitního inzerátu musíš majitele teprve
přesvědčit. Tady už řekl ano. A fotí se tam na prostor, ne na prodej —
odpadá ultra-wide zkreslení a staging z §6.3.

**B. Databáze filmových míst** — kde se co natáčelo.

| Web | Co má |
|---|---|
| **`filmovamista.cz`** ⭐ | 2 200+ filmů a seriálů, **39 000+ identifikovaných míst natáčení** z ~50 000 záběrů, interaktivní mapa. Od 2007. Pro ČR unikát. |
| `movie-locations.com`, FilmingMap, latlong.net, IMDb | mezinárodní |
| "Filmed in…" sekce regionálních film offices | model Kent Film Office / Filming in England |

**Dvojí užitek — a druhý je cennější.** První je inspirace. Druhý:
**signál vyčerpanosti.** Když je lokace na filmovamista.cz u dvaceti titulů, je
divácky spálená. Do rubriky proto přidat inverzní faktor — *jak moc je to
okoukané*. Pro "hledáme nové varianty" je to přesně ten filtr, co chybí.

### Tier 1 — profesionální lokační databáze ⭐ (největší přidaná hodnota)

Tohle jsou databáze postavené přesně pro tvůj účel, s GPS, kontaktem na majitele
a často i s informací o film-friendly historii. Veřejně dostupné.

| Zdroj | Co obsahuje | Dráha |
|---|---|---|
| **12 regionálních filmových kanceláří ČR** — každá má vlastní veřejnou databázi lokací | hrady, města, industriál, příroda; s kontaktem a povolovacím kontextem | A |
| `strednicechyfilm.cz/lokace` | Střední Čechy, nový web (spuštěn 2026) | A |
| `eastbohemiafilmoffice.cz`, `filmhk.cz`, `filmplzen.cz`, `zlinfilmoffice.cz` | další kraje | A |
| **Czech Film Commission** adresář | ~70 000 fotek lokací (Czech Film Locations), Lokacni.cz 100 000+ lokací | A |
| **NPÚ Památkový katalog** — otevřená data | ÚSKP: všechny kulturní památky ČR, s fotkami a GPS, strojově čitelné | A |

### Tier 2 — otevřená data a mapy (licenčně čisté)

| Zdroj | Poznámka | Dráha |
|---|---|---|
| **Mapy.com REST API** | oficiální API, registrace klíče zdarma, 250 000 kreditů/měsíc v Basic plánu — geokódování, POI, panorama | A |
| **Mapy.com uživatelské fotky** | to, co jsi zmiňoval; přes web, ne přes API | A |
| **Wikimedia Commons API (geosearch)** | `list=geosearch` + `prop=imageinfo` → fotky v okruhu N metrů od GPS, **s licencí v metadatech** | A |
| **Google Maps / Street View / photospheres** | uživatelské fotky pod hrady, jak píšeš; pozor na licenci Places Photos | A/B |
| **Mapillary, OpenStreetMap** | street-level fotky, CC-BY-SA | A |

### Tier 3 — reality (prodej i pronájem)

Tvůj seznam + rozšíření. **Klíčový vhled:** luxusní segment má systematicky
nejlepší fotky (profesionální fotograf, prázdný prostor, denní světlo).

- **Vysoký segment:** Svoboda & Williams, Luxent, Lexxus, Engel & Völkers Praha,
  Christie's International Real Estate CZ, Prague Estate
- **Objem:** Sreality, Bezrealitky, Reality iDNES, Bazoš Reality, RealHit, Realingo
- **Komerční / industriál:** 108 Real Estate, CBRE, Cushman & Wakefield, Colliers,
  Knight Frank, JLL, Procházka & Partners, Naxos
  *(tento blok se překrývá s tvým skillem `reality-kladno` — sdílet harvester)*
- **Dražby ⭐** — sem se dostanou objekty, které nikde jinde nejsou: prázdné
  zámky, areály, brownfieldy. `exdrazby.cz`, `drazby.net`, `portaldrazeb.cz`,
  `okdrazby.cz`, `verejnedrazby.cz`
- **CzechInvest brownfieldy ⭐** — národní databáze průmyslových areálů

### Tier 4 — krátkodobé pronájmy (Airbnb ekosystém)

Chceš "velký průzkum všech firem, které mají pod sebou 20–200 bytů v Praze".
**Nebudu ti vymýšlet seznam jmen** — riziko konfabulace je tu vysoké. Místo toho
navrhuji metodu, jak ten seznam spolehlivě sestavit:

1. Na Booking.com má většina takových firem v profilu pole *"Spravováno:"* /
   *"Managed by"* → projít nabídku Praha, vytěžit správce, seskupit podle četnosti.
2. Na Airbnb totéž přes profil hostitele (*"Superhost · 137 nabídek"*).
3. AirDNA / obdobné tržní přehledy — žebříček největších správců v Praze.
4. Živnostenský a obchodní rejstřík: NACE 55.20 / 68.20 v Praze, křížem
   na weby firem.
5. Ruční doplnění: většina velkých správců má vlastní web s galerií (tam jsou
   fotky v lepším rozlišení než na Airbnb a bez ořezu).

**Výstup fáze:** tabulka `správce → počet jednotek → vlastní web → kvalita fotek`.
Realisticky 30–60 firem pro Prahu a okolí.

### Tier 5 — komunita a urbex

Upřesnění: **Instagram nemá skupiny** — má účty, hashtagy a "místa". Skupiny má
Facebook. Podle toho se liší i strategie.

- **Facebook skupiny** — hledat vzorem: *"urbex"*, *"opuštěná místa"*,
  *"zapomenutá místa"*, *"krásy Česka"*, *"zaniklé obce"*, *"staré fotografie
  \<město\>"*. Konkrétní názvy neuvádím zpaměti — ověříme při první dávce dráhy B.
- **Instagram** — hashtagy `#urbexcz`, `#opustenamista`, `#prazdnedomy`,
  `#ceskarepublika` + kurátorské účty. Pozor: hashtagy jsou dnes slabé,
  hodnotnější je najít 20–30 dobrých účtů a sledovat je.
- **prazdnedomy.cz ⭐** — databáze prázdných a chátrajících domů s historií,
  ~7 600 objektů (k 2/2023), z toho ~3 700 v kategorii prázdné / k záchraně,
  s fotkami a časovou osou. **Pro tvůj obor mimořádný zdroj.**
- **zanikleobce.cz ⭐** — zaniklé obce a objekty, historické i současné fotky
- **fotohistorie.cz** — dobové fotografie míst
- **hrady.cz, turistika.cz, kudyznudy.cz** — velké fotobanky míst

### Tier 6 — architektura

- **archiweb.cz** (tvůj tip) — moderní architektura, redakčně vybrané fotky
- **earch.cz**, **Česká cena za architekturu** (databáze přihlášených děl),
  **Grand Prix Architektů** — archivy s nejlepší fotografií a s uvedeným autorem
- **Slavné vily / Prostor pro architekturu / Kruh** — starší moderna
- ⭐ Pro **starou** architekturu je Tier 1 (NPÚ) silnější než architektonické
  weby — má úplnost, ne kurátorský výběr.

---

## 6. Fotografický standard — jádro celé věci

Tohle je podle mě nejdůležitější část a zároveň ta, kde se rozhoduje, jestli bude
systém k něčemu. Popsal jsi to přesně: *"často stáhneš úplně debilní fotky"*,
*"zajímají mě široké fotky, fotka, která ti dá přehled o prostoru"*.

### 6.1 Tvrdé filtry (běží první, bez modelu, zadarmo)

Odfiltrují odhadem 50–70 % šumu dřív, než se na to cokoli podívá:

- long edge < 1200 px → **zahodit** (thumbnail, do decku nepoužitelné)
- poměr stran < 0.5 nebo > 3.0 → **zahodit** (bannery, pruhy)
- název souboru / `alt` / CSS třída obsahuje: `pudorys`, `floorplan`, `plan`,
  `mapa`, `logo`, `watermark`, `stitek`, `qr`, `avatar` → **zahodit**
- perceptuální hash (pHash, Hamming ≤ 6) → **deduplikovat** napříč všemi zdroji
- detekovaný vodoznak fotobanky (Shutterstock / Alamy / iStock vzor) → **zahodit**

### 6.2 Rubrika kvality fotky — 5 os, stejný tvar jako tvá lokační rubrika

| Osa | Váha | 1–3 | 4–6 | 7–10 |
|---|---|---|---|---|
| **Z — Záběr** | 30 % | detail (klika, váza, umyvadlo, obličej, jídlo) | část prostoru, jeden roh | celý prostor čitelný: stěny→strop, nebo celá fasáda s kontextem |
| **P — Čitelnost prostoru** | 25 % | nepoznáš geometrii | tušíš dispozici | jasné kde jsou dveře, okna, východy, co navazuje |
| **F — Filmová hodnota** | 20 % | plochá, bez charakteru | použitelná | čte se jako místo; textura, vrstvy hloubky, existuje kamerová pozice |
| **S — Světlo** | 15 % | blesk, vypálená okna, noční HDR kaše | průměrné | čitelný směr denního světla, okna v záběru |
| **C — Čistota rámu** | 10 % | vodoznak, lidi, rybí oko, staging přes celý prostor | drobné rušivé prvky | čistý rám |

```
Q = (Z×3 + P×2.5 + F×2 + S×1.5 + C×1) / 10
```

**Brány:**
- `Z ≤ 3` → **automatické zamítnutí**, bez ohledu na zbytek. Detail není lokace.
- `Q ≥ 7.0` → do decku
- `Q 5.0–6.9` → interní reference (víme, že místo existuje; fotku nepoužijeme)
- `Q < 5.0` → zahodit

### 6.3 Typ fotky — co který zdroj systematicky zkresluje

Tohle je vhled, který stojí za to zakódovat: **každý zdroj lže jinak** a je
potřeba to vědět dřív, než pojedeš 200 km na scout.

| Typ | Odkud | Co říká pravdivě | V čem klame |
|---|---|---|---|
| **recce / scout** | filmové kanceláře, lokační agentury | geometrie, reálné světlo, přístup | často nízká kvalita, staré |
| **realitní ultra-wide** | Sreality, S&W, Luxent | úplné pokrytí prostoru, dispozice | zkreslení objektivu (prostor vypadá 2× větší), HDR falešné světlo, staging |
| **Airbnb / Booking** | krátkodobé pronájmy | obydlený stav, reálné vybavení | přeexponované, teplý filtr, těsné ořezy |
| **turistický snapshot** | Mapy.com, Google, FB skupiny | reálné světlo, počasí, sezóna, davy | náhodná kompozice, lidi, nízké rozlišení |
| **editorial architektura** | Archiweb, ČCA, earch | nejlepší kompozice, čistý prostor | jen "hero" úhly — neukáže, co je za zády kamery; prázdno ≠ realita |
| **dron** | YouTube, IG | kontext, okolí, příjezdové cesty | není to úroveň očí; neřekne nic o interiéru |
| **archiv / historické** | fotohistorie, zaniklé obce | period reference | **neaktuální stav — vždy ověřit, že objekt ještě stojí** |

Každá sklizená fotka dostane tento štítek. Do decku jde vždy **mix typů** —
jedna realitní (dispozice) + jedna turistická (reálné světlo) řekne víc než tři
editorial fotky.

### 6.4 Učicí smyčka — co to reálně je

Buď říkám rovnou: **skill se nedá dotrénovat.** Co udělat lze a co funguje:

1. **Seed.** Z tvých schválených decků vyberu 12 fotek, které prošly, a 12, které
   jsi zamítl. Ke každé napíšu skóre na 5 osách + jednu větu proč. To je
   `photo_standard.md` — kurátorovaný few-shot korpus.
2. **Zpětná vazba.** Každé tvé ANO/NE v session se zapíše do `feedback.jsonl`
   (url, hash, tvůj verdikt, skóre které předpověděl model).
3. **Rekalibrace.** Po ~50 záznamech přegeneruji `photo_standard.md` a **změřím
   shodu** — v kolika % se model trefil do tvého verdiktu. To je jediné poctivé
   měřítko, jestli se to zlepšuje.

Cílová shoda: **> 80 % po třetí rekalibraci.** Pokud se tam nedostaneme,
rubrika je špatně a přepíšeme ji, ne ji budeme dolaďovat.

---

## 7. Jak to bude hledat — pipeline

```
BRIEF (text nebo referenční obrázek)
   │
   ├─1─ Vizuální slovník ──────────────────────────────────────────┐
   │    z reference vytěžit: materiál · epocha · měřítko ·         │
   │    typ prostoru · světlo · půdorysný typ                      │
   │    ⚠ KLÍČOVÉ: přeložit do ČESKÝCH hledacích termínů.          │
   │    "brutalist stairwell" → "brutalistní schodiště",           │
   │    "panelák", "Transgas", "Kotva" — anglické dotazy           │
   │    na českých webech nenajdou NIC.                            │
   │
   ├─2─ Vyloučit známé ───────────────────────────────────────────┤
   │    odečíst vše, co už je v lokace_database.md.                │
   │    Chceš NOVÉ varianty, ne Křivoklát po čtyřicáté.            │
   │
   ├─3─ Fan-out ──────────────────────────────────────────────────┤
   │    paralelní subagenti, jeden na tier zdrojů (§5).            │
   │    Dráha A automaticky, dráha B do fronty "k projití u Macu". │
   │
   ├─4─ Sklizeň → dedup → hodnocení fotek ────────────────────────┤
   │    tvrdé filtry (§6.1) → pHash dedup → rubrika Q (§6.2)       │
   │    → štítek typu fotky (§6.3)                                 │
   │
   ├─5─ Geo-resolve ──────────────────────────────────────────────┤
   │    každý kandidát MUSÍ dostat GPS (Mapy.com API).             │
   │    Bez GPS = degradovat, ne zahodit.                          │
   │    → vzdálenost a dojezd z Prahy                              │
   │
   ├─6─ Skóre lokace ─────────────────────────────────────────────┤
   │    stávající rubrika (Vis/Prak/Aut/Dost/Risk)                 │
   │    + NOVÁ 6. dimenze: DOSTUPNOST OBJEKTU                      │
   │      prodej/pronájem = majitel motivovaný pustit dovnitř      │
   │      prázdný/chátrající = levné, ale právně a bezpečnostně    │
   │        rizikové                                               │
   │      provozovaný hrad = drahé, omezené, ale jisté             │
   │
   └─7─ Výstup ───────────────────────────────────────────────────┘
        HTML deck (stávající formát) + sources.json s licenční stopou
```

**Proč 6. dimenze.** Tvůj současný model hodnotí, jak lokace vypadá a jak se na
ní točí. Nehodnotí ale to, co je u internetového hledání nejcennější: *jak snadné
je se tam vůbec dostat*. Byt na prodej je pro scout dostupnější než soukromý
zámek — majitel chce ukázat interiér. To je informace, kterou databáze nemá
a internet ano.

---

## 8. Právní a licenční vrstva

Tohle není formalita — jde o firmu, která pod deck podepisuje jméno.

**Licenční tiery. Každá fotka dostane jeden.**

| Tier | Zdroje | Použití |
|---|---|---|
| **T1 — volné** | Wikimedia Commons (CC), NPÚ otevřená data, vlastní fotky | do klientského decku, s uvedením autora |
| **T2 — reference** | realitní inzeráty, databáze filmových kanceláří, uživatelské fotky Mapy/Google | **jen interní recce**; v decku max. náhled s odkazem na zdroj |
| **T3 — jen odkaz** | Instagram, Facebook, Airbnb, Booking, editorial architektura | **nestahovat hromadně**; uložit URL + interní screenshot; pro reálné použití oslovit autora |

**Kde vedu čáru a proč.**
- Automatizovaný sběr z Instagramu, Facebooku, Airbnb a Booking.com **porušuje
  jejich podmínky užití.** (jistota: vysoká) Proto dráha B = ty přihlášený,
  rychlostí člověka, já čtu obrazovku. To je procházení, ne scraping — rozdíl,
  který je obhajitelný.
- Nebudu stavět rotaci proxy, podvrhování fingerprintu ani obcházení CAPTCHA.
  Tři důvody, v tomto pořadí: (1) rozbije se to při každé změně na druhé straně
  a budeš platit za údržbu; (2) porušuje to ToS; (3) u firmy, která to dává
  klientům, je to reputační a právní riziko neúměrné zisku.
- `robots.txt` respektovat, rate-limit držet, výsledky cachovat — ať se
  nechodí dvakrát pro totéž.
- **GDPR:** fotky míst jsou v pořádku. Fotky s identifikovatelnými lidmi a
  profily autorů jsou osobní údaje — do decku nepatří.

---

## 9. Roadmap

| Fáze | Obsah | Výstup |
|---|---|---|
| **F0** | Oprava chyb z §2 (chybějící soubory, rozporuplný příklad, `present_files`) | funkční stávající skill |
| **F1** | `location-core`: rubrika, **fotografický standard se seedem z tvých decků**, schéma karty, HTML šablona, licenční politika | sdílený základ |
| **F2** | `location-db`: refaktor stávajícího skillu na core; doplnění databáze | skill 1 hotový |
| **F3** | `location-web` **dráha A**: Mapy.com API, Wikimedia, NPÚ, 12 filmových kanceláří, prázdné domy, reality, dražby | skill 2, automatická část |
| **F4** | `location-web` **dráha B**: asistované procházení IG / FB / Airbnb / Booking + mapování správců krátkodobých pronájmů (§5 Tier 4) | skill 2, ruční část |
| **F5** | Učicí smyčka + měření shody; **týdenní cron "nové lokace na trhu"** ve stylu `reality-kladno` | provozní režim |

F1 je kritická cesta. Bez fotografického standardu je zbytek jen generátor šumu.

---

## 10. Rizika a neznámé

| Riziko | Dopad | Co s tím |
|---|---|---|
| Fotografický standard postavený jen na mých předpokladech, ne na tvých schválených výběrech | **Vysoký** — celý systém míjí cíl | Blokující: potřebuji seed (§11) |
| IG/FB/Airbnb zpřísní přístup i pro přihlášené procházení | Střední | Dráha A nese 80 % hodnoty a na nich nezávisí |
| Mapy.com API limit 250 000 kreditů/měsíc | Nízký | Pro tento objem bohatě stačí; cachovat |
| Duplicita s `reality-kladno` harvesterem | Nízký | Sdílet kód pro realitní portály |
| Databáze filmových kanceláří můžou být za registrací | Střední | Ověřit v F3; část je veřejná (Střední Čechy ano) |
| Konfabulace názvů FB skupin a správců bytů | Střední | Zásada: **žádné jméno neuvedu, dokud ho neuvidím**; §5 Tier 4 je proto metoda, ne seznam |

**Neověřeno:** konkrétní názvy FB skupin, konkrétní správci krátkodobých
pronájmů, dostupnost databází filmových kanceláří bez registrace, existence
oficiálního API u Sreality. Vše se ověří v F3/F4 přímým procházením.

---

## 11. Otevřená otázka — blokuje F1

Zodpovězeno — viz §12. Zbývá potvrdit, jestli HTML decky existují lokálně na Macu,
nebo jestli jedeme ze seed setu nalezeného na Drivu.
potřebuji **seed set**. Ptám se na jednu věc: *co z toho máš po ruce?*

Varianty: hotové decky (LONGLIST/SHORTLIST HTML) · složka fotek, které prošly ·
odmítnuté návrhy (ty jsou cennější než schválené) · konkrétní lokace jako
referenční příklad · nemám nic → postavím standard z první verze a doladíme za
běhu.

---

## 12. Seed set — co je reálně k dispozici (ověřeno 2026-09-18)

Odpověď zněla "hotové decky (HTML)". **Na Google Drivu žádné HTML decky nejsou** —
`LONGLIST_*.html` ani `SHORTLIST_*.html` neexistují ani na Drivu, ani v tomto
kontejneru. Buď jsou lokálně na Macu, nebo zatím nevznikly. Co ale na Drivu je,
je pro seed **vhodnější**:

### A. Schválené výběry — pozitivní exempláře (nejvyšší hodnota)

Dokumenty, kde už proběhl výběr a šly ven klientovi:

| Soubor | Velikost | Proč je cenný |
|---|---|---|
| `Vraždy v kraji 2_vyber lokaci.pdf` | 67 MB | doslova "výběr lokací" — prošlo sítem |
| `Brothers Location summary 2205.pdf` | 41 MB | location summary pro produkci |
| `FAVORITE LOCATIONS - ALLEGRO CZ.pdf` | 33 MB | "favorite" = explicitní schválení |
| `004_VVK2_LOCATION_REŽIJNÍ_OBHLÍDKY 13.2.2026` | složka | režijní obhlídky = co prošlo až k režisérovi |

### A2. PDF prezentace na Drivu — úplný soupis (ověřeno 2026-09-18)

Prohledáno na PDF s fotkami. Pět nosných souborů, dohromady ~237 MB:

| Soubor | MB | Typ | ID |
|---|---|---|---|
| `Vraždy v kraji 2_vyber lokaci.pdf` | 67 | **výběr lokací** ⭐ | `12B8V7qx14I3Hb1w3gEW5uH3OeRanBv1D` |
| `Victura Scout Plan V4.pdf` | 50 | scout plan, finální | `17YscLyfQ8ckfm2u74aIik4zG2nvz_YFI` |
| `Victura Scout Plan V2.docx.pdf` | 46 | scout plan, raná verze | `1l9kveQ8wo8K-hGkzd5T68OabPmeN8Xte` |
| `Brothers Location summary 2205.pdf` | 41 | location summary | `16Q1u760YaOZt_hV_8mWMApOupG9cVTyq` |
| `FAVORITE LOCATIONS - ALLEGRO CZ.pdf` | 33 | **favorite** ⭐ | `18CKuj8KOAQ_T-ZpGlamabzo3IKp4qd__` |

**Řada Victura V2 → V3 → V4 je nejcennější kus celého seed setu.** V2 má 46 MB,
V3 jen 3 MB (zjevně jen text), V4 zase 50 MB. Diff mezi V2 a V4 ukáže,
**co z výběru vypadlo** — a to jsou negativní exempláře, které podle §12/C jinde
neexistují. Zpracovat prioritně.

Ostatní PDF (`VVK2_transport obhlidky`, `Režijní obhlídky PLÁN`, `Tech scout
schedule`) jsou desítky kB — jízdní řády a logistika, žádné fotky. Pro seed
nepoužitelné, ale jako vzor **výstupního formátu scoutovací trasy** (§9 master
promptu) se hodí.

### B. Vlastní recce fotky — baseline (~25 složek)

Pod jedním rodičem je ~25 složek `location scout DDMMYYYY`, uvnitř podsložky
pojmenované po lokaci. Příklad z `location scout 22022026`:
`Radovka_pod_Vinici_Litomerice` · `Dum_Smetanova_Litomerice` ·
`Byt_Palackeho_13_Litomerice`

Tohle je **ground truth toho, jak vypadá tvoje vlastní fotka z obhlídky** — jak
rámuješ prostor, co považuješ za hodné zdokumentování. Ideální kalibrace osy
**Z (Záběr)** a **P (Čitelnost prostoru)**.

⚠️ Rozlišit: recce fotka je *dokumentace*, ne *výběr*. Říká "takhle se fotí
prostor", neříká "tahle lokace je dobrá". Pozitivní exempláře proto z A, kalibrace
rámování z B.

### C. Negativní exempláře — chybí

To, co jsi zamítl, nikde uložené není. Vznikne až z první ostré dávky
z internetu: každé tvoje NE = negativní exemplář. Prvních ~30 zamítnutí bude mít
největší kalibrační hodnotu.

### Důsledek pro plán: dvě korekce

**1. Skill je přeperiodizovaný.** Master prompt i `lokace_database.md` jedou na
15 motivů, které jsou skoro výhradně hrad / mlýn / les / podhradí — dobový
a pohádkový film. Ale tvoje reálné čerstvé obhlídky jsou **byty, domy a měšťanská
zástavba v Litoměřicích**. `location-web` proto **nesmí zdědit dobovou
zaujatost** — motivová osa musí být otevřená: současný interiér, panelák,
kancelář, industriál, byt, ulice. Jinak bude systém hledat hrady, když
potřebuješ byt.

**2. Web skill je chybějící polovina tvého vlastního master promptu.**
V `MASTER_PROMPT_location_research_CZ_SK_v2.md`, bod 5, sis napsal:
*"žádný LLM ti nedá 200 živých URL referenčních fotek bez halucinací"* — a vyřešil
jsi to placeholdery `<!-- DOPLNIT FOTO -->`. To byl správný závěr pro model bez
internetu. **`location-web` ty placeholdery zaplní** — reálnými, ověřenými
fotkami s licenční stopou (§8). Tím se uzavírá smyčka, kterou jsi v v2 nechal
otevřenou.

---

## Zdroje ověřené k 2026-09-18

- Mapy.com REST API — https://developer.mapy.com/rest-api-mapy-cz/
- Wikimedia Commons Geosearch API — https://www.mediawiki.org/wiki/API:Geosearch
- NPÚ otevřená data ÚSKP — https://pamatkovykatalog.cz/openData
- Databáze lokací Střední Čechy — https://www.strednicechyfilm.cz/lokace/
- Prázdné domy — https://prazdnedomy.cz/domy/objekty/
- Czech Film Commission, adresář — https://filmcommission.gov.cz/en/directory/
