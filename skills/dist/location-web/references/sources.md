# Katalog zdrojů — ČR (stav 2026-09-18)

Sloupce: **Kde to je** (přesnost polohy) · **Dveře** (kdo nás pustí dovnitř) · **Status** (viz `source_policy.md`) · **Dráha** · **Tier** licence.
Do harvesteru jen `OVĚŘENO` / `ODVOZENO`. `NEOVĚŘENO` = nejdřív otevřít u sebe a potvrdit.

## 0. SOUČASNÝ REŽIM — firemní adresáře a instituce (ověřeno 2026-09-18 na VVK2)

Pro krimi/drama v reálném městě je tohle **primární** zdroj. Provozovna = adresa + telefon
+ fotky + otevírací doba + majitel, který zvedne telefon.

| Zdroj | Kde to je | Dveře | Status | Dráha | Tier |
|---|---|---|---|---|---|
| **firmy.cz** — kategorie × obec (např. 59 autoservisů Litoměřice; detail: kontakt, telefon, e-mail, web, adresa, otevírací doba) | **přesně** | majitel provozovny | **OVĚŘENO** (detail provozovny vrací i WebSearch) | A-lite / B | T2 |
| **Mapy.com firmy / POI** | přesně | telefon v záznamu | ODVOZENO | B | T2 |
| **Google Maps POI** (+ uživatelské fotky interiéru!) | přesně | telefon v záznamu | ODVOZENO | B | T2 |
| idatabaze.cz, portalridice.cz (autoservisy) | přesně | majitel | ODVOZENO | A-lite | T2 |
| **Instituce** — soud, nemocnice, policie, ZŠ/školka, OÚ, sokolovna, kulturní dům | přesně | tiskový mluvčí / tajemník / ředitel | ODVOZENO | A-lite / B | T2 |
| **JZD, statky, agroslužby** — obchodní rejstřík (NACE 01) + Mapy.com | přesně | jednatel | ODVOZENO | A-lite / B | T2 |
| **Chatové osady** — vrstva Mapy.com, obecní web | obec / přesně | osadní výbor / obec | ODVOZENO | B | T2 |
| **Sreality byt / dům v okrese základny** — bytovka s balkónem, řadovka, činžák, RD | pin | makléř | ODVOZENO | A-lite / B | T2 |

**A-lite** = `WebSearch` (jde přes Anthropic, ne přes egress): u firmy.cz a specializovaných
databází vrací **detail objektu**; u Sreality jen filtrovací URL → fronta pro dráhu B.

## 1. DVEŘE — protistrana chce být nalezena

| Zdroj | Kde to je | Dveře | Status | Dráha | Tier |
|---|---|---|---|---|---|
| Sreality.cz | přesný pin (č. p. skryté; inzerent může rozmazat na ulici/čtvrť) | makléř | ODVOZENO | A/B | T2 |
| Bezrealitky, Reality iDNES, Bazoš Reality, RealHit, Realingo | pin / obec | makléř / majitel | ODVOZENO | A/B | T2 |
| Svoboda & Williams, Luxent, Lexxus, Engel & Völkers Praha | pin / čtvrť; **profi fotograf, prázdný prostor** | makléř | ODVOZENO | A/B | T2 |
| Komerční: 108 RE, CBRE, C&W, Colliers, Knight Frank, JLL, Procházka & P., Naxos | adresa | makléř | ODVOZENO | A/B | T2 |
| **Správci krátkodobých pronájmů** (Booking "Spravováno:", Airbnb profil hostitele, NACE 55.20) | kruh → přesně po kontaktu | **jeden správce = 20–200 interiérů** | ODVOZENO (metoda) | B | T3 |
| **NPÚ — pronájem hradů a zámků pro film** `npu.cz/cs/hrady-a-zamky` | přesně | oficiální proces, ceník | OVĚŘENO | A/B | T2 |
| **Regionální film offices** — strednicechyfilm.cz/lokace, fkuk.cz, eastbohemiafilmoffice.cz, filmplzen.cz, zlinfilmoffice.cz, filmhk.cz (+ další do 11–12) | lokalita | kancelář zprostředkuje | **NEOVĚŘENO** — otevřít a potvrdit fotky | A/B | T2 |
| **Stránky měst a obcí** — galerie, "památky", "natáčení ve městě" | obec / přesně | odbor kultury / tiskový | ODVOZENO | A/B | T2 |
| ↳ Praha: podmínky natáčení `praha.eu` — PPR 10–15 Kč/m²/den, Václavské nám. 100 Kč/m²/den, Karlův most 250 000 Kč/den | — | MHMP | OVĚŘENO | A | — |
| CzechInvest brownfieldy | adresa | vlastník v záznamu | ODVOZENO | A | T2 |

## 2. STÁTEM PŘEDTŘÍDĚNÉ — kurátorováno, otevřené, přesné

| Zdroj | Co dává | Status | Dráha | Tier |
|---|---|---|---|---|
| **NPÚ Památkový katalog — otevřená data** `pamatkovykatalog.cz/openData` | všechny kulturní památky, fotky, katastr | ODVOZENO | A | T1 |
| ↳ **VPR (~60) / VPZ (~200)** — vesnice bez novostaveb | motiv *vesnice / statek* | ODVOZENO | A | T1 |
| ↳ **MPR (40) / MPZ (~250)** — historická města | motiv *podhradí / městečko* | ODVOZENO | A | T1 |
| ↳ **KPZ (~25)** — chráněná kulturní krajina | motiv *krajina* bez asfaltu | ODVOZENO | A | T1 |
| **ÚSOP / AOPK** `drusop.aopk.gov.cz` | všechna chráněná území s hranicemi + **povolovací režim** | OVĚŘENO | A | T1 |
| **Wikidata SPARQL** | hrady/zámky/mlýny/kláštery s GPS + Commons kategorie + ID NPÚ | ODVOZENO | A | T1 |
| **Wikimedia Commons geosearch** | fotky v okruhu N m od GPS, licence v metadatech | ODVOZENO | A | T1 |
| Wikipedie „Seznam českých filmových lokací" | kurátorovaný seznam | ODVOZENO | A | T1 |

## 3. MOTIV → SPECIALIZOVANÁ DATABÁZE (všechny s GPS)

| Motiv | Zdroj | Rozsah | Status | Dráha | Tier |
|---|---|---|---|---|---|
| **Mlýn** | `vodnimlyny.cz` | **12 000+ objektů, ~190 000 fotek**, stav objektu | OVĚŘENO (rozsah) | A | T2 |
| Hrad / zámek / zřícenina | `hrady.cz` | největší CZ databáze; GPS, fotky, historie | ODVOZENO | A | T2 |
| Kostel / kaple / synagoga | `znicenekostely.cz` | poškozené a zničené; "nejohroženější", "zbořené 1945–89" | OVĚŘENO | A | T2 |
| Industriál | `industrialnitopografie.cz` | VCPD FA ČVUT, ~7 000 objektů | OVĚŘENO | A | T2 |
| Prázdný dům | `prazdnedomy.cz` | ~7 600 objektů, ~3 700 prázdných; adresa, GPS, časová osa | ODVOZENO | A | T2 |
| Zaniklá obec | `zanikleobce.cz` | zaniklé obce a objekty, dobové i současné fotky | ODVOZENO | A | T2 |
| **Kde se natáčelo** | `filmovamista.cz` | **2 200+ titulů, 39 000+ míst**, mapa → **okoukanost** | ODVOZENO | A | T2 |
| Drobná památka | `drobnepamatky.cz` | kříže, boží muka, kapličky | NEOVĚŘENO | A | T2 |
| Opevnění | `ropiky.net`, `bunkry.cz` | řopíky, pevnosti | NEOVĚŘENO | A | T2 |
| Dobové fotky | `fotohistorie.cz`, eSbírky.cz, Commons historické kat. | period reference — **ověřit, že objekt stojí** | ODVOZENO / NEOVĚŘENO (eSbírky) | A | T1/T2 |
| Historické mapy | císařské otisky stabilního katastru (ČÚZK), mapire.eu / Arcanum | najít, co zmizelo | ODVOZENO | A | T1 |

## 4. MAPY — tři vrstvy, doplňují se

| Vrstva | Zdroj | Co odpovídá | Status | Dráha | Tier |
|---|---|---|---|---|---|
| **Shora** | **ČÚZK WMS Ortofoto** — zdarma, bez registrace, 100 % ČR | dispozice areálu, příjezd, parkování techniky, okolí | ODVOZENO | A | T1 |
| ↳ | **ČÚZK WMS Archivní ortofoto** | co zmizelo / zarostlo / bylo vypuštěno | ODVOZENO | A | T1 |
| **Úroveň očí** | **Mapy.com Static Panorama API** — pozice + směr pohledu | systematická obhlídka bez cesty | ODVOZENO | A | T2 |
| ↳ | Mapy.com REST API: geocode, routing, elevation, tiles (**fotky NEMÁ**) | GPS, dojezd | ODVOZENO | A | — |
| **Reálné světlo a sezóna** | Mapy.com fotky u míst (jen web UI) | počasí, davy, roční doba | ODVOZENO | B | T2 |
| ↳ | Google Maps / Street View / photospheres | totéž; Places Photos licence restriktivní | ODVOZENO | B | T2 |
| ↳ | **Mapy.com trasy, Wikiloc** — fotky připnuté na bod stopy | přesné GPS i uprostřed lesa | ODVOZENO | B | T2 |
| ↳ | Mapillary (CC-BY-SA, API) | licenčně čisté; pokrytí mimo města nejisté | ODVOZENO | A | T1 |
| Kurátorované | **Mapy.com „Moje mapy"** — veřejně sdílené sady míst | předtříděné s GPS | ODVOZENO | B | T2 |

## 5. PŘÍRODA — pár dveří pokrývá většinu krajiny

| Správce | Co | Status |
|---|---|---|
| Lesy ČR | ~45 % lesů; jeden proces natáčení | ODVOZENO |
| **Vojenské lesy a statky** — Brdy, Libavá, Boletice, Hradiště, Březina | **obrovské krajiny bez staveb**; jeden kontakt | ODVOZENO |
| AOPK — správy 26 CHKO | výjimky pro natáčení | ODVOZENO |
| Správy NP — Šumava, Krkonoše, Podyjí, České Švýcarsko | vlastní pravidla | ODVOZENO |
| Povodí Vltavy / Labe / Ohře / Moravy / Odry | řeky, jezy, brody | ODVOZENO |
| Správa jeskyní ČR | 14 jeskyní | ODVOZENO |
| Česká geologická služba | skalní města, lomy s GPS | ODVOZENO |
| Památné stromy (AOPK, v ÚSOP) | „ten jeden strom" | OVĚŘENO (součást ÚSOP) |
| Skanzeny — Rožnov, Přerov n. L., Kouřim, Veselý Kopec, Zubrnice, Strážnice | hotová dobová vesnice + instituce | ODVOZENO |

## 6. VÝLOHY — krása bez dveří; jen s křížením na polohu

| Zdroj | Kde to je | Status | Dráha | Tier |
|---|---|---|---|---|
| FB Stránka **Opuštěná místa** `facebook.com/OpustenaMista/` (64 000+) | **záměrně skryto** → křížit s prazdnedomy | OVĚŘENO (existence) | B | T3 |
| FB **URBEX Praha** `/urbexpraha/` (10 000+), **Urbex – Opuštěná místa** `/urbexak/` (9 000+) | skryto | OVĚŘENO (existence) | B | T3 |
| FB skupiny (většinou zavřené) — hledat: *krásy Česka, zapomenutá místa, staré fotografie <město>* | různé | NEOVĚŘENO — jména neuvádět, dokud nevidím | B | T3 |
| `urbexhunt.com`, `lostczechman.com/urbex-v-cr` | různé | NEOVĚŘENO | A | T3 |
| Instagram — hashtagy `#urbexcz #opustenamista #prazdnedomy`; lepší 20–30 kurátorských účtů | většinou nic | ODVOZENO | B | T3 |
| **Archiweb.cz** — adresa/lokalita v záznamu (ověřeno); **dveře = architekt** | dohledatelné | OVĚŘENO | A/B | T3 |
| earch.cz, Česká cena za architekturu, Grand Prix architektů, Slavné vily (adresy) | dohledatelné | ODVOZENO | A | T3 |
| **Fotografové architektury** — portfolio = nejlepší fotky současných staveb; **fotograf zná majitele i architekta** | stavba pojmenovaná → dohledat | ODVOZENO (metoda); konkrétní jména doplní Pavel | B | T3 |
| Pinterest | nic, ani původ | — | ✗ **VYŘAZENO** | — |

## 7. ZAVŘENO — nehledat cestu dovnitř
lokacni.cz · locationservice.cz · nwlocation.cz · locaters.cz · 66location.com · Czech Film Locations · Finders
(archiv je jejich produkt; „archive selection upon request").

## Vyřazeno na žádost (2026-09-18)
Dražby · Slovensko · UK agentury a marketplace (Giggster, Peerspace)
