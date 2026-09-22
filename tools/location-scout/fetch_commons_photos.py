#!/usr/bin/env python3
"""Stáhne scoutovací fotky lokace z Wikidata + Wikimedia Commons.

Pouze stdlib (urllib, json, csv) — nic se neinstaluje. Respektuje HTTPS_PROXY
a SSL_CERT_FILE / REQUESTS_CA_BUNDLE z prostředí.

    python3 fetch_commons_photos.py "Hrad Bouzov" --out ./bouzov
    python3 fetch_commons_photos.py --qid Q940492 --limit 40 --width 2560
    python3 fetch_commons_photos.py "Pernštejn" --dry-run

Výstup ve složce --out:
    <slug>_commons_01.jpg ...   stažené fotky
    photos.csv                  metadata (zdroj, autor, licence, GPS, confidence)
    chrome_tier.md              checklist zdrojů, které API nepokryje
"""

import argparse
import csv
import html
import json
import os
import re
import ssl
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

WIKIDATA_API = "https://www.wikidata.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# Wikimedia vyžaduje identifikující User-Agent, jinak vrací 403.
USER_AGENT = (
    "FilmHuntersLocationScout/1.0 "
    "(https://pavelspacek.com; location research) python-urllib"
)

# Formáty, které nemá smysl tahat do scoutovacího decku.
SKIP_EXT = (".svg", ".pdf", ".tif", ".tiff", ".ogv", ".webm", ".djvu", ".xcf", ".stl")

# Soubory, které bývají v kategorii, ale nejsou fotka místa.
SKIP_NAME_RE = re.compile(
    r"(coat[ _]of[ _]arms|znak|erb|logo|mapa|map[ _]of|plan[ _]of|p[uů]dorys|"
    r"seal|flag|vlajka|diagram|schema|sch[eé]ma)",
    re.IGNORECASE,
)

TAG_RE = re.compile(r"<[^>]+>")


def build_opener(timeout_ctx=None):
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    ctx = ssl.create_default_context(cafile=ca) if ca else ssl.create_default_context()
    handlers = [urllib.request.HTTPSHandler(context=ctx)]
    # urllib.request.ProxyHandler() bez argumentů čte http_proxy/https_proxy z env.
    handlers.append(urllib.request.ProxyHandler())
    opener = urllib.request.build_opener(*handlers)
    opener.addheaders = [("User-Agent", USER_AGENT)]
    return opener


OPENER = build_opener()


def api_get(url, params, retries=3):
    """GET s JSON odpovědí, exponenciální backoff na síťové chyby."""
    query = urllib.parse.urlencode(params, doseq=True)
    full = f"{url}?{query}"
    delay = 2
    for attempt in range(retries):
        try:
            with OPENER.open(full, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt == retries - 1:
                raise SystemExit(f"API selhalo ({full[:120]}…): {exc}")
            time.sleep(delay)
            delay *= 2
    return {}


def slugify(name):
    # Oddělovače na mezeru dřív, než je ASCII fold beze stopy spolkne a slepí
    # slova dohromady ("Žďár—nad" → "zdarnad").
    spaced = re.sub(r"[^\w]+", " ", name, flags=re.UNICODE)
    ascii_name = unicodedata.normalize("NFKD", spaced).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", ascii_name).strip("_").lower()
    return slug or "lokace"


def clean_html(value):
    if not value:
        return ""
    return html.unescape(TAG_RE.sub(" ", value)).strip().replace("\n", " ")


# --- Wikidata -------------------------------------------------------------


def search_entity(name, lang="cs"):
    data = api_get(
        WIKIDATA_API,
        {
            "action": "wbsearchentities",
            "search": name,
            "language": lang,
            "uselang": lang,
            "type": "item",
            "limit": 7,
            "format": "json",
        },
    )
    return data.get("search", [])


def get_entity(qid):
    data = api_get(
        WIKIDATA_API,
        {
            "action": "wbgetentities",
            "ids": qid,
            "props": "claims|labels|descriptions|sitelinks",
            "languages": "cs|sk|en",
            "format": "json",
        },
    )
    return data.get("entities", {}).get(qid, {})


def claim_values(entity, prop):
    out = []
    for claim in entity.get("claims", {}).get(prop, []):
        snak = claim.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        out.append(snak.get("datavalue", {}).get("value"))
    return out


def entity_summary(entity, qid):
    labels = entity.get("labels", {})
    label = next(
        (labels[l]["value"] for l in ("cs", "sk", "en") if l in labels), qid
    )
    coords = claim_values(entity, "P625")
    lat = lon = ""
    if coords and isinstance(coords[0], dict):
        lat = round(coords[0].get("latitude", 0), 5)
        lon = round(coords[0].get("longitude", 0), 5)

    # P373 = Commons category, plus sitelink commonswiki jako záloha.
    cats = [c for c in claim_values(entity, "P373") if isinstance(c, str)]
    sitelink = entity.get("sitelinks", {}).get("commonswiki", {}).get("title", "")
    if sitelink.startswith("Category:"):
        cats.append(sitelink[len("Category:"):])

    lead = [v for v in claim_values(entity, "P18") if isinstance(v, str)]
    return {
        "qid": qid,
        "label": label,
        "lat": lat,
        "lon": lon,
        "categories": list(dict.fromkeys(cats)),
        "lead_image": lead[0] if lead else "",
    }


# --- Commons --------------------------------------------------------------


def category_files(category, depth=1, seen_cats=None, limit=400):
    """Vrátí seznam File: titulů v kategorii, volitelně i z podkategorií."""
    seen_cats = seen_cats if seen_cats is not None else set()
    title = category if category.startswith("Category:") else f"Category:{category}"
    if title in seen_cats:
        return []
    seen_cats.add(title)

    files, subcats = [], []
    cont = {}
    while True:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": title,
            "cmtype": "file|subcat",
            "cmlimit": "500",
            "format": "json",
        }
        params.update(cont)
        data = api_get(COMMONS_API, params)
        for member in data.get("query", {}).get("categorymembers", []):
            if member.get("ns") == 14:
                subcats.append(member["title"])
            elif member.get("ns") == 6:
                files.append(member["title"])
        cont = data.get("continue", {})
        if not cont or len(files) >= limit:
            break

    if depth > 0:
        for sub in subcats:
            if len(files) >= limit:
                break
            files.extend(category_files(sub, depth - 1, seen_cats, limit))
    return files


def image_info(titles, width):
    """imageinfo po dávkách po 50 (limit API pro anonymní dotazy)."""
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i : i + 50]
        data = api_get(
            COMMONS_API,
            {
                "action": "query",
                "titles": "|".join(chunk),
                "prop": "imageinfo",
                "iiprop": "url|size|mime|extmetadata",
                "iiurlwidth": str(width),
                "format": "json",
            },
        )
        for page in data.get("query", {}).get("pages", {}).values():
            info = (page.get("imageinfo") or [{}])[0]
            if info:
                out[page["title"]] = info
        time.sleep(0.2)
    return out


def usable(title, info, min_width):
    if title.lower().endswith(SKIP_EXT):
        return False
    if SKIP_NAME_RE.search(title):
        return False
    if not (info.get("mime") or "").startswith("image/"):
        return False
    return info.get("width", 0) >= min_width


def meta_row(title, info, place):
    ext = info.get("extmetadata", {})

    def field(key):
        return clean_html(ext.get(key, {}).get("value", ""))

    lat = field("GPSLatitude")
    lon = field("GPSLongitude")
    geotagged = bool(lat and lon)
    return {
        "soubor": "",
        "zdroj": "Wikimedia Commons",
        "titul": title[len("File:"):] if title.startswith("File:") else title,
        "page_url": info.get("descriptionurl", ""),
        "direct_url": info.get("thumburl") or info.get("url", ""),
        "full_url": info.get("url", ""),
        "autor": field("Artist"),
        "licence": field("LicenseShortName"),
        "datum": field("DateTimeOriginal") or field("DateTime"),
        "px": f"{info.get('width', '')}x{info.get('height', '')}",
        "lat": lat or place["lat"],
        "lon": lon or place["lon"],
        # Geotag na fotce = jistota místa; jinak dědíme GPS lokace z Wikidat.
        "confidence_mista": "high" if geotagged else "medium",
        "motiv": "",
        "poznamka": "" if geotagged else "GPS z Wikidat lokace, ne z EXIF fotky",
    }


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    delay = 2
    for attempt in range(3):
        try:
            with OPENER.open(req, timeout=120) as resp, open(dest, "wb") as fh:
                fh.write(resp.read())
            return True
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == 2:
                print(f"  ! nestaženo {os.path.basename(dest)}: {exc}", file=sys.stderr)
                return False
            time.sleep(delay)
            delay *= 2
    return False


# --- Chrome tier ----------------------------------------------------------


def chrome_tier_md(place, name):
    lat, lon = place["lat"], place["lon"]
    q = urllib.parse.quote(name)
    has_gps = bool(lat and lon)
    mapy = (
        f"https://mapy.cz/zakladni?x={lon}&y={lat}&z=17" if has_gps else "https://mapy.cz"
    )
    mapy_air = f"{mapy}&base=ophoto" if has_gps else "https://mapy.cz"
    gmaps = (
        f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
        if has_gps
        else f"https://www.google.com/maps/search/?api=1&query={q}"
    )
    return f"""# Chrome tier — {name}

API tier (Wikidata + Commons) je hotový. Tyhle zdroje nejdou stáhnout skriptem,
protože vyžadují přihlášení nebo JS render — projít ručně v Chrome, pořadí podle
výtěžnosti. Screenshot ukládej vedle Commons fotek, řádek dopiš do `photos.csv`.

GPS lokace: {lat or "?"} N, {lon or "?"} E (Wikidata {place["qid"]})

1. **Mapy.cz — Panorama** → {mapy}
   Příjezdová cesta, podhradí, parkování. V levém panelu zapnout Panorama.
   Vrstva Letecká: {mapy_air} — v UI přepni i na historickou leteckou (50. léta)
   a porovnej zástavbu. `confidence_mista: high` (souřadnice jsou v URL).
2. **Instagram — místo, ne hashtag** → hledat "{name}", zvolit *místo* (geotag),
   řadit podle nejnovějších. Dává aktuální stav, sezónu a davy. Ulož 5–10 fotek
   s datem. `confidence_mista: high` (geotag), licence = nutno řešit s autorem.
3. **Facebook** → oficiální stránka správce lokace (NPÚ / obec / soukromý
   majitel) + místní obecní skupina, filtr Fotky. Jediný zdroj pro akce,
   interiéry a aktuální rekonstrukce. `confidence_mista: high`.
4. **Rajče** (rajce.idnes.cz) → alba nejsou v Google, hledat přímo na webu
   dotazem "{name}". Preferuj alba s rokem v názvu. Silné na interiéry
   z prohlídkových tras, které na Commons chybí. `confidence_mista: medium`.
5. **Google Maps — fotky návštěvníků** → {gmaps}
   Řadit podle nejnovějších; dobré na parkování, přístup a zázemí.
6. **Regionální deníky** (denik.cz tag lokace, turistika.cz) → často přímé URL
   obrázků, dají se stáhnout i bez Chrome. Titulek nese místo → `medium`.

Poznámka k právům: Commons fotky mají licenci ve `photos.csv` a jdou použít
v decku s uvedením autora. Fotky z IG/FB/Rajče/Maps jsou **jen scoutovací
reference** — do klientského decku je nedávej bez svolení autora.
"""


# --- main -----------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", nargs="?", help="název lokace, např. \"Hrad Bouzov\"")
    ap.add_argument("--qid", help="Wikidata QID, přeskočí vyhledávání")
    ap.add_argument("--out", default=".", help="výstupní složka (default: .)")
    ap.add_argument("--limit", type=int, default=30, help="max fotek ke stažení (default 30)")
    ap.add_argument("--width", type=int, default=2560, help="šířka thumbnailu v px (default 2560)")
    ap.add_argument("--min-width", type=int, default=1200, help="ignoruj originály užší než X px")
    ap.add_argument("--depth", type=int, default=1, help="zanoření do podkategorií (default 1)")
    ap.add_argument("--lang", default="cs", help="jazyk vyhledávání na Wikidatech")
    ap.add_argument("--dry-run", action="store_true", help="jen vypiš, nestahuj")
    args = ap.parse_args()

    if not args.name and not args.qid:
        ap.error("zadej název lokace nebo --qid")

    qid = args.qid
    if not qid:
        hits = search_entity(args.name, args.lang)
        if not hits:
            raise SystemExit(f"Wikidata: nic pro \"{args.name}\". Zkus --qid ručně.")
        qid = hits[0]["id"]
        print(f"Wikidata: {qid} — {hits[0].get('label')} ({hits[0].get('description', '')})")
        if len(hits) > 1:
            alts = ", ".join(f"{h['id']}={h.get('label')}" for h in hits[1:4])
            print(f"  další kandidáti: {alts}")

    place = entity_summary(get_entity(qid), qid)
    name = args.name or place["label"]
    print(f"GPS: {place['lat']}, {place['lon']} · kategorie: {place['categories'] or '—'}")

    if not place["categories"]:
        print("Commons kategorie na Wikidatech chybí — zbývá jen Chrome tier.", file=sys.stderr)

    titles = []
    for cat in place["categories"]:
        titles.extend(category_files(cat, depth=args.depth))
    if place["lead_image"]:
        titles.insert(0, f"File:{place['lead_image']}")
    titles = list(dict.fromkeys(titles))
    print(f"Commons: {len(titles)} souborů v kategoriích")

    infos = image_info(titles, args.width) if titles else {}
    picked = [(t, i) for t, i in infos.items() if usable(t, i, args.min_width)]
    # Největší originály první — scoutovací rozlišení má přednost.
    picked.sort(key=lambda ti: ti[1].get("width", 0) * ti[1].get("height", 0), reverse=True)
    picked = picked[: args.limit]
    print(f"Použitelných: {len(picked)} (po filtru ≥{args.min_width}px, limit {args.limit})")

    os.makedirs(args.out, exist_ok=True)
    slug = slugify(name)
    rows = []
    for idx, (title, info) in enumerate(picked, start=1):
        row = meta_row(title, info, place)
        ext = os.path.splitext(title)[1].lower() or ".jpg"
        fname = f"{slug}_commons_{idx:02d}{ext}"
        row["soubor"] = fname
        url = row["direct_url"]
        if args.dry_run:
            print(f"  [{idx:02d}] {row['px']:>12}  {row['titul'][:70]}")
        elif url and download(url, os.path.join(args.out, fname)):
            print(f"  [{idx:02d}] {fname}  {row['px']}")
            time.sleep(0.2)
        else:
            continue
        rows.append(row)

    if args.dry_run:
        print("\n(dry-run: nic se nestáhlo, photos.csv ani chrome_tier.md se nepíše)")
        return

    csv_path = os.path.join(args.out, "photos.csv")
    write_header = not os.path.exists(csv_path)
    fields = list(rows[0].keys()) if rows else []
    if rows:
        with open(csv_path, "a", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=fields)
            if write_header:
                writer.writeheader()
            writer.writerows(rows)
        print(f"\nphotos.csv: +{len(rows)} řádků → {csv_path}")

    chrome_path = os.path.join(args.out, "chrome_tier.md")
    with open(chrome_path, "w", encoding="utf-8") as fh:
        fh.write(chrome_tier_md(place, name))
    print(f"chrome_tier.md → {chrome_path}")


if __name__ == "__main__":
    main()
