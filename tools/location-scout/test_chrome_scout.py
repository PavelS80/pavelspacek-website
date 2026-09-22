#!/usr/bin/env python3
"""Offline test chrome_scout.py — síť i Playwright nahrazeny.

    python3 test_chrome_scout.py

Testuje čistou logiku: výběr největší varianty ze srcset, dedupe podepsaných
CDN URL, filtry, pojmenování, photos.csv, načtení urls.json.

NETESTUJE živý Chrome ani skutečný DOM Instagramu/Facebooku — ten se mění
a ověří se až prvním během u tebe.
"""

import csv
import json
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chrome_scout as c  # noqa: E402


IG = "https://scontent-prg1-1.cdninstagram.com/v/t51/123_n.jpg"


class TestSrcset(unittest.TestCase):
    def test_picks_largest_w(self):
        srcset = f"{IG}?w=640 640w, {IG}?w=1080 1080w, {IG}?w=750 750w"
        self.assertEqual(c.best_from_srcset(srcset), f"{IG}?w=1080")

    def test_x_descriptors_take_last(self):
        self.assertEqual(c.best_from_srcset("a.jpg 1x, b.jpg 2x"), "b.jpg")

    def test_empty_falls_back_to_src(self):
        self.assertEqual(c.best_from_srcset("", "fallback.jpg"), "fallback.jpg")
        self.assertEqual(c.best_from_srcset(None, "fallback.jpg"), "fallback.jpg")
        self.assertEqual(c.best_from_srcset("   ", "fallback.jpg"), "fallback.jpg")

    def test_malformed_descriptor_does_not_crash(self):
        self.assertEqual(c.best_from_srcset("a.jpg xxw, b.jpg 900w"), "b.jpg")


class TestFilters(unittest.TestCase):
    def test_source_from_url(self):
        self.assertEqual(c.source_from_url(IG), "instagram")
        self.assertEqual(c.source_from_url("https://scontent.xx.fbcdn.net/v/x.jpg"), "facebook")
        self.assertEqual(c.source_from_url("https://www.rajce.idnes.cz/a/b.jpg"), "rajce")
        self.assertEqual(c.source_from_url("https://lh3.googleusercontent.com/x"), "gmaps")
        self.assertEqual(c.source_from_url("https://example.org/x.jpg"), "web")

    def test_dedupe_ignores_signed_query(self):
        # Táž fotka, jiný podpis a expirace → jeden klíč.
        a = f"{IG}?_nc_ht=x&oh=AAA&oe=111"
        b = f"{IG}?_nc_ht=y&oh=BBB&oe=222"
        self.assertEqual(c.dedupe_key(a), c.dedupe_key(b))
        self.assertNotEqual(c.dedupe_key(a), c.dedupe_key(IG.replace("123", "456")))

    def test_should_keep(self):
        ok = {"url": IG, "width": 1080, "height": 1350}
        self.assertTrue(c.should_keep(ok, 600))
        self.assertFalse(c.should_keep({"url": IG, "width": 150, "height": 150}, 600))
        self.assertFalse(c.should_keep({"url": "data:image/png;base64,xx", "width": 9}, 600))
        # profilovka a emoji ven, i když jsou velké
        self.assertFalse(c.should_keep(
            {"url": "https://x.fbcdn.net/profile_pic/a.jpg", "width": 1200}, 600))
        self.assertFalse(c.should_keep(
            {"url": "https://static.xx.fbcdn.net/emoji/1.png", "width": 1200}, 600))
        # chybějící rozměry neprojdou
        self.assertFalse(c.should_keep({"url": IG}, 600))

    def test_dest_name_extension(self):
        self.assertEqual(c.dest_name("bouzov", "instagram", 3, IG),
                         "bouzov_instagram_03.jpg")
        self.assertEqual(c.dest_name("bouzov", "facebook", 12, "https://x/a.webp?y=1"),
                         "bouzov_facebook_12.webp")
        # URL bez přípony → .jpg
        self.assertEqual(c.dest_name("bouzov", "gmaps", 1, "https://lh3.googleusercontent.com/AF"),
                         "bouzov_gmaps_01.jpg")

    def test_row_marks_social_as_permission_needed(self):
        row = c.make_row({"url": IG, "width": 1080, "height": 1350, "alt": "hrad"},
                         "x.jpg", "high")
        self.assertEqual(row["licence"], "nutné svolení autora")
        self.assertEqual(row["zdroj"], "instagram")
        self.assertEqual(sorted(row.keys()), sorted(c.CSV_FIELDS))


class TestLoadUrls(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir)

    def write(self, name, content):
        path = os.path.join(self.dir, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        return path

    def test_json_objects_from_console_snippet(self):
        path = self.write("urls.json", json.dumps(
            [{"url": IG, "width": 1080, "height": 1350, "alt": "a", "page_url": "https://ig/p/1"}]))
        items = c.load_url_items(path)
        self.assertEqual(items[0]["width"], 1080)

    def test_json_plain_strings(self):
        path = self.write("urls.json", json.dumps([IG, IG + "?b=2"]))
        self.assertEqual([i["url"] for i in c.load_url_items(path)], [IG, IG + "?b=2"])

    def test_txt_ignores_comments(self):
        path = self.write("urls.txt", f"# poznámka\n{IG}\n\nnesmysl\n")
        self.assertEqual([i["url"] for i in c.load_url_items(path)], [IG])

    def test_empty_file(self):
        self.assertEqual(c.load_url_items(self.write("e.json", "  ")), [])


class TestHarvest(unittest.TestCase):
    def setUp(self):
        self.out = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.out)

    def harvest(self, items, seen=None, confidence="medium"):
        calls = []

        def fake_download(url, dest, referer=""):
            calls.append((url, dest, referer))
            with open(dest, "wb") as fh:
                fh.write(b"x" * 20000)
            return True

        with mock.patch.object(c, "download", fake_download), \
             mock.patch.object(c.time, "sleep", lambda *_: None):
            n = c.harvest_items(items, self.out, "bouzov", confidence, 600,
                                seen if seen is not None else set())
        return n, calls

    def test_dedupes_and_numbers_sequentially(self):
        items = [
            {"url": f"{IG}?oh=A", "width": 1080, "height": 1350, "page_url": "https://ig/p/1"},
            {"url": f"{IG}?oh=B", "width": 1080, "height": 1350, "page_url": "https://ig/p/1"},
            {"url": IG.replace("123", "456"), "width": 1080, "height": 1080,
             "page_url": "https://ig/p/2"},
            {"url": "https://static.xx.fbcdn.net/emoji/1.png", "width": 900, "height": 900},
        ]
        n, calls = self.harvest(items)
        self.assertEqual(n, 2)
        self.assertEqual([os.path.basename(d) for _, d, _ in calls],
                         ["bouzov_instagram_01.jpg", "bouzov_instagram_02.jpg"])
        # Referer se posílá, jinak CDN vrací 403
        self.assertEqual(calls[0][2], "https://ig/p/1")

    def test_second_run_continues_numbering(self):
        one = [{"url": IG, "width": 1080, "height": 1350}]
        two = [{"url": IG.replace("123", "999"), "width": 1080, "height": 1350}]
        self.harvest(one)
        _, calls = self.harvest(two)
        self.assertEqual(os.path.basename(calls[0][1]), "bouzov_instagram_02.jpg")

        with open(os.path.join(self.out, "photos.csv"), encoding="utf-8") as fh:
            lines = [l for l in fh if l.strip()]
        self.assertEqual(sum(1 for l in lines if l.startswith("soubor,")), 1)
        self.assertEqual(len(lines), 3)

    def test_confidence_written(self):
        self.harvest([{"url": IG, "width": 1080, "height": 1350}], confidence="high")
        with open(os.path.join(self.out, "photos.csv"), encoding="utf-8") as fh:
            row = next(csv.DictReader(fh))
        self.assertEqual(row["confidence_mista"], "high")
        self.assertEqual(row["px"], "1080x1350")

    def test_shared_seen_blocks_repeat_across_pages(self):
        seen = set()
        item = [{"url": IG, "width": 1080, "height": 1350}]
        self.assertEqual(self.harvest(item, seen)[0], 1)
        self.assertEqual(self.harvest(item, seen)[0], 0)

    def test_tiny_response_is_rejected(self):
        # Placeholder/spacer: server vrátí pár bajtů, soubor nechceme.
        def tiny(url, dest, referer=""):
            return False

        with mock.patch.object(c, "download", tiny), \
             mock.patch.object(c.time, "sleep", lambda *_: None):
            n = c.harvest_items([{"url": IG, "width": 1080, "height": 1350}],
                                self.out, "bouzov", "medium", 600, set())
        self.assertEqual(n, 0)
        self.assertFalse(os.path.exists(os.path.join(self.out, "photos.csv")))


class TestProfilePath(unittest.TestCase):
    def test_macos_path(self):
        with mock.patch.object(sys, "platform", "darwin"):
            self.assertTrue(c.chrome_user_data_dir().endswith(
                "Library/Application Support/Google/Chrome"))

    def test_linux_path(self):
        with mock.patch.object(sys, "platform", "linux"):
            self.assertTrue(c.chrome_user_data_dir().endswith(".config/google-chrome"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
