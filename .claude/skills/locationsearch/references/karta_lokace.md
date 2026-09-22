# Template — karta lokace

## Required pole

```
Název lokace
Země: CZ / SK
Region: [kraj]
Vzdálenost od Prahy: __ km
Vzdálenost od Bratislavy: __ km
Motiv: [Podhradí / Hrad ext / Hrad int / Mlýn / Les / Potok / Cesta / Krajina / ...]
Priorita: TOP / BACKUP / WILDCARD / Inspirace

Vizuální charakter (1-2 věty):
Hlavní výhody (2-3 bullets):
Hlavní rizika (2-3 bullets):
Doporučené záběry (3-5):
Zdroje fotek (3+): [oficiální web, Mapy.cz, Wikimedia, NPÚ, ...]
Kdo to spravuje / kontakt: [NPÚ / soukromý / obec / Lesy ČR / ŠOP SR]
Film-friendly track record: [konkrétní filmy nebo "ověřit"]

Skóre:
  Vis _/10
  Prak _/10
  Aut _/10
  Dost _/10
  Risk _/10
  Total _/10
```

## HTML template karty

```html
<div class="card">
  <div class="card-head">
    <div>
      <div class="card-title">[NÁZEV]</div>
      <div class="card-region">[CZ/SK] · [REGION] · [VZD] km od [Prahy/Bratislavy]</div>
    </div>
    <span class="tag tag-[top|backup|wild]">[TOP|BACKUP|WILDCARD]</span>
  </div>
  <p>[VIZUÁLNÍ CHARAKTER]</p>
  <div class="pros-cons">
    <div class="pros"><span class="label">Výhody</span>[VÝHODY]</div>
    <div class="cons"><span class="label">Rizika</span>[RIZIKA]</div>
  </div>
  <div class="shots"><strong>Záběry:</strong> [3-5 záběrů oddělených ·]</div>
  <div class="sources"><strong>Zdroje:</strong> [3 zdroje oddělené ·]</div>
  <div class="scores">
    <div class="score-row"><span class="score-label">Vis</span><div class="score-bar"><div class="score-fill" style="width:X%"></div></div><span class="score-value">X.X</span></div>
    [...stejně pro Prak, Aut, Dost, Risk]
  </div>
  <div class="total"><span class="l">Celkové skóre</span><span class="v">X.X</span></div>
</div>
```

Width % = score × 10 (např. 8.5 → 85%).
