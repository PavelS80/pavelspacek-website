# Oprava skillu `location-research-czsk`

## Nález

`SKILL.md`, Krok 1, bod 3 odkazuje na pět souborů, které v `references/` neexistují:

```
references/podhradi.md       chybí
references/hrad.md           chybí
references/mlyn.md           chybí
references/les_potok.md      chybí
references/cesta_krajina.md  chybí
```

Existuje jen `lokace_database.md` — 57 řádků holých názvů, bez souřadnic,
bez správců, bez stavu objektu.

**Důsledek:** instrukce „pro každý motiv najdi 10–20 reálných lokací, použij
reference" nemá co použít, takže se longlist 80–120 lokací generuje z paměti
modelu. Skill si přitom sám v Pravidlech zakazuje fabrikování — ale nedává
si nástroj, jak ho dodržet. U velkých hradů to projde, u mlýnů, zřícenin
a brodů ne.

## Oprava — nahradit bod 3 v Kroku 1

```markdown
3. **Pro každý motiv vyber 10–20 lokací z datasetu.** Primární zdroj je
   `data/locations.json` (staví ho `tools/locations/fetch-locations.mjs`
   z OpenStreetMap a Wikidat). Filtruj podle pole `motiv` a
   `km_praha_vzdusne` / `km_bratislava_vzdusne`.

   - Lokaci, která v datasetu není, smíš přidat jen s označením
     **„mimo dataset — ověřit scoutingem"** a s konkrétním krokem k ověření.
   - Každá karta přebírá `zdroje.osm` a `zdroje.mapy` ze záznamu.
     Odkaz, který není v datasetu, se do decku nepíše.
   - `lokace_database.md` slouží nadále jen jako startovní pool jmen,
     ne jako zdroj faktů o stavu a dostupnosti.
```

## Oprava — doplnit do Pravidel

```markdown
- **Ověřování před tvrzením.** Stav objektu, přístupnost a vlastníka nikdy
  netvrď z paměti. Buď to je v datasetu, nebo to dohledej (web správce,
  NPÚ / Pamiatkový úrad SR, obec), nebo napiš „ověřit" — třetí možnost není.
- **Vzdálenosti** z datasetu jsou vzdušnou čarou. Pokud deck slouží pro
  rozpočet nebo plán company moves, přepočítej po silnici a označ to.
```

## Zbytek skillu zůstává

Scoring rubrika, karta lokace, HTML template i dvoukrokový workflow jsou v pořádku.
Mění se jen to, odkud berou vstup.
