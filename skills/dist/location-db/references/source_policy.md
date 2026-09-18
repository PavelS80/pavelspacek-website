# Licenční politika a statusy zdrojů

## Licenční tiery — každá fotka nese jeden
| Tier | Zdroje | Použití |
|---|---|---|
| **T1 volné** | Wikimedia Commons (CC), NPÚ otevřená data, ČÚZK, vlastní fotky, Mapillary (CC-BY-SA) | do klientského decku, s uvedením autora/licence |
| **T2 reference** | realitní inzeráty, film offices, stránky měst, uživatelské fotky Mapy/Google, Static Panorama | **jen interní recce**; v decku max. náhled + odkaz na zdroj + "reference, nepoužívat bez souhlasu" |
| **T3 jen odkaz** | Instagram, Facebook, Airbnb, Booking, Archiweb, fotografové architektury | **nestahovat hromadně**; uložit URL + interní screenshot; pro reálné použití oslovit autora |

## Statusy ověření zdroje — nic pod OVĚŘENO nejde do harvesteru
| Status | Znamená |
|---|---|
| `OVĚŘENO` | někdo tu stránku otevřel a viděl fotky lokací |
| `ODVOZENO` | plyne z povahy zdroje (otevřená data, Wikimedia, veřejný inzerát) — vysoká jistota, neviděno |
| `NEOVĚŘENO` | domněnka; nestavět na tom |
| `ZAVŘENO` | ověřeno, že fotky veřejné nejsou (lokační agentury) |

## Kde vedeme čáru
- Automatizovaný sběr z Instagramu, Facebooku, Airbnb, Booking porušuje jejich podmínky (jistota: vysoká).
  → **Dráha B**: uživatel přihlášený, rychlostí člověka, model čte obrazovku. Procházení, ne scraping.
- Žádná rotace proxy, podvrhování fingerprintu, obcházení CAPTCHA. Rozbije se to, porušuje to ToS,
  a u firmy, která decky podepisuje, je to reputační riziko neúměrné zisku.
- `robots.txt` respektovat, rate-limit držet, výsledky cachovat.
- GDPR: fotky míst OK; fotky s identifikovatelnými lidmi a profily autorů do decku nepatří.
- Komerční archivy lokačních agentur (lokacni.cz, locationservice.cz, nwlocation.cz, locaters.cz,
  66location.com, Czech Film Locations, Finders) jsou `ZAVŘENO` — archiv je jejich produkt, nehledat cestu dovnitř.
