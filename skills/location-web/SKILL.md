---
name: location-web
description: Internetové vyhledávání NOVÝCH filmových lokací v České republice z textové nebo obrazové reference (FILM HUNTERS). Použít na požadavky "najdi nové lokace pro…", "location search", "hledej na internetu byt/dům/mlýn/zámek/krajinu jako na této fotce", "co je na trhu", "nové varianty k [motiv]", "kde v ČR najdu [popis prostoru]". Prohledává mapy (Mapy.com, ČÚZK ortofoto, Google), reality a správce pronájmů, filmové kanceláře, stránky měst, NPÚ a specializované databáze (mlýny, kostely, industriál, prázdné domy), Facebook/urbex Stránky a fotografy architektury. Každý kandidát musí mít GPS. Výstup: HTML deck + sources.json s licenční stopou. Pro lokace z vlastní databáze použít location-db.
---

# location-web — nové lokace z internetu (ČR)

Cíl: z briefu (text nebo referenční obrázek) najít lokace v ČR, které **nejsou v naší
databázi**, mají **známou polohu** a **dveře dovnitř**, a k nim fotky, které **čtou prostor**.

## 0. Načti jádro a zjisti dráhu
Načti `scoring_rubric.md`, `photo_standard.md`, `karta_lokace.md`, `source_policy.md`, `html_template.md`.
Pak `references/lanes.md` → otestuj egress (`curl -sI --max-time 8 https://www.filmovamista.cz/`).
`000`/`403` = **jen dráha B** (uživatelův prohlížeč). Řekni to uživateli hned, ne po hodině práce.

## 1. Brief → vizuální slovník (`references/query_playbook.md`)
Z reference vytěž: **materiál · epocha · měřítko · typ prostoru · světlo · půdorys · region**.
Přelož do **českých** hledacích termínů — anglický dotaz na českém webu nenajde nic.
Nepředpokládej dobový motiv: byt, panelák, kancelář, industriál jsou stejně časté jako hrad.

## 2. Vyluč známé
Odečti vše z `location-db/references/lokace_database.md` → štítek `ZNÁMÁ`, do výstupu "nové" nejde.

## 3. Fan-out podle rodin zdrojů (`references/sources.md`)
Jen zdroje se statusem `OVĚŘENO` / `ODVOZENO`. Pořadí podle **kde-to-je + dveře**:
1. **DVEŘE** — reality, správci krátkodobých pronájmů, NPÚ pronájem, film offices, stránky měst
2. **STÁTEM PŘEDTŘÍDĚNÉ** — NPÚ kategorie (VPR/VPZ/MPR/KPZ), ÚSOP, Wikidata
3. **MOTIV → DATABÁZE** — vodnimlyny, znicenekostely, industrialnitopografie, prazdnedomy, zanikleobce
4. **MAPY** — ČÚZK ortofoto (dispozice) → Mapy.com Static Panorama (úroveň očí) → uživatelské fotky
5. **VÝLOHY** — FB urbex Stránky, Instagram, fotografové architektury: jen s křížením na polohu
Paralelní subagenti — jeden na rodinu, pokud jsou k dispozici. Dráha B → fronta "projít u Macu".

## 4. Sklizeň → filtr → hodnocení fotek (`photo_standard.md`)
Tvrdé filtry → pHash dedup → Q na 5 osách → typ fotky. **Z ≤ 3 = pryč.** Do decku mix typů.

## 5. Geo-resolve (`references/geo_resolve.md`)
**Každý kandidát musí dostat GPS.** Řetězec: zdroj → Mapy.com geokódování → křížení
(FB ↔ prazdnedomy) → ortofoto půdorys → NPÚ katalog → autor. Bez polohy na úrovni ulice
= bucket `POLOHA NEZNÁMÁ`, mimo shortlist.

## 6. Skóre lokace (`scoring_rubric.md`)
6 dimenzí včetně **Acc**. Okoukanost z `filmovamista.cz` (−0.5 / −1.0).

## 7. Výstup
- HTML deck podle `html_template.md` — u každé fotky **licenční tier** a **zdroj**, u lokace **GPS + přesnost + dveře**.
- `sources.json` podle schématu v `karta_lokace.md`.
- Ulož `WEBSEARCH_lokaci_{projekt}_v{N}.html` + `.json`. Doručení podle prostředí (SendUserFile / artifact / present_files).
- Samostatná sekce **"Fronta pro dráhu B"** — co má uživatel otevřít u sebe a proč.

## 8. Zpětná vazba
Každé ANO/NE uživatele k fotce → `feedback.jsonl` (viz `photo_standard.md` §6). Neptej se na to zvlášť;
zapiš, když to řekne.

## Nikdy
- Nefabrikuj lokace, adresy, názvy FB skupin ani správců bytů. Nevidíš = neuvádíš.
- Nestahuj hromadně z IG/FB/Airbnb/Booking. Nestav proxy rotaci ani obcházení CAPTCHA.
- Nedávej do decku fotku bez licenčního tieru, ani lokaci bez GPS.
- Nehledej cestu do archivů lokačních agentur — jsou `ZAVŘENO`.
