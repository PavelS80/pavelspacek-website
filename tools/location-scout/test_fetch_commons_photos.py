#!/usr/bin/env python3
"""Offline test fetch_commons_photos.py — API se nahradí fixturami.

    python3 test_fetch_commons_photos.py

Testuje parsování odpovědí, filtry, pojmenování souborů, photos.csv
a generování chrome_tier.md. NETESTUJE, že živé Wikimedia API vrací přesně
tenhle tvar — fixtury jsou napsané podle dokumentace MediaWiki API.
"""

import csv
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_commons_photos as f  # noqa: E402


ENTITY = {
    "entities": {
        "Q940492": {
            "labels": {"cs": {"language": "cs", "value": "Bouzov"}},
            "sitelinks": {"commonswiki": {"title": "Category:Bouzov Castle"}},
            "claims": {
                "P625": [
                    {
                        "mainsnak": {
                            "snaktype": "value",
                            "datavalue": {
                                "value": {"latitude": 49.70417, "longitude": 16.89111}
                            },
                        }
                    }
                ],
                "P373": [
                    {
                        "mainsnak": {
                            "snaktype": "value",
                            "datavalue": {"value": "Bouzov Castle"},
                        }
                    }
                ],
                "P18": [
                    {
                        "mainsnak": {
                            "snaktype": "value",
                            "datavalue": {"value": "Bouzov 04.jpg"},
                        }
                    }
                ],
                # somevalue snak nesmí spadnout
                "P17": [{"mainsnak": {"snaktype": "somevalue"}}],
            },
        }
    }
}

CATEGORY_PAGE = {
    "query": {
        "categorymembers": [
            {"ns": 6, "title": "File:Bouzov 04.jpg"},
            {"ns": 6, "title": "File:Bouzov nadvori.jpg"},
            {"ns": 6, "title": "File:Coat of arms of Bouzov.svg"},
            {"ns": 6, "title": "File:Bouzov plan.pdf"},
            {"ns": 6, "title": "File:Bouzov maly.jpg"},
            {"ns": 14, "title": "Category:Interior of Bouzov Castle"},
        ]
    }
}

SUBCATEGORY_PAGE = {
    "query": {
        "categorymembers": [{"ns": 6, "title": "File:Bouzov interier.jpg"}]
    }
}

IMAGEINFO = {
    "query": {
        "pages": {
            "1": {
                "title": "File:Bouzov 04.jpg",
                "imageinfo": [
                    {
                        "width": 6016,
                        "height": 4000,
                        "mime": "image/jpeg",
                        "url": "https://upload.wikimedia.org/x/Bouzov_04.jpg",
                        "thumburl": "https://upload.wikimedia.org/thumb/Bouzov_04.jpg",
                        "descriptionurl": "https://commons.wikimedia.org/wiki/File:Bouzov_04.jpg",
                        "extmetadata": {
                            "Artist": {"value": '<a href="/wiki/User:X">Jan &amp; Novák</a>'},
                            "LicenseShortName": {"value": "CC BY-SA 4.0"},
                            "DateTimeOriginal": {"value": "2019-07-14"},
                            "GPSLatitude": {"value": "49.7042"},
                            "GPSLongitude": {"value": "16.8911"},
                        },
                    }
                ],
            },
            "2": {
                "title": "File:Bouzov nadvori.jpg",
                "imageinfo": [
                    {
                        "width": 3712,
                        "height": 5577,
                        "mime": "image/jpeg",
                        "url": "https://upload.wikimedia.org/x/Bouzov_nadvori.jpg",
                        "thumburl": "https://upload.wikimedia.org/thumb/Bouzov_nadvori.jpg",
                        "descriptionurl": "https://commons.wikimedia.org/wiki/File:Bouzov_nadvori.jpg",
                        "extmetadata": {"LicenseShortName": {"value": "CC0"}},
                    }
                ],
            },
            "3": {
                "title": "File:Bouzov maly.jpg",
                "imageinfo": [
                    {
                        "width": 640,
                        "height": 480,
                        "mime": "image/jpeg",
                        "url": "https://upload.wikimedia.org/x/Bouzov_maly.jpg",
                        "descriptionurl": "https://commons.wikimedia.org/wiki/File:Bouzov_maly.jpg",
                        "extmetadata": {},
                    }
                ],
            },
            "4": {
                "title": "File:Bouzov interier.jpg",
                "imageinfo": [
                    {
                        "width": 4000,
                        "height": 3000,
                        "mime": "image/jpeg",
                        "url": "https://upload.wikimedia.org/x/Bouzov_interier.jpg",
                        "thumburl": "https://upload.wikimedia.org/thumb/Bouzov_interier.jpg",
                        "descriptionurl": "https://commons.wikimedia.org/wiki/File:Bouzov_interier.jpg",
                        "extmetadata": {},
                    }
                ],
            },
            "-1": {"title": "File:Chybi.jpg", "missing": ""},
        }
    }
}


def fake_api_get(url, params, retries=3):
    action = params.get("action")
    if action == "wbsearchentities":
        return {"search": [{"id": "Q940492", "label": "Bouzov", "description": "hrad"}]}
    if action == "wbgetentities":
        return ENTITY
    if params.get("list") == "categorymembers":
        if "Interior" in params["cmtitle"]:
            return SUBCATEGORY_PAGE
        return CATEGORY_PAGE
    if params.get("prop") == "imageinfo":
        wanted = set(params["titles"].split("|"))
        return {
            "query": {
                "pages": {
                    k: v
                    for k, v in IMAGEINFO["query"]["pages"].items()
                    if v["title"] in wanted
                }
            }
        }
    raise AssertionError(f"neočekávaný dotaz: {params}")


class TestHelpers(unittest.TestCase):
    def test_slugify_strips_diacritics(self):
        self.assertEqual(f.slugify("Hrad Bouzov"), "hrad_bouzov")
        self.assertEqual(f.slugify("Spišský hrad"), "spissky_hrad")
        self.assertEqual(f.slugify("Žďár—nad Sázavou"), "zdar_nad_sazavou")
        self.assertEqual(f.slugify("－－"), "lokace")

    def test_clean_html_unwraps_artist(self):
        self.assertEqual(
            f.clean_html('<a href="/wiki/User:X">Jan &amp; Novák</a>'), "Jan & Novák"
        )
        self.assertEqual(f.clean_html(""), "")

    def test_usable_filters(self):
        big = {"width": 4000, "mime": "image/jpeg"}
        self.assertTrue(f.usable("File:Bouzov.jpg", big, 1200))
        # vektor/dokument
        self.assertFalse(f.usable("File:Bouzov.svg", big, 1200))
        self.assertFalse(f.usable("File:Bouzov plan.pdf", big, 1200))
        # znak/mapa podle názvu
        self.assertFalse(f.usable("File:Coat of arms of Bouzov.jpg", big, 1200))
        self.assertFalse(f.usable("File:Mapa Bouzova.jpg", big, 1200))
        # málo pixelů
        self.assertFalse(f.usable("File:x.jpg", {"width": 800, "mime": "image/jpeg"}, 1200))
        # ne-obrázek
        self.assertFalse(f.usable("File:x.jpg", {"width": 4000, "mime": "video/webm"}, 1200))

    def test_claim_values_skips_somevalue(self):
        entity = ENTITY["entities"]["Q940492"]
        self.assertEqual(f.claim_values(entity, "P17"), [])
        self.assertEqual(f.claim_values(entity, "P373"), ["Bouzov Castle"])

    def test_entity_summary_dedupes_category(self):
        # P373 i commonswiki sitelink ukazují na stejnou kategorii
        place = f.entity_summary(ENTITY["entities"]["Q940492"], "Q940492")
        self.assertEqual(place["categories"], ["Bouzov Castle"])
        self.assertEqual((place["lat"], place["lon"]), (49.70417, 16.89111))
        self.assertEqual(place["lead_image"], "Bouzov 04.jpg")


class TestRun(unittest.TestCase):
    def setUp(self):
        self.out = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.out)

    def run_main(self, argv):
        downloaded = []

        def fake_download(url, dest):
            downloaded.append((url, dest))
            with open(dest, "wb") as fh:
                fh.write(b"jpegbytes")
            return True

        with mock.patch.object(f, "api_get", fake_api_get), mock.patch.object(
            f, "download", fake_download
        ), mock.patch.object(f.time, "sleep", lambda *_: None), mock.patch.object(
            sys, "argv", ["fetch_commons_photos.py"] + argv
        ):
            f.main()
        return downloaded

    def test_end_to_end_writes_csv_and_files(self):
        downloaded = self.run_main(["Hrad Bouzov", "--out", self.out])

        names = sorted(os.path.basename(d) for _, d in downloaded)
        # SVG, PDF, znak a 640px soubor vyfiltrované; interiér z podkategorie uvnitř
        self.assertEqual(
            names,
            [
                "hrad_bouzov_commons_01.jpg",
                "hrad_bouzov_commons_02.jpg",
                "hrad_bouzov_commons_03.jpg",
            ],
        )
        # thumburl má přednost před plným originálem
        self.assertTrue(all("/thumb/" in url for url, _ in downloaded))

        with open(os.path.join(self.out, "photos.csv"), encoding="utf-8") as fh:
            rows = list(csv.DictReader(fh))
        self.assertEqual(len(rows), 3)

        # Největší originál první (6016x4000 před 4000x3000 i 3712x5577)
        self.assertEqual(rows[0]["titul"], "Bouzov 04.jpg")
        self.assertEqual(rows[0]["px"], "6016x4000")
        self.assertEqual(rows[0]["autor"], "Jan & Novák")
        self.assertEqual(rows[0]["licence"], "CC BY-SA 4.0")
        # EXIF geotag → high
        self.assertEqual(rows[0]["confidence_mista"], "high")
        self.assertEqual(rows[0]["lat"], "49.7042")
        self.assertEqual(rows[0]["poznamka"], "")

        # bez geotagu → medium + GPS zděděné z Wikidat
        nogeo = [r for r in rows if r["titul"] == "Bouzov interier.jpg"][0]
        self.assertEqual(nogeo["confidence_mista"], "medium")
        self.assertEqual(nogeo["lat"], "49.70417")
        self.assertIn("Wikidat", nogeo["poznamka"])

    def test_csv_appends_without_duplicate_header(self):
        self.run_main(["Hrad Bouzov", "--out", self.out])
        self.run_main(["Hrad Bouzov", "--out", self.out])
        with open(os.path.join(self.out, "photos.csv"), encoding="utf-8") as fh:
            lines = [l for l in fh if l.strip()]
        self.assertEqual(sum(1 for l in lines if l.startswith("soubor,")), 1)
        self.assertEqual(len(lines), 7)  # 1 hlavička + 2x3 řádky

    def test_limit_and_depth(self):
        downloaded = self.run_main(["Hrad Bouzov", "--out", self.out, "--limit", "1"])
        self.assertEqual(len(downloaded), 1)

        out2 = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, out2)
        d2 = self.run_main(["Hrad Bouzov", "--out", out2, "--depth", "0"])
        # bez zanoření chybí interiér z podkategorie
        self.assertEqual(len(d2), 2)

    def test_dry_run_writes_nothing(self):
        downloaded = self.run_main(["Hrad Bouzov", "--out", self.out, "--dry-run"])
        self.assertEqual(downloaded, [])
        self.assertEqual(os.listdir(self.out), [])

    def test_chrome_tier_has_gps_links(self):
        self.run_main(["Hrad Bouzov", "--out", self.out])
        md = open(os.path.join(self.out, "chrome_tier.md"), encoding="utf-8").read()
        self.assertIn("x=16.89111&y=49.70417", md)  # Mapy.cz bere x=lon, y=lat
        self.assertIn("base=ophoto", md)
        self.assertIn("query=49.70417,16.89111", md)
        self.assertIn("Q940492", md)

    def test_missing_name_and_qid_exits(self):
        with mock.patch.object(sys, "argv", ["fetch_commons_photos.py"]):
            with self.assertRaises(SystemExit):
                f.main()


if __name__ == "__main__":
    unittest.main(verbosity=2)
