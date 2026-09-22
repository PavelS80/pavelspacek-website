# location-scout — foto tier pro skill `location-research-czsk`

Verzovaný zdroj přílohy ke skillu. Skill sám žije v synced složce
(`~/.claude/skills/synced/<id>/location-research-czsk/`), která se při každé
synchronizaci přepisuje ze serveru — proto je kanonická kopie tady v repu.

## Obsah

| Soubor | Kam patří ve skillu | Kde běží |
|---|---|---|
| `foto_zdroje.md` | `references/foto_zdroje.md` | — |
| `fetch_commons_photos.py` | `scripts/fetch_commons_photos.py` | kdekoli se sítí |
| `chrome_scout.py` | `scripts/chrome_scout.py` | **jen u tebe na počítači** |
| `console_harvest.js` | `scripts/console_harvest.js` | konzole Chrome |
| `test_*.py` | zůstávají tady, do skillu se nekopírují | — |

`fetch_commons_photos.py` je vrstva 1 (Wikidata + Commons, volné licence).
`chrome_scout.py` + `console_harvest.js` jsou vrstva 3 (přihlášený Chrome —
Instagram, Facebook, Rajče, Google Maps, Mapy.cz). Rozdělení a pravidla
popisuje `foto_zdroje.md`.

## Vrstva 3 — co je potřeba

Cloudová session ani chat to spustit nemůžou: nemají tvůj Chrome profil a
egress policy jim IG/FB/Rajče/Mapy stejně blokuje. Spouštěj v Coworku
s připojeným počítačem, nebo přímo v terminálu u sebe.

```bash
# bez instalace: console_harvest.js v konzoli → urls.json → sem
python3 chrome_scout.py --urls urls.json --slug bouzov --out ./fotky/bouzov --confidence high

# živě v tvém Chrome (asistovaně — ty klikáš, Enter sbírá)
pip install playwright
python3 chrome_scout.py --live --slug bouzov --out ./fotky/bouzov

# Mapy.cz, plně automaticky, bez přihlášení
playwright install chromium
python3 chrome_scout.py --mapy 49.70417,16.89111 --slug bouzov --out ./fotky/bouzov
```

Pro `--live` musí být **všechen Chrome zavřený** — jinak je profil zamčený.
Pokud se nespustí, zkus `--profile` s cestou ke kopii profilu.

## Instalace do skillu

```bash
SKILL=~/.claude/skills/synced/*/location-research-czsk
mkdir -p $SKILL/references $SKILL/scripts
cp foto_zdroje.md          $SKILL/references/
cp fetch_commons_photos.py $SKILL/scripts/
```

Do `SKILL.md` přidat krok mezi Krok 1 a Krok 2:

```markdown
### Krok 1b: Fotky k lokacím (volitelné)

Když uživatel chce reálné fotky, ne jen seznam: viz `references/foto_zdroje.md`.
Pro každou TOP lokaci spusť `scripts/fetch_commons_photos.py "<název>" --out <složka>`
(vyžaduje síť — běží v Cowork / Claude Code, ne v chatu). Skript uloží fotky,
`photos.csv` s autorem a licencí a `chrome_tier.md` se zbytkem k ručnímu projití.
Do decku dávej jen fotky z Commons, s uvedením autora.
```

## Test

```bash
python3 test_fetch_commons_photos.py   # 11 testů
python3 test_chrome_scout.py           # 20 testů
```

Oboje bez sítě — API i prohlížeč se nahradí. Ověřuje parsování odpovědí,
výběr největší varianty ze `srcset`, dedupe podepsaných CDN URL, filtry,
pojmenování, `photos.csv` a `chrome_tier.md`.

**Co testy neověřují:**

- Že živé Wikimedia API vrací přesně tvar z fixtur. Fixtury jsou psané podle
  dokumentace MediaWiki API, ne zachycené z ostrého volání — egress policy
  session, ve které skripty vznikly, blokovala `www.wikidata.org`,
  `commons.wikimedia.org`, `instagram.com`, `facebook.com`,
  `rajce.idnes.cz` i `mapy.cz`.
- Že DOM Instagramu a Facebooku vypadá tak, jak sběr předpokládá. Proto se
  nikde nespoléhá na class names (ty jsou obfuskované a mění se), ale jen na
  `document.images`, `srcset` a `naturalWidth`. I tak platí, že první běh
  u tebe je první skutečný test.
- Že se Playwright připojí na tvůj Chrome profil napoprvé. Zámek profilu je
  nejčastější důvod, proč `--live` selže.
