#!/usr/bin/env python3
"""Offline testy pro build_location_db.py a score.py.

    python3 test_skill_scripts.py

Parser se testuje proti skutečnému references/lokace_database.md, ne proti
vymyšlené fixtuře — to je nejpřísnější dostupný test, protože ten soubor
má všechny nepravidelnosti, kvůli kterým parsery padají.

Wikidata dotazy jsou nahrazené. Živé API se tu netestuje.
"""

import csv
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

SKILL = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", ".claude", "skills", "locationsearch",
)
sys.path.insert(0, os.path.join(SKILL, "scripts"))
import build_location_db as db  # noqa: E402
import score as sc  # noqa: E402

REAL_DB = os.path.join(SKILL, "references", "lokace_database.md")


class TestParser(unittest.TestCase):
    """Proti skutečnému souboru se seznamem lokací."""

    @classmethod
    def setUpClass(cls):
        cls.items = db.parse_database(REAL_DB)
        cls.names = [i[2] for i in cls.items]
        cls.by_name = {i[2]: i for i in cls.items}

    def test_all_motifs_present(self):
        motifs = {i[0] for i in self.items}
        for expected in ("Podhradí", "Hrad ext", "Hrad int", "Mlýn", "Les",
                         "Potok", "Cesta/Krajina"):
            self.assertIn(expected, motifs)

    def test_reasonable_volume(self):
        # Skill slibuje longlist 80–120; seznam musí mít výrazně víc.
        self.assertGreater(len(self.items), 150)

    def test_dot_separated_line(self):
        for n in ("Loket", "Český Krumlov", "Štramberk", "Kutná Hora"):
            self.assertIn(n, self.names)

    def test_bullet_line_with_parenthetical(self):
        item = self.by_name["Hoslovický mlýn"]
        self.assertEqual(item[1], "CZ")
        self.assertTrue(item[3], "⭐ se má promítnout do top_pick")
        self.assertIn("Prácheňské muzeum", item[4])

    def test_parentheses_stripped_from_name(self):
        # Závorka by na Wikidatech shodila fulltext.
        for n in self.names:
            self.assertNotIn("(", n, f"závorka zůstala ve jméně: {n!r}")
            self.assertNotIn("⭐", n)

    def test_overit_marker_becomes_note_not_name(self):
        item = self.by_name["Mlýn Hartmanice"]
        self.assertIn("ověřit", item[4])
        self.assertNotIn("ověřit", item[2].lower())

    def test_bullet_with_dot_separators_is_split(self):
        # "Petřív mlýn · Kovářův mlýn · Klepáčův mlýn — ověřit konkrétně"
        for n in ("Petřív mlýn", "Kovářův mlýn", "Klepáčův mlýn"):
            self.assertIn(n, self.names)

    def test_multi_location_line_is_flagged(self):
        item = self.by_name["Mlýny v Kokořínském dole — Štampach, Močidla, Harasovský"]
        self.assertIn("rozepsat", item[4])

    def test_studio_line_excluded(self):
        self.assertFalse([n for n in self.names if "tudia" in n or "arrandov" in n])

    def test_no_empty_or_stub_names(self):
        for n in self.names:
            self.assertGreaterEqual(len(n), 2)
            self.assertEqual(n, n.strip())

    def test_countries_only_cz_sk(self):
        self.assertEqual({i[1] for i in self.items}, {"CZ", "SK"})


class TestGeometry(unittest.TestCase):
    def test_haversine_known_distance(self):
        # Praha–Brno vzdušnou čarou ~185 km.
        km = db.haversine_km(db.BASES["praha"], db.BASES["brno"])
        self.assertAlmostEqual(km, 185, delta=6)

    def test_zero_distance(self):
        self.assertAlmostEqual(db.haversine_km(db.BASES["praha"], db.BASES["praha"]), 0, places=6)

    def test_road_estimate_adds_factor(self):
        km, mins = db.road_estimate(db.BASES["brno"], db.BASES["praha"])
        self.assertGreater(km, 185)      # silnice je delší než vzdušná čára
        self.assertLess(km, 260)
        self.assertAlmostEqual(mins, km / db.AVG_KMH * 60, delta=1)

    def test_bbox_rejects_foreign(self):
        self.assertTrue(db.in_bbox(49.70, 16.89))    # Bouzov
        self.assertFalse(db.in_bbox(51.50, -0.12))   # Londýn
        self.assertFalse(db.in_bbox(40.71, -74.00))  # New York


class TestResolve(unittest.TestCase):
    """Rozlišení homonym — cizí entita se stejným jménem musí propadnout."""

    def _entity(self, lat, lon, label="X", cat="X cat"):
        return {
            "labels": {"cs": {"value": label}},
            "sitelinks": {},
            "claims": {
                "P625": [{"mainsnak": {"snaktype": "value",
                                       "datavalue": {"value": {"latitude": lat, "longitude": lon}}}}],
                "P373": [{"mainsnak": {"snaktype": "value", "datavalue": {"value": cat}}}],
            },
        }

    def test_picks_domestic_over_foreign(self):
        entities = {
            "Q1": self._entity(51.50, -0.12, "Loket (UK)"),   # mimo bbox
            "Q2": self._entity(50.19, 12.75, "Loket"),        # ČR
        }
        with mock.patch.object(db, "search_candidates", lambda *a, **k: ["Q1", "Q2"]), \
             mock.patch.object(db, "get_entity", lambda q: entities[q]), \
             mock.patch.object(db.time, "sleep", lambda *_: None):
            hit = db.resolve("Loket")
        self.assertEqual(hit[0], "Q2")
        self.assertEqual(hit[5], "high")

    def test_ambiguous_domestic_is_medium(self):
        entities = {"Q1": self._entity(50.1, 14.4), "Q2": self._entity(49.2, 16.6)}
        with mock.patch.object(db, "search_candidates", lambda *a, **k: ["Q1", "Q2"]), \
             mock.patch.object(db, "get_entity", lambda q: entities[q]), \
             mock.patch.object(db.time, "sleep", lambda *_: None):
            self.assertEqual(db.resolve("Cokoli")[5], "medium")

    def test_no_coordinates_means_no_hit(self):
        bare = {"labels": {}, "sitelinks": {}, "claims": {}}
        with mock.patch.object(db, "search_candidates", lambda *a, **k: ["Q1"]), \
             mock.patch.object(db, "get_entity", lambda q: bare), \
             mock.patch.object(db.time, "sleep", lambda *_: None):
            self.assertIsNone(db.resolve("Nic"))


class TestScoreFormula(unittest.TestCase):
    def test_reproduces_rubric_example_krivoklat(self):
        self.assertEqual(sc.evaluate(9.0, 8.0, 9.0, 9.5, 6.5), (8.4, "TOP"))

    def test_oblazy_totals_match_rubric(self):
        tot, tag = sc.evaluate(10, 4.5, 10, 2.5, 5.5)
        self.assertEqual(tot, 7.2)
        # Rubrika u tohohle příkladu psala TOP, ale její vlastní práh je 8.0
        # a Prak 4.5 splňuje WILDCARD. Scorer drží pravidla, ne příklad.
        self.assertEqual(tag, "WILDCARD")

    def test_weights_sum_to_ten(self):
        self.assertEqual(sum(sc.VAHY.values()), 10.0)

    def test_all_tens_is_ten(self):
        self.assertEqual(sc.evaluate(10, 10, 10, 10, 10), (10.0, "TOP"))


class TestTags(unittest.TestCase):
    def test_distance_alone_does_not_make_wildcard(self):
        # Krásný, praktický, ale daleko → BACKUP, ne WILDCARD:
        # vzdálenost se řeší přesunem základny.
        tot, tag = sc.evaluate(9.0, 7.5, 7.0, 1.5, 6.5)
        self.assertEqual(tag, "BACKUP")

    def test_low_practicality_makes_wildcard(self):
        self.assertEqual(sc.evaluate(9.5, 4.0, 9.0, 9.0, 8.0)[1], "WILDCARD")

    def test_low_risk_score_makes_wildcard(self):
        self.assertEqual(sc.evaluate(9.5, 8.0, 9.0, 9.0, 4.0)[1], "WILDCARD")

    def test_high_total_but_weak_visual_is_not_top(self):
        tot, tag = sc.evaluate(8.0, 9.0, 9.0, 9.0, 9.0)
        self.assertGreaterEqual(tot, 8.0)
        self.assertEqual(tag, "BACKUP")  # vis < 8.5

    def test_low_total_is_inspirace(self):
        self.assertEqual(sc.evaluate(6, 6, 6, 6, 6)[1], "INSPIRACE")

    def test_tags_are_mutually_exclusive(self):
        # Každá kombinace dostane právě jeden štítek a nikdy prázdno.
        seen = set()
        for vis in (5, 8.4, 8.5, 9):
            for prak in (4, 6, 9):
                for risk in (4, 6, 9):
                    for dost in (1, 5, 10):
                        tag = sc.evaluate(vis, prak, 7, dost, risk)[1]
                        self.assertIn(tag, ("TOP", "BACKUP", "WILDCARD", "INSPIRACE"))
                        seen.add(tag)
        self.assertEqual(seen, {"TOP", "BACKUP", "WILDCARD", "INSPIRACE"})


class TestDostFromMinutes(unittest.TestCase):
    def test_rubric_bands(self):
        self.assertEqual(sc.dost_from_minutes(20), 10.0)   # < 1 h
        self.assertEqual(sc.dost_from_minutes(60), 7.0)    # hranice 1 h
        self.assertEqual(sc.dost_from_minutes(120), 4.0)   # hranice 2 h
        self.assertEqual(sc.dost_from_minutes(240), 1.0)
        self.assertEqual(sc.dost_from_minutes(600), 1.0)   # strop

    def test_monotonically_decreasing(self):
        prev = 11
        for m in range(0, 400, 7):
            cur = sc.dost_from_minutes(m)
            self.assertLessEqual(cur, prev, f"Dost roste s časem u {m} min")
            prev = cur

    def test_always_in_range(self):
        for m in range(0, 700, 13):
            self.assertTrue(1.0 <= sc.dost_from_minutes(m) <= 10.0)


class TestBatch(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir)

    def _run(self, text):
        src = os.path.join(self.dir, "in.csv")
        with open(src, "w", encoding="utf-8") as fh:
            fh.write(text)
        args = mock.Mock(csv=src, out=None)
        sc.run_batch(args)
        with open(os.path.join(self.dir, "in_scored.csv"), encoding="utf-8") as fh:
            return list(csv.DictReader(fh))

    def test_batch_with_explicit_dost(self):
        rows = self._run("nazev,vis,prak,aut,dost,risk\nKřivoklát,9,8,9,9.5,6.5\n")
        self.assertEqual(rows[0]["total"], "8.4")
        self.assertEqual(rows[0]["stitek"], "TOP")

    def test_batch_derives_dost_from_minutes(self):
        rows = self._run("nazev,vis,prak,aut,minutes,risk\nBouzov,9,7.5,7,210,6.5\n")
        self.assertEqual(rows[0]["dost"], "1.5")
        self.assertEqual(rows[0]["total"], "7.1")
        self.assertEqual(rows[0]["stitek"], "BACKUP")

    def test_missing_dost_and_minutes_is_an_error(self):
        with self.assertRaises(SystemExit):
            self._run("nazev,vis,prak,aut,risk\nX,9,8,9,6\n")

    def test_non_numeric_is_an_error(self):
        with self.assertRaises(SystemExit):
            self._run("nazev,vis,prak,aut,dost,risk\nX,devět,8,9,9,6\n")


class TestDbLookup(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir)
        self.path = os.path.join(self.dir, "lokace_db.csv")
        with open(self.path, "w", encoding="utf-8") as fh:
            fh.write("nazev,km_praha_odhad,min_praha_odhad\nBouzov,238,210\nBezGPS,,\n")

    def test_lookup_is_case_insensitive_substring(self):
        mins, name = sc.minutes_from_db(self.path, "bouzov", "praha")
        self.assertEqual((mins, name), (210.0, "Bouzov"))

    def test_missing_name_exits(self):
        with self.assertRaises(SystemExit):
            sc.minutes_from_db(self.path, "Karlštejn", "praha")

    def test_location_without_gps_exits(self):
        with self.assertRaises(SystemExit):
            sc.minutes_from_db(self.path, "BezGPS", "praha")

    def test_unknown_base_column_exits(self):
        with self.assertRaises(SystemExit):
            sc.minutes_from_db(self.path, "Bouzov", "liptov")


if __name__ == "__main__":
    unittest.main(verbosity=2)
