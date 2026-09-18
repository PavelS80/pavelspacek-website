# Karta lokace — schéma

## Povinná pole
```
Název lokace
Obec / okres / kraj
GPS: lat, lon                      ← POVINNÉ. Bez GPS = štítek POLOHA NEZNÁMÁ, mimo shortlist
Přesnost polohy: přesná | ulice | čtvrť | obec
Vzdálenost od Prahy: __ km · dojezd __ min
Motiv: [Podhradí / Hrad ext / Hrad int / Mlýn / Les / Potok / Cesta / Krajina / Vesnice /
        Statek / Skály / Most / Louka / BYT / DŮM / KANCELÁŘ / INDUSTRIÁL / ULICE / …]
Priorita: TOP / BACKUP / WILDCARD / INSPIRACE / POLOHA NEZNÁMÁ

Vizuální charakter (1–2 věty):
Hlavní výhody (2–3):
Hlavní rizika (2–3):
Doporučené záběry (3–5):

Dveře dovnitř: [kdo + jak: makléř / NPÚ pronájem / architekt / obec / správce pronájmů / film office / neznámý]
Kdo to spravuje / kontakt:
Film-friendly track record: [tituly z filmovamista.cz, nebo "ověřit"]
Okoukanost: N titulů na filmovamista.cz → korekce −0 / −0.5 / −1.0

Fotky: [seznam — každá: url · typ · Q · licenční tier T1/T2/T3 · zdroj · status]
Zdroj lokace: [web] · status zdroje: OVĚŘENO / ODVOZENO / NEOVĚŘENO

Skóre: Vis _ · Prak _ · Aut _ · Dost _ · Risk _ · Acc _ → Total _
Confidence: high / medium / low
```

## JSON (sources.json — jeden objekt na lokaci)
```json
{
  "id": "slug",
  "name": "", "municipality": "", "district": "", "region": "",
  "gps": {"lat": 0, "lon": 0, "precision": "exact|street|district|municipality|unknown"},
  "distance_km_prague": 0, "drive_min_prague": 0,
  "motifs": [], "priority": "TOP|BACKUP|WILDCARD|INSPIRACE|POLOHA_NEZNAMA",
  "door": {"who": "", "how": "", "contact": ""},
  "track_record": [], "overexposure_titles": 0, "overexposure_penalty": 0,
  "scores": {"vis":0,"prak":0,"aut":0,"dost":0,"risk":0,"acc":0,"total":0},
  "photos": [{"url":"","type":"","q":0,"axes":{"z":0,"p":0,"f":0,"s":0,"c":0},"license_tier":"T1|T2|T3","source":"","phash":""}],
  "source": {"site": "", "url": "", "status": "OVERENO|ODVOZENO|NEOVERENO"},
  "confidence": "high|medium|low", "known_in_db": false
}
```

## HTML karta
Použij `html_template.md`. Vždy zobrazit: GPS + přesnost, dveře dovnitř, štítek
licence u každé fotky. Šířka score baru = skóre × 10 %.
