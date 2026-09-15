# Location data pipeline (CZ/SK)

Staví reálnou databázi filmových lokací z primárních zdrojů místo z paměti modelu.

| | |
|---|---|
| Zdroje | OpenStreetMap (Overpass API, ODbL) · Wikidata (SPARQL, CC0) |
| Cena | zdarma, bez API klíčů, bez registrace |
| Závislosti | žádné — čistý Node 18+ |
| Výstup | `data/locations.json` · `.geojson` · `.csv` |

## Proč

Location deck dosud vznikal tak, že si model vybavil názvy lokací z tréninkových dat.
Fungovalo to u Karlštejna, selhávalo to u mlýnů a zřícenin — ty se buď pletou,
nebo se uvedou v chybném stavu, nebo neexistují. Tenhle skript nahrazuje vybavování
dotazem: každá lokace má souřadnice, OSM id a odkaz, který se dá otevřít a ověřit.

## Použití

```bash
node fetch-locations.mjs --help            # nápověda a seznam motivů
node fetch-locations.mjs --motiv mlyn      # jeden motiv, CZ i SK
node fetch-locations.mjs --all             # kompletní databáze (běží ~10-20 min)
node fetch-locations.mjs --all --zeme CZ --no-wikidata
node fetch-locations.mjs --motiv hrad --dry-run     # vypíše jen dotazy
```

Overpass je sdílená služba zdarma. Skript mezi dotazy čeká 3 s a při přetížení
zkouší záložní endpoint — nezvyšuj tempo, ať se neocitneš na blocklistu.

## Co v datech je a co ne

Vyplněno z dat: název (cs/en), motiv, země, souřadnice, vzdušná vzdálenost
od Prahy a Bratislavy, správce, web, stav objektu, rejstříkové číslo památky,
odkaz na OSM / Mapy.com / Wikidata / Wikipedii / fotku.

Záměrně prázdné: `skore`, `film_friendly`, `kontakt`, `poznamka`.
Tohle není měřitelné z OSM a generátor si to nevymýšlí. Doplňuje člověk
nebo scouting, a `stav_zaznamu` se přepne z `neoveřeno`.

**Vzdálenosti jsou vzdušnou čarou.** Pro rozpočet a company move je přepočítej
po silnici — u hor to dělá rozdíl i 2×.

## Ladění presetů

Tagování v OSM není v CZ/SK konzistentní. Po běhu skript vypíše tabulku
`motiv / OSM / použito / wikidata`. Podezřele nízké číslo = špatný preset,
ne prázdná realita — uprav dotazy v `motivy.mjs` a pusť znovu.

Ladit se dá offline nad uloženou odpovědí, bez zátěže Overpassu:

```bash
node fetch-locations.mjs --motiv mlyn --fixture ./odpoved.json --no-wikidata
```

## Licence dat

OSM = ODbL, vyžaduje uvedení zdroje „© OpenStreetMap contributors" všude,
kde se data publikují. Wikidata = CC0, bez podmínek. Pro interní deck to
řešit nemusíš, pro veřejnou mapu na webu ano.
