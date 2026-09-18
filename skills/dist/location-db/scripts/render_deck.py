#!/usr/bin/env python3
"""Render a self-contained HTML location deck from sources.json + plan.json.

Usage: render_deck.py <run_dir>   (expects run_dir/sources.json, optional run_dir/plan.json)
Writes run_dir/deck.html. No external assets, print-friendly. Never invents photos:
a location with no photos shows the lane-B queue instead of an image.
"""
import json, sys, html
from pathlib import Path

CSS = """
:root{--bg:#0a0e14;--bg-card:#131820;--bg-card-2:#1a2029;--text:#e8e0d0;--text-dim:#a39880;--accent:#c9a55a;
--accent-bright:#e0b870;--border:#2a323e;--top:#d4a857;--backup:#6b8eb5;--wildcard:#b566a8;--risk:#c95757;--ok:#6fa37d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,"Segoe UI",sans-serif}
.hero{padding:56px 24px 40px;background:linear-gradient(160deg,#0a0e14 0%,#1a2029 100%);border-bottom:1px solid var(--border)}
.hero h1{font-family:Georgia,serif;letter-spacing:3px;color:var(--accent);margin:0 0 6px;font-size:34px}
.hero .sub{text-transform:uppercase;letter-spacing:2px;font-size:11px;color:var(--text-dim)}
.hero .meta{margin-top:14px;color:var(--text-dim);font-size:13px}
nav{position:sticky;top:0;background:rgba(10,14,20,.85);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:10px 24px;z-index:9}
nav a{color:var(--text-dim);text-decoration:none;text-transform:uppercase;font-size:11px;letter-spacing:1px;margin-right:18px}
nav a:hover{color:var(--accent)}main{max-width:1240px;margin:0 auto;padding:24px}
h2{font-family:Georgia,serif;color:var(--accent);font-weight:400;letter-spacing:1px;margin:40px 0 14px;font-size:24px}
h2 .count{font-family:-apple-system,sans-serif;font-size:11px;color:var(--text-dim);letter-spacing:1px;margin-left:10px}
.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px}
.kpi div{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:16px}
.kpi b{display:block;font:32px Georgia,serif;color:var(--accent-bright)}.kpi span{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:18px;page-break-inside:avoid}
.card-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.card-title{font-family:Georgia,serif;font-size:18px;color:var(--accent-bright)}.card-region{font-size:12px;color:var(--text-dim)}
.tag{font-size:10px;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;border-radius:4px;white-space:nowrap;color:#0a0e14;font-weight:700}
.tag-top{background:var(--top)}.tag-backup{background:var(--backup)}.tag-wild{background:var(--wildcard)}.tag-insp{background:var(--text-dim)}.tag-unk{background:var(--risk)}
.label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin:10px 0 3px}
.door{background:var(--bg-card-2);border-left:3px solid var(--ok);padding:8px 10px;border-radius:4px;font-size:13px;margin-top:10px}
.gps{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px}.pros{color:var(--ok)}.cons{color:var(--risk)}
.photos{margin-top:10px;font-size:12px;color:var(--text-dim);border:1px dashed var(--border);padding:8px;border-radius:4px}
.scores{margin-top:12px}.score-row{display:flex;align-items:center;gap:8px;font-size:11px;margin:3px 0}
.score-label{width:38px;color:var(--text-dim)}.score-bar{flex:1;height:6px;background:var(--border);border-radius:3px}
.score-fill{height:100%;background:var(--accent);border-radius:3px}.score-value{width:28px;text-align:right}
.total{display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}
.total .v{font:22px Georgia,serif;color:var(--accent-bright)}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)}th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim)}
.plan{background:var(--bg-card);border-left:3px solid var(--accent);padding:14px 18px;border-radius:6px;margin:10px 0}
.plan .t{font-family:ui-monospace,Menlo,monospace;color:var(--accent-bright);margin-right:10px}
.warn{background:rgba(201,87,87,.12);border-left:3px solid var(--risk);padding:10px 14px;border-radius:4px;margin:14px 0;font-size:13px}
.conf{font-size:10px;text-transform:uppercase;letter-spacing:1px;padding:2px 6px;border:1px solid var(--border);border-radius:3px;color:var(--text-dim)}
footer{padding:30px 24px;color:var(--text-dim);font-size:12px;border-top:1px solid var(--border);margin-top:40px}
@media print{body{background:#fff;color:#000}nav{display:none}.card,.kpi div,.plan{background:#fff;border-color:#ccc}h2,.hero h1,.card-title,.total .v,.kpi b{color:#000}}
"""
TAG = {"TOP":"tag-top","BACKUP":"tag-backup","WILDCARD":"tag-wild","INSPIRACE":"tag-insp","POLOHA_NEZNAMA":"tag-unk"}
e = html.escape

def score_rows(sc):
    out=[]
    for k,lab in [("vis","Vis"),("prak","Prak"),("aut","Aut"),("dost","Dost"),("risk","Risk"),("acc","Acc")]:
        v=sc.get(k,0); out.append(f'<div class="score-row"><span class="score-label">{lab}</span><div class="score-bar"><div class="score-fill" style="width:{v*10:.0f}%"></div></div><span class="score-value">{v:.1f}</span></div>')
    return "".join(out)

def card(l):
    g=l["gps"]; gps=f'{g["lat"]:.4f}, {g["lon"]:.4f}' if g.get("lat") else "—"
    photos = l.get("photos",[])
    ph = (f'<div class="photos">Fotky: {len(photos)} · ' + " · ".join(f'{e(p["type"])} Q{p["q"]} {e(p["license_tier"])}' for p in photos) + '</div>') if photos \
         else f'<div class="photos">Fotky: <b>neviděny</b> — fronta dráhy B: {e(l.get("lane_b","Mapy.com fotky u místa, Google Maps, web provozovny"))}</div>'
    door=l.get("door",{})
    return f'''<div class="card" id="{e(l["id"])}">
<div class="card-head"><div><div class="card-title">{e(l["name"])}</div><div class="card-region">{e(l.get("motif",""))} · {e(l.get("municipality",""))} · {l.get("distance_km_prague",l.get("distance_km_base","?"))} km / {l.get("drive_min_base","?")} min od základny</div></div>
<span class="tag {TAG.get(l["priority"],"tag-insp")}">{e(l["priority"].replace("_"," "))}</span></div>
<span class="label">Poloha</span><span class="gps">{gps}</span> <span class="conf">{e(g.get("precision","?"))}</span>
<div class="door"><b>Dveře:</b> {e(door.get("who",""))} — {e(door.get("how",""))}<br><span class="gps">{e(door.get("contact",""))}</span></div>
<p style="margin:10px 0 0">{e(l.get("character",""))}</p>
<div class="pros-cons"><div class="pros"><span class="label">Výhody</span>{"<br>".join(e(x) for x in l.get("pros",[]))}</div><div class="cons"><span class="label">Rizika</span>{"<br>".join(e(x) for x in l.get("cons",[]))}</div></div>
{ph}
<span class="label">Zdroj</span><span style="font-size:12px">{e(l["source"]["site"])} · {e(l["source"]["status"])} · <span class="conf">{e(l.get("confidence","?"))}</span></span>
<div class="scores">{score_rows(l["scores"])}</div>
<div class="total"><span>Celkové skóre</span><span class="v">{l["scores"]["total"]:.1f}</span></div></div>'''

def main(run):
    run=Path(run); data=json.loads((run/"sources.json").read_text(encoding="utf-8"))
    plan=json.loads((run/"plan.json").read_text(encoding="utf-8")) if (run/"plan.json").exists() else None
    meta=data["meta"]; locs=data["locations"]
    by_scene={}
    for l in locs: by_scene.setdefault(l.get("scene","—"),[]).append(l)
    n_gps=sum(1 for l in locs if l["gps"].get("precision") in ("exact","street"))
    n_door=sum(1 for l in locs if l.get("door",{}).get("contact"))
    sections="".join(f'<h2 id="s{i}">{e(s)}<span class="count">{len(v)} kandidátů</span></h2><div class="grid">{"".join(card(l) for l in v)}</div>' for i,(s,v) in enumerate(by_scene.items()))
    nav="".join(f'<a href="#s{i}">{e(s)}</a>' for i,s in enumerate(by_scene))
    plan_html=""
    if plan:
        plan_html='<h2 id="plan">Návrh dne obhlídek</h2>'+"".join(f'<div class="plan"><span class="t">{e(p["time"])}</span><b>{e(p["what"])}</b> — {e(p["where"])} <span class="conf">{e(p.get("drive","")) }</span></div>' for p in plan["stops"])
    queue="".join(f"<li>{e(q)}</li>" for q in data.get("lane_b_queue",[]))
    warn="".join(f'<div class="warn">{e(w)}</div>' for w in data.get("warnings",[]))
    top=sorted(locs,key=lambda l:-l["scores"]["total"])[:10]
    toprows="".join(f'<tr><td>{i+1}</td><td>{e(l["name"])}</td><td>{e(l.get("scene",""))}</td><td>{e(l.get("municipality",""))}</td><td>{l["scores"]["total"]:.1f}</td><td>{e(l["priority"])}</td><td>{e(l.get("door",{}).get("who",""))}</td></tr>' for i,l in enumerate(top))
    out=f'''<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><title>{e(meta["title"])}</title><style>{CSS}</style></head><body>
<div class="hero"><div class="sub">{e(meta.get("subtitle","Location search"))}</div><h1>{e(meta["title"])}</h1><div class="meta">{e(meta.get("meta",""))}</div></div>
<nav><a href="#kpi">Shrnutí</a>{nav}<a href="#top">TOP</a><a href="#plan">Plán dne</a><a href="#queue">Fronta B</a></nav><main>
<h2 id="kpi">Shrnutí</h2><div class="kpi"><div><b>{len(locs)}</b><span>kandidátů</span></div><div><b>{len(by_scene)}</b><span>scén</span></div><div><b>{n_gps}/{len(locs)}</b><span>poloha ulice+</span></div><div><b>{n_door}/{len(locs)}</b><span>s kontaktem</span></div><div><b>{meta.get("recall","—")}</b><span>recall vs. ground truth</span></div></div>
{warn}{sections}
<h2 id="top">TOP kandidáti</h2><table><tr><th>#</th><th>Lokace</th><th>Scéna</th><th>Obec</th><th>Skóre</th><th>Štítek</th><th>Dveře</th></tr>{toprows}</table>
{plan_html}
<h2 id="queue">Fronta pro dráhu B</h2><ol>{queue}</ol>
</main><footer>{e(meta.get("footer",""))}</footer></body></html>'''
    (run/"deck.html").write_text(out,encoding="utf-8"); print(f"deck.html: {len(out)//1024} kB, {len(locs)} lokací, {len(by_scene)} scén")

if __name__=="__main__": main(sys.argv[1])
