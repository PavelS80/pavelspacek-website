#!/usr/bin/env python3
"""Render self-contained skill folders into skills/dist/.

Source of truth: skills/location-core, skills/location-db, skills/location-web.
Each dist skill gets its own SKILL.md + references/ = own refs + core refs copied in,
so nothing cross-references another skill at runtime. Upload dist/<skill>/ to claude.ai.
"""
import shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORE = ROOT / "location-core" / "references"
DIST = ROOT / "dist"
SKILLS = ["location-db", "location-web"]

def build():
    if DIST.exists():
        shutil.rmtree(DIST)
    for name in SKILLS:
        src = ROOT / name
        dst = DIST / name
        (dst / "references").mkdir(parents=True)
        shutil.copy(src / "SKILL.md", dst / "SKILL.md")
        for f in CORE.glob("*.md"):
            shutil.copy(f, dst / "references" / f.name)
        for f in (src / "references").glob("*.md"):
            shutil.copy(f, dst / "references" / f.name)   # own refs win on name clash
        (dst / "scripts").mkdir(exist_ok=True)
        for f in (ROOT / "location-core" / "scripts").glob("*.py"):
            shutil.copy(f, dst / "scripts" / f.name)
        # location-web needs the DB to exclude known locations
        if name == "location-web":
            shutil.copy(ROOT / "location-db" / "references" / "lokace_database.md",
                        dst / "references" / "lokace_database.md")
    # core itself is also uploadable (reference-only)
    shutil.copytree(ROOT / "location-core", DIST / "location-core")

def check():
    bad = []
    for skill in DIST.iterdir():
        text = (skill / "SKILL.md").read_text(encoding="utf-8")
        if not text.startswith("---\nname: "):
            bad.append(f"{skill.name}: missing frontmatter")
        refs = {p.name for p in (skill / "references").glob("*.md")}
        for line in text.splitlines():
            for tok in line.split("`"):
                if tok.endswith(".md") and "/" not in tok and tok not in refs:
                    bad.append(f"{skill.name}: SKILL.md references missing {tok}")
    return bad

if __name__ == "__main__":
    build()
    problems = check()
    for p in problems: print("✗", p)
    for skill in sorted(DIST.iterdir()):
        n = len(list((skill/"references").glob("*.md"))) if (skill/"references").exists() else 0
        print(f"✓ dist/{skill.name}: SKILL.md + {n} references")
    sys.exit(1 if problems else 0)
