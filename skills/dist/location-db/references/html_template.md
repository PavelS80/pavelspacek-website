# HTML deck template — vizuální styl

Tmavé prémiové pozadí, gold accent, filmový look. Print-friendly.

## CSS variables (vždy použít)

```css
:root{
  --bg:#0a0e14;
  --bg-card:#131820;
  --bg-card-2:#1a2029;
  --text:#e8e0d0;
  --text-dim:#a39880;
  --accent:#c9a55a;
  --accent-bright:#e0b870;
  --border:#2a323e;
  --top:#d4a857;
  --backup:#6b8eb5;
  --wildcard:#b566a8;
  --risk:#c95757;
  --ok:#6fa37d;
}
```

## Typografie
- Title: Georgia serif, letter-spacing 2–4px, color accent
- Body: system sans (-apple-system / Segoe UI), 13–15px
- Labels: uppercase, 10–11px, letter-spacing 1px

## Komponenty

1. **Hero** — gradient bg, big title, subtitle uppercase, meta block
2. **Sticky nav** — blur backdrop, uppercase links
3. **Section header** — `h2` Georgia serif gold + `.count` malý meta
4. **KPI cards** — grid auto-fit minmax(160px,1fr), velké číslo Georgia
5. **Location card grid** — minmax(360px,1fr) gap 18-20px
6. **Card** — kompletní template viz `karta_lokace.md`
7. **Tag** — barevné štítky TOP/BACKUP/WILDCARD
8. **Scout route** — bg-card s left-border 3px accent
9. **Final** — bg-card box s h3 sekcemi
10. **Warning box** — risk color left border, semi-transparent bg

## Print
- `@media print` — bg white, černý text, žádné nav, page-break:avoid u karet

## Plný HTML skeleton

Viz `LONGLIST_lokaci_CZ_SK_v1.html` v projektu Lúpežnícka princezná — referenční implementace.

## Nikdy
- Externí CDN/knihovny
- Halucinované URL fotek (jen reálné zdroje)
- Skóre bez rubriky
- Generické fráze typu "krásná lokace" — vždy konkrétně
