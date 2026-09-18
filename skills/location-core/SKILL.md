---
name: location-core
description: Sdílené jádro pro location scouting v ČR (FILM HUNTERS) — skórovací rubrika lokace, fotografický standard (co je dobrá lokační fotka), schéma karty lokace, licenční politika zdrojů a HTML šablona decku. Samo o sobě nic nedělá; načítají ho skilly location-db a location-web, aby lokace z databáze a z internetu měly jedno srovnatelné skóre. Použít přímo jen na dotazy typu "jak se skóruje lokace", "co je dobrá fotka lokace", "jaká je licenční politika fotek".
---

# location-core — sdílené jádro

Jediný zdroj pravdy pro obě vyhledávací větve. Nic tu neběží; jsou tu pravidla.

| Soubor | K čemu |
|---|---|
| `references/scoring_rubric.md` | 6 dimenzí lokace, vzorec, štítky TOP/BACKUP/WILDCARD, korekce za okoukanost |
| `references/photo_standard.md` | tvrdé filtry + rubrika kvality fotky Q + typ fotky + brány |
| `references/karta_lokace.md` | povinná pole karty (GPS povinné), JSON schéma, HTML karta |
| `references/source_policy.md` | licenční tiery T1/T2/T3, statusy ověření zdrojů, kde vedeme čáru |
| `references/html_template.md` | CSS a struktura decku |

**Rozsah: pouze Česká republika.** Vzdálenost a dojezd se měří z Prahy.

**Pravidla, která platí vždy:**
1. Kandidát bez polohy alespoň na úrovni ulice nejde do decku.
2. Fotka se známkou Z ≤ 3 (detail) se zahazuje bez ohledu na zbytek.
3. Každá fotka nese licenční tier a každý zdroj status ověření.
4. Confidence label (high/medium/low) u každého klíčového tvrzení.
5. Nic se nefabrikuje. Neověřené = "ověřit scoutingem" + konkrétní krok.
