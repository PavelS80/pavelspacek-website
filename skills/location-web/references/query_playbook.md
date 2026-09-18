# Query playbook — jak se ptát (česky, po zdrojích)

## 1. Brief → vizuální slovník
Z textu / obrázku vytěž a zapiš:
```
materiál:   kámen | cihla | omítka | beton | dřevo | sklo | ocel | panel
epocha:     gotika | renesance | baroko | 19. st. | 1. republika | funkcionalismus | socialismus 50.–80. | 90. léta | současnost
měřítko:    pokoj | byt | dům | vila | areál | ulice | náměstí | krajina
typ:        byt | rodinný dům | vila | statek | mlýn | hrad | zámek | klášter | kostel | fabrika | sklad | kancelář | škola | nemocnice | hospoda | nádraží | panelák | les | potok | skály | louka | rybník
světlo:     velká okna | světlík | tmavé | severní | průhled ven
půdorys:    otevřený | chodbový | dvorek | průjezd | patrový
region:     kraj / okres, nebo "do 60 min od Prahy"
stav:       obydlené | prázdné | chátrající | ruina | opravené
```
**Vždy převést do češtiny.** Příklady:
- *brutalist stairwell* → `brutalistní schodiště`, `betonové schodiště 70. léta`, `Transgas`, `Kotva`, `obchodní dům 70. léta`
- *derelict farmhouse* → `opuštěný statek`, `chátrající zemědělská usedlost`, `bývalé JZD`, `prázdný statek na prodej`
- *mid-century apartment* → `byt 60. léta původní stav`, `panelák původní jádro`, `byt v původním stavu Praha`
- *old mill by a stream* → `vodní mlýn zřícenina`, `mlýn na prodej`, `mlýn k rekonstrukci`, `mlýnský náhon`

## 2. Dotazy podle zdroje

### Reality (Sreality, Bezrealitky, iDNES, S&W…)
Filtry místo klíčových slov: **typ** (dům / byt / komerční / ostatní) × **stav** (před rekonstrukcí, původní stav,
k demolici) × **lokalita**. Text: `původní stav`, `k rekonstrukci`, `bývalá fabrika`, `statek`, `mlýn`, `vila prvorepubliková`,
`secesní`, `funkcionalistická`, `panelový`, `bez nábytku`. Segment luxusu (S&W, Luxent) = nejlepší fotky → projít celý,
ne filtrovat. Harvester **sdílet s `reality-kladno`**.

### Správci krátkodobých pronájmů
Booking.com → město → detail nabídky → pole *"Spravováno: …"* → seskupit podle četnosti. Airbnb → profil hostitele →
počet nabídek. Rejstřík: NACE 55.20 / 68.20 v Praze. Výstup: `správce · počet jednotek · vlastní web · kvalita fotek`.

### NPÚ Památkový katalog
Filtrovat podle **kategorie ochrany** (VPR / VPZ / MPR / MPZ / KPZ) a **typu** (mlýn, tvrz, fara, sýpka, hospodářský dvůr…)
a **kraje**. Otevřená data ke stažení celá → filtrovat lokálně.

### Wikidata SPARQL (celá ČR jedním dotazem)
```sparql
SELECT ?item ?itemLabel ?coord ?commons WHERE {
  ?item wdt:P31/wdt:P279* wd:Q23413 ;     # hrad (zámek: Q751876, vodní mlýn: Q185187)
        wdt:P17 wd:Q213 ;                 # Česko
        wdt:P625 ?coord .
  OPTIONAL { ?item wdt:P373 ?commons . }  # kategorie na Commons → fotky s licencí
  SERVICE wikibase:label { bd:serviceParam wikibase:language "cs,en". }
}
```
Endpoint `https://query.wikidata.org/sparql`. Property pro ID Památkového katalogu doplnit po ověření.

### Wikimedia Commons geosearch
```
action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=500&ggscoord=LAT|LON
&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&format=json
```
`extmetadata` nese licenci → tier T1 jen když je CC.

### vodnimlyny.cz
Filtr: kraj × stav (`zachovalý`, `torzo`, `přestavěný`, `zaniklý`) × náhon (`existuje`). Prioritně `torzo` a `zachovalý`
mimo `lokace_database.md`.

### filmovamista.cz
Pro každého kandidáta: vyhledat název → počet titulů → korekce okoukanosti. Naopak: mapa → oblast → „co se tu točilo"
= inspirace + kontakty, které už s filmem mají zkušenost.

### ČÚZK ortofoto / archivní ortofoto
WMS `GetMap` s bbox kolem GPS, vrstvy aktuální + archivní; porovnat. Slouží k **potvrzení**, ne k hledání
(hledání shora jen u charakteristických půdorysů — lomy, areály, rybníky).

### Mapy.com
- API: `geocode` (adresa → GPS), `routing` (dojezd z Prahy), **`static panorama`** (GPS + heading → obrázek; projet 4 směry).
- Web (dráha B): hledat místo → záložka fotky; **„Moje mapy"** → hledat veřejné kolekce: `tajná místa`, `opuštěné`, `zámky`, `mlýny`, `industriál`.

### Facebook (dráha B, Stránky ne skupiny)
Na Stránce: **hledat v příspěvcích** klíčovým slovem (`zámek`, `fabrika`, `statek`, `sanatorium`, `nádraží`). Číst komentáře —
lokaci často prozradí komentující. Ukládat URL příspěvku + autor + datum; **nikdy nestahovat hromadně**.
Křížit každou fotku s prazdnedomy.cz / znicenekostely.cz / industrialnitopografie.cz (`geo_resolve.md`).

### Archiweb / fotografové architektury
Archiweb: kategorie stavby × kraj → záznam → **autor (ateliér)** = dveře. Fotograf architektury: portfolio → název stavby →
Archiweb → adresa. Oslovit fotografa (má vztah s majitelem i architektem).

### Stránky měst
`<město> památky`, `<město> fotogalerie`, `<město> natáčení`, `<město> pronájem prostor`. Odbor kultury / tiskové oddělení =
dveře; velká města mají ceník natáčení (Praha ověřeno).

## 3. Anti-vzory
- Anglický dotaz na českém webu.
- Hledat „hrad", když brief říká „byt".
- Hashtag na Instagramu místo 20–30 sledovaných účtů.
- Pinterest.
