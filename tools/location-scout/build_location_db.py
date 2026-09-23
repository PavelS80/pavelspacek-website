#!/usr/bin/env python3
"""Z jmenného seznamu v lokace_database.md udělá datovou tabulku s GPS.

Důvod existence: bez souřadnic si model vzdálenosti vymýšlí. Tenhle skript
je dohledá jednou, uloží do CSV a skill je pak jen čte.

    python3 build_location_db.py --out ../references/lokace_db.csv
    python3 build_location_db.py --motiv "HRAD — EXTERIÉRY" --limit 10
    python3 build_location_db.py --dry-run

Běh je dlouhý (stovky jmen, rate limit) a **přerušitelný** — co už je v CSV,
se přeskakuje, takže se dá pustit znovu a doběhne zbytek.

Vzdálenosti jsou ODHAD: vzdušná čára × silniční koeficient. Ne trasa z
navigace. Sloupce se proto jmenují `km_*_odhad`. Před rozpočtem ověřit
v mapách; na rozhodnutí "spadá to do dojezdu?" to stačí.
"""

import argparse
import csv
import math
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_commons_photos import (  # noqa: E402  — sdílený HTTP klient
    WIKIDATA_API,
    api_get,
    claim_values,
    get_entity,
)

# Základny štábu, na které se počítá dojezd (viz analyza.md).
BASES = {
    "praha": (50.0755, 14.4378),
    "brno": (49.1951, 16.6068),
    "bratislava": (48.1486, 17.1077),
    "olomouc": (49.5938, 17.2509),
    "liptov": (49.0836, 19.6203),  # Liptovský Mikuláš
}

# Hrubý obal ČR + SR. Slouží k odmítnutí cizích entit stejného jména
# (např. "Loket" jako obec jinde, nebo anglický homonym).
BBOX = {"lat": (47.6, 51.2), "lon": (11.9, 22.7)}

# Vzdušná čára × tohle ≈ silniční km. Empirické pravidlo pro ČR/SR.
ROAD_FACTOR = 1.28
AVG_KMH = 68.0

MOTIV_ALIAS = {
    "PODHRADÍ / MĚSTEČKO": "Podhradí",
    "HRAD — EXTERIÉRY": "Hrad ext",
    "HRAD — INTERIÉRY": "Hrad int",
    "MLÝN": "Mlýn",
    "LES": "Les",
    "POTOK / ŘÍČKA": "Potok",
    "CESTA / KRAJINA": "Cesta/Krajina",
}

CSV_FIELDS = [
    "motiv", "nazev", "zeme", "qid", "wikidata_label", "lat", "lon",
    "commons_kategorie", "top_pick", "poznamka", "confidence",
]


# --- parsování seznamu ----------------------------------------------------


def parse_database(path):
    """Vytáhne (motiv, název, země, hvězdička, poznámka) z lokace_database.md.

    Formáty v souboru jsou dva:
        **CZ:** Loket · Český Krumlov · Štramberk
        - Hoslovický mlýn (funkční, Prácheňské muzeum) ⭐
    """
    out = []
    motiv, country = None, None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.rstrip()
            if line.startswith("## "):
                head = line[3:].strip()
                motiv = MOTIV_ALIAS.get(head, head.title())
                country = None
                continue
            if motiv is None:
                continue

            # "**CZ:** a · b · c"  nebo  "**CZ:**" na samostatném řádku
            m = re.match(r"^\*\*(CZ|SK)[^:]*:\*\*\s*(.*)$", line)
            if m:
                country = m.group(1)
                rest = m.group(2).strip()
                if rest:
                    for raw in rest.split("·"):
                        item = _clean_item(raw)
                        if item:
                            out.append((motiv, country) + item)
                continue

            # "- Hoslovický mlýn (funkční) ⭐" — odrážka nese někdy i víc
            # jmen oddělených ·, stejně jako řádky u **CZ:**.
            if line.startswith("- ") and country:
                for raw in line[2:].split("·"):
                    item = _clean_item(raw)
                    if item:
                        out.append((motiv, country) + item)
    return out


def _clean_item(raw):
    """'Mlýn Hartmanice (Šumava) — ověřit ⭐' → ('Mlýn Hartmanice', True, '…')."""
    raw = raw.strip()
    if not raw:
        return None
    top = "⭐" in raw
    raw = raw.replace("⭐", "").strip()

    note_bits = []
    # Pozor na pořadí: 'ověřit' se hledá v původním textu, protože krok níž
    # ho ze jména odstraní.
    if re.search(r"ověřit", raw, re.IGNORECASE):
        note_bits.append("v seznamu označeno 'ověřit'")

    # Závorka je upřesnění, ne součást jména — na Wikidatech by shodila hledání.
    paren = re.findall(r"\(([^)]*)\)", raw)
    note_bits.extend(p.strip() for p in paren if p.strip() and "ověřit" not in p.lower())
    raw = re.sub(r"\([^)]*\)", " ", raw)

    # "— ověřit", "— ověřit konkrétně" apod. je značka nejistoty autora seznamu.
    raw = re.sub(r"\s*[—–-]\s*ověřit\b.*$", "", raw, flags=re.IGNORECASE)

    name = re.sub(r"\s+", " ", raw).strip(" ,;:")
    # "Mlýny v Kokořínském dole — Štampach, Močidla, Harasovský" je tři
    # lokace na jednom řádku; Wikidata to nenajdou a tiše by vypadly.
    tail = re.split(r"\s[—–]\s", name, maxsplit=1)
    if len(tail) == 2 and "," in tail[1]:
        note_bits.append("víc lokací na jednom řádku — rozepsat ručně")
    if not name or len(name) < 2:
        return None
    # Řádky typu "**Studia (vždy zvážit…):** Barrandov" nejsou lokace.
    if name.lower().startswith("studia"):
        return None
    return name, top, "; ".join(dict.fromkeys(note_bits))


# --- geometrie ------------------------------------------------------------


def haversine_km(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


def road_estimate(place, base):
    """Vzdušná čára → odhad silničních km a minut."""
    km = haversine_km(place, base) * ROAD_FACTOR
    return round(km), round(km / AVG_KMH * 60)


def in_bbox(lat, lon):
    return BBOX["lat"][0] <= lat <= BBOX["lat"][1] and BBOX["lon"][0] <= lon <= BBOX["lon"][1]


# --- Wikidata -------------------------------------------------------------


def search_candidates(name, lang="cs", limit=7):
    data = api_get(
        WIKIDATA_API,
        {
            "action": "wbsearchentities", "search": name, "language": lang,
            "uselang": lang, "type": "item", "limit": limit, "format": "json",
        },
    )
    return [h["id"] for h in data.get("search", [])]


def resolve(name, lang="cs"):
    """Vrátí (qid, label, lat, lon, commons_cat, confidence) nebo None.

    Filtruje na entity se souřadnicemi uvnitř ČR/SR — tím padnou cizí
    homonyma, která by jinak vyhrála podle pořadí ve fulltextu.
    """
    qids = search_candidates(name, lang)
    if not qids:
        return None

    hits = []
    for qid in qids[:5]:
        entity = get_entity(qid)
        if not entity:
            continue
        coords = claim_values(entity, "P625")
        if not coords or not isinstance(coords[0], dict):
            continue
        lat = coords[0].get("latitude")
        lon = coords[0].get("longitude")
        if lat is None or lon is None or not in_bbox(lat, lon):
            continue
        labels = entity.get("labels", {})
        label = next((labels[l]["value"] for l in ("cs", "sk", "en") if l in labels), qid)
        cats = [c for c in claim_values(entity, "P373") if isinstance(c, str)]
        sitelink = entity.get("sitelinks", {}).get("commonswiki", {}).get("title", "")
        if sitelink.startswith("Category:"):
            cats.append(sitelink[len("Category:"):])
        hits.append((qid, label, round(lat, 5), round(lon, 5), cats[0] if cats else ""))
        time.sleep(0.15)

    if not hits:
        return None
    # Víc kandidátů v ČR/SR = jméno je nejednoznačné, ať to člověk ví.
    confidence = "high" if len(hits) == 1 else "medium"
    return hits[0] + (confidence,)


# --- main -----------------------------------------------------------------


def load_done(path):
    if not os.path.exists(path):
        return set()
    with open(path, encoding="utf-8") as fh:
        return {(r["motiv"], r["nazev"]) for r in csv.DictReader(fh)}


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("--src", default=os.path.join(here, "..", "references", "lokace_database.md"))
    ap.add_argument("--out", default=os.path.join(here, "..", "references", "lokace_db.csv"))
    ap.add_argument("--bases", default="praha,brno,bratislava,olomouc",
                    help="čárkou oddělené základny: " + ", ".join(BASES))
    ap.add_argument("--motiv", help="jen jeden motiv (podřetězec názvu sekce)")
    ap.add_argument("--limit", type=int, help="max lokací v tomhle běhu")
    ap.add_argument("--lang", default="cs")
    ap.add_argument("--dry-run", action="store_true", help="jen vypiš, co by se hledalo")
    args = ap.parse_args()

    bases = [b.strip().lower() for b in args.bases.split(",") if b.strip()]
    unknown = [b for b in bases if b not in BASES]
    if unknown:
        raise SystemExit(f"neznámá základna: {', '.join(unknown)}. Známé: {', '.join(BASES)}")

    items = parse_database(args.src)
    if args.motiv:
        needle = args.motiv.lower()
        items = [i for i in items if needle in i[0].lower()]
    print(f"{len(items)} položek v seznamu")

    if args.dry_run:
        for motiv, country, name, top, note in items[: args.limit or 40]:
            star = " ⭐" if top else ""
            print(f"  {country} · {motiv:<16} {name}{star}" + (f"   [{note}]" if note else ""))
        print("\n(dry-run: nic se nedotazovalo ani nezapisovalo)")
        return

    fields = list(CSV_FIELDS)
    for b in bases:
        fields += [f"km_{b}_odhad", f"min_{b}_odhad"]

    done = load_done(args.out)
    todo = [i for i in items if (i[0], i[2]) not in done]
    if len(todo) < len(items):
        print(f"{len(items) - len(todo)} už v CSV, pokračuju na {len(todo)}")
    if args.limit:
        todo = todo[: args.limit]

    write_header = not os.path.exists(args.out)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    found = missing = 0
    with open(args.out, "a", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        if write_header:
            writer.writeheader()
        for motiv, country, name, top, note in todo:
            hit = resolve(name, args.lang)
            row = {
                "motiv": motiv, "nazev": name, "zeme": country,
                "top_pick": "ano" if top else "", "poznamka": note,
            }
            if hit:
                qid, label, lat, lon, cat, conf = hit
                row.update({
                    "qid": qid, "wikidata_label": label, "lat": lat, "lon": lon,
                    "commons_kategorie": cat, "confidence": conf,
                })
                for b in bases:
                    km, mins = road_estimate((lat, lon), BASES[b])
                    row[f"km_{b}_odhad"] = km
                    row[f"min_{b}_odhad"] = mins
                found += 1
                flag = "" if conf == "high" else "  (víc kandidátů — ověřit)"
                print(f"  ✓ {name:<32} {qid:<10} {lat},{lon}{flag}")
            else:
                row.update({"qid": "", "confidence": "low",
                            "poznamka": "; ".join(filter(None, [note, "na Wikidatech nenalezeno"]))})
                missing += 1
                print(f"  — {name:<32} nenalezeno")
            writer.writerow(row)
            fh.flush()  # běh je dlouhý; ať se přerušení neprojeví ztrátou
            time.sleep(0.2)

    print(f"\nhotovo: {found} s GPS, {missing} bez → {args.out}")
    if missing:
        print("Bez GPS = do decku bez vzdálenosti, nebo dohledat QID ručně.")


if __name__ == "__main__":
    main()
