# Geo-resolve — jak každému kandidátovi dát GPS

Pravidlo: **bez polohy alespoň na úrovni ulice nejde kandidát do decku.**

## Řetězec (zastav se u prvního, který dá výsledek)
1. **Zdroj má GPS/adresu** — reality (pin), NPÚ (katastr), vodnimlyny, ÚSOP, filmovamista, prazdnedomy,
   Wikidata (`P625`). Zapiš přesnost: `exact | street | district | municipality`.
2. **Geokódování** — Mapy.com REST API `geocode` z adresy / názvu + obce. (Dráha A; jinak Mapy.com web.)
3. **Křížení** — fotka bez polohy (FB urbex, IG) ↔ databáze s polohou (prazdnedomy, znicenekostely,
   industrialnitopografie, zanikleobce): vizuální shoda stavby = fotka *i* adresa.
4. **Půdorys shora** — charakteristický tvar areálu / střechy najít v ČÚZK ortofotu v podezřelém regionu.
5. **Rozpoznatelná architektura** → typ + region → NPÚ Památkový katalog.
6. **Reverzní vyhledávání obrázku** — v uživatelově prohlížeči (dráha B).
7. **Zeptat se autora** — u urbexu nejrychlejší; lokaci často dají soukromě, když jde o film.

## Přesnost → co s ní
| Přesnost | Do shortlistu? | Poznámka |
|---|---|---|
| exact | ano | |
| street | ano | makléř adresu dotáhne hovorem |
| district | ne — BACKUP s úkolem "upřesnit" | |
| municipality | ne — INSPIRACE | |
| unknown | ne — bucket POLOHA NEZNÁMÁ | mood, ne kandidát |

## Odvozené hodnoty
Z GPS spočítat vzdálenost a dojezd z Prahy (Mapy.com routing; bez API odhad po silnici ×1.3 vzdušné).
