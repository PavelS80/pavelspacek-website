# Laťka: „kvalita musí být fantastická" — co to měřitelně znamená

## Definice hotovo pro jeden běh `location-web` (režim soucasny)
1. **Každý kandidát má polohu** (GPS nebo adresa s č. p.) a je **ve správném okrese** — homonymní obce
   (Polepy/Litoměřice ≠ Polepy/Kolín) odfiltrovány. *Bez toho štáb jede 80 km vedle.*
2. **Každý kandidát má dveře** — telefon / e-mail / jméno protistrany.
3. **Nic ze ZNÁMÝCH** — nic z `lokace_database.md` ani z už obhlédnutého seznamu v briefu.
4. **Fotka jen s licenčním tierem a typem**; recce hodnocena na Z+P, ostatní na plné Q.
5. **Výstup je denní plán obhlídek** (časy, dojezdy, pořadí) — ne seznam.
6. **Recall proti ground truth ≥ 2/3** na evalech 1–5 (`location-web/evals/evals.json`).
7. **Nic vymyšleného.** Neověřené = označeno; žádné jméno, které nikdo neviděl.

## Stav (2026-09-18, dráha A-lite = jen WebSearch, egress blokován)
| Eval | Ground truth | Výsledek |
|---|---|---|
| 1 autoservis | Polepy 210 | **HIT** — Roman Tuhý, Polepy 210, 773 696 051 |
| 2 restaurace | Polepy 185, Kamýk 45 | **HIT** — Restaurace Polepy 185, 777 169 262; Hostinec Na Kamýku (ověřit č. p.) |
| 3 kadeřnictví | Havlíčkova 124 Terezín | **MISS** v 1. skoku (ulice ≈ příjmení); kategorie Terezín nalezena → 2. skok |
| 4 JZD | Trnovany 33 / Sulejovice / Třebušín | běží |
| 5 chatová osada | Kotlík Sojovice | běží |
**Recall zatím 2/3 na dokončených.** Bez prohlížeče, bez API. To je spodní hranice — s dráhou B nebo A poroste.

## Dvě lekce z prvního běhu → zapsány do `query_playbook.md`
- **Ulice ≠ příjmení.** „kadeřnictví Havlíčkova" najde paní Havlíčkovou v Praze. Dotaz stavět
  `<typ> <obec>` a adresu ověřit až v detailu; nebo použít kategorii adresáře pro obec.
- **Homonymní obce.** Vždy `<obec> okres <okres>`; kandidáta bez shody okresu zahodit.

## Co ještě není fantastické (poctivě)
- Fotografický standard má 5 exemplářů, ne 24. Hypotéza o vkusu stojí na jednom páru.
- Nula běhů s prohlížečem → fotky kandidátů zatím neviděné, jen adresy a telefony.
- Dráha A (automatický sběr) nejede, dokud se nezmění síťová politika.
- Váhy rubriky čekají na rozhodnutí (`scoring_rubric.md`).
- Popisy skillů (triggering) neoptimalizovány — eval set připraven v `location-web/evals/trigger_evals.json`.
