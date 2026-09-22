/* console_harvest.js — sběr URL fotek z přihlášené stránky, bez instalace.
 *
 * POUŽITÍ
 * 1. V Chrome si otevři stránku (IG místo, FB album, Rajče album, Google Maps
 *    fotky) a proscrolluj ji, dokud se nenačte, co chceš. Obrázky, které jsi
 *    neviděl, v DOM nejsou — lazy loading.
 * 2. F12 → Console. Napiš  allow pasting  + Enter (Chrome to vyžaduje).
 * 3. Vlož tenhle soubor celý, Enter.
 * 4. Zavolej:  scoutHarvest()            → vypíše tabulku a zkopíruje JSON
 *              scoutHarvest({min: 800})  → jen větší obrázky
 *              scoutSave()               → rovnou stáhne urls.json
 * 5. JSON předhoď skriptu:
 *       python3 chrome_scout.py --urls urls.json --out ./fotky/bouzov \
 *           --slug bouzov --confidence high
 *
 * POZOR: URL z IG/FB CDN jsou podepsané a po pár hodinách vyprší (403).
 * Stáhni je hned, ne zítra.
 */

(() => {
  const JUNK = /(\/emoji|\/rsrc\.php|sprite|\/static\/|favicon|profile_pic|s150x150|s320x320)/i;

  // Z srcset ("url 640w, url 1080w") vybere největší variantu.
  function bestFromSrcset(srcset, fallback) {
    if (!srcset) return fallback;
    let bestUrl = fallback, bestW = -1, lastUrl = fallback;
    for (const part of srcset.split(",")) {
      const bits = part.trim().split(/\s+/);
      if (!bits[0]) continue;
      lastUrl = bits[0];
      if (bits[1] && bits[1].endsWith("w")) {
        const w = parseInt(bits[1], 10);
        if (!isNaN(w) && w > bestW) { bestUrl = bits[0]; bestW = w; }
      }
    }
    return bestW > 0 ? bestUrl : lastUrl;
  }

  // Některé fotky (hlavně FB) nejsou <img>, ale CSS background-image.
  function backgroundImages() {
    const out = [];
    for (const el of document.querySelectorAll('[style*="background-image"]')) {
      const m = /url\(["']?(https?:[^"')]+)["']?\)/.exec(el.style.backgroundImage || "");
      if (!m) continue;
      const r = el.getBoundingClientRect();
      out.push({ url: m[1], width: Math.round(r.width), height: Math.round(r.height), alt: "" });
    }
    return out;
  }

  window.scoutHarvest = function (opts) {
    const min = (opts && opts.min) || 600;
    const seen = new Set();
    const items = [];

    const candidates = Array.from(document.images).map((img) => ({
      url: bestFromSrcset(img.srcset, img.currentSrc || img.src || ""),
      width: img.naturalWidth || img.width || 0,
      height: img.naturalHeight || img.height || 0,
      alt: img.alt || "",
    })).concat(backgroundImages());

    for (const c of candidates) {
      if (!c.url || !c.url.startsWith("http")) continue;
      if (JUNK.test(c.url)) continue;
      if (Math.max(c.width, c.height) < min) continue;
      // IG/FB mění query string u téže fotky → dedupe podle cesty bez query.
      let key;
      try { const u = new URL(c.url); key = u.host + u.pathname; } catch (e) { key = c.url; }
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ ...c, page_url: location.href });
    }

    items.sort((a, b) => b.width * b.height - a.width * a.height);
    console.table(items.map((i) => ({ px: `${i.width}x${i.height}`, alt: i.alt.slice(0, 40) })));
    console.log(`%c${items.length} fotek nad ${min}px na této stránce`,
                "font-weight:bold;font-size:13px");
    try {
      copy(JSON.stringify(items, null, 2));
      console.log("JSON zkopírován do schránky → ulož jako urls.json");
    } catch (e) {
      console.log("copy() nefunguje, použij scoutSave()");
    }
    window.__scout = items;
    return items;
  };

  window.scoutSave = function (opts) {
    const items = window.scoutHarvest(opts);
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "urls.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return items.length;
  };

  console.log("%cscoutHarvest() · scoutSave() · scoutHarvest({min:800})",
              "font-weight:bold;color:#4ea1ff;font-size:13px");
})();
