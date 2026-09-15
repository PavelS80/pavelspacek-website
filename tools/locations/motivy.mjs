/* ============================================================
   MOTIVY — mapování 15 master motivů na OpenStreetMap tagy
   ------------------------------------------------------------
   Každý motiv = seznam Overpass QL dotazů. Spouští se nad
   územím CZ + SK. Cíl: reálné lokace se souřadnicemi a
   ověřitelným zdrojem, ne seznam z hlavy.

   Tagy jsou startovní nastavení. Po prvním běhu zkontroluj
   počty, které skript vypíše, a preset doluď — OSM tagování
   není v CZ/SK všude konzistentní.
   ============================================================ */

export const MOTIVY = {
  hrad: {
    label: 'Hrad / zámek — exteriér',
    q: [
      'nwr["historic"="castle"]',
      'nwr["historic"="fort"]',
      'nwr["historic"="city_gate"]',
    ],
  },
  zricenina: {
    label: 'Zřícenina',
    q: [
      'nwr["historic"="castle"]["ruins"="yes"]',
      'nwr["historic"="ruins"]',
      'nwr["ruins"="castle"]',
    ],
  },
  mlyn: {
    label: 'Mlýn / hamr / vodní dílo',
    q: [
      'nwr["man_made"="watermill"]',
      'nwr["historic"="watermill"]',
      'nwr["man_made"="water_works"]["historic"]',
      'nwr["building"]["name"~"[Mm]lýn|[Mm]lyn|[Hh]amr"]',
    ],
  },
  podhradi: {
    label: 'Podhradí / historické městečko',
    q: [
      'nwr["historic"="citywalls"]',
      'nwr["place"~"^(town|village)$"]["heritage"]',
      'nwr["boundary"="protected_area"]["protect_class"="22"]',
    ],
  },
  vesnice: {
    label: 'Vesnice / lidová architektura',
    q: [
      'nwr["tourism"="museum"]["museum"="open_air"]',
      'nwr["place"="village"]["heritage"]',
      'nwr["building"="farm"]["heritage"]',
    ],
  },
  sakralni: {
    label: 'Sakrální — kostel, klášter, kaple, hřbitov',
    q: [
      'nwr["historic"="monastery"]',
      'nwr["amenity"="monastery"]',
      'nwr["building"="church"]["heritage"]',
      'nwr["historic"="wayside_shrine"]["heritage"]',
    ],
  },
  skaly: {
    label: 'Skály / skalní města',
    q: [
      'nwr["natural"="cliff"]["name"]',
      'nwr["natural"="rock"]["name"]',
      'nwr["natural"="arch"]["name"]',
    ],
  },
  les: {
    label: 'Les / chráněná krajina',
    q: [
      'nwr["boundary"="protected_area"]["protect_class"~"^(1|2|3|5)$"]["name"]',
      'nwr["leisure"="nature_reserve"]["name"]',
    ],
  },
  potok: {
    label: 'Potok / řeka / vodopád',
    q: [
      'nwr["waterway"="waterfall"]["name"]',
      'nwr["natural"="water"]["water"="lake"]["name"]',
      'nwr["waterway"="weir"]["name"]',
    ],
  },
  most: {
    label: 'Most / brod / viadukt',
    q: [
      'nwr["bridge"]["heritage"]',
      'nwr["historic"="bridge"]',
      'nwr["man_made"="bridge"]["name"]["railway:historic"]',
      'nwr["ford"="yes"]["name"]',
    ],
  },
  prumysl: {
    label: 'Průmysl / lom / brownfield',
    q: [
      'nwr["landuse"="quarry"]["name"]',
      'nwr["historic"="mine"]',
      'nwr["man_made"="works"]["heritage"]',
      'nwr["building"="industrial"]["heritage"]',
    ],
  },
  statek: {
    label: 'Statek / dvůr / sýpka',
    q: [
      'nwr["historic"="manor"]',
      'nwr["building"="barn"]["heritage"]',
      'nwr["historic"="farm"]',
    ],
  },
};

export const MOTIV_KEYS = Object.keys(MOTIVY);
