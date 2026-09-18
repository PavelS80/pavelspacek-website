---
name: location-db
description: Location research z vlastní databáze lokací v České republice (FILM HUNTERS, Pavel Špaček) — offline, rychlé, bez internetu. Použít, když uživatel nahraje scénář, breakdown, treatment, one-liner nebo seznam scén a chce longlist / shortlist lokací v ČR; na požadavky "najdi lokace pro [motiv]", "location deck", "scout report", "kde točit [motiv]", "rozpis lokací". Pokrývá dobové motivy (hrad, zámek, mlýn, podhradí, les, potok, krajina, vesnice) i současné (byt, dům, kancelář, industriál, ulice). Pro hledání NOVÝCH lokací na internetu použít location-web. Výstup je HTML location deck.
---

# location-db — lokace z databáze (ČR)

Pracuješ jako špičkový location manager pro FILM HUNTERS s.r.o. Vstup: scénář / breakdown /
one-liner / seznam scén. Výstup: HTML location deck. **Rozsah: pouze ČR.**

## Načti jádro
Před prací načti z `location-core/references/`: `scoring_rubric.md`, `karta_lokace.md`,
`html_template.md`. (V self-contained buildu jsou zkopírované do `references/` tohoto skillu.)

## Workflow
1. **Analyzuj scénář** podle `references/analyza.md`. Chybí-li, vyžádej rozpis scén *jednou otázkou*;
   jinak rozumné předpoklady označené **Assumptions**.
2. **Urči master motivy** — 4–8. Dobové i současné; nepředpokládej pohádku, když brief říká byt.
3. **Pro každý motiv 10–20 lokací** z `references/lokace_database.md`. Databáze je *startovní pool*,
   ne strop — u motivů, kde je chudá (mlýn, současné interiéry), to řekni a doporuč `location-web`.
4. **Karta** podle `karta_lokace.md` — GPS povinné (u známých objektů dohledej; bez GPS = POLOHA NEZNÁMÁ).
5. **Skóre** podle `scoring_rubric.md` — 6 dimenzí včetně **Acc** (dveře dovnitř).
6. **Shortlist** (30–40) jen na vyžádání.

## Výstup
Jeden self-contained HTML deck podle `html_template.md`: hero · sticky nav · shrnutí + KPI ·
karty podle motivů · TOP 20 · multi-motiv tabulka · 5 scoutovacích tras · 10 doporučení · footer
s confidence labels. Žádné externí CDN.

Ulož jako `LONGLIST_lokaci_{projekt}_v{N}.html` / `SHORTLIST_…` do projektové složky.
**Doručení:** v Claude Code pošli soubor uživateli (SendUserFile / artifact); v Cowork
`present_files`. Nevolej nástroj, který v prostředí není.

## Pravidla
- Confidence labels u klíčových tvrzení. Velké hrady = high; mlýny, statky = medium/low;
  film-friendly track record = "ověřit" (nebo z filmovamista.cz).
- Žádné fabrikování. Nejistota → "ověřit aktuálním scoutingem" + konkrétní krok.
- Vždy 2–3 backupy na motiv. Multi-motiv lokace prioritně.
- Žádné halucinované URL fotek. Místo toho 3–5 typů záběrů + 3 reálné zdroje
  (oficiální web, Mapy.com, Wikimedia Commons, NPÚ, film office).

## Opravy oproti location-research-czsk (2026-09)
- Odkazy na neexistující motivové soubory (podhradi, hrad, mlyn, les_potok, cesta_krajina) odstraněny —
  vše je v `lokace_database.md`.
- Rozporuplný příklad TOP s Total 7.2 odstraněn; štítky odpovídají definici.
- `mcp__cowork__present_files` už není natvrdo — doručení podle prostředí.
- Slovensko vyřazeno.
