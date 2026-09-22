#!/usr/bin/env python3
"""Chrome tier — sběr scoutovacích fotek z přihlášeného prohlížeče.

BĚŽÍ U TEBE NA POČÍTAČI, ne v cloudu. Používá tvůj existující Chrome profil,
takže jsi na IG/FB přihlášený a skript nikdy nevidí heslo.

Tři režimy:

1) Ze seznamu URL (nic se neinstaluje, funguje s console_harvest.js):
       python3 chrome_scout.py --urls urls.json --out ./fotky/bouzov --slug bouzov

2) Živě v Chrome (vyžaduje: pip install playwright):
       python3 chrome_scout.py --live --out ./fotky/bouzov --slug bouzov
   Otevře Chrome s tvým profilem. Ty si stránku proklikáš a proscrolluješ,
   pak v terminálu Enter → skript sebere, co je načtené na stránce.
   Nic nescrolluje samo, nic neklikne samo.

3) Mapy.cz screenshot (bez přihlášení, plně automatické):
       python3 chrome_scout.py --mapy 49.70417,16.89111 --out ./fotky/bouzov --slug bouzov

Zapisuje do stejného photos.csv jako fetch_commons_photos.py.
"""

import argparse
import csv
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import date

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)

CSV_FIELDS = [
    "soubor", "zdroj", "titul", "page_url", "direct_url", "full_url",
    "autor", "licence", "datum", "px", "lat", "lon",
    "confidence_mista", "motiv", "poznamka",
]

# Podle hostname poznáme zdroj — jméno souboru i řádek v CSV.
SOURCE_HOSTS = [
    ("instagram", ("cdninstagram.com", "instagram.com")),
    ("facebook", ("fbcdn.net", "facebook.com")),
    ("rajce", ("rajce.idnes.cz", "rajce.net")),
    ("gmaps", ("googleusercontent.com", "ggpht.com", "google.com")),
    ("mapy", ("mapy.cz", "mapy.com", "seznam.cz")),
    ("denik", ("denik.cz",)),
    ("turistika", ("turistika.cz",)),
]

# Profilovky, ikony, emoji a sprity — nikdy ne fotka lokace.
JUNK_URL_RE = re.compile(
    r"(/emoji|/rsrc\.php|sprite|/static/|favicon|profile_pic|s150x150|s320x320)",
    re.IGNORECASE,
)


# --- čisté funkce (testovatelné bez sítě i bez prohlížeče) -----------------


def best_from_srcset(srcset, fallback=""):
    """Z srcset vybere URL s největším 'w' descriptorem.

    srcset je "url 640w, url 1080w" nebo "url 1x, url 2x". IG/FB používají
    'w'. Když žádné 'w' není, bereme poslední kandidát (bývá největší).
    """
    if not srcset or not srcset.strip():
        return fallback
    best_url, best_w, last_url = fallback, -1, fallback
    for part in srcset.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        url = bits[0]
        last_url = url
        if len(bits) > 1 and bits[1].endswith("w"):
            try:
                w = int(bits[1][:-1])
            except ValueError:
                continue
            if w > best_w:
                best_url, best_w = url, w
    return best_url if best_w > 0 else last_url


def source_from_url(url):
    host = urllib.parse.urlparse(url).netloc.lower()
    for name, needles in SOURCE_HOSTS:
        if any(n in host for n in needles):
            return name
    return "web"


def dedupe_key(url):
    """IG/FB mění query string (podpis, expirace) u stejného obrázku.

    Klíčem je tedy cesta bez query — jinak bychom stáhli tutéž fotku 5x.
    """
    parsed = urllib.parse.urlparse(url)
    return f"{parsed.netloc}{parsed.path}"


def should_keep(item, min_width):
    url = item.get("url") or ""
    if not url.startswith("http"):
        return False
    if JUNK_URL_RE.search(url):
        return False
    # Rozhoduje vykreslená velikost; IG dává max ~1080 px, proto nízký práh.
    if max(item.get("width") or 0, item.get("height") or 0) < min_width:
        return False
    return True


def slugify(name):
    spaced = re.sub(r"[^\w]+", " ", name, flags=re.UNICODE)
    ascii_name = unicodedata.normalize("NFKD", spaced).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "_", ascii_name).strip("_").lower() or "lokace"


def dest_name(slug, source, index, url):
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"
    return f"{slug}_{source}_{index:02d}{ext}"


def make_row(item, fname, confidence, note=""):
    url = item["url"]
    source = source_from_url(url)
    return {
        "soubor": fname,
        "zdroj": source,
        "titul": (item.get("alt") or "").strip()[:200],
        "page_url": item.get("page_url", ""),
        "direct_url": url,
        "full_url": url,
        "autor": item.get("author", ""),
        # Sociální sítě: licence není volná, do klientského decku to nepatří.
        "licence": "nutné svolení autora" if source in ("instagram", "facebook", "rajce", "gmaps") else "ověřit",
        "datum": item.get("date", date.today().isoformat()),
        "px": f"{item.get('width') or '?'}x{item.get('height') or '?'}",
        "lat": item.get("lat", ""),
        "lon": item.get("lon", ""),
        "confidence_mista": confidence,
        "motiv": "",
        "poznamka": note,
    }


def load_url_items(path):
    """Přijme .json (list URL nebo list objektů z console_harvest.js) i .txt."""
    with open(path, encoding="utf-8") as fh:
        raw = fh.read().strip()
    if not raw:
        return []
    if raw[0] in "[{":
        data = json.loads(raw)
        if isinstance(data, dict):
            data = data.get("images") or data.get("urls") or []
        items = []
        for entry in data:
            if isinstance(entry, str):
                items.append({"url": entry})
            elif isinstance(entry, dict) and entry.get("url"):
                items.append(entry)
        return items
    return [{"url": l.strip()} for l in raw.splitlines() if l.strip().startswith("http")]


# --- stahování ------------------------------------------------------------


def download(url, dest, referer=""):
    headers = {"User-Agent": UA, "Accept": "image/avif,image/webp,image/*,*/*;q=0.8"}
    if referer:
        headers["Referer"] = referer
    req = urllib.request.Request(url, headers=headers)
    delay = 2
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if len(data) < 8000:  # thumbnail/placeholder, ne scoutovací foto
                print(f"  ~ přeskočeno (jen {len(data)} B): {os.path.basename(dest)}")
                return False
            with open(dest, "wb") as fh:
                fh.write(data)
            return True
        except urllib.error.HTTPError as exc:
            # 403 na IG/FB CDN = vypršel podpis v URL. Opakovat nemá smysl.
            if exc.code in (403, 410):
                print(f"  ! {exc.code} — URL vypršela, seber ji znovu: {url[:80]}…", file=sys.stderr)
                return False
            if attempt == 2:
                print(f"  ! {exc}: {url[:80]}…", file=sys.stderr)
                return False
            time.sleep(delay)
            delay *= 2
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == 2:
                print(f"  ! {exc}: {url[:80]}…", file=sys.stderr)
                return False
            time.sleep(delay)
            delay *= 2
    return False


def append_csv(out_dir, rows):
    if not rows:
        return
    path = os.path.join(out_dir, "photos.csv")
    write_header = not os.path.exists(path)
    with open(path, "a", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_FIELDS)
        if write_header:
            writer.writeheader()
        writer.writerows(rows)
    print(f"photos.csv: +{len(rows)} řádků → {path}")


def harvest_items(items, out_dir, slug, confidence, min_width, seen, note=""):
    """Filtr → dedupe → stažení → řádky do CSV."""
    kept, rows = [], []
    for item in items:
        if not should_keep(item, min_width):
            continue
        key = dedupe_key(item["url"])
        if key in seen:
            continue
        seen.add(key)
        kept.append(item)

    os.makedirs(out_dir, exist_ok=True)
    start = len([f for f in os.listdir(out_dir) if f.startswith(slug + "_")])
    for offset, item in enumerate(kept, start=start + 1):
        source = source_from_url(item["url"])
        fname = dest_name(slug, source, offset, item["url"])
        if download(item["url"], os.path.join(out_dir, fname), item.get("page_url", "")):
            print(f"  [{offset:02d}] {fname}  {item.get('width')}x{item.get('height')}")
            rows.append(make_row(item, fname, confidence, note))
            time.sleep(0.4)  # ohleduplně k CDN
    append_csv(out_dir, rows)
    return len(rows)


# --- živý Chrome ----------------------------------------------------------


def chrome_user_data_dir():
    """Výchozí umístění Chrome profilu podle OS."""
    home = os.path.expanduser("~")
    if sys.platform == "darwin":
        return os.path.join(home, "Library", "Application Support", "Google", "Chrome")
    if sys.platform.startswith("win"):
        return os.path.join(
            os.environ.get("LOCALAPPDATA", home), "Google", "Chrome", "User Data"
        )
    return os.path.join(home, ".config", "google-chrome")


# JS běží v kontextu stránky; vrací všechny načtené <img>. Nespoléhá na
# class names — ty jsou na IG/FB obfuskované a mění se každý týden.
COLLECT_JS = """
() => Array.from(document.images).map(img => ({
  src: img.currentSrc || img.src || '',
  srcset: img.srcset || '',
  width: img.naturalWidth || img.width || 0,
  height: img.naturalHeight || img.height || 0,
  alt: img.alt || ''
}))
"""


def run_live(args, slug, seen):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit(
            "Chybí Playwright. Nainstaluj:\n"
            "    pip install playwright\n"
            "(Chrome se nestahuje — používá se ten tvůj, přes channel='chrome'.)"
        )

    user_data = args.profile or chrome_user_data_dir()
    if not os.path.isdir(user_data):
        raise SystemExit(f"Chrome profil nenalezen: {user_data}\nZadej --profile ručně.")

    print("Chrome se otevře s tvým profilem. VŠECHEN Chrome musí být zavřený,")
    print("jinak je profil zamčený a spuštění selže.\n")

    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=user_data,
            channel="chrome",
            headless=False,
            no_viewport=True,
            args=[f"--profile-directory={args.profile_dir}"],
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        if args.start_url:
            page.goto(args.start_url, wait_until="domcontentloaded")

        total = 0
        print("─" * 62)
        print("Proklikej a proscrolluj si stránku v Chrome. Pak sem:")
        print("  Enter   = seber, co je na stránce (confidence medium)")
        print("  h+Enter = seber a označ confidence high (geotag/místo)")
        print("  q+Enter = konec")
        print("─" * 62)
        while True:
            try:
                cmd = input("> ").strip().lower()
            except EOFError:
                break
            if cmd == "q":
                break
            confidence = "high" if cmd == "h" else "medium"
            raw = page.evaluate(COLLECT_JS)
            items = []
            for r in raw:
                items.append({
                    "url": best_from_srcset(r["srcset"], r["src"]),
                    "width": r["width"],
                    "height": r["height"],
                    "alt": r["alt"],
                    "page_url": page.url,
                })
            print(f"na stránce {len(items)} obrázků → filtruju…")
            n = harvest_items(
                items, args.out, slug, confidence, args.min_width, seen,
                note="" if confidence == "high" else "místo z kontextu stránky, ne z geotagu",
            )
            total += n
            print(f"uloženo {n} nových (celkem {total})\n")
        ctx.close()
    return total


def run_mapy(args, slug):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Chybí Playwright: pip install playwright && playwright install chromium")

    lat, lon = [p.strip() for p in args.mapy.split(",")]
    shots = [
        ("pano", f"https://mapy.cz/zakladni?pano=1&x={lon}&y={lat}&z=17"),
        ("letecka", f"https://mapy.cz/zakladni?base=ophoto&x={lon}&y={lat}&z=17"),
    ]
    os.makedirs(args.out, exist_ok=True)
    rows = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=args.headless)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        for label, url in shots:
            print(f"  {label}: {url}")
            page.goto(url, wait_until="networkidle", timeout=90_000)
            page.wait_for_timeout(5000)  # dlaždice se donačítají po networkidle
            fname = f"{slug}_mapy_{label}.png"
            page.screenshot(path=os.path.join(args.out, fname))
            print(f"  → {fname}")
            rows.append(make_row(
                {"url": url, "page_url": url, "width": 1920, "height": 1080,
                 "alt": f"Mapy.cz {label}", "lat": lat, "lon": lon},
                fname, "high", "screenshot, souřadnice jsou v URL",
            ))
        browser.close()
    append_csv(args.out, rows)
    return len(rows)


# --- main -----------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("--out", default=".", help="výstupní složka")
    ap.add_argument("--slug", help="prefix souborů (default podle --name nebo 'lokace')")
    ap.add_argument("--name", help="název lokace, ze kterého se odvodí slug")
    ap.add_argument("--urls", help="soubor .json/.txt se seznamem URL (z console_harvest.js)")
    ap.add_argument("--live", action="store_true", help="živý Chrome s tvým profilem")
    ap.add_argument("--mapy", help="'lat,lon' — screenshot panoramy a letecké")
    ap.add_argument("--start-url", help="stránka, kterou Chrome otevře v --live")
    ap.add_argument("--profile", help="cesta k Chrome User Data (default podle OS)")
    ap.add_argument("--profile-dir", default="Default", help="který profil (default: Default)")
    ap.add_argument("--min-width", type=int, default=600,
                    help="ignoruj obrázky menší než X px (IG dává max ~1080)")
    ap.add_argument("--confidence", default="medium", choices=["high", "medium", "low"],
                    help="confidence_mista pro režim --urls")
    ap.add_argument("--headless", action="store_true", help="pro --mapy: bez okna")
    args = ap.parse_args()

    if not (args.urls or args.live or args.mapy):
        ap.error("vyber režim: --urls, --live nebo --mapy")

    slug = args.slug or slugify(args.name or "lokace")
    seen = set()

    if args.mapy:
        run_mapy(args, slug)
    if args.urls:
        items = load_url_items(args.urls)
        print(f"{len(items)} URL ze souboru {args.urls}")
        n = harvest_items(items, args.out, slug, args.confidence, args.min_width, seen)
        print(f"uloženo {n}")
    if args.live:
        run_live(args, slug, seen)


if __name__ == "__main__":
    main()
