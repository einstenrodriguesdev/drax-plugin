#!/usr/bin/env python3
"""Unit-test the deterministic SVG carousel sidecar."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "social_carousel.py"
BRAND = {
    "bg": [8, 8, 8],
    "fg": [237, 232, 223],
    "accent": [255, 61, 0],
    "dim": [100, 100, 100],
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class SocialCarouselTest(unittest.TestCase):
    def render(self, root: Path, out_name: str) -> dict[str, object]:
        out_dir = root / out_name
        input_path = root / f"{out_name}.json"
        input_path.write_text(
            json.dumps(
                {
                    "title": "Proof & planning <before> scale",
                    "description": "A deterministic publish cycle gives founders proof before distribution. Extra sentences stay stable.",
                    "tags": ["automation", "proof"],
                    "points": [
                        "Run the cycle in an isolated clone before publishing.",
                        "Keep sector evidence attached to every generated article.",
                        "Use local artifacts before any social channel receives the asset.",
                        "Ship proof notes instead of unsupported claims.",
                        "Make media assets deterministic so screenshots can be audited.",
                        "This sixth point should be clamped away.",
                    ],
                    "postClass": "post-1",
                    "slug": "proof-before-scale",
                    "ctaUrl": "/proof-before-scale",
                    "brand": BRAND,
                    "rsvgBin": shutil.which("rsvg-convert") or "",
                    "outDir": str(out_dir),
                },
                sort_keys=True,
            ),
            encoding="utf-8",
        )
        result = subprocess.run(
            [sys.executable, str(SCRIPT), str(input_path)],
            cwd=ROOT,
            encoding="utf-8",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def assert_svg_shape(self, target: Path, width: str, height: str) -> None:
        root = ET.parse(target).getroot()
        self.assertTrue(root.tag.endswith("svg"))
        self.assertEqual(root.attrib["width"], width)
        self.assertEqual(root.attrib["height"], height)
        self.assertEqual(root.attrib["viewBox"], f"0 0 {width} {height}")

    def test_svg_outputs_are_well_formed_deterministic_and_escaped(self) -> None:
        with tempfile.TemporaryDirectory(prefix="drax-social-carousel-") as temp:
            root = Path(temp)
            first = self.render(root, "out-a")
            second = self.render(root, "out-b")

            self.assertEqual(first["slides"], 7)
            self.assertGreaterEqual(first["slides"], 3)
            self.assertLessEqual(first["slides"], 7)

            first_svgs = [Path(entry) for entry in first["svgs"]]
            second_svgs = [Path(entry) for entry in second["svgs"]]
            self.assertEqual([path.name for path in first_svgs], [path.name for path in second_svgs])
            self.assertIn("carousel-01.svg", [path.name for path in first_svgs])
            self.assertIn("story.svg", [path.name for path in first_svgs])
            self.assertIn("highlight-cover.svg", [path.name for path in first_svgs])

            for svg in first_svgs:
                self.assertTrue(svg.exists(), f"{svg} missing")
                if svg.name == "story.svg":
                    self.assert_svg_shape(svg, "1080", "1920")
                else:
                    self.assert_svg_shape(svg, "1080", "1080")

            for left, right in zip(first_svgs, second_svgs):
                self.assertEqual(sha256(left), sha256(right), f"{left.name} is not byte-deterministic")

            hook = (root / "out-a" / "carousel-01.svg").read_text(encoding="utf-8")
            # The title wraps across tspans; assert escaping per fragment, not contiguously.
            self.assertIn("Proof &amp; planning", hook)
            self.assertIn("&lt;before&gt; scale", hook)
            self.assertNotIn("<before>", hook)

            if shutil.which("rsvg-convert"):
                pngs = [Path(entry) for entry in first["pngs"]]
                self.assertEqual(len(pngs), len(first_svgs))
                for png in pngs:
                    self.assertTrue(png.exists(), f"{png} missing")
                    self.assertTrue(png.read_bytes().startswith(b"\x89PNG"))
                self.assertTrue(first["rasterized"])
            else:
                self.assertEqual(first["pngs"], [])
                self.assertFalse(first["rasterized"])


if __name__ == "__main__":
    unittest.main()
