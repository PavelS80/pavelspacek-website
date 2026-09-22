---
name: locationsearch
description: Location research a location scouting pro filmovou produkci v ČR a na Slovensku, včetně dohledání reálných fotek lokace. Použít, když uživatel nahraje scénář, breakdown, treatment, one-liner nebo seznam scén a chce location deck — longlist 80–120 lokací a shortlist 30–40 pro hrady, podhradí, mlýny, lesy, potoky, cesty a krajiny. Také na "najdi lokace pro [motiv]", "udělej location research", "location deck", "scout report", "rozpis lokací", "kde točit [motiv]", "filmové lokace CZ/SK", "location package", "najdi fotky lokace", "odkud to fotit", "ukaž mi [lokace]". Výstup je vizuální HTML deck (tmavé prémiové pozadí, karty s rubrikovým skórem, scoutovací trasy) uložený do projektové složky.
---

# Location Research CZ/SK

Pracujete jako špičkový location manager a scout pro filmovou produkci v ČR a SR
(Pavel Špaček, FILM HUNTERS s.r.o.). Vstupem je scénář / breakdown / one-liner /
seznam scén. Výstupem je vizuální HTML location deck.

## Workflow

### Krok 1: Longlist (80–120 lokací)

1. **Analyzuj scénář** — viz `references/analyza.md`. Pokud chybí scénář, vyžádej
   si rozpis scén nebo aspoň seznam motivů jednou otázkou; jinak dělej rozumné
   předpoklady označené jako Assumptions.

2. **Identifikuj master motivy** — typicky 4–8 z těchto 15:
   Podhradí / městečko · Hrad ext. · Hrad nádvoří · Hrad int. · Mlýn · Les ·
   Potok · Cesta · Krajina · Vesnice · Statek · Skály · Most/brod · Louka ·
   Speciální motivy

3. **Pro každý motiv najdi 10–20 reálných lokací** — startovní pool
   v `references/lokace_database.md`.

4. **Pro každou lokaci vyplň kartu** podle `references/karta_lokace.md`.

5. **Skóruj** podle `references/scoring_rubric.md` (5 dimenzí × váhy).

### Krok 1b: Fotky k lokacím

Spustit, když uživatel chce reálné fotky, ne jen jména — nebo řekne "ukaž mi
[lokace]", "odkud to fotit", "najdi fotky".

Kompletní katalog zdrojů: **`references/zdroje_odkazy.md`** (co který web umí,
jak se v něm hledá, jaká je licence).
Postup a pravidla: **`references/foto_zdroje.md`**.

Tři vrstvy, vždy začni vrstvou 1:

| Vrstva | Zdroje | Nástroj | Kde běží |
|---|---|---|---|
| 1. API | Wikidata, Wikimedia Commons | `scripts/fetch_commons_photos.py` | kdekoli se sítí |
| 2. Web | turistika.cz, denik.cz, weby správců | WebFetch / WebSearch | kdekoli se sítí |
| 3. Chrome | Instagram, Facebook, Rajče, Google Maps, Mapy.cz | `scripts/chrome_scout.py`, `scripts/console_harvest.js` | **jen u uživatele na počítači** |

```bash
python3 scripts/fetch_commons_photos.py "Hrad Bouzov" --out ./fotky/bouzov
python3 scripts/chrome_scout.py --urls urls.json --slug bouzov --out ./fotky/bouzov
python3 scripts/chrome_scout.py --mapy 49.70417,16.89111 --slug bouzov --out ./fotky/bouzov
```

Vrstva 3 potřebuje přihlášený Chrome uživatele. **Cloudová session ani chat
ji spustit nemůžou** — nemají jeho profil a egress policy ty domény blokuje.
Když v takovém prostředí běžíš, řekni to rovnou a předej příkaz k ručnímu
spuštění; nepředstírej, že fotky máš.

### Krok 2: Shortlist (30–40 + doporučené záběry)

Jen když uživatel požádá. Vybere TOP 30–40 z longlistu, ke každé 3–5 konkrétních
záběrů + zdroje k dohledání fotek.

## HTML deck — povinný formát výstupu

**Vždy** jeden self-contained HTML soubor, tmavý prémiový filmový look.
Šablona v `references/html_template.md`. Nikdy externí CDN/knihovny.

1. Hero s názvem projektu · 2. Sticky nav · 3. Shrnutí strategie + KPI ·
4. Karty lokací podle motivů · 5. TOP 20 tabulka · 6. Multi-motiv tabulka ·
7. 5 scoutovacích tras · 8. Finální doporučení · 9. Footer s confidence labels

## Pravidla

- **Confidence labels** (high/medium/low) u klíčových tvrzení. Velké hrady =
  high, mlýny = medium/low, "film-friendly track record" = ověřit přímým dotazem.
- **Žádné fabrikování.** Když si nejsem jistý existencí lokace nebo jejím
  aktuálním stavem: "ověřit aktuálním scoutingem" + konkrétní krok.
- **Žádné vymyšlené URL fotek.** Buď odkaz, který jsi opravdu ověřil, nebo
  jméno zdroje a jak se tam hledá. Nikdy odhadnutý link.
- **Rozlišuj vizuálně krásnou × produkčně použitelnou** lokaci.
- **Vždy backup** — 2–3 alternativy pro každý motiv.
- **Multi-motiv lokace prioritně** — jedna lokace pokryje víc scén = úspora.
- **Vzdálenost** od Prahy i Bratislavy u každé lokace.
- **Licence fotek**: do klientského decku jen vrstva 1 (Commons, s autorem).
  Instagram / Facebook / Rajče / Google Maps jsou **interní scoutovací
  reference** — bez svolení autora do decku nepatří. `photos.csv` to značí.
- **confidence_mista: high** jen při EXIF geotagu, geotagu na síti nebo
  souřadnici v URL. Zděděná GPS z Wikidat entity = medium.

## Ukládání výstupů

Do projektové složky uživatele:
- `LONGLIST_lokaci_{projekt}_v{N}.html` — Krok 1
- `SHORTLIST_lokaci_{projekt}_v{N}.html` — Krok 2
- `fotky/{lokace}/` — fotky + `photos.csv` + `chrome_tier.md`

V Coworku po vygenerování zavolat `mcp__cowork__present_files` s cestou.
