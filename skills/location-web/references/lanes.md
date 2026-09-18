# Dráhy A / B — kde běží sběr

## Test (vždy první)
```
curl -sI --max-time 8 https://www.filmovamista.cz/ -o /dev/null -w "%{http_code}"
```
`200` → dráha A dostupná. `000` / `403` → egress blokován, **jen dráha B**. Ověř i
`curl -sS "$HTTPS_PROXY/__agentproxy/status"` — `connect_rejected … 403` = politika prostředí,
ne chyba webu. Neretryovat; nahlásit uživateli.

## Dráha A — cloud (Chromium + Playwright, curl, API)
Otevřený web, API (Mapy.com, Wikimedia, ČÚZK WMS), reality, film offices, NPÚ, specializované
databáze. Paralelní, cron-schopné. Vyžaduje síťovou politiku prostředí, která tyto domény povoluje
(nastavuje uživatel při zakládání prostředí; dokumentace `code.claude.com/docs/en/claude-code-on-the-web`).

## Dráha B — uživatelův prohlížeč (Claude in Chrome / built-in browser)
Instagram, Facebook, Airbnb, Booking, členské sekce, a **vše, když A nejede**.
- Načti nástroje jednou: `ToolSearch "select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp"`
  (built-in browser: prefix `mcp__Claude_Browser__` / `mcp__remote-devices__Claude_Browser__`).
- Nejdřív `tabs_context`, pak **nový tab**; nikdy nepřebírat cizí tab bez vyzvání.
- Čti stránky přes `read_page` / `get_page_text`, ne screenshoty.
- **Rychlost člověka.** Uživatel je přihlášený; model čte, co je na obrazovce, ukládá URL + metadata.
  Je to procházení, ne scraping. Site permission odmítnutá = přeskočit, nezkoušet znovu.
- Safari nepoužívat — není pro něj driver ani rozšíření.

## Výstup pro dráhu B
Když A nejede, deck obsahuje sekci **"Fronta pro dráhu B"**: seznam URL / dotazů k otevření,
co v nich hledat, a co z nich vytěžit — připravené tak, aby se to dalo odpracovat v jedné seanci u Macu.
