#!/usr/bin/env python3
"""Spočítá rubrikové skóre lokace a přiřadí štítek. Bez ručního počítání.

    # jedna lokace
    python3 score.py --vis 9 --prak 7.5 --aut 7 --dost 2.5 --risk 6.5

    # Dost odvodit z dojezdu místo hádání
    python3 score.py --vis 9 --prak 7.5 --aut 7 --risk 6.5 --minutes 210

    # Dost vzít z lokace_db.csv podle základny
    python3 score.py --vis 9 --prak 7.5 --aut 7 --risk 6.5 \
        --db ../references/lokace_db.csv --name Bouzov --base praha

    # dávkově: CSV s vis,prak,aut,risk (+ dost nebo minutes) → doplní total a stitek
    python3 score.py --csv skore.csv

Existuje proto, že vážený průměr počítaný od oka je zdroj tichých chyb
a štítky pak nesedí na čísla. Vzorec i prahy jsou v references/scoring_rubric.md.
"""

import argparse
import csv
import os
import sys

VAHY = {"vis": 3.0, "prak": 2.5, "aut": 2.0, "dost": 1.0, "risk": 1.5}
DIMS = list(VAHY)


def total(vis, prak, aut, dost, risk):
    s = vis * VAHY["vis"] + prak * VAHY["prak"] + aut * VAHY["aut"]
    s += dost * VAHY["dost"] + risk * VAHY["risk"]
    return round(s / 10, 1)


def dost_from_minutes(minutes):
    """Dojezd v minutách → skóre Dost podle pásem v rubrice.

    Pásma rubriky jsou nespojitá (<1 h = 7–10, 1–2 h = 4–6, >2 h = 1–3),
    takže skok na hranici je záměr, ne chyba zaokrouhlení.
    """
    m = float(minutes)
    if m <= 30:
        return 10.0
    if m <= 60:
        return round(10 - (m - 30) / 30 * 3, 1)      # 10 → 7
    if m <= 120:
        return round(6 - (m - 60) / 60 * 2, 1)       # 6 → 4
    if m <= 240:
        return round(3 - (m - 120) / 120 * 2, 1)     # 3 → 1
    return 1.0


def stitek(vis, prak, dost, risk, tot):
    """Štítek podle rubriky. Pravidla jsou seřazená a vzájemně výlučná.

    Dost se do WILDCARDu záměrně nepočítá: velká vzdálenost se řeší
    přesunem základny, kdežto nízká praktičnost nebo vysoké riziko ne.
    Jinak by každá krásná lokace na druhém konci republiky byla wildcard.
    """
    if vis >= 8.5 and min(prak, risk) < 6:
        return "WILDCARD"
    if tot >= 8.0 and vis >= 8.5:
        return "TOP"
    if tot >= 7.0:
        return "BACKUP"
    return "INSPIRACE"


def evaluate(vis, prak, aut, dost, risk):
    tot = total(vis, prak, aut, dost, risk)
    return tot, stitek(vis, prak, dost, risk, tot)


def minutes_from_db(path, name, base):
    col = f"min_{base}_odhad"
    needle = name.strip().lower()
    with open(path, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if rows and col not in rows[0]:
        raise SystemExit(
            f"{os.path.basename(path)} nemá sloupec {col}. "
            f"Pusť build_location_db.py s --bases {base}."
        )
    for row in rows:
        if needle in (row.get("nazev") or "").lower():
            mins = row.get(col)
            if not mins:
                raise SystemExit(f"{row['nazev']}: chybí {col} (lokace bez GPS).")
            return float(mins), row["nazev"]
    raise SystemExit(f"'{name}' není v {path}.")


def render(vis, prak, aut, dost, risk, tot, tag, label=""):
    bar = lambda v: "█" * int(round(v)) + "·" * (10 - int(round(v)))
    head = f"  {label}\n" if label else ""
    lines = [head.rstrip("\n")] if label else []
    for dim, val in (("Vis", vis), ("Prak", prak), ("Aut", aut), ("Dost", dost), ("Risk", risk)):
        lines.append(f"  {dim:<5} {bar(val)} {val:>4}   × {VAHY[dim.lower()]}")
    lines.append(f"  {'':<5} {'':<10}")
    lines.append(f"  CELKEM {tot}   →   {tag}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    for d in DIMS:
        ap.add_argument(f"--{d}", type=float, help=f"skóre {d} 1–10")
    ap.add_argument("--minutes", type=float, help="dojezd v minutách → odvodí Dost")
    ap.add_argument("--db", help="lokace_db.csv, ze kterého se vezme dojezd")
    ap.add_argument("--name", help="název lokace v --db")
    ap.add_argument("--base", default="praha", help="základna pro --db (default praha)")
    ap.add_argument("--csv", help="dávkový režim: CSV se sloupci vis,prak,aut,risk[,dost|minutes]")
    ap.add_argument("--out", help="kam zapsat výsledek dávky (default vedle vstupu)")
    args = ap.parse_args()

    if args.csv:
        return run_batch(args)

    label = ""
    dost = args.dost
    if args.db:
        if not args.name:
            ap.error("--db vyžaduje --name")
        mins, label = minutes_from_db(args.db, args.name, args.base)
        dost = dost_from_minutes(mins)
        label = f"{label} · základna {args.base} · ~{int(mins)} min → Dost {dost}"
    elif args.minutes is not None:
        dost = dost_from_minutes(args.minutes)
        label = f"~{int(args.minutes)} min → Dost {dost}"

    missing = [d for d in DIMS if (dost if d == "dost" else getattr(args, d)) is None]
    if missing:
        ap.error(
            "chybí: " + ", ".join(f"--{m}" for m in missing)
            + " (Dost jde místo toho odvodit z --minutes nebo --db)"
        )

    tot, tag = evaluate(args.vis, args.prak, args.aut, dost, args.risk)
    print()
    print(render(args.vis, args.prak, args.aut, dost, args.risk, tot, tag, label))
    print()


def run_batch(args):
    with open(args.csv, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if not rows:
        raise SystemExit(f"{args.csv} je prázdné")

    out_fields = list(rows[0].keys())
    for extra in ("dost", "total", "stitek"):
        if extra not in out_fields:
            out_fields.append(extra)

    for i, row in enumerate(rows, start=2):
        try:
            vals = {d: float(row[d]) for d in ("vis", "prak", "aut", "risk")}
        except (KeyError, ValueError, TypeError) as exc:
            raise SystemExit(f"řádek {i}: chybí nebo je nečíselné vis/prak/aut/risk ({exc})")
        if row.get("dost"):
            dost = float(row["dost"])
        elif row.get("minutes"):
            dost = dost_from_minutes(row["minutes"])
        else:
            raise SystemExit(f"řádek {i}: chybí dost i minutes")
        tot, tag = evaluate(vals["vis"], vals["prak"], vals["aut"], dost, vals["risk"])
        row["dost"], row["total"], row["stitek"] = dost, tot, tag

    dest = args.out or os.path.splitext(args.csv)[0] + "_scored.csv"
    with open(dest, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=out_fields)
        writer.writeheader()
        writer.writerows(rows)

    for tag in ("TOP", "WILDCARD", "BACKUP", "INSPIRACE"):
        n = sum(1 for r in rows if r["stitek"] == tag)
        if n:
            print(f"  {tag:<10} {n}")
    print(f"\n{len(rows)} lokací → {dest}")


if __name__ == "__main__":
    sys.exit(main())
