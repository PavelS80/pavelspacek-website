# Plán: Location Search — databáze + internet

**Autor podkladu:** Claude Code · **Datum:** 2026-09-18 · **Stav:** schváleno, F0–F2 kostra postavena (viz §13)
**Zadavatel:** Pavel Špaček / FILM HUNTERS s.r.o.

---

## 1. Cíl a hranice

**Rozsah: pouze Česká republika.** Slovensko je mimo zadání (upřesněno 2026-09-18).
Stávající skill `location-research-czsk` je CZ/SK — nové skilly SK nedědí: žádné
slovenské lokace, žádná vzdálenost od Bratislavy, dostupnost se měří jen z Prahy.

**Cíl.** Postavit vyhledávací systém pro location scouting v ČR, který z textové
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


### 4.1 ⛔ BLOKÁTOR: egress policy tohoto prostředí (ověřeno 2026-09-18)

Dráhu A jsem otestoval proti reálným zdrojům. **Neprojde ani jeden.**

```
000  filmovamista.cz        000  pamatkovykatalog.cz    000  api.mapy.com
000  lokacni.cz             000  prazdnedomy.cz         000  commons.wikimedia.org
000  strednicechyfilm.cz    000  sreality.cz
```

Diagnostika proxy: `gateway answered 403 to CONNECT (policy denial)` — na každý
z nich. Není to chyba ani ochrana cílového webu; je to **egress policy tohoto
cloudového prostředí**. Povolený je jen allowlist (npm, PyPI, crates, API
Anthropic). Totéž platí pro Chromium — jde přes stejnou proxy.

**Co z prostředí funguje:** `WebSearch` (jde přes Anthropic, ne přes egress),
Google Drive / Gmail / Kalendář, GitHub.
**Co nefunguje:** jakýkoli přímý HTTP request na české weby, Mapy.com API,
Wikimedia API, stahování fotek.

#### Důsledek — a je vážný

Dráha A, jak jsem ji navrhl v první verzi, **v tomto prostředí nejede.** Sběr
fotek z cloudu je nemožný, dokud se nezmění síťová politika. To není detail:
padá tím ~80 % objemu, který jsem na dráhu A plánoval.

#### Dvě cesty ven

**1. Změnit síťovou politiku prostředí** (doporučeno). Politiku sis vybral při
zakládání prostředí a jde změnit — buď povolit konkrétní domény z §5, nebo
volnější režim. Dokumentace: `code.claude.com/docs/en/claude-code-on-the-web`.
Po změně dráha A funguje podle původního návrhu. **Tohle je jediná změna, která
odemkne automatický sběr.**

**2. Těžiště přesunout na dráhu B** (funguje hned). Claude in Chrome na tvém
Macu — tvůj reálný prohlížeč, tvoje přihlášení, tvoje IP. Žádná egress proxy
v cestě. Pomalejší a vázané na to, že sedíš u počítače, ale **běží dneska.**

Do rozhodnutí platí: **dráha B je primární, ne doplňková.** Pořadí fází v §9 se
tím nemění — F1 (fotografický standard) stojí na PDF z Drivu, a Drive dostupný
je. Kritická cesta tedy blokovaná není.

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

### 5.0 Třídicí klíč: „VÍME, KDE TO JE?" (doplněno 2026-09-18)

Pavel: *„musíme vědět, kde to je — to je důležité."* Souhlas, a je to klíč,
kterým se má třídit **každý** zdroj, ne jen urbex. Fotka bez polohy je pro
produkci nula: nejde tam jet, nejde zjistit majitele, nejde spočítat dojezd.

Druhá osa hned za ní: **je tam někdo, kdo nás chce pustit dovnitř?**

| Zdroj | Kde to je | Dveře dovnitř | Verdikt |
|---|---|---|---|
| **Reality** (Sreality, Bezrealitky, iDNES, S&W, Luxent…) | **přesný pin** (č. p. skryté; inzerent může rozmazat na ulici/čtvrť) | makléř — *chce* být kontaktován | ⭐⭐⭐ |
| **Airbnb / Booking správci** | přibližně (kruh) → přesně po kontaktu | správce 20–200 jednotek = jeden telefonát, mnoho interiérů | ⭐⭐⭐ |
| **prazdnedomy.cz** | adresa + GPS | majitel často neznámý → přes obec / katastr | ⭐⭐ |
| **CzechInvest brownfieldy** | adresa | vlastník uvedený v záznamu | ⭐⭐ |
| **NPÚ Památkový katalog** | přesně, vazba na katastr | vlastník v záznamu (stát / obec / soukromý) | ⭐⭐ |
| **filmovamista.cz** | GPS na mapě | žádné — ale už se tam točilo = víme, že to jde | ⭐⭐ |
| **Archiweb / earch / ČCA** | **adresa/lokalita v záznamu** (ověřeno) — dohledatelné | majitel nechtěl být nalezen → **jít přes architekta** (viz níže) | ⭐⭐ |
| **Mapy.com / Google fotky u míst** | GPS — fotka je *připnutá* k místu | žádné, ale je to veřejné místo | ⭐⭐ |
| **Wikimedia geosearch** | GPS (když otagováno) | žádné | ⭐ |
| **Regionální film offices** | lokalita (`NEOVĚŘENO`) | kancelář zprostředkuje | ⭐⭐ pokud se ověří |
| **FB urbex Stránky** | **záměrně skryto** | žádné | ⭐ jen s křížením přes prazdnedomy (§Tier 5) |
| **Instagram** | většinou nic / obecný tag | žádné | ⭐ |
| **Pinterest** | **nic, ani původ** | žádné | ✗ **vyřadit** — mood bez stopy |

#### Dvě rodiny zdrojů

**DVEŘE** — je tam protistrana, která *chce* být nalezena a má adresu i klíče:
reality, dražby, správci pronájmů, brownfieldy. Tohle je produkční kvalita:
fotka + adresa + kontakt + motivace. **Tady má být těžiště objemu.**

**VÝLOHY** — krása bez cesty dovnitř: Instagram, FB urbex, Pinterest. Nikdy
nejsou zdroj shortlistu; nanejvýš mood, a Pinterest ani to (nulová provenance).

**Mezi tím: JMENOVANÉ STAVBY** — Archiweb, NPÚ, filmovamista. Poloha se
dohledá, ale dovnitř se musí vyjednat za studena.

#### Archiweb — rada, na kterou ses ptal

Archiweb je nejlepší zdroj **současné** architektury v ČR a poloha v něm je
(adresa/lokalita u záznamu). Problém není *kde*, ale *jak dovnitř*: jsou to
většinou soukromé rodinné domy, jejichž majitel nikdy neřekl „natáčejte u mě".

**Dveře = architekt.** Každý záznam má autora. Ateliér (a) svou realizaci rád
uvidí ve filmu, (b) má na majitele kontakt a důvěru, (c) zná další své domy,
které na webu nejsou. Jeden e-mail ateliéru otevře tři domy. Archiweb tedy
používat jako **index ateliérů podle typu stavby**, ne jako sklad fotek.

Totéž pro `earch.cz`, Českou cenu za architekturu, Grand Prix architektů,
**Slavné vily** (mají adresy). Pro *starou* architekturu je ale silnější NPÚ —
úplnost místo kurátorského výběru.

#### Reality — rada, na kterou ses ptal

Realitní server je **nejlepší DVEŘE v celém seznamu** a tvůj instinkt byl
správný. Tři poznámky navíc:

1. **Segment určuje kvalitu fotek** — luxus (S&W, Luxent, Lexxus, E&V) má
   profesionálního fotografa a prázdný prostor; objem (Sreality, Bazoš) má
   mobil a nábytek. Ale objem má *počet*. Obojí.
2. **Rozmazaná poloha není překážka.** Když inzerent rozmaže na ulici, makléř ti
   adresu řekne během minuty — chce prodat. Pro shortlist stačí pin na ulici,
   přesná adresa se dotáhne jedním hovorem.

Harvester pro reality **sdílet s `reality-kladno`** — už na Sreality/Bezrealitky
umí; liší se jen filtr (industriál → cokoliv) a výstup (výnos → karta lokace).

**Pravidlo do rubriky (§6, §7):** kandidát bez polohy alespoň na úrovni ulice
**nejde do decku.** Bucket „poloha neznámá" = mood, ne shortlist.

### Tier 0 — filmové databáze (lokační agentury viz korekce níže)

Tohle je kategorie, kterou jsem v první verzi plánu podcenil. Jsou to weby
postavené přímo pro natáčení — ne realitní inzeráty, ne turistické fotky.

**A. Lokační agentury — ZAVŘENO.**

**KOREKCE 2026-09-18.** V předchozí verzi jsem napsal, že veřejné galerie
lokačních agentur jsou použitelná reference. **To bylo špatně** — a napsal jsem
to, aniž bych jediný ten web viděl. Pavel to reklamoval, ověřeno:

> **lokacni.cz:** *"Upon request they will send you location archive selection."*

Archiv se **neprochází — vyžádá se.** Stránka `lokacni.cz/registruj-lokaci.html`
je pro majitele, kteří svou lokaci nabízejí, ne pro prohlížení. Žádná galerie.

**A je to strukturální, ne mezera k obejití.** Archiv **je** ten obchodní
majetek. Lokační agentura, která svůj archiv zveřejní, rozdá produkt. Platí to
pro všechny — lokacni.cz, locationservice.cz, nwlocation.cz, locaters.cz,
66location.com. Nemá smysl u nich hledat cestu dovnitř.

**Důsledek — padá i moje "největší přidaná hodnota".** Lokacni.cz (100 000+
lokací) a Czech Film Locations (~70 000 fotek) jsem v Tier 1 označil jako
nejcennější nález. Obojí jsou **komerční archivy pro klienty.** Ta čísla navíc
pocházejí z vlastní prezentace firem v adresáři Czech Film Commission — nejsou
ověřená, jsou to marketingová tvrzení.

**Co z kategorie zbývá:** jména a existence lokací (index "co v ČR je"), ne
fotky. Nízká hodnota. **Přesouvám z Tier 0 na konec priorit.**

**Co tím naopak posiluje:** tvůj původní instinkt. Reality, Airbnb, Mapy.com,
filmové kanceláře — tedy **veřejné zdroje, které chtějí být viděny** — jsou
správná páteř. Moje "profesionální" vrstva byla nejslabší část návrhu.

Evidované, ale **bez fotek**: lokacni.cz · locationservice.cz · nwlocation.cz ·
locaters.cz · 66location.com · Czech Film Locations · Finders.
Použitelné nanejvýš jako index jmen, ne jako obrazový zdroj.

**Zbývá jediné použitelné z této větve:** Wikipedie „Seznam českých filmových
lokací" — kurátorovaný, veřejný, licenčně čistý.

⚠️ UK agentury a marketplace (Giggster, Peerspace) **vyřazeny** — mimo rozsah ČR.

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

### ⚠️ Disciplína ověřování — poučení z této chyby

Z tohoto prostředí **nenačtu ani jeden z těch webů** (§4.1). Každé tvrzení o tom,
co je za URL, je proto odhad, dokud to někdo neotevře. Tuhle chybu jsem udělal
u lokačních agentur a nesmí se opakovat.

**Pravidlo:** každý zdroj v §5 nese status a do harvesteru nesmí nic, co není
`OVĚŘENO`.

| Status | Znamená |
|---|---|
| `OVĚŘENO` | někdo tu stránku otevřel a viděl fotky |
| `ODVOZENO` | plyne z povahy zdroje (otevřená data, Wikimedia) — vysoká jistota, ale neviděno |
| `NEOVĚŘENO` | domněnka. Nestavět na tom. |
| `ZAVŘENO` | ověřeno, že fotky veřejné nejsou |

**Aktuální stav:**

- `ZAVŘENO` — lokacni.cz, locationservice.cz, nwlocation.cz, locaters.cz,
  66location.com, Czech Film Locations, Finders
- `ODVOZENO` — NPÚ otevřená data, Wikimedia Commons, Mapy.com API (mají
  dokumentované veřejné API), filmovamista.cz, prazdnedomy.cz, reality portály
  (veřejný inzerát je jejich obchodní model)
- `NEOVĚŘENO` — **všech 11–12 regionálních filmových kanceláří.** Jsou
  veřejnoprávní a jejich účelem je lákat produkce, takže veřejná databáze dává
  smysl — ale je to přesně ten typ úvahy, kterou jsem si u agentur vyvrátil.
  Ověřit první, než na nich cokoli postavím.

**Nejlevnější způsob ověření:** otevřít je u sebe v Chrome a říct mi, co vidíš.
Deset minut práce ušetří postavení harvesteru na prázdno.


### Tier 1 — veřejné a veřejnoprávní zdroje (po korekci hlavní páteř)

Tohle jsou databáze postavené přesně pro tvůj účel, s GPS, kontaktem na majitele
a často i s informací o film-friendly historii. Veřejně dostupné.

| Zdroj | Co obsahuje | Dráha |
|---|---|---|
| **12 regionálních filmových kanceláří ČR** — každá má vlastní veřejnou databázi lokací | hrady, města, industriál, příroda; s kontaktem a povolovacím kontextem | A |
| `strednicechyfilm.cz/lokace` | Střední Čechy, nový web (spuštěn 2026) | A |
| `eastbohemiafilmoffice.cz`, `filmhk.cz`, `filmplzen.cz`, `zlinfilmoffice.cz` | další kraje | A |
| **Czech Film Commission** adresář | ~70 000 fotek lokací (Czech Film Locations), Lokacni.cz 100 000+ lokací | A |
| **NPÚ Památkový katalog** — otevřená data | ÚSKP: všechny kulturní památky ČR, s fotkami a GPS, strojově čitelné | A |

### Tier 2 — MAPY (po zúžení 2026-09-18 hlavní páteř)

**Tři vrstvy, každá odpovídá na jinou otázku.** Nejsou to alternativy, doplňují se.

#### Vrstva 1 — Ortofoto shora: ČÚZK ⭐ `ODVOZENO`

Zdroj, který v tvém seznamu nebyl a podle mě patří na první místo.

| Služba | Co dává |
|---|---|
| **WMS Ortofoto** | aktuální letecké snímky, **100 % území ČR (~78 866 km²)** |
| **WMS Archivní ortofoto** ⭐ | **historické** snímky — jak místo vypadalo dřív |
| WMS ortofoto CIR | infračervené, na vegetaci; pro tebe okrajové |

**Zdarma a bez registrace.** Standard OGC WMS 1.1.1 / 1.3.0, INSPIRE.

Pro scouta odpovídá na to, co z fotky nikdy nevyčteš: **dispozice areálu, příjezd,
kde se dá zaparkovat technika, co je za barákem, hustota stromů, jak daleko je
soused.** Tohle rozhodne, jestli tam vůbec má smysl jet.

A archivní vrstva umí věc, kterou neumí nikdo jiný: **najít, co zmizelo.**
Porovnáš snímek z 2003 a dnešní → vidíš zbořené areály, zarostlé cesty, vypuštěné
rybníky. Pro dobový film a pro urbex zlatý důl.

#### Vrstva 2 — Panorama v úrovni očí: Mapy.com API `ODVOZENO`

**⚠️ KOREKCE: Mapy.com REST API uživatelské fotky NEMÁ.** Ověřeno —
endpointy jsou: geokódování (forward, reverse, autocomplete), routing, elevation,
map tiles, timezone a **static panorama**. Žádný photo endpoint. V předchozí
verzi plánu jsem u Mapy.com API napsal "POI, panorama" a myslel tím i fotky.
Fotky uživatelů jsou **jen ve webovém UI → dráha B.**

**Ale Static Panorama API je pro tebe cennější než ty fotky.** Vrací statický
obrázek pohledu z daného bodu — **zadáš pozici a směr pohledu.** Tedy: systematické
pokrytí, tvoje volba úhlu, programově. To je nejblíž obhlídce, aniž bys tam jel.
Uživatelská fotka ti dá jeden náhodný úhel, který si vybral turista.

Registrace klíče zdarma, Basic plán 250 000 kreditů/měsíc.

#### Vrstva 3 — Uživatelské fotky: reálné světlo a sezóna `dráha B`

| Zdroj | Co dává | Co je problém |
|---|---|---|
| **Mapy.com fotky u míst** | reálné počasí, roční doba, davy | jen web UI, ne API |
| **Google Maps / Street View / photospheres** | totéž + Street View pokrytí | licence Places Photos je restriktivní — neukládat, nepřepoužívat |
| **Mapillary** | street-level, **CC-BY-SA** = licenčně čisté, API | pokrytí je komunitní a nerovnoměrné; mimo města v ČR může být řídké |
| **Wikimedia Commons geosearch** | `list=geosearch` + `prop=imageinfo`, **licence v metadatech** | jen to, co někdo nahrál |

#### ⭐ Mapy.com „Moje mapy" — kurátorované veřejné kolekce

Kategorie, kterou jsem přehlédl. Lidé si na Mapy.com skládají a **veřejně sdílejí**
sady míst (nalezeno např. „Tajná místa v Česku"). Je to ručně vybraný seznam
zajímavých míst od někoho, kdo je tam byl — tedy předtříděné a s GPS.
Hledat systematicky, je to levný zdroj kvalitních kandidátů.

### Tier 3 — reality (prodej i pronájem)

Tvůj seznam + rozšíření. **Klíčový vhled:** luxusní segment má systematicky
nejlepší fotky (profesionální fotograf, prázdný prostor, denní světlo).

- **Vysoký segment:** Svoboda & Williams, Luxent, Lexxus, Engel & Völkers Praha,
  Christie's International Real Estate CZ, Prague Estate
- **Objem:** Sreality, Bezrealitky, Reality iDNES, Bazoš Reality, RealHit, Realingo
- **Komerční / industriál:** 108 Real Estate, CBRE, Cushman & Wakefield, Colliers,
  Knight Frank, JLL, Procházka & Partners, Naxos
  *(tento blok se překrývá s tvým skillem `reality-kladno` — sdílet harvester)*
- ~~Dražby~~ — **vyřazeno na žádost (2026-09-18)**
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

### Tier 5 — FACEBOOK a komunita (po zúžení 2026-09-18 druhá páteř)

#### Stránky vs. skupiny — zásadní rozdíl

Ověřeno: to hodnotné v ČR jsou většinou **Stránky** (`facebook.com/jmeno`), ne
Skupiny (`facebook.com/groups/…`). **Stránky jsou veřejné a procházejí se bez
členství** — na rozdíl od skupin, které jsou podle zdrojů *"většinou zavřené"*.

| Stránka | Dosah |
|---|---|
| `facebook.com/OpustenaMista/` ⭐ | **64 000+**, Praha, urbex ČR — největší |
| `facebook.com/urbexpraha/` | 10 000+, URBEX Praha |
| `facebook.com/urbexak/` | 9 000+, Urbex – Opuštěná místa |

Mimo FB: `urbexhunt.com` · `lostczechman.com/urbex-v-cr`

Další hledat vzorem: *krásy Česka* · *zapomenutá místa* · *staré fotografie
\<město\>* · *zaniklé obce*. Konkrétní jména neuvádím, dokud je neuvidím (§ disciplína ověřování).

#### ⛔ Zádrhel, který mění postup: urbex fotky nemají lokaci

Z rešerše: *urbexeři běžně nesdílejí přesná místa* — chrání objekty před vandaly.
Dostaneš tedy **nádhernou fotku a nulovou informaci, kde to je.**

Pro tebe je to horší problém než zamčené weby. Fotka bez GPS je pro produkci
bezcenná — nemůžeš tam jet, nemůžeš zjistit majitele, nemůžeš spočítat dojezd.

#### Řešení: křížit Facebook s prazdnedomy.cz

**FB dává fotku bez adresy. `prazdnedomy.cz` dává adresu s fotkou.**
Jedno doplňuje druhé — ~7 600 objektů, z toho ~3 700 prázdných, **s adresou,
GPS a časovou osou.**

Postup: vizuálně shodná stavba na FB a v prázdných domech → máš fotku *i* adresu.
Když shoda není, zbývají v tomto pořadí:

1. **Archivní ortofoto ČÚZK** — charakteristický půdorys areálu se dá shora najít
2. **Rozpoznatelná architektura** → typ stavby + region → Památkový katalog NPÚ
3. **Reverzní vyhledávání obrázku** v tvém prohlížeči (dráha B)
4. **Zeptat se autora** — nejspolehlivější a nejrychlejší; urbexeři lokaci často
   dají soukromě, když jde o film a ne o dav

**Pravidlo do rubriky: kandidát bez GPS nejde do decku.** Skončí v samostatném
bucketu „vizuálně zajímavé, lokace neznámá" — mood, ne shortlist.

#### Právní rámec — beze změny

Automatizovaný sběr z Facebooku porušuje jeho podmínky užití (jistota: vysoká).
**Dráha B: ty přihlášený, rychlostí člověka, já čtu obrazovku.** U veřejných
Stránek je to navíc procházení veřejného obsahu, ne obcházení přihlášení.
Fotky lidí = osobní údaje, do decku nepatří (GDPR, §8).

### Tier 7 — HISTORIE: hrady, zámky, mlýny, kostely, vesnice (doplněno 2026-09-18)

Doporučení, na které ses ptal. Řazeno podle motivů z tvého master promptu.
U každého zdroje: **kde to je** + **dveře dovnitř** (§5.0).

#### Doporučení č. 1 — nech si motivy předtřídit státem

NPÚ už za tebe udělal tu nejdražší práci: **vybral místa bez moderních rušivých
prvků a dal jim právní status.** V Památkovém katalogu (otevřená data, `ODVOZENO`)
jsou to filtrovatelné kategorie:

| Kategorie NPÚ | Kolik | = motiv z master promptu |
|---|---|---|
| **Vesnické památkové rezervace (VPR)** ⭐⭐ | ~60 | *Vesnice* — celý soubor chráněný, žádné novostavby v záběru |
| **Vesnické památkové zóny (VPZ)** ⭐ | ~200 | *Vesnice / statek* — mírnější režim, víc variant |
| **Městské památkové rezervace (MPR)** ⭐⭐ | 40 | *Podhradí / městečko* |
| **Městské památkové zóny (MPZ)** | ~250 | totéž, širší výběr |
| **Krajinné památkové zóny (KPZ)** ⭐⭐ | ~25 | *Krajina* — chráněná *kulturní krajina*: aleje, rybníky, cesty bez asfaltu (Lednicko-valtický areál, Žehušicko, Osovsko…) |

Tohle je **nejlevnější longlist pro dobový film, jaký existuje** — poloha
přesná (katastr), kurátorováno odborníky, licenčně otevřené. Začít tady.

#### Doporučení č. 2 — Wikidata jako strukturovaná páteř

Každý hrad, zámek, zřícenina, klášter, mlýn s článkem na Wikipedii má ve
**Wikidata** záznam s **GPS, kategorií na Commons (= fotky s licencí), ID
v Památkovém katalogu a odkazem na článek.** Jeden SPARQL dotaz = celá ČR.
Plně otevřené, strojově čitelné, `ODVOZENO` s vysokou jistotou.

Tohle je *join key*: Wikidata ID spojí NPÚ záznam + Commons fotky + Wikipedii
+ souřadnice do jedné karty lokace. Bez ručního párování.

#### Doporučení č. 3 — motiv → specializovaná databáze

Pro každý motiv existuje jedna komunitní databáze, kterou dělají nadšenci
20 let a která je úplnější než cokoli oficiálního. Všechny mají GPS.

| Motiv | Databáze | Rozsah | Status |
|---|---|---|---|
| **Mlýn** ⭐⭐⭐ | `vodnimlyny.cz` | **12 000+ objektů, ~190 000 fotek**, od 2012, stav objektu | `OVĚŘENO` (rozsah) |
| **Hrad / zámek / zřícenina** | `hrady.cz` | největší CZ databáze hradů, zámků, tvrzí, kostelů; GPS, fotky, historie | `ODVOZENO` |
| **Kostel / kaple / synagoga** ⭐ | `znicenekostely.cz` | poškozené a zničené sakrální stavby; kategorie „nejohroženější", „zbořené 1945–89" | `OVĚŘENO` |
| **Industriál** ⭐ | `industrialnitopografie.cz` | VCPD FA ČVUT, **~7 000 objektů**, metodické záznamy s fotkami | `OVĚŘENO` |
| **Zaniklá vesnice** | `zanikleobce.cz` | zaniklé obce a objekty, dobové i současné fotky | `ODVOZENO` |
| **Prázdný dům** | `prazdnedomy.cz` | viz Tier 5 | `ODVOZENO` |
| **Drobná památka** (kříž, boží muka, kaplička) | `drobnepamatky.cz` | pro krajinný detail v záběru | `NEOVĚŘENO` |
| **Opevnění / bunkr** | `ropiky.net`, `bunkry.cz` | řopíky, pevnosti, linie 1938 | `NEOVĚŘENO` |

Pro tvůj master prompt je **vodnimlyny.cz zásadní** — motiv *Mlýn* tam má
8 povinných variant a databáze v `lokace_database.md` jich zná ~15. Tady jich
je dvanáct tisíc.

#### Doporučení č. 4 — dveře k hradům a zámkům

| Vlastník | Kolik | Dveře |
|---|---|---|
| **NPÚ** (státní) | ~100 hradů a zámků | **oficiálně pronajímá pro filmování** — `npu.cz/cs/hrady-a-zamky`, jeden proces, jeden ceník (`OVĚŘENO`) |
| **Soukromí majitelé** | stovky | Asociace majitelů hradů a zámků — jeden kontakt na sdružení (`NEOVĚŘENO` — dvě hledání, nic; **nestavět na tom, dokud neuvidím web**) |
| **Obce / kraje** | desítky | přes obec, obvykle vstřícné |
| **Církev** (kláštery) | desítky | přes řád / diecézi; Broumov, Plasy, Kladruby, Osek mají film track record |
| **Skanzeny** ⭐ | ~15 | *hotová dobová vesnice* + instituce za ní: Rožnov, Přerov n. L., Kouřim, Veselý Kopec, Zubrnice, Strážnice |

#### Doporučení č. 5 — najít, co zmizelo: historické mapové vrstvy

Kombinace tří vrstev najde mlýn, cestu nebo rybník, který dnes není na žádné
mapě — ale na místě ještě může stát:

1. **Císařské otisky stabilního katastru (1826–43)** — archiv ČÚZK; každý
   mlýn, každá stodola, každá cesta. Georeferencované.
2. **Vojenské mapování (mapire.eu / Arcanum)** — 1., 2., 3. mapování
   habsburské monarchie, georeferencované, překryv s dnešní mapou.
3. **Archivní ortofoto ČÚZK** (Tier 2) — kontrola, co z toho ještě stojí.

Postup: stabilní katastr ukáže mlýn u potoka → archivní ortofoto 1950s ukáže,
že tam ještě byl → dnešní ortofoto ukáže ruinu v lese → vodnimlyny.cz potvrdí
stav → jedeš. To je způsob, jak najít *neokoukaný* mlýn.

**Dobové fotky:** `fotohistorie.cz`, **eSbírky.cz** (portál sbírek českých
muzeí, včetně fotografií — `NEOVĚŘENO`), Wikimedia Commons (historické
kategorie).

### Tier 8 — PŘÍRODA: les, potok, skály, krajina (doplněno 2026-09-18)

#### Doporučení č. 6 — pár dveří pokrývá většinu krajiny

Na rozdíl od domů má příroda **málo vlastníků**. Pět protistran = většina
české krajiny, a každá má zavedený proces pro natáčení:

| Vlastník / správce | Co spravuje | Proč je to důležité |
|---|---|---|
| **Lesy ČR** | ~45 % lesů | jeden proces pro natáčení v lese |
| **Vojenské lesy a statky (VLS)** ⭐⭐ | Brdy, Libavá, Boletice, Hradiště, Březina | **obrovské prázdné krajiny bez jediné stavby** — nic podobného v ČR jinde není. Jeden kontakt. |
| **AOPK ČR** — správy CHKO | 26 CHKO | vydávají výjimky pro natáčení; vědět dopředu = ušetřený týden |
| **Správy národních parků** | Šumava, Krkonoše, Podyjí, České Švýcarsko | vlastní pravidla natáčení, přísnější |
| **Povodí** (Vltavy, Labe, Ohře, Moravy, Odry) | řeky, jezy, přehrady | motiv *Potok / most / brod* |
| **Správa jeskyní ČR** | 14 zpřístupněných jeskyní | jeden kontakt |

#### Doporučení č. 7 — ÚSOP: najít i zjistit povolovací režim najednou

**Ústřední seznam ochrany přírody (AOPK, `drusop.aopk.gov.cz` — `OVĚŘENO`)** je
zákonný registr (z. 114/1992 Sb.) **všech** zvláště chráněných území, ptačích
oblastí, evropsky významných lokalit a památných stromů — s **prostorovým
vymezením (hranice)**, veřejně, s mapovým projektem nad různými podklady.

Dvojí hodnota: (a) *najde* skály, rašeliniště, prales, meandry; (b) *řekne
hned*, v jakém ochranném režimu jsou → jestli potřebuješ výjimku, a od koho.
Pro produkci je (b) cennější než (a).

#### Doporučení č. 8 — geotagované fotky z tras

Pro přírodu nejlepší zdroj *reálného světla a sezóny s přesným GPS*:
**Mapy.com trasy** a **Wikiloc** — turistické stopy s fotkami připnutými na
bod trasy. Víš přesně, kde fotograf stál a kterým směrem se díval. Přesnější
než fotka „u místa", protože není u POI, ale kdekoli na cestě — tedy i uprostřed
lesa, kde žádný POI není.

#### Doporučení č. 9 — geologie, lomy, jeskyně, stromy

- **Česká geologická služba** — databáze významných geologických lokalit
  (skalní města, lomy, pískovce) s GPS (`ODVOZENO`)
- **Lomy** — aktivní i opuštěné; obří industriální krajiny. Registr ČGS +
  ortofoto ČÚZK (lom je shora nepřehlédnutelný)
- **Památné stromy** (AOPK) — konkrétní staleté stromy s GPS; motiv „ten jeden
  strom na kopci"
- **Rozhledny a vyhlídky** — `rozhledny.cz`, Mapy.com vrstva; pro *establishing
  shots* krajiny (`NEOVĚŘENO`)

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
| **Egress policy blokuje všechny zdroje (§4.1)** | **Kritický** — automatický sběr nejede vůbec | Změnit síťovou politiku prostředí, nebo jet dráhu B z Macu |
| Fotografický standard postavený jen na mých předpokladech | **Vysoký** — celý systém míjí cíl | Seed z PDF na Drivu (§12) — Drive dostupný je |
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

## 13. Stav stavby (2026-09-18)

Pavel: *„film offices super, stránky města super, fotografové architektury super — chci postavit
mocný location search skill."* → postaveno v `skills/`:

| Složka | Obsah | Fáze |
|---|---|---|
| `location-core/` | `scoring_rubric.md` (6 dim + Acc + okoukanost), `photo_standard.md` (filtry, Q, typy, brány, seed TODO), `karta_lokace.md` (GPS povinné, JSON), `source_policy.md`, `html_template.md` | **F1 kostra** — exempláře čekají na PDF seed |
| `location-db/` | opravený stávající skill, ČR only, bez odkazů na neexistující soubory, doručení podle prostředí; `lokace_database.md` bez SK + sekce současných motivů | **F0 + F2 hotovo** |
| `location-web/` | `SKILL.md` (8 kroků), `sources.md` (7 rodin, každý zdroj se statusem, polohou a dveřmi), `query_playbook.md` (český slovník, dotazy po zdrojích, SPARQL, Commons), `lanes.md` (test egressu, A/B), `geo_resolve.md` (řetězec na GPS) | **F3/F4 návrh** — harvester se píše až po rozhodnutí o síti |
| `build/build_skills.py` | zkopíruje jádro do obou skillů → `dist/` self-contained; kontrola, že SKILL.md neodkazuje na neexistující soubor (přísná — právě tahle chyba byla v původním skillu) | hotovo |
| `dist/` | to, co se nahrává na claude.ai | generováno |

Nově přidané zdroje: **stránky měst a obcí** (galerie, „natáčení", ceník — Praha ověřena),
**fotografové architektury** (portfolio → název stavby → Archiweb → adresa; fotograf = dveře k majiteli
i architektovi; konkrétní jména doplní Pavel).

**Co blokuje další krok:** (1) síťová politika prostředí, nebo dráha B z Macu; (2) seed
fotografického standardu z pěti PDF na Drivu — Drive je dostupný, jde spustit hned na „ano".

## Zdroje ověřené k 2026-09-18

- Mapy.com REST API — https://developer.mapy.com/rest-api-mapy-cz/
- Wikimedia Commons Geosearch API — https://www.mediawiki.org/wiki/API:Geosearch
- NPÚ otevřená data ÚSKP — https://pamatkovykatalog.cz/openData
- Databáze lokací Střední Čechy — https://www.strednicechyfilm.cz/lokace/
- Prázdné domy — https://prazdnedomy.cz/domy/objekty/
- Czech Film Commission, adresář — https://filmcommission.gov.cz/en/directory/
