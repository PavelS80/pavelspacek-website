# Fotografický standard — co je dobrá lokační fotka

Cíl: fotka, která dá **přehled o prostoru**. Ne detail, ne nálada, ne jídlo.

## 1. Tvrdé filtry (běží první, bez modelu)
Zahodit, pokud:
- delší strana < **1200 px**
- poměr stran < 0.5 nebo > 3.0
- název / `alt` / CSS obsahuje: `pudorys`, `floorplan`, `plan`, `mapa`, `logo`, `watermark`, `stitek`, `qr`, `avatar`, `thumb`
- vodoznak fotobanky (Shutterstock / Alamy / iStock / Profimedia vzor)
- perceptuální duplicita: pHash Hamming ≤ 6 s už přijatou fotkou → ponechat lepší Q

## 2. Rubrika kvality Q — 5 os, 1–10

| Osa | Váha | 1–3 | 4–6 | 7–10 |
|---|---|---|---|---|
| **Z — Záběr** | 30 % | detail (klika, váza, umyvadlo, obličej, jídlo) | část prostoru, jeden roh | celý prostor: stěny→strop, nebo celá fasáda s kontextem |
| **P — Čitelnost prostoru** | 25 % | nepoznáš geometrii | tušíš dispozici | jasné dveře, okna, východy, co navazuje |
| **F — Filmová hodnota** | 20 % | plochá, bez charakteru | použitelná | čte se jako místo; textura, vrstvy hloubky, existuje kamerová pozice |
| **S — Světlo** | 15 % | blesk, vypálená okna, noční HDR kaše | průměrné | čitelný směr denního světla, okna v záběru |
| **C — Čistota rámu** | 10 % | vodoznak, lidi, rybí oko, staging přes celý prostor | drobné rušivé prvky | čistý rám |

```
Q = (Z×3 + P×2.5 + F×2 + S×1.5 + C×1) / 10
```

## 3. Brány
- **Z ≤ 3 → zamítnout.** Detail není lokace. Bez výjimky.
- **Q ≥ 7.0** → do decku
- **Q 5.0–6.9** → interní reference (místo existuje; fotku nepoužijeme)
- **Q < 5.0** → zahodit

## 4. Typ fotky — každý zdroj lže jinak
Každá fotka dostane štítek. Do decku jde vždy **mix typů**.

| Typ | Odkud | Říká pravdivě | Klame v |
|---|---|---|---|
| `recce` | film offices, vlastní obhlídky | geometrie, reálné světlo, přístup | kvalita, stáří |
| `realitni-wide` | Sreality, S&W, Luxent | úplné pokrytí, dispozice | ultra-wide zkreslení (2× větší), HDR falešné světlo, staging |
| `airbnb` | krátkodobé pronájmy | obydlený stav, vybavení | přeexponované, teplý filtr, těsné ořezy |
| `turisticky` | Mapy.com, Google, FB | reálné světlo, počasí, sezóna, davy | náhodná kompozice, lidi, rozlišení |
| `editorial` | Archiweb, fotografové architektury, ČCA | nejlepší kompozice, čistý prostor | jen hero úhly; neřekne, co je za kamerou |
| `dron` | YouTube, IG | kontext, okolí, příjezd | není úroveň očí; nic o interiéru |
| `panorama` | Mapy.com Static Panorama API | systematické, volitelný směr | jen z cesty; nedostane se dovnitř |
| `archiv` | fotohistorie, zaniklé obce, stabilní katastr | period reference | **neaktuální — vždy ověřit, že objekt stojí** |

## 5. Exempláře — seed (F1)
**STAV: TODO.** Kalibrovat z těchto schválených výběrů na Google Drivu (ID souboru):
- `Vraždy v kraji 2_vyber lokaci.pdf` — `12B8V7qx14I3Hb1w3gEW5uH3OeRanBv1D`
- `FAVORITE LOCATIONS - ALLEGRO CZ.pdf` — `18CKuj8KOAQ_T-ZpGlamabzo3IKp4qd__`
- `Brothers Location summary 2205.pdf` — `16Q1u760YaOZt_hV_8mWMApOupG9cVTyq`
- `Victura Scout Plan V2` — `1l9kveQ8wo8K-hGkzd5T68OabPmeN8Xte` vs. **V4** — `17YscLyfQ8ckfm2u74aIik4zG2nvz_YFI`
  → **diff V2→V4 = co vypadlo = negativní exempláře**
- Kalibrace rámování (osy Z, P): složky `location scout DDMMYYYY` (vlastní recce)

Postup: 12 POZITIVNÍCH + 12 NEGATIVNÍCH, ke každé skóre na 5 osách + 1 věta proč.
Zapsat sem jako `### Exemplář N — [POZ/NEG]`.

## 6. Učicí smyčka
- Každé ANO/NE od Pavla → řádek do `feedback.jsonl`:
  `{"url","phash","verdict":"ANO|NE","predicted_Q","axes":{Z,P,F,S,C},"date"}`
- Po ~50 záznamech: přegenerovat §5 a **změřit shodu** (predikce vs. verdikt).
- Cíl > 80 % po třetí rekalibraci. Pod tím = rubrika je špatně, přepsat, ne dolaďovat.
