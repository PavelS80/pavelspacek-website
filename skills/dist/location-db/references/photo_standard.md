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

## 3. Brány — **per typ fotky** (opraveno 2026-09-18 po kalibraci na reálných recce)
- **Z ≤ 3 → zamítnout.** Detail není lokace. Bez výjimky, u všech typů.
- **`recce` (vlastní obhlídka, film office):** hodnotit **jen Z + P** —
  `Q_recce = (Z×5 + P×5)/10`. Úkol recce fotky je *dokumentovat*, ne líbit se.
  `Q_recce ≥ 8` = režisér rozhodne bez cesty. F/S/C ignorovat.
- **ostatní typy (realitní, editorial, turistický…):** plné Q.
  **Q ≥ 7.0** → do decku · **5.0–6.9** → interní reference · **< 5.0** → zahodit
- **Deck pro klienta** = *výběr* 3–5 fotek z ~50 recce; teprve tam se uplatní F/S/C.

Důvod opravy: kuchyň Pod Vinicí (exemplář 2) má Z 9 · P 9 · F 5 · S 6 · C 4 → plné Q 6.9 →
„jen interní reference". Jenže dělá přesně to, co má. Jedna brána pro všechny typy byla chyba.

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

### 5a. Recce gramatika FILM HUNTERS (pozorováno na 5 fotkách, 2 lokace, VVK2 2026)
1. **Exteriér:** celá fasáda + sousedi + ulice, z protějšího chodníku, mírně zdola; **kontext**
   (co je vedle, co je v pozadí — paneláky, ulice, auta) je součást informace.
2. **Interiér:** **ze dveří nebo z rohu, ultra-wide, od podlahy ke stropu, směrem k oknu.**
   Vidíš dvě až tři stěny, strop, podlahu a zdroj světla najednou.
3. **Nic neuklizeno, nic nesvíceno.** Poctivý nepořádek = poctivý prostor. Zataženo, denní světlo.
4. Raw 4032×3024 (4:3, iPhone), ~50 fotek/lokace, `<Lokace>_Interier_N` / `_Exterier_N`.
   Deck-export: 1280×720 (16:9 ořez). Tvrdý filtr 1200 px je pro deck-exporty *na hraně* — ponechat.

### 5b. Exempláře (Drive file ID; fotky se do repa nedávají — soukromé interiéry)

| # | Lokace / soubor | Drive ID | Verdikt lokace | Z | P | F | S | C | Q_recce | Poznámka |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pod Vinicí 332 · Exteriér_2 | `1p5umxGYku-NZkxzV9NygfW41ODNdqoxa` | **ZAMÍTNUTA** (high) | 8 | 8 | 6 | 5 | 5 | **8.0** | fasáda + sousedi + ulice + paneláky v pozadí; sbíhající se svislice, schodolez, smeták — a přesto vše čitelné |
| 2 | Pod Vinicí 332 · Interiér_9 (kuchyň) | `1fMffMHtwF46Zq4cyX4FmNNOd1jHNzRO5` | ZAMÍTNUTA | 9 | 9 | 5 | 6 | 4 | **9.0** | ze dveří k oknu, celá galerie kuchyně, šířka ~2,5 m odhadnutelná; **vzorová recce** |
| 3 | Pod Vinicí 332 · Interiér_22 (obývák) | `1q_z3AMyYTKQkRcQwo_yI9vReQq7wd4PJ` | ZAMÍTNUTA | 9 | 9 | 6 | 6 | 5 | **9.0** | z rohu, nízko, k oknu; červená stěna = charakter; kabely, rotoped |
| 4 | Raisová 18 · (6) obývák | `1QhjShhGXo0j0ioB6DfWcoFrJ4yc8a3rR` | **SCHVÁLENA** (high) | 8 | 8 | 7 | 6 | 4 | **8.0** | kazetový strop, koberec, pečovatelská postel v obýváku, balkón — obydlené, opotřebené, **s příběhem** |
| 5 | Raisová 18 · (20) dětský pokoj | `1aad9d7K_BTrHK2Fdrbwk7qxpdZybJSqz` | SCHVÁLENA | 8 | 8 | 8 | 7 | 5 | **8.0** | policejní tematika, páska „VSTUP ZAKÁZÁN" — pro krimi pokoj, který *hraje* |

**Fotografická kvalita je u obou lokací stejná** (Q_recce 8–9). Rozdíl mezi zamítnutou a schválenou
tedy **není ve fotce** — je v lokaci.

### 5c. Hypotéza o lokačním vkusu (jeden pár → **confidence: medium**)
Pod Vinicí: čistá, generická, laminát, akcentová stěna — „hezké, ale anonymní".
Raisová: textury, koberec, kazetový strop, stopy života, dětský pokoj s tématem.
→ **Pro regionální krimi vítězí autenticita a charakter nad úklidem.** *Reálný, obydlený, lehce
opotřebený, s příběhem* > *čistý, generický*. Ověřit na dalších párech; může hrát i majitel,
dostupnost, exteriér (Pod Vinicí 332 = adresa, kde se vyzvedával majitel jiné lokace).

### 5d. Seed na úrovni lokací — z křížení scout složek × režijních obhlídek VVK2
Viz `PLAN-location-search.md` §14. Zbývá: stáhnout po 2–3 fotkách z každé, doplnit tabulku 5b
na 12 + 12. Zdroje:
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
