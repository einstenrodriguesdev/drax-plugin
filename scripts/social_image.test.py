#!/usr/bin/env python3
"""Smoke-test the deterministic social image sidecar."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("SKIP: Pillow is not installed; social image renderer test skipped.")
    raise SystemExit(0)


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "social_image.py"


def assert_png(path: Path, size: tuple[int, int]) -> None:
    raw = path.read_bytes()
    assert raw.startswith(b"\x89PNG"), f"{path} is not a PNG"
    with Image.open(path) as image:
        assert image.format == "PNG", f"{path} format is {image.format}"
        assert image.size == size, f"{path} size is {image.size}, want {size}"


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="drax-social-image-") as temp:
        root = Path(temp)
        out_dir = root / "out"
        input_path = root / "image-input.json"
        input_path.write_text(
            json.dumps(
                {
                    "title": "Proof before publishing: how a founder tests the Drax cycle",
                    "description": "A deterministic dry-run gives the founder evidence before local blog publishing is enabled.",
                    "tags": ["automation", "blog", "proof"],
                    "postClass": "post-1",
                    "slug": "proof-before-publishing",
                    "brand": {
                        "bg": [8, 8, 8],
                        "fg": [237, 232, 223],
                        "accent": [255, 61, 0],
                        "dim": [100, 100, 100],
                    },
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
        assert result.returncode == 0, result.stderr
        output = json.loads(result.stdout)
        vertical = Path(output["vertical"])
        square = Path(output["square"])
        assert_png(vertical, (1080, 1920))
        assert_png(square, (1080, 1080))
    print("PASS: social image renderer produced 1080x1920 and 1080x1080 PNGs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
