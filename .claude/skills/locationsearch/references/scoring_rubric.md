# Scoring rubrika — 5 dimenzí

Každá lokace má 5 dimenzí, každá 1–10. Celkové skóre = vážený průměr.

## Váhy
- **Visual (Vis)** — vizuální síla: **30 %**
- **Practical (Prak)** — produkční praktičnost: **25 %**
- **Authenticity (Aut)** — period accuracy: **20 %**
- **Accessibility (Dost)** — dostupnost od základny: **10 %**
- **Risk (Risk)** — inverzní (vyšší = nižší riziko): **15 %**

## Stupnice

| Dim | 1–3 | 4–6 | 7–10 |
|---|---|---|---|
| Vis | obyčejné, slabá silueta | dobré, pracovní | filmově silné, ikonické |
| Prak | technika náročná, restrikce | středně, řešitelné | hladké, film-friendly historie |
| Aut | rušivé moderní prvky, špatný period | nutné dekoračně upravit | čisté, žádné rušivé prvky |
| Dost | > 2 h od základny, problematický přístup | 1–2 h | < 1 h, snadný přístup pro techniku |
| Risk | vysoké (permits, sezóna, turisti, počasí) | střední | nízké, ověřené, kontrolovatelné |

## Formula
```
Total = (Vis × 3 + Prak × 2.5 + Aut × 2 + Dost × 1 + Risk × 1.5) / 10
```

Zaokrouhlit na 1 desetinné místo.

## Prioritní štítky

Pravidla jsou **seřazená a vzájemně výlučná** — platí první, které sedí.
Nepočítej je ručně, použij `scripts/score.py`.

1. **WILDCARD** — Vis ≥ 8.5 **a zároveň** min(Prak, Risk) < 6
   → vysoký risk, vysoký reward
2. **TOP** — celkové ≥ 8.0 **a zároveň** Vis ≥ 8.5
3. **BACKUP** — celkové ≥ 7.0
4. **JEN PRO INSPIRACI** — celkové < 7.0, vizuální zájem pro mood

**Dost se do WILDCARDu nezapočítává.** Vzdálenost se řeší přesunem základny,
kdežto nízká praktičnost nebo vysoké riziko ne. Kdyby Dost do pravidla patřil,
byla by wildcard každá krásná lokace na druhém konci republiky — což je
informace o plánu, ne o lokaci.

### Dost z dojezdu, ne od oka

Pásma výš jsou definovaná časem, tak ho i použij. `score.py --minutes N`
(nebo `--db lokace_db.csv --name X --base praha`) převede:

| Dojezd | Dost |
|---|---|
| ≤ 30 min | 10 |
| 30 → 60 min | 10 → 7 |
| 60 → 120 min | 6 → 4 |
| 120 → 240 min | 3 → 1 |
| > 240 min | 1 |

Skok na hranici pásma je záměr — kopíruje nespojitá pásma v tabulce výš.

## Příklady aplikace

**Křivoklát**:
- Vis 9.0 (královská gotika, ikonická silueta)
- Prak 8.0 (NPÚ + film-friendly history)
- Aut 9.0 (period čistá)
- Dost 9.5 (50 km od Prahy)
- Risk 6.5 (turisti, provozní hodiny)
- Total = (27 + 20 + 18 + 9.5 + 9.75) / 10 = 8.4 → **TOP**

**Oblazy mlýn (Kvačianska dolina)**:
- Vis 10 (ikona)
- Prak 4.5 (pěší přístup 1,5 h, drahá logistika)
- Aut 10 (skutečně izolovaný, funkční)
- Dost 2.5 (320 km od Bratislavy)
- Risk 5.5 (NP, sezóna)
- Total = (30 + 11.25 + 20 + 2.5 + 8.25) / 10 = 7.2 → **WILDCARD**

  Dřív tu stálo TOP „protože vizuál vyhraje". To ale odporovalo vlastnímu
  prahu TOP (≥ 8.0) a dělalo štítky nepředvídatelné. WILDCARD říká totéž
  přesněji: ikonický vizuál, ale Prak 4.5 — jeď tam jen, když je na to
  v plánu prostor.

**Bouzov** (ukazuje, proč je štítek vždy vázaný na základnu):
- Vis 9.0 · Prak 7.5 · Aut 7.0 · Risk 6.5, Dost podle dojezdu
- Z Prahy (~210 min → Dost 1.5): Total **7.1** → BACKUP
- Z Olomouce (~30 min → Dost 10): Total **8.0** → TOP

Stejná lokace, jiný štítek. **Vždy uveď, ke které základně se skóre vztahuje.**
