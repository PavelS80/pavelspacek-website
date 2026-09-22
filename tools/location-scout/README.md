# location-scout — foto tier pro skill `location-research-czsk`

Verzovaný zdroj přílohy ke skillu. Skill sám žije v synced složce
(`~/.claude/skills/synced/<id>/location-research-czsk/`), která se při každé
synchronizaci přepisuje ze serveru — proto je kanonická kopie tady v repu.

## Obsah

| Soubor | Kam patří ve skillu |
|---|---|
| `foto_zdroje.md` | `references/foto_zdroje.md` |
| `fetch_commons_photos.py` | `scripts/fetch_commons_photos.py` |
| `test_fetch_commons_photos.py` | zůstává tady, do skillu se nekopíruje |

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
python3 test_fetch_commons_photos.py
```

11 testů, bez sítě — API se nahradí fixturami. Ověřuje parsování odpovědí,
filtry, pořadí podle rozlišení, pojmenování, `photos.csv` a `chrome_tier.md`.

**Co testy neověřují:** že živé Wikimedia API vrací přesně tvar z fixtur.
Fixtury jsou psané podle dokumentace MediaWiki API, ne zachycené z ostrého
volání — egress policy session, ve které skript vznikl, blokovala
`www.wikidata.org` i `commons.wikimedia.org` (403 na CONNECT). První ostré
spuštění v Coworku je tedy zároveň první skutečný integrační test.
