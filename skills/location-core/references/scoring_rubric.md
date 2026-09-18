# Skórovací rubrika lokace — 6 dimenzí (ČR)

Každá dimenze 1–10. Celkové skóre = vážený průměr. Zaokrouhlit na 1 desetinné místo.

## Dimenze a váhy

| Dim | Zkr. | Váha | 1–3 | 4–6 | 7–10 |
|---|---|---|---|---|---|
| Vizuální síla | **Vis** | 30 % | obyčejné, slabá silueta | dobré, pracovní | filmově silné, ikonické |
| Produkční praktičnost | **Prak** | 20 % | technika náročná, restrikce | středně, řešitelné | hladké, film-friendly historie |
| Autenticita / period | **Aut** | 15 % | rušivé moderní prvky | nutné dekoračně upravit | čisté |
| Dostupnost od Prahy | **Dost** | 10 % | > 2 h, problematický přístup | 1–2 h | < 1 h, snadný přístup pro techniku |
| Riziko (inverzní) | **Risk** | 10 % | vysoké (permits, sezóna, turisti) | střední | nízké, kontrolovatelné |
| **Přístup k objektu** | **Acc** | 15 % | nikdo, koho oslovit; majitel neznámý | majitel dohledatelný, za studena | protistrana *chce* být oslovena (na prodej/pronájem, NPÚ pronájem, film office) |

**⚠️ Váhy jsem změnil oproti master promptu v2 bez schválení:** Prak 25→20, Aut 20→15,
Risk 15→10, aby vzniklo 15 % pro Acc. **Pavel rozhodne.** Alternativa: váhy původní
(30/25/20/10/15) a Acc jako samostatná brána (Acc < 4 = nejde do shortlistu). Obojí drží Vis 30.

**Acc je nová dimenze** (2026-09). Měří to, co databáze neumí a internet ano:
jak snadné je se tam dostat. Byt na prodej = 9. Soukromý zámek bez kontaktu = 2.
Hrad NPÚ s oficiálním pronájmem pro film = 8.

## Vzorec
```
Total = (Vis×3 + Prak×2 + Aut×1.5 + Dost×1 + Risk×1 + Acc×1.5) / 10
```
Součet vah = 10. Kontrola: 3+2+1.5+1+1+1.5 = 10 ✓

## Korekce za okoukanost — jen v režimu `nove`
Přepínač `rezim: nove | overene`. Producent, který chce *prověřenou* film-friendly lokaci,
okoukanost nepenalizuje. Výchozí pro location-web je `nove`.
Podle počtu titulů na `filmovamista.cz` u téže lokace:
- ≥ 10 titulů → **−0.5**
- ≥ 20 titulů → **−1.0**
- v `lokace_database.md` už je → označit `ZNÁMÁ`, do výstupu "nové varianty" nejde vůbec

## Štítky
- **TOP** — Total ≥ 8.0 **a** Vis ≥ 8.5
- **BACKUP** — Total 7.0–7.9, nebo alternativa k TOP
- **WILDCARD** — Vis ≥ 8.5, ale Prak nebo Dost nebo Risk nebo Acc < 6
- **INSPIRACE** — Total < 7.0, vizuální zájem pro mood
- **POLOHA NEZNÁMÁ** — bez GPS; nikdy v shortlistu, jen mood bucket

## Příklad
**Křivoklát** (NPÚ, oficiální pronájem pro film)
Vis 9.0 · Prak 8.0 · Aut 9.0 · Dost 9.5 (50 km) · Risk 6.5 · Acc 8.0
Total = (27 + 16 + 13.5 + 9.5 + 6.5 + 12) / 10 = **8.45 → 8.5 → TOP**
Okoukanost: na filmovamista.cz u desítek titulů → **−1.0 → 7.5 → BACKUP**.
Přesně tak to má být: Křivoklát je skvělý a *každý ho zná*. Pro "nové varianty" je backup.

**Poznámka ke starému příkladu:** původní rubrika uváděla Oblazy (SK) s Total 7.2 jako TOP,
což odporovalo vlastní definici (TOP ≥ 8.0). SK je mimo rozsah; příklad odstraněn.
